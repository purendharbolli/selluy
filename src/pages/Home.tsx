import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  PackageCheck,
  Store,
  ChevronRight,
  TrendingUp,
  Award,
  Zap,
} from 'lucide-react';
import { useLocation } from '../context/LocationContext';
import { marketplaceService } from '../services/marketplaceService';
import { ProductCard } from '../components/product/ProductCard';
import { SellerCard } from '../components/seller/SellerCard';
import { LocationModal } from '../components/common/LocationModal';
import { HomeIntroAuthBanner } from '../components/home/HomeIntroAuthBanner';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { selectedCity } = useLocation();
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [heroSearch, setHeroSearch] = useState('');

  const allProducts = marketplaceService.getProducts();
  const allSellers = marketplaceService.getSellers();
  const categories = marketplaceService.getCategories();

  // Localized and filtered subsets
  const nearbyProducts = allProducts.filter(
    (p) => selectedCity === 'All Cities' || p.city.toLowerCase() === selectedCity.toLowerCase()
  );

  const nearbySellers = allSellers.filter(
    (s) => selectedCity === 'All Cities' || s.city.toLowerCase() === selectedCity.toLowerCase()
  );

  const trendingProducts = allProducts.filter((p) => p.trending).slice(0, 8);
  const featuredProducts = allProducts.filter((p) => p.featured).slice(0, 8);
  const newSellers = [...allSellers].reverse().slice(0, 4);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/explore?q=${encodeURIComponent(heroSearch.trim())}`);
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-20 bg-gradient-to-b from-brand-50/50 via-[#FAF9F6] to-[#FAF9F6]">
        {/* Soft background ambient glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-brand-100/40 via-amber-100/30 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Location pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-sand-200/90 shadow-soft-sm mb-6 text-xs sm:text-sm font-semibold text-stone-700">
            <span className="flex items-center gap-1 text-stone-500">
              <MapPin className="w-4 h-4 text-brand-500" />
              Shopping in:
            </span>
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="text-stone-950 font-bold hover:text-brand-600 underline decoration-brand-300 underline-offset-2 flex items-center gap-1"
            >
              {selectedCity}
              <span className="text-[10px] text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded-full font-bold">Change</span>
            </button>
          </div>

          {/* Hero Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-stone-950 font-display max-w-4xl mx-auto leading-[1.08]">
            Discover something <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-brand-500 to-amber-600">
              worth buying.
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-xl text-stone-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Find unique handmade crafts, indie fashion, ceramics, and art from passionate independent sellers around you.
          </p>

          {/* 3. HERO SEARCH */}
          <div className="mt-8 sm:mt-10 max-w-2xl mx-auto">
            <form
              onSubmit={handleHeroSearch}
              className="relative flex items-center bg-white p-2 rounded-full shadow-soft-lg border border-sand-200/80 focus-within:ring-2 focus-within:ring-brand-500 transition"
            >
              <div className="pl-4 text-stone-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Search products, indie creators, or categories..."
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                className="w-full px-3 py-2.5 text-stone-900 placeholder-stone-400 text-sm sm:text-base bg-transparent focus:outline-none"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-full bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-md transition whitespace-nowrap"
              >
                Search
              </button>
            </form>

            {/* Quick popular tags */}
            <div className="flex items-center justify-center gap-2 mt-4 flex-wrap text-xs text-stone-500">
              <span className="font-semibold text-stone-400">Popular:</span>
              {['Linen Kurtas', 'Handmade Earrings', 'Ceramic Bowls', 'Gouache Art', 'Walnut Wood Gifts'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => navigate(`/explore?q=${encodeURIComponent(tag)}`)}
                  className="px-2.5 py-1 rounded-full bg-white hover:bg-sand-100 border border-sand-200 text-stone-700 font-medium transition"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PAGE INTRO & SIGN UP / LOGIN BOX */}
      <HomeIntroAuthBanner />

      {/* 5. POPULAR CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs uppercase tracking-wider font-extrabold text-brand-600">Curated Niches</span>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-950 font-display">Explore Categories</h2>
          </div>
          <Link
            to="/categories"
            className="text-xs sm:text-sm font-bold text-stone-700 hover:text-brand-600 flex items-center gap-1 group"
          >
            All categories
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/explore?category=${cat.slug}`}
              className="group flex flex-col items-center p-3 rounded-3xl bg-white border border-sand-200/80 hover:border-brand-300 hover:shadow-soft transition text-center"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden mb-2.5 bg-sand-100">
                <img
                  src={cat.image}
                  alt={cat.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                />
              </div>
              <span className="text-xs font-bold text-stone-900 group-hover:text-brand-600 transition leading-tight line-clamp-1">
                {cat.name}
              </span>
              <span className="text-[10px] text-stone-400 mt-0.5">{cat.item_count || 10}+ pieces</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 7. NEARBY SELLERS (LOCAL FIRST) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-amber-500/10 via-sand-100/50 to-brand-500/10 rounded-4xl p-6 sm:p-10 border border-sand-200">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-xs mb-2">
                <MapPin className="w-3.5 h-3.5 text-amber-700" />
                Local Indie Spotlight: {selectedCity}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-950 font-display">
                Independent Studios Around You
              </h2>
              <p className="text-sm text-stone-600 mt-1">
                Skip anonymous warehouses. Support genuine creators working right in your city.
              </p>
            </div>

            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white text-stone-800 text-xs font-bold shadow-xs border border-sand-200 hover:bg-sand-50 transition w-fit"
            >
              Change City ({selectedCity})
            </button>
          </div>

          {nearbySellers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {nearbySellers.map((seller) => (
                <SellerCard key={seller.id} seller={seller} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 text-center border border-sand-200">
              <Store className="w-10 h-10 text-stone-400 mx-auto mb-3" />
              <h4 className="text-base font-bold text-stone-900">
                No onboarded creators found in {selectedCity} yet
              </h4>
              <p className="text-xs text-stone-500 max-w-md mx-auto mt-1 mb-4">
                Be the first independent brand to launch in {selectedCity} or explore creators across all cities.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setIsLocationModalOpen(true)}
                  className="px-4 py-2 rounded-full bg-sand-100 text-stone-800 text-xs font-bold hover:bg-sand-200"
                >
                  Browse All Cities
                </button>
                <Link
                  to="/seller/onboarding"
                  className="px-4 py-2 rounded-full bg-brand-600 text-white text-xs font-bold hover:bg-brand-500"
                >
                  Onboard Your Studio
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 6. TRENDING PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-brand-600 uppercase tracking-wider mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Social Buzz
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-950 font-display">
              Trending Drops This Week
            </h2>
          </div>
          <Link
            to="/explore?filter=trending"
            className="text-xs sm:text-sm font-bold text-stone-700 hover:text-brand-600 flex items-center gap-1 group"
          >
            View all
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {trendingProducts.map((product) => (
            <ProductCard key={product.id} product={product} highlightCity={selectedCity} />
          ))}
        </div>
      </section>

      {/* 9. FEATURED PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-600 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Handpicked Craftsmanship
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-950 font-display">
              Featured Editor's Picks
            </h2>
          </div>
          <Link
            to="/explore?filter=featured"
            className="text-xs sm:text-sm font-bold text-stone-700 hover:text-brand-600 flex items-center gap-1 group"
          >
            View all
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} highlightCity={selectedCity} />
          ))}
        </div>
      </section>

      {/* 8. NEW SELLERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs uppercase tracking-wider font-extrabold text-stone-400">Fresh Stories</span>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-950 font-display">
              New Creators On Selluy
            </h2>
          </div>
          <Link
            to="/explore"
            className="text-xs sm:text-sm font-bold text-stone-700 hover:text-brand-600 flex items-center gap-1"
          >
            Discover more
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {newSellers.map((seller) => (
            <SellerCard key={seller.id} seller={seller} />
          ))}
        </div>
      </section>

      {/* 10. HOW SELLUY WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-sand-100/70 rounded-4xl p-8 sm:p-14 border border-sand-200">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-wider font-extrabold text-brand-600">The Selluy Difference</span>
            <h2 className="text-3xl font-black text-stone-950 font-display mt-1">
              How Selluy Works
            </h2>
            <p className="text-sm text-stone-600 mt-2">
              Replacing chaotic Instagram DMs and scattered WhatsApp catalogs with a joyful direct-to-creator marketplace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-6 border border-sand-200/80 shadow-soft-sm">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-black text-xl mb-4">
                01
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">Discover Local Creators</h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Filter by your city to find independent clothing labels, ceramic studios, jewelry makers, and custom gift artists around you.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-sand-200/80 shadow-soft-sm">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-xl mb-4">
                02
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">Transparent & Direct</h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Clear prices, real creator reviews, and verified badges. No price haggling in comments or waiting 12 hours for a DM reply.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-sand-200/80 shadow-soft-sm">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xl mb-4">
                03
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">Safe Doorstep Delivery</h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Support independent artisans directly with seamless checkout, automated order confirmation, and swift city/national shipping.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 12. TRUST & SAFETY SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-stone-900 text-white rounded-4xl p-8 sm:p-14 overflow-hidden relative">
          <div className="space-y-6 z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Verified Seller Commitment
            </div>
            <h2 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-white">
              Trust is the backbone of indie shopping.
            </h2>
            <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
              We know buying from Instagram and WhatsApp creators sometimes feels risky. That's why every verified seller on Selluy undergoes manual store and identity vetting by our moderation team.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-stone-800 text-emerald-400 flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Verified Badge</h4>
                  <p className="text-xs text-stone-400">Strictly granted after Selluy reviews authenticity.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-stone-800 text-brand-400 flex items-center justify-center shrink-0">
                  <PackageCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Direct Accountability</h4>
                  <p className="text-xs text-stone-400">Real customer ratings and transparent order records.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-stone-800/80 backdrop-blur-sm rounded-3xl p-6 border border-stone-700 space-y-4">
            <h3 className="font-bold text-base text-stone-200">Our Community Promise</h3>
            <div className="space-y-3 text-xs text-stone-300">
              <div className="p-3 rounded-2xl bg-stone-900/60 border border-stone-700/60 flex items-center justify-between">
                <span>Independent Small Businesses Only</span>
                <span className="text-emerald-400 font-bold">100% Indie</span>
              </div>
              <div className="p-3 rounded-2xl bg-stone-900/60 border border-stone-700/60 flex items-center justify-between">
                <span>No Artificial Factory Dropshippers</span>
                <span className="text-emerald-400 font-bold">Vetted</span>
              </div>
              <div className="p-3 rounded-2xl bg-stone-900/60 border border-stone-700/60 flex items-center justify-between">
                <span>Direct Creator Payouts</span>
                <span className="text-emerald-400 font-bold">Empowering</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 11. SELLER CTA SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-brand-500 to-brand-600 rounded-4xl p-8 sm:p-14 text-white text-center relative overflow-hidden shadow-float">
          <div className="relative z-10 max-w-2xl mx-auto space-y-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-white">
              <Zap className="w-3.5 h-3.5" /> For Independent Creators
            </span>
            <h2 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white">
              Sell where you're discovered direct.
            </h2>
            <p className="text-brand-100 text-sm sm:text-base leading-relaxed">
              Stop answering "Price please?" 50 times a day in DMs. Launch your professional Selluy storefront in under 5 minutes.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/seller/onboarding"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white text-brand-700 font-black text-sm hover:bg-stone-100 shadow-md transition"
              >
                Create Your Storefront Free
              </Link>
              <Link
                to="/seller/dashboard"
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-brand-700/60 text-white font-bold text-sm hover:bg-brand-700 transition"
              >
                Preview Seller Studio
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Location Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />
    </div>
  );
};
