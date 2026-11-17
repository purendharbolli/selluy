import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Search,
  Filter,
  X,
  ChevronRight,
  HelpCircle,
  Settings,
  LogOut,
  User as UserIcon,
  Bell,
  FileText,
  Sparkles,
  ArrowLeft,
  MoveLeft,
  MoveRight,
  AlertTriangle,
  Menu,
  SlidersHorizontal,
  Lock,
  Mail,
  Phone,
  Calendar,
  Share2,
  CheckCircle,
} from 'lucide-react';
import { marketplaceService } from '../services/marketplaceService';
import { useAuth } from '../context/AuthContext';
import { Product, Order, ProductStatus, SellerProfile, OrderStatus } from '../types';
import { VerifiedBadge } from '../components/common/VerifiedBadge';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

// Maximum upload limit: 10 MB per individual file (enforced strictly)
const MAX_IMAGE_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_PRODUCT_IMAGES = 8;

export const SellerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, role } = useAuth();

  // Active navigation tab
  // Desktop sidebar & Mobile navigation support
  const [activeTab, setActiveTab] = useState<
    'overview' | 'products' | 'add-product' | 'orders' | 'inventory' | 'profile' | 'settings'
  >('overview');

  // Mobile menu drawer
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Seller Data
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | undefined>(
    user ? marketplaceService.getSellerByUserId(user.id, user.phone) : undefined
  );
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
  const [sellerOrders, setSellerOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState(marketplaceService.getCategories());

  // Products filters & search
  const [productFilter, setProductFilter] = useState<
    'all' | 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'paused' | 'out_of_stock'
  >('all');
  const [productSearch, setProductSearch] = useState('');

  // Orders filters
  const [orderFilter, setOrderFilter] = useState<
    'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  >('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Inventory search
  const [inventorySearch, setInventorySearch] = useState('');

  // Add / Edit Product Form State
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: 999,
    original_price: 1299,
    stock: 12,
    category_id: '',
    city: '',
    images: [] as string[],
    variants: '',
    delivery_info: 'Same-day / Next-day local delivery available',
  });

  // Product Preview Modal state
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);

  // Store Profile Form State
  const [storeName, setStoreName] = useState('');
  const [storeDesc, setStoreDesc] = useState('');
  const [storeCategory, setStoreCategory] = useState('');
  const [storeCity, setStoreCity] = useState('');
  const [storeSocial, setStoreSocial] = useState('');
  const [storeWebsite, setStoreWebsite] = useState('');
  const [storeLogo, setStoreLogo] = useState('');
  const [storeCover, setStoreCover] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Settings State
  const [notificationOrders, setNotificationOrders] = useState(true);
  const [notificationApprovals, setNotificationApprovals] = useState(true);
  const [notificationWeekly, setNotificationWeekly] = useState(false);

  // Help & Notification Modals
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  // Feedback State
  const [toastMsg, setToastMsg] = useState('');
  const [uploadError, setUploadError] = useState<{ message: string; filename?: string } | null>(null);
  const [formError, setFormError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Refresh all seller data
  const refreshData = () => {
    if (!user) return;
    let profile = marketplaceService.getSellerByUserId(user.id, user.phone);
    if (!profile) {
      const app = marketplaceService.getApplicationByUserId(user.id, user.phone);
      if (app && (app.status === 'approved' || user.role === 'seller')) {
        profile = {
          id: 'seller-artsofhemaa',
          user_id: user.id,
          store_name: app.store_name || 'Artsofhemaa',
          description: app.description || 'Authentic handmade art and prints from Hyderabad.',
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
      }
    }

    setSellerProfile(profile);
    if (profile) {
      setSellerProducts(marketplaceService.getProductsBySeller(profile.id));
      setSellerOrders(marketplaceService.getOrdersBySeller(profile.id));
      setStoreName(profile.store_name || '');
      setStoreDesc(profile.description || '');
      setStoreCategory(profile.category_focus || '');
      setStoreCity(profile.city || '');
      setStoreSocial(profile.social_link || '');
      setStoreWebsite(profile.website_url || '');
      setStoreLogo(profile.logo || '');
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
    setTimeout(() => setToastMsg(''), 4000);
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

  // Time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // 1. Unauthenticated State
  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100 shadow-xs">
          <Store className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-black text-stone-950 font-display">Seller Studio Portal</h2>
        <p className="text-xs text-stone-600 max-w-sm mx-auto">
          Please log in to your Selloi account to access your seller dashboard and manage your pieces.
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

  // Fallback safety guard for sellerProfile
  const activeProfile: SellerProfile = sellerProfile || {
    id: 'seller-artsofhemaa',
    user_id: user.id,
    store_name: 'Artsofhemaa',
    description: 'Authentic handmade art and prints from Hyderabad.',
    logo: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
    city: 'Hyderabad',
    state: 'Telangana',
    category_focus: 'Art & Prints',
    verification_status: 'approved',
    rating: 5.0,
    total_reviews: 0,
    completed_orders: 0,
    created_at: new Date().toISOString(),
  };

  // --- REAL METRICS COMPUTATION (NO FAKE DATA) ---
  const totalProductsCount = sellerProducts.length;
  const pendingApprovalCount = sellerProducts.filter((p) => p.status === 'pending_approval').length;
  const approvedProductsCount = sellerProducts.filter((p) => p.status === 'approved' || (!p.status && p.active)).length;
  const draftProductsCount = sellerProducts.filter((p) => p.status === 'draft').length;
  const rejectedProductsCount = sellerProducts.filter((p) => p.status === 'rejected').length;
  const outOfStockCount = sellerProducts.filter((p) => p.status === 'out_of_stock' || p.stock === 0).length;

  const totalOrdersCount = sellerOrders.length;
  const completedOrders = sellerOrders.filter((o) => o.status === 'delivered');
  const totalRevenue = completedOrders.reduce((sum, ord) => sum + (ord.total_amount || 0), 0);

  // Filtered Products
  const filteredProducts = sellerProducts.filter((p) => {
    const matchesSearch =
      !productSearch.trim() ||
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.description.toLowerCase().includes(productSearch.toLowerCase());

    if (!matchesSearch) return false;

    if (productFilter === 'all') return true;
    if (productFilter === 'draft') return p.status === 'draft';
    if (productFilter === 'pending_approval') return p.status === 'pending_approval';
    if (productFilter === 'approved') return p.status === 'approved' || (!p.status && p.active);
    if (productFilter === 'rejected') return p.status === 'rejected';
    if (productFilter === 'paused') return p.status === 'paused';
    if (productFilter === 'out_of_stock') return p.status === 'out_of_stock' || p.stock === 0;
    return true;
  });

  // Filtered Orders
  const filteredOrders = sellerOrders.filter((ord) => {
    if (orderFilter === 'all') return true;
    return ord.status === orderFilter;
  });

  // Filtered Inventory
  const filteredInventory = sellerProducts.filter((p) => {
    if (!inventorySearch.trim()) return true;
    return (
      p.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      p.id.toLowerCase().includes(inventorySearch.toLowerCase())
    );
  });

  // --- PRODUCT PHOTO UPLOADER (STRICT 10 MB LIMIT PER FILE) ---
  // Compresses valid <= 10MB images via Canvas to ~180KB crisp JPEGs to prevent quota issues
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1600;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  const handleProductImageFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError(null);
    setFormError('');

    const currentImages = [...productForm.images];
    let oversizedFileFound: File | null = null;
    const acceptedFiles: File[] = [];

    // Check each individual file against the 10 MB limit
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
        oversizedFileFound = file;
      } else {
        acceptedFiles.push(file);
      }
    }

    if (oversizedFileFound) {
      setUploadError({
        message: 'This image is too large. Please choose an image under 10 MB.',
        filename: oversizedFileFound.name,
      });
    }

    // Process valid files (up to max 8 total)
    const availableSlots = MAX_PRODUCT_IMAGES - currentImages.length;
    const filesToProcess = acceptedFiles.slice(0, availableSlots);

    if (filesToProcess.length > 0) {
      const processedDataUrls: string[] = [];
      for (const f of filesToProcess) {
        const compressed = await compressImage(f);
        if (compressed) processedDataUrls.push(compressed);
      }

      setProductForm((prev) => ({
        ...prev,
        images: [...prev.images, ...processedDataUrls].slice(0, MAX_PRODUCT_IMAGES),
      }));
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeProductImage = (index: number) => {
    setProductForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const setCoverImage = (index: number) => {
    if (index === 0) return;
    setProductForm((prev) => {
      const selected = prev.images[index];
      const others = prev.images.filter((_, i) => i !== index);
      return {
        ...prev,
        images: [selected, ...others],
      };
    });
  };

  const moveImageOrder = (index: number, direction: 'left' | 'right') => {
    setProductForm((prev) => {
      const nextImages = [...prev.images];
      const targetIndex = direction === 'left' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= nextImages.length) return prev;
      const temp = nextImages[index];
      nextImages[index] = nextImages[targetIndex];
      nextImages[targetIndex] = temp;
      return {
        ...prev,
        images: nextImages,
      };
    });
  };

  // Open Add Product Flow
  const startAddProduct = () => {
    setEditingProductId(null);
    setFormError('');
    setUploadError(null);
    setProductForm({
      name: '',
      description: '',
      price: 850,
      original_price: 1100,
      stock: 12,
      category_id: categories[0]?.id || 'cat-fashion',
      city: activeProfile.city,
      images: [],
      variants: '',
      delivery_info: 'Same-day / Next-day local delivery available',
    });
    setActiveTab('add-product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Edit Product Flow
  const startEditProduct = (p: Product) => {
    setEditingProductId(p.id);
    setFormError('');
    setUploadError(null);
    setProductForm({
      name: p.name,
      description: p.description,
      price: p.price,
      original_price: p.original_price || p.price,
      stock: p.stock,
      category_id: p.category_id,
      city: p.city || activeProfile.city,
      images: p.images || [],
      variants: (p.variants || []).join(', '),
      delivery_info: p.delivery_info || 'Same-day / Next-day local delivery available',
    });
    setActiveTab('add-product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Save or Submit Product
  const handleSaveProduct = async (intent: 'draft' | 'submit') => {
    setFormError('');
    if (!productForm.name.trim()) {
      setFormError('Please enter a product title.');
      return;
    }
    if (productForm.price <= 0) {
      setFormError('Price must be greater than 0.');
      return;
    }
    if (intent === 'submit' && productForm.images.length === 0) {
      setFormError('Please upload at least one product photo (maximum 10 MB per image).');
      return;
    }

    setIsSubmittingProduct(true);
    const variantsArray = productForm.variants
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);

    try {
      const targetStatus: ProductStatus = intent === 'draft' ? 'draft' : 'pending_approval';

      if (editingProductId) {
        await marketplaceService.sellerUpdateProduct(editingProductId, activeProfile.id, {
          name: productForm.name.trim(),
          description: productForm.description.trim(),
          price: Number(productForm.price),
          original_price: Number(productForm.original_price) || undefined,
          stock: Number(productForm.stock),
          category_id: productForm.category_id,
          city: activeProfile.city,
          images: productForm.images,
          variants: variantsArray,
          delivery_info: productForm.delivery_info,
          status: targetStatus,
        });
        showToast(
          intent === 'draft'
            ? 'Draft updated successfully.'
            : 'Product updated and submitted for admin review.'
        );
      } else {
        await marketplaceService.createProduct({
          seller_id: activeProfile.id,
          category_id: productForm.category_id || categories[0]?.id || 'cat-art',
          name: productForm.name.trim(),
          description: productForm.description.trim(),
          price: Number(productForm.price),
          original_price: Number(productForm.original_price) || undefined,
          stock: Number(productForm.stock),
          images: productForm.images,
          city: activeProfile.city,
          variants: variantsArray,
          delivery_info: productForm.delivery_info,
          active: false,
          status: targetStatus,
        });
        showToast(
          intent === 'draft'
            ? 'Product saved as draft.'
            : 'Piece submitted for moderation review! Our team will review it shortly.'
        );
      }

      refreshData();
      setActiveTab('products');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setFormError(err.message || 'We could not submit this product right now. Your draft is still saved.');
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  // Quick Stock update from Inventory tab
  const handleUpdateStockCount = async (productId: string, newStock: number) => {
    try {
      await marketplaceService.sellerUpdateStock(productId, activeProfile.id, newStock);
      refreshData();
      showToast('Inventory level updated.');
    } catch (err: any) {
      alert(err.message || 'Failed to update stock');
    }
  };

  // Pause / Unpause product
  const handleTogglePause = async (id: string) => {
    try {
      const updated = await marketplaceService.sellerPauseProduct(id, activeProfile.id);
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
        await marketplaceService.sellerDeleteProduct(id, activeProfile.id);
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
      await marketplaceService.updateSellerProfile(activeProfile.id, {
        store_name: storeName.trim(),
        description: storeDesc.trim(),
        category_focus: storeCategory.trim(),
        logo: storeLogo || activeProfile.logo,
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

  // Order status update
  const handleUpdateOrderStatus = async (orderId: string, nextStatus: OrderStatus) => {
    try {
      await marketplaceService.updateOrderStatus(orderId, nextStatus);
      refreshData();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: nextStatus });
      }
      showToast(`Order status updated to: ${nextStatus}`);
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    }
  };

  // Status badge renderer with label + icon
  const renderProductStatusBadge = (status?: ProductStatus, stock?: number) => {
    if (status === 'out_of_stock' || stock === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
          <AlertCircle className="w-3 h-3 text-rose-600" />
          <span>Out of Stock</span>
        </span>
      );
    }
    if (status === 'draft') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sand-200 text-stone-700 border border-sand-300">
          <FileText className="w-3 h-3 text-stone-500" />
          <span>Draft</span>
        </span>
      );
    }
    if (status === 'pending_approval') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
          <Clock className="w-3 h-3 text-amber-600" />
          <span>Pending Approval</span>
        </span>
      );
    }
    if (status === 'rejected') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-900 border border-rose-200">
          <AlertTriangle className="w-3 h-3 text-rose-600" />
          <span>Needs Changes</span>
        </span>
      );
    }
    if (status === 'paused') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-100 text-orange-900 border border-orange-200">
          <PauseCircle className="w-3 h-3 text-orange-600" />
          <span>Paused</span>
        </span>
      );
    }
    // Default approved
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        <span>Approved</span>
      </span>
    );
  };

  // Desktop sidebar navigation items
  const sidebarNavItems = [
    { id: 'overview' as const, label: 'Overview', icon: <TrendingUp className="w-4 h-4" /> },
    {
      id: 'products' as const,
      label: 'Products',
      icon: <Package className="w-4 h-4" />,
      badge: totalProductsCount > 0 ? totalProductsCount : undefined,
    },
    { id: 'add-product' as const, label: 'Add Product', icon: <Plus className="w-4 h-4" />, isAction: true },
    {
      id: 'orders' as const,
      label: 'Orders',
      icon: <ShoppingBag className="w-4 h-4" />,
      badge: totalOrdersCount > 0 ? totalOrdersCount : undefined,
    },
    { id: 'inventory' as const, label: 'Inventory', icon: <Layers className="w-4 h-4" /> },
    { id: 'profile' as const, label: 'Store Profile', icon: <Store className="w-4 h-4" /> },
    { id: 'settings' as const, label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row text-stone-900">
      {/* ======================================================== */}
      {/* DESKTOP SIDEBAR                                          */}
      {/* ======================================================== */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-sand-200 sticky top-0 h-screen z-30 shrink-0 select-none">
        {/* Workspace Brand Header */}
        <div className="p-5 border-b border-sand-100 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shadow-xs">
              S
            </div>
            <div>
              <span className="font-black text-stone-950 font-display text-base tracking-tight block leading-tight">
                SELLOI<span className="text-[#FACC15]">.</span>
              </span>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                Seller Workspace
              </span>
            </div>
          </Link>
        </div>

        {/* Seller Identity Card Mini */}
        <div className="p-4 mx-3 my-3 bg-sand-50 rounded-2xl border border-sand-200/80 flex items-center gap-3">
          <img
            src={activeProfile.logo}
            alt={activeProfile.store_name}
            className="w-10 h-10 rounded-xl object-cover border border-sand-200 shadow-xs shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <h4 className="font-extrabold text-xs text-stone-950 truncate">{activeProfile.store_name}</h4>
              <VerifiedBadge size="sm" showText={false} />
            </div>
            <p className="text-[11px] text-stone-500 truncate">{activeProfile.city}</p>
          </div>
        </div>

        {/* Primary Navigation Links */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-2">
          {sidebarNavItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'add-product') {
                    startAddProduct();
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                  item.isAction
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs my-2'
                    : isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-stone-600 hover:bg-sand-100 hover:text-stone-950'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={item.isAction ? 'text-yellow-300' : isActive ? 'text-blue-600' : 'text-stone-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-blue-200 text-blue-900' : 'bg-sand-200 text-stone-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Utility Actions */}
        <div className="p-3 border-t border-sand-100 space-y-1">
          <Link
            to={`/seller/${activeProfile.id}`}
            target="_blank"
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold text-stone-600 hover:text-blue-600 hover:bg-blue-50 transition"
          >
            <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
            <span>View Store</span>
          </Link>
          <button
            onClick={() => setShowHelpModal(true)}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-sand-100 transition cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-stone-400" />
            <span>Help &amp; FAQs</span>
          </button>
          <button
            onClick={() => {
              if (window.confirm('Sign out from your seller account?')) {
                logout();
                navigate('/');
              }
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-500" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* MOBILE COMPACT TOP HEADER                                */}
      {/* ======================================================== */}
      <header className="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-sand-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <img
            src={activeProfile.logo}
            alt={activeProfile.store_name}
            className="w-9 h-9 rounded-xl object-cover border border-sand-200"
          />
          <div>
            <div className="flex items-center gap-1">
              <h2 className="font-extrabold text-sm text-stone-950 truncate max-w-[150px]">
                {activeProfile.store_name}
              </h2>
              <VerifiedBadge size="sm" showText={false} />
            </div>
            <p className="text-[10px] text-stone-500">{activeProfile.city}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowNotificationsModal(true)}
            className="p-2 rounded-xl hover:bg-sand-100 text-stone-600 relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {rejectedProductsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5" />
            )}
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-xl hover:bg-sand-100 text-stone-700 cursor-pointer"
            title="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ======================================================== */}
      {/* MOBILE DRAWER SHEET                                      */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-stone-950/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative ml-auto w-72 bg-white h-full shadow-2xl flex flex-col p-5 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-sand-100">
                <span className="font-bold text-xs uppercase tracking-wider text-stone-400">Workspace Menu</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-sand-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 space-y-1">
                <button
                  onClick={() => {
                    setActiveTab('inventory');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-xs font-bold text-stone-700 hover:bg-sand-50"
                >
                  <Layers className="w-4 h-4 text-stone-400" />
                  <span>Inventory Management</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('settings');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-xs font-bold text-stone-700 hover:bg-sand-50"
                >
                  <Settings className="w-4 h-4 text-stone-400" />
                  <span>Account &amp; Security</span>
                </button>
                <Link
                  to={`/seller/${activeProfile.id}`}
                  target="_blank"
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-xs font-bold text-stone-700 hover:bg-sand-50"
                >
                  <ExternalLink className="w-4 h-4 text-stone-400" />
                  <span>View Public Store</span>
                </Link>
                <button
                  onClick={() => {
                    setShowHelpModal(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-xs font-bold text-stone-700 hover:bg-sand-50"
                >
                  <HelpCircle className="w-4 h-4 text-stone-400" />
                  <span>Help &amp; FAQs</span>
                </button>
              </div>

              <div className="pt-3 border-t border-sand-100">
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="w-full flex items-center gap-2.5 p-3 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MAIN CONTENT AREA                                        */}
      {/* ======================================================== */}
      <main className="flex-1 pb-24 md:pb-12 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Toast Alert */}
        <AnimatePresence>
          {toastMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-bold flex items-center gap-2 shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{toastMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ======================================================== */}
        {/* VIEW 1: OVERVIEW DASHBOARD                               */}
        {/* ======================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Header Greeting */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200/90 shadow-soft-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200 mb-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified Seller Status Active</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-stone-950 font-display">
                  {getGreeting()}, {user.name?.split(' ')[0] || activeProfile.store_name}
                </h1>
                <p className="text-xs text-stone-500 mt-1">
                  Here&apos;s what&apos;s happening with your store today.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  onClick={startAddProduct}
                  size="md"
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-yellow-300" />
                  <span>Add Product</span>
                </Button>
              </div>
            </div>

            {/* FIRST-TIME SELLER ONBOARDING PROGRESS (Shows when 0 products) */}
            {totalProductsCount === 0 && (
              <div className="bg-linear-to-r from-blue-50/80 via-white to-amber-50/60 rounded-3xl p-6 sm:p-8 border border-blue-200/80 shadow-soft-sm space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
                    <Sparkles className="w-6 h-6 text-yellow-300" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-xl font-extrabold text-stone-950">Your store is ready.</h2>
                    <p className="text-xs text-stone-600 leading-relaxed max-w-xl">
                      Your store <strong className="text-stone-900">{activeProfile.store_name}</strong> is verified in {activeProfile.city}. Start adding your handmade goods, crafts, or apparel to start receiving orders from local buyers.
                    </p>
                  </div>
                </div>

                {/* Progress Checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-white border border-emerald-200 shadow-xs flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-stone-900">Seller Verification</p>
                      <p className="text-[10px] text-emerald-700">Completed</p>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white border border-sand-200 shadow-xs flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-stone-900">Store Profile</p>
                      <p className="text-[10px] text-stone-500">Configured</p>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white border border-blue-200 shadow-xs flex items-center gap-2.5 ring-2 ring-blue-500/20">
                    <div className="w-4 h-4 rounded-full border-2 border-blue-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-blue-900">Add First Product</p>
                      <p className="text-[10px] text-blue-600">Action needed</p>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-sand-50/60 border border-sand-200/60 flex items-center gap-2.5 opacity-60">
                    <div className="w-4 h-4 rounded-full border-2 border-stone-300 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-stone-500">Publish Drops</p>
                      <p className="text-[10px] text-stone-400">Next</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <Button
                    onClick={startAddProduct}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md"
                  >
                    <Plus className="w-4 h-4 mr-1 text-yellow-300" />
                    <span>+ Add Your First Product</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('profile')}
                    className="text-xs text-stone-700 border-sand-300"
                  >
                    Edit Store Profile
                  </Button>
                </div>
              </div>
            )}

            {/* REAL METRICS CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Total Products */}
              <div className="bg-white rounded-3xl p-5 border border-sand-200 shadow-soft-sm space-y-2">
                <div className="flex items-center justify-between text-stone-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Products</span>
                  <Package className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-black text-stone-950 font-display">
                  {totalProductsCount > 0 ? totalProductsCount : 'No data yet'}
                </div>
                <p className="text-[11px] text-stone-500">
                  {approvedProductsCount} live on marketplace
                </p>
              </div>

              {/* Card 2: Pending Approval */}
              <div className="bg-white rounded-3xl p-5 border border-sand-200 shadow-soft-sm space-y-2">
                <div className="flex items-center justify-between text-stone-500">
                  <span className="text-xs font-bold uppercase tracking-wider">In Review</span>
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl font-black text-stone-950 font-display">
                  {pendingApprovalCount > 0 ? pendingApprovalCount : '0'}
                </div>
                <p className="text-[11px] text-stone-500">
                  {pendingApprovalCount > 0 ? 'Awaiting admin review' : 'No items awaiting review'}
                </p>
              </div>

              {/* Card 3: Orders */}
              <div className="bg-white rounded-3xl p-5 border border-sand-200 shadow-soft-sm space-y-2">
                <div className="flex items-center justify-between text-stone-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Orders</span>
                  <ShoppingBag className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-2xl font-black text-stone-950 font-display">
                  {totalOrdersCount > 0 ? totalOrdersCount : 'No data yet'}
                </div>
                <p className="text-[11px] text-stone-500">
                  {completedOrders.length} delivered to buyers
                </p>
              </div>

              {/* Card 4: Revenue */}
              <div className="bg-white rounded-3xl p-5 border border-sand-200 shadow-soft-sm space-y-2">
                <div className="flex items-center justify-between text-stone-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Revenue</span>
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-stone-950 font-display">
                  {totalRevenue > 0 ? `₹${totalRevenue.toLocaleString('en-IN')}` : totalOrdersCount > 0 ? '₹0' : 'No data yet'}
                </div>
                <p className="text-[11px] text-stone-500">
                  From completed deliveries
                </p>
              </div>
            </div>

            {/* QUICK ACTIONS ROW */}
            <div className="space-y-3">
              <h3 className="text-sm font-extrabold text-stone-900 tracking-tight">Quick Actions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={startAddProduct}
                  className="p-4 rounded-2xl bg-white border border-sand-200 hover:border-blue-300 hover:bg-blue-50/50 transition text-left space-y-1 shadow-xs group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition">
                    <Plus className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-stone-900 pt-1">Add Product</h4>
                  <p className="text-[11px] text-stone-500">Publish a new creation</p>
                </button>

                <button
                  onClick={() => setActiveTab('products')}
                  className="p-4 rounded-2xl bg-white border border-sand-200 hover:border-blue-300 hover:bg-blue-50/50 transition text-left space-y-1 shadow-xs group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition">
                    <Package className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-stone-900 pt-1">Manage Products</h4>
                  <p className="text-[11px] text-stone-500">View &amp; edit catalog</p>
                </button>

                <button
                  onClick={() => setActiveTab('orders')}
                  className="p-4 rounded-2xl bg-white border border-sand-200 hover:border-blue-300 hover:bg-blue-50/50 transition text-left space-y-1 shadow-xs group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-stone-900 pt-1">View Orders</h4>
                  <p className="text-[11px] text-stone-500">Track fulfillments</p>
                </button>

                <button
                  onClick={() => setActiveTab('profile')}
                  className="p-4 rounded-2xl bg-white border border-sand-200 hover:border-blue-300 hover:bg-blue-50/50 transition text-left space-y-1 shadow-xs group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition">
                    <Store className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-stone-900 pt-1">Edit Store</h4>
                  <p className="text-[11px] text-stone-500">Profile &amp; social links</p>
                </button>
              </div>
            </div>

            {/* RECENT PRODUCTS & RECENT ORDERS SPLIT */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Products */}
              <div className="bg-white rounded-3xl p-6 border border-sand-200 shadow-soft-sm space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-sand-100">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-extrabold text-stone-950">Recent Products</h3>
                  </div>
                  {totalProductsCount > 0 && (
                    <button
                      onClick={() => setActiveTab('products')}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      View all ({totalProductsCount})
                    </button>
                  )}
                </div>

                {sellerProducts.length === 0 ? (
                  <div className="py-8 text-center space-y-2">
                    <Package className="w-8 h-8 text-stone-300 mx-auto" />
                    <p className="text-xs font-bold text-stone-800">You haven&apos;t added any products yet.</p>
                    <p className="text-[11px] text-stone-500">Add pieces to start selling to buyers in your city.</p>
                    <div className="pt-2">
                      <Button size="sm" onClick={startAddProduct} className="text-xs">
                        + Add Your First Product
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-sand-100">
                    {sellerProducts.slice(0, 4).map((prod) => (
                      <div key={prod.id} className="py-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={prod.images[0] || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c'}
                            alt={prod.name}
                            className="w-11 h-11 rounded-xl object-cover border border-sand-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-stone-900 truncate">{prod.name}</h4>
                            <p className="text-[11px] text-stone-500">₹{prod.price} • Stock: {prod.stock}</p>
                          </div>
                        </div>
                        <div className="shrink-0 flex items-center gap-2">
                          {renderProductStatusBadge(prod.status, prod.stock)}
                          <button
                            onClick={() => startEditProduct(prod)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-sand-100"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-3xl p-6 border border-sand-200 shadow-soft-sm space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-sand-100">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-sm font-extrabold text-stone-950">Customer Orders</h3>
                  </div>
                  {totalOrdersCount > 0 && (
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      View all ({totalOrdersCount})
                    </button>
                  )}
                </div>

                {sellerOrders.length === 0 ? (
                  <div className="py-8 text-center space-y-2">
                    <ShoppingBag className="w-8 h-8 text-stone-300 mx-auto" />
                    <p className="text-xs font-bold text-stone-800">No orders yet.</p>
                    <p className="text-[11px] text-stone-500">Your customer orders will appear here as soon as buyers check out.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-sand-100">
                    {sellerOrders.slice(0, 4).map((ord) => (
                      <div key={ord.id} className="py-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold text-stone-900">Order #{ord.id}</p>
                          <p className="text-[11px] text-stone-500">
                            {new Date(ord.created_at).toLocaleDateString()} • ₹{ord.total_amount}
                          </p>
                        </div>
                        <Badge size="sm" variant="brand">
                          {ord.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 2: PRODUCTS PAGE                                    */}
        {/* ======================================================== */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Products Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-stone-950 font-display">Products</h1>
                <p className="text-xs text-stone-500 mt-0.5">Manage everything you&apos;re selling on Selloi.</p>
              </div>

              <Button
                onClick={startAddProduct}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shrink-0 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 text-yellow-300" />
                <span>+ Add Product</span>
              </Button>
            </div>

            {/* Filter Tabs & Search */}
            <div className="bg-white rounded-3xl p-4 border border-sand-200 shadow-soft-sm space-y-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                {/* Search Bar */}
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search your products..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-sand-50 border border-sand-200 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                  {productSearch && (
                    <button
                      onClick={() => setProductSearch('')}
                      className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Counter */}
                <span className="text-xs text-stone-500 font-medium self-start sm:self-center">
                  Showing {filteredProducts.length} of {totalProductsCount} products
                </span>
              </div>

              {/* Status Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
                {[
                  { id: 'all', label: 'All', count: totalProductsCount },
                  { id: 'approved', label: 'Approved', count: approvedProductsCount },
                  { id: 'pending_approval', label: 'Pending Review', count: pendingApprovalCount },
                  { id: 'draft', label: 'Drafts', count: draftProductsCount },
                  { id: 'rejected', label: 'Needs Changes', count: rejectedProductsCount },
                  { id: 'out_of_stock', label: 'Out of Stock', count: outOfStockCount },
                ].map((chip) => (
                  <button
                    key={chip.id}
                    onClick={() => setProductFilter(chip.id as any)}
                    className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap text-xs transition cursor-pointer flex items-center gap-1.5 ${
                      productFilter === chip.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-sand-100 text-stone-600 hover:bg-sand-200'
                    }`}
                  >
                    <span>{chip.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        productFilter === chip.id ? 'bg-blue-700 text-white' : 'bg-sand-200 text-stone-600'
                      }`}
                    >
                      {chip.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Products List / Table */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-sand-200 shadow-soft-sm space-y-3">
                <Package className="w-10 h-10 text-stone-300 mx-auto" />
                <h3 className="font-extrabold text-sm text-stone-800">
                  {productSearch ? 'No products match your search' : "You haven't added any products in this category yet."}
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  {productSearch
                    ? 'Try adjusting your search terms or clearing filters.'
                    : 'Add pieces to your storefront to start receiving orders.'}
                </p>
                <div className="pt-2">
                  <Button size="sm" onClick={startAddProduct} className="text-xs">
                    + Add Product
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="bg-white rounded-3xl p-5 border border-sand-200 shadow-soft-sm hover:border-sand-300 transition space-y-3"
                  >
                    {/* Rejection Alert Banner if rejected */}
                    {prod.status === 'rejected' && (
                      <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="block font-bold">Product needs changes:</strong>
                            <p className="text-rose-800 mt-0.5">{prod.rejection_reason || 'Please provide clearer product photos or more detailed craftsmanship descriptions.'}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => startEditProduct(prod)}
                          className="bg-rose-600 hover:bg-rose-700 text-white shrink-0 text-xs"
                        >
                          Edit &amp; Resubmit
                        </Button>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Product Media & Info */}
                      <div className="flex items-start sm:items-center gap-4">
                        <img
                          src={prod.images[0] || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c'}
                          alt={prod.name}
                          className="w-16 h-16 rounded-2xl object-cover border border-sand-200 shadow-xs shrink-0"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-extrabold text-sm text-stone-950">{prod.name}</h3>
                            {renderProductStatusBadge(prod.status, prod.stock)}
                          </div>
                          <p className="text-xs text-stone-500 line-clamp-1">{prod.description}</p>
                          <div className="flex items-center gap-3 text-[11px] text-stone-600 pt-0.5 flex-wrap">
                            <span className="font-black text-stone-950">₹{prod.price}</span>
                            {prod.original_price && prod.original_price > prod.price && (
                              <span className="text-stone-400 line-through">₹{prod.original_price}</span>
                            )}
                            <span>•</span>
                            <span className={prod.stock === 0 ? 'text-rose-600 font-bold' : ''}>
                              Stock: {prod.stock} units
                            </span>
                            <span>•</span>
                            <span className="text-stone-400">
                              Updated {new Date(prod.updated_at || prod.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {/* Preview */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPreviewProduct(prod)}
                          className="text-xs text-stone-600 border-sand-300 hover:bg-sand-50"
                          title="Preview Product"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1 text-stone-400" />
                          <span>Preview</span>
                        </Button>

                        {/* Edit */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEditProduct(prod)}
                          className="text-xs text-blue-700 border-blue-200 hover:bg-blue-50"
                          title="Edit Piece"
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-1" />
                          <span>Edit</span>
                        </Button>

                        {/* Pause / Resume */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTogglePause(prod.id)}
                          className="text-xs text-stone-600 border-sand-300 hover:bg-sand-50"
                          title={prod.status === 'paused' ? 'Unpause' : 'Pause'}
                        >
                          {prod.status === 'paused' ? (
                            <PlayCircle className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <PauseCircle className="w-3.5 h-3.5 text-orange-500" />
                          )}
                        </Button>

                        {/* Delete */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="text-xs text-stone-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50"
                          title="Archive Piece"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 3: ADD / EDIT PRODUCT                               */}
        {/* ======================================================== */}
        {activeTab === 'add-product' && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-between pb-3 border-b border-sand-200">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab('products')}
                  className="p-2 rounded-xl border border-sand-200 hover:bg-sand-100 text-stone-600"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-stone-950 font-display">
                    {editingProductId ? 'Edit Product' : 'Add New Product'}
                  </h1>
                  <p className="text-xs text-stone-500">
                    Upload your photos and provide accurate piece details for curation.
                  </p>
                </div>
              </div>
            </div>

            {/* Error Banner */}
            {formError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-bold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveProduct('submit');
              }}
              className="space-y-6"
            >
              {/* SECTION: PRODUCT PHOTO UPLOAD (10 MB LIMIT) */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-soft-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-stone-950">
                      Product Photos <span className="text-rose-500">*</span>
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Upload clear photos of your product from your device.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-stone-500">
                    {productForm.images.length} / {MAX_PRODUCT_IMAGES} photos
                  </span>
                </div>

                {/* Oversized Error Notice */}
                {uploadError && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      <div>
                        <strong className="block font-bold">Image couldn&apos;t be uploaded</strong>
                        <p className="text-amber-800 mt-0.5">{uploadError.message}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-7 ml-6"
                    >
                      Choose Another Photo
                    </Button>
                  </div>
                )}

                {/* Upload Drop Area */}
                {productForm.images.length < MAX_PRODUCT_IMAGES && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleProductImageFiles(e.dataTransfer.files);
                    }}
                    className="border-2 border-dashed border-sand-300 hover:border-blue-400 bg-sand-50/70 hover:bg-blue-50/30 rounded-3xl p-8 text-center cursor-pointer transition space-y-3 group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white text-blue-600 flex items-center justify-center mx-auto shadow-xs border border-sand-200 group-hover:scale-105 transition">
                      <Upload className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-extrabold text-stone-900">
                        + Add Product Photos
                      </p>
                      <p className="text-[11px] text-stone-500">
                        Upload photos from your device media or take a photo with camera
                      </p>
                      <p className="text-[11px] font-bold text-blue-600 pt-1">
                        JPG • JPEG • PNG • WebP
                      </p>
                      <p className="text-[11px] font-extrabold text-stone-700 bg-sand-200/80 inline-block px-3 py-0.5 rounded-full mt-1">
                        Maximum file size: 10 MB per image
                      </p>
                    </div>
                  </div>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleProductImageFiles(e.target.files)}
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  multiple
                  className="hidden"
                />

                {/* Thumbnail Grid */}
                {productForm.images.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <p className="text-[11px] text-stone-500">
                      First image is used as the <strong>Cover Photo</strong>. Click &ldquo;Make Cover&rdquo; to change.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {productForm.images.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className="relative group rounded-2xl overflow-hidden border border-sand-200 bg-sand-100 aspect-square shadow-xs"
                        >
                          <img src={imgUrl} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />

                          {/* Cover Photo Badge */}
                          {idx === 0 && (
                            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-extrabold shadow-xs">
                              Cover Photo
                            </span>
                          )}

                          {/* Controls Overlay */}
                          <div className="absolute inset-0 bg-stone-950/60 opacity-0 group-hover:opacity-100 transition flex flex-col justify-between p-2">
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() => removeProductImage(idx)}
                                className="p-1 rounded-lg bg-rose-600 text-white hover:bg-rose-700"
                                title="Remove photo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="flex items-center justify-between gap-1">
                              {idx > 0 && (
                                <button
                                  type="button"
                                  onClick={() => moveImageOrder(idx, 'left')}
                                  className="p-1 rounded bg-white/80 text-stone-900 hover:bg-white text-[10px]"
                                  title="Move Left"
                                >
                                  <MoveLeft className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {idx !== 0 && (
                                <button
                                  type="button"
                                  onClick={() => setCoverImage(idx)}
                                  className="text-[10px] font-bold px-2 py-1 rounded bg-white text-stone-900 hover:bg-blue-50 hover:text-blue-600"
                                >
                                  Make Cover
                                </button>
                              )}

                              {idx < productForm.images.length - 1 && (
                                <button
                                  type="button"
                                  onClick={() => moveImageOrder(idx, 'right')}
                                  className="p-1 rounded bg-white/80 text-stone-900 hover:bg-white text-[10px]"
                                  title="Move Right"
                                >
                                  <MoveRight className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION: PRODUCT DETAILS */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-soft-sm space-y-4">
                <h3 className="text-sm font-extrabold text-stone-950">Product Information</h3>

                {/* Product Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">
                    Product Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="e.g. Handwoven Organic Linen Kurta Shirt"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Category & City */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700">
                      Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={productForm.category_id}
                      onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-sand-300 text-xs bg-white focus:outline-none focus:border-blue-500"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700">Studio City</label>
                    <input
                      type="text"
                      disabled
                      value={activeProfile.city}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-sand-200 bg-sand-50 text-xs text-stone-500 cursor-not-allowed"
                    />
                    <p className="text-[10px] text-stone-400">Locked to your verified seller city</p>
                  </div>
                </div>

                {/* Pricing & Stock */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700">
                      Selling Price (₹) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700">Original MRP (₹)</label>
                    <input
                      type="number"
                      min="1"
                      value={productForm.original_price}
                      onChange={(e) => setProductForm({ ...productForm, original_price: Number(e.target.value) })}
                      placeholder="Optional discount display"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700">
                      Stock Count <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">
                    Product Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="Describe craftsmanship, materials, dimensions, and care instructions..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-xs focus:outline-none focus:border-blue-500 leading-relaxed"
                  />
                </div>

                {/* Variants & Delivery */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700">Available Variants</label>
                    <input
                      type="text"
                      value={productForm.variants}
                      onChange={(e) => setProductForm({ ...productForm, variants: e.target.value })}
                      placeholder="e.g. S, M, L or Beige, Olive"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-xs focus:outline-none focus:border-blue-500"
                    />
                    <p className="text-[10px] text-stone-400">Separate options with commas</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700">Delivery Information</label>
                    <input
                      type="text"
                      value={productForm.delivery_info}
                      onChange={(e) => setProductForm({ ...productForm, delivery_info: e.target.value })}
                      placeholder="e.g. Same-day delivery across Hyderabad"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const mockProd: Product = {
                      id: editingProductId || 'preview-prod',
                      seller_id: activeProfile.id,
                      category_id: productForm.category_id,
                      name: productForm.name || 'Your Product Title',
                      description: productForm.description || 'Product description will appear here.',
                      price: productForm.price,
                      original_price: productForm.original_price,
                      stock: productForm.stock,
                      images: productForm.images.length > 0 ? productForm.images : ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c'],
                      city: activeProfile.city,
                      variants: productForm.variants.split(',').map((v) => v.trim()).filter(Boolean),
                      delivery_info: productForm.delivery_info,
                      active: true,
                      created_at: new Date().toISOString(),
                    };
                    setPreviewProduct(mockProd);
                  }}
                  className="w-full sm:w-auto text-xs text-stone-700"
                >
                  <Eye className="w-3.5 h-3.5 mr-1" />
                  <span>Preview Listing</span>
                </Button>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSaveProduct('draft')}
                    disabled={isSubmittingProduct}
                    className="w-full sm:w-auto text-xs text-stone-700"
                  >
                    Save as Draft
                  </Button>

                  <Button
                    type="submit"
                    disabled={isSubmittingProduct}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md"
                  >
                    {isSubmittingProduct ? (
                      <span>Submitting...</span>
                    ) : (
                      <span>Submit for Approval</span>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 4: INVENTORY MANAGEMENT                             */}
        {/* ======================================================== */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-stone-950 font-display">Inventory</h1>
                <p className="text-xs text-stone-500 mt-0.5">
                  Track and adjust live stock levels across your storefront.
                </p>
              </div>

              <div className="w-full sm:w-64 relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  placeholder="Search inventory..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-sand-200 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {filteredInventory.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-sand-200 shadow-soft-sm space-y-3">
                <Layers className="w-10 h-10 text-stone-300 mx-auto" />
                <h3 className="font-extrabold text-sm text-stone-800">Your inventory will appear here.</h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Add products to manage stock counts, set low-stock warnings, and restock pieces.
                </p>
                <div className="pt-2">
                  <Button size="sm" onClick={startAddProduct} className="text-xs">
                    + Add Product
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-sand-200 shadow-soft-sm overflow-hidden divide-y divide-sand-100">
                {filteredInventory.map((item) => (
                  <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.images[0] || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c'}
                        alt={item.name}
                        className="w-12 h-12 rounded-xl object-cover border border-sand-200"
                      />
                      <div>
                        <h4 className="font-bold text-xs text-stone-900">{item.name}</h4>
                        <p className="text-[11px] text-stone-500">₹{item.price} • ID: {item.id}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Availability Tag */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.stock === 0
                            ? 'bg-rose-100 text-rose-800'
                            : item.stock <= 5
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {item.stock === 0 ? 'Out of Stock' : item.stock <= 5 ? 'Low Stock' : 'In Stock'}
                      </span>

                      {/* Stock Adjuster */}
                      <div className="flex items-center border border-sand-300 rounded-xl overflow-hidden bg-sand-50">
                        <button
                          type="button"
                          onClick={() => handleUpdateStockCount(item.id, Math.max(0, item.stock - 1))}
                          className="px-2.5 py-1 text-stone-600 hover:bg-sand-200 text-xs font-bold"
                          title="Reduce stock"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 text-xs font-bold text-stone-950 bg-white min-w-8 text-center">
                          {item.stock}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateStockCount(item.id, item.stock + 1)}
                          className="px-2.5 py-1 text-stone-600 hover:bg-sand-200 text-xs font-bold"
                          title="Increase stock"
                        >
                          +
                        </button>
                      </div>

                      {/* Quick Restock / Mark OOS */}
                      {item.stock > 0 ? (
                        <button
                          type="button"
                          onClick={() => handleUpdateStockCount(item.id, 0)}
                          className="text-[11px] font-bold text-rose-600 hover:underline"
                        >
                          Mark Out of Stock
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleUpdateStockCount(item.id, 10)}
                          className="text-[11px] font-bold text-blue-600 hover:underline"
                        >
                          Restock (+10)
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 5: ORDERS                                           */}
        {/* ======================================================== */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-stone-950 font-display">Orders</h1>
                <p className="text-xs text-stone-500 mt-0.5">
                  Track orders placed by buyers for your store.
                </p>
              </div>

              {/* Order Status Filters */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-xs">
                {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setOrderFilter(tab as any)}
                    className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap text-xs transition capitalize cursor-pointer ${
                      orderFilter === tab
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-stone-600 border border-sand-200 hover:bg-sand-50'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-sand-200 shadow-soft-sm space-y-3">
                <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto" />
                <h3 className="font-extrabold text-sm text-stone-800">No orders yet.</h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Your customer orders will appear here as soon as local buyers checkout.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-white rounded-3xl p-5 border border-sand-200 shadow-soft-sm space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-sand-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-stone-900">Order #{ord.id}</span>
                          <Badge size="sm" variant="brand">
                            {ord.status}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          {new Date(ord.created_at).toLocaleString()} • Buyer: {ord.shipping_address?.name || 'Customer'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-stone-950">₹{ord.total_amount}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedOrder(ord)}
                          className="text-xs text-stone-700"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>

                    {/* Order Items Summary */}
                    <div className="space-y-1.5">
                      {ord.items?.map((item, idx) => (
                        <div key={idx} className="text-xs text-stone-700 flex justify-between">
                          <span>
                            {item.quantity}x {item.product?.name || `Item ${idx + 1}`}
                          </span>
                          <span className="font-bold">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 6: STORE PROFILE                                    */}
        {/* ======================================================== */}
        {activeTab === 'profile' && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-stone-950 font-display">Store Profile</h1>
                <p className="text-xs text-stone-500 mt-0.5">
                  Manage your public storefront identity and customer-facing links.
                </p>
              </div>

              <Link
                to={`/seller/${activeProfile.id}`}
                target="_blank"
                className="px-4 py-2 rounded-full border border-sand-300 text-stone-700 hover:bg-sand-50 font-bold text-xs transition inline-flex items-center gap-1.5"
              >
                <span>View Storefront</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Read-only Verification Badge Card */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="font-extrabold text-emerald-950">Verified Seller</h4>
                  <p className="text-emerald-800 text-[11px]">
                    Your seller account has been verified by Selloi. Government ID documents remain strictly private.
                  </p>
                </div>
              </div>
              <Badge variant="success" size="sm">
                Verified
              </Badge>
            </div>

            <form onSubmit={handleSaveStoreProfile} className="space-y-6">
              {/* Media: Logo & Cover */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-soft-sm space-y-4">
                <h3 className="text-sm font-extrabold text-stone-950">Store Branding</h3>

                {/* Logo Upload */}
                <div className="flex items-center gap-4">
                  <img
                    src={storeLogo || activeProfile.logo}
                    alt={storeName}
                    className="w-16 h-16 rounded-2xl object-cover border border-sand-200 shadow-xs"
                  />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-stone-900">Store Logo</p>
                    <p className="text-[11px] text-stone-500">
                      Upload from device. Maximum 10 MB per image.
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => logoInputRef.current?.click()}
                      className="text-xs text-stone-700 h-7 px-3 mt-1"
                    >
                      <Camera className="w-3 h-3 mr-1" />
                      <span>Change Logo</span>
                    </Button>
                    <input
                      type="file"
                      ref={logoInputRef}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
                          alert('Image is larger than the 10 MB limit. Please select a smaller photo.');
                          return;
                        }
                        const compressed = await compressImage(file);
                        if (compressed) setStoreLogo(compressed);
                      }}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Store Details */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-soft-sm space-y-4">
                <h3 className="text-sm font-extrabold text-stone-950">Public Information</h3>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">Store Name</label>
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700">Category Focus</label>
                    <input
                      type="text"
                      value={storeCategory}
                      onChange={(e) => setStoreCategory(e.target.value)}
                      placeholder="e.g. Art & Prints"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700">City</label>
                    <input
                      type="text"
                      disabled
                      value={storeCity || activeProfile.city}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-sand-200 bg-sand-50 text-xs text-stone-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">Store Bio / Description</label>
                  <textarea
                    rows={3}
                    value={storeDesc}
                    onChange={(e) => setStoreDesc(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-xs focus:outline-none focus:border-blue-500 leading-relaxed"
                  />
                </div>
              </div>

              {/* Public Social Media Links */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-soft-sm space-y-4">
                <h3 className="text-sm font-extrabold text-stone-950">Public Social Links</h3>
                <p className="text-xs text-stone-500">
                  Add verified public profiles so customers can follow your studio.
                </p>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Instagram className="w-4 h-4 text-pink-600 shrink-0" />
                    <input
                      type="text"
                      value={storeSocial}
                      onChange={(e) => setStoreSocial(e.target.value)}
                      placeholder="instagram.com/yourbrand or @yourbrand"
                      className="flex-1 px-3.5 py-2 rounded-xl border border-sand-300 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-600 shrink-0" />
                    <input
                      type="text"
                      value={storeWebsite}
                      onChange={(e) => setStoreWebsite(e.target.value)}
                      placeholder="https://yourbrand.com"
                      className="flex-1 px-3.5 py-2 rounded-xl border border-sand-300 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isSavingProfile}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md"
                >
                  {isSavingProfile ? <span>Saving...</span> : <span>Save Store Profile</span>}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 7: SETTINGS & SECURITY                              */}
        {/* ======================================================== */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <h1 className="text-2xl font-black text-stone-950 font-display">Settings</h1>

            {/* Account Info */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-soft-sm space-y-4">
              <h3 className="text-sm font-extrabold text-stone-950">Account Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-sand-50 border border-sand-200">
                  <span className="text-stone-400 block text-[11px]">Seller Name</span>
                  <span className="font-bold text-stone-900">{user.name || activeProfile.store_name}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-sand-50 border border-sand-200">
                  <span className="text-stone-400 block text-[11px]">Mobile Number</span>
                  <span className="font-bold text-stone-900">{user.phone || 'Configured via OTP'}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-sand-50 border border-sand-200">
                  <span className="text-stone-400 block text-[11px]">Primary Email</span>
                  <span className="font-bold text-stone-900">{user.email || 'seller@selloi.in'}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-sand-50 border border-sand-200">
                  <span className="text-stone-400 block text-[11px]">Role</span>
                  <span className="font-bold text-stone-900 uppercase">{user.role}</span>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-soft-sm space-y-4">
              <h3 className="text-sm font-extrabold text-stone-950">Notification Preferences</h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between text-xs cursor-pointer p-2 rounded-xl hover:bg-sand-50">
                  <div>
                    <span className="font-bold text-stone-900 block">Customer Order Alerts</span>
                    <span className="text-stone-500 text-[11px]">Instant SMS/Notification when a buyer places an order</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationOrders}
                    onChange={(e) => setNotificationOrders(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                </label>

                <label className="flex items-center justify-between text-xs cursor-pointer p-2 rounded-xl hover:bg-sand-50">
                  <div>
                    <span className="font-bold text-stone-900 block">Product Approval Updates</span>
                    <span className="text-stone-500 text-[11px]">Notifications when curation team reviews your pieces</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationApprovals}
                    onChange={(e) => setNotificationApprovals(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                </label>
              </div>
            </div>

            {/* Logout */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Sign out from your seller account?')) {
                    logout();
                    navigate('/');
                  }
                }}
                className="px-6 py-2.5 rounded-full border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs transition inline-flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out from Seller Workspace</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ======================================================== */}
      {/* MOBILE STICKY FLOATING ACTION BUTTON (+ ADD PRODUCT)     */}
      {/* ======================================================== */}
      {activeTab !== 'add-product' && (
        <div className="md:hidden fixed bottom-18 right-4 z-40">
          <button
            onClick={startAddProduct}
            className="w-13 h-13 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg active:scale-95 transition cursor-pointer"
            title="Add Product"
          >
            <Plus className="w-6 h-6 text-yellow-300" />
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* MOBILE BOTTOM NAVIGATION                                 */}
      {/* ======================================================== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-sand-200 px-3 py-1.5 flex items-center justify-around shadow-lg">
        {[
          { id: 'overview' as const, label: 'Overview', icon: <TrendingUp className="w-5 h-5" /> },
          { id: 'products' as const, label: 'Products', icon: <Package className="w-5 h-5" />, count: totalProductsCount },
          { id: 'orders' as const, label: 'Orders', icon: <ShoppingBag className="w-5 h-5" />, count: totalOrdersCount },
          { id: 'profile' as const, label: 'Store', icon: <Store className="w-5 h-5" /> },
        ].map((nav) => {
          const isActive = activeTab === nav.id;
          return (
            <button
              key={nav.id}
              onClick={() => setActiveTab(nav.id)}
              className={`flex flex-col items-center py-1 px-3 text-[11px] font-semibold transition relative ${
                isActive ? 'text-blue-600' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <div className="relative">
                {nav.icon}
                {nav.count !== undefined && nav.count > 0 && (
                  <span className="w-2 h-2 rounded-full bg-blue-600 absolute -top-0.5 -right-0.5" />
                )}
              </div>
              <span className="text-[10px] mt-0.5">{nav.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ======================================================== */}
      {/* ORDER DETAIL MODAL                                       */}
      {/* ======================================================== */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-sand-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-sand-100">
              <div>
                <h3 className="text-base font-extrabold text-stone-950">
                  Order Details #{selectedOrder.id}
                </h3>
                <p className="text-[11px] text-stone-500">
                  {new Date(selectedOrder.created_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg text-stone-400 hover:bg-sand-100 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status Update Dropdown */}
            <div className="p-3.5 rounded-2xl bg-sand-50 border border-sand-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-stone-500 font-bold block">Current Status</span>
                <Badge size="sm" variant="brand">
                  {selectedOrder.status}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-500">Update:</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, e.target.value as OrderStatus)}
                  className="px-2.5 py-1.5 rounded-xl border border-sand-300 text-xs bg-white font-bold"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="space-y-1 text-xs">
              <span className="font-extrabold text-stone-900 block">Delivery Address</span>
              <p className="text-stone-600 leading-relaxed bg-sand-50 p-3 rounded-xl border border-sand-200">
                <strong>{selectedOrder.shipping_address?.name}</strong>
                <br />
                {selectedOrder.shipping_address?.address_line}
                <br />
                {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state} - {selectedOrder.shipping_address?.pincode}
                <br />
                Phone: {selectedOrder.shipping_address?.phone}
              </p>
            </div>

            {/* Items */}
            <div className="space-y-2 text-xs">
              <span className="font-extrabold text-stone-900 block">Items</span>
              <div className="divide-y divide-sand-100 border border-sand-200 rounded-2xl p-3">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="py-2 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-stone-900">{item.product?.name || `Item ${idx + 1}`}</p>
                      <p className="text-[11px] text-stone-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-black text-stone-950">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button size="sm" onClick={() => setSelectedOrder(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* PRODUCT PREVIEW MODAL                                    */}
      {/* ======================================================== */}
      {previewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-sand-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-sand-100">
              <span className="text-xs font-extrabold text-stone-500 uppercase tracking-wider">Marketplace Listing Preview</span>
              <button
                onClick={() => setPreviewProduct(null)}
                className="p-1 rounded-lg text-stone-400 hover:bg-sand-100 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden aspect-square border border-sand-200">
              <img
                src={previewProduct.images[0] || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c'}
                alt={previewProduct.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-stone-500">
                <span>{activeProfile.store_name}</span>
                <VerifiedBadge size="sm" showText={false} />
                <span>•</span>
                <span>{previewProduct.city}</span>
              </div>
              <h3 className="text-lg font-black text-stone-950 font-display">{previewProduct.name}</h3>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xl font-black text-stone-950 font-display">₹{previewProduct.price}</span>
                {previewProduct.original_price && previewProduct.original_price > previewProduct.price && (
                  <span className="text-xs text-stone-400 line-through">₹{previewProduct.original_price}</span>
                )}
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed border-t border-sand-100 pt-3">
              {previewProduct.description}
            </p>

            {previewProduct.variants && previewProduct.variants.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-stone-700 block">Variants:</span>
                <div className="flex gap-1.5 flex-wrap">
                  {previewProduct.variants.map((v, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg border border-sand-300 text-xs font-bold text-stone-800 bg-sand-50">
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2">
              <Button size="md" className="w-full bg-blue-600 text-white font-bold" onClick={() => setPreviewProduct(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* HELP & FAQS MODAL                                        */}
      {/* ======================================================== */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-sand-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-sand-100">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-extrabold text-stone-950">Seller Studio Help &amp; FAQs</h3>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:bg-sand-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-stone-700 leading-relaxed">
              <div className="space-y-1">
                <h4 className="font-extrabold text-stone-900">How does product moderation work?</h4>
                <p className="text-stone-600">
                  Every product submitted goes through Selloi curation to ensure genuine craftsmanship, clear photos, and accurate descriptions. Reviews usually complete within 12–24 hours.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-extrabold text-stone-900">What are the photo requirements?</h4>
                <p className="text-stone-600">
                  Upload 1–8 clear photos directly from your phone camera or gallery. Each individual photo must be <strong>10 MB or smaller</strong>. The first photo is your listing&apos;s Cover Photo.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-extrabold text-stone-900">How does delivery work?</h4>
                <p className="text-stone-600">
                  Sellers manage local delivery directly or via private courier/same-day local services. As order volume increases, mark the order as &ldquo;Shipped&rdquo; with tracking details.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button size="sm" onClick={() => setShowHelpModal(false)}>
                Got it
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* NOTIFICATIONS MODAL                                      */}
      {/* ======================================================== */}
      {showNotificationsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-sand-200">
            <div className="flex items-center justify-between pb-3 border-b border-sand-100">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-extrabold text-stone-950">Store Notifications</h3>
              </div>
              <button
                onClick={() => setShowNotificationsModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:bg-sand-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="font-bold text-emerald-900 block">Seller Verified</span>
                <span className="text-emerald-700 text-[11px]">Your seller account {activeProfile.store_name} has been verified by Selloi curation team.</span>
              </div>

              {rejectedProductsCount > 0 && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200">
                  <span className="font-bold text-rose-900 block">Action Needed: Product Changes</span>
                  <span className="text-rose-700 text-[11px]">{rejectedProductsCount} piece(s) require revisions before publishing.</span>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <Button size="sm" onClick={() => setShowNotificationsModal(false)}>
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
