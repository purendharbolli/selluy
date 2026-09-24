import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ShoppingBag,
  DollarSign,
  Clock,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  MapPin,
  ExternalLink,
  Store,
  Layers,
  Settings,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { marketplaceService } from '../services/marketplaceService';
import { useAuth } from '../context/AuthContext';
import { Product, OrderStatus } from '../types';
import { VerifiedBadge, OrderStatusBadge } from '../components/common/Badge';

export const SellerDashboardPage: React.FC = () => {
  const { user, sellerProfile, updateSellerProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'settings'>('overview');

  // If no profile yet, fall back to first seller for demo convenience
  const currentSeller = sellerProfile || marketplaceService.getSellers()[0];

  const sellerProducts = marketplaceService.getProductsBySeller(currentSeller.id);
  const sellerOrders = marketplaceService.getOrdersBySeller(currentSeller.id);
  const categories = marketplaceService.getCategories();

  // Metrics
  const totalProducts = sellerProducts.length;
  const activeProducts = sellerProducts.filter((p) => p.active).length;
  const totalOrders = sellerOrders.length;
  const pendingOrders = sellerOrders.filter((o) => o.status === 'pending' || o.status === 'confirmed').length;
  const totalRevenue = sellerOrders.reduce((acc, o) => {
    const sellerItems = o.items.filter((i) => i.seller_id === currentSeller.id);
    return acc + sellerItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, 0);

  // Product Add / Edit modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: 999,
    original_price: 1200,
    stock: 10,
    category_id: categories[0]?.id || 'cat-fashion',
    images: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    city: currentSeller.city,
    active: true,
  });

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    store_name: currentSeller.store_name,
    description: currentSeller.description,
    city: currentSeller.city,
    social_link: currentSeller.social_link || '',
    logo: currentSeller.logo,
  });
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);

  const openAddModal = () => {
    setEditingProductId(null);
    setProductForm({
      name: '',
      description: '',
      price: 850,
      original_price: 1100,
      stock: 12,
      category_id: categories[0]?.id || 'cat-fashion',
      images: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
      city: currentSeller.city,
      active: true,
    });
    setIsProductModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProductId(p.id);
    setProductForm({
      name: p.name,
      description: p.description,
      price: p.price,
      original_price: p.original_price || p.price,
      stock: p.stock,
      category_id: p.category_id,
      images: p.images[0] || '',
      city: p.city,
      active: p.active,
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProductId) {
      marketplaceService.updateProduct(editingProductId, {
        name: productForm.name,
        description: productForm.description,
        price: Number(productForm.price),
        original_price: Number(productForm.original_price),
        stock: Number(productForm.stock),
        category_id: productForm.category_id,
        images: [productForm.images],
        active: productForm.active,
      });
    } else {
      marketplaceService.createProduct({
        seller_id: currentSeller.id,
        category_id: productForm.category_id,
        name: productForm.name,
        description: productForm.description,
        price: Number(productForm.price),
        original_price: Number(productForm.original_price),
        stock: Number(productForm.stock),
        images: [productForm.images],
        city: currentSeller.city,
        active: true,
      });
    }
    setIsProductModalOpen(false);
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('Are you sure you want to delete this piece?')) {
      marketplaceService.deleteProduct(id);
    }
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    marketplaceService.updateOrderStatus(orderId, newStatus);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSellerProfile(settingsForm);
    marketplaceService.saveSellers();
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-sand-200">
        <div className="flex items-center gap-4">
          <img
            src={currentSeller.logo}
            alt={currentSeller.store_name}
            className="w-14 h-14 rounded-2xl object-cover border border-sand-200 shadow-xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-stone-950 font-display">
                {currentSeller.store_name} Studio
              </h1>
              {currentSeller.verification_status === 'approved' ? (
                <VerifiedBadge size="sm" />
              ) : (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  Verification Pending
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-brand-600" />
              Based in {currentSeller.city} • Manage products, fulfill direct orders
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/seller/${currentSeller.id}`}
            className="px-4 py-2 rounded-2xl bg-white border border-sand-300 text-stone-700 hover:bg-sand-50 text-xs font-bold flex items-center gap-1.5 transition"
          >
            <span>Public Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Add New Creation
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-sand-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-stone-900 text-white'
              : 'text-stone-600 hover:bg-sand-100'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Studio Overview
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'products'
              ? 'bg-stone-900 text-white'
              : 'text-stone-600 hover:bg-sand-100'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          Creations Catalog ({totalProducts})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'orders'
              ? 'bg-stone-900 text-white'
              : 'text-stone-600 hover:bg-sand-100'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          Orders ({totalOrders})
          {pendingOrders > 0 && (
            <span className="w-4 h-4 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center">
              {pendingOrders}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'settings'
              ? 'bg-stone-900 text-white'
              : 'text-stone-600 hover:bg-sand-100'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          Store Profile Settings
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-sand-200/90 shadow-soft-sm space-y-1">
              <span className="text-stone-400 text-xs font-bold uppercase tracking-wider block">
                Total Revenue
              </span>
              <span className="text-2xl sm:text-3xl font-black text-stone-950 block">
                ₹{totalRevenue.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                Direct to creator
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-sand-200/90 shadow-soft-sm space-y-1">
              <span className="text-stone-400 text-xs font-bold uppercase tracking-wider block">
                Orders Received
              </span>
              <span className="text-2xl sm:text-3xl font-black text-stone-950 block">
                {totalOrders}
              </span>
              <span className="text-[11px] text-stone-500">
                {pendingOrders} need fulfillment
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-sand-200/90 shadow-soft-sm space-y-1">
              <span className="text-stone-400 text-xs font-bold uppercase tracking-wider block">
                Active Listings
              </span>
              <span className="text-2xl sm:text-3xl font-black text-stone-950 block">
                {activeProducts}
              </span>
              <span className="text-[11px] text-stone-500">{totalProducts} total in catalog</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-sand-200/90 shadow-soft-sm space-y-1">
              <span className="text-stone-400 text-xs font-bold uppercase tracking-wider block">
                Creator Rating
              </span>
              <span className="text-2xl sm:text-3xl font-black text-stone-950 block">
                {currentSeller.rating.toFixed(1)} ★
              </span>
              <span className="text-[11px] text-amber-600 font-semibold">
                {currentSeller.total_reviews} verified reviews
              </span>
            </div>
          </div>

          {/* Recent Orders quick preview */}
          <div className="bg-white rounded-3xl p-6 border border-sand-200/90 shadow-soft-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-stone-900">Recent Customer Orders</h3>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-xs font-bold text-brand-600 hover:underline"
              >
                View all orders
              </button>
            </div>

            {sellerOrders.length > 0 ? (
              <div className="divide-y divide-sand-100">
                {sellerOrders.slice(0, 3).map((o) => (
                  <div key={o.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-stone-900">#{o.id}</strong>
                        <span className="text-stone-500">by {o.buyer_name || 'Buyer'}</span>
                        <OrderStatusBadge status={o.status} />
                      </div>
                      <span className="text-stone-400 block mt-0.5">
                        {new Date(o.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} • Deliver to {o.shipping_address.city}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-extrabold text-stone-900 text-sm">
                        ₹{o.total_amount.toLocaleString('en-IN')}
                      </span>
                      <select
                        value={o.status}
                        onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value as any)}
                        className="px-2.5 py-1 rounded-xl border border-sand-300 text-xs font-semibold bg-sand-50"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-500 py-4 text-center">No orders received yet.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-stone-900">Creations Catalog</h2>
              <p className="text-xs text-stone-500">Add, edit, or adjust stock on your public listings</p>
            </div>
            <button
              onClick={openAddModal}
              className="px-4 py-2 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-sand-200/90 shadow-soft-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-sand-50 text-stone-500 font-bold border-b border-sand-200">
                  <tr>
                    <th className="p-4">Piece</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-100 text-stone-700">
                  {sellerProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-sand-50/50">
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-12 h-12 rounded-xl object-cover bg-sand-100 border border-sand-200"
                        />
                        <div>
                          <strong className="text-stone-900 block line-clamp-1">{p.name}</strong>
                          <span className="text-[10px] text-stone-400">ID: {p.id}</span>
                        </div>
                      </td>
                      <td className="p-4 font-medium">{p.category?.name || 'Handmade'}</td>
                      <td className="p-4 font-bold text-stone-900">₹{p.price}</td>
                      <td className="p-4">
                        <span className={`font-semibold ${p.stock < 5 ? 'text-rose-600' : 'text-stone-700'}`}>
                          {p.stock} units
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {p.active ? 'Live' : 'Hidden'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-sand-100"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-stone-900">Direct Customer Orders</h2>
            <p className="text-xs text-stone-500">Track and dispatch customer orders seamlessly</p>
          </div>

          <div className="space-y-4">
            {sellerOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-5 border border-sand-200/90 shadow-soft-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-sand-100 gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-sm text-stone-950">Order #{order.id}</span>
                    <OrderStatusBadge status={order.status} />
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-stone-400">
                      {new Date(order.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                    </span>
                    <select
                      value={order.status}
                      onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as any)}
                      className="px-3 py-1.5 rounded-xl border border-sand-300 text-xs font-bold bg-sand-50"
                    >
                      <option value="pending">Mark as Pending</option>
                      <option value="confirmed">Confirm Order</option>
                      <option value="processing">Crafting / Packing</option>
                      <option value="shipped">Mark Shipped</option>
                      <option value="delivered">Mark Delivered</option>
                      <option value="cancelled">Cancel Order</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="font-bold text-stone-400 uppercase text-[10px] block mb-1">
                      Customer & Shipping Details
                    </span>
                    <p className="font-bold text-stone-900">{order.shipping_address.name}</p>
                    <p className="text-stone-600">{order.shipping_address.address_line}</p>
                    <p className="text-stone-600">
                      {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}
                    </p>
                    <p className="text-stone-600 mt-1">Phone: {order.shipping_address.phone}</p>
                  </div>

                  <div>
                    <span className="font-bold text-stone-400 uppercase text-[10px] block mb-1">
                      Ordered Creations
                    </span>
                    <div className="space-y-1.5">
                      {order.items
                        .filter((i) => i.seller_id === currentSeller.id)
                        .map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center">
                            <span className="text-stone-800">
                              {item.quantity}x {item.product?.name || `Product #${item.product_id}`}
                            </span>
                            <span className="font-bold text-stone-900">
                              ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: STORE SETTINGS */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200/90 shadow-soft-sm max-w-2xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-sand-100">
            <h3 className="text-base font-bold text-stone-900">Store Profile Settings</h3>
            {settingsSavedToast && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Changes saved
              </span>
            )}
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Store / Studio Name</label>
              <input
                type="text"
                value={settingsForm.store_name}
                onChange={(e) => setSettingsForm({ ...settingsForm, store_name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-sand-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">City Hub</label>
              <input
                type="text"
                value={settingsForm.city}
                onChange={(e) => setSettingsForm({ ...settingsForm, city: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-sand-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Instagram or Social Link</label>
              <input
                type="text"
                value={settingsForm.social_link}
                onChange={(e) => setSettingsForm({ ...settingsForm, social_link: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-sand-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Brand Logo / Avatar URL</label>
              <input
                type="url"
                value={settingsForm.logo}
                onChange={(e) => setSettingsForm({ ...settingsForm, logo: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-sand-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Studio Story / Bio</label>
              <textarea
                rows={4}
                value={settingsForm.description}
                onChange={(e) => setSettingsForm({ ...settingsForm, description: e.target.value })}
                className="w-full p-3 rounded-xl border border-sand-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-sm transition"
          >
            Save Store Settings
          </button>
        </form>
      )}

      {/* Product Add / Edit Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-sand-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-stone-900 mb-4">
              {editingProductId ? 'Edit Creation' : 'Add New Handcrafted Creation'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Piece Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hand-carved Terracotta Mug"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-sand-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-sand-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    value={productForm.original_price}
                    onChange={(e) => setProductForm({ ...productForm, original_price: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-sand-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Category *</label>
                  <select
                    value={productForm.category_id}
                    onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-sand-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Available Stock *</label>
                  <input
                    type="number"
                    required
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-sand-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Product Photo URL *</label>
                <input
                  type="url"
                  required
                  value={productForm.images}
                  onChange={(e) => setProductForm({ ...productForm, images: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-sand-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
                {productForm.images && (
                  <div className="mt-2 w-16 h-16 rounded-xl overflow-hidden border border-sand-200 bg-sand-50">
                    <img src={productForm.images} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Description & Craftsmanship *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail the materials, sizing, and care..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full p-3 rounded-xl border border-sand-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="activeToggle"
                  checked={productForm.active}
                  onChange={(e) => setProductForm({ ...productForm, active: e.target.checked })}
                  className="rounded text-brand-600"
                />
                <label htmlFor="activeToggle" className="font-bold text-stone-800">
                  Visible on public marketplace
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-sand-100">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-full bg-sand-100 text-stone-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-brand-600 text-white font-bold hover:bg-brand-500"
                >
                  {editingProductId ? 'Update Piece' : 'Publish Piece'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
