import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, SellerProfile } from '../types';
import { INITIAL_SELLERS } from '../data/mockData';

export interface AuthContextType {
  user: User | null;
  sellerProfile: SellerProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (email: string, role?: UserRole) => Promise<void>;
  signup: (name: string, email: string, role?: UserRole) => Promise<void>;
  logout: () => void;
  switchDemoRole: (newRole: UserRole) => void;
  registerSellerStore: (details: Partial<SellerProfile>) => Promise<SellerProfile>;
  updateSellerProfile: (details: Partial<SellerProfile>) => void;
}

const DEFAULT_DEMO_USERS: Record<UserRole, { user: User; seller?: SellerProfile }> = {
  buyer: {
    user: {
      id: 'usr-buyer-demo',
      name: 'Aarav Patel',
      email: 'aarav@example.com',
      role: 'buyer',
      city: 'Hyderabad',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      created_at: '2024-01-10T00:00:00Z',
    },
  },
  seller: {
    user: {
      id: 'user-seller-1',
      name: 'Rohit & Meera (Local Thread)',
      email: 'team@localthread.in',
      role: 'seller',
      city: 'Hyderabad',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      created_at: '2024-01-15T10:00:00Z',
    },
    seller: INITIAL_SELLERS[0],
  },
  admin: {
    user: {
      id: 'usr-admin-demo',
      name: 'Selluy Moderator',
      email: 'admin@selluy.in',
      role: 'admin',
      city: 'Hyderabad',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
      created_at: '2024-01-01T00:00:00Z',
    },
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    return (localStorage.getItem('selluy_active_role') as UserRole) || 'buyer';
  });

  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('selluy_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return DEFAULT_DEMO_USERS['buyer'].user;
  });

  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(() => {
    const saved = localStorage.getItem('selluy_seller_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return null;
  });

  // Keep state synchronized with role
  const switchDemoRole = (newRole: UserRole) => {
    setCurrentRole(newRole);
    localStorage.setItem('selluy_active_role', newRole);
    const demo = DEFAULT_DEMO_USERS[newRole];
    setUser(demo.user);
    localStorage.setItem('selluy_user', JSON.stringify(demo.user));
    if (newRole === 'seller') {
      const profile = demo.seller || INITIAL_SELLERS[0];
      setSellerProfile(profile);
      localStorage.setItem('selluy_seller_profile', JSON.stringify(profile));
    }
  };

  const login = async (email: string, role: UserRole = 'buyer') => {
    const demo = DEFAULT_DEMO_USERS[role];
    const newUser: User = {
      ...demo.user,
      email,
      name: email.split('@')[0],
      role,
    };
    setUser(newUser);
    setCurrentRole(role);
    localStorage.setItem('selluy_user', JSON.stringify(newUser));
    localStorage.setItem('selluy_active_role', role);

    if (role === 'seller') {
      setSellerProfile(INITIAL_SELLERS[0]);
      localStorage.setItem('selluy_seller_profile', JSON.stringify(INITIAL_SELLERS[0]));
    }
  };

  const signup = async (name: string, email: string, role: UserRole = 'buyer') => {
    const newUser: User = {
      id: 'usr_' + Date.now(),
      name,
      email,
      role,
      city: 'Hyderabad',
      created_at: new Date().toISOString(),
    };
    setUser(newUser);
    setCurrentRole(role);
    localStorage.setItem('selluy_user', JSON.stringify(newUser));
    localStorage.setItem('selluy_active_role', role);
  };

  const logout = () => {
    setUser(null);
    setSellerProfile(null);
    localStorage.removeItem('selluy_user');
    localStorage.removeItem('selluy_seller_profile');
    localStorage.removeItem('selluy_active_role');
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
      verification_status: 'pending', // Starts pending admin review
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
    return newProfile;
  };

  const updateSellerProfile = (details: Partial<SellerProfile>) => {
    if (!sellerProfile) return;
    const updated = { ...sellerProfile, ...details };
    setSellerProfile(updated);
    localStorage.setItem('selluy_seller_profile', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        sellerProfile,
        role: currentRole,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        switchDemoRole,
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
