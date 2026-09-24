import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { marketplaceService } from '../services/marketplaceService';
import { SellerProfile, Product, Category, SellerApplication } from '../types';
import { VerifiedBadge } from '../components/common/VerifiedBadge';

export const AdminDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'sellers' | 'products'>('overview');

  const [applications, setApplications] = useState<SellerApplication[]>(marketplaceService.getApplications());
  const [sellers, setSellers] = useState<SellerProfile[]>(marketplaceService.getSellers());
  const [products, setProducts] = useState<Product[]>(marketplaceService.getAllRawProducts());
  const [orders, setOrders] = useState(marketplaceService.getOrders());

  const [toastMsg, setToastMsg] = useState('');

  const refreshAdminData = () => {
    setApplications([...marketplaceService.getApplications()]);
    setSellers([...marketplaceService.getSellers()]);
    setProducts([...marketplaceService.getAllRawProducts()]);
    setOrders([...marketplaceService.getOrders()]);
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

  // Metrics (Strictly Real Data)
  const pendingApplications = applications.filter((a) => a.status === 'pending');
  const approvedApplications = applications.filter((a) => a.status === 'approved');
  const verifiedSellersCount = sellers.filter((s) => s.verification_status === 'approved' || (s.verification_status as string) === 'verified').length;
  const pendingProducts = products.filter((p) => p.status === 'pending_approval');
  const approvedProducts = products.filter((p) => p.status === 'approved' || !p.status);
  const totalOrders = orders.length;

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
    const reason = prompt('Please enter a rejection reason for this seller:');
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

  const handleDeleteProduct = async (prodId: string) => {
    if (window.confirm('Are you sure you want to permanently delete this product?')) {
      await marketplaceService.adminDeleteProduct(prodId);
      refreshAdminData();
      showToast('Product removed.');
    }
  };

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
              Strict two-sided moderation: verified sellers &amp; approved products only
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Production Admin
          </span>
        </div>
      </div>

      {toastMsg && (
        <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs font-bold text-blue-800 flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-sand-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'overview' ? 'bg-stone-950 text-white' : 'text-stone-600 hover:bg-sand-100'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Overview
        </button>

        <button
          onClick={() => setActiveTab('applications')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'applications' ? 'bg-stone-950 text-white' : 'text-stone-600 hover:bg-sand-100'
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          Seller Applications ({applications.length})
          {pendingApplications.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 text-[10px] font-bold flex items-center justify-center">
              {pendingApplications.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'products' ? 'bg-stone-950 text-white' : 'text-stone-600 hover:bg-sand-100'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          Product Moderation ({products.length})
          {pendingProducts.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
              {pendingProducts.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('sellers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'sellers' ? 'bg-stone-950 text-white' : 'text-stone-600 hover:bg-sand-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Verified Sellers ({verifiedSellersCount})
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white p-4 rounded-3xl border border-sand-200">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Pending Applications</span>
              <span className="text-2xl font-black text-amber-600 mt-1 block">{pendingApplications.length}</span>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-sand-200">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Verified Sellers</span>
              <span className="text-2xl font-black text-stone-900 mt-1 block">{verifiedSellersCount}</span>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-sand-200">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Pending Products</span>
              <span className="text-2xl font-black text-blue-600 mt-1 block">{pendingProducts.length}</span>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-sand-200">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Approved Products</span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block">{approvedProducts.length}</span>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-sand-200">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Total Orders</span>
              <span className="text-2xl font-black text-stone-900 mt-1 block">{totalOrders}</span>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-sand-200">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Categories</span>
              <span className="text-2xl font-black text-stone-900 mt-1 block">{marketplaceService.getCategories().length}</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-sand-200">
            <h3 className="text-sm font-bold text-stone-900 mb-3">Moderation Architecture Guidelines</h3>
            <ul className="text-xs text-stone-600 space-y-2 list-disc pl-5">
              <li><strong>Zero Fake Data:</strong> The marketplace displays only real approved products from vetted indie sellers.</li>
              <li><strong>Seller Verification:</strong> Review maker craftsmanship, city, and photo samples before verifying.</li>
              <li><strong>Product Moderation:</strong> Inspect photos, titles, and pricing to maintain platform quality.</li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB 2: SELLER APPLICATIONS */}
      {activeTab === 'applications' && (
        <div className="bg-white rounded-3xl border border-sand-200 overflow-hidden">
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
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        app.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700'
                          : app.status === 'rejected'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {app.status}
                      </span>
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
                      <button
                        onClick={() => handleApproveSeller(app.id)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition"
                      >
                        Approve Seller
                      </button>
                    )}

                    {app.status !== 'rejected' && (
                      <button
                        onClick={() => handleRejectSeller(app.id)}
                        className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PRODUCT MODERATION */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-3xl border border-sand-200 overflow-hidden">
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
                        className="w-14 h-14 rounded-2xl object-cover bg-sand-100"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-stone-900">{p.name}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            status === 'approved'
                              ? 'bg-emerald-50 text-emerald-700'
                              : status === 'rejected'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-blue-50 text-blue-700'
                          }`}>
                            {status.replace('_', ' ')}
                          </span>
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
                        <button
                          onClick={() => handleApproveProduct(p.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                        >
                          Approve
                        </button>
                      )}

                      {status !== 'rejected' && (
                        <button
                          onClick={() => handleRejectProduct(p.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs transition"
                        >
                          Reject
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-1.5 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition"
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
        </div>
      )}

      {/* TAB 4: VERIFIED SELLERS */}
      {activeTab === 'sellers' && (
        <div className="bg-white rounded-3xl border border-sand-200 overflow-hidden">
          <div className="p-4 border-b border-sand-100">
            <h3 className="font-bold text-sm text-stone-900">Verified Seller Roster</h3>
          </div>

          <div className="divide-y divide-sand-100">
            {sellers.map((s) => (
              <div key={s.id} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src={s.logo} alt={s.store_name} className="w-10 h-10 rounded-xl object-cover" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-stone-900">{s.store_name}</h4>
                      <VerifiedBadge size="sm" showText={false} />
                    </div>
                    <p className="text-xs text-stone-500">{s.city} • {s.category_focus}</p>
                  </div>
                </div>

                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                  Verified
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
