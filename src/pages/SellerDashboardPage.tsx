import React, { useState, useEffect } from 'react';
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
  Store,
  Layers,
  Settings,
  AlertCircle,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import { marketplaceService } from '../services/marketplaceService';
import { useAuth } from '../context/AuthContext';
import { Product, OrderStatus, ProductStatus } from '../types';
import { VerifiedBadge } from '../components/common/VerifiedBadge';

export const SellerDashboardPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'settings'>('overview');

  // Find user's seller profile or applications
  const [sellerProfile, setSellerProfile] = useState(
    user ? marketplaceService.getSellerByUserId(user.id) : undefined
  );
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState(marketplaceService.getCategories());

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: 999,
    original_price: 1299,
    stock: 10,
    category_id: categories[0]?.id || 'cat-fashion',
    images: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    city: user?.city || 'Hyderabad',
  });

  const [productToast, setProductToast] = useState('');

  // Reload data
  const refreshData = () => {
    if (!user) return;
    const profile = marketplaceService.getSellerByUserId(user.id);
    setSellerProfile(profile);
    if (profile) {
      setSellerProducts(marketplaceService.getProductsBySeller(profile.id));
    }
    setCategories(marketplaceService.getCategories());
  };

  useEffect(() => {
    refreshData();
    const unsub = marketplaceService.subscribe(refreshData);
    return () => unsub();
  }, [user]);

  // Check if seller has a pending application
  const userApplication = user
    ? marketplaceService.getApplications().find((a) => a.user_id === user.id)
    : undefined;

  // Unauthenticated or not a verified seller state
  const isVerifiedSeller =
    sellerProfile &&
    (sellerProfile.verification_status === 'approved' ||
      (sellerProfile.verification_status as string) === 'verified');

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <Store className="w-12 h-12 text-stone-400 mx-auto" />
        <h2 className="text-2xl font-black text-stone-950 font-display">Seller Studio Portal</h2>
        <p className="text-xs text-stone-600">Please sign in to access your seller dashboard.</p>
        <Link
          to="/"
          className="inline-block px-6 py-2.5 rounded-full bg-blue-600 text-white font-bold text-xs"
        >
          Go to Sign In
        </Link>
      </div>
    );
  }

  if (!isVerifiedSeller) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
          <Store className="w-8 h-8 text-blue-600" />
        </div>

        <h1 className="text-3xl font-black text-stone-950 font-display">
          Seller Studio Access
        </h1>

        {userApplication ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-soft-sm text-left space-y-4 max-w-lg mx-auto">
            <div className="flex items-center justify-between pb-3 border-b border-sand-100">
              <span className="text-xs font-bold text-stone-500">Application Status:</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                userApplication.status === 'approved'
                  ? 'bg-emerald-50 text-emerald-700'
                  : userApplication.status === 'rejected'
                  ? 'bg-rose-50 text-rose-700'
                  : 'bg-amber-50 text-amber-700'
              }`}>
                {userApplication.status.replace('_', ' ')}
              </span>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Your application for <strong className="text-stone-900">{userApplication.store_name}</strong> in {userApplication.city} is currently under moderation review. Once verified by an administrator, publishing permissions will be unlocked automatically.
            </p>

            {userApplication.rejection_reason && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                <strong>Feedback from Admin:</strong> {userApplication.rejection_reason}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
              You haven&apos;t registered as a seller yet. Apply today to showcase your handmade goods, crafts, or fashion to local shoppers.
            </p>
            <Link
              to="/seller/onboarding"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition"
            >
              <Store className="w-4 h-4" />
              <span>Apply to Become a Seller</span>
            </Link>
          </div>
        )}
      </div>
    );
  }

  // Verified Seller Metrics (Strictly Real Data)
  const totalProducts = sellerProducts.length;
  const approvedProducts = sellerProducts.filter((p) => p.status === 'approved' || !p.status).length;
  const pendingProducts = sellerProducts.filter((p) => p.status === 'pending_approval').length;
  const sellerOrders = marketplaceService.getOrdersBySeller(sellerProfile.id);
  const totalRevenue = sellerOrders.reduce((sum, ord) => sum + ord.total_amount, 0);

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
      city: sellerProfile.city,
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProductId) {
      await marketplaceService.updateProduct(editingProductId, {
        name: productForm.name,
        description: productForm.description,
        price: Number(productForm.price),
        original_price: Number(productForm.original_price),
        stock: Number(productForm.stock),
        category_id: productForm.category_id,
        images: [productForm.images],
        city: productForm.city,
      });
      setProductToast('Product updated successfully.');
    } else {
      await marketplaceService.createProduct({
        seller_id: sellerProfile.id,
        category_id: productForm.category_id,
        name: productForm.name,
        description: productForm.description,
        price: Number(productForm.price),
        original_price: Number(productForm.original_price),
        stock: Number(productForm.stock),
        images: [productForm.images],
        city: productForm.city || sellerProfile.city,
        active: true,
      });
      setProductToast('Piece submitted for admin approval.');
    }
    setIsProductModalOpen(false);
    refreshData();
    setTimeout(() => setProductToast(''), 3000);
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this piece?')) {
      await marketplaceService.adminDeleteProduct(id);
      refreshData();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Studio Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-soft-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={sellerProfile.logo}
            alt={sellerProfile.store_name}
            className="w-16 h-16 rounded-2xl object-cover border border-sand-200"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-stone-950 font-display">
                {sellerProfile.store_name}
              </h1>
              <VerifiedBadge size="sm" showText />
            </div>
            <p className="text-xs text-stone-500 mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>Studio located in {sellerProfile.city}</span>
              <span>•</span>
              <span>{sellerProfile.category_focus}</span>
            </p>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Piece</span>
        </button>
      </div>

      {productToast && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{productToast}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-sand-200 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'overview' ? 'bg-stone-950 text-white' : 'text-stone-600 hover:bg-sand-100'
          }`}
        >
          Overview &amp; Metrics
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'products' ? 'bg-stone-950 text-white' : 'text-stone-600 hover:bg-sand-100'
          }`}
        >
          Product Catalog ({totalProducts})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'orders' ? 'bg-stone-950 text-white' : 'text-stone-600 hover:bg-sand-100'
          }`}
        >
          Orders ({sellerOrders.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-sand-200">
              <span className="text-[11px] font-bold text-stone-500 uppercase block">Published Products</span>
              <span className="text-2xl font-black text-stone-900 mt-1 block">{approvedProducts}</span>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-sand-200">
              <span className="text-[11px] font-bold text-stone-500 uppercase block">Pending Approval</span>
              <span className="text-2xl font-black text-amber-600 mt-1 block">{pendingProducts}</span>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-sand-200">
              <span className="text-[11px] font-bold text-stone-500 uppercase block">Customer Orders</span>
              <span className="text-2xl font-black text-stone-900 mt-1 block">{sellerOrders.length}</span>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-sand-200">
              <span className="text-[11px] font-bold text-stone-500 uppercase block">Total Sales</span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block">₹{totalRevenue.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-3xl border border-sand-200 overflow-hidden">
          <div className="p-4 border-b border-sand-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-stone-900">Your Pieces</h3>
            <button
              onClick={openAddModal}
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Piece
            </button>
          </div>

          {sellerProducts.length === 0 ? (
            <div className="p-12 text-center text-xs text-stone-500">
              <Package className="w-8 h-8 text-stone-400 mx-auto mb-2" />
              <p className="font-bold text-stone-800">No products uploaded yet.</p>
              <p className="mt-1">Add your first handmade item to start selling.</p>
            </div>
          ) : (
            <div className="divide-y divide-sand-100">
              {sellerProducts.map((p) => {
                const status = p.status || 'approved';
                return (
                  <div key={p.id} className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-12 h-12 rounded-xl object-cover bg-sand-100"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-stone-900">{p.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-stone-500">
                          <span>₹{p.price}</span>
                          <span>•</span>
                          <span>Stock: {p.stock}</span>
                          <span>•</span>
                          <span>{p.city}</span>
                        </div>
                        {p.rejection_reason && (
                          <p className="text-[11px] text-rose-600 mt-1 font-medium">
                            Rejection Note: {p.rejection_reason}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700'
                          : status === 'rejected'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {status.replace('_', ' ')}
                      </span>

                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ORDERS */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-sand-200 p-8 text-center text-xs text-stone-500">
          {sellerOrders.length === 0 ? (
            <div>
              <ShoppingBag className="w-8 h-8 text-stone-400 mx-auto mb-2" />
              <p className="font-bold text-stone-800">No orders placed yet.</p>
              <p className="mt-1">When customers order your pieces, they will appear here with shipping addresses.</p>
            </div>
          ) : (
            <div className="text-left space-y-4">
              {sellerOrders.map((ord) => (
                <div key={ord.id} className="p-4 rounded-2xl border border-sand-200">
                  <div className="flex justify-between font-bold text-stone-900">
                    <span>Order #{ord.id}</span>
                    <span>₹{ord.total_amount}</span>
                  </div>
                  <p className="text-stone-500 mt-1">Status: {ord.status}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PRODUCT CREATION MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-sand-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-stone-950 font-display mb-4">
              {editingProductId ? 'Edit Product' : 'Add New Product (Requires Admin Moderation)'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hand-Thrown Speckled Ceramic Cup"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    min={1}
                    value={productForm.original_price}
                    onChange={(e) => setProductForm({ ...productForm, original_price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Category *</label>
                  <select
                    value={productForm.category_id}
                    onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Product Photo URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={productForm.images}
                  onChange={(e) => setProductForm({ ...productForm, images: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the materials, sizing, and craft process..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-sand-300 text-stone-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboardPage;
