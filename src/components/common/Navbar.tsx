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
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { LocationModal } from './LocationModal';
import { AuthModal } from '../auth/AuthModal';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { selectedCity } = useLocation();
  const { cartCount, wishlist } = useCart();
  const { user, role, logout } = useAuth();

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

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
            {/* Logo */}
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-500 flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                  <span className="text-white font-extrabold text-2xl tracking-tighter">S</span>
                </div>
                <div>
                  <span className="text-2xl font-black tracking-tight text-gray-950 font-display">
                    selluy<span className="text-brand-500">.</span>
                  </span>
                  <span className="hidden sm:block text-[10px] uppercase tracking-wider font-semibold text-stone-500 -mt-1">
                    Discover local • Buy direct
                  </span>
                </div>
              </Link>

              {/* City selector button */}
              <button
                onClick={() => setIsLocationModalOpen(true)}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sand-100 hover:bg-sand-200/80 border border-sand-200 text-stone-800 text-xs font-semibold transition"
                title="Change discovery city"
              >
                <MapPin className="w-3.5 h-3.5 text-brand-600" />
                <span>{selectedCity}</span>
                <ChevronDown className="w-3 h-3 text-stone-400" />
              </button>
            </div>

            {/* Global Search Bar */}
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

            {/* Navigation links & actions */}
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

              {/* Seller portal link */}
              {role === 'seller' ? (
                <Link
                  to="/seller/dashboard"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold hover:bg-amber-200 transition"
                >
                  <Store className="w-3.5 h-3.5" />
                  My Storefront
                </Link>
              ) : role === 'admin' ? (
                <Link
                  to="/admin"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold hover:bg-emerald-200 transition"
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
                  Sell on Selluy
                </Link>
              )}

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="relative p-2.5 rounded-full hover:bg-sand-100 text-stone-700 transition hidden sm:flex"
                title="Saved Items"
              >
                <Heart className="w-5 h-5" />
                {wishlist.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                className="relative p-2.5 rounded-full bg-sand-100 hover:bg-brand-50 hover:text-brand-600 text-stone-900 transition flex items-center justify-center"
                title="Shopping Bag"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center shadow-sm">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* User profile dropdown or Sign In buttons */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1 rounded-full hover:bg-sand-100 transition border border-sand-300"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-sand-200 flex items-center justify-center text-stone-700">
                        <UserIcon className="w-4 h-4" />
                      </div>
                    )}
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-sand-200 py-2 z-50 animate-fadeIn">
                      <div className="px-4 py-2 border-b border-sand-100">
                        <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-stone-500 capitalize">{role} Account</p>
                      </div>

                      <Link
                        to="/explore"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-stone-700 hover:bg-sand-50"
                      >
                        Browse Feed
                      </Link>

                      <Link
                        to="/wishlist"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-stone-700 hover:bg-sand-50"
                      >
                        Saved Creations ({wishlist.length})
                      </Link>

                      <Link
                        to="/cart"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-stone-700 hover:bg-sand-50"
                      >
                        Shopping Bag ({cartCount})
                      </Link>

                      {role === 'seller' && (
                        <Link
                          to="/seller/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-amber-700 font-bold hover:bg-amber-50"
                        >
                          Seller Studio
                        </Link>
                      )}

                      {role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-emerald-700 font-bold hover:bg-emerald-50"
                        >
                          Admin Console
                        </Link>
                      )}

                      <div className="border-t border-sand-100 my-1"></div>

                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    onClick={() => {
                      setAuthModalMode('signin');
                      setIsAuthModalOpen(true);
                    }}
                    className="text-xs font-bold text-stone-700 hover:text-stone-900 px-3 py-2 rounded-xl transition"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setAuthModalMode('signup');
                      setIsAuthModalOpen(true);
                    }}
                    className="text-xs font-bold px-4 py-2 rounded-full bg-brand-600 hover:bg-brand-500 text-white shadow-xs transition"
                  >
                    Join Selluy
                  </button>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-stone-700 hover:bg-sand-100 md:hidden"
                aria-label="Open menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar below navbar */}
          <div className="pb-3 lg:hidden">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search products, indie creators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-24 py-2 bg-sand-50 border border-sand-300 rounded-full text-sm text-gray-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(true)}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-full bg-sand-200 text-[11px] font-semibold text-stone-800 flex items-center gap-1"
              >
                <MapPin className="w-3 h-3 text-brand-600" />
                <span className="truncate max-w-[70px]">{selectedCity}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-sand-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
            <button
              onClick={() => {
                setIsLocationModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-sand-100 text-stone-800 text-sm font-semibold"
            >
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-600" />
                Location: {selectedCity}
              </span>
              <span className="text-xs text-brand-600">Change</span>
            </button>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link
                to="/explore"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 rounded-2xl bg-sand-50 hover:bg-sand-100 text-sm font-semibold text-stone-800 flex items-center gap-2"
              >
                <Compass className="w-4 h-4 text-brand-500" />
                Explore
              </Link>
              <Link
                to="/categories"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 rounded-2xl bg-sand-50 hover:bg-sand-100 text-sm font-semibold text-stone-800 flex items-center gap-2"
              >
                Categories
              </Link>
              <Link
                to="/seller/onboarding"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 rounded-2xl bg-amber-50 text-amber-900 text-sm font-semibold flex items-center gap-2"
              >
                <Store className="w-4 h-4 text-amber-600" />
                Sell on Selluy
              </Link>
              <Link
                to="/seller/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 rounded-2xl bg-sand-50 hover:bg-sand-100 text-sm font-semibold text-stone-800 flex items-center gap-2"
              >
                Seller Dashboard
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Location Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </>
  );
};
