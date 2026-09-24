import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, SellerProfile } from '../types';
import { INITIAL_SELLERS } from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface AuthContextType {
  user: User | null;
  sellerProfile: SellerProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  isAdminAuthenticated: boolean;
  login: (email: string, role?: UserRole) => Promise<void>;
  signup: (name: string, email: string, role?: UserRole, city?: string) => Promise<void>;
  adminLogin: (email: string, secretKey: string) => Promise<boolean>;
  logout: () => void;
  registerSellerStore: (details: Partial<SellerProfile>) => Promise<SellerProfile>;
  updateSellerProfile: (details: Partial<SellerProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    return (localStorage.getItem('selluy_active_role') as UserRole) || 'buyer';
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('selluy_admin_session') === 'true';
  });

  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('selluy_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return null; // Start as guest / not logged in
  });

  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(() => {
    const saved = localStorage.getItem('selluy_seller_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return null;
  });

  const login = async (email: string, role: UserRole = 'buyer') => {
    const newUser: User = {
      id: 'usr_' + Date.now(),
      name: email.split('@')[0],
      email,
      role,
      city: 'Hyderabad',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      created_at: new Date().toISOString(),
    };

    setUser(newUser);
    setCurrentRole(role);
    localStorage.setItem('selluy_user', JSON.stringify(newUser));
    localStorage.setItem('selluy_active_role', role);

    if (role === 'seller') {
      const profile = INITIAL_SELLERS[0];
      setSellerProfile(profile);
      localStorage.setItem('selluy_seller_profile', JSON.stringify(profile));
    }
  };

  const signup = async (name: string, email: string, role: UserRole = 'buyer', city: string = 'Hyderabad') => {
    const newUser: User = {
      id: 'usr_' + Date.now(),
      name,
      email,
      role,
      city,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      created_at: new Date().toISOString(),
    };

    setUser(newUser);
    setCurrentRole(role);
    localStorage.setItem('selluy_user', JSON.stringify(newUser));
    localStorage.setItem('selluy_active_role', role);

    // Save to Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('users').insert([newUser]);
      } catch (err) {
        console.warn('Supabase user insert notice:', err);
      }
    }
  };

  // Dedicated secure Admin login
  const adminLogin = async (email: string, secretKey: string): Promise<boolean> => {
    // Official admin passcode (can be customized)
    const validEmails = ['admin@selluy.in', 'rohit@selluy.in'];
    const validKey = 'selluy@admin2026';

    if ((validEmails.includes(email.trim().toLowerCase()) || email.trim().toLowerCase().includes('admin')) && secretKey === validKey) {
      const adminUser: User = {
        id: 'usr_admin_master',
        name: 'Selluy Super Admin',
        email: email.trim(),
        role: 'admin',
        city: 'Hyderabad',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
        created_at: new Date().toISOString(),
      };

      setUser(adminUser);
      setCurrentRole('admin');
      setIsAdminAuthenticated(true);
      localStorage.setItem('selluy_user', JSON.stringify(adminUser));
      localStorage.setItem('selluy_active_role', 'admin');
      localStorage.setItem('selluy_admin_session', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setSellerProfile(null);
    setCurrentRole('buyer');
    setIsAdminAuthenticated(false);
    localStorage.removeItem('selluy_user');
    localStorage.removeItem('selluy_seller_profile');
    localStorage.removeItem('selluy_active_role');
    localStorage.removeItem('selluy_admin_session');
  };

  const registerSellerStore = async (details: Partial<SellerProfile>): Promise<SellerProfile> => {
    const newProfile: SellerProfile = {
      id: 'seller_' + Date.now(),
      user_id: user?.id || 'usr_' + Date.now(),
      store_name: details.store_name || 'My Indie Store',
      description: details.description || '',
      logo: details.logo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      city: details.city || user?.city || 'Hyderabad',
      state: details.state || 'Telangana',
      social_link: details.social_link || '',
      category_focus: details.category_focus || 'Fashion & Apparel',
      verification_status: 'pending',
      rating: 5.0,
      total_reviews: 0,
      completed_orders: 0,
      created_at: new Date().toISOString(),
    };

    setSellerProfile(newProfile);
    setCurrentRole('seller');
    if (user) {
      const updatedUser = { ...user, role: 'seller' as UserRole };
      setUser(updatedUser);
      localStorage.setItem('selluy_user', JSON.stringify(updatedUser));
    }
    localStorage.setItem('selluy_seller_profile', JSON.stringify(newProfile));
    localStorage.setItem('selluy_active_role', 'seller');

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('seller_profiles').insert([newProfile]);
      } catch (err) {
        console.warn('Supabase seller insert notice:', err);
      }
    }

    return newProfile;
  };

  const updateSellerProfile = (details: Partial<SellerProfile>) => {
    if (!sellerProfile) return;
    const updated = { ...sellerProfile, ...details };
    setSellerProfile(updated);
    localStorage.setItem('selluy_seller_profile', JSON.stringify(updated));

    if (isSupabaseConfigured()) {
      supabase.from('seller_profiles').update(details).eq('id', sellerProfile.id).then(() => {});
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        sellerProfile,
        role: currentRole,
        isAuthenticated: !!user,
        isAdminAuthenticated,
        login,
        signup,
        adminLogin,
        logout,
        registerSellerStore,
        updateSellerProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
