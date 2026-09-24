export type UserRole = 'buyer' | 'seller' | 'admin';

export type SellerVerificationStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  city?: string;
  created_at: string;
}

export interface SellerProfile {
  id: string;
  user_id: string;
  store_name: string;
  description: string;
  logo: string;
  city: string;
  state?: string;
  social_link?: string;
  category_focus?: string;
  verification_status: SellerVerificationStatus;
  rating: number;
  total_reviews: number;
  completed_orders: number;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  item_count?: number;
  active: boolean;
}

export interface Product {
  id: string;
  seller_id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  stock: number;
  images: string[];
  city: string;
  active: boolean;
  featured?: boolean;
  trending?: boolean;
  created_at: string;
  // Joins/Populated
  seller?: SellerProfile;
  category?: Category;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  address_line: string;
  city: string;
  state: string;
  pincode: string;
  delivery_notes?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  seller_id: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface Order {
  id: string;
  buyer_id: string;
  buyer_name?: string;
  buyer_email?: string;
  total_amount: number;
  shipping_address: ShippingAddress;
  status: OrderStatus;
  payment_status: 'paid_test_mode' | 'pending' | 'failed';
  payment_method: 'test_upi' | 'test_card' | 'cod';
  created_at: string;
  items: OrderItem[];
}

export interface Review {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  product_id?: string;
  seller_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  reporter_name?: string;
  target_type: 'seller' | 'product' | 'review';
  target_id: string;
  target_title?: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  created_at: string;
}
