import { Product, SellerProfile, Category, Order, Report, SellerApplication, Review, City } from '../types';
import { INITIAL_CATEGORIES } from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Local storage keys for offline/fallback caching
const STORAGE_PRODUCTS = 'selluy_products_v2';
const STORAGE_SELLERS = 'selluy_sellers_v2';
const STORAGE_CATEGORIES = 'selluy_categories_v2';
const STORAGE_APPLICATIONS = 'selluy_applications_v2';
const STORAGE_ORDERS = 'selluy_orders_v2';
const STORAGE_REVIEWS = 'selluy_reviews_v2';
const STORAGE_REPORTS = 'selluy_reports_v2';

export interface ProductFilters {
  categorySlug?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  sellerId?: string;
  inStockOnly?: boolean;
  sortBy?: 'relevance' | 'newest' | 'price_asc' | 'price_desc' | 'rating';
}

class MarketplaceService {
  private products: Product[] = [];
  private sellers: SellerProfile[] = [];
  private categories: Category[] = INITIAL_CATEGORIES;
  private applications: SellerApplication[] = [];
  private orders: Order[] = [];
  private reviews: Review[] = [];
  private reports: Report[] = [];
  private isLoaded = false;
  private listeners: (() => void)[] = [];

  constructor() {
    this.initLocal();
    if (isSupabaseConfigured()) {
      this.syncFromSupabase();
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  private initLocal() {
    try {
      const savedProds = localStorage.getItem(STORAGE_PRODUCTS);
      if (savedProds) this.products = JSON.parse(savedProds);

      const savedSellers = localStorage.getItem(STORAGE_SELLERS);
      if (savedSellers) this.sellers = JSON.parse(savedSellers);

      const savedCats = localStorage.getItem(STORAGE_CATEGORIES);
      if (savedCats) {
        const parsed: Category[] = JSON.parse(savedCats);
        this.categories = INITIAL_CATEGORIES.map((cat) => {
          const match = parsed.find((p) => p.id === cat.id);
          return match ? { ...match, image: cat.image } : cat;
        });
      } else {
        this.categories = INITIAL_CATEGORIES;
      }

      const savedApps = localStorage.getItem(STORAGE_APPLICATIONS);
      if (savedApps) this.applications = JSON.parse(savedApps);

      const savedOrders = localStorage.getItem(STORAGE_ORDERS);
      if (savedOrders) this.orders = JSON.parse(savedOrders);

      const savedReviews = localStorage.getItem(STORAGE_REVIEWS);
      if (savedReviews) this.reviews = JSON.parse(savedReviews);

      const savedReports = localStorage.getItem(STORAGE_REPORTS);
      if (savedReports) this.reports = JSON.parse(savedReports);
    } catch (e) {
      console.warn('Local storage cache load warning:', e);
    }
  }

  // Sync with cloud Supabase tables
  public async syncFromSupabase(): Promise<void> {
    try {
      const [catRes, sellerRes, prodRes, appRes] = await Promise.all([
        supabase.from('categories').select('*').eq('active', true),
        supabase.from('seller_profiles').select('*'),
        supabase.from('products').select('*').neq('status', 'deleted'),
        supabase.from('seller_applications').select('*').order('created_at', { ascending: false }),
      ]);

      if (catRes.data && catRes.data.length > 0) {
        this.categories = catRes.data as Category[];
        localStorage.setItem(STORAGE_CATEGORIES, JSON.stringify(this.categories));
      }

      if (sellerRes.data && sellerRes.data.length > 0) {
        this.sellers = sellerRes.data as SellerProfile[];
        localStorage.setItem(STORAGE_SELLERS, JSON.stringify(this.sellers));
      }

      if (prodRes.data && prodRes.data.length > 0) {
        this.products = prodRes.data as Product[];
        localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(this.products));
      }

      if (appRes.data && appRes.data.length > 0) {
        this.applications = appRes.data as SellerApplication[];
        localStorage.setItem(STORAGE_APPLICATIONS, JSON.stringify(this.applications));
      }

      this.isLoaded = true;
      this.notify();
    } catch (err) {
      console.warn('Supabase sync notice:', err);
    }
  }

  // --- CATEGORIES ---
  public getCategories(): Category[] {
    return this.categories.filter((c) => c.active !== false);
  }

  public getCategoryBySlug(slug: string): Category | undefined {
    return this.categories.find((c) => c.slug === slug);
  }

  // --- SELLERS ---
  public getSellers(): SellerProfile[] {
    return this.sellers;
  }

  public getVerifiedSellers(): SellerProfile[] {
    return this.sellers.filter(
      (s) => s.verification_status === 'approved' || (s.verification_status as string) === 'verified'
    );
  }

  public getSellersByCity(city: string): SellerProfile[] {
    if (!city || city === 'All Cities') {
      return this.getVerifiedSellers();
    }
    return this.getVerifiedSellers().filter(
      (s) => s.city && s.city.toLowerCase() === city.toLowerCase()
    );
  }

  public getSellerById(id: string): SellerProfile | undefined {
    return this.sellers.find((s) => s.id === id);
  }

  public getSellerByUserId(userId: string): SellerProfile | undefined {
    return this.sellers.find((s) => s.user_id === userId);
  }

  // --- PRODUCTS (LOCAL-FIRST RANKING & ZERO-FAKE-DATA) ---
  public getAllRawProducts(): Product[] {
    return this.products.map((p) => ({
      ...p,
      seller: this.sellers.find((s) => s.id === p.seller_id),
      category: this.categories.find((c) => c.id === p.category_id),
    }));
  }

  /**
   * Public Customer Marketplace Query
   * Strict Rule: Only approved products from verified sellers appear.
   * Priority: Products from userCity ranked first.
   */
  public getPublicProducts(userCity?: string): Product[] {
    const verifiedSellerIds = new Set(
      this.getVerifiedSellers().map((s) => s.id)
    );

    // Filter strictly to approved products from verified sellers
    const approvedProducts = this.getAllRawProducts().filter((p) => {
      const isSellerVerified = verifiedSellerIds.has(p.seller_id);
      const isProductApproved = p.status === 'approved' || !p.status; // default approved for seed products
      const isNotDeleted = p.status !== 'deleted' && p.status !== 'rejected';
      return isSellerVerified && isProductApproved && isNotDeleted && p.active !== false;
    });

    if (!userCity || userCity === 'All Cities') {
      return approvedProducts;
    }

    // Local-First Ranking Algorithm
    const normalizedCity = userCity.toLowerCase();
    return [...approvedProducts].sort((a, b) => {
      const aIsLocal = a.city?.toLowerCase() === normalizedCity ? 1 : 0;
      const bIsLocal = b.city?.toLowerCase() === normalizedCity ? 1 : 0;

      // 1. Same city gets highest priority
      if (aIsLocal !== bIsLocal) {
        return bIsLocal - aIsLocal;
      }

      // 2. In-stock products prioritized over out of stock
      const aInStock = (a.stock || 0) > 0 ? 1 : 0;
      const bInStock = (b.stock || 0) > 0 ? 1 : 0;
      if (aInStock !== bInStock) {
        return bInStock - aInStock;
      }

      // 3. Freshness (newest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }

  public getProductsByCity(city: string): Product[] {
    const publicProducts = this.getPublicProducts();
    if (!city || city === 'All Cities') return publicProducts;
    return publicProducts.filter(
      (p) => p.city && p.city.toLowerCase() === city.toLowerCase()
    );
  }

  public getProductById(id: string): Product | undefined {
    return this.getAllRawProducts().find((p) => p.id === id);
  }

  public getProductsBySeller(sellerId: string): Product[] {
    return this.getAllRawProducts().filter((p) => p.seller_id === sellerId && p.status !== 'deleted');
  }

  // --- SEARCH & FILTER ---
  public searchMarketplace(
    query: string,
    filters?: ProductFilters
  ): { products: Product[]; sellers: SellerProfile[] } {
    const q = query.trim().toLowerCase();
    let prods = this.getPublicProducts(filters?.city);

    if (q) {
      prods = prods.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category?.name.toLowerCase().includes(q) ||
          p.seller?.store_name.toLowerCase().includes(q)
      );
    }

    if (filters?.categorySlug) {
      prods = prods.filter((p) => p.category?.slug === filters.categorySlug);
    }

    if (filters?.city && filters.city !== 'All Cities') {
      prods = prods.filter((p) => p.city?.toLowerCase() === filters.city!.toLowerCase());
    }

    if (filters?.minPrice !== undefined) {
      prods = prods.filter((p) => p.price >= filters.minPrice!);
    }

    if (filters?.maxPrice !== undefined) {
      prods = prods.filter((p) => p.price <= filters.maxPrice!);
    }

    if (filters?.inStockOnly) {
      prods = prods.filter((p) => (p.stock || 0) > 0);
    }

    // Sorting
    if (filters?.sortBy === 'price_asc') {
      prods.sort((a, b) => a.price - b.price);
    } else if (filters?.sortBy === 'price_desc') {
      prods.sort((a, b) => b.price - a.price);
    } else if (filters?.sortBy === 'newest') {
      prods.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    // Sellers search
    let sellers = this.getVerifiedSellers();
    if (q) {
      sellers = sellers.filter(
        (s) =>
          s.store_name.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q) ||
          s.city?.toLowerCase().includes(q)
      );
    }
    if (filters?.city && filters.city !== 'All Cities') {
      sellers = sellers.filter((s) => s.city?.toLowerCase() === filters.city!.toLowerCase());
    }

    return { products: prods, sellers };
  }

  // --- SELLER APPLICATIONS ---
  public getApplications(): SellerApplication[] {
    return this.applications;
  }

  public async submitSellerApplication(
    data: Omit<SellerApplication, 'id' | 'created_at' | 'status'>
  ): Promise<SellerApplication> {
    const newApp: SellerApplication = {
      ...data,
      id: 'app-' + Date.now(),
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    this.applications.unshift(newApp);
    localStorage.setItem(STORAGE_APPLICATIONS, JSON.stringify(this.applications));

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('seller_applications').insert([newApp]);
      } catch (err) {
        console.warn('Supabase seller application insert:', err);
      }
    }

    this.notify();
    return newApp;
  }

  // --- SELLER PRODUCT CREATION (PENDING APPROVAL) ---
  public async createProduct(
    data: Omit<Product, 'id' | 'created_at' | 'status'>
  ): Promise<Product> {
    const newProduct: Product = {
      ...data,
      id: 'prod-' + Date.now(),
      status: 'pending_approval', // Moderation required
      created_at: new Date().toISOString(),
    };

    this.products.unshift(newProduct);
    localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(this.products));

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('products').insert([newProduct]);
      } catch (err) {
        console.warn('Supabase product insert:', err);
      }
    }

    this.notify();
    return newProduct;
  }

  public async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    this.products = this.products.map((p) => (p.id === id ? { ...p, ...updates } : p));
    localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(this.products));

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('products').update(updates).eq('id', id);
      } catch (err) {
        console.warn('Supabase product update:', err);
      }
    }
    this.notify();
  }

  // --- ADMIN MODERATION ACTIONS ---
  public async adminApproveSeller(applicationId: string): Promise<SellerProfile> {
    const app = this.applications.find((a) => a.id === applicationId);
    if (!app) throw new Error('Application not found');

    app.status = 'approved';
    app.updated_at = new Date().toISOString();

    // Create or update verified seller profile
    const existingSeller = this.sellers.find((s) => s.user_id === app.user_id);
    let sellerProfile: SellerProfile;

    if (existingSeller) {
      existingSeller.verification_status = 'approved';
      sellerProfile = existingSeller;
    } else {
      sellerProfile = {
        id: 'seller-' + Date.now(),
        user_id: app.user_id,
        store_name: app.store_name,
        description: app.description,
        logo: app.documents?.craft_samples?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        city: app.city,
        category_focus: app.category,
        seller_type: app.seller_type,
        verification_status: 'approved',
        rating: 5.0,
        total_reviews: 0,
        completed_orders: 0,
        created_at: new Date().toISOString(),
      };
      this.sellers.unshift(sellerProfile);
    }

    localStorage.setItem(STORAGE_APPLICATIONS, JSON.stringify(this.applications));
    localStorage.setItem(STORAGE_SELLERS, JSON.stringify(this.sellers));

    if (isSupabaseConfigured()) {
      try {
        await Promise.all([
          supabase.from('seller_applications').update({ status: 'approved' }).eq('id', applicationId),
          supabase.from('seller_profiles').upsert([sellerProfile]),
          supabase.from('users').update({ role: 'seller' }).eq('id', app.user_id),
        ]);
      } catch (err) {
        console.warn('Supabase admin approve seller error:', err);
      }
    }

    this.notify();
    return sellerProfile;
  }

  public async adminRejectSeller(applicationId: string, reason: string): Promise<void> {
    const app = this.applications.find((a) => a.id === applicationId);
    if (app) {
      app.status = 'rejected';
      app.rejection_reason = reason;
      app.updated_at = new Date().toISOString();
      localStorage.setItem(STORAGE_APPLICATIONS, JSON.stringify(this.applications));

      if (isSupabaseConfigured()) {
        try {
          await supabase.from('seller_applications').update({
            status: 'rejected',
            rejection_reason: reason,
          }).eq('id', applicationId);
        } catch (err) {
          console.warn('Supabase admin reject seller error:', err);
        }
      }
      this.notify();
    }
  }

  public async adminApproveProduct(productId: string): Promise<void> {
    await this.updateProduct(productId, { status: 'approved', active: true });
  }

  public async adminRejectProduct(productId: string, reason: string): Promise<void> {
    await this.updateProduct(productId, { status: 'rejected', rejection_reason: reason, active: false });
  }

  public async adminDeleteProduct(productId: string): Promise<void> {
    await this.updateProduct(productId, { status: 'deleted', active: false });
  }

  // --- ORDERS ---
  public getOrders(): Order[] {
    return this.orders;
  }

  public getOrdersByBuyer(buyerId: string): Order[] {
    return this.orders.filter((o) => o.buyer_id === buyerId);
  }

  public getOrdersBySeller(sellerId: string): Order[] {
    return this.orders.filter((o) => o.items.some((item) => item.seller_id === sellerId));
  }

  public async createOrder(orderData: Omit<Order, 'id' | 'created_at'>): Promise<Order> {
    const newOrder: Order = {
      ...orderData,
      id: 'ord-' + Date.now(),
      created_at: new Date().toISOString(),
    };

    this.orders.unshift(newOrder);
    localStorage.setItem(STORAGE_ORDERS, JSON.stringify(this.orders));

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('orders').insert([newOrder]);
      } catch (err) {
        console.warn('Supabase order insert:', err);
      }
    }

    this.notify();
    return newOrder;
  }

  public async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    const order = this.orders.find((o) => o.id === orderId);
    if (order) {
      order.status = status;
      localStorage.setItem(STORAGE_ORDERS, JSON.stringify(this.orders));

      if (isSupabaseConfigured()) {
        try {
          await supabase.from('orders').update({ status }).eq('id', orderId);
        } catch (err) {
          console.warn('Supabase order status update:', err);
        }
      }
      this.notify();
    }
  }

  // --- REVIEWS (VERIFIED PURCHASE ONLY) ---
  public getReviewsByProduct(productId: string): Review[] {
    return this.reviews.filter((r) => r.product_id === productId);
  }

  public getReviewsBySeller(sellerId: string): Review[] {
    return this.reviews.filter((r) => r.seller_id === sellerId);
  }

  public hasUserPurchasedProduct(userId: string, productId: string): boolean {
    if (!userId || !productId) return false;
    return this.orders.some(
      (order) =>
        order.buyer_id === userId &&
        order.items.some((item) => item.product_id === productId)
    );
  }

  public async addReview(
    reviewData: Omit<Review, 'id' | 'created_at'>
  ): Promise<Review> {
    const newReview: Review = {
      ...reviewData,
      id: 'rev-' + Date.now(),
      created_at: new Date().toISOString(),
    };

    this.reviews.unshift(newReview);
    localStorage.setItem(STORAGE_REVIEWS, JSON.stringify(this.reviews));

    // Update seller rating
    const sellerReviews = this.reviews.filter((r) => r.seller_id === reviewData.seller_id);
    const avgRating =
      sellerReviews.reduce((sum, r) => sum + r.rating, 0) / sellerReviews.length;
    const seller = this.sellers.find((s) => s.id === reviewData.seller_id);
    if (seller) {
      seller.rating = Math.round(avgRating * 10) / 10;
      seller.total_reviews = sellerReviews.length;
      localStorage.setItem(STORAGE_SELLERS, JSON.stringify(this.sellers));
    }

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('reviews').insert([newReview]);
      } catch (err) {
        console.warn('Supabase review insert:', err);
      }
    }

    this.notify();
    return newReview;
  }
}

export const marketplaceService = new MarketplaceService();
export default marketplaceService;
