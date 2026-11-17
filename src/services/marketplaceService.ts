import { Product, ProductStatus, SellerProfile, Category, Order, Report, SellerApplication, Review, City } from '../types';
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
  public isApplicationsTableMissing = false;
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

  private safeSaveApplications() {
    try {
      localStorage.setItem(STORAGE_APPLICATIONS, JSON.stringify(this.applications));
    } catch (quotaErr) {
      console.warn('localStorage quota reached for full applications; caching lightweight copy without large base64 strings:', quotaErr);
      try {
        // Strip large data URLs so metadata, status, store name, phone, etc. still persist offline in localStorage
        const lightweight = this.applications.map((app) => ({
          ...app,
          product_samples: (app.product_samples || []).map((s) => (s && s.length > 500 ? '[cloud_image]' : s)),
          government_id_front:
            app.government_id_front && app.government_id_front.length > 500
              ? '[cloud_doc]'
              : app.government_id_front,
          government_id_back:
            app.government_id_back && app.government_id_back.length > 500
              ? '[cloud_doc]'
              : app.government_id_back,
        }));
        localStorage.setItem(STORAGE_APPLICATIONS, JSON.stringify(lightweight));
      } catch (e) {
        console.warn('Could not save lightweight applications to localStorage:', e);
      }
    }
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
      if (savedApps) {
        try {
          this.applications = JSON.parse(savedApps);
        } catch (e) {
          this.applications = [];
        }
      }

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

      if (appRes.error) {
        if (appRes.error.code === 'PGRST205' || appRes.error.message?.includes('not find the table')) {
          this.isApplicationsTableMissing = true;
          console.warn('Supabase notice: seller_applications table does not exist in schema cache.');
        } else {
          console.warn('Supabase seller_applications sync error:', appRes.error);
        }
      } else if (appRes.data) {
        this.isApplicationsTableMissing = false;
        const cloudApps = appRes.data as SellerApplication[];

        // Check if there are locally stored applications that were submitted while Supabase was not connected
        const unsyncedApps = this.applications.filter(
          (localApp) => !cloudApps.some((c) => c.id === localApp.id)
        );

        if (unsyncedApps.length > 0) {
          for (const pendingApp of unsyncedApps) {
            try {
              await supabase.from('seller_applications').upsert([pendingApp]);
              cloudApps.unshift(pendingApp);
            } catch (syncErr) {
              console.warn('Auto-sync local application to cloud warning:', syncErr);
            }
          }
        }

        this.applications = cloudApps;
        this.safeSaveApplications();
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

  public getSellerByUserId(userId: string, phone?: string): SellerProfile | undefined {
    const directMatch = this.sellers.find((s) => s.user_id === userId);
    if (directMatch) return directMatch;

    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '').slice(-10);
      const app = this.applications.find(
        (a) => a.phone && a.phone.replace(/\D/g, '').slice(-10) === cleanPhone && (a.status === 'approved' || (a.status as string) === 'verified')
      );
      if (app) {
        const matched = this.sellers.find(
          (s) => s.user_id === app.user_id || (s.store_name && app.store_name && s.store_name.toLowerCase().trim() === app.store_name.toLowerCase().trim())
        );
        if (matched) return matched;
      }
    }
    return undefined;
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

  public getPublicProductsBySeller(sellerId: string): Product[] {
    return this.getAllRawProducts().filter(
      (p) => p.seller_id === sellerId && (p.status === 'approved' || !p.status) && p.active !== false
    );
  }

  // --- SELLER PRODUCT CREATION & MANAGEMENT (MODERATION ENFORCED) ---
  public async createProduct(
    data: Omit<Product, 'id' | 'created_at' | 'status'> & { status?: ProductStatus }
  ): Promise<Product> {
    const newProduct: Product = {
      ...data,
      id: 'prod-' + Date.now(),
      status: data.status || 'pending_approval', // Moderation required by default
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      active: data.status === 'approved' ? Boolean(data.active) : false,
    };

    this.products.unshift(newProduct);
    localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(this.products));

    if (isSupabaseConfigured()) {
      try {
        const { status, rejection_reason, variants, delivery_info, seller, category, ...dbPayload } = newProduct as any;
        await supabase.from('products').insert([dbPayload]);
      } catch (err) {
        console.warn('Supabase product insert:', err);
      }
    }

    this.notify();
    return newProduct;
  }

  public async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const index = this.products.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Product not found');

    const updatedProduct = {
      ...this.products[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.products[index] = updatedProduct;
    localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(this.products));

    if (isSupabaseConfigured()) {
      try {
        const { status, rejection_reason, variants, delivery_info, seller, category, ...dbUpdates } = updates as any;
        if (Object.keys(dbUpdates).length > 0) {
          await supabase.from('products').update(dbUpdates).eq('id', id);
        }
      } catch (err) {
        console.warn('Supabase product update:', err);
      }
    }
    this.notify();
    return updatedProduct;
  }

  // Stock inventory update
  public async sellerUpdateStock(id: string, sellerId: string, newStock: number): Promise<Product> {
    const product = this.products.find((p) => p.id === id);
    if (!product) throw new Error('Product not found');
    if (product.seller_id !== sellerId) {
      throw new Error('Unauthorized: You can only adjust inventory for your own products.');
    }

    const safeStock = Math.max(0, Math.floor(newStock));
    const nextStatus: ProductStatus = safeStock === 0 ? 'out_of_stock' : (product.status === 'out_of_stock' ? 'approved' : (product.status || 'approved'));
    const nextActive = nextStatus === 'approved';

    return this.updateProduct(id, {
      stock: safeStock,
      status: nextStatus,
      active: nextActive,
    });
  }

  // Authorized seller product update
  public async sellerUpdateProduct(
    id: string,
    sellerId: string,
    updates: Partial<Product>
  ): Promise<Product> {
    const product = this.products.find((p) => p.id === id);
    if (!product) throw new Error('Product not found');
    if (product.seller_id !== sellerId) {
      throw new Error('Unauthorized: You can only edit your own products.');
    }

    // Significant edits (title, price, photos, description) require re-moderation
    const requiresModeration =
      (updates.name && updates.name !== product.name) ||
      (updates.price && updates.price !== product.price) ||
      (updates.images && JSON.stringify(updates.images) !== JSON.stringify(product.images)) ||
      (updates.description && updates.description !== product.description);

    const targetStatus: ProductStatus = requiresModeration
      ? 'pending_approval'
      : updates.status || product.status || 'approved';

    const targetActive = targetStatus === 'approved' ? (updates.active ?? product.active) : false;

    return this.updateProduct(id, {
      ...updates,
      status: targetStatus,
      active: targetActive,
      rejection_reason: requiresModeration ? undefined : product.rejection_reason,
    });
  }

  // Seller pause / unpause product
  public async sellerPauseProduct(id: string, sellerId: string): Promise<Product> {
    const product = this.products.find((p) => p.id === id);
    if (!product) throw new Error('Product not found');
    if (product.seller_id !== sellerId) {
      throw new Error('Unauthorized: You can only pause your own products.');
    }

    const nextStatus: ProductStatus = product.status === 'paused' ? 'approved' : 'paused';
    const nextActive = nextStatus === 'approved';

    return this.updateProduct(id, {
      status: nextStatus,
      active: nextActive,
    });
  }

  // Seller delete product (soft-delete preserves order history)
  public async sellerDeleteProduct(id: string, sellerId: string): Promise<void> {
    const product = this.products.find((p) => p.id === id);
    if (!product) throw new Error('Product not found');
    if (product.seller_id !== sellerId) {
      throw new Error('Unauthorized: You can only delete your own products.');
    }

    await this.updateProduct(id, {
      status: 'deleted',
      active: false,
    });
  }

  // Update seller profile details
  public async updateSellerProfile(
    sellerId: string,
    updates: Partial<SellerProfile>
  ): Promise<SellerProfile> {
    const index = this.sellers.findIndex((s) => s.id === sellerId);
    if (index === -1) throw new Error('Seller profile not found');

    const updatedProfile = {
      ...this.sellers[index],
      ...updates,
    };
    this.sellers[index] = updatedProfile;
    localStorage.setItem(STORAGE_SELLERS, JSON.stringify(this.sellers));

    if (isSupabaseConfigured()) {
      try {
        const { seller_type, ...dbUpdates } = updates as any;
        if (Object.keys(dbUpdates).length > 0) {
          await supabase.from('seller_profiles').update(dbUpdates).eq('id', sellerId);
        }
      } catch (err) {
        console.warn('Supabase seller profile update:', err);
      }
    }
    this.notify();
    return updatedProfile;
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

  public getApplicationByUserId(userId: string, phone?: string): SellerApplication | undefined {
    const cleanUserPhone = phone ? phone.replace(/\D/g, '').slice(-10) : '';
    const cleanUserIdPhone = userId ? userId.replace(/\D/g, '').slice(-10) : '';

    return this.applications.find((a) => {
      if (a.user_id === userId) return true;
      if (cleanUserPhone && a.phone && a.phone.replace(/\D/g, '').slice(-10) === cleanUserPhone) return true;
      if (cleanUserIdPhone && a.phone && a.phone.replace(/\D/g, '').slice(-10) === cleanUserIdPhone) return true;
      return false;
    });
  }

  public async submitSellerApplication(
    data: Omit<SellerApplication, 'id' | 'created_at' | 'status'> & { status?: SellerApplication['status'] }
  ): Promise<SellerApplication> {
    const cleanPhone = data.phone ? data.phone.replace(/\D/g, '').slice(-10) : '';
    const existingIndex = this.applications.findIndex((a) => {
      if (a.user_id === data.user_id) return true;
      if (cleanPhone && a.phone && a.phone.replace(/\D/g, '').slice(-10) === cleanPhone) return true;
      return false;
    });
    let app: SellerApplication;

    const targetStatus = data.status || 'under_review';

    if (existingIndex >= 0) {
      // Update existing application
      app = {
        ...this.applications[existingIndex],
        ...data,
        status: targetStatus,
        rejection_reason: undefined, // Clear any previous rejection
        updated_at: new Date().toISOString(),
      };
      this.applications[existingIndex] = app;
    } else {
      // Create new application
      app = {
        ...data,
        id: 'app-' + Date.now(),
        status: targetStatus,
        created_at: new Date().toISOString(),
      };
      this.applications.unshift(app);
    }

    this.safeSaveApplications();

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('seller_applications').upsert([app]);
        if (error) {
          console.warn('Supabase seller application upsert error:', error);
          if (error.code === 'PGRST205' || error.message?.includes('not find the table')) {
            this.isApplicationsTableMissing = true;
          }
        } else {
          this.isApplicationsTableMissing = false;
        }
      } catch (err) {
        console.warn('Supabase seller application upsert:', err);
      }
    }

    this.notify();
    return app;
  }


  public async updateSellerApplication(
    id: string,
    updates: Partial<SellerApplication>
  ): Promise<SellerApplication> {
    const index = this.applications.findIndex((a) => a.id === id);
    if (index === -1) throw new Error('Application not found');

    const updatedApp = {
      ...this.applications[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.applications[index] = updatedApp;
    this.safeSaveApplications();

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('seller_applications').update(updates).eq('id', id);
      } catch (err) {
        console.warn('Supabase seller application update:', err);
      }
    }

    this.notify();
    return updatedApp;
  }

  // --- ADMIN MODERATION ACTIONS ---
  public async adminApproveSeller(applicationId: string, internalNotes?: string): Promise<SellerProfile> {
    const app = this.applications.find((a) => a.id === applicationId);
    if (!app) throw new Error('Application not found');

    app.status = 'approved';
    if (internalNotes !== undefined) app.internal_notes = internalNotes;
    app.updated_at = new Date().toISOString();

    // Create or update verified seller profile
    const existingSeller = this.sellers.find(
      (s) => s.user_id === app.user_id ||
             (s.store_name && app.store_name && s.store_name.toLowerCase().trim() === app.store_name.toLowerCase().trim())
    );
    let sellerProfile: SellerProfile;

    const sampleCover = app.product_samples?.[0] || app.documents?.craft_samples?.[0];

    if (existingSeller) {
      existingSeller.verification_status = 'approved';
      if (sampleCover && !existingSeller.logo) existingSeller.logo = sampleCover;
      sellerProfile = existingSeller;
    } else {
      sellerProfile = {
        id: 'seller-' + Date.now(),
        user_id: app.user_id,
        store_name: app.store_name,
        description: app.description,
        logo: sampleCover || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
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

    this.safeSaveApplications();
    localStorage.setItem(STORAGE_SELLERS, JSON.stringify(this.sellers));

    if (isSupabaseConfigured()) {
      try {
        // Ensure user exists in users table to satisfy foreign key constraint on seller_profiles.user_id
        const cleanPhone = app.phone ? app.phone.replace(/\D/g, '').slice(-10) : '';
        const { data: userRow } = await supabase.from('users').select('id').eq('id', app.user_id).maybeSingle();
        if (!userRow) {
          await supabase.from('users').upsert([{
            id: app.user_id,
            name: app.full_name,
            email: app.email || (cleanPhone ? `${cleanPhone}@selloi.user` : 'seller@selloi.user'),
            phone: app.phone || (cleanPhone ? `+91${cleanPhone}` : null),
            role: 'seller',
            city: app.city,
          }]);
        } else {
          await supabase.from('users').update({ role: 'seller' }).eq('id', app.user_id);
        }

        // Omit non-existent column (seller_type) from db payload
        const { seller_type, ...dbProfile } = sellerProfile as any;

        await Promise.all([
          supabase.from('seller_applications').update({
            status: 'approved',
            internal_notes: app.internal_notes,
          }).eq('id', applicationId),
          supabase.from('seller_profiles').upsert([dbProfile]),
        ]);
      } catch (err) {
        console.warn('Supabase admin approve seller error:', err);
      }
    }

    this.notify();
    return sellerProfile;
  }

  public async adminRejectSeller(applicationId: string, reason: string, internalNotes?: string): Promise<void> {
    const app = this.applications.find((a) => a.id === applicationId);
    if (app) {
      app.status = 'rejected';
      app.rejection_reason = reason;
      if (internalNotes !== undefined) app.internal_notes = internalNotes;
      app.updated_at = new Date().toISOString();
      this.safeSaveApplications();

      if (isSupabaseConfigured()) {
        try {
          await supabase.from('seller_applications').update({
            status: 'rejected',
            rejection_reason: reason,
            internal_notes: app.internal_notes,
          }).eq('id', applicationId);
        } catch (err) {
          console.warn('Supabase admin reject seller error:', err);
        }
      }
      this.notify();
    }
  }

  public async adminDeleteApplication(applicationId: string): Promise<void> {
    this.applications = this.applications.filter((a) => a.id !== applicationId);
    this.safeSaveApplications();

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('seller_applications').delete().eq('id', applicationId);
      } catch (err) {
        console.warn('Supabase admin delete application error:', err);
      }
    }

    this.notify();
  }

  public async adminDeleteSeller(sellerId: string): Promise<void> {
    this.sellers = this.sellers.filter((s) => s.id !== sellerId);
    try {
      localStorage.setItem(STORAGE_SELLERS, JSON.stringify(this.sellers));
    } catch (e) {
      console.warn('Error updating sellers in localStorage:', e);
    }

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('seller_profiles').delete().eq('id', sellerId);
      } catch (err) {
        console.warn('Supabase admin delete seller error:', err);
      }
    }

    this.notify();
  }

  public addOrUpdateApplication(app: SellerApplication): void {
    const idx = this.applications.findIndex((a) => a.id === app.id || a.user_id === app.user_id);
    if (idx >= 0) {
      this.applications[idx] = app;
    } else {
      this.applications.unshift(app);
    }
    this.safeSaveApplications();
    this.notify();
  }

  public clearAllLocalApplications(): void {
    this.applications = [];
    this.safeSaveApplications();
    this.notify();
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
