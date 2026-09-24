import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
  PackageCheck,
  Users,
  Smartphone,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SelluyLogo } from '../common/SelluyLogo';
import { AuthModal } from '../auth/AuthModal';

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
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-16 sm:pt-16 sm:pb-24 bg-gradient-to-b from-blue-50/60 via-[#F8FAFC] to-[#F8FAFC]">
        {/* Ambient brand glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-blue-100/50 via-indigo-100/30 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Identity Tagline pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-blue-200/90 shadow-soft-sm mb-6 text-xs sm:text-sm font-semibold text-stone-700">
            <span className="flex items-center gap-1.5 text-blue-700 font-bold">
              <MapPin className="w-4 h-4 text-blue-600" />
              India&apos;s Local-First Indie Marketplace
            </span>
          </div>

          {/* Hero Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-stone-950 font-display max-w-4xl mx-auto leading-[1.08]">
            Discover local. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600">
              Buy direct.
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-xl text-stone-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Find unique products crafted by verified independent sellers around you. Skip impersonal warehouses and support authentic makers in your city.
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              <span>Start Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link
              to="/seller/onboarding"
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white hover:bg-sand-100 border border-sand-300 text-stone-800 font-bold text-sm transition flex items-center justify-center gap-2 shadow-xs"
            >
              <Store className="w-4 h-4 text-blue-600" />
              <span>Become a Seller</span>
            </Link>
          </div>

          {/* 10-Second Quick OTP Box */}
          <div className="mt-12 max-w-md mx-auto bg-white rounded-3xl p-5 sm:p-6 shadow-soft-lg border border-sand-200 text-left">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-extrabold text-stone-900">
                  Join Selluy with Mobile Number
                </h4>
                <p className="text-[11px] text-stone-500">Instant OTP verification • Free forever</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-extrabold uppercase">
                Fast Access
              </span>
            </div>

            <form onSubmit={handleHeroQuickOtp} className="space-y-2.5">
              <div className="flex items-center rounded-xl border border-sand-300 focus-within:ring-2 focus-within:ring-blue-500 bg-sand-50/50 overflow-hidden">
                <span className="px-3 py-2.5 text-xs font-bold text-stone-600 border-r border-sand-200 bg-sand-100 select-none">
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
                  className="w-full px-3 py-2 text-sm font-medium text-stone-900 bg-transparent focus:outline-none"
                />
              </div>

              {errorMsg && (
                <p className="text-[11px] text-rose-600 font-medium">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={isLoading || phone.length !== 10}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    Continue with OTP
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 2. WHY SELLUY? */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-wider font-extrabold text-blue-600">The Selluy Difference</span>
          <h2 className="text-3xl sm:text-4xl font-black text-stone-950 font-display mt-1">
            Why Shop on Selluy?
          </h2>
          <p className="text-stone-600 text-sm mt-2">
            Built for modern Indian shoppers who appreciate craftsmanship, community, and direct trust.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-sand-200 shadow-soft-sm hover:shadow-soft transition flex flex-col items-start">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-base font-bold text-stone-900 mb-1.5">Verified Sellers Only</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Every seller application undergoes manual review. Only approved studios and makers can publish products.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-sand-200 shadow-soft-sm hover:shadow-soft transition flex flex-col items-start">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-base font-bold text-stone-900 mb-1.5">Local Discovery First</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Prioritize indie brands operating in your city. Experience faster communication and hyper-local authenticity.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-sand-200 shadow-soft-sm hover:shadow-soft transition flex flex-col items-start">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <ShoppingBag className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-base font-bold text-stone-900 mb-1.5">Direct Shopping</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Buy directly from the hands that craft the item. No intermediaries inflating costs or diluting originality.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-sand-200 shadow-soft-sm hover:shadow-soft transition flex flex-col items-start">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <PackageCheck className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-base font-bold text-stone-900 mb-1.5">Trusted Marketplace</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Moderated product quality, transparent order tracking, and genuine verified reviews from real buyers.
            </p>
          </div>
        </div>
      </section>

      {/* 3. HOW SELLUY WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-4xl p-8 sm:p-12 border border-sand-200 shadow-soft">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs uppercase tracking-wider font-extrabold text-blue-600">Simplicity &amp; Speed</span>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-950 font-display mt-1">
              How Selluy Works
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Three clear steps to discover and buy direct from local creators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center sm:text-left flex flex-col items-center sm:items-start">
              <span className="w-10 h-10 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center mb-4">
                1
              </span>
              <h4 className="text-base font-extrabold text-stone-900 mb-1">Discover</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Choose your city to explore handcrafted apparel, ceramics, jewelry, and decor from local studios.
              </p>
            </div>

            <div className="text-center sm:text-left flex flex-col items-center sm:items-start">
              <span className="w-10 h-10 rounded-full bg-indigo-600 text-white font-black text-sm flex items-center justify-center mb-4">
                2
              </span>
              <h4 className="text-base font-extrabold text-stone-900 mb-1">Choose</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Review verified seller badges, real craft specifications, and authentic customer feedback.
              </p>
            </div>

            <div className="text-center sm:text-left flex flex-col items-center sm:items-start">
              <span className="w-10 h-10 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center mb-4">
                3
              </span>
              <h4 className="text-base font-extrabold text-stone-900 mb-1">Buy Direct</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Place direct orders through a seamless bag experience and receive real-time order fulfillment updates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. BECOME A SELLER CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 text-white rounded-4xl p-8 sm:p-12 border border-stone-800 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold">
              <Store className="w-3.5 h-3.5 text-blue-400" />
              Creator &amp; Studio Community
            </div>
            <h3 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white">
              Have something to sell? <br />
              Reach customers around your city.
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Launch your storefront on Selluy. Connect with local shoppers looking for handmade and independent goods.
            </p>
          </div>

          <div className="shrink-0 w-full sm:w-auto">
            <Link
              to="/seller/onboarding"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              <span>Start Selling</span>
              <ArrowRight className="w-4 h-4" />
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
