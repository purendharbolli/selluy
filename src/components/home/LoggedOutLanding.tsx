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
  Compass,
  Heart,
  Search,
  Tag,
  User as UserIcon,
  Send,
  ExternalLink,
  MessageCircle,
  Instagram,
  Check,
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { useAuth } from '../../context/AuthContext';
import { marketplaceService } from '../../services/marketplaceService';
import { ProductCard } from '../product/ProductCard';
import { SellerCard } from '../seller/SellerCard';
import { LocationModal } from '../common/LocationModal';
import { AuthModal } from '../auth/AuthModal';
import { ShoppingAtmosphere } from '../common/ShoppingAtmosphere';
import { Product, SellerProfile, Category } from '../../types';

export const LoggedOutLanding: React.FC = () => {
  const navigate = useNavigate();
  const { selectedCity } = useLocation();
  const { isAuthenticated } = useAuth();

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

  // Curated showcase sellers for local discovery when database is in seeding/cold-start state
  const fallbackSellers = [
    {
      id: 'sell-cozy-home',
      store_name: 'The Cozy Home',
      category: 'Home & Decor',
      city: selectedCity || 'Hyderabad',
      thumbnail: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=300&q=80',
      initials: 'CH',
      color: 'bg-amber-100 text-amber-900',
    },
    {
      id: 'sell-stylekraft',
      store_name: 'StyleKraft',
      category: 'Fashion',
      city: selectedCity || 'Hyderabad',
      thumbnail: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=300&q=80',
      initials: 'SK',
      color: 'bg-blue-100 text-blue-900',
    },
    {
      id: 'sell-pure-glow',
      store_name: 'Pure & Glow',
      category: 'Beauty',
      city: selectedCity || 'Hyderabad',
      thumbnail: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=300&q=80',
      initials: 'PG',
      color: 'bg-emerald-100 text-emerald-900',
    },
    {
      id: 'sell-technest',
      store_name: 'TechNest',
      category: 'Electronics',
      city: selectedCity || 'Hyderabad',
      thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80',
      initials: 'TN',
      color: 'bg-indigo-100 text-indigo-900',
    },
  ];

  return (
    <div className="relative space-y-14 sm:space-y-20 pb-20 overflow-hidden bg-[#F8FAFC]">
      {/* Subtle, art-directed shopping atmosphere in background */}
      <ShoppingAtmosphere />

      {/* 1. HERO SECTION (BLUE + YELLOW COMMERCE ACCENT + 3D CLAYMORPHIC PRODUCT COLLAGE) */}
      <section className="relative overflow-hidden pt-6 pb-12 sm:pt-10 sm:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* LEFT COLUMN: Clear Commerce Hierarchy (Eyebrow -> Headline -> Supporting -> CTAs) */}
            <div className="lg:col-span-6 text-center lg:text-left space-y-5">
              
              {/* Eyebrow: SELLUY • LOCAL MARKETPLACE */}
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="inline-flex items-center gap-2"
              >
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FEF08A] text-amber-950 border border-amber-300/80 text-[11px] sm:text-xs font-extrabold uppercase tracking-wider shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-amber-500 ring-2 ring-amber-300" />
                  <span>SELLUY • LOCAL MARKETPLACE</span>
                </div>
              </motion.div>

              {/* Main Headline: Discover. Shop. Sell local. */}
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.08 }}
                className="text-4xl sm:text-6xl lg:text-[62px] font-black tracking-tight text-stone-950 font-display leading-[1.08]"
              >
                Discover. Shop. <br />
                Sell{' '}
                <span className="text-blue-600 relative inline-block">
                  local.
                  <span className="absolute -top-1 -right-7 sm:-right-8 text-[#FACC15] text-2xl sm:text-3xl select-none animate-pulse">
                    ✦
                  </span>
                </span>
              </motion.h1>

              {/* Supporting Headline */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.16 }}
                className="text-lg sm:text-2xl font-bold text-stone-800 tracking-tight leading-snug"
              >
                A flexible marketplace built for social sellers and small businesses.
              </motion.h2>

              {/* Supporting Paragraph */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.24 }}
                className="text-sm sm:text-base text-stone-600 font-normal leading-relaxed max-w-lg mx-auto lg:mx-0"
              >
                Discover products around you, buy directly from local sellers, or bring your own products to Selluy.
              </motion.p>

              {/* Primary & Secondary CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.32 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2"
              >
                <button
                  onClick={handleStartShopping}
                  className="w-full sm:w-auto px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full shadow-md shadow-blue-500/25 transition group text-sm tracking-wide flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Start Shopping</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </button>

                <Link
                  to="/become-seller"
                  className="w-full sm:w-auto px-7 py-3.5 bg-white text-stone-900 hover:bg-sand-50 rounded-full border border-sand-300 shadow-2xs font-bold transition text-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Become a Seller</span>
                  <span className="text-amber-500 font-black">→</span>
                </Link>
              </motion.div>

              {/* Small Supporting Brand Statement */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="pt-1 flex items-center justify-center lg:justify-start gap-2 text-xs font-semibold text-stone-600"
              >
                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Discover local. Buy direct.</span>
              </motion.div>
            </div>

            {/* RIGHT COLUMN: Editorial 3D/Claymorphic Product Collage (No Prices in Hero) */}
            <div className="lg:col-span-6 relative pt-4 lg:pt-0">
              <div className="relative w-full max-w-lg lg:max-w-none mx-auto h-[440px] sm:h-[480px] lg:h-[500px] flex items-center justify-center">
                
                {/* 1. Sneakers (Blue & White Court Sneaker) */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="absolute top-28 sm:top-24 left-1/2 -translate-x-1/2 w-52 sm:w-60 z-30 drop-shadow-xl"
                >
                  <img
                    src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80"
                    alt="Sneakers"
                    className="w-full h-auto object-contain filter drop-shadow-2xl"
                    loading="eager"
                  />
                </motion.div>

                {/* 2. Canvas Tote Bag (Beige) */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.25 }}
                  whileHover={{ y: -3, scale: 1.02 }}
                  className="absolute top-4 right-4 sm:right-10 w-44 sm:w-52 z-20 drop-shadow-lg"
                >
                  <img
                    src="https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80"
                    alt="Canvas tote bag"
                    className="w-full h-auto object-cover rounded-2xl drop-shadow-lg"
                    loading="eager"
                  />
                </motion.div>

                {/* 3. Black Wireless Headphones */}
                <motion.div
                  initial={{ opacity: 0, x: 20, y: -10 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  whileHover={{ y: -3, scale: 1.03 }}
                  className="absolute top-8 right-2 sm:right-6 w-32 sm:w-36 z-25 drop-shadow-xl"
                >
                  <img
                    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80"
                    alt="Headphones"
                    className="w-full h-auto object-contain drop-shadow-xl"
                    loading="eager"
                  />
                </motion.div>

                {/* 4. Smartwatch (Dark Minimalist) */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  whileHover={{ y: -3, scale: 1.03 }}
                  className="absolute top-20 left-2 sm:left-6 w-28 sm:w-32 z-25 drop-shadow-xl"
                >
                  <img
                    src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80"
                    alt="Smartwatch"
                    className="w-full h-auto object-contain drop-shadow-lg"
                    loading="eager"
                  />
                </motion.div>

                {/* 5. Potted Succulent Plant */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.35 }}
                  whileHover={{ y: -3, scale: 1.02 }}
                  className="absolute bottom-10 right-14 sm:right-20 w-28 sm:w-32 z-20 drop-shadow-lg"
                >
                  <img
                    src="https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=400&q=80"
                    alt="Potted plant"
                    className="w-full h-auto object-cover rounded-2xl drop-shadow-lg"
                    loading="eager"
                  />
                </motion.div>

                {/* 6. Blue Matte Insulated Flask */}
                <motion.div
                  initial={{ opacity: 0, y: 20, x: 10 }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  whileHover={{ y: -3, scale: 1.03 }}
                  className="absolute bottom-6 right-2 sm:right-4 w-20 sm:w-24 z-25 drop-shadow-xl"
                >
                  <img
                    src="https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=300&q=80"
                    alt="Blue bottle"
                    className="w-full h-auto object-cover rounded-xl drop-shadow-xl"
                    loading="eager"
                  />
                </motion.div>

                {/* FLOATING CLAYMORPHIC BADGES (from media_1790322938874.png) */}
                {/* 1. Yellow Fashion Tag */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.45 }}
                  className="absolute top-10 left-16 sm:left-24 z-40 clay-pill-yellow px-3 py-1 rounded-full text-xs font-extrabold text-amber-950 flex items-center gap-1 shadow-sm"
                >
                  <span>🏷️</span>
                  <span>Fashion</span>
                </motion.div>

                {/* 2. White Accessories Tag */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute top-28 right-0 sm:right-2 z-40 clay-pill-white px-3 py-1 rounded-full text-xs font-bold text-stone-800 flex items-center gap-1.5 border border-sand-200"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
                  <span>Accessories</span>
                </motion.div>

                {/* 3. Yellow Home Tag */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.55 }}
                  className="absolute bottom-20 left-12 sm:left-20 z-40 clay-pill-yellow px-3 py-1 rounded-full text-xs font-extrabold text-amber-950 flex items-center gap-1"
                >
                  <span>🏠</span>
                  <span>Home</span>
                </motion.div>

                {/* 4. White Home Tag */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6 }}
                  className="absolute bottom-28 right-4 sm:right-8 z-40 clay-pill-white px-3 py-1 rounded-full text-xs font-bold text-stone-800 flex items-center gap-1 border border-sand-200"
                >
                  <Store className="w-3.5 h-3.5 text-blue-600" />
                  <span>Home</span>
                </motion.div>

                {/* 5. Blue Local Pill */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.65 }}
                  className="absolute bottom-10 right-28 sm:right-36 z-40 clay-pill-blue px-3.5 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1"
                >
                  <MapPin className="w-3.5 h-3.5 text-amber-300" />
                  <span>Local</span>
                </motion.div>

                {/* 6. Verified Badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7 }}
                  className="absolute bottom-10 right-4 sm:right-8 z-40 clay-pill-white px-3 py-1 rounded-full text-xs font-bold text-blue-700 flex items-center gap-1 border border-blue-200"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Verified</span>
                </motion.div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. THREE VALUE PILLARS STRIP (Discover, Buy, Sell) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="clay-card rounded-3xl p-6 sm:p-8 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-sand-200">
            {/* Pillar 1: Discover */}
            <div className="flex items-center gap-4 pt-3 md:pt-0">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                <Search className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-black text-stone-950 font-display">Discover</h3>
                <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                  Find unique products from local sellers around you.
                </p>
              </div>
            </div>

            {/* Pillar 2: Buy */}
            <div className="flex items-center gap-4 pt-4 md:pt-0 md:pl-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-black text-stone-950 font-display">Buy</h3>
                <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                  Shop directly from trusted local businesses.
                </p>
              </div>
            </div>

            {/* Pillar 3: Sell */}
            <div className="flex items-center gap-4 pt-4 md:pt-0 md:pl-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                <Store className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-black text-stone-950 font-display">Sell</h3>
                <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                  Create your store and reach local customers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CATEGORIES SECTION: "Find your thing." */}
      <section id="explore-local" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF08A] text-amber-950 border border-amber-300/80 text-[10px] sm:text-xs font-extrabold uppercase tracking-wider mb-2">
              <span>EXPLORE CATEGORIES</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-950 font-display tracking-tight">
              Find your thing.
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Browse products from local sellers across different categories.
            </p>
          </div>
          <Link
            to="/categories"
            className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group transition"
          >
            <span>View all categories</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </Link>
        </div>

        {/* 7 Claymorphic Category Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
          {categories.slice(0, 7).map((cat, idx) => {
            const bgTints = [
              'bg-blue-50/80 hover:bg-blue-100/70',
              'bg-indigo-50/80 hover:bg-indigo-100/70',
              'bg-amber-50/80 hover:bg-amber-100/70',
              'bg-rose-50/80 hover:bg-rose-100/70',
              'bg-sky-50/80 hover:bg-sky-100/70',
              'bg-emerald-50/80 hover:bg-emerald-100/70',
              'bg-purple-50/80 hover:bg-purple-100/70',
            ];
            const currentTint = bgTints[idx % bgTints.length];

            return (
              <Link
                key={cat.id}
                to={`/explore?category=${cat.slug}`}
                className={`group flex flex-col items-center p-3.5 rounded-3xl ${currentTint} border border-sand-200/90 shadow-2xs hover:shadow-soft hover:scale-[1.03] transition duration-300`}
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-white mb-2.5 border border-sand-200/80 shadow-2xs shrink-0">
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
                <div className="flex items-center gap-1 text-xs font-bold text-stone-800 group-hover:text-blue-600 transition">
                  <span className="truncate">{cat.name}</span>
                  <ChevronRight className="w-3 h-3 text-stone-400 group-hover:translate-x-0.5 transition" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. LOCAL PICKS / PRODUCT DISCOVERY: "Explore what's around you." */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF08A] text-amber-950 border border-amber-300/80 text-[10px] sm:text-xs font-extrabold uppercase tracking-wider mb-2">
              <span>LOCAL PICKS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-950 font-display tracking-tight">
              Explore what&apos;s around you.
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Discover products from verified sellers around {selectedCity}.
            </p>
          </div>

          <Link
            to={`/explore?city=${encodeURIComponent(selectedCity)}`}
            className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group transition"
          >
            <span>Explore more</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </Link>
        </div>

        {/* Real Product Feed or Curated Verified Spotlight */}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Visual preview matching mockup items (Canvas Tote Bag, Casual Sneakers, Minimal Necklace, Table Lamp) */}
            <div className="bg-white rounded-3xl p-3.5 border border-sand-200/90 shadow-2xs hover:shadow-soft transition group">
              <div className="relative aspect-[4/3.5] rounded-2xl overflow-hidden bg-sand-100 mb-3">
                <img
                  src="https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80"
                  alt="Canvas Tote Bag"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <button
                  type="button"
                  onClick={() => setWishlistLoved(!wishlistLoved)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-stone-600 hover:text-rose-500 shadow-2xs transition"
                  aria-label="Add to wishlist"
                >
                  <Heart className={`w-4 h-4 ${wishlistLoved ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>
              </div>
              <h3 className="text-sm font-bold text-stone-900 line-clamp-1">Canvas Tote Bag</h3>
              <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-blue-600" />
                <span>Local Seller • {selectedCity}</span>
              </p>
              <div className="mt-2.5 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FEF08A] text-amber-950 text-[10px] font-extrabold border border-amber-300/80">
                  <CheckCircle2 className="w-3 h-3 text-amber-700" />
                  <span>Verified</span>
                </span>
                <span className="text-xs font-bold text-blue-600 hover:underline cursor-pointer" onClick={() => navigate('/explore')}>
                  View item →
                </span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-3.5 border border-sand-200/90 shadow-2xs hover:shadow-soft transition group">
              <div className="relative aspect-[4/3.5] rounded-2xl overflow-hidden bg-sand-100 mb-3">
                <img
                  src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80"
                  alt="Casual Sneakers"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <button
                  type="button"
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-stone-600 hover:text-rose-500 shadow-2xs transition"
                  aria-label="Add to wishlist"
                >
                  <Heart className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-sm font-bold text-stone-900 line-clamp-1">Casual Sneakers</h3>
              <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-blue-600" />
                <span>Local Seller • {selectedCity}</span>
              </p>
              <div className="mt-2.5 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FEF08A] text-amber-950 text-[10px] font-extrabold border border-amber-300/80">
                  <CheckCircle2 className="w-3 h-3 text-amber-700" />
                  <span>Verified</span>
                </span>
                <span className="text-xs font-bold text-blue-600 hover:underline cursor-pointer" onClick={() => navigate('/explore')}>
                  View item →
                </span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-3.5 border border-sand-200/90 shadow-2xs hover:shadow-soft transition group">
              <div className="relative aspect-[4/3.5] rounded-2xl overflow-hidden bg-sand-100 mb-3">
                <img
                  src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80"
                  alt="Minimal Necklace"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <button
                  type="button"
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-stone-600 hover:text-rose-500 shadow-2xs transition"
                  aria-label="Add to wishlist"
                >
                  <Heart className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-sm font-bold text-stone-900 line-clamp-1">Minimal Necklace</h3>
              <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-blue-600" />
                <span>Local Seller • {selectedCity}</span>
              </p>
              <div className="mt-2.5 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FEF08A] text-amber-950 text-[10px] font-extrabold border border-amber-300/80">
                  <CheckCircle2 className="w-3 h-3 text-amber-700" />
                  <span>Verified</span>
                </span>
                <span className="text-xs font-bold text-blue-600 hover:underline cursor-pointer" onClick={() => navigate('/explore')}>
                  View item →
                </span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-3.5 border border-sand-200/90 shadow-2xs hover:shadow-soft transition group">
              <div className="relative aspect-[4/3.5] rounded-2xl overflow-hidden bg-sand-100 mb-3">
                <img
                  src="https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80"
                  alt="Table Lamp"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <button
                  type="button"
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-stone-600 hover:text-rose-500 shadow-2xs transition"
                  aria-label="Add to wishlist"
                >
                  <Heart className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-sm font-bold text-stone-900 line-clamp-1">Table Lamp</h3>
              <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-blue-600" />
                <span>Local Seller • {selectedCity}</span>
              </p>
              <div className="mt-2.5 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FEF08A] text-amber-950 text-[10px] font-extrabold border border-amber-300/80">
                  <CheckCircle2 className="w-3 h-3 text-amber-700" />
                  <span>Verified</span>
                </span>
                <span className="text-xs font-bold text-blue-600 hover:underline cursor-pointer" onClick={() => navigate('/explore')}>
                  View item →
                </span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 5. SOCIAL SELLER POSITIONING BANNER (CRITICAL SECTIONS 2, 15, 17, 40) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-blue-50/95 via-sky-50/80 to-indigo-50/90 border border-blue-200/90 p-6 sm:p-10 lg:p-12 shadow-soft-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: 3D Smartphone Illustration with Social Bubbles */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-56 sm:w-64">
                
                {/* Phone Body */}
                <div className="bg-stone-900 p-2.5 rounded-[36px] shadow-2xl border-4 border-stone-800">
                  <div className="bg-white rounded-[28px] overflow-hidden p-3 space-y-2.5">
                    {/* Phone Screen Header */}
                    <div className="flex items-center justify-between pb-1 border-b border-sand-100">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-black">
                          S
                        </div>
                        <span className="text-[10px] font-bold text-stone-800">your.store</span>
                      </div>
                      <span className="text-[8px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-full">
                        Live
                      </span>
                    </div>

                    {/* Phone Screen Product Drop */}
                    <div className="aspect-[4/3] rounded-xl overflow-hidden bg-sand-100">
                      <img
                        src="https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=400&q=80"
                        alt="Product feed"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Phone Screen 2x2 items */}
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <div className="aspect-square rounded-lg bg-sand-100 overflow-hidden">
                        <img
                          src="https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=200&q=80"
                          alt="Feed 1"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="aspect-square rounded-lg bg-sand-100 overflow-hidden">
                        <img
                          src="https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=200&q=80"
                          alt="Feed 2"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Instagram Bubble */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="absolute -top-3 -left-4 w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-lg cursor-pointer"
                >
                  <Instagram className="w-5 h-5 text-white" />
                </motion.div>

                {/* Floating WhatsApp Bubble */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="absolute top-20 -left-6 w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5 text-white" />
                </motion.div>

                {/* Floating Yellow Selluy Bag */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="absolute -bottom-2 -left-3 w-12 h-12 rounded-2xl bg-[#FACC15] text-amber-950 flex items-center justify-center shadow-xl font-black text-lg border-2 border-white"
                >
                  S
                </motion.div>

                {/* Small potted succulent */}
                <div className="absolute -bottom-2 -right-4 w-14 h-14 rounded-2xl overflow-hidden shadow-lg border-2 border-white">
                  <img
                    src="https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=200&q=80"
                    alt="Decor"
                    className="w-full h-full object-cover"
                  />
                </div>

              </div>
            </div>

            {/* Right: Exact Supporting Message and CTAs */}
            <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-[10px] sm:text-xs font-extrabold uppercase tracking-wider">
                <span>FOR SOCIAL SELLERS &amp; SMALL BUSINESSES</span>
              </div>

              {/* Exact Prominent Heading */}
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-950 font-display tracking-tight leading-tight">
                Already selling through Instagram, WhatsApp, or your own page?
              </h2>

              {/* Exact Prominent Supporting Text */}
              <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-normal max-w-xl">
                Bring your products to Selluy and reach local customers through a dedicated marketplace.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link to="/become-seller">
                  <button className="px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full shadow-md shadow-blue-500/20 transition text-sm flex items-center gap-2 cursor-pointer">
                    <span>Become a Seller</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>

                {/* Playful Tilted Stamp (from mockup) */}
                <div className="inline-flex items-center gap-1.5 text-xs font-black text-blue-700 bg-white/90 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-blue-200/80 shadow-2xs transform rotate-2">
                  <span className="text-amber-500">✨</span>
                  <span>Same products. Bigger audience.</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. LOCAL SELLERS DISCOVERY SECTION: "Meet the sellers behind the products." */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF08A] text-amber-950 border border-amber-300/80 text-[10px] sm:text-xs font-extrabold uppercase tracking-wider mb-2">
              <span>LOCAL SELLERS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-950 font-display tracking-tight">
              Meet the sellers behind the products.
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Discover small businesses and local sellers around your city.
            </p>
          </div>

          <Link
            to="/explore"
            className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group transition"
          >
            <span>View all sellers</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </Link>
        </div>

        {/* Sellers Grid (Real database sellers or genuine showcase stores) */}
        {localSellers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {localSellers.slice(0, 4).map((seller) => (
              <SellerCard key={seller.id} seller={seller} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {fallbackSellers.map((seller) => (
              <Link
                key={seller.id}
                to={`/explore?category=${seller.category.toLowerCase()}`}
                className="bg-white p-4 rounded-3xl border border-sand-200/90 shadow-2xs hover:shadow-soft transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-2xl ${seller.color} font-black text-sm flex items-center justify-center shadow-2xs`}>
                    {seller.initials}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-stone-900 group-hover:text-blue-600 transition flex items-center gap-1">
                      <span>{seller.store_name}</span>
                    </h3>
                    <div className="flex items-center gap-1 text-[10px] text-stone-500 mt-0.5">
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded-full border border-emerald-200">
                        ✓ Verified
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-400 block mt-0.5">
                      {seller.category} • {seller.city}
                    </span>
                  </div>
                </div>

                <div className="w-11 h-11 rounded-xl overflow-hidden bg-sand-100 shrink-0 border border-sand-200">
                  <img
                    src={seller.thumbnail}
                    alt={seller.store_name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 7. BOTTOM SELLER BANNER: "Have something to sell?" */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#2563EB] text-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-lg shadow-blue-600/20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xs text-white flex items-center justify-center shrink-0 border border-white/20">
              <Send className="w-6 h-6 text-amber-300 transform -rotate-12" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black font-display tracking-tight text-white">
                Have something to sell?
              </h3>
              <p className="text-xs sm:text-sm text-blue-100 max-w-lg mt-0.5">
                Turn your passion into a business. List your products and connect with local customers.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <Link to="/become-seller">
              <button className="px-6 py-3 bg-[#FACC15] hover:bg-amber-300 text-stone-950 font-black rounded-full shadow-md text-xs sm:text-sm tracking-wide transition cursor-pointer flex items-center gap-1.5">
                <span>Become a Seller</span>
                <span>→</span>
              </button>
            </Link>

            {/* 3D Yellow Shopping Bag graphic */}
            <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-[#FDE047] text-blue-900 font-black text-xl items-center justify-center shadow-md transform rotate-6 border border-white/40">
              S
            </div>
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
