import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, SellerProfile } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { marketplaceService } from '../services/marketplaceService';

export interface AuthContextType {
  user: User | null;
  sellerProfile: SellerProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  isAdminAuthenticated: boolean;
  needsCityOnboarding: boolean;
  sendOtp: (phone: string) => Promise<{ success: boolean; isNewUser: boolean; error?: string }>;
  verifyOtp: (phone: string, token: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  resendOtp: (phone: string) => Promise<boolean>;
  completeCityOnboarding: (city: string) => Promise<void>;
  adminLogin: (email: string, secretKey: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_USER = 'selluy_auth_user_v2';
const STORAGE_ADMIN = 'selluy_admin_session_v2';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_USER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_ADMIN) === 'true';
  });

  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null);
  const [needsCityOnboarding, setNeedsCityOnboarding] = useState<boolean>(false);
  const [activeOtpHash, setActiveOtpHash] = useState<string>('');

  // Sync seller profile whenever user changes
  useEffect(() => {
    if (user) {
      const profile = marketplaceService.getSellerByUserId(user.id);
      if (profile) setSellerProfile(profile);

      // Check if user has no city set
      if (!user.city || user.city === 'Select City') {
        setNeedsCityOnboarding(true);
      } else {
        setNeedsCityOnboarding(false);
      }
    } else {
      setSellerProfile(null);
      setNeedsCityOnboarding(false);
    }
  }, [user]);

  // Request 6-digit OTP for Indian Mobile (+91) via Fast2SMS
  const sendOtp = async (
    phone: string
  ): Promise<{ success: boolean; isNewUser: boolean; error?: string }> => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      return { success: false, isNewUser: false, error: 'Please enter a valid 10-digit Indian mobile number.' };
    }

    try {
      let isNewUser = true;

      // Check if user exists in Supabase
      if (isSupabaseConfigured()) {
        try {
          const { data } = await supabase
            .from('users')
            .select('id, phone')
            .eq('phone', `+91${cleanPhone}`)
            .maybeSingle();

          if (data) {
            isNewUser = false;
          }
        } catch (e) {
          console.warn('User lookup notice:', e);
        }
      }

      // 1. Dispatch OTP via Fast2SMS serverless endpoint
      try {
        const apiRes = await fetch('/api/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: cleanPhone }),
        });

        const apiData = await apiRes.json().catch(() => ({}));

        if (apiRes.ok && apiData.success) {
          if (apiData.hash) {
            setActiveOtpHash(apiData.hash);
            try {
              sessionStorage.setItem(`selluy_otp_hash_${cleanPhone}`, apiData.hash);
            } catch (e) {
              // Ignore session storage error
            }
          }
          return { success: true, isNewUser };
        } else {
          // Gateway error returned from Fast2SMS or validation
          const errorMsg =
            apiData.error ||
            apiData.warning ||
            apiData.message ||
            'Unable to dispatch SMS. Please check mobile number or try again.';
          return { success: false, isNewUser: false, error: errorMsg };
        }
      } catch (apiErr: any) {
        console.warn('Network error dispatching OTP:', apiErr);
        return {
          success: false,
          isNewUser: false,
          error: 'Network connection error. Unable to contact SMS gateway.',
        };
      }
    } catch (err: any) {
      return { success: false, isNewUser: false, error: err.message || 'Failed to send OTP. Please try again.' };
    }
  };

  // Verify 6-digit OTP
  const verifyOtp = async (
    phone: string,
    token: string
  ): Promise<{ success: boolean; user?: User; error?: string }> => {
    const cleanPhone = phone.replace(/\D/g, '');
    const cleanToken = token.trim();

    if (cleanToken.length !== 6 || !/^\d{6}$/.test(cleanToken)) {
      return { success: false, error: 'Please enter a valid 6-digit verification code.' };
    }

    try {
      const storedHash =
        activeOtpHash ||
        (() => {
          try {
            return sessionStorage.getItem(`selluy_otp_hash_${cleanPhone}`) || '';
          } catch {
            return '';
          }
        })();

      // 1. Verify via Fast2SMS /api/verify-otp serverless endpoint
      let isVerified = false;
      try {
        const verifyRes = await fetch('/api/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: cleanPhone, token: cleanToken, hash: storedHash }),
        });

        if (verifyRes.ok) {
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            isVerified = true;
          }
        } else {
          const errData = await verifyRes.json().catch(() => ({}));
          if (errData.error && storedHash) {
            return { success: false, error: errData.error };
          }
        }
      } catch (netErr) {
        console.info('Serverless verify fallback active:', netErr);
      }

      // 2. Supabase SMS verification fallback if configured
      if (!isVerified && isSupabaseConfigured()) {
        try {
          const { error: supaErr } = await supabase.auth.verifyOtp({
            phone: `+91${cleanPhone}`,
            token: cleanToken,
            type: 'sms',
          });
          if (!supaErr) isVerified = true;
        } catch (e) {
          console.warn('Supabase verifyOtp notice:', e);
        }
      }

      if (!isVerified) {
        return { success: false, error: 'Incorrect OTP code. Please check your SMS and try again.' };
      }

      let verifiedUserId = `usr_${cleanPhone}`;
      let existingUser: User | null = null;

      // Check if real user exists in Supabase
      if (isSupabaseConfigured()) {
        try {
          const { data } = await supabase
            .from('users')
            .select('*')
            .eq('phone', `+91${cleanPhone}`)
            .maybeSingle();

          if (data) {
            existingUser = data as User;
          }
        } catch (e) {
          console.warn('Supabase query user:', e);
        }
      }

      let activeUser: User;
      let isNew = false;

      if (existingUser) {
        activeUser = existingUser;
      } else {
        isNew = true;
        activeUser = {
          id: verifiedUserId,
          name: `User ${cleanPhone.slice(-4)}`,
          phone: `+91${cleanPhone}`,
          role: 'customer',
          city: '', // Prompts city onboarding
          avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80`,
          created_at: new Date().toISOString(),
        };

        // Save new user in database
        if (isSupabaseConfigured()) {
          try {
            await supabase.from('users').upsert([activeUser]);
          } catch (e) {
            console.warn('Supabase insert user:', e);
          }
        }
      }

      setUser(activeUser);
      localStorage.setItem(STORAGE_USER, JSON.stringify(activeUser));

      if (isNew || !activeUser.city) {
        setNeedsCityOnboarding(true);
      }

      return { success: true, user: activeUser };
    } catch (err: any) {
      return { success: false, error: err.message || 'OTP verification failed. Please try again.' };
    }
  };

  const resendOtp = async (phone: string): Promise<boolean> => {
    const res = await sendOtp(phone);
    return res.success;
  };

  // Complete city onboarding for newly registered or city-less users
  const completeCityOnboarding = async (city: string) => {
    if (!user) return;
    const updatedUser: User = { ...user, city };
    setUser(updatedUser);
    setNeedsCityOnboarding(false);
    localStorage.setItem(STORAGE_USER, JSON.stringify(updatedUser));

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('users').update({ city }).eq('id', user.id);
      } catch (err) {
        console.warn('Failed to update user city in DB:', err);
      }
    }
  };

  // Dedicated secure Admin login
  const adminLogin = async (email: string, secretKey: string): Promise<boolean> => {
    const validEmails = ['admin@selluy.in', 'rohit@selluy.in'];
    const validKey = 'selluy@admin2026';

    const normalizedEmail = email.trim().toLowerCase();
    if ((validEmails.includes(normalizedEmail) || normalizedEmail.includes('admin')) && secretKey === validKey) {
      const adminUser: User = {
        id: 'usr_admin_master',
        name: 'Selluy Super Admin',
        email: normalizedEmail,
        role: 'admin',
        city: 'Hyderabad',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
        created_at: new Date().toISOString(),
      };

      setUser(adminUser);
      setIsAdminAuthenticated(true);
      localStorage.setItem(STORAGE_USER, JSON.stringify(adminUser));
      localStorage.setItem(STORAGE_ADMIN, 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setSellerProfile(null);
    setIsAdminAuthenticated(false);
    setNeedsCityOnboarding(false);
    localStorage.removeItem(STORAGE_USER);
    localStorage.removeItem(STORAGE_ADMIN);
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates, updated_at: new Date().toISOString() };
    setUser(updated);
    localStorage.setItem(STORAGE_USER, JSON.stringify(updated));

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('users').update(updates).eq('id', user.id);
      } catch (err) {
        console.warn('Update user profile notice:', err);
      }
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase.from('users').select('*').eq('id', user.id).maybeSingle();
        if (data) {
          setUser(data as User);
          localStorage.setItem(STORAGE_USER, JSON.stringify(data));
        }
      } catch (e) {
        console.warn('Refresh profile error:', e);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        sellerProfile,
        role: user?.role || 'customer',
        isAuthenticated: !!user,
        isAdminAuthenticated,
        needsCityOnboarding,
        sendOtp,
        verifyOtp,
        resendOtp,
        completeCityOnboarding,
        adminLogin,
        logout,
        updateUser,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export default AuthContext;
