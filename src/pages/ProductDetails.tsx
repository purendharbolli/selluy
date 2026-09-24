import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  Share2,
  MapPin,
  Star,
  Check,
  PackageCheck,
  ShoppingBag,
  ShieldCheck,
  ArrowLeft,
  AlertCircle,
  Flag,
} from 'lucide-react';
import { marketplaceService } from '../services/marketplaceService';
import { useCart } from '../context/CartContext';
import { VerifiedBadge } from '../components/common/Badge';
import { ProductCard } from '../components/product/ProductCard';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();

  const product = marketplaceService.getProductById(id || '');
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [addedToast, setAddedToast] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-black text-stone-900 mb-2">Product Not Found</h2>
        <p className="text-stone-500 text-sm mb-6">
          This piece might have been reserved or removed by the creator.
        </p>
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-brand-600 text-white font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Explore Other Creations
        </Link>
      </div>
    );
  }

  const isFavorited = isInWishlist(product.id);
  const seller = product.seller;

  // Get similar products
  const similarProducts = marketplaceService
    .getProducts()
    .filter((p) => p.id !== product.id && (p.category_id === product.category_id || p.seller_id === product.seller_id))
    .slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/checkout');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2000);
    }
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason.trim()) return;
    marketplaceService.createReport({
      reporter_id: 'guest',
      reporter_name: 'Concerned Buyer',
      target_type: 'product',
      target_id: product.id,
      target_title: product.name,
      reason: reportReason.trim(),
      status: 'pending',
    });
    setReportSubmitted(true);
    setTimeout(() => {
      setReportSubmitted(false);
      setReportModalOpen(false);
      setReportReason('');
    }, 1800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb / Back button */}
      <div className="flex items-center justify-between text-xs text-stone-500">
        <Link to="/explore" className="inline-flex items-center gap-1 hover:text-brand-600 font-semibold">
          <ArrowLeft className="w-4 h-4" />
          Back to marketplace
        </Link>
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-sand-200 text-stone-700 hover:bg-sand-50 transition"
        >
          <Share2 className="w-3.5 h-3.5 text-stone-500" />
          {shareToast ? 'Link Copied!' : 'Share Piece'}
        </button>
      </div>

      {/* Main Product Showcase: Left Gallery + Right Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        {/* Left: Images */}
        <div className="space-y-4">
          <div className="aspect-[4/4.5] w-full rounded-4xl overflow-hidden bg-sand-100 border border-sand-200 shadow-soft-sm relative">
            <img
              src={product.images[selectedImage] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            {product.featured && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-stone-900/90 backdrop-blur-md text-amber-300 text-xs font-bold">
                Featured Drop
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition ${
                    selectedImage === idx ? 'border-brand-500 shadow-sm' : 'border-sand-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info, Price, Actions */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Seller Bar */}
            {seller && (
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-sand-50 border border-sand-200/80">
                <Link to={`/seller/${seller.id}`} className="flex items-center gap-3 group">
                  <img
                    src={seller.logo}
                    alt={seller.store_name}
                    className="w-10 h-10 rounded-xl object-cover border border-sand-200"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-stone-900 group-hover:text-brand-600 transition">
                        {seller.store_name}
                      </h4>
                      {seller.verification_status === 'approved' && <VerifiedBadge size="sm" />}
                    </div>
                    <span className="text-[11px] text-stone-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-stone-400" />
                      {seller.city} • <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {seller.rating.toFixed(1)}
                    </span>
                  </div>
                </Link>

                <Link
                  to={`/seller/${seller.id}`}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-900 hover:text-white border border-sand-200 text-stone-800 text-xs font-bold transition"
                >
                  Visit Store
                </Link>
              </div>
            )}

            {/* Product Title & City */}
            <div>
              <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
                <span>{product.category?.name || 'Handmade'}</span>
                <span>•</span>
                <span className="font-semibold text-stone-700 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-brand-600" />
                  Made in {product.city}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-stone-950 font-display leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Price section */}
            <div className="flex items-baseline gap-3 pt-2">
              <span className="text-3xl font-black text-stone-950">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.original_price && product.original_price > product.price && (
                <>
                  <span className="text-base text-stone-400 line-through">
                    ₹{product.original_price.toLocaleString('en-IN')}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 font-bold text-xs border border-rose-200">
                    {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Stock indicator */}
            <div className="text-xs">
              {product.stock > 0 ? (
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  In Stock ({product.stock} available directly from maker)
                </span>
              ) : (
                <span className="text-rose-600 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Temporarily Sold Out
                </span>
              )}
            </div>

            {/* Description */}
            <div className="pt-3 border-t border-sand-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">About this piece</h4>
              <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* Selluy Guarantee Pill */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-300/60 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs text-stone-800">
                <span className="font-bold block">Selluy Direct Guarantee</span>
                Direct contact with indie creator. No drop-shipped or factory duplicates.
              </div>
            </div>
          </div>

          {/* Quantity & CTA Bar */}
          <div className="pt-6 border-t border-sand-200 space-y-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-sand-300 rounded-2xl bg-sand-50 p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-xl bg-white hover:bg-sand-100 text-stone-800 font-bold flex items-center justify-center transition"
                >
                  -
                </button>
                <span className="w-10 text-center font-bold text-sm text-stone-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-8 h-8 rounded-xl bg-white hover:bg-sand-100 text-stone-800 font-bold flex items-center justify-center transition"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => toggleWishlist(product)}
                className={`p-3 rounded-2xl border transition flex items-center justify-center ${
                  isFavorited
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : 'bg-white border-sand-200 text-stone-700 hover:bg-sand-50'
                }`}
                title="Save for later"
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-rose-500' : ''}`} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="w-full py-3.5 px-6 rounded-full bg-sand-100 hover:bg-sand-200/90 text-stone-900 font-bold text-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4" />
                {addedToast ? 'Added to Bag ✓' : 'Add to Bag'}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="w-full py-3.5 px-6 rounded-full bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-md transition disabled:opacity-50"
              >
                Buy Now Direct
              </button>
            </div>

            {/* Report Button */}
            <div className="text-center pt-2">
              <button
                onClick={() => setReportModalOpen(true)}
                className="text-[11px] text-stone-400 hover:text-stone-600 inline-flex items-center gap-1"
              >
                <Flag className="w-3 h-3" />
                Report this listing
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Similar creations */}
      {similarProducts.length > 0 && (
        <section className="pt-10 border-t border-sand-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-stone-950 font-display">More From This Creator & Category</h3>
            <Link to="/explore" className="text-xs font-bold text-brand-600 hover:underline">
              See more
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {similarProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-sand-200 space-y-4">
            <h3 className="text-base font-bold text-stone-900">Report Listing to Selluy Moderation</h3>
            <p className="text-xs text-stone-500">
              Help us maintain authentic Indian creators and keep our community free of low-quality dropshipping.
            </p>

            {reportSubmitted ? (
              <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold text-center">
                Report submitted for administrative review. Thank you!
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-3">
                <textarea
                  rows={3}
                  placeholder="Describe the issue (e.g. copyright, unauthentic handmade claim, misleading photos)..."
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-sand-300 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  required
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(false)}
                    className="px-4 py-2 rounded-full bg-sand-100 text-xs font-bold text-stone-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-full bg-rose-600 text-xs font-bold text-white hover:bg-rose-500"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
