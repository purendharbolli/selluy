import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
  Users,
  Smartphone,
  Zap,
  Building2,
  Lock,
  Compass,
  Star,
  Clock,
  Heart,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SelluyLogo } from '../common/SelluyLogo';
import { AuthModal } from '../auth/AuthModal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { marketplaceService } from '../../services/marketplaceService';

export const LoggedOutLanding: React.FC = () => {
  const { sendOtp } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalPhone, setAuthModalPhone] = useState('');
  const [authModalStep, setAuthModalStep] = useState<'phone' | 'otp'>('phone');

  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeCityTab, setActiveCityTab] = useState('Bengaluru');

  const categories = marketplaceService.getCategories();

  // Handle hero 1-click OTP request -> directly opens AuthModal on Step 2 (OTP)
  const handleHeroQuickOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = phone.replace(/\D/g, '');
    if (clean.length !== 10 || !/^[6-9]\d{9}$/.test(clean)) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await sendOtp(clean);
      if (res.success) {
        // Pre-fill phone and advance to OTP step immediately
        setAuthModalPhone(clean);
        setAuthModalStep('otp');
        setIsAuthModalOpen(true);
      } else {
        setErrorMsg(res.error || 'Failed to send OTP.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // General auth modal opening for navbar/button clicks
  const handleOpenGeneralAuth = () => {
    setAuthModalPhone('');
    setAuthModalStep('phone');
    setIsAuthModalOpen(true);
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-20 overflow-hidden">
      {/* 1. HERO SECTION (motion.dev + kokonut ui + shadcn layout) */}
      <section className="relative overflow-hidden pt-8 pb-16 sm:pt-14 sm:pb-24 bg-[#FAFBFD] border-b border-sand-200/60">
        {/* Ambient atmospheric gradients & dot grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:28px_28px] opacity-40 pointer-events-none -z-10" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 left-10 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* LEFT COLUMN: Brand Manifesto, Headline & 1-Click OTP (7 cols) */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              {/* Identity Tagline Radar Pill */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2"
              >
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white shadow-soft-sm border border-blue-200/90 text-blue-700 text-xs font-bold">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
                  </span>
                  <span>India&apos;s Local-First Indie Commerce</span>
                  <span className="text-stone-300">•</span>
                  <span className="text-stone-600 font-semibold">Live in 5+ Cities</span>
                </div>
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-stone-950 font-display leading-[1.08]"
              >
                Discover local. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500">
                  Buy direct from creators.
                </span>
              </motion.h1>

              {/* Value Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-base sm:text-lg text-stone-600 font-normal leading-relaxed max-w-xl mx-auto lg:mx-0"
              >
                Skip mass warehouses and faceless reseller algorithms. Connect directly with verified independent ceramicists, weavers, artists, and studios in your city.
              </motion.p>

              {/* 1-Click Fast OTP Box (Kokonut UI Glowing Card) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="max-w-md mx-auto lg:mx-0 relative group pt-2"
              >
                {/* Glow border ring */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-400 rounded-3xl blur-xs opacity-40 group-hover:opacity-65 transition duration-500" />

                <div className="relative bg-white rounded-3xl p-5 sm:p-6 shadow-xl border border-sand-200 text-left">
                  <div className="flex items-center justify-between mb-3.5">
                    <div>
                      <h3 className="text-sm font-black text-stone-900 tracking-tight">
                        Instant Access with Mobile Number
                      </h3>
                      <p className="text-[11px] text-stone-500">10-second OTP login • Zero password hassles</p>
                    </div>
                    <Badge variant="brand" size="sm" dot>
                      One-Click
                    </Badge>
                  </div>

                  <form onSubmit={handleHeroQuickOtp} className="space-y-3">
                    <div className="flex items-center rounded-2xl border border-sand-300 focus-within:ring-2 focus-within:ring-blue-500/40 focus-within:border-blue-600 bg-sand-50/60 overflow-hidden shadow-xs transition">
                      <span className="px-3.5 py-3 text-xs font-bold text-stone-700 border-r border-sand-200 bg-sand-100/70 select-none">
                        🇮🇳 +91
                      </span>
                      <input
                        type="tel"
                        placeholder="Enter 10-digit mobile number"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                          setErrorMsg('');
                        }}
                        className="w-full px-3.5 py-3 text-sm font-semibold text-stone-900 bg-transparent focus:outline-none placeholder-stone-400"
                        maxLength={10}
                      />
                    </div>

                    {errorMsg && (
                      <p className="text-[11px] text-rose-600 font-medium">{errorMsg}</p>
                    )}

                    <Button
                      type="submit"
                      disabled={isLoading || phone.length !== 10}
                      isLoading={isLoading}
                      size="md"
                      className="w-full py-3 shadow-md bg-blue-600 hover:bg-blue-700 text-white font-bold"
                    >
                      Continue with OTP
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </form>

                  <div className="mt-3.5 pt-3 border-t border-sand-100 flex items-center justify-between text-[11px] text-stone-500">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      100% Vetted Studios
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      Direct Studio Pricing
                    </span>
                    <span className="flex items-center gap-1">
                      <PackageCheck className="w-3.5 h-3.5 text-blue-600" />
                      Zero Dropshipping
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Quick Action Link Pills */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-1"
              >
                <button
                  type="button"
                  onClick={handleOpenGeneralAuth}
                  className="text-xs font-bold text-stone-700 hover:text-blue-600 inline-flex items-center gap-1 transition cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
                  <span>Browse as Customer</span>
                  <ChevronRight className="w-3 h-3 text-stone-400" />
                </button>
                <span className="text-stone-300">•</span>
                <Link
                  to="/seller/onboarding"
                  className="text-xs font-bold text-stone-700 hover:text-blue-600 inline-flex items-center gap-1 transition"
                >
                  <Store className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Apply to Sell Your Craft</span>
                  <ChevronRight className="w-3 h-3 text-stone-400" />
                </Link>
              </motion.div>
            </div>

            {/* RIGHT COLUMN: Interactive Local Discovery Bento & Live Studio Stage (5 cols) */}
            <div className="lg:col-span-5 relative">
              {/* Main Artisan Showcase Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="relative bg-white rounded-3xl p-4 sm:p-5 shadow-2xl border border-sand-200/90 overflow-hidden"
              >
                {/* Hero Product Visual with Studio badge */}
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-sand-100 mb-4 group">
                  <img
                    src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80"
                    alt="Hand-thrown terracotta vase"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent pointer-events-none" />

                  {/* Live Studio Status Chip */}
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900/80 backdrop-blur-md text-white text-[11px] font-bold border border-white/20 shadow-md">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      Kiln Fired Yesterday • 3 In Stock
                    </span>
                  </div>

                  {/* Studio identity banner at bottom of photo */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-sm tracking-tight">Aura Ceramics Studio</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 fill-blue-400/20" />
                      </div>
                      <span className="text-[11px] text-stone-200 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-stone-300" />
                        Indiranagar, Bengaluru
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-black text-white">₹1,450</span>
                      <span className="text-[10px] text-stone-300 block line-through">₹2,200</span>
                    </div>
                  </div>
                </div>

                {/* City Hub Interactive Selector */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                    <span className="flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5 text-blue-600" />
                      Explore Local Studios Near:
                    </span>
                    <span className="text-[11px] text-blue-600 font-semibold">5 Hubs Active</span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 text-center">
                    {[
                      { city: 'Bengaluru', count: '14' },
                      { city: 'Hyderabad', count: '12' },
                      { city: 'Jaipur', count: '18' },
                      { city: 'Mumbai', count: '9' },
                    ].map((hub) => (
                      <button
                        key={hub.city}
                        type="button"
                        onClick={() => setActiveCityTab(hub.city)}
                        className={`py-1.5 px-1 rounded-xl text-[11px] font-bold transition cursor-pointer border ${
                          activeCityTab === hub.city
                            ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-2xs'
                            : 'bg-sand-50 text-stone-600 border-sand-200 hover:bg-sand-100'
                        }`}
                      >
                        <span className="block truncate">{hub.city}</span>
                        <span className="text-[9px] font-medium text-stone-500">{hub.count} studios</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Floating Pill A: Live Dispatch Ticker (motion.dev subtle float) */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="absolute -top-4 -right-2 sm:-right-4 hidden sm:flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/95 backdrop-blur-md border border-sand-200/90 shadow-xl text-xs font-bold text-stone-800"
              >
                <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <PackageCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-extrabold text-stone-900 leading-tight">
                    Order Packed in Jaipur
                  </div>
                  <span className="text-[10px] text-stone-500 font-normal">Handloom Silk Saree • 3m ago</span>
                </div>
              </motion.div>

              {/* Floating Pill B: 100% Direct Trade Guarantee */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="absolute -bottom-4 -left-2 sm:-left-4 hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-stone-950 text-white shadow-xl text-xs font-bold border border-stone-800"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>GST &amp; Studio Inspected Makers</span>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. CATEGORY PREVIEW STRIP (Verified images & instant navigation) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Badge variant="brand" size="sm" className="mb-1">
              Curated Collections
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-950 font-display">
              Shop by Craftsmanship
            </h2>
          </div>
          <Link
            to="/categories"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
          >
            <span>All Categories</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3.5">
          {categories.slice(0, 8).map((cat) => (
            <Link
              key={cat.id}
              to={`/explore?category=${cat.slug}`}
              className="group flex flex-col items-center p-3 rounded-2xl bg-white border border-sand-200/90 shadow-2xs hover:shadow-soft hover:border-blue-300 transition duration-200"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-sand-100 mb-2 border border-sand-100 shrink-0">
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

      {/* 3. KOKONUT UI STYLE BENTO GRID: THE SELLUY PILLARS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="brand" size="md" className="mb-2">
            The Selluy Standard
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-black text-stone-950 font-display mt-1">
            Built for Real Local Commerce
          </h2>
          <p className="text-stone-600 text-sm mt-2">
            We replaced anonymous dropshipping and fake hype with verified identity, direct craftsmanship, and city-first discovery.
          </p>
        </div>

        {/* Bento Box Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Bento Item 1: Large Span (7 cols) - Two-Sided Moderation */}
          <div className="md:col-span-7 bg-white rounded-3xl p-7 sm:p-9 border border-sand-200/90 shadow-soft-sm hover:shadow-soft-lg transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6 text-blue-600" />
              </div>
              <Badge variant="success" size="sm" dot className="mb-3">
                100% Manually Vetted
              </Badge>
              <h3 className="text-xl sm:text-2xl font-black text-stone-950 font-display mb-2">
                Two-Sided Moderation &amp; Zero Fake Products
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-xl">
                Sellers must apply with GST/Aadhaar identity and workshop proof. Products are reviewed before going live. If a city has zero verified sellers yet, we show an honest zero-state instead of fake mock products.
              </p>
            </div>

            {/* Micro visual widget */}
            <div className="mt-8 pt-6 border-t border-sand-100 flex flex-wrap items-center gap-4 text-xs font-semibold text-stone-700">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Verified Seller Badge
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-200">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                Product Review Flow
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-800 border border-purple-200">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                Zero Fake Sales Simulators
              </div>
            </div>
          </div>

          {/* Bento Item 2: Medium Span (5 cols) - Local Discovery */}
          <div className="md:col-span-5 bg-gradient-to-br from-indigo-900 via-stone-900 to-stone-950 text-white rounded-3xl p-7 sm:p-9 shadow-soft-md flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/10 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform backdrop-blur-md">
                <MapPin className="w-6 h-6 text-indigo-300" />
              </div>
              <Badge variant="secondary" size="sm" className="bg-white/10 text-indigo-200 border-white/20 mb-3">
                City-First Discovery
              </Badge>
              <h3 className="text-xl sm:text-2xl font-black text-white font-display mb-2">
                Discover Creators Near You
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                Connect directly with independent clothing studios, handcrafted jewelry makers, and artisans operating in your city.
              </p>
            </div>

            {/* City chips preview */}
            <div className="relative z-10 mt-8 flex flex-wrap gap-2">
              {['Hyderabad', 'Bengaluru', 'Chennai', 'Mumbai', 'Jaipur'].map((c) => (
                <span
                  key={c}
                  className="px-2.5 py-1 rounded-full bg-white/10 text-[11px] font-semibold text-stone-200 border border-white/15"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* Bento Item 3: Medium Span (5 cols) - Direct Studio Shopping */}
          <div className="md:col-span-5 bg-white rounded-3xl p-7 sm:p-9 border border-sand-200/90 shadow-soft-sm hover:shadow-soft-lg transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-6 h-6 text-amber-600" />
              </div>
              <Badge variant="warning" size="sm" dot className="mb-3">
                Direct Pricing
              </Badge>
              <h3 className="text-xl sm:text-2xl font-black text-stone-950 font-display mb-2">
                Direct from Studio to Doorstep
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                No middleman markups, hidden listing fees, or messy Instagram DMs. Buy directly from makers with seamless checkout.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-sand-100 flex items-center justify-between text-xs text-stone-500">
              <span>Fair creator payouts</span>
              <span className="font-bold text-stone-900">Direct creator relationship</span>
            </div>
          </div>

          {/* Bento Item 4: Large Span (7 cols) - Transparent Tracking */}
          <div className="md:col-span-7 bg-white rounded-3xl p-7 sm:p-9 border border-sand-200/90 shadow-soft-sm hover:shadow-soft-lg transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <PackageCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <Badge variant="success" size="sm" dot className="mb-3">
                Full Lifecycle Trust
              </Badge>
              <h3 className="text-xl sm:text-2xl font-black text-stone-950 font-display mb-2">
                Order Tracking with Real Seller Updates
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-xl">
                Track your order from craftsmanship to courier dispatch. Sellers manage their fulfillment pipeline through the Selluy Studio.
              </p>
            </div>

            {/* Visual pipeline steps */}
            <div className="mt-8 pt-6 border-t border-sand-100 grid grid-cols-4 gap-2 text-center">
              <div className="p-2 rounded-xl bg-sand-100/70">
                <span className="block text-[10px] text-stone-500 font-bold uppercase">1. Placed</span>
                <span className="text-xs font-bold text-stone-800">Confirmed</span>
              </div>
              <div className="p-2 rounded-xl bg-blue-50 border border-blue-200">
                <span className="block text-[10px] text-blue-600 font-bold uppercase">2. Studio</span>
                <span className="text-xs font-bold text-blue-900">Crafting</span>
              </div>
              <div className="p-2 rounded-xl bg-sand-100/70">
                <span className="block text-[10px] text-stone-500 font-bold uppercase">3. Transit</span>
                <span className="text-xs font-bold text-stone-800">Dispatched</span>
              </div>
              <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="block text-[10px] text-emerald-600 font-bold uppercase">4. Arrival</span>
                <span className="text-xs font-bold text-emerald-900">Delivered</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW SELLUY WORKS (Interactive 3-Step Journey) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-4xl p-8 sm:p-14 border border-sand-200 shadow-soft">
          <div className="text-center max-w-xl mx-auto mb-12">
            <Badge variant="brand" size="md" className="mb-2">
              Simple &amp; Fast
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-950 font-display mt-1">
              How Selluy Works
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Three clear steps to discover and buy directly from authentic local studios.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="text-center sm:text-left flex flex-col items-center sm:items-start p-6 rounded-3xl bg-sand-50/60 border border-sand-200/80 hover:border-blue-300 transition"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-base flex items-center justify-center mb-4 shadow-sm">
                1
              </div>
              <h4 className="text-base font-extrabold text-stone-950 mb-1.5">Pick Your City</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Select your Indian city to uncover independent clothing brands, ceramics, handcrafted jewelry, and lifestyle creators in your area.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="text-center sm:text-left flex flex-col items-center sm:items-start p-6 rounded-3xl bg-sand-50/60 border border-sand-200/80 hover:border-indigo-300 transition"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-base flex items-center justify-center mb-4 shadow-sm">
                2
              </div>
              <h4 className="text-base font-extrabold text-stone-950 mb-1.5">Review Verified Crafts</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Inspect verified seller badges, real material specifications, authentic studio imagery, and community feedback.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="text-center sm:text-left flex flex-col items-center sm:items-start p-6 rounded-3xl bg-sand-50/60 border border-sand-200/80 hover:border-blue-300 transition"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-base flex items-center justify-center mb-4 shadow-sm">
                3
              </div>
              <h4 className="text-base font-extrabold text-stone-950 mb-1.5">Order Direct</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Place direct orders through a unified bag experience and receive real fulfillment updates straight from the creator.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. BECOME A SELLER CTA BANNER (bklit inspired luxury dark contrast) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 text-white rounded-4xl p-8 sm:p-14 border border-stone-800 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Subtle glow orb */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-xl space-y-3 relative z-10">
            <Badge variant="brand" size="md" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
              <Store className="w-3.5 h-3.5 mr-1" />
              Creator &amp; Studio Community
            </Badge>
            <h3 className="text-2xl sm:text-4xl font-black font-display tracking-tight text-white leading-tight">
              Have something to sell? <br />
              Reach customers around your city.
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Launch your storefront on Selluy. Connect with local shoppers looking for handmade, designer, and authentic independent goods.
            </p>
          </div>

          <div className="shrink-0 w-full sm:w-auto relative z-10">
            <Link to="/seller/onboarding" className="w-full sm:w-auto block">
              <Button
                size="lg"
                className="w-full sm:w-auto px-8 py-3.5 shadow-lg bg-blue-600 hover:bg-blue-500 text-white font-bold"
              >
                <span>Apply as Seller</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ONE-CLICK AUTH MODAL: Preserves phone and directly opens step 2 if triggered from hero */}
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
