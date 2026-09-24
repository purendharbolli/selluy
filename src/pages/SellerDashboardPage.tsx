import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  TrendingUp,
} from 'lucide-react';
import { marketplaceService } from '../services/marketplaceService';
import { useAuth } from '../context/AuthContext';
import { Product, OrderStatus, ProductStatus } from '../types';
import { VerifiedBadge } from '../components/common/VerifiedBadge';
import { Tabs } from '../components/ui/Tabs';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';

export const SellerDashboardPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders'>('overview');

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
        <Link to="/">
          <Button size="md">Go to Sign In</Button>
        </Link>
      </div>
    );
  }

  if (!isVerifiedSeller) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100 shadow-xs">
          <Store className="w-8 h-8 text-blue-600" />
        </div>

        <h1 className="text-3xl font-black text-stone-950 font-display">
          Seller Studio Access
        </h1>

        {userApplication ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-soft-sm text-left space-y-4 max-w-lg mx-auto">
            <div className="flex items-center justify-between pb-3 border-b border-sand-100">
              <span className="text-xs font-bold text-stone-500">Application Status:</span>
              <Badge
                variant={
                  userApplication.status === 'approved'
                    ? 'success'
                    : userApplication.status === 'rejected'
                    ? 'destructive'
                    : 'warning'
                }
                size="sm"
              >
                {userApplication.status.replace('_', ' ')}
              </Badge>
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
            <Link to="/seller/onboarding">
              <Button size="lg">
                <Store className="w-4 h-4 mr-1.5" />
                <span>Apply to Become a Seller</span>
              </Button>
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

  const tabItems = [
    { id: 'overview' as const, label: 'Overview & Metrics', icon: <TrendingUp className="w-3.5 h-3.5" /> },
    {
      id: 'products' as const,
      label: 'Product Catalog',
      icon: <Package className="w-3.5 h-3.5" />,
      badge: totalProducts,
    },
    {
      id: 'orders' as const,
      label: 'Orders',
      icon: <ShoppingBag className="w-3.5 h-3.5" />,
      badge: sellerOrders.length,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Studio Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200/90 shadow-soft-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={sellerProfile.logo}
            alt={sellerProfile.store_name}
            className="w-16 h-16 rounded-2xl object-cover border border-sand-200 shadow-xs"
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

        <Button onClick={openAddModal} size="md" className="shadow-md">
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Add New Piece</span>
        </Button>
      </div>

      <AnimatePresence>
        {productToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2 shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{productToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Kokonut UI Animated Sliding Tabs */}
      <div>
        <Tabs
          tabs={tabItems}
          activeTab={activeTab}
          onChange={(tab) => setActiveTab(tab)}
          layoutId="sellerDashboardActiveTab"
        />
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <motion.div
          key="tab-overview"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-sand-200/90 shadow-soft-sm">
              <span className="text-[11px] font-bold text-stone-500 uppercase block">Published Products</span>
              <span className="text-2xl font-black text-stone-900 mt-1 block">{approvedProducts}</span>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-sand-200/90 shadow-soft-sm">
              <span className="text-[11px] font-bold text-stone-500 uppercase block">Pending Approval</span>
              <span className="text-2xl font-black text-amber-600 mt-1 block">{pendingProducts}</span>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-sand-200/90 shadow-soft-sm">
              <span className="text-[11px] font-bold text-stone-500 uppercase block">Customer Orders</span>
              <span className="text-2xl font-black text-stone-900 mt-1 block">{sellerOrders.length}</span>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-sand-200/90 shadow-soft-sm">
              <span className="text-[11px] font-bold text-stone-500 uppercase block">Total Sales</span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block">₹{totalRevenue.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 2: PRODUCTS */}
      {activeTab === 'products' && (
        <motion.div
          key="tab-products"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl border border-sand-200/90 shadow-soft-sm overflow-hidden"
        >
          <div className="p-4 border-b border-sand-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-stone-900">Your Pieces</h3>
            <button
              onClick={openAddModal}
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
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
                      <Badge
                        variant={
                          status === 'approved'
                            ? 'success'
                            : status === 'rejected'
                            ? 'destructive'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {status.replace('_', ' ')}
                      </Badge>

                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
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
        </motion.div>
      )}

      {/* TAB 3: ORDERS */}
      {activeTab === 'orders' && (
        <motion.div
          key="tab-orders"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl border border-sand-200/90 shadow-soft-sm p-8 text-center text-xs text-stone-500"
        >
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
        </motion.div>
      )}

      {/* PRODUCT CREATION MODAL */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title={editingProductId ? 'Edit Product' : 'Add New Product (Requires Admin Moderation)'}
        description="Submit your crafted product for platform review before it appears in city feeds."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4 text-xs mt-2">
          <div>
            <label className="block font-bold text-stone-700 mb-1">Product Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Hand-Thrown Speckled Ceramic Cup"
              value={productForm.name}
              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-sand-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-600 bg-sand-50/50 transition shadow-xs"
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
                className="w-full px-3.5 py-2.5 rounded-2xl border border-sand-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-600 bg-sand-50/50 transition shadow-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">Original Price (₹)</label>
              <input
                type="number"
                min={1}
                value={productForm.original_price}
                onChange={(e) => setProductForm({ ...productForm, original_price: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-sand-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-600 bg-sand-50/50 transition shadow-xs"
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
                className="w-full px-3.5 py-2.5 rounded-2xl border border-sand-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-600 bg-sand-50/50 transition shadow-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Category *</label>
              <select
                value={productForm.category_id}
                onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-sand-300 text-sm bg-sand-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-600 transition shadow-xs"
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
              className="w-full px-3.5 py-2.5 rounded-2xl border border-sand-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-600 bg-sand-50/50 transition shadow-xs"
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
              className="w-full px-3.5 py-2.5 rounded-2xl border border-sand-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-600 bg-sand-50/50 transition shadow-xs"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2.5 border-t border-sand-100">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsProductModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="md">
              Submit for Approval
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SellerDashboardPage;
