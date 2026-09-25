import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  Package,
  Lock,
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { marketplaceService } from '../../services/marketplaceService';
import { SelluyLogo } from './SelluyLogo';
import { LocationModal } from './LocationModal';
import { AuthModal } from '../auth/AuthModal';
import { ProfileModal } from '../profile/ProfileModal';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { selectedCity } = useLocation();
  const { cartCount, wishlist } = useCart();
  const { user, isAuthenticated, role, logout, sellerProfile } = useAuth();

  const isSeller = role === 'seller' || sellerProfile?.verification_status === 'approved';
  const sellerStoreId = sellerProfile?.id || (user ? marketplaceService.getSellerByUserId(user.id)?.id : undefined);

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuDrawerOpen, setMenuDrawerOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileModalTab, setProfileModalTab] = useState<'profile' | 'orders' | 'security' | 'seller'>('profile');

  const openProfileTab = (tab: 'profile' | 'orders' | 'security' | 'seller') => {
    setProfileModalTab(tab);
    setIsProfileModalOpen(true);
    setUserMenuOpen(false);
    setMenuDrawerOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
      setMenuDrawerOpen(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-sand-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18 gap-4">
            
            {/* 1. Official Selluy Logo (Clean without bulky city pill in main bar) */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <SelluyLogo variant="full" size="md" showTagline={false} />
              </Link>
            </div>

            {/* 2. Global Centered Pill Search Bar (Matching Mockup with Search Icon on Right) */}
            <div className="hidden md:flex flex-1 max-w-lg lg:max-w-xl mx-4">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <input
                  type="text"
                  placeholder="Search for products, sellers, or categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-5 pr-11 py-2.5 bg-white border border-stone-200 rounded-full text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition shadow-2xs hover:border-stone-300"
                />
                <button
                  type="submit"
                  aria-label="Search"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* 3. Right Action Cluster (Shopping Bag, Sign In Pill, Menu Hamburger) */}
            <div className="flex items-center gap-3">
              {/* Shopping Bag with Badge */}
              <Link
                to="/cart"
                className="relative p-2 rounded-full hover:bg-stone-100 text-stone-700 transition cursor-pointer"
                title="Shopping Bag"
              >
                <ShoppingBag className="w-5 h-5 text-stone-800" />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </Link>

              {/* Authentication: Clean Blue Pill Button matching mockup */}
              {isAuthenticated && user ? (
                <div className="relative">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1.5 pr-3 rounded-full border border-stone-200 hover:border-stone-300 hover:bg-stone-50 transition cursor-pointer"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-xs select-none">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                    <span className="text-xs font-bold text-stone-800 hidden sm:inline truncate max-w-[90px]">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3 h-3 text-stone-400" />
                  </motion.button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 overflow-hidden"
                      >
                        <div className="px-4 py-2.5 border-b border-stone-100 bg-stone-50/50">
                          <p className="text-xs font-bold text-stone-900 truncate">{user.name}</p>
                          <p className="text-[11px] text-stone-500 truncate">{user.phone || user.email}</p>
                          <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                            {isSeller ? 'Verified Seller' : user.role} • {selectedCity}
                          </span>
                        </div>

                        <button
                          onClick={() => openProfileTab('profile')}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-50 hover:text-blue-600 text-left cursor-pointer transition"
                        >
                          <UserIcon className="w-4 h-4 text-blue-600" />
                          <span>Account</span>
                        </button>

                        <button
                          onClick={() => openProfileTab('orders')}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-50 hover:text-blue-600 text-left cursor-pointer transition"
                        >
                          <Package className="w-4 h-4 text-amber-500" />
                          <span>Orders</span>
                        </button>

                        <Link
                          to="/wishlist"
                          onClick={() => setUserMenuOpen(false)}
                          className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-50 hover:text-blue-600 transition"
                        >
                          <div className="flex items-center gap-2.5">
                            <Heart className="w-4 h-4 text-rose-500" />
                            <span>Wishlist</span>
                          </div>
                          {wishlist.length > 0 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 bg-rose-50 text-rose-600 rounded-full border border-rose-200">
                              {wishlist.length}
                            </span>
                          )}
                        </Link>

                        <button
                          onClick={() => openProfileTab('security')}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-50 hover:text-blue-600 text-left cursor-pointer transition"
                        >
                          <Lock className="w-4 h-4 text-emerald-600" />
                          <span>Security</span>
                        </button>

                        {isSeller ? (
                          <>
                            <Link
                              to={sellerStoreId ? `/seller/${sellerStoreId}` : '/seller/dashboard'}
                              onClick={() => setUserMenuOpen(false)}
                              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 transition"
                            >
                              <Store className="w-4 h-4 text-blue-600" />
                              <span>Seller Profile</span>
                            </Link>

                            <Link
                              to="/seller/dashboard"
                              onClick={() => setUserMenuOpen(false)}
                              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 transition"
                            >
                              <Store className="w-4 h-4 text-indigo-600" />
                              <span>Seller Dashboard</span>
                            </Link>
                          </>
                        ) : (
                          <Link
                            to="/become-seller"
                            onClick={() => setUserMenuOpen(false)}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 hover:text-blue-600 transition"
                          >
                            <Store className="w-4 h-4 text-amber-600" />
                            <span>Become a Seller</span>
                          </Link>
                        )}

                        {role === 'admin' && (
                          <Link
                            to="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition"
                          >
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span>Admin Console</span>
                          </Link>
                        )}

                        <div className="border-t border-stone-100 mt-1 pt-1">
                          <button
                            onClick={() => {
                              logout();
                              setUserMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 text-left cursor-pointer transition"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-5 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-full shadow-2xs hover:shadow-sm transition text-xs tracking-wide cursor-pointer inline-flex items-center justify-center"
                >
                  <span>Sign In</span>
                </button>
              )}

              {/* Hamburger Menu (from mockup) */}
              <button
                onClick={() => setMenuDrawerOpen(!menuDrawerOpen)}
                className="p-2 rounded-full text-stone-700 hover:bg-stone-100 transition cursor-pointer"
                aria-label="Navigation Menu"
              >
                {menuDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Global Navigation Drawer (Opened via Hamburger) */}
        <AnimatePresence>
          {menuDrawerOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-stone-200 bg-white px-4 pt-4 pb-6 space-y-4 overflow-hidden"
            >
              {/* Search on mobile */}
              <div className="md:hidden">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="text"
                    placeholder="Search for products, sellers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 rounded-full bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">
                    <Search className="w-4 h-4" />
                  </button>
                </form>
              </div>

              {/* City Selector */}
              <button
                onClick={() => {
                  setIsLocationModalOpen(true);
                  setMenuDrawerOpen(false);
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-800 hover:bg-stone-100 transition"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>Discovering in <strong className="text-stone-950 font-black">{selectedCity}</strong></span>
                </div>
                <span className="text-blue-600 font-bold underline">Change city</span>
              </button>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold">
                <Link
                  to="/explore"
                  onClick={() => setMenuDrawerOpen(false)}
                  className="p-3 rounded-2xl bg-stone-50 hover:bg-blue-50 flex items-center gap-2 text-stone-800 hover:text-blue-700 transition"
                >
                  <Compass className="w-4 h-4 text-blue-600" />
                  <span>Explore Feed</span>
                </Link>
                <Link
                  to="/categories"
                  onClick={() => setMenuDrawerOpen(false)}
                  className="p-3 rounded-2xl bg-stone-50 hover:bg-blue-50 flex items-center gap-2 text-stone-800 hover:text-blue-700 transition"
                >
                  <ShoppingBag className="w-4 h-4 text-blue-600" />
                  <span>Categories</span>
                </Link>
                <Link
                  to="/wishlist"
                  onClick={() => setMenuDrawerOpen(false)}
                  className="p-3 rounded-2xl bg-stone-50 hover:bg-rose-50 flex items-center gap-2 text-stone-800 hover:text-rose-600 transition"
                >
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span>Wishlist ({wishlist.length})</span>
                </Link>
                <Link
                  to="/become-seller"
                  onClick={() => setMenuDrawerOpen(false)}
                  className="p-3 rounded-2xl bg-stone-50 hover:bg-amber-50 flex items-center gap-2 text-stone-800 hover:text-amber-800 transition"
                >
                  <Store className="w-4 h-4 text-amber-500" />
                  <span>Become a Seller</span>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        initialTab={profileModalTab}
      />
    </>
  );
};

export default Navbar;
