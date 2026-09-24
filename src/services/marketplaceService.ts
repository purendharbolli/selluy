import { Product, SellerProfile, Category, Order, Report } from '../types';
import { INITIAL_CATEGORIES, INITIAL_SELLERS, INITIAL_PRODUCTS } from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Local storage keys for offline/fallback caching
const STORAGE_PRODUCTS = 'selluy_products_v1';
const STORAGE_SELLERS = 'selluy_sellers_v1';
const STORAGE_CATEGORIES = 'selluy_categories_v1';
const STORAGE_ORDERS = 'selluy_orders_v1';
const STORAGE_REPORTS = 'selluy_reports_v1';

class MarketplaceService {
  private products: Product[] = [];
  private sellers: SellerProfile[] = [];
  private categories: Category[] = [];
  private orders: Order[] = [];
  private reports: Report[] = [];

  constructor() {
    this.initLocal();
    if (isSupabaseConfigured()) {
      this.syncFromSupabase();
    }
  }

  private initLocal() {
    const savedSellers = localStorage.getItem(STORAGE_SELLERS);
    this.sellers = savedSellers ? JSON.parse(savedSellers) : INITIAL_SELLERS;

    const savedCats = localStorage.getItem(STORAGE_CATEGORIES);
    this.categories = savedCats ? JSON.parse(savedCats) : INITIAL_CATEGORIES;

    const savedProds = localStorage.getItem(STORAGE_PRODUCTS);
    this.products = savedProds ? JSON.parse(savedProds) : INITIAL_PRODUCTS;

    const savedOrders = localStorage.getItem(STORAGE_ORDERS);
    this.orders = savedOrders ? JSON.parse(savedOrders) : [
      {
        id: 'ord-1001',
        buyer_id: 'usr-buyer-demo',
        buyer_name: 'Aarav Patel',
        buyer_email: 'aarav@example.com',
        total_amount: 1970,
        shipping_address: {
          name: 'Aarav Patel',
          phone: '+91 98765 43210',
          address_line: 'Flat 402, Green Meadows, Jubilee Hills',
          city: 'Hyderabad',
          state: 'Telangana',
          pincode: '500033',
        },
        status: 'shipped',
        payment_status: 'paid_test_mode',
        payment_method: 'test_upi',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        items: [
          {
            id: 'item-1',
            order_id: 'ord-1001',
            product_id: 'prod-1',
            seller_id: 'seller-1',
            quantity: 1,
            price: 1450,
          }
        ]
      }
    ];

    const savedReports = localStorage.getItem(STORAGE_REPORTS);
    this.reports = savedReports ? JSON.parse(savedReports) : [
      {
        id: 'rep-1',
        reporter_id: 'usr-buyer-demo',
        reporter_name: 'Aarav Patel',
        target_type: 'product',
        target_id: 'prod-18',
        target_title: 'Chunky Twisted Croissant Dome Ring',
        reason: 'Image resolution seems slightly blurry on mobile view',
        status: 'pending',
        created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
      }
    ];
  }

  // Sync with cloud Supabase tables when credentials exist
  public async syncFromSupabase() {
    try {
      const [catRes, sellerRes, prodRes] = await Promise.all([
        supabase.from('categories').select('*'),
        supabase.from('seller_profiles').select('*'),
        supabase.from('products').select('*'),
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
    } catch (err) {
      console.warn('Supabase sync notice:', err);
    }
  }

  // --- PRODUCTS ---
  public getProducts(): Product[] {
    return this.products.map(p => ({
      ...p,
      seller: this.sellers.find(s => s.id === p.seller_id),
      category: this.categories.find(c => c.id === p.category_id)
    }));
  }

  public getProductById(id: string): Product | undefined {
    const p = this.products.find(prod => prod.id === id);
    if (!p) return undefined;
    return {
      ...p,
      seller: this.sellers.find(s => s.id === p.seller_id),
      category: this.categories.find(c => c.id === p.category_id)
    };
  }

  public getProductsBySeller(sellerId: string): Product[] {
    return this.getProducts().filter(p => p.seller_id === sellerId);
  }

  public createProduct(data: Omit<Product, 'id' | 'created_at'>): Product {
    const newProduct: Product = {
      ...data,
      id: 'prod-' + Date.now(),
      created_at: new Date().toISOString()
    };
    this.products.unshift(newProduct);
    this.saveProducts();

    if (isSupabaseConfigured()) {
      supabase.from('products').insert([newProduct]).then(() => {});
    }

    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | null {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return null;
    this.products[index] = { ...this.products[index], ...updates };
    this.saveProducts();

    if (isSupabaseConfigured()) {
      supabase.from('products').update(updates).eq('id', id).then(() => {});
    }

    return this.products[index];
  }

  public deleteProduct(id: string): boolean {
    const initLen = this.products.length;
    this.products = this.products.filter(p => p.id !== id);
    if (this.products.length !== initLen) {
      this.saveProducts();
      if (isSupabaseConfigured()) {
        supabase.from('products').delete().eq('id', id).then(() => {});
      }
      return true;
    }
    return false;
  }

  private saveProducts() {
    localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(this.products));
  }

  // --- SELLERS ---
  public getSellers(): SellerProfile[] {
    return [...this.sellers];
  }

  public getSellerById(id: string): SellerProfile | undefined {
    return this.sellers.find(s => s.id === id);
  }

  public updateSellerStatus(sellerId: string, status: SellerProfile['verification_status']): boolean {
    const seller = this.sellers.find(s => s.id === sellerId);
    if (!seller) return false;
    seller.verification_status = status;
    this.saveSellers();

    if (isSupabaseConfigured()) {
      supabase.from('seller_profiles').update({ verification_status: status }).eq('id', sellerId).then(() => {});
    }

    return true;
  }

  public saveSellers() {
    localStorage.setItem(STORAGE_SELLERS, JSON.stringify(this.sellers));
  }

  // --- CATEGORIES ---
  public getCategories(): Category[] {
    return [...this.categories];
  }

  public createCategory(category: Omit<Category, 'id'>): Category {
    const newCat: Category = {
      ...category,
      id: 'cat-' + Date.now()
    };
    this.categories.push(newCat);
    localStorage.setItem(STORAGE_CATEGORIES, JSON.stringify(this.categories));

    if (isSupabaseConfigured()) {
      supabase.from('categories').insert([newCat]).then(() => {});
    }

    return newCat;
  }

  // --- ORDERS ---
  public getOrders(): Order[] {
    return [...this.orders];
  }

  public getOrdersByBuyer(buyerId: string): Order[] {
    return this.orders.filter(o => o.buyer_id === buyerId);
  }

  public getOrdersBySeller(sellerId: string): Order[] {
    return this.orders.filter(o => o.items.some(item => item.seller_id === sellerId));
  }

  public createOrder(order: Omit<Order, 'id' | 'created_at'>): Order {
    const newOrder: Order = {
      ...order,
      id: 'ord-' + (1000 + this.orders.length + 1),
      created_at: new Date().toISOString()
    };
    this.orders.unshift(newOrder);
    localStorage.setItem(STORAGE_ORDERS, JSON.stringify(this.orders));

    if (isSupabaseConfigured()) {
      supabase.from('orders').insert([newOrder]).then(() => {});
    }

    return newOrder;
  }

  public updateOrderStatus(orderId: string, status: Order['status']): boolean {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return false;
    order.status = status;
    localStorage.setItem(STORAGE_ORDERS, JSON.stringify(this.orders));

    if (isSupabaseConfigured()) {
      supabase.from('orders').update({ status }).eq('id', orderId).then(() => {});
    }

    return true;
  }

  // --- REPORTS ---
  public getReports(): Report[] {
    return [...this.reports];
  }

  public createReport(report: Omit<Report, 'id' | 'created_at'>): Report {
    const newReport: Report = {
      ...report,
      id: 'rep-' + Date.now(),
      created_at: new Date().toISOString()
    };
    this.reports.unshift(newReport);
    localStorage.setItem(STORAGE_REPORTS, JSON.stringify(this.reports));

    if (isSupabaseConfigured()) {
      supabase.from('reports').insert([newReport]).then(() => {});
    }

    return newReport;
  }

  public updateReportStatus(reportId: string, status: Report['status']): boolean {
    const report = this.reports.find(r => r.id === reportId);
    if (!report) return false;
    report.status = status;
    localStorage.setItem(STORAGE_REPORTS, JSON.stringify(this.reports));

    if (isSupabaseConfigured()) {
      supabase.from('reports').update({ status }).eq('id', reportId).then(() => {});
    }

    return true;
  }

  // Reset to seed data
  public resetToDefault() {
    localStorage.removeItem(STORAGE_PRODUCTS);
    localStorage.removeItem(STORAGE_SELLERS);
    localStorage.removeItem(STORAGE_CATEGORIES);
    localStorage.removeItem(STORAGE_ORDERS);
    localStorage.removeItem(STORAGE_REPORTS);
    this.initLocal();
  }
}

export const marketplaceService = new MarketplaceService();
