import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  SlidersHorizontal,
  MapPin,
  CheckCircle2,
  X,
  ArrowUpDown,
  Sparkles,
} from 'lucide-react';
import { marketplaceService } from '../services/marketplaceService';
import { ProductCard } from '../components/product/ProductCard';
import { useLocation } from '../context/LocationContext';

export const Explore: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedCity } = useLocation();

  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || 'all';
  const initialFilter = searchParams.get('filter') || '';

  const [search, setSearch] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [cityFilter, setCityFilter] = useState<string>(
    initialFilter === 'nearby' ? selectedCity : 'all'
  );
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(3000);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'newest'>('featured');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const allProducts = marketplaceService.getProducts();
  const categories = marketplaceService.getCategories();
  const sellers = marketplaceService.getSellers();

  // Extract unique cities from products and sellers
  const availableCities = useMemo(() => {
    const set = new Set<string>();
    allProducts.forEach((p) => set.add(p.city));
    return Array.from(set);
  }, [allProducts]);

  // Filter & Sort
  const filteredProducts = useMemo(() => {
    return allProducts
      .filter((p) => {
        // Search filter (name, description, seller store name, category)
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          const matchSeller = p.seller?.store_name.toLowerCase().includes(q);
          const matchCat = p.category?.name.toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchSeller && !matchCat) return false;
        }

        // Category filter
        if (selectedCategory !== 'all') {
          if (p.category?.slug !== selectedCategory && p.category_id !== selectedCategory) {
            return false;
          }
        }

        // City filter
        if (cityFilter !== 'all') {
          if (p.city.toLowerCase() !== cityFilter.toLowerCase()) return false;
        }

        // Verified seller filter
        if (verifiedOnly) {
          if (p.seller?.verification_status !== 'approved') return false;
        }

        // Price filter
        if (p.price > maxPrice) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        // default: prioritize city then featured
        if (cityFilter === 'all' && selectedCity !== 'All Cities') {
          const aCity = a.city.toLowerCase() === selectedCity.toLowerCase() ? 1 : 0;
          const bCity = b.city.toLowerCase() === selectedCity.toLowerCase() ? 1 : 0;
          if (aCity !== bCity) return bCity - aCity;
        }
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [allProducts, search, selectedCategory, cityFilter, verifiedOnly, maxPrice, sortBy, selectedCity]);

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setCityFilter('all');
    setVerifiedOnly(false);
    setMaxPrice(3000);
    setSortBy('featured');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-brand-600 uppercase tracking-wider mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          Direct from Independent Creators
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-950 font-display">
          Explore Unique Products
        </h1>
        <p className="text-stone-600 text-sm mt-1">
          Handmade, small-batch, and local items you won’t find in mass commercial malls.
        </p>
      </div>

      {/* Search & Top Action Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search by product, creator, or material..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-full bg-white border border-sand-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-soft-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Filter toggle button */}
          <button
            onClick={() => setIsMobileFiltersOpen(true)}
            className="md:hidden flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-white border border-sand-300 text-stone-800 text-sm font-semibold shadow-soft-sm"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-full border border-sand-300 shadow-soft-sm text-xs font-semibold text-stone-700">
            <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent focus:outline-none cursor-pointer pr-1"
            >
              <option value="featured">Featured First</option>
              <option value="newest">Newest Drops</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Sidebar Filters + Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block space-y-6 bg-white p-6 rounded-3xl border border-sand-200 shadow-soft-sm h-fit sticky top-28">
          <div className="flex items-center justify-between pb-3 border-b border-sand-100">
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Filter className="w-4 h-4 text-brand-600" />
              Filter By
            </h3>
            <button
              onClick={resetFilters}
              className="text-xs text-brand-600 hover:underline font-semibold"
            >
              Reset
            </button>
          </div>

          {/* Categories */}
          <div>
            <label className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-2.5">
              Category
            </label>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  selectedCategory === 'all'
                    ? 'bg-brand-50 text-brand-700 font-bold'
                    : 'text-stone-600 hover:bg-sand-50'
                }`}
              >
                All Categories ({allProducts.length})
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.slug)}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    selectedCategory === c.slug
                      ? 'bg-brand-50 text-brand-700 font-bold'
                      : 'text-stone-600 hover:bg-sand-50'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* City / Hub */}
          <div>
            <label className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-2.5">
              Creator City
            </label>
            <div className="space-y-1">
              <button
                onClick={() => setCityFilter('all')}
                className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  cityFilter === 'all'
                    ? 'bg-brand-50 text-brand-700 font-bold'
                    : 'text-stone-600 hover:bg-sand-50'
                }`}
              >
                All Cities
              </button>
              {availableCities.map((city) => (
                <button
                  key={city}
                  onClick={() => setCityFilter(city)}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                    cityFilter === city
                      ? 'bg-brand-50 text-brand-700 font-bold'
                      : 'text-stone-600 hover:bg-sand-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-stone-400" />
                    {city}
                  </span>
                  {selectedCity.toLowerCase() === city.toLowerCase() && (
                    <span className="text-[10px] text-amber-600 bg-amber-50 px-1 rounded font-bold">You</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Verified Sellers Only */}
          <div className="pt-2 border-t border-sand-100">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-800">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4 border-sand-300"
              />
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Verified Sellers Only
              </span>
            </label>
          </div>

          {/* Price Range */}
          <div className="pt-2 border-t border-sand-100">
            <div className="flex justify-between items-center text-xs font-bold text-stone-700 mb-2">
              <span>Max Price</span>
              <span className="text-brand-600 font-black">₹{maxPrice.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min="200"
              max="3000"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-brand-500 cursor-pointer"
            />
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="md:col-span-3 space-y-6">
          <div className="flex items-center justify-between text-xs text-stone-500 px-1">
            <span>
              Showing <strong className="text-stone-900">{filteredProducts.length}</strong> creations
            </span>
            {cityFilter !== 'all' && (
              <span className="bg-sand-100 text-stone-700 px-2.5 py-1 rounded-full font-semibold">
                In {cityFilter}
              </span>
            )}
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  highlightCity={cityFilter !== 'all' ? cityFilter : selectedCity}
                />
              ))}
            </div>
          ) : (
            /* Empty state */
            <div className="bg-white rounded-3xl p-12 text-center border border-sand-200 shadow-soft-sm">
              <div className="w-14 h-14 rounded-full bg-sand-100 text-stone-400 flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-stone-900">No creations found</h3>
              <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto mt-1 mb-6">
                Try loosening your filters or searching for something else like "earrings", "linen", or "prints".
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-2.5 rounded-full bg-brand-600 text-white font-bold text-xs hover:bg-brand-500 transition shadow-sm"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Slide-over / Modal */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs md:hidden">
          <div className="w-full max-w-xs bg-white h-full p-6 overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-sand-200">
              <h3 className="font-bold text-base text-stone-900">Filters</h3>
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="p-1 rounded-full hover:bg-sand-100 text-stone-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category filter */}
            <div>
              <label className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-2">Category</label>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold ${
                    selectedCategory === 'all' ? 'bg-brand-50 text-brand-700' : 'text-stone-700'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.slug)}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold ${
                      selectedCategory === c.slug ? 'bg-brand-50 text-brand-700' : 'text-stone-700'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* City filter */}
            <div>
              <label className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-2">City</label>
              <div className="space-y-1">
                <button
                  onClick={() => setCityFilter('all')}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold ${
                    cityFilter === 'all' ? 'bg-brand-50 text-brand-700' : 'text-stone-700'
                  }`}
                >
                  All Cities
                </button>
                {availableCities.map((city) => (
                  <button
                    key={city}
                    onClick={() => setCityFilter(city)}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold ${
                      cityFilter === city ? 'bg-brand-50 text-brand-700' : 'text-stone-700'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            {/* Verified Only */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-800">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="rounded text-brand-600 w-4 h-4"
                />
                <span>Verified Sellers Only</span>
              </label>
            </div>

            <button
              onClick={() => setIsMobileFiltersOpen(false)}
              className="w-full py-3 rounded-full bg-brand-600 text-white font-bold text-xs shadow-md"
            >
              Apply & See {filteredProducts.length} Results
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
