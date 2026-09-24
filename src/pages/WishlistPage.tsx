import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { ProductCard } from '../components/product/ProductCard';

export const WishlistPage: React.FC = () => {
  const { wishlist } = useCart();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-950 font-display">
          Saved Creations ({wishlist.length})
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Pieces you've bookmarked to buy or support
        </p>
      </div>

      {wishlist.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {wishlist.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-16 text-center border border-sand-200">
          <Heart className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-stone-900">Your wishlist is empty</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-6">
            Explore unique pieces from independent creators and tap the heart icon to save them here.
          </p>
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-brand-600 text-white font-bold text-xs"
          >
            Explore Pieces <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
};
