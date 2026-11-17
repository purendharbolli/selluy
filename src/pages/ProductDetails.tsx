import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Share2,
  MapPin,
  ShoppingBag,
  ShieldCheck,
  ArrowLeft,
  AlertCircle,
  Star,
  CheckCircle2,
  Truck,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { marketplaceService } from '../services/marketplaceService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { VerifiedBadge } from '../components/common/VerifiedBadge';
import { ProductCard } from '../components/product/ProductCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Review } from '../types';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [product, setProduct] = useState(marketplaceService.getProductById(id || ''));
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [addedToast, setAddedToast] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  // Review Form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const loadProductData = () => {
    if (!id) return;
    const p = marketplaceService.getProductById(id);
    setProduct(p);
    setReviews(marketplaceService.getReviewsByProduct(id));
  };

  useEffect(() => {
    loadProductData();
    const unsub = marketplaceService.subscribe(loadProductData);
    return () => unsub();
  }, [id]);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-black text-stone-900 mb-2 font-display">Piece Not Found</h2>
        <p className="text-stone-500 text-sm mb-6">
          This piece may have been reserved, out of stock, or removed by the creator.
        </p>
        <Link to="/explore">
          <Button size="md">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Explore Other Creations
          </Button>
        </Link>
      </div>
    );
  }

  const isFavorited = isInWishlist(product.id);
  const seller = product.seller;
  const hasPurchased = user ? marketplaceService.hasUserPurchasedProduct(user.id, product.id) : false;

  // Get similar approved products
  const similarProducts = marketplaceService
    .getPublicProducts()
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

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setIsSubmittingReview(true);
    try {
      await marketplaceService.addReview({
        user_id: user.id,
        user_name: user.name,
        user_avatar: user.avatar,
        product_id: product.id,
        seller_id: product.seller_id,
        rating: newRating,
        comment: newComment.trim(),
        verified_purchase: true,
      });
      setNewComment('');
      setShowReviewForm(false);
      loadProductData();
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb / Back button */}
      <div className="flex items-center justify-between text-xs text-stone-500">
        <Link to="/explore" className="inline-flex items-center gap-1 hover:text-blue-600 font-semibold transition">
          <ArrowLeft className="w-4 h-4" />
          Back to marketplace
        </Link>
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-sand-200 text-stone-700 hover:bg-sand-50 transition cursor-pointer shadow-xs text-xs font-semibold"
        >
          <Share2 className="w-3.5 h-3.5 text-stone-500" />
          {shareToast ? 'Link Copied!' : 'Share Piece'}
        </button>
      </div>

      {/* Main Product Showcase: Left Gallery + Right Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        {/* Left: Images */}
        <div className="space-y-4">
          <div className="aspect-[4/4.5] w-full rounded-4xl overflow-hidden bg-sand-100 border border-sand-200/90 shadow-soft-sm relative">
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
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition cursor-pointer ${
                    selectedImage === idx ? 'border-blue-600 shadow-sm' : 'border-sand-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info, Price, Actions */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Category & City */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-blue-600 font-bold uppercase tracking-wider">
                {product.category?.name || 'Craft'}
              </span>
              <span className="text-stone-300">•</span>
              <Badge variant="secondary" size="sm">
                <MapPin className="w-3 h-3 text-stone-500 mr-1" />
                {product.city}
              </Badge>
            </div>

            {/* Creator snippet card */}
            {seller && (
              <div className="p-4 rounded-3xl bg-white border border-sand-200/90 shadow-soft-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={seller.logo}
                    alt={seller.store_name}
                    className="w-11 h-11 rounded-2xl object-cover border border-sand-200"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-stone-950 text-sm font-display">{seller.store_name}</h4>
                      {seller.verification_status === 'approved' && (
                        <VerifiedBadge size="sm" showText={false} />
                      )}
                    </div>
                    <p className="text-[11px] text-stone-500">Studio in {seller.city}</p>
                  </div>
                </div>

                <Link
                  to={`/seller/${seller.id}`}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  View Studio
                </Link>
              </div>
            )}

            {/* Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-stone-950 font-display leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Price section */}
            <div className="flex items-baseline gap-3 pt-2">
              <span className="text-3xl sm:text-4xl font-black text-stone-950 font-display">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.original_price && product.original_price > product.price && (
                <>
                  <span className="text-base text-stone-400 line-through">
                    ₹{product.original_price.toLocaleString('en-IN')}
                  </span>
                  <Badge variant="brand" size="sm">
                    {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
                  </Badge>
                </>
              )}
            </div>

            {/* Stock indicator */}
            <div className="text-xs">
              {product.stock > 0 ? (
                <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  In Stock ({product.stock} available directly from studio)
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

            {/* Selloi Guarantee & Delivery Pill */}
            <div className="p-4 rounded-3xl bg-blue-50/60 border border-blue-200/80 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-xs text-stone-800">
                <span className="font-bold block text-stone-950">Selloi Direct Guarantee</span>
                Handcrafted or curated locally in {product.city}. Direct creator contact with verified studio provenance.
              </div>
            </div>
          </div>

          {/* Quantity & CTA Bar */}
          <div className="pt-6 border-t border-sand-200 space-y-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-sand-300 rounded-2xl bg-sand-50/80 p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-xl bg-white hover:bg-sand-100 text-stone-800 font-bold flex items-center justify-center transition cursor-pointer"
                >
                  -
                </button>
                <span className="w-10 text-center font-bold text-sm text-stone-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-8 h-8 rounded-xl bg-white hover:bg-sand-100 text-stone-800 font-bold flex items-center justify-center transition cursor-pointer"
                >
                  +
                </button>
              </div>

              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={() => toggleWishlist(product)}
                className={`p-3 rounded-2xl border transition flex items-center justify-center cursor-pointer ${
                  isFavorited
                    ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-xs'
                    : 'bg-white border-sand-200 text-stone-700 hover:bg-sand-50'
                }`}
                title="Save for later"
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-rose-500' : ''}`} />
              </motion.button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant="secondary"
                size="lg"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="w-full"
              >
                <ShoppingBag className="w-4 h-4 mr-1.5" />
                {addedToast ? 'Added to Bag ✓' : 'Add to Bag'}
              </Button>

              <Button
                size="lg"
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="w-full shadow-md"
              >
                Buy Now Direct
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* REVIEWS & VERIFIED FEEDBACK SECTION (Strictly Real Data) */}
      <section className="pt-10 border-t border-sand-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <h3 className="text-xl sm:text-2xl font-black text-stone-950 font-display">
                Customer Reviews ({reviews.length})
              </h3>
            </div>
            <p className="text-xs text-stone-500">
              Honest feedback strictly from customers who completed real verified purchases.
            </p>
          </div>

          {hasPurchased && !showReviewForm && (
            <Button
              size="sm"
              onClick={() => setShowReviewForm(true)}
            >
              Write Verified Review
            </Button>
          )}
        </div>

        {/* Verified Purchase Review Form */}
        <AnimatePresence>
          {showReviewForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-3xl p-6 border border-sand-200 shadow-soft-sm mb-6 max-w-xl"
            >
              <h4 className="text-sm font-bold text-stone-900 mb-3">Share your verified purchase experience</h4>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Rating</label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className="p-1 text-stone-400 hover:text-amber-400 focus:outline-none transition cursor-pointer"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Your Review</label>
                  <textarea
                    rows={3}
                    required
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Describe the craftsmanship, quality, and delivery experience..."
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-sand-300 text-xs focus:ring-2 focus:ring-blue-500/40 focus:border-blue-600 bg-sand-50/50"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowReviewForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    isLoading={isSubmittingReview}
                  >
                    Submit Review
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reviews List or Honest Empty State */}
        {reviews.length > 0 ? (
          <div className="space-y-3 max-w-2xl">
            {reviews.map((rev) => (
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
            ))}
          </div>
        ) : (
          /* SECTION 30: ZERO REVIEWS HONEST EMPTY STATE */
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-sand-200/90 shadow-soft-sm max-w-xl mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-sand-100 flex items-center justify-center mx-auto mb-3 text-stone-400">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-stone-950 font-display">No reviews yet</h4>
            <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto leading-relaxed">
              Be the first verified customer to share feedback after purchasing this piece directly from {seller?.store_name || 'the studio'}.
            </p>
          </div>
        )}
      </section>

      {/* Similar creations */}
      {similarProducts.length > 0 && (
        <section className="pt-10 border-t border-sand-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-stone-950 font-display">More From This Creator &amp; Category</h3>
            <Link to="/explore" className="text-xs font-bold text-blue-600 hover:underline">
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
    </div>
  );
};

export default ProductDetails;
