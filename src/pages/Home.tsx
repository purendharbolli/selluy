import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Sparkles,
  ArrowRight,
  Store,
  ChevronRight,
  Compass,
  ShoppingBag,
} from 'lucide-react';
import { useLocation } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';
import { marketplaceService } from '../services/marketplaceService';
import { ProductCard } from '../components/product/ProductCard';
import { SellerCard } from '../components/seller/SellerCard';
import { LocationModal } from '../components/common/LocationModal';
import { CityOnboardingModal } from '../components/common/CityOnboardingModal';
import { LoggedOutLanding } from '../components/home/LoggedOutLanding';
import { Product, SellerProfile, Category } from '../types';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { selectedCity, setCity } = useLocation();
  const { isAuthenticated, user } = useAuth();

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [heroSearch, setHeroSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<SellerProfile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sync real database products and sellers
  useEffect(() => {
    const loadMarketplaceData = () => {
      const publicProds = marketplaceService.getPublicProducts(selectedCity);
      const verifiedSellers = marketplaceService.getSellersByCity(selectedCity);
      const cats = marketplaceService.getCategories();

      setProducts(publicProds);
      setSellers(verifiedSellers);
      setCategories(cats);
      setIsLoading(false);
    };

    loadMarketplaceData();
    const unsubscribe = marketplaceService.subscribe(loadMarketplaceData);
    return () => unsubscribe();
  }, [selectedCity]);

  // If visitor is logged out, show official Brand Marketing Landing Page
  if (!isAuthenticated) {
    return <LoggedOutLanding />;
  }

  // Filter products for local city
  const isAllCities = selectedCity === 'All Cities';
  const localProducts = isAllCities
    ? products
    : products.filter((p) => p.city?.toLowerCase() === selectedCity.toLowerCase());

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/explore?q=${encodeURIComponent(heroSearch.trim())}`);
    }
  };

  return (
    <div className="space-y-12 sm:space-y-20 pb-16">
      <CityOnboardingModal />

      {/* 1. AUTHENTICATED CUSTOMER HEADER & HERO SEARCH */}
      <section className="relative overflow-hidden pt-6 pb-10 sm:pt-10 sm:pb-14 bg-gradient-to-b from-blue-50/50 via-[#F8FAFC] to-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Active City Location Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-sand-200 shadow-soft-sm mb-5 text-xs sm:text-sm font-semibold text-stone-700">
            <span className="flex items-center gap-1.5 text-stone-500">
              <MapPin className="w-4 h-4 text-blue-600" />
              Shopping in:
            </span>
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="text-stone-950 font-bold hover:text-blue-600 underline decoration-blue-300 underline-offset-2 flex items-center gap-1"
            >
              {selectedCity}
              <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full font-bold">
                Change
              </span>
            </button>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-stone-950 font-display max-w-3xl mx-auto leading-tight">
            Discover verified local sellers in{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              {selectedCity}
            </span>
          </h1>

          <p className="mt-3 text-sm sm:text-base text-stone-600 max-w-xl mx-auto font-normal">
            Direct orders from approved local sellers and small businesses. Verified authentic, shipped directly to your doorstep.
          </p>

          {/* Search Bar */}
          <div className="mt-8 max-w-2xl mx-auto">
            <form
              onSubmit={handleHeroSearch}
              className="relative flex items-center bg-white p-2 rounded-full shadow-soft-lg border border-sand-300 focus-within:ring-2 focus-within:ring-blue-500 transition"
            >
              <div className="pl-4 text-stone-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Search products, sellers & categories"
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                className="w-full px-3 py-2.5 text-stone-900 placeholder-stone-400 text-sm sm:text-base bg-transparent focus:outline-none"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md transition whitespace-nowrap"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs uppercase tracking-wider font-extrabold text-blue-600">Curated Niches</span>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-950 font-display">Explore Categories</h2>
          </div>
          <Link
            to="/categories"
            className="text-xs sm:text-sm font-bold text-stone-700 hover:text-blue-600 flex items-center gap-1 group"
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
              className="group flex flex-col items-center p-3 rounded-3xl bg-white border border-sand-200 hover:border-blue-300 hover:shadow-soft transition text-center"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden mb-2.5 bg-sand-100">
                <img
                  src={cat.image}
                  alt={cat.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                />
              </div>
              <span className="text-xs font-bold text-stone-900 group-hover:text-blue-600 transition leading-tight line-clamp-1">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. PRODUCTS NEAR YOU (LOCAL-FIRST DISCOVERY) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-blue-600 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Verified Local Selection
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-950 font-display">
              Products near you in {selectedCity}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              From verified sellers crafting in {selectedCity}.
            </p>
          </div>

          <Link
            to="/explore"
            className="text-xs sm:text-sm font-bold text-stone-700 hover:text-blue-600 flex items-center gap-1 group"
          >
            Browse all drops
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
          </Link>
        </div>

        {/* Product Grid or Professional Zero-Product State */}
        {localProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {localProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                highlightCity={selectedCity}
              />
            ))}
          </div>
        ) : (
          /* SECTION 10: ZERO-PRODUCT STATE (INTENTIONAL & PROFESSIONAL) */
          <div className="bg-white rounded-3xl p-8 sm:p-14 text-center border border-sand-200 shadow-soft-sm max-w-2xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-7 h-7 text-blue-600" />
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-stone-950 font-display">
              Nothing here yet
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 mt-2 max-w-md mx-auto leading-relaxed">
              We&apos;re bringing verified local sellers to {selectedCity}. Become an early seller or explore products across other cities.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
              <Link
                to="/seller/onboarding"
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
              >
                <Store className="w-4 h-4" />
                <span>Become a Seller</span>
              </Link>

              <button
                type="button"
                onClick={() => setCity('All Cities')}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-sand-100 hover:bg-sand-200 text-stone-800 font-bold text-xs transition"
              >
                Explore Other Cities
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 4. VERIFIED LOCAL SELLERS SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-blue-50/40 rounded-4xl p-6 sm:p-10 border border-blue-100">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-xs mb-2">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                Local Seller Network: {selectedCity}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-950 font-display">
                Local Sellers Around You
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">
                Skip anonymous mass production. Support verified small businesses and local sellers working in your city.
              </p>
            </div>

            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white text-stone-800 text-xs font-bold shadow-xs border border-sand-200 hover:bg-sand-50 transition w-fit"
            >
              Change City ({selectedCity})
            </button>
          </div>

          {sellers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {sellers.map((seller) => (
                <SellerCard key={seller.id} seller={seller} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 text-center border border-sand-200">
              <Store className="w-10 h-10 text-stone-400 mx-auto mb-3" />
              <h4 className="text-base font-bold text-stone-900">
                No onboarded local sellers found in {selectedCity} yet
              </h4>
              <p className="text-xs text-stone-500 max-w-md mx-auto mt-1 mb-4">
                Be the first local seller to launch in {selectedCity} or explore sellers across all cities.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setCity('All Cities')}
                  className="px-4 py-2 rounded-full bg-sand-100 text-stone-800 text-xs font-bold hover:bg-sand-200"
                >
                  Browse All Cities
                </button>
                <Link
                  to="/seller/onboarding"
                  className="px-4 py-2 rounded-full bg-blue-600 text-white text-xs font-bold hover:bg-blue-500"
                >
                  Onboard Your Studio
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />
    </div>
  );
};

export default Home;
