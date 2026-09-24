import React, { useState } from 'react';
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
  Flag,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { marketplaceService } from '../services/marketplaceService';
import { SellerProfile, Product, Category, Report } from '../types';
import { VerifiedBadge, VerificationStatusBadge } from '../components/common/Badge';

export const AdminDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'sellers' | 'products' | 'categories' | 'reports'>('overview');

  const sellers = marketplaceService.getSellers();
  const products = marketplaceService.getProducts();
  const orders = marketplaceService.getOrders();
  const categories = marketplaceService.getCategories();
  const reports = marketplaceService.getReports();

  // Metrics
  const totalSellers = sellers.length;
  const verifiedSellers = sellers.filter((s) => s.verification_status === 'approved').length;
  const pendingSellers = sellers.filter((s) => s.verification_status === 'pending').length;
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0);
  const pendingReports = reports.filter((r) => r.status === 'pending').length;

  // New Category State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [newCatImage, setNewCatImage] = useState('https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80');

  const handleUpdateSellerStatus = (sellerId: string, status: SellerProfile['verification_status']) => {
    marketplaceService.updateSellerStatus(sellerId, status);
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Delete this listing as an administrator?')) {
      marketplaceService.deleteProduct(productId);
    }
  };

  const handleResolveReport = (reportId: string, status: Report['status']) => {
    marketplaceService.updateReportStatus(reportId, status);
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    marketplaceService.createCategory({
      name: newCatName.trim(),
      slug: newCatSlug.trim() || newCatName.toLowerCase().replace(/\s+/g, '-'),
      image: newCatImage.trim(),
      active: true,
      item_count: 0,
    });
    setNewCatName('');
    setNewCatSlug('');
    setIsCategoryModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-sand-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-stone-900 text-white flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-brand-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-stone-950 font-display">
              Selluy Administration Console
            </h1>
            <p className="text-xs text-stone-500">
              Platform governance, seller vetting, and catalog moderation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (window.confirm('Reset all marketplace data back to development seed data?')) {
                marketplaceService.resetToDefault();
                window.location.reload();
              }
            }}
            className="px-3.5 py-1.5 rounded-full bg-sand-100 hover:bg-sand-200 text-stone-700 text-xs font-bold transition"
          >
            Reset Seed Data
          </button>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-sand-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'overview' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-sand-100'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Overview
        </button>

        <button
          onClick={() => setActiveTab('sellers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'sellers' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-sand-100'
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          Sellers & Verification ({totalSellers})
          {pendingSellers > 0 && (
            <span className="w-4 h-4 rounded-full bg-amber-500 text-stone-950 text-[10px] font-bold flex items-center justify-center">
              {pendingSellers}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'products' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-sand-100'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          Product Moderation ({totalProducts})
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'categories' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-sand-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Categories ({categories.length})
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'reports' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-sand-100'
          }`}
        >
          <Flag className="w-3.5 h-3.5" />
          Reports ({reports.length})
          {pendingReports > 0 && (
            <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
              {pendingReports}
            </span>
          )}
        </button>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-sand-200/90 shadow-soft-sm space-y-1">
              <span className="text-stone-400 text-xs font-bold uppercase tracking-wider block">
                Total Marketplace Volume
              </span>
              <span className="text-2xl sm:text-3xl font-black text-stone-950 block">
                ₹{totalRevenue.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-stone-500">{totalOrders} simulated orders</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-sand-200/90 shadow-soft-sm space-y-1">
              <span className="text-stone-400 text-xs font-bold uppercase tracking-wider block">
                Active Creators
              </span>
              <span className="text-2xl sm:text-3xl font-black text-stone-950 block">
                {totalSellers}
              </span>
              <span className="text-[11px] text-emerald-600 font-semibold">{verifiedSellers} verified studios</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-sand-200/90 shadow-soft-sm space-y-1">
              <span className="text-stone-400 text-xs font-bold uppercase tracking-wider block">
                Pending Vetting
              </span>
              <span className="text-2xl sm:text-3xl font-black text-amber-600 block">
                {pendingSellers}
              </span>
              <span className="text-[11px] text-stone-500">Need review</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-sand-200/90 shadow-soft-sm space-y-1">
              <span className="text-stone-400 text-xs font-bold uppercase tracking-wider block">
                Live Products
              </span>
              <span className="text-2xl sm:text-3xl font-black text-stone-950 block">
                {totalProducts}
              </span>
              <span className="text-[11px] text-stone-500">Across {categories.length} niches</span>
            </div>
          </div>

          {/* Pending Applications Callout */}
          {pendingSellers > 0 && (
            <div className="bg-amber-500/10 border border-amber-300 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Store className="w-8 h-8 text-amber-700" />
                <div>
                  <h4 className="font-bold text-sm text-stone-950">
                    {pendingSellers} Creator Studio application(s) awaiting verification
                  </h4>
                  <p className="text-xs text-stone-600">
                    Inspect their Instagram portfolio and verify handmade authenticity before granting the official badge.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('sellers')}
                className="px-4 py-2 rounded-full bg-amber-600 text-white font-bold text-xs hover:bg-amber-500 transition whitespace-nowrap shadow-xs"
              >
                Review Applications
              </button>
            </div>
          )}
        </div>
      )}

      {/* SELLERS TAB */}
      {activeTab === 'sellers' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-sand-200/90 shadow-soft-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-sand-50 text-stone-500 font-bold border-b border-sand-200">
                  <tr>
                    <th className="p-4">Studio / Creator</th>
                    <th className="p-4">City</th>
                    <th className="p-4">Social Proof</th>
                    <th className="p-4">Rating & Orders</th>
                    <th className="p-4">Verification</th>
                    <th className="p-4 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-100 text-stone-700">
                  {sellers.map((s) => (
                    <tr key={s.id} className="hover:bg-sand-50/50">
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={s.logo}
                          alt=""
                          className="w-10 h-10 rounded-xl object-cover border border-sand-200"
                        />
                        <div>
                          <strong className="text-stone-950 block">{s.store_name}</strong>
                          <span className="text-[10px] text-stone-400">{s.category_focus}</span>
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-stone-800">{s.city}</td>
                      <td className="p-4">
                        {s.social_link ? (
                          <a
                            href={`https://${s.social_link}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-brand-600 hover:underline flex items-center gap-1 font-semibold"
                          >
                            <span>{s.social_link}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-stone-400">None</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="font-semibold block">{s.rating} ★ ({s.total_reviews} reviews)</span>
                        <span className="text-[10px] text-stone-500">{s.completed_orders} orders</span>
                      </td>
                      <td className="p-4">
                        <VerificationStatusBadge status={s.verification_status} />
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {s.verification_status !== 'approved' && (
                            <button
                              onClick={() => handleUpdateSellerStatus(s.id, 'approved')}
                              className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px]"
                            >
                              Approve
                            </button>
                          )}
                          {s.verification_status !== 'rejected' && (
                            <button
                              onClick={() => handleUpdateSellerStatus(s.id, 'rejected')}
                              className="px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-[11px]"
                            >
                              Reject
                            </button>
                          )}
                          {s.verification_status !== 'suspended' && (
                            <button
                              onClick={() => handleUpdateSellerStatus(s.id, 'suspended')}
                              className="px-2.5 py-1 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold text-[11px]"
                            >
                              Suspend
                            </button>
                          )}
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

      {/* PRODUCTS MODERATION TAB */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-sand-200/90 shadow-soft-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-sand-50 text-stone-500 font-bold border-b border-sand-200">
                  <tr>
                    <th className="p-4">Listing</th>
                    <th className="p-4">Seller</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Visibility</th>
                    <th className="p-4 text-right">Admin Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-100 text-stone-700">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-sand-50/50">
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={p.images[0]}
                          alt=""
                          className="w-10 h-10 rounded-xl object-cover border border-sand-200"
                        />
                        <strong className="text-stone-900 block max-w-xs truncate">{p.name}</strong>
                      </td>
                      <td className="p-4">{p.seller?.store_name}</td>
                      <td className="p-4 font-bold text-stone-900">₹{p.price}</td>
                      <td className="p-4">{p.city}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                          {p.active ? 'Active' : 'Hidden'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Remove from marketplace"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORIES TAB */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-stone-900">Marketplace Categories</h3>
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="px-4 py-2 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((c) => (
              <div key={c.id} className="bg-white p-4 rounded-3xl border border-sand-200 flex items-center gap-3">
                <img src={c.image} alt={c.name} className="w-12 h-12 rounded-2xl object-cover" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs text-stone-900 truncate">{c.name}</h4>
                  <span className="text-[10px] text-stone-400 block">slug: {c.slug}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Add Category Modal */}
          {isCategoryModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
              <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-sand-200 space-y-4">
                <h3 className="text-base font-bold text-stone-900">Add New Category</h3>
                <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Category Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Stationery & Journals"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Slug</label>
                    <input
                      type="text"
                      placeholder="e.g. stationery"
                      value={newCatSlug}
                      onChange={(e) => setNewCatSlug(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Image URL</label>
                    <input
                      type="url"
                      required
                      value={newCatImage}
                      onChange={(e) => setNewCatImage(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCategoryModalOpen(false)}
                      className="px-4 py-2 rounded-full bg-sand-100 text-stone-700 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-full bg-brand-600 text-white font-bold"
                    >
                      Save Category
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* REPORTS TAB */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-sand-200/90 shadow-soft-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-sand-50 text-stone-500 font-bold border-b border-sand-200">
                  <tr>
                    <th className="p-4">Target Type</th>
                    <th className="p-4">Reported Item</th>
                    <th className="p-4">Reason / Complaint</th>
                    <th className="p-4">Reporter</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Resolve</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-100 text-stone-700">
                  {reports.map((r) => (
                    <tr key={r.id} className="hover:bg-sand-50/50">
                      <td className="p-4 uppercase font-bold text-stone-500">{r.target_type}</td>
                      <td className="p-4 font-bold text-stone-900">{r.target_title || r.target_id}</td>
                      <td className="p-4 text-stone-600 max-w-sm">{r.reason}</td>
                      <td className="p-4">{r.reporter_name || 'Guest'}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${r.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleResolveReport(r.id, 'resolved')}
                            className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white font-bold text-[11px]"
                          >
                            Resolve
                          </button>
                          <button
                            onClick={() => handleResolveReport(r.id, 'dismissed')}
                            className="px-2.5 py-1 rounded-xl bg-sand-100 text-stone-600 font-bold text-[11px]"
                          >
                            Dismiss
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
    </div>
  );
};
