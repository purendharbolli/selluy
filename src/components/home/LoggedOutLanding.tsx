import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin,
  ShoppingBag,
  ArrowRight,
  Store,
  CheckCircle2,
  ChevronRight,
  Heart,
  Search,
  Send,
  Sparkles,
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { marketplaceService } from '../../services/marketplaceService';
import { ProductCard } from '../product/ProductCard';
import { LocationModal } from '../common/LocationModal';
import { AuthModal } from '../auth/AuthModal';
import { ShoppingAtmosphere } from '../common/ShoppingAtmosphere';
import { Product, SellerProfile } from '../../types';

export const LoggedOutLanding: React.FC = () => {
  const navigate = useNavigate();
  const { selectedCity } = useLocation();

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalPhone, setAuthModalPhone] = useState('');
  const [authModalStep, setAuthModalStep] = useState<'password-login' | 'otp-phone'>('password-login');

  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  const [wishlistLoved, setWishlistLoved] = useState<Record<string, boolean>>({});

  const toggleWishlist = (id: string) => {
    setWishlistLoved((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Sync real database products and sellers dynamically based on selectedCity
  useEffect(() => {
    const loadData = () => {
      setLocalProducts(marketplaceService.getPublicProducts(selectedCity));
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

  // 7 Categories strictly matching the mockup with ultra-sharp, high-definition studio imagery
  const mockupCategories = [
    {
      name: 'Fashion',
      image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=600&q=85',
      slug: 'fashion',
      accent: 'border-amber-400 ring-2 ring-amber-300/40',
    },
    {
      name: 'Accessories',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=85',
      slug: 'accessories',
      accent: 'border-stone-200/80',
    },
    {
      name: 'Home',
      image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=600&q=85',
      slug: 'home-decor',
      accent: 'border-stone-200/80',
    },
    {
      name: 'Beauty',
      image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=85',
      slug: 'beauty',
      accent: 'border-stone-200/80',
    },
    {
      name: 'Electronics',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=85',
      slug: 'electronics',
      accent: 'border-stone-200/80',
    },
    {
      name: 'Lifestyle',
      image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=85',
      slug: 'lifestyle',
      accent: 'border-stone-200/80',
    },
    {
      name: 'Gifts',
      image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=85',
      slug: 'gifts',
      accent: 'border-stone-200/80',
    },
  ];

  // 4 Local Picks matching the mockup with ultra-sharp high-definition photography
  const mockupPicks = [
    {
      id: 'pick-tote',
      title: 'Canvas Tote Bag',
      image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=85',
      seller: 'Local Seller',
      city: selectedCity || 'Hyderabad',
    },
    {
      id: 'pick-sneakers',
      title: 'Casual Sneakers',
      image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=85',
      seller: 'Local Seller',
      city: selectedCity || 'Hyderabad',
    },
    {
      id: 'pick-necklace',
      title: 'Minimal Necklace',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=85',
      seller: 'Local Seller',
      city: selectedCity || 'Hyderabad',
    },
    {
      id: 'pick-lamp',
      title: 'Table Lamp',
      image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=85',
      seller: 'Local Seller',
      city: selectedCity || 'Hyderabad',
    },
  ];

  // 4 Local Sellers strictly matching the mockup
  const mockupSellers = [
    {
      id: 'the-cozy-home',
      name: 'The Cozy Home',
      initials: 'The',
      initialsBg: 'bg-stone-800 text-stone-100',
      category: 'Home',
      city: selectedCity || 'Hyderabad',
      preview: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=300&q=85',
    },
    {
      id: 'stylekraft',
      name: 'StyleKraft',
      initials: 'Style',
      initialsBg: 'bg-indigo-900 text-indigo-100',
      category: 'Fashion',
      city: selectedCity || 'Hyderabad',
      preview: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=300&q=85',
    },
    {
      id: 'pure-glow',
      name: 'Pure & Glow',
      initials: 'PG',
      initialsBg: 'bg-amber-600 text-white',
      category: 'Beauty',
      city: selectedCity || 'Hyderabad',
      preview: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=300&q=85',
    },
    {
      id: 'technest',
      name: 'TechNest',
      initials: 'TN',
      initialsBg: 'bg-slate-900 text-slate-100',
      category: 'Electronics',
      city: selectedCity || 'Hyderabad',
      preview: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=85',
    },
  ];

  return (
    <div className="relative space-y-12 sm:space-y-16 pb-20 overflow-hidden bg-[#FAFBFF]">
      {/* Art-directed shopping atmosphere in background */}
      <ShoppingAtmosphere />

      {/* 1. HERO SECTION (BLUE + YELLOW COMMERCE ACCENT + ULTRA HD 3D CLAYMORPHIC PRODUCT CLUSTER) */}
      <section className="relative overflow-hidden pt-6 pb-8 sm:pt-10 sm:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
            
            {/* LEFT COLUMN: Clear Commerce Hierarchy */}
            <div className="lg:col-span-6 text-center lg:text-left space-y-5">
              
              {/* Eyebrow: SELLOI • LOCAL MARKETPLACE */}
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="inline-flex items-center gap-2"
              >
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FEF08A] text-amber-950 border border-amber-300/80 text-[10px] sm:text-xs font-extrabold uppercase tracking-wider shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>SELLOI • LOCAL MARKETPLACE</span>
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
                <span className="text-[#2563EB] relative inline-block">
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
                className="text-base sm:text-xl font-bold text-stone-800 tracking-tight leading-snug"
              >
                A flexible marketplace built for social sellers and small businesses.
              </motion.h2>

              {/* Supporting Paragraph */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.24 }}
                className="text-xs sm:text-sm text-stone-600 font-normal leading-relaxed max-w-lg mx-auto lg:mx-0"
              >
                Discover products around you, buy directly from local sellers, or bring your own products to Selloi.
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
                  className="w-full sm:w-auto px-7 py-3.5 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-full shadow-md shadow-blue-500/25 transition group text-sm tracking-wide flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Start Shopping</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </button>

                <Link
                  to="/become-seller"
                  className="w-full sm:w-auto px-7 py-3.5 bg-white text-stone-900 hover:bg-stone-50 rounded-full border border-stone-200 shadow-2xs font-bold transition text-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Become a Seller</span>
                  <span className="text-[#FACC15] font-black">→</span>
                </Link>
              </motion.div>

              {/* Small Supporting Brand Statement */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="pt-1 flex items-center justify-center lg:justify-start gap-2 text-xs font-semibold text-stone-500"
              >
                <MapPin className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                <span>Discover local. Buy direct.</span>
              </motion.div>
            </div>

            {/* RIGHT COLUMN: Ultra-HD 4K 3D Claymorphic Product Cluster */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="relative w-full max-w-[580px] mx-auto select-none"
              >
                {/* Luminous Warm Light Glow Behind Cluster */}
                <div className="absolute inset-0 bg-radial from-amber-300/30 via-amber-200/15 to-transparent rounded-full blur-2xl transform scale-110 pointer-events-none" />

                {/* Ultra High-Resolution 1200x896 3D Product Composition */}
                <img
                  src="/homepage/hero-cluster.png"
                  alt="Selloi local marketplace products cluster"
                  className="relative z-10 w-full h-auto object-contain drop-shadow-2xl"
                  loading="eager"
                />
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. THREE VALUE PILLARS STRIP (Discover, Buy, Sell) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-5 sm:p-6 bg-white border border-stone-200/80 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-stone-100">
            {/* Pillar 1: Discover */}
            <div className="flex items-center gap-4 pt-2 md:pt-0">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0 border border-blue-100">
                <Search className="w-5 h-5 text-[#2563EB]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-stone-950 font-display">Discover</h3>
                <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                  Find unique products from local sellers around you.
                </p>
              </div>
            </div>

            {/* Pillar 2: Buy */}
            <div className="flex items-center gap-4 pt-3 md:pt-0 md:pl-6">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0 border border-blue-100">
                <ShoppingBag className="w-5 h-5 text-[#2563EB]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-stone-950 font-display">Buy</h3>
                <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                  Shop directly from trusted local businesses.
                </p>
              </div>
            </div>

            {/* Pillar 3: Sell */}
            <div className="flex items-center gap-4 pt-3 md:pt-0 md:pl-6">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0 border border-blue-100">
                <Store className="w-5 h-5 text-[#2563EB]" />
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
        <div className="flex items-end justify-between mb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF08A] text-amber-950 border border-amber-300/80 text-[10px] sm:text-xs font-extrabold uppercase tracking-wider mb-2">
              <span>EXPLORE CATEGORIES</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-950 font-display tracking-tight">
              Find your thing.
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
              Browse products from local sellers across different categories.
            </p>
          </div>
          <Link
            to="/categories"
            className="text-xs sm:text-sm font-bold text-[#2563EB] hover:text-blue-700 flex items-center gap-1 group transition"
          >
            <span>View all categories</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </Link>
        </div>

        {/* 7 Ultra-Sharp Studio Category Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
          {mockupCategories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/explore?category=${cat.slug}`}
              className={`group flex flex-col items-center p-3 rounded-2xl bg-white border ${cat.accent} shadow-2xs hover:shadow-soft hover:scale-[1.03] transition duration-300`}
            >
              <div className="w-full aspect-square rounded-xl overflow-hidden bg-stone-50 mb-2 flex items-center justify-center p-1">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition duration-300"
                  loading="lazy"
                />
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-stone-800 group-hover:text-[#2563EB] transition">
                <span>{cat.name}</span>
                <span className="text-amber-500 font-bold">›</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. LOCAL PICKS / PRODUCT DISCOVERY: "Explore what's around you." */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF08A] text-amber-950 border border-amber-300/80 text-[10px] sm:text-xs font-extrabold uppercase tracking-wider mb-2">
              <span>LOCAL PICKS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-950 font-display tracking-tight">
              Explore what&apos;s around you.
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
              Discover products from verified sellers around {selectedCity}.
            </p>
          </div>

          <Link
            to={`/explore?city=${encodeURIComponent(selectedCity)}`}
            className="text-xs sm:text-sm font-bold text-[#2563EB] hover:text-blue-700 flex items-center gap-1 group transition"
          >
            <span>Explore more</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </Link>
        </div>

        {/* 4 Ultra-Sharp Local Pick Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {mockupPicks.map((pick) => {
            const isLoved = wishlistLoved[pick.id];
            return (
              <div
                key={pick.id}
                className="bg-white rounded-3xl p-3 border border-stone-200/90 shadow-2xs hover:shadow-soft transition group"
              >
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-stone-100 mb-3 flex items-center justify-center">
                  <img
                    src={pick.image}
                    alt={pick.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    loading="lazy"
                  />
                  <button
                    type="button"
                    onClick={() => toggleWishlist(pick.id)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-stone-500 hover:text-rose-500 shadow-2xs transition cursor-pointer"
                    aria-label="Add to wishlist"
                  >
                    <Heart className={`w-3.5 h-3.5 ${isLoved ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>
                </div>

                <h3 className="text-sm font-bold text-stone-950 line-clamp-1">{pick.title}</h3>
                
                <p className="text-[11px] text-stone-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#2563EB]" />
                  <span>{pick.seller}</span>
                </p>
                <p className="text-[11px] text-stone-400 pl-4">
                  {pick.city}
                </p>

                <div className="mt-2 pt-1 border-t border-stone-100 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FEF08A] text-amber-950 text-[10px] font-extrabold border border-amber-300/80">
                    <CheckCircle2 className="w-3 h-3 text-amber-700" />
                    <span>Verified</span>
                  </span>
                  <Link
                    to="/explore"
                    className="text-xs font-bold text-[#2563EB] hover:underline"
                  >
                    View item →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic database listings if available */}
        {localProducts.length > 4 && (
          <div className="mt-6 pt-6 border-t border-stone-200">
            <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-4">
              More Fresh Listings from {selectedCity}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {localProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} highlightCity={selectedCity} />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 5. SOCIAL SELLER POSITIONING BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-4xl bg-[#EDF4FF] border border-blue-100 p-6 sm:p-10 lg:p-10 shadow-soft-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Ultra-HD 1200x896 3D Smartphone Illustration */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="relative w-full max-w-[320px] select-none"
              >
                <img
                  src="/homepage/social-phone.png"
                  alt="Sell from Instagram and WhatsApp on Selloi"
                  className="w-full h-auto object-contain drop-shadow-xl"
                  loading="lazy"
                />
              </motion.div>
            </div>

            {/* Center: Exact Headline and Supporting Text */}
            <div className="lg:col-span-4 space-y-3 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-100 text-blue-900 text-[10px] sm:text-xs font-extrabold uppercase tracking-wider">
                <span>FOR SOCIAL SELLERS &amp; SMALL BUSINESSES</span>
              </div>

              {/* Exact Prominent Heading */}
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-stone-950 font-display tracking-tight leading-snug">
                Already selling through Instagram, WhatsApp, or your own page?
              </h2>

              {/* Exact Prominent Supporting Text */}
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                Bring your products to Selloi and reach local customers through a dedicated marketplace.
              </p>

              <div className="pt-2 flex justify-center lg:justify-start">
                <Link to="/become-seller">
                  <button className="px-6 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-full shadow-md shadow-blue-500/20 transition text-xs sm:text-sm flex items-center gap-2 cursor-pointer">
                    <span>Become a Seller</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </div>

            {/* Right: Crisp Vector Sparkle Stamp Badge (Same products. Bigger audience.) */}
            <div className="lg:col-span-3 flex items-center justify-center lg:justify-end">
              <motion.div
                whileHover={{ rotate: -2, scale: 1.05 }}
                className="transform -rotate-6 select-none text-right p-4 bg-white/60 backdrop-blur-xs rounded-2xl border border-blue-200/60 shadow-2xs"
              >
                <div className="text-blue-600 font-extrabold text-base sm:text-lg font-display leading-tight flex items-center justify-end gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
                  <span>Same products.</span>
                </div>
                <div className="text-blue-700 font-black text-lg sm:text-xl font-display tracking-tight underline decoration-amber-400 decoration-4">
                  Bigger audience.
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. LOCAL SELLERS DISCOVERY SECTION: "Meet the sellers behind the products." */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF08A] text-amber-950 border border-amber-300/80 text-[10px] sm:text-xs font-extrabold uppercase tracking-wider mb-2">
              <span>LOCAL SELLERS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-950 font-display tracking-tight">
              Meet the sellers behind the products.
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
              Discover small businesses and local sellers around your city.
            </p>
          </div>

          <Link
            to="/explore"
            className="text-xs sm:text-sm font-bold text-[#2563EB] hover:text-blue-700 flex items-center gap-1 group transition"
          >
            <span>View all sellers</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </Link>
        </div>

        {/* 4 Clean Mockup-Exact Seller Cards with High-Res Previews */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockupSellers.map((seller) => (
            <Link
              key={seller.id}
              to={`/explore?category=${seller.category.toLowerCase()}`}
              className="bg-white p-3.5 rounded-3xl border border-stone-200/90 shadow-2xs hover:shadow-soft transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl ${seller.initialsBg} font-black text-xs flex items-center justify-center shadow-2xs`}>
                  {seller.initials}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-stone-900 group-hover:text-[#2563EB] transition flex items-center gap-1">
                    <span>{seller.name}</span>
                  </h3>
                  <div className="flex items-center gap-1 text-[10px] text-stone-500 mt-0.5">
                    <span className="text-[#2563EB] font-bold bg-blue-50 px-1.5 py-0.2 rounded-full border border-blue-100 flex items-center gap-0.5">
                      <span>✓</span>
                      <span>Verified</span>
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-400 block mt-0.5">
                    {seller.category} • {seller.city}
                  </span>
                </div>
              </div>

              <div className="w-11 h-11 rounded-xl overflow-hidden bg-stone-50 shrink-0 border border-stone-200 flex items-center justify-center">
                <img
                  src={seller.preview}
                  alt={seller.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                  loading="lazy"
                />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 7. BOTTOM SELLER BANNER: "Have something to sell?" */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#1D4ED8] bg-gradient-to-r from-[#1E40AF] via-[#1D4ED8] to-[#2563EB] text-white rounded-3xl p-6 sm:p-7 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-md shadow-blue-900/10">
          
          {/* Left: Airplane Icon + Text */}
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-xs text-white flex items-center justify-center shrink-0 border border-white/20">
              <Send className="w-5 h-5 text-[#FACC15] transform -rotate-12" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black font-display tracking-tight text-white">
                Have something to sell?
              </h3>
              <p className="text-xs text-blue-100 max-w-lg mt-0.5">
                Turn your passion into a business. List your products &amp; selling and connect with local customers.
              </p>
            </div>
          </div>

          {/* Right: Yellow Button + 3D Yellow Bag */}
          <div className="flex items-center gap-5 shrink-0">
            <Link to="/become-seller">
              <button className="px-6 py-2.5 bg-[#FACC15] hover:bg-amber-300 text-stone-950 font-black rounded-full shadow-sm text-xs sm:text-sm tracking-wide transition cursor-pointer flex items-center gap-1.5">
                <span>Become a Seller</span>
                <span>→</span>
              </button>
            </Link>

            {/* 3D Yellow Bag Illustration (Ultra-HD Studio Render) */}
            <div className="hidden sm:block w-16 h-14 relative shrink-0">
              <img
                src="/homepage/banner-yellow-bag-transparent.png"
                alt="Selloi Bag"
                className="w-full h-full object-contain filter drop-shadow-md select-none"
              />
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
