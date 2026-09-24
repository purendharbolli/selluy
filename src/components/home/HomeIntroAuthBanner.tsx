import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ShoppingBag,
  Store,
  ArrowRight,
  CheckCircle2,
  Heart,
  Package,
  MapPin,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { AuthModal } from '../auth/AuthModal';

export const HomeIntroAuthBanner: React.FC = () => {
  const { user, isAuthenticated, login, signup, role } = useAuth();
  const { selectedCity } = useLocation();

  const [activeTab, setActiveTab] = useState<'buyer' | 'seller'>('buyer');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleQuickJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSubmitting(true);
    try {
      await signup(name || email.split('@')[0], email, activeTab, selectedCity);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If already logged in, show personalized welcome back card
  if (isAuthenticated && user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2 mb-6">
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-sand-200/90 shadow-soft-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
              alt={user.name}
              className="w-12 h-12 rounded-2xl object-cover border border-sand-200"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold text-brand-600 tracking-wider">Welcome back</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-sand-100 text-stone-700 font-bold capitalize">
                  {user.role}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-stone-950 font-display">
                Hello, {user.name}!
              </h3>
              <p className="text-xs text-stone-500 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-brand-600" />
                Browsing indie creators in {selectedCity}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {role === 'seller' ? (
              <Link
                to="/seller/dashboard"
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
              >
                <Store className="w-4 h-4" />
                Go to Seller Studio
              </Link>
            ) : (
              <Link
                to="/wishlist"
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-sand-100 hover:bg-sand-200 text-stone-800 font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Heart className="w-4 h-4 text-rose-500" />
                Saved Wishlist
              </Link>
            )}

            <Link
              to="/explore"
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
            >
              Browse Feed <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Guest visitor: Show Intro & Quick Sign In / Sign Up Card
  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 mb-2">
        <div className="bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 text-white rounded-4xl p-6 sm:p-10 border border-stone-800 shadow-xl relative overflow-hidden">
          {/* Background decorative glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Intro message */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                A New Way to Shop Independent & Local
              </div>

              <h2 className="text-2xl sm:text-4xl font-black font-display tracking-tight text-white leading-tight">
                Buy directly from Indian creators. <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-amber-300">
                  No messy DMs. Real verified trust.
                </span>
              </h2>

              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-xl">
                Selluy unites passionate independent clothing studios, handcrafted jewelry makers, ceramic artisans, and custom gift artists in your city. Create a free account to unlock direct ordering and saved wishlists.
              </p>

              <div className="flex items-center gap-6 pt-2 text-xs text-stone-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Verified indie studios
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  City-first discovery
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Direct pricing
                </span>
              </div>
            </div>

            {/* Right: Quick Join / Sign In Box */}
            <div className="lg:col-span-5 bg-white text-stone-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-sand-200">
              <div className="flex items-center justify-between pb-3 border-b border-sand-100">
                <div>
                  <h3 className="font-extrabold text-sm text-stone-950">
                    Get Started in 10 Seconds
                  </h3>
                  <p className="text-[11px] text-stone-500">Free forever • Instant access</p>
                </div>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-xs font-bold text-brand-600 hover:underline"
                >
                  Sign In
                </button>
              </div>

              {/* Tab Switcher: Shopper vs Creator */}
              <div className="flex rounded-2xl bg-sand-100 p-1 my-3.5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab('buyer')}
                  className={`flex-1 py-1.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
                    activeTab === 'buyer' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-brand-600" />
                  Shopper
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('seller')}
                  className={`flex-1 py-1.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
                    activeTab === 'seller' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  <Store className="w-3.5 h-3.5 text-amber-600" />
                  Creator / Seller
                </button>
              </div>

              <form onSubmit={handleQuickJoin} className="space-y-2.5 text-xs">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <input
                  type="email"
                  required
                  placeholder="Your Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-full bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? 'Creating...' : activeTab === 'buyer' ? 'Join as Shopper' : 'Open Creator Storefront'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              <div className="pt-3 mt-3 border-t border-sand-100 flex items-center justify-between text-[11px] text-stone-500">
                <span>Already have an account?</span>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-stone-900 font-bold hover:text-brand-600 underline"
                >
                  Log In Direct
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
};
