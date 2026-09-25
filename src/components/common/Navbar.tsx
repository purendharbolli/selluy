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
  Sparkles,
  Package,
  Lock,
  ExternalLink,
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
import { Badge } from '../ui/Badge';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { selectedCity } = useLocation();
  const { cartCount, wishlist } = useCart();
  const { user, isAuthenticated, role, logout, sellerProfile } = useAuth();

  const isSeller = role === 'seller' || sellerProfile?.verification_status === 'approved';
  const sellerStoreId = sellerProfile?.id || (user ? marketplaceService.getSellerByUserId(user.id)?.id : undefined);

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileModalTab, setProfileModalTab] = useState<'profile' | 'orders' | 'security' | 'seller'>('profile');

  const openProfileTab = (tab: 'profile' | 'orders' | 'security' | 'seller') => {
    setProfileModalTab(tab);
    setIsProfileModalOpen(true);
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-sand-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            {/* 1. Official Selluy Logo */}
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center">
                <SelluyLogo variant="full" size="md" showTagline={false} />
              </Link>

              {/* City selector button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsLocationModalOpen(true)}
                className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-sand-100 hover:bg-sand-200/80 border border-sand-200/90 text-stone-800 text-xs font-semibold transition cursor-pointer shadow-2xs"
                title="Change discovery city"
              >
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>{selectedCity}</span>
                <ChevronDown className="w-3 h-3 text-stone-400" />
              </motion.button>
            </div>

            {/* 2. Global Search Bar */}
            <div className="hidden lg:flex flex-1 max-w-md mx-4">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search products, sellers & categories"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-sand-50/70 border border-sand-300/80 rounded-full text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-600 focus:bg-white transition shadow-xs"
                />
              </form>
            </div>

            {/* 3. Navigation Links & Actions */}
            <div className="flex items-center gap-3">
              <Link
                to="/explore"
                className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-stone-700 hover:text-blue-600 px-3 py-2 rounded-xl transition"
              >
                <Compass className="w-4 h-4" />
                Explore
              </Link>

              <Link
                to="/categories"
                className="hidden md:flex items-center text-sm font-semibold text-stone-700 hover:text-blue-600 px-3 py-2 rounded-xl transition"
              >
                Categories
              </Link>

              {/* Become a Seller / Seller Studio Link */}
              {isSeller ? (
                <Link
                  to="/seller/dashboard"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold hover:bg-blue-100 transition shadow-xs"
                >
                  <Store className="w-3.5 h-3.5 text-blue-600" />
                  Seller Studio
                </Link>
              ) : role === 'admin' ? (
                <Link
                  to="/admin"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold hover:bg-emerald-100 transition shadow-xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Admin Console
                </Link>
              ) : null}

              {/* Wishlist with motion */}
              <Link
                to="/wishlist"
                className="relative p-2.5 rounded-full hover:bg-sand-100 text-stone-700 transition hidden sm:flex cursor-pointer"
                title="Saved Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlist.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs"
                  >
                    {wishlist.length}
                  </motion.span>
                )}
              </Link>

              {/* Cart with motion */}
              <Link
                to="/cart"
                className="relative p-2.5 rounded-full hover:bg-sand-100 text-stone-700 transition cursor-pointer"
                title="Shopping Bag"
              >
                <ShoppingBag className="w-5 h-5" />
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

              {/* Authentication / User Menu */}
              {isAuthenticated && user ? (
                <div className="relative">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1.5 pr-2.5 rounded-full border border-sand-200 hover:border-sand-300 hover:bg-sand-50 transition cursor-pointer"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 text-white flex items-center justify-center font-bold text-xs select-none shadow-2xs">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                    <span className="text-xs font-bold text-stone-800 hidden md:inline truncate max-w-[100px]">
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
                        className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-sand-200 py-2 z-50 overflow-hidden"
                      >
                        <div className="px-4 py-2.5 border-b border-sand-100 bg-sand-50/50">
                          <p className="text-xs font-bold text-stone-900 truncate">{user.name}</p>
                          <p className="text-[11px] text-stone-500 truncate">{user.phone || user.email}</p>
                          <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                            {isSeller ? 'Verified Seller' : user.role} • {selectedCity}
                          </span>
                        </div>

                        {/* 1. Account */}
                        <button
                          onClick={() => openProfileTab('profile')}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-stone-800 hover:bg-sand-50 hover:text-blue-600 text-left cursor-pointer transition"
                        >
                          <UserIcon className="w-4 h-4 text-blue-600" />
                          <span>Account</span>
                        </button>

                        {/* 2. Orders */}
                        <button
                          onClick={() => openProfileTab('orders')}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-stone-800 hover:bg-sand-50 hover:text-blue-600 text-left cursor-pointer transition"
                        >
                          <Package className="w-4 h-4 text-amber-500" />
                          <span>Orders</span>
                        </button>

                        {/* 3. Wishlist */}
                        <Link
                          to="/wishlist"
                          onClick={() => setUserMenuOpen(false)}
                          className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-stone-800 hover:bg-sand-50 hover:text-blue-600 transition"
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

                        {/* 4. Security */}
                        <button
                          onClick={() => openProfileTab('security')}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-stone-800 hover:bg-sand-50 hover:text-blue-600 text-left cursor-pointer transition"
                        >
                          <Lock className="w-4 h-4 text-emerald-600" />
                          <span>Security</span>
                        </button>

                        {/* Customer vs Seller Navigation */}
                        {isSeller ? (
                          <>
                            {/* Seller Profile */}
                            <Link
                              to={sellerStoreId ? `/seller/${sellerStoreId}` : '/seller/dashboard'}
                              onClick={() => setUserMenuOpen(false)}
                              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 transition"
                            >
                              <Store className="w-4 h-4 text-blue-600" />
                              <span>Seller Profile</span>
                            </Link>

                            {/* Seller Dashboard */}
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
                          /* Become a Seller */
                          <Link
                            to="/become-seller"
                            onClick={() => setUserMenuOpen(false)}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-sand-50 hover:text-blue-600 transition"
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

                        <div className="border-t border-sand-100 mt-1 pt-1">
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
                <Button
                  onClick={() => setIsAuthModalOpen(true)}
                  size="md"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-full shadow-md hover:shadow-lg transition text-xs sm:text-sm tracking-wide"
                >
                  <UserIcon className="w-4 h-4 mr-1.5" />
                  Sign In
                </Button>
              )}

              {/* Mobile Menu Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-stone-700 hover:bg-sand-100 lg:hidden cursor-pointer"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden border-t border-sand-200 bg-white px-4 pt-3 pb-6 space-y-4 overflow-hidden"
            >
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search products, sellers & categories"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-sand-100 border border-sand-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>Shopping in {selectedCity}</span>
                </div>
                <span className="text-blue-600 underline">Change</span>
              </button>

              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <Link
                  to="/explore"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-2xl bg-sand-50 hover:bg-sand-100 flex items-center gap-2 text-stone-800"
                >
                  <Compass className="w-4 h-4 text-blue-600" />
                  Explore Drops
                </Link>
                <Link
                  to="/categories"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-2xl bg-sand-50 hover:bg-sand-100 flex items-center gap-2 text-stone-800"
                >
                  <ShoppingBag className="w-4 h-4 text-blue-600" />
                  Categories
                </Link>
              </div>

              <div className="pt-2">
                {isAuthenticated && user ? (
                  <div className="space-y-1.5 pt-2 border-t border-sand-200">
                    <div className="flex items-center gap-3 p-3 bg-sand-50 rounded-2xl mb-2">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 text-white flex items-center justify-center font-bold text-sm select-none shadow-2xs">
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-stone-900 truncate">{user.name}</p>
                        <p className="text-[11px] text-stone-500 truncate">{user.phone || user.email}</p>
                        <span className="inline-block mt-0.5 text-[9px] font-bold uppercase tracking-wider px-2 py-0.2 rounded-full bg-blue-50 text-blue-700">
                          {isSeller ? 'Verified Seller' : user.role}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => openProfileTab('profile')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-stone-800 hover:bg-sand-50 rounded-xl cursor-pointer"
                    >
                      <UserIcon className="w-4 h-4 text-blue-600" />
                      <span>Account</span>
                    </button>

                    <button
                      onClick={() => openProfileTab('orders')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-stone-800 hover:bg-sand-50 rounded-xl cursor-pointer"
                    >
                      <Package className="w-4 h-4 text-amber-500" />
                      <span>Orders</span>
                    </button>

                    <Link
                      to="/wishlist"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-stone-800 hover:bg-sand-50 rounded-xl"
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
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-stone-800 hover:bg-sand-50 rounded-xl cursor-pointer"
                    >
                      <Lock className="w-4 h-4 text-emerald-600" />
                      <span>Security</span>
                    </button>

                    {isSeller ? (
                      <>
                        <Link
                          to={sellerStoreId ? `/seller/${sellerStoreId}` : '/seller/dashboard'}
                          onClick={() => setMobileMenuOpen(false)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 rounded-xl"
                        >
                          <Store className="w-4 h-4 text-blue-600" />
                          <span>Seller Profile</span>
                        </Link>
                        <Link
                          to="/seller/dashboard"
                          onClick={() => setMobileMenuOpen(false)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 rounded-xl"
                        >
                          <Store className="w-4 h-4 text-indigo-600" />
                          <span>Seller Dashboard</span>
                        </Link>
                      </>
                    ) : (
                      <Link
                        to="/become-seller"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-sand-50 rounded-xl"
                      >
                        <Store className="w-4 h-4 text-amber-600" />
                        <span>Become a Seller</span>
                      </Link>
                    )}

                    {role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded-xl"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Admin Console</span>
                      </Link>
                    )}

                    <div className="pt-2">
                      <button
                        onClick={() => {
                          logout();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full py-2.5 rounded-full bg-rose-50 text-rose-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setIsAuthModalOpen(true);
                      }}
                      size="md"
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-md"
                    >
                      <UserIcon className="w-4 h-4 mr-1.5" />
                      Sign In / Register
                    </Button>
                    <Link
                      to="/become-seller"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-center text-xs text-stone-500 hover:text-stone-800 py-1"
                    >
                      Are you a seller? Apply here →
                    </Link>
                  </div>
                )}
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
