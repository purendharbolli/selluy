import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ShoppingBag,
  MapPin,
  ChevronDown,
  Menu,
  X,
  Store,
  User as UserIcon,
  Heart,
  ShieldCheck,
  Compass,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { SelluyLogo } from './SelluyLogo';
import { LocationModal } from './LocationModal';
import { AuthModal } from '../auth/AuthModal';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { selectedCity } = useLocation();
  const { cartCount, wishlist } = useCart();
  const { user, isAuthenticated, role, logout } = useAuth();

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            {/* 1. Official Selluy Logo */}
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center">
                <SelluyLogo variant="full" size="md" showTagline={false} />
              </Link>

              {/* City selector button */}
              <button
                onClick={() => setIsLocationModalOpen(true)}
                className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-sand-100 hover:bg-sand-200/80 border border-sand-200 text-stone-800 text-xs font-semibold transition"
                title="Change discovery city"
              >
                <MapPin className="w-3.5 h-3.5 text-brand-600" />
                <span>{selectedCity}</span>
                <ChevronDown className="w-3 h-3 text-stone-400" />
              </button>
            </div>

            {/* 2. Global Search Bar */}
            <div className="hidden lg:flex flex-1 max-w-md mx-4">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search products, indie creators, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-sand-50/70 border border-sand-300 rounded-full text-sm text-gray-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
                />
              </form>
            </div>

            {/* 3. Navigation Links & Actions */}
            <div className="flex items-center gap-3">
              <Link
                to="/explore"
                className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-stone-700 hover:text-brand-600 px-3 py-2 rounded-xl transition"
              >
                <Compass className="w-4 h-4" />
                Explore
              </Link>

              <Link
                to="/categories"
                className="hidden md:flex items-center text-sm font-semibold text-stone-700 hover:text-brand-600 px-3 py-2 rounded-xl transition"
              >
                Categories
              </Link>

              {/* Become a Seller / Seller Studio Link */}
              {role === 'seller' ? (
                <Link
                  to="/seller/dashboard"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold hover:bg-blue-100 transition"
                >
                  <Store className="w-3.5 h-3.5" />
                  Seller Studio
                </Link>
              ) : role === 'admin' ? (
                <Link
                  to="/admin"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold hover:bg-emerald-100 transition"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin Console
                </Link>
              ) : (
                <Link
                  to="/seller/onboarding"
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-full border border-sand-300 bg-sand-50 hover:bg-white text-stone-800 hover:border-brand-300 transition"
                >
                  <Store className="w-3.5 h-3.5 text-brand-600" />
                  Become a Seller
                </Link>
              )}

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="relative p-2.5 rounded-full hover:bg-sand-100 text-stone-700 transition hidden sm:flex"
                title="Saved Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlist.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                className="relative p-2.5 rounded-full hover:bg-sand-100 text-stone-700 transition"
                title="Shopping Bag"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Authentication / User Menu */}
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1.5 pr-2.5 rounded-full border border-sand-200 hover:border-sand-300 hover:bg-sand-50 transition"
                  >
                    <img
                      src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <span className="text-xs font-bold text-stone-800 hidden md:inline truncate max-w-[100px]">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3 h-3 text-stone-400" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-sand-200 py-2 z-50 animate-fadeIn">
                      <div className="px-4 py-2 border-b border-sand-100">
                        <p className="text-xs font-bold text-stone-900 truncate">{user.name}</p>
                        <p className="text-[11px] text-stone-500 truncate">{user.phone || user.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-50 text-brand-700">
                          {user.role} • {selectedCity}
                        </span>
                      </div>

                      {role === 'seller' && (
                        <Link
                          to="/seller/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-stone-700 hover:bg-sand-50 hover:text-brand-600"
                        >
                          <Store className="w-4 h-4 text-brand-600" />
                          Seller Dashboard
                        </Link>
                      )}

                      {role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                        >
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          Admin Console
                        </Link>
                      )}

                      <Link
                        to="/wishlist"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-stone-700 hover:bg-sand-50"
                      >
                        <Heart className="w-4 h-4 text-rose-500" />
                        Saved Items ({wishlist.length})
                      </Link>

                      {role !== 'seller' && (
                        <Link
                          to="/seller/onboarding"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-stone-700 hover:bg-sand-50"
                        >
                          <Store className="w-4 h-4 text-stone-500" />
                          Apply as Seller
                        </Link>
                      )}

                      <div className="border-t border-sand-100 mt-1 pt-1">
                        <button
                          onClick={() => {
                            logout();
                            setUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 text-left"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="px-4 py-2 rounded-full bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                  >
                    <span>Login</span>
                  </button>
                </div>
              )}

              {/* Mobile Menu Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-stone-700 hover:bg-sand-100 lg:hidden"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-sand-200 bg-white px-4 pt-3 pb-6 space-y-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search products or local creators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-sand-100 border border-sand-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </form>

            <button
              onClick={() => {
                setIsLocationModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-sand-50 border border-sand-200 text-xs font-bold text-stone-800"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-600" />
                <span>Shopping in {selectedCity}</span>
              </div>
              <span className="text-brand-600 underline">Change</span>
            </button>

            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <Link
                to="/explore"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 rounded-2xl bg-sand-50 hover:bg-sand-100 flex items-center gap-2 text-stone-800"
              >
                <Compass className="w-4 h-4 text-brand-600" />
                Explore Drops
              </Link>
              <Link
                to="/categories"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 rounded-2xl bg-sand-50 hover:bg-sand-100 flex items-center gap-2 text-stone-800"
              >
                <ShoppingBag className="w-4 h-4 text-brand-600" />
                Categories
              </Link>
            </div>

            <div className="pt-2">
              <Link
                to="/seller/onboarding"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-full bg-sand-100 text-stone-900 font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Store className="w-4 h-4 text-brand-600" />
                Become a Seller
              </Link>
            </div>
          </div>
        )}
      </header>

      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
