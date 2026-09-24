import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Users,
  Store,
  Package,
  ShoppingBag,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  ExternalLink,
  Layers,
  Clock,
  TrendingUp,
  MapPin,
  PauseCircle,
  PlayCircle,
  Truck,
} from 'lucide-react';
import { marketplaceService } from '../services/marketplaceService';
import { SellerProfile, Product, Category, SellerApplication, Order } from '../types';
import { VerifiedBadge } from '../components/common/VerifiedBadge';
import { POPULAR_INDIAN_CITIES } from '../components/common/CityOnboardingModal';
import { Tabs } from '../components/ui/Tabs';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const AdminDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'products' | 'sellers' | 'orders' | 'cities'>('overview');

  const [applications, setApplications] = useState<SellerApplication[]>(marketplaceService.getApplications());
  const [sellers, setSellers] = useState<SellerProfile[]>(marketplaceService.getSellers());
  const [products, setProducts] = useState<Product[]>(marketplaceService.getAllRawProducts());
  const [orders, setOrders] = useState<Order[]>(marketplaceService.getOrders());
  const [categories, setCategories] = useState<Category[]>(marketplaceService.getCategories());

  const [toastMsg, setToastMsg] = useState('');

  const refreshAdminData = () => {
    setApplications([...marketplaceService.getApplications()]);
    setSellers([...marketplaceService.getSellers()]);
    setProducts([...marketplaceService.getAllRawProducts()]);
    setOrders([...marketplaceService.getOrders()]);
    setCategories([...marketplaceService.getCategories()]);
  };

  useEffect(() => {
    refreshAdminData();
    const unsub = marketplaceService.subscribe(refreshAdminData);
    return () => unsub();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Metrics (Strictly Real Database Data)
  const pendingApplications = applications.filter((a) => a.status === 'pending');
  const approvedApplications = applications.filter((a) => a.status === 'approved');
  const verifiedSellersCount = sellers.filter((s) => s.verification_status === 'approved' || (s.verification_status as string) === 'verified').length;
  const pendingProducts = products.filter((p) => p.status === 'pending_approval');
  const approvedProducts = products.filter((p) => p.status === 'approved' || !p.status);
  const totalOrders = orders.length;
  const totalGMV = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

  // Actions
  const handleApproveSeller = async (appId: string) => {
    try {
      await marketplaceService.adminApproveSeller(appId);
      refreshAdminData();
      showToast('Seller application approved! Seller is now verified.');
    } catch (err: any) {
      alert(err.message || 'Failed to approve seller');
    }
  };

  const handleRejectSeller = async (appId: string) => {
    const reason = prompt('Please enter an internal rejection reason:');
    if (reason !== null) {
      await marketplaceService.adminRejectSeller(appId, reason || 'Application requirements not met.');
      refreshAdminData();
      showToast('Seller application rejected.');
    }
  };

  const handleApproveProduct = async (prodId: string) => {
    await marketplaceService.adminApproveProduct(prodId);
    refreshAdminData();
    showToast('Product approved and live on marketplace.');
  };

  const handleRejectProduct = async (prodId: string) => {
    const reason = prompt('Please enter a rejection reason:');
    if (reason !== null) {
      await marketplaceService.adminRejectProduct(prodId, reason || 'Does not meet product catalog standards.');
      refreshAdminData();
      showToast('Product rejected.');
    }
  };

  const handlePauseProduct = async (prodId: string, currentStatus: string) => {
    if (currentStatus === 'paused') {
      await marketplaceService.updateProduct(prodId, { status: 'approved', active: true });
      showToast('Product unpaused.');
    } else {
      await marketplaceService.updateProduct(prodId, { status: 'paused', active: false });
      showToast('Product paused from customer view.');
    }
    refreshAdminData();
  };

  const handleDeleteProduct = async (prodId: string) => {
    if (window.confirm('Are you sure you want to permanently delete this product?')) {
      await marketplaceService.adminDeleteProduct(prodId);
      refreshAdminData();
      showToast('Product removed.');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    await marketplaceService.updateOrderStatus(orderId, newStatus);
    refreshAdminData();
    showToast(`Order status updated to ${newStatus}`);
  };

  const tabItems = [
    { id: 'overview' as const, label: 'Overview', icon: <TrendingUp className="w-3.5 h-3.5" /> },
    {
      id: 'applications' as const,
      label: 'Seller Applications',
      icon: <Store className="w-3.5 h-3.5" />,
      badge: pendingApplications.length > 0 ? pendingApplications.length : undefined,
    },
    {
      id: 'products' as const,
      label: 'Product Moderation',
      icon: <Package className="w-3.5 h-3.5" />,
      badge: pendingProducts.length > 0 ? pendingProducts.length : undefined,
    },
    {
      id: 'sellers' as const,
      label: 'Verified Sellers',
      icon: <Users className="w-3.5 h-3.5" />,
      badge: verifiedSellersCount,
    },
    {
      id: 'orders' as const,
      label: 'Orders & Fulfillment',
      icon: <ShoppingBag className="w-3.5 h-3.5" />,
      badge: totalOrders > 0 ? totalOrders : undefined,
    },
    {
      id: 'cities' as const,
      label: 'Supported Cities',
      icon: <MapPin className="w-3.5 h-3.5" />,
      badge: POPULAR_INDIAN_CITIES.length,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-sand-200">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-stone-950 text-white flex items-center justify-center shadow-md">
            <ShieldCheck className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-stone-950 font-display">
              Selluy Governance &amp; Moderation
            </h1>
            <p className="text-xs text-stone-500">
              Strict two-sided moderation: verified sellers, approved products, and real local orders
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="success" dot size="md">
            Live Production Admin
          </Badge>
        </div>
      </div>

      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs font-bold text-blue-800 flex items-center gap-2 shadow-xs"
          >
            <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Kokonut UI Animated Sliding Tabs */}
      <div>
        <Tabs
          tabs={tabItems}
          activeTab={activeTab}
          onChange={(tab) => setActiveTab(tab)}
          layoutId="adminDashboardActiveTab"
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white p-4 rounded-3xl border border-sand-200/90 shadow-soft-sm">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Pending Applications</span>
              <span className="text-2xl font-black text-amber-600 mt-1 block">{pendingApplications.length}</span>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-sand-200/90 shadow-soft-sm">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Verified Sellers</span>
              <span className="text-2xl font-black text-stone-900 mt-1 block">{verifiedSellersCount}</span>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-sand-200/90 shadow-soft-sm">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Pending Products</span>
              <span className="text-2xl font-black text-blue-600 mt-1 block">{pendingProducts.length}</span>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-sand-200/90 shadow-soft-sm">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Approved Products</span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block">{approvedProducts.length}</span>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-sand-200/90 shadow-soft-sm">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Total Orders</span>
              <span className="text-2xl font-black text-stone-900 mt-1 block">{totalOrders}</span>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-sand-200/90 shadow-soft-sm">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Total GMV</span>
              <span className="text-2xl font-black text-blue-600 mt-1 block">₹{totalGMV.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-sand-200 shadow-soft-sm">
            <h3 className="text-sm font-bold text-stone-900 mb-3">Moderation Architecture Guidelines (Selluy 2026)</h3>
            <ul className="text-xs text-stone-600 space-y-2 list-disc pl-5">
              <li><strong>Zero Fake Data:</strong> The marketplace displays only real approved products from vetted indie sellers. Never fabricate sales, reviews, or mock users.</li>
              <li><strong>Seller Verification:</strong> Review maker craftsmanship, studio city, and photo samples before verifying. Private verification docs are strictly restricted to admin.</li>
              <li><strong>Product Moderation:</strong> Inspect photos, titles, material description, and pricing to maintain platform quality before making pieces live.</li>
            </ul>
          </div>
        </motion.div>
      )}

      {/* TAB 2: SELLER APPLICATIONS */}
      {activeTab === 'applications' && (
        <motion.div
          key="tab-applications"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl border border-sand-200 shadow-soft-sm overflow-hidden"
        >
          <div className="p-4 border-b border-sand-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-stone-900">Seller Onboarding Applications</h3>
            <span className="text-xs text-stone-500 font-medium">
              {pendingApplications.length} awaiting review
            </span>
          </div>

          {applications.length === 0 ? (
            <div className="p-12 text-center text-xs text-stone-500">
              <Store className="w-8 h-8 text-stone-400 mx-auto mb-2" />
              <p className="font-bold text-stone-800">No seller applications submitted yet.</p>
              <p className="mt-1">When makers submit applications, they will appear here for review.</p>
            </div>
          ) : (
            <div className="divide-y divide-sand-100">
              {applications.map((app) => (
                <div key={app.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-extrabold text-stone-950">{app.store_name}</h4>
                      <Badge
                        variant={
                          app.status === 'approved'
                            ? 'success'
                            : app.status === 'rejected'
                            ? 'destructive'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {app.status}
                      </Badge>
                    </div>

                    <p className="text-xs text-stone-600">
                      Applicant: <strong>{app.full_name}</strong> • Phone: {app.phone} • City: <strong>{app.city}</strong> {app.area ? `(${app.area})` : ''}
                    </p>

                    <p className="text-xs text-stone-500 line-clamp-2">
                      {app.description}
                    </p>

                    {app.documents?.craft_samples && app.documents.craft_samples.length > 0 && (
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[11px] font-semibold text-stone-400">Samples:</span>
                        {app.documents.craft_samples.map((url, i) => (
                          <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-blue-600 hover:underline flex items-center gap-0.5 font-bold"
                          >
                            Sample {i + 1} <ExternalLink className="w-3 h-3" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {app.status !== 'approved' && (
                      <Button
                        size="sm"
                        onClick={() => handleApproveSeller(app.id)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white"
                      >
                        Approve Seller
                      </Button>
                    )}

                    {app.status !== 'rejected' && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRejectSeller(app.id)}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 shadow-none"
                      >
                        Reject
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* TAB 3: PRODUCT MODERATION */}
      {activeTab === 'products' && (
        <motion.div
          key="tab-products"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl border border-sand-200 shadow-soft-sm overflow-hidden"
        >
          <div className="p-4 border-b border-sand-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-stone-900">Catalog Moderation</h3>
            <span className="text-xs text-stone-500 font-medium">
              {pendingProducts.length} pending approval
            </span>
          </div>

          {products.length === 0 ? (
            <div className="p-12 text-center text-xs text-stone-500">
              <Package className="w-8 h-8 text-stone-400 mx-auto mb-2" />
              <p className="font-bold text-stone-800">No products submitted to catalog yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-sand-100">
              {products.map((p) => {
                const status = p.status || 'approved';
                return (
                  <div key={p.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-14 h-14 rounded-2xl object-cover bg-sand-100 shrink-0"
                      />
                      <div>
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

                        <div className="flex items-center gap-2 mt-0.5 text-xs text-stone-500">
                          <span className="font-bold text-stone-800">₹{p.price}</span>
                          <span>•</span>
                          <span>City: {p.city}</span>
                          <span>•</span>
                          <span>Seller: {p.seller?.store_name || p.seller_id}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {status !== 'approved' && (
                        <Button
                          size="sm"
                          onClick={() => handleApproveProduct(p.id)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white"
                        >
                          Approve
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handlePauseProduct(p.id, status)}
                        className="bg-sand-100 text-stone-800"
                      >
                        {status === 'paused' ? 'Unpause' : 'Pause'}
                      </Button>

                      {status !== 'rejected' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleRejectProduct(p.id)}
                          className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200"
                        >
                          Reject
                        </Button>
                      )}

                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Delete product permanently"
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

      {/* TAB 4: VERIFIED SELLERS */}
      {activeTab === 'sellers' && (
        <motion.div
          key="tab-sellers"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl border border-sand-200 shadow-soft-sm overflow-hidden"
        >
          <div className="p-4 border-b border-sand-100">
            <h3 className="font-bold text-sm text-stone-900">Verified Seller Roster</h3>
          </div>

          <div className="divide-y divide-sand-100">
            {sellers.map((s) => (
              <div key={s.id} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src={s.logo} alt={s.store_name} className="w-10 h-10 rounded-xl object-cover border border-sand-200" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-stone-900">{s.store_name}</h4>
                      <VerifiedBadge size="sm" showText={false} />
                    </div>
                    <p className="text-xs text-stone-500">{s.city} • {s.category_focus}</p>
                  </div>
                </div>

                <Badge variant="success" size="sm">
                  Verified
                </Badge>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* TAB 5: ORDERS & FULFILLMENT */}
      {activeTab === 'orders' && (
        <motion.div
          key="tab-orders"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl border border-sand-200 shadow-soft-sm overflow-hidden"
        >
          <div className="p-4 border-b border-sand-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-stone-900">Direct Customer Orders</h3>
            <span className="text-xs text-stone-500">{orders.length} total orders recorded</span>
          </div>

          {orders.length === 0 ? (
            <div className="p-12 text-center text-xs text-stone-500">
              <ShoppingBag className="w-8 h-8 text-stone-400 mx-auto mb-2" />
              <p className="font-bold text-stone-800">No customer orders placed yet.</p>
              <p className="mt-1">When buyers checkout on the marketplace, orders appear here with full addresses.</p>
            </div>
          ) : (
            <div className="divide-y divide-sand-100">
              {orders.map((ord) => (
                <div key={ord.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-stone-950 text-sm">Order #{ord.id}</span>
                      <Badge variant="brand" size="sm">
                        {ord.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-stone-600">
                      Customer: <strong>{ord.shipping_address.name}</strong> ({ord.shipping_address.phone}) • Deliver to: {ord.shipping_address.address_line}, {ord.shipping_address.city}
                    </p>
                    <div className="text-xs text-stone-500">
                      {ord.items.map((it, idx) => (
                        <span key={idx} className="mr-3">
                          • {it.quantity}x {it.product?.name || `Item #${it.product_id}`} (₹{it.price})
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-black text-stone-900">₹{ord.total_amount.toLocaleString('en-IN')}</span>
                    <select
                      value={ord.status}
                      onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as Order['status'])}
                      className="px-2.5 py-1.5 rounded-xl border border-sand-300 text-xs font-semibold bg-sand-50 focus:outline-none"
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
          )}
        </motion.div>
      )}

      {/* TAB 6: SUPPORTED CITIES */}
      {activeTab === 'cities' && (
        <motion.div
          key="tab-cities"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl border border-sand-200 shadow-soft-sm overflow-hidden p-6 space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-sand-100">
            <div>
              <h3 className="font-bold text-sm text-stone-900">Supported Indian Discovery Hubs</h3>
              <p className="text-xs text-stone-500">Cities enabled for hyper-local studio discovery</p>
            </div>
            <Badge variant="brand" size="sm">
              {POPULAR_INDIAN_CITIES.length} Cities Active
            </Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {POPULAR_INDIAN_CITIES.map((c) => (
              <div
                key={c.name}
                className="p-3.5 rounded-2xl bg-sand-50/80 border border-sand-200 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <div>
                    <span className="font-bold text-stone-900 block">{c.name}</span>
                    <span className="text-[10px] text-stone-400">{c.state}</span>
                  </div>
                </div>
                {c.popular && (
                  <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                    Priority
                  </span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
