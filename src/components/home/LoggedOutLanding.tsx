import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin,
  ShieldCheck,
  ShoppingBag,
  ArrowRight,
  Store,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  PackageCheck,
  Compass,
  Heart,
  Plus,
  Clock,
  Search,
  Tag,
  User as UserIcon,
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { useAuth } from '../../context/AuthContext';
import { marketplaceService } from '../../services/marketplaceService';
import { ProductCard } from '../product/ProductCard';
import { SellerCard } from '../seller/SellerCard';
import { LocationModal } from '../common/LocationModal';
import { AuthModal } from '../auth/AuthModal';
import { ShoppingAtmosphere } from '../common/ShoppingAtmosphere';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Product, SellerProfile, Category } from '../../types';

export const LoggedOutLanding: React.FC = () => {
  const navigate = useNavigate();
  const { selectedCity } = useLocation();
  const { sendOtp } = useAuth();

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalPhone, setAuthModalPhone] = useState('');
  const [authModalStep, setAuthModalStep] = useState<'password-login' | 'otp-phone'>('password-login');

  const [categories, setCategories] = useState<Category[]>([]);
  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  const [localSellers, setLocalSellers] = useState<SellerProfile[]>([]);
  const [wishlistLoved, setWishlistLoved] = useState<boolean>(false);

  // Sync real database products, categories, and sellers dynamically based on selectedCity
  useEffect(() => {
    const loadData = () => {
      setCategories(marketplaceService.getCategories());
      setLocalProducts(marketplaceService.getPublicProducts(selectedCity));
      setLocalSellers(marketplaceService.getSellersByCity(selectedCity));
    };

    loadData();
    const unsubscribe = marketplaceService.subscribe(loadData);
    return () => unsubscribe();
  }, [selectedCity]);

  const handleStartShopping = () => {
    const exploreSection = document.getElementById('explore-local');
    if (exploreSection) {
      exploreSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/explore');
    }
  };

  return (
    <div className="relative space-y-16 sm:space-y-24 pb-20 overflow-hidden bg-[#F8FAFC]">
      {/* Subtle, art-directed shopping atmosphere in background */}
      <ShoppingAtmosphere />

      {/* 1. HERO SECTION (BLUE + ENERGETIC YELLOW COMMERCE ACCENT + PRODUCT COLLAGE) */}
      <section className="relative overflow-hidden pt-6 pb-16 sm:pt-12 sm:pb-24 border-b border-sand-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* LEFT COLUMN: Clear Commerce Hierarchy (Headline -> Supporting -> CTAs) */}
            <div className="lg:col-span-6 text-center lg:text-left space-y-6">
              
              {/* Brand Tagline Badge with Yellow Energy Accent */}
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2"
              >
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white shadow-soft-sm border border-sand-200/90 text-xs font-semibold text-stone-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FACC15] ring-2 ring-[#FACC15]/40 inline-block" />
                  <span className="font-bold text-stone-900">Selluy</span>
                  <span className="text-stone-300">•</span>
                  <span className="text-stone-600">Discover local. Buy direct.</span>
                </div>
              </motion.div>

              {/* Primary Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl sm:text-6xl lg:text-[66px] font-black tracking-tight text-stone-950 font-display leading-[1.05]"
              >
                Discover what&apos;s local
                <span className="inline-block w-3 h-3 rounded-full bg-[#FACC15] ml-1.5 align-baseline shadow-xs" />
              </motion.h1>

              {/* Supporting Headline */}
              <motion.h2
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-xl sm:text-2xl font-bold text-stone-800 tracking-tight leading-snug"
              >
                Buy direct from verified sellers around you.
              </motion.h2>

              {/* Supporting Description */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-base sm:text-lg text-stone-600 font-normal leading-relaxed max-w-xl mx-auto lg:mx-0"
              >
                Explore products from local sellers, discover something new, and shop directly from your city.
              </motion.p>

              {/* Primary & Secondary CTAs with Commerce Energy: Instant Sign In Highlight */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2"
              >
                <Button
                  onClick={() => setIsAuthModalOpen(true)}
                  size="lg"
                  className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-lg hover:shadow-xl transition group text-base tracking-wide flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserIcon className="w-5 h-5 text-amber-300" />
                  <span>Sign In / Join Selluy</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition" />
                </Button>

                <Button
                  onClick={handleStartShopping}
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto px-7 py-4 bg-white text-stone-900 hover:bg-sand-50 rounded-2xl border border-sand-300 shadow-2xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Compass className="w-4 h-4 text-blue-600" />
                  <span>Explore Marketplace</span>
                </Button>
              </motion.div>

              {/* Discreet Seller Prompt */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.45 }}
                className="pt-1 text-center lg:text-left"
              >
                <Link
                  to="/seller/onboarding"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 transition"
                >
                  <Store className="w-3.5 h-3.5 text-stone-400" />
                  <span>Are you a local creator or merchant?</span>
                  <span className="text-blue-600 font-bold underline decoration-blue-300">Apply to sell →</span>
                </Link>
              </motion.div>

              {/* Subtle Commerce Indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="flex items-center justify-center lg:justify-start gap-4 pt-2 text-xs text-stone-500 font-medium"
              >
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  100% Vetted Local Sellers
                </span>
                <span className="text-stone-300">•</span>
                <span className="flex items-center gap-1.5">
                  <PackageCheck className="w-4 h-4 text-emerald-600" />
                  Direct Local Delivery
                </span>
                <span className="text-stone-300">•</span>
                <span className="flex items-center gap-1.5 text-stone-700 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-[#FACC15]" />
                  Zero Mass Warehouses
                </span>
              </motion.div>
            </div>

            {/* RIGHT COLUMN: Editorial Product Collage (Pure Discovery — No Prices, No Fake Reviews) */}
            <div className="lg:col-span-6 relative">
              <div className="relative w-full max-w-lg lg:max-w-none mx-auto min-h-[460px] sm:min-h-[520px] lg:min-h-[550px] flex items-center justify-center">
                
                {/* 1. Dynamic Local-First Indicator Pill (Section 7) */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsLocationModalOpen(true)}
                  className="absolute -top-3 left-3 sm:left-10 z-30 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-sand-200/90 shadow-soft-md text-xs font-bold text-stone-800 hover:border-amber-400 transition cursor-pointer"
                  title="Click to switch city"
                >
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>📍 {selectedCity}</span>
                  <span className="text-stone-300">•</span>
                  <span className="text-stone-600 font-medium">Verified local sellers</span>
                  <ChevronRight className="w-3 h-3 text-stone-400 ml-0.5" />
                </motion.button>

                {/* 2. Floating Warm Yellow Shopping Tag Accent (Section 8) */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="absolute -top-2 right-4 sm:right-12 z-30 hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF08A] border border-[#FACC15] shadow-xs text-xs font-extrabold text-amber-950"
                >
                  <Tag className="w-3 h-3 text-amber-700" />
                  <span>Curated Local Discovery</span>
                </motion.div>

                {/* 3. PRODUCT OBJECT 1: Fashion / Tailored Linen Apparel */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="absolute top-8 left-2 sm:left-6 w-44 sm:w-52 bg-white rounded-3xl p-3 border border-sand-200/90 shadow-soft-md z-10 transition-shadow duration-300"
                  style={{ rotate: '-1.5deg' }}
                >
                  <div className="relative aspect-[4/4.5] rounded-2xl overflow-hidden bg-sand-100 mb-2.5">
                    <img
                      src="https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=600&q=80"
                      alt="Tailored linen apparel"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <button
                      type="button"
                      onClick={() => setWishlistLoved(!wishlistLoved)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-stone-600 hover:text-rose-500 shadow-2xs transition"
                      aria-label="Add to wishlist"
                    >
                      <Heart className={`w-3.5 h-3.5 ${wishlistLoved ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-[#FEF9C3] text-amber-900 border border-amber-300/80 text-[10px] font-bold">
                      Local Apparel
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
                    <span className="truncate">Linen Collection</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  </div>
                </motion.div>

                {/* 4. PRODUCT OBJECT 2: Artisan Ceramics / Fluted Clay Vessel */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.25 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="absolute top-2 right-2 sm:right-6 w-40 sm:w-48 bg-white rounded-3xl p-3 border border-sand-200/90 shadow-soft-md z-20 transition-shadow duration-300"
                  style={{ rotate: '2deg' }}
                >
                  <div className="relative aspect-[4/4.5] rounded-2xl overflow-hidden bg-sand-100 mb-2.5">
                    <img
                      src="https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=600&q=80"
                      alt="Handcrafted ceramic vessel"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-xs text-[10px] font-bold text-emerald-800 shadow-2xs border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Verified Seller</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
                    <span className="truncate">Home &amp; Decor</span>
                    <span className="text-[10px] text-stone-500">Handmade</span>
                  </div>
                </motion.div>

                {/* 5. PRODUCT OBJECT 3: Minimalist Timepiece & Leather (Center Spatial Anchor) */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.35 }}
                  whileHover={{ y: -3, scale: 1.03 }}
                  className="absolute top-44 left-1/2 -translate-x-1/2 w-44 sm:w-52 bg-white rounded-3xl p-3 border border-sand-200/90 shadow-soft-lg z-25 transition-shadow duration-300"
                >
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-sand-100 mb-2">
                    <img
                      src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80"
                      alt="Minimalist timepiece"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/95 flex items-center justify-center text-blue-600 shadow-2xs">
                      <Plus className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                    <span className="truncate">Timepiece &amp; Leather</span>
                    <span className="text-[10px] font-semibold text-blue-600">Local Shop</span>
                  </div>
                </motion.div>

                {/* 6. PRODUCT OBJECT 4: Botanical Clean Beauty & Skincare */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.45 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="absolute bottom-4 left-4 sm:left-10 w-36 sm:w-44 bg-white rounded-3xl p-2.5 sm:p-3 border border-sand-200/90 shadow-soft-md z-20 transition-shadow duration-300"
                  style={{ rotate: '-2deg' }}
                >
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-sand-100 mb-2">
                    <img
                      src="https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=600&q=80"
                      alt="Organic cold-pressed skincare"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <span className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-[#FACC15]" />
                  </div>
                  <div className="text-xs font-semibold text-stone-700">
                    <span className="block truncate">Organic Care</span>
                    <span className="text-[10px] text-stone-500 font-normal">Small-Batch</span>
                  </div>
                </motion.div>

                {/* 7. PRODUCT OBJECT 5: Clean Leather Court Sneaker */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.55 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="absolute bottom-2 right-2 sm:right-8 w-44 sm:w-52 bg-white rounded-3xl p-3 border border-sand-200/90 shadow-soft-md z-10 transition-shadow duration-300"
                  style={{ rotate: '1.5deg' }}
                >
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-sand-100 mb-2">
                    <img
                      src="https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80"
                      alt="Handcrafted leather sneaker"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200/60">
                      Footwear
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
                    <span className="truncate">Leather Court</span>
                    <span className="text-[10px] text-stone-500 font-normal">Direct</span>
                  </div>
                </motion.div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. EXPLORE LOCAL (Marketplace Categories Progressing into Commerce) */}
      <section id="explore-local" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200/90 text-xs font-bold mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FACC15]" />
              <span>Direct Categories</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-950 font-display tracking-tight">
              Explore local
            </h2>
            <p className="text-sm text-stone-600 mt-1">
              Discover products from verified sellers around you.
            </p>
          </div>
          <Link
            to="/categories"
            className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group transition"
          >
            <span>All Categories</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </Link>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/explore?category=${cat.slug}`}
              className="group flex flex-col items-center p-3 rounded-3xl bg-white border border-sand-200/90 shadow-2xs hover:shadow-soft hover:border-amber-300 transition duration-300"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-sand-100 mb-2.5 border border-sand-100 shrink-0">
                <img
                  src={cat.image}
                  alt={cat.name}
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=400&q=80';
                  }}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                />
              </div>
              <span className="text-xs font-bold text-stone-800 text-center leading-tight line-clamp-1 group-hover:text-blue-600 transition">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. LOCAL DISCOVERY: FROM {selectedCity} (Dynamic Products from Real Sellers) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                City Feed
              </span>
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(true)}
                className="text-xs font-semibold text-stone-500 hover:text-blue-600 underline flex items-center gap-1 cursor-pointer"
              >
                Change city
              </button>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-950 font-display tracking-tight">
              From {selectedCity}
            </h2>
            <p className="text-sm text-stone-600 mt-1">
              Products from verified sellers around you.
            </p>
          </div>

          {localProducts.length > 0 && (
            <Link
              to={`/explore?city=${encodeURIComponent(selectedCity)}`}
              className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group transition"
            >
              <span>View all from {selectedCity}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </Link>
          )}
        </div>

        {/* Real Product Feed or Honest Zero State */}
        {localProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {localProducts.slice(0, 8).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                highlightCity={selectedCity}
              />
            ))}
          </div>
        ) : (
          /* Honest Zero State (Section 17) */
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-sand-200 text-center max-w-2xl mx-auto shadow-soft-sm">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-4 border border-amber-200">
              <MapPin className="w-7 h-7" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-stone-950 font-display">
              Nothing here yet
            </h3>
            <p className="text-sm text-stone-600 mt-2 max-w-md mx-auto leading-relaxed">
              We&apos;re bringing verified local sellers to {selectedCity}. If you sell products here, join Selluy as a foundational local business.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
              <Link to="/seller/onboarding" className="w-full sm:w-auto">
                <Button size="md" className="w-full sm:w-auto px-6 py-2.5 shadow-sm bg-blue-600 hover:bg-blue-700 text-white font-bold">
                  <Store className="w-4 h-4 mr-1.5" />
                  Become a Seller
                </Button>
              </Link>
              <Button
                variant="outline"
                size="md"
                onClick={() => setIsLocationModalOpen(true)}
                className="w-full sm:w-auto px-6 py-2.5 bg-white text-stone-800"
              >
                <Compass className="w-4 h-4 mr-1.5 text-blue-600" />
                Explore other cities
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* 4. SELLER DISCOVERY: MEET LOCAL SELLERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-950 font-display tracking-tight">
              Meet local sellers
            </h2>
            <p className="text-sm text-stone-600 mt-1">
              Discover small businesses and local sellers offering products around your city.
            </p>
          </div>
          <Link
            to="/explore"
            className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group transition"
          >
            <span>Explore All Sellers</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </Link>
        </div>

        {/* Real Sellers Grid or Seller Invitation */}
        {localSellers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {localSellers.slice(0, 6).map((seller) => (
              <SellerCard key={seller.id} seller={seller} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-sand-200 flex flex-col md:flex-row items-center justify-between gap-6 shadow-soft-sm">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold">
                <Store className="w-3.5 h-3.5 text-amber-700" />
                <span>Local Seller Network</span>
              </div>
              <h3 className="text-xl font-bold text-stone-900">
                Are you a local seller in {selectedCity}?
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 max-w-lg leading-relaxed">
                Selluy helps small businesses and local sellers connect directly with customers in their city. Whether you sell fashion, jewelry, home products, handmade goods, accessories, or lifestyle products, Selluy gives your business a place to be discovered locally.
              </p>
            </div>
            <Link to="/seller/onboarding" className="shrink-0 w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm">
                Become a Seller
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        )}
      </section>

      {/* 5. THE SELLUY STANDARD (Three Quiet Trust Pillars) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-7 border border-sand-200/90 shadow-soft-sm hover:shadow-soft transition duration-300 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-black text-stone-950 font-display">
              Two-Sided Verification
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Every seller is vetted with business identity and workshop verification. Zero dropshipping, zero fake products.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-7 border border-sand-200/90 shadow-soft-sm hover:shadow-soft transition duration-300 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-black text-stone-950 font-display">
              City-First Discovery
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Find unique products created by verified local businesses and shops in your area. Support independent sellers close to home.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-7 border border-sand-200/90 shadow-soft-sm hover:shadow-soft transition duration-300 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <PackageCheck className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-black text-stone-950 font-display">
              Direct Commerce
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Buy directly with no unnecessary middlemen markups. Receive parcels packed directly by local sellers with authentic care.
            </p>
          </div>
        </div>
      </section>

      {/* 6. BECOME A SELLER CALL TO ACTION (Clean Editorial Banner) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-stone-950 text-white rounded-4xl p-8 sm:p-14 border border-stone-800 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl space-y-3 relative z-10 text-center md:text-left">
            <Badge variant="brand" size="md" className="bg-amber-400/20 text-amber-300 border-amber-400/30">
              <Store className="w-3.5 h-3.5 mr-1" />
              Local Business &amp; Seller Community
            </Badge>
            <h3 className="text-2xl sm:text-4xl font-black font-display tracking-tight text-white leading-tight">
              Have products to sell? <br />
              Reach customers around your city.
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Launch your storefront on Selluy. Connect with local shoppers looking for authentic, independent goods from businesses in their area.
            </p>
          </div>

          <div className="shrink-0 w-full sm:w-auto relative z-10">
            <Link to="/seller/onboarding" className="w-full sm:w-auto block">
              <Button
                size="lg"
                className="w-full sm:w-auto px-8 py-3.5 shadow-lg bg-blue-600 hover:bg-blue-500 text-white font-bold"
              >
                <span>Become a Seller</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* MODALS */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialPhone={authModalPhone}
        initialStep={authModalStep}
      />
    </div>
  );
};

export default LoggedOutLanding;
