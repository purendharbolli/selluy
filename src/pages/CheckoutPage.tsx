import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  MapPin,
  Package,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { marketplaceService } from '../services/marketplaceService';
import { ShippingAddress, Order } from '../types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, subtotal, deliveryEstimate, total, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  // Pure zero-fake-data: Initialize only from genuine authenticated user profile
  const [formData, setFormData] = useState<ShippingAddress>({
    name: user?.name || '',
    phone: user?.phone ? `+91 ${user.phone}` : '+91 ',
    address_line: '',
    city: user?.city || 'Hyderabad',
    state: '',
    pincode: '',
    delivery_notes: '',
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

    setTimeout(async () => {
      // Create real order in marketplace service
      const newOrder = await marketplaceService.createOrder({
        buyer_id: user?.id || 'usr-buyer-guest',
        buyer_name: formData.name,
        buyer_email: user?.email || '',
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
    }, 1000);
  };

  // If order completed, show confirmation screen
  if (completedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md"
        >
          <CheckCircle2 className="w-10 h-10" />
        </motion.div>

        <div>
          <Badge variant="success" size="md" dot className="mb-2">
            Order Placed Successfully
          </Badge>
          <h1 className="text-3xl font-black text-stone-950 font-display mt-1">
            Thank you, {completedOrder.shipping_address.name}!
          </h1>
          <p className="text-sm text-stone-600 mt-2">
            Your order <strong className="text-stone-900">#{completedOrder.id}</strong> has been transmitted directly to the creator studio.
          </p>
        </div>

        {/* Order Details Receipt */}
        <div className="bg-white rounded-3xl p-6 border border-sand-200/90 text-left shadow-soft-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-sand-100 text-xs">
            <span className="font-bold text-stone-400 uppercase">Status</span>
            <Badge variant="brand" size="sm">
              Confirmed ({completedOrder.payment_method === 'cod' ? 'COD' : 'Direct Order'})
            </Badge>
          </div>

          <div className="text-xs space-y-1.5 text-stone-600">
            <p><strong>Deliver to:</strong> {completedOrder.shipping_address.address_line}, {completedOrder.shipping_address.city} {completedOrder.shipping_address.pincode ? `- ${completedOrder.shipping_address.pincode}` : ''}</p>
            <p><strong>Phone:</strong> {completedOrder.shipping_address.phone}</p>
            <p><strong>Payment Mode:</strong> {completedOrder.payment_method === 'cod' ? 'Cash on Delivery' : 'Simulated Direct Checkout'}</p>
          </div>

          <div className="pt-3 border-t border-sand-100 space-y-2">
            <span className="text-xs font-bold text-stone-400 uppercase">Items Ordered:</span>
            {completedOrder.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <span className="font-semibold text-stone-800">
                  {item.quantity}x {item.product?.name || `Piece #${item.product_id}`}
                </span>
                <span className="font-bold text-stone-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
              </div>
            ))}
            <div className="flex justify-between items-center text-sm font-black pt-2 border-t border-sand-100">
              <span>Total:</span>
              <span className="text-blue-600">₹{completedOrder.total_amount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link to="/explore" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto shadow-md">
              Discover More Creations
            </Button>
          </Link>
          {user?.role === 'seller' && (
            <Link to="/seller/dashboard" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Go to Seller Studio
              </Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-sand-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-950 font-display">
            Direct Checkout
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Safe &amp; direct fulfillment from verified local makers
          </p>
        </div>
        <Link
          to="/cart"
          className="text-xs font-bold text-stone-600 hover:text-blue-600 flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Bag
        </Link>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Delivery Address & Payment */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Delivery Details */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200/90 shadow-soft-sm space-y-4">
            <div className="flex items-center justify-between border-b border-sand-100 pb-3">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-600" />
                1. Delivery Destination
              </h3>
              <span className="text-xs text-stone-500 font-medium">Step 1 of 2</span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    name="name"
                    placeholder="Recipient's name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-sand-300 text-sm focus:ring-2 focus:ring-blue-500/40 focus:border-blue-600 bg-sand-50/50 shadow-xs transition"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    name="phone"
                    placeholder="+91 10-digit number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-sand-300 text-sm focus:ring-2 focus:ring-blue-500/40 focus:border-blue-600 bg-sand-50/50 shadow-xs transition"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Street Address / House No. *</label>
                <input
                  type="text"
                  required
                  name="address_line"
                  placeholder="Apartment, flat, building, street, area"
                  value={formData.address_line}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-sand-300 text-sm focus:ring-2 focus:ring-blue-500/40 focus:border-blue-600 bg-sand-50/50 shadow-xs transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-sand-300 text-sm focus:ring-2 focus:ring-blue-500/40 focus:border-blue-600 bg-sand-50/50 shadow-xs transition"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    name="state"
                    placeholder="e.g. Telangana"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-sand-300 text-sm focus:ring-2 focus:ring-blue-500/40 focus:border-blue-600 bg-sand-50/50 shadow-xs transition"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">PIN Code *</label>
                  <input
                    type="text"
                    required
                    name="pincode"
                    placeholder="6 digits"
                    value={formData.pincode}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-sand-300 text-sm focus:ring-2 focus:ring-blue-500/40 focus:border-blue-600 bg-sand-50/50 shadow-xs transition"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Delivery Notes (Optional)</label>
                <input
                  type="text"
                  name="delivery_notes"
                  placeholder="e.g. Call before arrival or leave with neighbor"
                  value={formData.delivery_notes}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-sand-300 text-sm focus:ring-2 focus:ring-blue-500/40 focus:border-blue-600 bg-sand-50/50 shadow-xs transition"
                />
              </div>
            </div>
          </div>

          {/* 2. Payment Method Selector */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200/90 shadow-soft-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                2. Payment Method
              </h3>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Direct Settlement
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <label
                className={`p-4 rounded-2xl border cursor-pointer flex flex-col justify-between transition-all ${
                  paymentMethod === 'test_upi'
                    ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                    : 'border-sand-200 hover:bg-sand-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <QrCode className="w-5 h-5 text-blue-600" />
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'test_upi'}
                    onChange={() => setPaymentMethod('test_upi')}
                    className="accent-blue-600"
                  />
                </div>
                <div>
                  <span className="font-bold text-xs text-stone-900 block">UPI Direct</span>
                  <span className="text-[10px] text-stone-500">GPay, PhonePe, Paytm</span>
                </div>
              </label>

              <label
                className={`p-4 rounded-2xl border cursor-pointer flex flex-col justify-between transition-all ${
                  paymentMethod === 'test_card'
                    ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                    : 'border-sand-200 hover:bg-sand-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'test_card'}
                    onChange={() => setPaymentMethod('test_card')}
                    className="accent-blue-600"
                  />
                </div>
                <div>
                  <span className="font-bold text-xs text-stone-900 block">Debit / Credit Card</span>
                  <span className="text-[10px] text-stone-500">RuPay, Visa, Mastercard</span>
                </div>
              </label>

              <label
                className={`p-4 rounded-2xl border cursor-pointer flex flex-col justify-between transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                    : 'border-sand-200 hover:bg-sand-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="accent-blue-600"
                  />
                </div>
                <div>
                  <span className="font-bold text-xs text-stone-900 block">Cash on Delivery</span>
                  <span className="text-[10px] text-stone-500">Pay at your doorstep</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-sand-200/90 shadow-soft-sm space-y-5">
          <h3 className="font-black text-stone-950 text-base font-display pb-3 border-b border-sand-100">
            Order Summary ({cart.reduce((s, i) => s + i.quantity, 0)} pieces)
          </h3>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {cart.map(({ product, quantity }) => (
              <div key={product.id} className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-12 h-12 rounded-xl object-cover border border-sand-200 shrink-0"
                  />
                  <div>
                    <h5 className="font-bold text-stone-900 line-clamp-1">{product.name}</h5>
                    <span className="text-stone-500">
                      Qty: {quantity} • from {product.city}
                    </span>
                  </div>
                </div>
                <span className="font-bold text-stone-900 shrink-0">
                  ₹{(product.price * quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-sand-100 pt-3 space-y-2 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal</span>
              <span className="font-bold text-stone-900">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Local Creator Delivery</span>
              <span className="font-bold text-emerald-600">
                {deliveryEstimate === 0 ? 'FREE' : `₹${deliveryEstimate}`}
              </span>
            </div>
            <div className="flex justify-between text-base font-black text-stone-950 pt-2 border-t border-sand-100">
              <span>Total Payable</span>
              <span className="text-blue-600 font-display">₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <Button
            type="submit"
            isLoading={isProcessing}
            size="lg"
            className="w-full py-4 shadow-md text-sm"
          >
            Confirm &amp; Place Order
          </Button>

          <p className="text-[11px] text-stone-400 text-center flex items-center justify-center gap-1.5 pt-1">
            <Lock className="w-3.5 h-3.5 text-stone-400" />
            256-bit encrypted direct order transmission
          </p>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
