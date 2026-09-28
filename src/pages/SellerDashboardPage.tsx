import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  ShoppingBag,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  MapPin,
  Store,
  Layers,
  AlertCircle,
  ShieldCheck,
  TrendingUp,
  PauseCircle,
  PlayCircle,
  Upload,
  Camera,
  ExternalLink,
  Instagram,
  Globe,
  Save,
  Check,
  Clock,
  Eye,
  RefreshCw,
  Truck,
  ArrowRight,
} from 'lucide-react';
import { marketplaceService } from '../services/marketplaceService';
import { useAuth } from '../context/AuthContext';
import { Product, Order, ProductStatus, SellerProfile } from '../types';
import { VerifiedBadge } from '../components/common/VerifiedBadge';
import { Tabs } from '../components/ui/Tabs';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';

export const SellerDashboardPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'profile'>('overview');

  const [sellerProfile, setSellerProfile] = useState<SellerProfile | undefined>(
    user ? marketplaceService.getSellerByUserId(user.id) : undefined
  );
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState(marketplaceService.getCategories());
  const [sellerOrders, setSellerOrders] = useState<Order[]>([]);

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Form State
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: 999,
    original_price: 1299,
    stock: 10,
    category_id: '',
    city: '',
    images: [] as string[],
    variants: '',
    delivery_info: 'Same-day / Next-day local delivery available',
  });

  // Store Profile Edit State
  const [storeName, setStoreName] = useState('');
  const [storeDesc, setStoreDesc] = useState('');
  const [storeSocial, setStoreSocial] = useState('');
  const [storeWebsite, setStoreWebsite] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [toastMsg, setToastMsg] = useState('');
  const [formError, setFormError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reload data
  const refreshData = () => {
    if (!user) return;
    const profile = marketplaceService.getSellerByUserId(user.id, user.phone);
    setSellerProfile(profile);
    if (profile) {
      setSellerProducts(marketplaceService.getProductsBySeller(profile.id));
      setSellerOrders(marketplaceService.getOrdersBySeller(profile.id));
      setStoreName(profile.store_name || '');
      setStoreDesc(profile.description || '');
      setStoreSocial(profile.social_link || '');
      setStoreWebsite(profile.website_url || '');
    } else {
      const app = marketplaceService.getApplicationByUserId(user.id, user.phone);
      if (app && (app.status === 'approved' || user.role === 'seller')) {
        const fallbackProfile: SellerProfile = {
          id: 'seller-artsofhemaa',
          user_id: user.id,
          store_name: app.store_name || 'Artsofhemaa',
          description: app.description || '',
          logo: app.product_samples?.[0] || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
          city: app.city || 'Hyderabad',
          state: app.state || 'Telangana',
          category_focus: app.category || 'Art & Prints',
          verification_status: 'approved',
          rating: 5.0,
          total_reviews: 0,
          completed_orders: 0,
          created_at: new Date().toISOString(),
        };
        setSellerProfile(fallbackProfile);
        setStoreName(fallbackProfile.store_name);
        setStoreDesc(fallbackProfile.description);
      }
    }
    setCategories(marketplaceService.getCategories());
  };

  useEffect(() => {
    refreshData();
    const unsub = marketplaceService.subscribe(refreshData);
    return () => unsub();
  }, [user]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const userApplication = user
    ? marketplaceService.getApplicationByUserId(user.id, user.phone)
    : undefined;

  const isVerifiedSeller =
    (sellerProfile &&
      (sellerProfile.verification_status === 'approved' ||
        (sellerProfile.verification_status as string) === 'verified')) ||
    user?.role === 'seller' ||
    userApplication?.status === 'approved';

  // 1. Unauthenticated State
  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100 shadow-xs">
          <Store className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-black text-stone-950 font-display">Seller Studio Portal</h2>
        <p className="text-xs text-stone-600 max-w-sm mx-auto">
          Please log in to your Selluy account to access your seller dashboard and manage your pieces.
        </p>
        <Link to="/">
          <Button size="md" className="mt-2">Go to Sign In</Button>
        </Link>
      </div>
    );
  }

  // 2. Authenticated but Not Yet Approved Seller State
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
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                <strong className="block mb-0.5">Feedback from Admin:</strong>
                <p>{userApplication.rejection_reason}</p>
                <Link
                  to="/become-seller"
                  className="mt-2 inline-flex items-center gap-1 font-bold text-rose-800 underline"
                >
                  Revise &amp; Resubmit Application <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            <div className="pt-2 flex justify-between items-center text-xs">
              <Link to="/become-seller" className="text-blue-600 font-bold hover:underline">
                View Application Details
              </Link>
              <Link to="/" className="text-stone-500 hover:text-stone-800">
                Back to Marketplace
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4 bg-white rounded-3xl p-8 border border-sand-200 shadow-soft-sm max-w-lg mx-auto">
            <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
              You haven&apos;t registered as a seller yet. Apply today to showcase your handmade goods, crafts, or fashion to local shoppers in your city.
            </p>
            <Link to="/become-seller">
              <Button size="lg" className="shadow-md">
                <Store className="w-4 h-4 mr-1.5" />
                <span>Apply to Become a Verified Seller</span>
              </Button>
            </Link>
          </div>
        )}
      </div>
    );
  }

  if (!sellerProfile) {
    return null;
  }

  // --- METRICS (STRICTLY REAL DB DATA) ---
  const totalProducts = sellerProducts.length;
  const approvedProducts = sellerProducts.filter((p) => p.status === 'approved' || !p.status).length;
  const pendingProducts = sellerProducts.filter((p) => p.status === 'pending_approval').length;
  const pausedProducts = sellerProducts.filter((p) => p.status === 'paused').length;
  const totalRevenue = sellerOrders.reduce((sum, ord) => sum + (ord.total_amount || 0), 0);

  // --- PRODUCT IMAGE UPLOAD FROM DEVICE ---
  const handleImageUploadFromDevice = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setFormError('');
    const newImages = [...productForm.images];

    for (let i = 0; i < files.length; i++) {
      if (newImages.length >= 5) break;
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 5 * 1024 * 1024) {
        setFormError('Image size must be under 5MB per photo.');
        continue;
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setProductForm((prev) => ({
            ...prev,
            images: [...prev.images, reader.result as string].slice(0, 5),
          }));
        }
      };
      reader.readAsDataURL(file);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeProductImage = (index: number) => {
    setProductForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const setAsCoverImage = (index: number) => {
    if (index === 0) return;
    setProductForm((prev) => {
      const selected = prev.images[index];
      const rest = prev.images.filter((_, i) => i !== index);
      return {
        ...prev,
        images: [selected, ...rest],
      };
    });
  };

  // Open Add Product Modal
  const openAddModal = () => {
    setEditingProductId(null);
    setFormError('');
    setProductForm({
      name: '',
      description: '',
      price: 850,
      original_price: 1100,
      stock: 12,
      category_id: categories[0]?.id || 'cat-fashion',
      city: sellerProfile.city,
      images: [],
      variants: '',
      delivery_info: 'Same-day / Next-day local delivery available',
    });
    setIsProductModalOpen(true);
  };

  // Open Edit Product Modal
  const openEditModal = (p: Product) => {
    setEditingProductId(p.id);
    setFormError('');
    setProductForm({
      name: p.name,
      description: p.description,
      price: p.price,
      original_price: p.original_price || p.price,
      stock: p.stock,
      category_id: p.category_id,
      city: p.city || sellerProfile.city,
      images: p.images || [],
      variants: (p.variants || []).join(', '),
      delivery_info: p.delivery_info || 'Same-day / Next-day local delivery available',
    });
    setIsProductModalOpen(true);
  };

  // Save Product (Add or Edit)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!productForm.name.trim()) {
      setFormError('Please enter a product title.');
      return;
    }
    if (productForm.price <= 0) {
      setFormError('Price must be greater than 0.');
      return;
    }
    if (productForm.images.length === 0) {
      setFormError('Please upload at least one image of your piece from your device.');
      return;
    }

    const variantsArray = productForm.variants
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);

    try {
      if (editingProductId) {
        // Authorized seller edit (significant changes automatically re-enter pending_approval)
        await marketplaceService.sellerUpdateProduct(editingProductId, sellerProfile.id, {
          name: productForm.name.trim(),
          description: productForm.description.trim(),
          price: Number(productForm.price),
          original_price: Number(productForm.original_price) || undefined,
          stock: Number(productForm.stock),
          category_id: productForm.category_id,
          city: productForm.city || sellerProfile.city,
          images: productForm.images,
          variants: variantsArray,
          delivery_info: productForm.delivery_info,
        });
        showToast('Product updated. Significant changes sent to moderators for review.');
      } else {
        // Create new product (initially pending_approval)
        await marketplaceService.createProduct({
          seller_id: sellerProfile.id,
          category_id: productForm.category_id || categories[0]?.id,
          name: productForm.name.trim(),
          description: productForm.description.trim(),
          price: Number(productForm.price),
          original_price: Number(productForm.original_price) || undefined,
          stock: Number(productForm.stock),
          images: productForm.images,
          city: productForm.city || sellerProfile.city,
          variants: variantsArray,
          delivery_info: productForm.delivery_info,
          active: false,
          status: 'pending_approval',
        });
        showToast('Piece submitted for admin moderation review.');
      }

      setIsProductModalOpen(false);
      refreshData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save product.');
    }
  };

  // Pause or unpause product
  const handleTogglePause = async (id: string) => {
    try {
      const updated = await marketplaceService.sellerPauseProduct(id, sellerProfile.id);
      refreshData();
      showToast(
        updated.status === 'paused'
          ? 'Product paused and hidden from customer view.'
          : 'Product unpaused and live on marketplace.'
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update product state.');
    }
  };

  // Delete product (soft-delete)
  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this piece? It will be archived from your catalog.')) {
      try {
        await marketplaceService.sellerDeleteProduct(id, sellerProfile.id);
        refreshData();
        showToast('Piece removed from your catalog.');
      } catch (err: any) {
        alert(err.message || 'Failed to delete product.');
      }
    }
  };

  // Save Store Profile
  const handleSaveStoreProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await marketplaceService.updateSellerProfile(sellerProfile.id, {
        store_name: storeName.trim(),
        description: storeDesc.trim(),
        social_link: storeSocial.trim() || undefined,
        website_url: storeWebsite.trim() || undefined,
      });
      refreshData();
      showToast('Store profile details updated successfully.');
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Update fulfillment state on an order
  const handleUpdateFulfillment = async (orderId: string, newStatus: Order['status']) => {
    try {
      await marketplaceService.updateOrderStatus(orderId, newStatus);
      refreshData();
      showToast(`Order status updated to: ${newStatus}`);
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    }
  };

  const tabItems = [
    { id: 'overview' as const, label: 'Overview', icon: <TrendingUp className="w-3.5 h-3.5" /> },
    {
      id: 'products' as const,
      label: 'Products',
      icon: <Package className="w-3.5 h-3.5" />,
      badge: totalProducts > 0 ? totalProducts : undefined,
    },
    {
      id: 'orders' as const,
      label: 'Orders',
      icon: <ShoppingBag className="w-3.5 h-3.5" />,
      badge: sellerOrders.length > 0 ? sellerOrders.length : undefined,
    },
    {
      id: 'profile' as const,
      label: 'Store Profile',
      icon: <Store className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Studio Header Card */}
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
            <p className="text-xs text-stone-500 mt-1 flex items-center gap-1.5 flex-wrap">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>Studio in {sellerProfile.city}</span>
              <span>•</span>
              <span>{sellerProfile.category_focus}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link
            to={`/seller/${sellerProfile.id}`}
            target="_blank"
            className="px-4 py-2.5 rounded-full border border-sand-300 text-stone-700 hover:bg-sand-50 font-bold text-xs transition inline-flex items-center gap-1.5"
          >
            <span>View Public Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <Button onClick={openAddModal} size="md" className="shadow-md bg-blue-600 hover:bg-blue-700 text-white font-bold">
            <Plus className="w-4 h-4 mr-1" />
            <span>Add Piece</span>
          </Button>
        </div>
      </div>

      {/* Toast Banner */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2 shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
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
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-sand-200/90 shadow-soft-sm">
              <span className="text-[11px] font-bold text-stone-500 uppercase block">Approved Live</span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block">{approvedProducts}</span>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-sand-200/90 shadow-soft-sm">
              <span className="text-[11px] font-bold text-stone-500 uppercase block">Pending Approval</span>
              <span className="text-2xl font-black text-amber-600 mt-1 block">{pendingProducts}</span>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-sand-200/90 shadow-soft-sm">
              <span className="text-[11px] font-bold text-stone-500 uppercase block">Paused</span>
              <span className="text-2xl font-black text-stone-500 mt-1 block">{pausedProducts}</span>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-sand-200/90 shadow-soft-sm">
              <span className="text-[11px] font-bold text-stone-500 uppercase block">Orders</span>
              <span className="text-2xl font-black text-stone-900 mt-1 block">{sellerOrders.length}</span>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-sand-200/90 shadow-soft-sm">
              <span className="text-[11px] font-bold text-stone-500 uppercase block">Sales Volume</span>
              <span className="text-2xl font-black text-blue-600 mt-1 block">₹{totalRevenue.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-sand-200 shadow-soft-sm space-y-3">
            <h3 className="font-bold text-sm text-stone-900">Platform Moderation Notice</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              To guarantee that local shoppers only discover authentic items from verified indie makers, all newly created products or significant price and photo edits are reviewed by Selluy administrators before appearing publicly.
            </p>
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
          <div className="p-4 sm:p-5 border-b border-sand-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-stone-900">Your Product Catalog</h3>
              <p className="text-xs text-stone-500">Real items stored in your studio catalog</p>
            </div>
            <Button onClick={openAddModal} size="sm" className="bg-blue-600 text-white font-bold">
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Piece
            </Button>
          </div>

          {sellerProducts.length === 0 ? (
            <div className="p-12 text-center text-xs text-stone-500 space-y-3">
              <Package className="w-10 h-10 text-stone-300 mx-auto" />
              <p className="font-bold text-stone-800 text-sm">You haven&apos;t added any products yet.</p>
              <p className="max-w-xs mx-auto">Upload your first handcrafted item or apparel drop to start receiving local orders.</p>
              <Button onClick={openAddModal} size="md" className="mt-2 bg-blue-600 text-white">
                <Plus className="w-4 h-4 mr-1" />
                Add Your First Product
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-sand-100">
              {sellerProducts.map((p) => {
                const status = (p.status || 'approved') as ProductStatus;
                return (
                  <div key={p.id} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={p.images?.[0] || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=300&q=80'}
                        alt={p.name}
                        className="w-14 h-14 rounded-2xl object-cover bg-sand-100 shrink-0 border border-sand-200"
                      />
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-stone-900">{p.name}</h4>
                          <Badge
                            variant={
                              status === 'approved'
                                ? 'success'
                                : status === 'rejected'
                                ? 'destructive'
                                : status === 'paused'
                                ? 'warning'
                                : 'brand'
                            }
                            size="sm"
                          >
                            {status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-stone-500">
                          <span className="font-bold text-stone-900">₹{p.price}</span>
                          <span>•</span>
                          <span>Stock: {p.stock}</span>
                          <span>•</span>
                          <span>{p.city}</span>
                        </div>
                        {p.rejection_reason && (
                          <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1 mt-1">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            <span>Rejection reason: {p.rejection_reason}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditModal(p)}
                        className="text-stone-700 hover:text-blue-600"
                      >
                        <Edit2 className="w-3.5 h-3.5 mr-1" />
                        Edit
                      </Button>

                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleTogglePause(p.id)}
                        className="bg-sand-100 hover:bg-sand-200 text-stone-800"
                      >
                        {status === 'paused' ? (
                          <>
                            <PlayCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                            Unpause
                          </>
                        ) : (
                          <>
                            <PauseCircle className="w-3.5 h-3.5 mr-1 text-amber-600" />
                            Pause
                          </>
                        )}
                      </Button>

                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Archive product"
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
          className="bg-white rounded-3xl border border-sand-200/90 shadow-soft-sm p-6"
        >
          <div className="pb-4 border-b border-sand-100 flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-stone-900">Customer Orders &amp; Fulfillment</h3>
              <p className="text-xs text-stone-500">Orders placed by customers for your studio pieces</p>
            </div>
          </div>

          {sellerOrders.length === 0 ? (
            <div className="text-center py-12 text-xs text-stone-500 space-y-2">
              <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto" />
              <p className="font-bold text-stone-800 text-sm">No customer orders placed yet.</p>
              <p className="max-w-xs mx-auto">When nearby buyers place orders for your pieces, they will appear here with pickup delivery addresses.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sellerOrders.map((ord) => (
                <div key={ord.id} className="p-4 sm:p-5 rounded-2xl border border-sand-200 space-y-3 bg-sand-50/40">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sand-200/80 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-stone-900">Order #{ord.id}</span>
                        <Badge
                          variant={
                            ord.status === 'delivered'
                              ? 'success'
                              : ord.status === 'cancelled'
                              ? 'destructive'
                              : 'brand'
                          }
                          size="sm"
                        >
                          {ord.status}
                        </Badge>
                      </div>
                      <span className="text-[11px] text-stone-400">
                        {new Date(ord.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-500">Fulfillment Status:</span>
                      <select
                        value={ord.status}
                        onChange={(e) => handleUpdateFulfillment(ord.id, e.target.value as Order['status'])}
                        className="px-2.5 py-1 rounded-xl border border-sand-300 text-xs font-semibold bg-white focus:outline-none"
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-stone-500 font-bold block mb-0.5">Shipping Destination:</span>
                      <p className="text-stone-900 font-semibold">{ord.shipping_address?.name}</p>
                      <p className="text-stone-600">{ord.shipping_address?.address_line}, {ord.shipping_address?.city} - {ord.shipping_address?.pincode}</p>
                      <p className="text-stone-600">Phone: {ord.shipping_address?.phone}</p>
                    </div>

                    <div>
                      <span className="text-stone-500 font-bold block mb-0.5">Items:</span>
                      <div className="space-y-1">
                        {ord.items
                          .filter((i) => i.seller_id === sellerProfile.id)
                          .map((item, idx) => (
                            <div key={idx} className="flex justify-between text-stone-800">
                              <span>{item.product?.name || `Product (${item.product_id})`} × {item.quantity}</span>
                              <span className="font-bold">₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* TAB 4: STORE PROFILE */}
      {activeTab === 'profile' && (
        <motion.form
          key="tab-profile"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          onSubmit={handleSaveStoreProfile}
          className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200/90 shadow-soft-sm max-w-2xl space-y-5"
        >
          <div className="pb-3 border-b border-sand-100">
            <h3 className="font-bold text-base text-stone-900">Public Store Profile</h3>
            <p className="text-xs text-stone-500">Configure what shoppers see on your verified storefront</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Store / Studio Name</label>
            <input
              type="text"
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-sm focus:ring-2 focus:ring-blue-500 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Store Description / Craft Bio</label>
            <textarea
              rows={4}
              required
              value={storeDesc}
              onChange={(e) => setStoreDesc(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-sm focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                <Instagram className="w-3.5 h-3.5 text-pink-600" />
                <span>Instagram Profile URL</span>
              </label>
              <input
                type="url"
                placeholder="https://instagram.com/yourhandle"
                value={storeSocial}
                onChange={(e) => setStoreSocial(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>Independent Website / Portfolio</span>
              </label>
              <input
                type="url"
                placeholder="https://yourbrand.com"
                value={storeWebsite}
                onChange={(e) => setStoreWebsite(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              disabled={isSavingProfile}
              isLoading={isSavingProfile}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
            >
              <Save className="w-4 h-4 mr-1.5" />
              Save Profile Changes
            </Button>
          </div>
        </motion.form>
      )}

      {/* PRODUCT CREATION / EDIT MODAL */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title={editingProductId ? 'Edit Product' : 'Add New Handcrafted Piece'}
        description="All new pieces and major changes require admin moderation before appearing publicly."
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4 text-xs mt-2">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block font-bold text-stone-700 mb-1">Product Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Hand-Thrown Speckled Ceramic Cup"
              value={productForm.name}
              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Price (₹) *</label>
              <input
                type="number"
                required
                min={1}
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl border border-sand-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">Original Price (₹)</label>
              <input
                type="number"
                min={1}
                value={productForm.original_price}
                onChange={(e) => setProductForm({ ...productForm, original_price: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl border border-sand-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">Available Stock *</label>
              <input
                type="number"
                required
                min={0}
                value={productForm.stock}
                onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl border border-sand-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

            <div>
              <label className="block font-bold text-stone-700 mb-1">Fulfillment / Delivery Info</label>
              <input
                type="text"
                placeholder="e.g. Same-day local delivery or Pan-India courier"
                value={productForm.delivery_info}
                onChange={(e) => setProductForm({ ...productForm, delivery_info: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Variants (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Small, Medium, Large or Indigo, Terracotta (comma-separated)"
              value={productForm.variants}
              onChange={(e) => setProductForm({ ...productForm, variants: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-sand-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* DEVICE IMAGE UPLOAD SECTION */}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUploadFromDevice}
              accept="image/*"
              multiple
              className="hidden"
            />

            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-stone-700">Product Photos (Upload 1 to 5 from device) *</label>
              <span className="text-[11px] text-stone-500">{productForm.images.length} of 5 photos</span>
            </div>

            {/* Drop zone / button */}
            {productForm.images.length < 5 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-sand-300 hover:border-blue-500 rounded-2xl p-4 text-center cursor-pointer transition bg-sand-50/50 hover:bg-blue-50/30 group"
              >
                <Upload className="w-5 h-5 text-stone-400 group-hover:text-blue-600 mx-auto mb-1" />
                <span className="text-xs font-bold text-blue-600 block">Click to select photos from device</span>
                <span className="text-[10px] text-stone-400 block mt-0.5">PNG, JPG, or WebP under 5MB</span>
              </button>
            )}

            {/* Uploaded Thumbnails Grid */}
            {productForm.images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 mt-3">
                {productForm.images.map((url, idx) => (
                  <div key={idx} className="relative rounded-xl overflow-hidden aspect-square border border-sand-300 group bg-sand-100 shadow-xs">
                    <img src={url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute top-1 left-1 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                        Cover
                      </span>
                    )}
                    <div className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5 p-1">
                      {idx !== 0 && (
                        <button
                          type="button"
                          onClick={() => setAsCoverImage(idx)}
                          className="px-1.5 py-1 bg-white text-stone-800 text-[9px] font-bold rounded-md"
                          title="Set as Cover"
                        >
                          Cover
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeProductImage(idx)}
                        className="p-1.5 bg-rose-500 text-white rounded-md"
                        title="Remove image"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Craft Description *</label>
            <textarea
              rows={3}
              required
              placeholder="Describe materials used, technique, sizing, and handmade care..."
              value={productForm.description}
              onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
            <Button type="submit" size="md" className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
              {editingProductId ? 'Save & Submit for Review' : 'Submit Piece for Approval'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SellerDashboardPage;
