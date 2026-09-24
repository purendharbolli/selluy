import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  Share2,
  MapPin,
  ShoppingBag,
  ShieldCheck,
  ArrowLeft,
  AlertCircle,
  Flag,
} from 'lucide-react';
import { marketplaceService } from '../services/marketplaceService';
import { useCart } from '../context/CartContext';
import { VerifiedBadge } from '../components/common/VerifiedBadge';
import { ProductCard } from '../components/product/ProductCard';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();

  const [product, setProduct] = useState(marketplaceService.getProductById(id || ''));
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [addedToast, setAddedToast] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  useEffect(() => {
    const p = marketplaceService.getProductById(id || '');
    setProduct(p);
  }, [id]);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-black text-stone-900 mb-2">Product Not Found</h2>
        <p className="text-stone-500 text-sm mb-6">
          This piece might have been reserved or removed by the creator.
        </p>
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-blue-600 text-white font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Explore Other Creations
        </Link>
      </div>
    );
  }

  const isFavorited = isInWishlist(product.id);
  const seller = product.seller;

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb / Back button */}
      <div className="flex items-center justify-between text-xs text-stone-500">
        <Link to="/explore" className="inline-flex items-center gap-1 hover:text-blue-600 font-semibold">
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
              <span className="inline-flex items-center gap-1 text-stone-600 font-semibold bg-sand-100 px-2.5 py-0.5 rounded-full">
                <MapPin className="w-3 h-3 text-stone-500" />
                {product.city}
              </span>
            </div>

            {/* Creator snippet card */}
            {seller && (
              <div className="p-3.5 rounded-2xl bg-white border border-sand-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={seller.logo}
                    alt={seller.store_name}
                    className="w-10 h-10 rounded-xl object-cover border border-sand-200"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-stone-900 text-sm">{seller.store_name}</h4>
                      {seller.verification_status === 'approved' && (
                        <VerifiedBadge size="sm" showText={false} />
                      )}
                    </div>
                    <p className="text-[11px] text-stone-500">Based in {seller.city}</p>
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
              <span className="text-3xl font-black text-stone-950">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.original_price && product.original_price > product.price && (
                <>
                  <span className="text-base text-stone-400 line-through">
                    ₹{product.original_price.toLocaleString('en-IN')}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200">
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
            <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
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
                className="w-full py-3.5 px-6 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md transition disabled:opacity-50"
              >
                Buy Now Direct
              </button>
            </div>
          </div>
        </div>
      </div>

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
