import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  Heart,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  ArrowLeft,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { VerifiedBadge } from '../components/common/VerifiedBadge';

export const CartPage: React.FC = () => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    toggleWishlist,
    subtotal,
    deliveryEstimate,
    total,
  } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-sand-100 text-stone-400 flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8 text-stone-400" />
        </div>
        <h2 className="text-2xl font-black text-stone-900 mb-2 font-display">Your Bag is Empty</h2>
        <p className="text-stone-500 text-sm max-w-sm mx-auto mb-6">
          Support independent Indian creators by finding something special for yourself or loved ones.
        </p>
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-blue-600 text-white font-bold text-sm shadow-md hover:bg-blue-500 transition"
        >
          Explore Drops <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-sand-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-950 font-display">
            Shopping Bag ({cart.reduce((s, i) => s + i.quantity, 0)})
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Purchasing directly from verified independent studios
          </p>
        </div>
        <Link
          to="/explore"
          className="text-xs font-bold text-stone-600 hover:text-blue-600 flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Item List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="bg-white rounded-3xl p-4 sm:p-5 border border-sand-200/90 shadow-soft-sm flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between"
            >
              {/* Product info + thumbnail */}
              <div className="flex items-center gap-4 flex-1">
                <Link
                  to={`/product/${product.id}`}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-sand-100 shrink-0 border border-sand-200"
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </Link>

                <div className="space-y-1">
                  {product.seller && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wide">
                        {product.seller.store_name}
                      </span>
                      {product.seller.verification_status === 'approved' && (
                        <VerifiedBadge size="sm" showText={false} />
                      )}
                    </div>
                  )}

                  <Link
                    to={`/product/${product.id}`}
                    className="font-bold text-sm text-stone-900 hover:text-blue-600 block line-clamp-1"
                  >
                    {product.name}
                  </Link>

                  <div className="flex items-baseline gap-2 pt-0.5">
                    <span className="text-sm font-black text-stone-950">
                      ₹{(product.price * quantity).toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-stone-400">
                      (₹{product.price} each)
                    </span>
                  </div>
                </div>
              </div>

              {/* Quantity Controls & Remove */}
              <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-sand-100">
                <div className="flex items-center border border-sand-300 rounded-xl bg-sand-50 p-0.5">
                  <button
                    onClick={() => updateQuantity(product.id, quantity - 1)}
                    className="w-7 h-7 rounded-lg bg-white text-stone-800 font-bold text-xs flex items-center justify-center hover:bg-sand-100"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-stone-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                    className="w-7 h-7 rounded-lg bg-white text-stone-800 font-bold text-xs flex items-center justify-center hover:bg-sand-100"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => toggleWishlist(product)}
                  className="p-2 text-stone-400 hover:text-rose-500 rounded-xl hover:bg-sand-50"
                  title="Move to wishlist"
                >
                  <Heart className="w-4 h-4" />
                </button>

                <button
                  onClick={() => removeFromCart(product.id)}
                  className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-sand-50"
                  title="Remove from bag"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-sand-200 shadow-soft-sm space-y-5">
            <h3 className="font-black text-base text-stone-950 font-display border-b border-sand-100 pb-3">
              Order Summary
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal ({cart.length} creations)</span>
                <span className="font-bold text-stone-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Direct Studio Shipping</span>
                <span className="font-bold text-stone-900">
                  {deliveryEstimate === 0 ? 'FREE' : `₹${deliveryEstimate}`}
                </span>
              </div>
              <div className="pt-3 border-t border-sand-100 flex justify-between text-sm">
                <span className="font-black text-stone-950">Total Amount</span>
                <span className="font-black text-stone-950 text-base">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 px-6 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 text-[11px] text-stone-500 space-y-2">
              <p className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Verified direct creator dispatch
              </p>
              <p className="flex items-center gap-1.5 text-stone-600">
                <Truck className="w-4 h-4 text-blue-600" />
                Direct dispatch from local maker studio
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
