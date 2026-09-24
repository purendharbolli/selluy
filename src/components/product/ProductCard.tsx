import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Plus, MapPin } from 'lucide-react';
import { Product } from '../../types';
import { VerifiedBadge } from '../common/Badge';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: Product;
  highlightCity?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, highlightCity }) => {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const isFavorited = isInWishlist(product.id);
  const isLocal = highlightCity && product.city.toLowerCase() === highlightCity.toLowerCase();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="group relative bg-white rounded-3xl border border-sand-200/90 overflow-hidden shadow-soft-sm hover:shadow-soft-lg transition-all duration-300 flex flex-col"
    >
      {/* Product Image & Badges */}
      <Link to={`/product/${product.id}`} className="relative aspect-[4/4.5] w-full overflow-hidden bg-sand-100 block">
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Wishlist Button with Motion Spring */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.75 }}
          whileHover={{ scale: 1.1 }}
          onClick={handleToggleWishlist}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 backdrop-blur-md shadow-xs flex items-center justify-center text-stone-700 hover:text-rose-500 transition cursor-pointer z-10"
          aria-label="Add to wishlist"
        >
          <Heart
            className={`w-4 h-4 transition ${
              isFavorited ? 'fill-rose-500 text-rose-500' : 'text-stone-700'
            }`}
          />
        </motion.button>

        {/* Location & Status Pills */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5 items-center z-10">
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-md shadow-xs ${
              isLocal
                ? 'bg-blue-600/90 text-white font-bold border border-blue-400'
                : 'bg-white/90 text-stone-800'
            }`}
          >
            <MapPin className={`w-3 h-3 ${isLocal ? 'text-white' : 'text-stone-600'}`} />
            {product.city}
            {isLocal && <span className="ml-0.5 text-[9px] uppercase tracking-wide">Nearby</span>}
          </span>
        </div>
      </Link>

      {/* Product Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Creator Info */}
          {product.seller && (
            <div className="flex items-center justify-between mb-1.5">
              <Link
                to={`/seller/${product.seller.id}`}
                className="text-xs font-semibold text-stone-600 hover:text-blue-600 truncate max-w-[170px]"
              >
                {product.seller.store_name}
              </Link>
              {product.seller.verification_status === 'approved' && (
                <VerifiedBadge size="sm" showText={false} />
              )}
            </div>
          )}

          {/* Product Title */}
          <Link to={`/product/${product.id}`} className="block">
            <h3 className="text-sm font-bold text-stone-900 group-hover:text-blue-600 transition line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Price & Add to Cart */}
        <div className="mt-3 pt-3 border-t border-sand-100 flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-extrabold text-stone-950">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.original_price && product.original_price > product.price && (
              <span className="text-xs text-stone-400 line-through">
                ₹{product.original_price.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <motion.button
            type="button"
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.08 }}
            onClick={handleQuickAdd}
            className="w-8 h-8 rounded-full bg-sand-100 hover:bg-blue-600 hover:text-white text-stone-800 flex items-center justify-center transition-colors shadow-xs cursor-pointer"
            title="Quick add to bag"
            aria-label="Add to cart"
          >
            <Plus className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
