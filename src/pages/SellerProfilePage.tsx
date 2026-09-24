import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Star,
  PackageCheck,
  Instagram,
  Sparkles,
  ArrowLeft,
  Share2,
  CheckCircle2,
  Store,
} from 'lucide-react';
import { marketplaceService } from '../services/marketplaceService';
import { VerifiedBadge } from '../components/common/VerifiedBadge';
import { ProductCard } from '../components/product/ProductCard';
import { Product } from '../types';

export const SellerProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [seller, setSeller] = useState(marketplaceService.getSellerById(id || ''));
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'creations' | 'about'>('creations');
  const [shareToast, setShareToast] = useState(false);

  useEffect(() => {
    const s = marketplaceService.getSellerById(id || '');
    setSeller(s);
    if (s) {
      setProducts(marketplaceService.getProductsBySeller(s.id).filter((p) => p.status === 'approved' || !p.status));
    }
  }, [id]);

  if (!seller) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-black text-stone-900 mb-2 font-display">Creator Not Found</h2>
        <p className="text-stone-500 text-sm mb-6">
          The creator storefront you are looking for may have moved or changed their handle.
        </p>
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-blue-600 text-white font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Browse Other Studios
        </Link>
      </div>
    );
  }

  const isVerified = seller.verification_status === 'approved' || (seller.verification_status as string) === 'verified';

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Back button */}
      <Link to="/explore" className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-blue-600 font-semibold">
        <ArrowLeft className="w-4 h-4" />
        Back to marketplace
      </Link>

      {/* Creator Storefront Hero Card */}
      <div className="bg-white rounded-4xl p-6 sm:p-10 border border-sand-200/90 shadow-soft-sm relative overflow-hidden">
        {/* Subtle decorative banner gradient */}
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-r from-blue-100/60 via-indigo-100/40 to-sand-100 border-b border-sand-200/60" />

        <div className="relative pt-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            <div className="relative">
              <img
                src={seller.logo}
                alt={seller.store_name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-white shadow-md bg-white"
              />
              {isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1 rounded-full border-2 border-white shadow-sm">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-stone-950 font-display">
                  {seller.store_name}
                </h1>
                {isVerified && <VerifiedBadge size="md" />}
              </div>

              <div className="flex items-center gap-3 text-xs sm:text-sm text-stone-600 flex-wrap">
                <span className="flex items-center gap-1 text-stone-900 font-semibold">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  {seller.city}, {seller.state || 'India'}
                </span>
                <span>•</span>
                <span className="font-semibold text-stone-700">
                  {seller.category_focus || 'Handmade Crafts'}
                </span>
                {seller.rating && seller.total_reviews ? (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-amber-600 font-semibold">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      {seller.rating.toFixed(1)} ({seller.total_reviews} reviews)
                    </span>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-sand-100 hover:bg-sand-200 text-stone-800 text-xs font-bold transition shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            {shareToast ? 'Link Copied!' : 'Share Studio'}
          </button>
        </div>

        {/* Bio snippet */}
        <p className="mt-6 text-sm text-stone-700 max-w-3xl leading-relaxed">
          {seller.description}
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-sand-200 flex gap-4">
        <button
          onClick={() => setActiveTab('creations')}
          className={`pb-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'creations'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Creations &amp; Catalog ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={`pb-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'about'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          About the Studio
        </button>
      </div>

      {/* TAB 1: CREATIONS */}
      {activeTab === 'creations' && (
        <div>
          {products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} highlightCity={seller.city} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-sand-200 text-xs text-stone-500">
              <Store className="w-8 h-8 text-stone-400 mx-auto mb-2" />
              <p className="font-bold text-stone-800 text-sm">No live drops currently</p>
              <p className="mt-1">This creator has not published active inventory yet.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ABOUT */}
      {activeTab === 'about' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 max-w-2xl space-y-4">
          <h3 className="font-bold text-base text-stone-900">About {seller.store_name}</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            {seller.description}
          </p>
          <div className="pt-2 text-xs text-stone-500 space-y-1">
            <p><strong>Studio City:</strong> {seller.city}, {seller.state || 'India'}</p>
            <p><strong>Focus:</strong> {seller.category_focus}</p>
            <p><strong>Status:</strong> {isVerified ? 'Verified by Selluy' : 'Pending verification'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerProfilePage;
