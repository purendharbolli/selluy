import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Truck,
  AlertTriangle,
  CreditCard,
  QrCode,
  DollarSign,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { marketplaceService } from '../services/marketplaceService';
import { ShippingAddress, Order } from '../types';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, subtotal, deliveryEstimate, total, clearCart } = useCart();
  const { user } = useAuth();

  const [formData, setFormData] = useState<ShippingAddress>({
    name: user?.name || 'Aarav Patel',
    phone: '+91 98765 43210',
    address_line: 'Flat 402, Green Meadows, Jubilee Hills Road No 36',
    city: user?.city || 'Hyderabad',
    state: 'Telangana',
    pincode: '500033',
    delivery_notes: 'Leave with security guard if not available',
  });

  const [paymentMethod, setPaymentMethod] = useState<'test_upi' | 'test_card' | 'cod'>('test_upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  if (cart.length === 0 && !completedOrder) {
    navigate('/cart');
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      // Create order in service
      const newOrder = marketplaceService.createOrder({
        buyer_id: user?.id || 'usr-buyer-guest',
        buyer_name: formData.name,
        buyer_email: user?.email || 'buyer@example.com',
        total_amount: total,
        shipping_address: formData,
        status: 'pending',
        payment_status: paymentMethod === 'cod' ? 'pending' : 'paid_test_mode',
        payment_method: paymentMethod,
        items: cart.map((item, index) => ({
          id: `item-${Date.now()}-${index}`,
          order_id: '',
          product_id: item.product.id,
          seller_id: item.product.seller_id,
          quantity: item.quantity,
          price: item.product.price,
          product: item.product,
        })),
      });

      clearCart();
      setIsProcessing(false);
      setCompletedOrder(newOrder);
    }, 1200);
  };

  // If order completed, show the beautiful confirmation screen
  if (completedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-600">
            Order Placed Successfully
          </span>
          <h1 className="text-3xl font-black text-stone-950 font-display mt-1">
            Thank you, {completedOrder.shipping_address.name}!
          </h1>
          <p className="text-sm text-stone-600 mt-2">
            Your order <strong className="text-stone-900">#{completedOrder.id}</strong> has been transmitted directly to the creator studios.
          </p>
        </div>

        {/* Order Details Receipt */}
        <div className="bg-white rounded-3xl p-6 border border-sand-200 text-left shadow-soft-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-sand-100 text-xs">
            <span className="font-bold text-stone-400 uppercase">Status</span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold">
              Order Confirmed (Test Mode)
            </span>
          </div>

          <div className="text-xs space-y-1.5 text-stone-600">
            <p><strong>Deliver to:</strong> {completedOrder.shipping_address.address_line}, {completedOrder.shipping_address.city} - {completedOrder.shipping_address.pincode}</p>
            <p><strong>Phone:</strong> {completedOrder.shipping_address.phone}</p>
            <p><strong>Payment Mode:</strong> {completedOrder.payment_method === 'cod' ? 'Cash on Delivery' : 'Simulated Direct Checkout'}</p>
          </div>

          <div className="pt-3 border-t border-sand-100 space-y-2">
            <span className="text-xs font-bold text-stone-400 uppercase">Items Ordered:</span>
            {completedOrder.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <span className="font-semibold text-stone-800">
                  {item.quantity}x {item.product?.name || `Product #${item.product_id}`}
                </span>
                <span className="font-bold text-stone-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
              </div>
            ))}
            <div className="flex justify-between items-center text-sm font-black pt-2 border-t border-sand-100">
              <span>Total Paid:</span>
              <span className="text-brand-600">₹{completedOrder.total_amount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            to="/explore"
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-brand-600 text-white font-bold text-xs hover:bg-brand-500 shadow-md transition"
          >
            Discover More Creations
          </Link>
          <Link
            to="/seller/dashboard"
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-sand-100 text-stone-800 font-bold text-xs hover:bg-sand-200 transition"
          >
            Check Seller Studio Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <Link to="/cart" className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-brand-600 font-semibold">
        <ArrowLeft className="w-4 h-4" />
        Return to shopping bag
      </Link>

      <div className="flex items-center justify-between pb-4 border-b border-sand-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-950 font-display">
            Direct Creator Checkout
          </h1>
          <p className="text-xs text-stone-500">Provide shipping details for doorstep studio delivery</p>
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
          <Lock className="w-3.5 h-3.5" />
          Encrypted
        </div>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Fields: Shipping Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200/90 shadow-soft-sm space-y-5">
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Truck className="w-4 h-4 text-brand-600" />
              1. Delivery Address
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-sand-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Phone Number (For Courier)</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-sand-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-700 mb-1">Street Address / House No.</label>
                <input
                  type="text"
                  name="address_line"
                  required
                  value={formData.address_line}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-sand-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-sand-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">State</label>
                <input
                  type="text"
                  name="state"
                  required
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-sand-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  required
                  value={formData.pincode}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-sand-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Special Delivery Notes</label>
                <input
                  type="text"
                  name="delivery_notes"
                  placeholder="e.g. Call before coming"
                  value={formData.delivery_notes}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-sand-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200/90 shadow-soft-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                2. Payment Method
              </h3>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Development / Test Mode
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                As specified for the startup MVP, this checkout simulates payment handling without real card charges so you can test complete end-to-end fulfillment.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <label
                className={`p-4 rounded-2xl border cursor-pointer flex flex-col justify-between transition ${
                  paymentMethod === 'test_upi'
                    ? 'border-brand-500 bg-brand-50/50'
                    : 'border-sand-200 hover:bg-sand-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <QrCode className="w-5 h-5 text-brand-600" />
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'test_upi'}
                    onChange={() => setPaymentMethod('test_upi')}
                    className="accent-brand-500"
                  />
                </div>
                <div>
                  <span className="font-bold text-xs text-stone-900 block">UPI Instant (Simulated)</span>
                  <span className="text-[10px] text-stone-500">Google Pay, PhonePe, Paytm</span>
                </div>
              </label>

              <label
                className={`p-4 rounded-2xl border cursor-pointer flex flex-col justify-between transition ${
                  paymentMethod === 'test_card'
                    ? 'border-brand-500 bg-brand-50/50'
                    : 'border-sand-200 hover:bg-sand-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <CreditCard className="w-5 h-5 text-brand-600" />
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'test_card'}
                    onChange={() => setPaymentMethod('test_card')}
                    className="accent-brand-500"
                  />
                </div>
                <div>
                  <span className="font-bold text-xs text-stone-900 block">Card / NetBanking</span>
                  <span className="text-[10px] text-stone-500">Simulated test card</span>
                </div>
              </label>

              <label
                className={`p-4 rounded-2xl border cursor-pointer flex flex-col justify-between transition ${
                  paymentMethod === 'cod'
                    ? 'border-brand-500 bg-brand-50/50'
                    : 'border-sand-200 hover:bg-sand-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="w-5 h-5 text-brand-600" />
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="accent-brand-500"
                  />
                </div>
                <div>
                  <span className="font-bold text-xs text-stone-900 block">Cash on Delivery</span>
                  <span className="text-[10px] text-stone-500">Pay directly to creator upon receipt</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Order Summary Column */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-sand-200/90 shadow-soft-sm space-y-4 sticky top-28">
            <h3 className="text-base font-bold text-stone-900 pb-3 border-b border-sand-100">
              Order Breakdown
            </h3>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cart.map(({ product, quantity }) => (
                <div key={product.id} className="flex justify-between items-start text-xs">
                  <div className="space-y-0.5">
                    <span className="font-bold text-stone-900 line-clamp-1">{product.name}</span>
                    <span className="text-stone-500 text-[11px]">
                      Qty: {quantity} • By {product.seller?.store_name}
                    </span>
                  </div>
                  <span className="font-bold text-stone-900">
                    ₹{(product.price * quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-sand-100 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span className="font-bold text-stone-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Direct Delivery</span>
                <span className="font-bold text-stone-900">
                  {deliveryEstimate === 0 ? 'FREE' : `₹${deliveryEstimate}`}
                </span>
              </div>
              <div className="pt-2 border-t border-sand-100 flex justify-between text-base font-black text-stone-950">
                <span>Total Amount</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 px-6 rounded-full bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-md transition disabled:opacity-50"
            >
              {isProcessing ? 'Transmitting Order...' : `Confirm & Place Order (₹${total})`}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
