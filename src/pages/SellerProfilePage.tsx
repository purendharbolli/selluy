import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  MessageSquare,
  Package,
  Globe,
  ExternalLink,
} from 'lucide-react';
import { marketplaceService } from '../services/marketplaceService';
import { VerifiedBadge } from '../components/common/VerifiedBadge';
import { ProductCard } from '../components/product/ProductCard';
import { Tabs } from '../components/ui/Tabs';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Product, Review } from '../types';

export const SellerProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [seller, setSeller] = useState(marketplaceService.getSellerById(id || ''));
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [socialLink, setSocialLink] = useState<string | undefined>();
  const [websiteLink, setWebsiteLink] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<'creations' | 'about' | 'reviews'>('creations');
  const [shareToast, setShareToast] = useState(false);

  useEffect(() => {
    if (!id) return;
    const s = marketplaceService.getSellerById(id);
    setSeller(s);
    if (s) {
      setProducts(marketplaceService.getPublicProductsBySeller(s.id));
      setReviews(marketplaceService.getReviewsBySeller(s.id));

      const app = marketplaceService.getApplications().find((a) => a.user_id === s.user_id);
      setSocialLink(s.social_link || app?.social_media_url);
      setWebsiteLink(s.website_url || app?.website_url);
    }
  }, [id]);

  if (!seller) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-black text-stone-900 mb-2 font-display">Creator Studio Not Found</h2>
        <p className="text-stone-500 text-sm mb-6">
          The creator storefront you are looking for may have moved or changed their handle.
        </p>
        <Link to="/explore">
          <Button size="md">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Browse Other Studios
          </Button>
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

  const tabItems = [
    {
      id: 'creations' as const,
      label: 'Creations & Catalog',
      icon: <Package className="w-3.5 h-3.5" />,
      badge: products.length,
    },
    {
      id: 'about' as const,
      label: 'About the Studio',
      icon: <Store className="w-3.5 h-3.5" />,
    },
    {
      id: 'reviews' as const,
      label: 'Verified Reviews',
      icon: <MessageSquare className="w-3.5 h-3.5" />,
      badge: reviews.length > 0 ? reviews.length : undefined,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <Link to="/explore" className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-blue-600 font-semibold transition">
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

              {(socialLink || websiteLink) && (
                <div className="flex items-center gap-2 pt-2 text-xs flex-wrap">
                  {socialLink && (
                    <a
                      href={socialLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 text-pink-700 font-bold hover:bg-pink-100 transition shadow-2xs"
                    >
                      <Instagram className="w-3.5 h-3.5 text-pink-600" />
                      <span>Social Page</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {websiteLink && (
                    <a
                      href={websiteLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 transition shadow-2xs"
                    >
                      <Globe className="w-3.5 h-3.5 text-blue-600" />
                      <span>Website</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-sand-100 hover:bg-sand-200 text-stone-800 text-xs font-bold transition shadow-xs cursor-pointer"
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

      {/* Kokonut UI Animated Sliding Tabs */}
      <div>
        <Tabs
          tabs={tabItems}
          activeTab={activeTab}
          onChange={(tab) => setActiveTab(tab)}
          layoutId="sellerProfileActiveTab"
        />
      </div>

      {/* TAB 1: CREATIONS */}
      {activeTab === 'creations' && (
        <motion.div
          key="tab-creations"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} highlightCity={seller.city} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-sand-200/90 shadow-soft-sm text-xs text-stone-500 max-w-md mx-auto">
              <Store className="w-8 h-8 text-stone-400 mx-auto mb-2" />
              <p className="font-bold text-stone-800 text-sm">This seller hasn't listed any products yet.</p>
              <p className="mt-1">When this creator publishes approved pieces, they will appear here.</p>
            </div>
          )}
        </motion.div>
      )}

      {/* TAB 2: ABOUT */}
      {activeTab === 'about' && (
        <motion.div
          key="tab-about"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200/90 shadow-soft-sm max-w-2xl space-y-4"
        >
          <h3 className="font-bold text-base text-stone-900 font-display">About {seller.store_name}</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            {seller.description}
          </p>
          <div className="pt-2 text-xs text-stone-500 space-y-1.5 border-t border-sand-100">
            <p><strong>Studio City:</strong> {seller.city}, {seller.state || 'India'}</p>
            <p><strong>Focus:</strong> {seller.category_focus}</p>
            <p>
              <strong>Status:</strong>{' '}
              <Badge variant={isVerified ? 'success' : 'warning'} size="sm">
                {isVerified ? 'Verified by Selloi' : 'Pending Verification'}
              </Badge>
            </p>
          </div>
        </motion.div>
      )}

      {/* TAB 3: REVIEWS (Strictly Real Reviews) */}
      {activeTab === 'reviews' && (
        <motion.div
          key="tab-reviews"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-4 max-w-2xl"
        >
          {reviews.length > 0 ? (
            reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white rounded-3xl p-5 border border-sand-200/90 shadow-soft-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-stone-900">{rev.user_name}</span>
                    {rev.verified_purchase && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-stone-400">
                    {new Date(rev.created_at).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                      }`}
                    />
                  ))}
                </div>

                <p className="text-xs text-stone-700 leading-relaxed">{rev.comment}</p>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-sand-200/90 shadow-soft-sm max-w-md mx-auto">
              <MessageSquare className="w-8 h-8 text-stone-400 mx-auto mb-2" />
              <h4 className="text-base font-bold text-stone-900 font-display">No reviews yet</h4>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                When customers purchase from this creator, their verified reviews will appear here.
              </p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default SellerProfilePage;
