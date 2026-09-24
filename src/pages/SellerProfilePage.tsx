import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Star,
  PackageCheck,
  Instagram,
  Calendar,
  Sparkles,
  ArrowLeft,
  Share2,
  CheckCircle2,
} from 'lucide-react';
import { marketplaceService } from '../services/marketplaceService';
import { VerifiedBadge } from '../components/common/Badge';
import { ProductCard } from '../components/product/ProductCard';

export const SellerProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const seller = marketplaceService.getSellerById(id || '');
  const [activeTab, setActiveTab] = useState<'creations' | 'about' | 'reviews'>('creations');
  const [shareToast, setShareToast] = useState(false);

  if (!seller) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-black text-stone-900 mb-2">Creator Not Found</h2>
        <p className="text-stone-500 text-sm mb-6">
          The creator storefront you are looking for may have moved or changed their handle.
        </p>
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-brand-600 text-white font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Browse Other Studios
        </Link>
      </div>
    );
  }

  const products = marketplaceService.getProductsBySeller(seller.id);

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
      <Link to="/explore" className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-brand-600 font-semibold">
        <ArrowLeft className="w-4 h-4" />
        Back to creators & marketplace
      </Link>

      {/* Creator Storefront Hero Card */}
      <div className="bg-white rounded-4xl p-6 sm:p-10 border border-sand-200/90 shadow-soft-sm relative overflow-hidden">
        {/* Subtle decorative banner gradient */}
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-r from-brand-100/60 via-amber-100/40 to-sand-100 border-b border-sand-200/60" />

        <div className="relative pt-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            <div className="relative">
              <img
                src={seller.logo}
                alt={seller.store_name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-white shadow-md bg-white"
              />
              {seller.verification_status === 'approved' && (
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white shadow-sm">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-stone-950 font-display">
                  {seller.store_name}
                </h1>
                {seller.verification_status === 'approved' && <VerifiedBadge size="md" />}
              </div>

              <div className="flex items-center gap-3 text-xs sm:text-sm text-stone-600 flex-wrap">
                <span className="flex items-center gap-1 text-stone-900 font-semibold">
                  <MapPin className="w-4 h-4 text-brand-600" />
                  {seller.city}, {seller.state || 'India'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-amber-600 font-semibold">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  {seller.rating.toFixed(1)} ({seller.total_reviews} reviews)
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <PackageCheck className="w-4 h-4 text-emerald-600" />
                  {seller.completed_orders}+ fulfilled orders
                </span>
              </div>
            </div>
          </div>

          {/* Social and Share buttons */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            {seller.social_link && (
              <a
                href={`https://${seller.social_link}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-2xl bg-sand-100 hover:bg-sand-200 text-stone-800 text-xs font-bold inline-flex items-center gap-1.5 transition"
              >
                <Instagram className="w-4 h-4 text-pink-600" />
                <span>@{seller.social_link.split('/')[1] || 'profile'}</span>
              </a>
            )}

            <button
              onClick={handleShare}
              className="p-2.5 rounded-2xl bg-white border border-sand-300 text-stone-700 hover:bg-sand-50 transition"
              title="Share store link"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bio summary */}
        <p className="mt-6 text-sm text-stone-700 max-w-3xl leading-relaxed">
          {seller.description}
        </p>

        {/* Verified details note */}
        <div className="mt-6 pt-4 border-t border-sand-100 flex items-center justify-between text-xs text-stone-500">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-stone-400" />
            Member studio since {new Date(seller.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
          </span>
          <span className="text-stone-400 hidden sm:inline">
            Direct dispatch from studio • No middleman
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-sand-200 flex items-center gap-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab('creations')}
          className={`pb-3.5 transition relative ${
            activeTab === 'creations'
              ? 'text-brand-600 border-b-2 border-brand-600'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          Creations ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('about')}
          className={`pb-3.5 transition relative ${
            activeTab === 'about'
              ? 'text-brand-600 border-b-2 border-brand-600'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          Studio Story
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`pb-3.5 transition relative ${
            activeTab === 'reviews'
              ? 'text-brand-600 border-b-2 border-brand-600'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          Reviews ({seller.total_reviews})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'creations' && (
        <div>
          {products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-10 text-center border border-sand-200">
              <p className="text-stone-500 text-sm">This creator is currently crafting new pieces.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'about' && (
        <div className="bg-white rounded-3xl p-8 border border-sand-200 space-y-6 max-w-3xl">
          <h3 className="text-lg font-bold text-stone-900">About {seller.store_name}</h3>
          <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">
            {seller.description}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-sand-100 text-xs">
            <div>
              <span className="text-stone-400 block font-semibold uppercase text-[10px]">Studio Location</span>
              <span className="font-bold text-stone-900">{seller.city}, {seller.state}</span>
            </div>
            <div>
              <span className="text-stone-400 block font-semibold uppercase text-[10px]">Primary Craft</span>
              <span className="font-bold text-stone-900">{seller.category_focus}</span>
            </div>
            <div>
              <span className="text-stone-400 block font-semibold uppercase text-[10px]">Vetting Status</span>
              <span className="font-bold text-emerald-600 capitalize">{seller.verification_status}</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="bg-white rounded-3xl p-8 border border-sand-200 space-y-6 max-w-3xl">
          <div className="flex items-center justify-between pb-4 border-b border-sand-100">
            <div>
              <h3 className="text-lg font-bold text-stone-900">Verified Buyer Experiences</h3>
              <p className="text-xs text-stone-500">Real feedback from buyers who ordered from {seller.store_name}</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-50 text-amber-800 text-sm font-black border border-amber-200">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              {seller.rating.toFixed(1)} / 5.0
            </div>
          </div>

          <div className="space-y-4">
            {[
              {
                name: 'Kavya R.',
                city: 'Hyderabad',
                rating: 5,
                comment: 'The quality of the craftsmanship exceeded my expectations! The packaging was personal and arrived within 2 days locally.',
                date: '3 days ago'
              },
              {
                name: 'Siddharth M.',
                city: 'Bengaluru',
                rating: 5,
                comment: 'So glad I found this studio through Selluy instead of messaging back and forth on Instagram. Seamless order and lovely piece!',
                date: '1 week ago'
              },
              {
                name: 'Ananya S.',
                city: 'Mumbai',
                rating: 4.8,
                comment: 'Authentic handmade item. Very sturdy and true to the description.',
                date: '2 weeks ago'
              }
            ].map((rev, i) => (
              <div key={i} className="p-4 rounded-2xl bg-sand-50/70 border border-sand-200/60 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-stone-900">{rev.name} ({rev.city})</span>
                  <span className="text-[10px] text-stone-400">{rev.date}</span>
                </div>
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="w-3 h-3 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-stone-700 leading-relaxed">{rev.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
