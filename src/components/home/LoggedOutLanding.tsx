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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SelluyLogo } from '../common/SelluyLogo';
import { AuthModal } from '../auth/AuthModal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';

export const LoggedOutLanding: React.FC = () => {
  const { sendOtp } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleHeroQuickOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10 || !/^[6-9]\d{9}$/.test(phone)) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await sendOtp(phone);
      if (res.success) {
        setIsAuthModalOpen(true);
      } else {
        setErrorMsg(res.error || 'Failed to send OTP.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-20 overflow-hidden">
      {/* 1. HERO SECTION (motion.dev + shadcn styling) */}
      <section className="relative overflow-hidden pt-8 pb-16 sm:pt-16 sm:pb-24 bg-gradient-to-b from-blue-50/70 via-[#F8FAFC] to-[#F8FAFC]">
        {/* Ambient brand glow aura */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-blue-200/40 via-indigo-100/30 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Identity Tagline pill */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 mb-6"
          >
            <Badge variant="brand" size="lg" dot className="bg-white shadow-soft-sm border-blue-200/90 text-blue-700">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              India&apos;s Local-First Indie Commerce
            </Badge>
          </motion.div>

          {/* Hero Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-stone-950 font-display max-w-4xl mx-auto leading-[1.08]"
          >
            Discover local. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500">
              Buy direct.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-5 text-base sm:text-xl text-stone-600 max-w-2xl mx-auto font-normal leading-relaxed"
          >
            Find authentic products crafted by verified independent studios in your city. Skip impersonal mass warehouses and support real local makers.
          </motion.p>

          {/* Primary & Secondary CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto"
          >
            <Button
              onClick={() => setIsAuthModalOpen(true)}
              size="lg"
              className="w-full sm:w-auto px-8 py-3.5 shadow-md"
            >
              <span>Start Shopping</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>

            <Link to="/seller/onboarding" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-7 py-3.5 shadow-xs bg-white text-stone-800"
              >
                <Store className="w-4 h-4 text-blue-600 mr-1" />
                <span>Become a Seller</span>
              </Button>
            </Link>
          </motion.div>

          {/* Kokonut UI Glowing Card: 10-Second Quick OTP Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 max-w-md mx-auto relative group"
          >
            {/* Subtle glow border effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-sky-400 rounded-3xl blur-xs opacity-50 group-hover:opacity-75 transition duration-500" />

            <div className="relative bg-white rounded-3xl p-6 sm:p-7 shadow-xl border border-sand-200 text-left">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-extrabold text-stone-900 tracking-tight">
                    Instant Access with Mobile Number
                  </h4>
                  <p className="text-[11px] text-stone-500">10-second OTP login • Zero password hassles</p>
                </div>
                <Badge variant="brand" size="sm" dot>
                  Live
                </Badge>
              </div>

              <form onSubmit={handleHeroQuickOtp} className="space-y-3">
                <div className="flex items-center rounded-2xl border border-sand-300 focus-within:ring-2 focus-within:ring-blue-500/40 focus-within:border-blue-600 bg-sand-50/50 overflow-hidden shadow-xs transition">
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
                  className="w-full py-3 shadow-md"
                >
                  Continue with OTP
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </form>

              <div className="mt-4 pt-3 border-t border-sand-100 flex items-center justify-between text-[11px] text-stone-500">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Indian Sellers
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  Zero Fake Listings
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. KOKONUT UI STYLE BENTO GRID: THE SELLUY PILLARS */}
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
                Sellers must apply with GST/Aadhaar identity and workshop proof. Products are checked before going live. If a city has zero verified sellers yet, we show an honest zero-state instead of fake mock products.
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
              {['Hyderabad', 'Bengaluru', 'Chennai', 'Mumbai', 'Delhi'].map((c) => (
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

      {/* 3. HOW SELLUY WORKS (Interactive 3-Step Journey) */}
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

      {/* 4. BECOME A SELLER CTA BANNER (bklit inspired luxury dark contrast) */}
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

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default LoggedOutLanding;
