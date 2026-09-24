export type UserRole = 'customer' | 'buyer' | 'seller' | 'admin';

export type SellerVerificationStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'suspended';

export type ProductStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'paused' | 'out_of_stock' | 'deleted';

export type SellerType = 'individual' | 'small_business' | 'local_store' | 'brand';

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'return_requested' | 'returned';

export interface City {
  id: string;
  name: string;
  state: string;
  country: string;
  slug: string;
  is_active: boolean;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  address?: string;
  age?: number | string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | string;
  city?: string;
  city_id?: string;
  created_at: string;
  updated_at?: string;
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
  seller_type?: SellerType;
  verification_status: SellerVerificationStatus;
  rating?: number;
  total_reviews?: number;
  completed_orders?: number;
  created_at: string;
}

export interface SellerApplication {
  id: string;
  user_id: string;
  full_name: string;
  store_name: string;
  seller_type: SellerType;
  city: string;
  area?: string;
  category: string;
  description: string;
  phone: string;
  email: string;
  documents?: {
    id_proof_url?: string;
    business_proof_url?: string;
    craft_samples?: string[];
  };
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  rejection_reason?: string;
  internal_notes?: string;
  created_at: string;
  updated_at?: string;
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
  status?: ProductStatus;
  rejection_reason?: string;
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
  order_id?: string;
  verified_purchase?: boolean;
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
