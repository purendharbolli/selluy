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
  Lock,
  Eye,
  Instagram,
  Globe,
  Check,
  AlertCircle,
  X,
  FileText,
  Save,
  RefreshCw,
  Database,
  Copy,
  CheckCheck,
} from 'lucide-react';
import { marketplaceService } from '../services/marketplaceService';
import { SellerProfile, Product, Category, SellerApplication, Order } from '../types';
import { VerifiedBadge } from '../components/common/VerifiedBadge';
import { POPULAR_INDIAN_CITIES } from '../components/common/CityOnboardingModal';
import { Tabs } from '../components/ui/Tabs';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

const SQL_FIX_SCRIPT = `-- =========================================================
-- SELLUY: DATABASE SCHEMA FIX FOR CROSS-DEVICE AUTH & APPLICATIONS
-- Copy this ENTIRE script -> Paste into Supabase SQL Editor -> Click RUN
-- =========================================================

-- 1. Ensure columns exist on users table for cross-device authentication
alter table public.users add column if not exists password_hash text;
alter table public.users add column if not exists password_configured boolean default false;
alter table public.users add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now());

-- 2. Allow phone (+91) OTP accounts without immediate email requirement
alter table public.users alter column email drop not null;

-- 3. Support both 'buyer' and 'customer' roles in constraint
alter table public.users drop constraint if exists users_role_check;
alter table public.users add constraint users_role_check check (role in ('buyer', 'customer', 'seller', 'admin'));

-- 4. Enable Row Level Security (RLS) with open policies for users table
alter table public.users enable row level security;
drop policy if exists "Public users access" on public.users;
drop policy if exists "Public users insert" on public.users;
drop policy if exists "Public users update" on public.users;
drop policy if exists "Public users delete" on public.users;

create policy "Public users access" on public.users for select using (true);
create policy "Public users insert" on public.users for insert with check (true);
create policy "Public users update" on public.users for update using (true);
create policy "Public users delete" on public.users for delete using (true);

-- 5. Dedicated user_credentials table for reliable cross-device password sync
create table if not exists public.user_credentials (
  phone text primary key,
  password_hash text not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.user_credentials enable row level security;
drop policy if exists "Public access user_credentials select" on public.user_credentials;
drop policy if exists "Public access user_credentials insert" on public.user_credentials;
drop policy if exists "Public access user_credentials update" on public.user_credentials;
drop policy if exists "Public access user_credentials delete" on public.user_credentials;

create policy "Public access user_credentials select" on public.user_credentials for select using (true);
create policy "Public access user_credentials insert" on public.user_credentials for insert with check (true);
create policy "Public access user_credentials update" on public.user_credentials for update using (true);
create policy "Public access user_credentials delete" on public.user_credentials for delete using (true);

-- 6. Create the seller_applications table (No hard FK constraint so submission never fails)
create table if not exists public.seller_applications (
  id text primary key,
  user_id text not null,
  full_name text not null,
  store_name text not null,
  seller_type text check (seller_type in ('individual', 'small_business', 'local_store', 'brand')) default 'individual',
  city text not null,
  area text,
  business_address text,
  state text default 'Telangana',
  pincode text,
  category text not null,
  description text not null,
  phone text not null,
  email text,
  social_media_url text,
  website_url text,
  product_types text,
  craft_type text,
  product_range text,
  delivery_method text,
  product_samples text[] default '{}',
  verification_id_type text default 'aadhaar',
  government_id_front text,
  government_id_back text,
  documents jsonb default '{}'::jsonb,
  status text not null check (status in ('draft', 'pending', 'submitted', 'under_review', 'approved', 'rejected')) default 'under_review',
  rejection_reason text,
  internal_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.seller_applications enable row level security;
drop policy if exists "Public insert seller applications" on public.seller_applications;
drop policy if exists "Public read seller applications" on public.seller_applications;
drop policy if exists "Public update seller applications" on public.seller_applications;
drop policy if exists "Public delete seller applications" on public.seller_applications;

create policy "Public insert seller applications" on public.seller_applications for insert with check (true);
create policy "Public read seller applications" on public.seller_applications for select using (true);
create policy "Public update seller applications" on public.seller_applications for update using (true);
create policy "Public delete seller applications" on public.seller_applications for delete using (true);
`;

export const AdminDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'products' | 'sellers' | 'orders' | 'cities'>('overview');

  const [applications, setApplications] = useState<SellerApplication[]>(marketplaceService.getApplications());
  const [sellers, setSellers] = useState<SellerProfile[]>(marketplaceService.getSellers());
  const [products, setProducts] = useState<Product[]>(marketplaceService.getAllRawProducts());
  const [orders, setOrders] = useState<Order[]>(marketplaceService.getOrders());
  const [categories, setCategories] = useState<Category[]>(marketplaceService.getCategories());

  const [toastMsg, setToastMsg] = useState('');
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Seller Application Review Modal State
  const [selectedApp, setSelectedApp] = useState<SellerApplication | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [rejectModalApp, setRejectModalApp] = useState<SellerApplication | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState('');
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

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
  const pendingApplications = applications.filter(
    (a) => a.status === 'pending' || a.status === 'under_review' || a.status === 'submitted'
  );
  const approvedApplications = applications.filter((a) => a.status === 'approved');
  const verifiedSellersCount = sellers.filter((s) => s.verification_status === 'approved' || (s.verification_status as string) === 'verified').length;
  const pendingProducts = products.filter((p) => p.status === 'pending_approval');
  const approvedProducts = products.filter((p) => p.status === 'approved' || !p.status);
  const totalOrders = orders.length;
  const totalGMV = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

  // Actions
  const handleApproveSeller = async (appId: string, notes?: string) => {
    try {
      await marketplaceService.adminApproveSeller(appId, notes);
      refreshAdminData();
      if (selectedApp && selectedApp.id === appId) {
        setSelectedApp((prev) => (prev ? { ...prev, status: 'approved', internal_notes: notes } : null));
      }
      showToast('Seller application approved! Seller is now verified.');
    } catch (err: any) {
      alert(err.message || 'Failed to approve seller');
    }
  };

  const handleRejectSeller = async (appId: string, reason: string, notes?: string) => {
    try {
      await marketplaceService.adminRejectSeller(appId, reason || 'Application requirements not met.', notes);
      refreshAdminData();
      if (selectedApp && selectedApp.id === appId) {
        setSelectedApp((prev) => (prev ? { ...prev, status: 'rejected', rejection_reason: reason, internal_notes: notes } : null));
      }
      showToast('Seller application marked as rejected.');
    } catch (err: any) {
      alert(err.message || 'Failed to reject seller');
    }
  };

  const handleSaveNotes = async (appId: string) => {
    setIsSavingNotes(true);
    try {
      await marketplaceService.updateSellerApplication(appId, { internal_notes: adminNotes });
      refreshAdminData();
      if (selectedApp && selectedApp.id === appId) {
        setSelectedApp((prev) => (prev ? { ...prev, internal_notes: adminNotes } : null));
      }
      showToast('Internal notes saved successfully.');
    } catch (err: any) {
      alert(err.message || 'Failed to save notes');
    } finally {
      setIsSavingNotes(false);
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

  const handleDeleteApplication = async (appId: string, storeName: string) => {
    if (window.confirm(`Permanently delete seller application for "${storeName}"?`)) {
      await marketplaceService.adminDeleteApplication(appId);
      refreshAdminData();
      showToast(`Deleted application for ${storeName}`);
    }
  };

  const handleDeleteSeller = async (sellerId: string, storeName: string) => {
    if (window.confirm(`Remove "${storeName}" from verified sellers?`)) {
      await marketplaceService.adminDeleteSeller(sellerId);
      refreshAdminData();
      showToast(`Removed ${storeName} from verified sellers`);
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
          <div className="p-4 border-b border-sand-100 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-stone-900">Seller Onboarding Applications</h3>
              <p className="text-xs text-stone-500 font-medium">
                {pendingApplications.length} awaiting review
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  await marketplaceService.syncFromSupabase();
                  refreshAdminData();
                  showToast('Re-synced applications with cloud database.');
                }}
                className="text-xs text-blue-700 border-blue-200 hover:bg-blue-50 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Sync Cloud
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (window.confirm('Clear local application cache and fetch fresh from Supabase?')) {
                    marketplaceService.clearAllLocalApplications();
                    marketplaceService.syncFromSupabase();
                    refreshAdminData();
                    showToast('Applications cache cleared.');
                  }
                }}
                className="text-xs text-stone-600 border-sand-300 hover:bg-sand-100 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5 text-stone-500" />
                Clear Local
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowSqlModal(true)}
                className="text-xs text-amber-800 border-amber-300 bg-amber-50 hover:bg-amber-100 cursor-pointer"
              >
                <Database className="w-3.5 h-3.5 mr-1.5" />
                Supabase Fix
              </Button>
            </div>
          </div>

          {marketplaceService.isApplicationsTableMissing && (
            <div className="m-4 p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-start justify-between gap-3 text-xs text-amber-900">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold">Supabase Cloud Sync Notice:</span> The <code>seller_applications</code> table is not yet created in your Supabase project. Applications are temporarily stored in local browser cache. Click <strong>Supabase Cloud Fix</strong> to run the SQL migration so all devices sync instantly.
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => setShowSqlModal(true)}
                className="bg-amber-600 hover:bg-amber-500 text-white shrink-0 text-xs h-7"
              >
                View SQL Fix
              </Button>
            </div>
          )}

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
                        {app.status.replace('_', ' ')}
                      </Badge>
                      <span className="text-[11px] text-stone-400 font-mono">
                        {app.id}
                      </span>
                    </div>

                    <p className="text-xs text-stone-600">
                      Applicant: <strong>{app.full_name}</strong> • Phone: {app.phone} • City: <strong>{app.city}</strong> {app.area ? `(${app.area})` : ''}
                    </p>

                    <p className="text-xs text-stone-500 line-clamp-2">
                      {app.description}
                    </p>

                    <div className="flex items-center gap-3 pt-1 text-xs">
                      <span className="text-[11px] font-semibold text-stone-400">Category: <strong className="text-stone-700">{app.category}</strong></span>
                      {(app.product_samples?.length || app.documents?.craft_samples?.length) ? (
                        <span className="text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full font-bold">
                          {(app.product_samples?.length || app.documents?.craft_samples?.length)} Samples Attached
                        </span>
                      ) : null}
                      {(app.government_id_front || app.documents?.government_id_front) ? (
                        <span className="text-[11px] text-stone-600 bg-sand-100 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" /> ID Attached
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedApp(app);
                        setAdminNotes(app.internal_notes || '');
                      }}
                      className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      Review Details
                    </Button>

                    {app.status !== 'approved' && (
                      <Button
                        size="sm"
                        onClick={() => handleApproveSeller(app.id, app.internal_notes)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white"
                      >
                        Approve
                      </Button>
                    )}

                    {app.status !== 'rejected' && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setRejectModalApp(app);
                          setRejectReasonInput('');
                        }}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 shadow-none"
                      >
                        Reject
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteApplication(app.id, app.store_name)}
                      className="text-stone-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 h-8 px-2 cursor-pointer"
                      title="Delete application"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
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
          <div className="p-4 border-b border-sand-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-stone-900">Verified Seller Roster</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                await marketplaceService.syncFromSupabase();
                refreshAdminData();
                showToast('Re-synced sellers with cloud database.');
              }}
              className="text-xs text-blue-700 border-blue-200 hover:bg-blue-50 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Sync Cloud
            </Button>
          </div>

          <div className="divide-y divide-sand-100">
            {sellers.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-500">
                <Store className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                No verified sellers yet.
              </div>
            ) : (
              sellers.map((s) => (
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

                  <div className="flex items-center gap-2">
                    <Badge variant="success" size="sm">
                      Verified
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteSeller(s.id, s.store_name)}
                      className="text-stone-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 h-7 px-2 cursor-pointer"
                      title="Remove seller"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
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

      {/* 1. SELLER APPLICATION REVIEW MODAL */}
      <AnimatePresence>
        {selectedApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedApp(null)}
              className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="relative bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-sand-200 overflow-hidden z-10 my-8 max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-sand-200 shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-stone-950 font-display">
                      {selectedApp.store_name}
                    </h3>
                    <Badge
                      variant={
                        selectedApp.status === 'approved'
                          ? 'success'
                          : selectedApp.status === 'rejected'
                          ? 'destructive'
                          : 'warning'
                      }
                      size="sm"
                    >
                      {selectedApp.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Application ID: <span className="font-mono font-bold text-stone-700">{selectedApp.id}</span> • Submitted: {new Date(selectedApp.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedApp(null)}
                  className="w-8 h-8 rounded-full bg-sand-100 hover:bg-sand-200 text-stone-500 hover:text-stone-900 flex items-center justify-center transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="space-y-5 overflow-y-auto py-4 pr-1 flex-1">
                {/* Section 1: Applicant & Studio Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-sand-50/80 border border-sand-200 space-y-2 text-xs">
                    <span className="font-extrabold text-stone-900 uppercase tracking-wider block">
                      Applicant Information
                    </span>
                    <div className="space-y-1">
                      <div><span className="text-stone-500">Legal Name:</span> <strong className="text-stone-900">{selectedApp.full_name}</strong></div>
                      <div><span className="text-stone-500">Phone:</span> <strong className="text-stone-900">{selectedApp.phone}</strong></div>
                      <div><span className="text-stone-500">Email:</span> <strong className="text-stone-900">{selectedApp.email || 'None provided'}</strong></div>
                      <div><span className="text-stone-500">Base City:</span> <strong className="text-stone-900">{selectedApp.city}</strong> {selectedApp.area ? `(${selectedApp.area})` : ''}</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-sand-50/80 border border-sand-200 space-y-2 text-xs">
                    <span className="font-extrabold text-stone-900 uppercase tracking-wider block">
                      Store &amp; Online Links
                    </span>
                    <div className="space-y-1">
                      <div><span className="text-stone-500">Seller Type:</span> <strong className="text-stone-900 capitalize">{selectedApp.seller_type.replace('_', ' ')}</strong></div>
                      <div><span className="text-stone-500">Primary Category:</span> <strong className="text-stone-900">{selectedApp.category}</strong></div>
                      {selectedApp.social_media_url ? (
                        <div className="flex items-center gap-1">
                          <Instagram className="w-3 h-3 text-pink-600 shrink-0" />
                          <a href={selectedApp.social_media_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-bold truncate">
                            {selectedApp.social_media_url}
                          </a>
                        </div>
                      ) : (
                        <div><span className="text-stone-500">Social Media:</span> <span className="text-stone-400">None linked</span></div>
                      )}
                      {selectedApp.website_url ? (
                        <div className="flex items-center gap-1">
                          <Globe className="w-3 h-3 text-blue-600 shrink-0" />
                          <a href={selectedApp.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-bold truncate">
                            {selectedApp.website_url}
                          </a>
                        </div>
                      ) : (
                        <div><span className="text-stone-500">Website:</span> <span className="text-stone-400">None linked</span></div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 2: Store Description */}
                <div className="p-4 rounded-2xl bg-sand-50/60 border border-sand-200 text-xs space-y-1">
                  <span className="font-extrabold text-stone-900 uppercase tracking-wider block">
                    Store Bio &amp; Craftsmanship
                  </span>
                  <p className="text-stone-700 leading-relaxed whitespace-pre-wrap">
                    {selectedApp.description}
                  </p>
                </div>

                {/* Section 3: Craftsmanship & Product Samples */}
                <div className="p-4 rounded-2xl bg-sand-50/60 border border-sand-200 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-stone-900 uppercase tracking-wider block">
                      Craft &amp; Product Samples ({(selectedApp.product_samples || selectedApp.documents?.craft_samples || []).length} photos)
                    </span>
                    <span className="text-stone-500">
                      Craft: <strong>{selectedApp.craft_type || 'Artisan Handcrafted'}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {(selectedApp.product_samples || selectedApp.documents?.craft_samples || []).map((url, i) => (
                      <div
                        key={i}
                        onClick={() => setPreviewPhoto(url)}
                        className="relative rounded-xl overflow-hidden border border-sand-300 aspect-square group cursor-pointer shadow-xs bg-sand-100"
                      >
                        <img src={url} alt={`Sample ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition" />
                        <div className="absolute inset-0 bg-stone-950/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                          <Eye className="w-4 h-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 4: Protected Verification Documents & Dispatch Address */}
                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-950 uppercase tracking-wider">
                      <Lock className="w-3.5 h-3.5 text-amber-700" />
                      Confidential Government Identity &amp; Dispatch Address
                    </div>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                      Admin Confidential View
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* ID Front */}
                    <div>
                      <span className="text-xs font-bold text-stone-700 block mb-1">
                        {selectedApp.verification_id_type === 'voter_id' ? 'Voter ID Front' : 'Aadhaar Card Front'}
                      </span>
                      {(selectedApp.government_id_front || selectedApp.documents?.government_id_front) ? (
                        <div
                          onClick={() => setPreviewPhoto(selectedApp.government_id_front || selectedApp.documents?.government_id_front || null)}
                          className="relative rounded-xl overflow-hidden border border-sand-300 aspect-[16/10] group cursor-pointer bg-white"
                        >
                          <img
                            src={selectedApp.government_id_front || selectedApp.documents?.government_id_front}
                            alt="Government ID Front"
                            className="w-full h-full object-cover group-hover:scale-102 transition"
                          />
                          <div className="absolute inset-0 bg-stone-950/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white gap-1 text-xs font-bold">
                            <Eye className="w-4 h-4" /> Click to Inspect
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl bg-sand-100 text-stone-400 text-xs text-center">
                          No front ID uploaded
                        </div>
                      )}
                    </div>

                    {/* ID Back */}
                    <div>
                      <span className="text-xs font-bold text-stone-700 block mb-1">
                        Document Back (Address Side)
                      </span>
                      {(selectedApp.government_id_back || selectedApp.documents?.government_id_back) ? (
                        <div
                          onClick={() => setPreviewPhoto(selectedApp.government_id_back || selectedApp.documents?.government_id_back || null)}
                          className="relative rounded-xl overflow-hidden border border-sand-300 aspect-[16/10] group cursor-pointer bg-white"
                        >
                          <img
                            src={selectedApp.government_id_back || selectedApp.documents?.government_id_back}
                            alt="Government ID Back"
                            className="w-full h-full object-cover group-hover:scale-102 transition"
                          />
                          <div className="absolute inset-0 bg-stone-950/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white gap-1 text-xs font-bold">
                            <Eye className="w-4 h-4" /> Click to Inspect
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl bg-sand-100 text-stone-400 text-xs text-center">
                          No back ID uploaded
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-amber-200/60 text-xs space-y-1">
                    <span className="text-stone-500 font-bold block">Order Dispatch &amp; Pickup Address:</span>
                    <p className="text-stone-800 font-medium">
                      {selectedApp.business_address || 'Not specified'}
                    </p>
                    <p className="text-stone-600">
                      State: <strong>{selectedApp.state || 'Telangana'}</strong> • PIN Code: <strong>{selectedApp.pincode || 'Not specified'}</strong>
                    </p>
                  </div>
                </div>

                {/* Section 5: Internal Admin Notes */}
                <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-stone-900 uppercase tracking-wider block">
                      Internal Admin Notes &amp; Verification Audit
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSaveNotes(selectedApp.id)}
                      disabled={isSavingNotes}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {isSavingNotes ? 'Saving...' : 'Save Notes'}
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Enter private admin verification notes (e.g., Verified phone and Instagram; genuine local artisan)..."
                    className="w-full px-3 py-2 rounded-xl border border-sand-300 text-xs focus:ring-2 focus:ring-blue-500 bg-white resize-none"
                  />
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-sand-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedApp(null)}
                >
                  Close
                </Button>

                <div className="flex items-center gap-2">
                  {selectedApp.status !== 'approved' && (
                    <Button
                      size="sm"
                      onClick={() => handleApproveSeller(selectedApp.id, adminNotes)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-md font-bold"
                    >
                      <Check className="w-3.5 h-3.5 mr-1" />
                      Approve as Verified Seller
                    </Button>
                  )}

                  {selectedApp.status !== 'rejected' && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setRejectModalApp(selectedApp);
                        setRejectReasonInput('');
                      }}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 shadow-none font-bold"
                    >
                      Reject Application
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. REJECTION REASON MODAL */}
      <AnimatePresence>
        {rejectModalApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRejectModalApp(null)}
              className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-sand-200 z-10 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-sand-100">
                <h4 className="text-base font-extrabold text-stone-900">
                  Reject Application: {rejectModalApp.store_name}
                </h4>
                <button
                  onClick={() => setRejectModalApp(null)}
                  className="w-7 h-7 rounded-full bg-sand-100 hover:bg-sand-200 text-stone-500 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-stone-600">
                Specify the reason for rejection. This feedback will be displayed to the applicant so they can revise and resubmit:
              </p>

              {/* Quick Reason Chips */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Insufficient or low-quality product photos',
                  'Government ID proof is not clearly legible',
                  'Reseller or dropshipped items not permitted',
                  'Incomplete studio dispatch pickup address',
                ].map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setRejectReasonInput(reason)}
                    className="text-[10px] px-2.5 py-1 rounded-full bg-sand-100 hover:bg-blue-50 hover:text-blue-700 text-stone-700 font-medium transition cursor-pointer"
                  >
                    {reason}
                  </button>
                ))}
              </div>

              <textarea
                rows={3}
                required
                value={rejectReasonInput}
                onChange={(e) => setRejectReasonInput(e.target.value)}
                placeholder="Enter detailed rejection explanation..."
                className="w-full px-3 py-2 rounded-xl border border-sand-300 text-xs focus:ring-2 focus:ring-rose-500 resize-none"
              />

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-sand-100">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setRejectModalApp(null)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={!rejectReasonInput.trim()}
                  onClick={() => {
                    handleRejectSeller(rejectModalApp.id, rejectReasonInput.trim(), adminNotes);
                    setRejectModalApp(null);
                  }}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  Confirm Rejection
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. LIGHTBOX IMAGE PREVIEW */}
      <AnimatePresence>
        {previewPhoto && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md cursor-pointer"
            onClick={() => setPreviewPhoto(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-black"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={previewPhoto}
                alt="Document preview"
                className="w-full h-full object-contain max-h-[80vh]"
              />
              <button
                onClick={() => setPreviewPhoto(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-stone-900/80 text-white hover:bg-stone-900 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. SUPABASE CLOUD SQL FIX MODAL */}
      <AnimatePresence>
        {showSqlModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm"
            onClick={() => setShowSqlModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-sand-200 max-h-[88vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between pb-4 border-b border-sand-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-stone-900">
                      Supabase Cloud Database Fix
                    </h4>
                    <p className="text-xs text-stone-500">
                      Run this script in your Supabase SQL Editor to enable cross-device cloud sync for all seller applications.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSqlModal(false)}
                  className="w-8 h-8 rounded-full bg-sand-100 hover:bg-sand-200 text-stone-600 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="my-4 p-3 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 space-y-1">
                <p className="font-bold">Instructions:</p>
                <ol className="list-decimal pl-4 space-y-0.5 text-[11px] text-blue-800">
                  <li>Click <strong>Copy SQL</strong> below.</li>
                  <li>Open your <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline font-bold hover:text-blue-950">Supabase Dashboard</a> and go to the <strong>SQL Editor</strong> tab.</li>
                  <li>Paste the SQL script and click <strong>RUN</strong>.</li>
                </ol>
              </div>

              <div className="relative flex-1 min-h-[220px] rounded-2xl bg-stone-900 border border-stone-800 p-4 font-mono text-[11px] text-emerald-400 overflow-y-auto leading-relaxed select-all">
                <pre>{SQL_FIX_SCRIPT}</pre>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-sand-100 gap-3">
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-900 font-semibold"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open Supabase Dashboard
                </a>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowSqlModal(false)}
                  >
                    Close
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(SQL_FIX_SCRIPT);
                      setCopiedSql(true);
                      setTimeout(() => setCopiedSql(false), 2500);
                      showToast('SQL script copied to clipboard!');
                    }}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold"
                  >
                    {copiedSql ? (
                      <>
                        <CheckCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-300" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 mr-1.5" />
                        Copy SQL
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboardPage;
