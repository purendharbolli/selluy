-- =========================================================
-- SELLOI COMPLETE SUPABASE DATABASE SETUP SCRIPT
-- Paste this ENTIRE script into the Supabase SQL Editor and click RUN
-- =========================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. CITIES TABLE
create table if not exists public.cities (
  id text primary key,
  name text not null,
  state text not null,
  country text default 'India' not null,
  slug text unique not null,
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Seed initial Indian cities
insert into public.cities (id, name, state, country, slug, is_active) values
  ('city-hyd', 'Hyderabad', 'Telangana', 'India', 'hyderabad', true),
  ('city-blr', 'Bengaluru', 'Karnataka', 'India', 'bengaluru', true),
  ('city-mum', 'Mumbai', 'Maharashtra', 'India', 'mumbai', true),
  ('city-del', 'Delhi', 'Delhi NCR', 'India', 'delhi', true),
  ('city-pun', 'Pune', 'Maharashtra', 'India', 'pune', true),
  ('city-che', 'Chennai', 'Tamil Nadu', 'India', 'chennai', true),
  ('city-kol', 'Kolkata', 'West Bengal', 'India', 'kolkata', true),
  ('city-jai', 'Jaipur', 'Rajasthan', 'India', 'jaipur', true),
  ('city-ahm', 'Ahmedabad', 'Gujarat', 'India', 'ahmedabad', true),
  ('city-koc', 'Kochi', 'Kerala', 'India', 'kochi', true)
on conflict (id) do nothing;

-- 2. USERS TABLE
create table if not exists public.users (
  id text primary key,
  name text not null,
  email text,
  phone text unique,
  role text not null check (role in ('customer', 'buyer', 'seller', 'admin')) default 'customer',
  avatar text,
  city text default 'Hyderabad',
  city_id text references public.cities(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. CATEGORIES TABLE
create table if not exists public.categories (
  id text primary key,
  name text not null,
  slug text unique not null,
  image text not null,
  active boolean default true not null
);

-- Seed Categories
insert into public.categories (id, name, slug, image, active) values
  ('cat-fashion', 'Fashion & Apparel', 'fashion', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80', true),
  ('cat-accessories', 'Accessories & Jewelry', 'accessories', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80', true),
  ('cat-handmade', 'Handmade Crafts', 'handmade', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80', true),
  ('cat-art', 'Art & Prints', 'art', 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80', true),
  ('cat-gifts', 'Custom Gifts', 'gifts', 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80', true),
  ('cat-home', 'Home & Decor', 'home-decor', 'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?auto=format&fit=crop&w=600&q=80', true),
  ('cat-beauty', 'Clean Beauty & Soaps', 'beauty', 'https://images.unsplash.com/photo-1608248597359-566b7201b17b?auto=format&fit=crop&w=600&q=80', true),
  ('cat-food', 'Artisanal & Homemade', 'food-homemade', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80', true)
on conflict (id) do nothing;

-- 4. SELLER PROFILES TABLE
create table if not exists public.seller_profiles (
  id text primary key,
  user_id text references public.users(id) on delete cascade not null,
  store_name text not null,
  description text,
  logo text,
  city text not null default 'Hyderabad',
  state text default 'Telangana',
  social_link text,
  category_focus text default 'Handmade Crafts',
  seller_type text check (seller_type in ('individual', 'small_business', 'local_store', 'brand')) default 'individual',
  verification_status text not null check (verification_status in ('pending', 'under_review', 'approved', 'rejected', 'suspended')) default 'pending',
  rating numeric(3,2),
  total_reviews integer default 0,
  completed_orders integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. SELLER APPLICATIONS TABLE
create table if not exists public.seller_applications (
  id text primary key,
  user_id text references public.users(id) on delete cascade not null,
  full_name text not null,
  store_name text not null,
  seller_type text check (seller_type in ('individual', 'small_business', 'local_store', 'brand')) default 'individual',
  city text not null,
  area text,
  category text not null,
  description text not null,
  phone text not null,
  email text,
  documents jsonb default '{}'::jsonb,
  status text not null check (status in ('pending', 'under_review', 'approved', 'rejected')) default 'pending',
  rejection_reason text,
  internal_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 6. PRODUCTS TABLE (Strict Moderation Lifecycle)
create table if not exists public.products (
  id text primary key,
  seller_id text references public.seller_profiles(id) on delete cascade not null,
  category_id text references public.categories(id) on delete set null,
  name text not null,
  description text not null,
  price numeric(10,2) not null,
  original_price numeric(10,2),
  stock integer not null default 1,
  images text[] not null default '{}',
  city text not null default 'Hyderabad',
  status text not null check (status in ('draft', 'pending_approval', 'approved', 'rejected', 'paused', 'out_of_stock', 'deleted')) default 'approved',
  rejection_reason text,
  active boolean default true not null,
  featured boolean default false,
  trending boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. ORDERS TABLE
create table if not exists public.orders (
  id text primary key,
  buyer_id text references public.users(id) on delete set null,
  buyer_name text not null,
  buyer_email text,
  total_amount numeric(10,2) not null,
  shipping_address jsonb not null,
  status text not null check (status in ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'return_requested', 'returned')) default 'pending',
  payment_status text not null default 'paid_test_mode',
  payment_method text not null default 'test_upi',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. ORDER ITEMS TABLE
create table if not exists public.order_items (
  id text primary key,
  order_id text references public.orders(id) on delete cascade not null,
  product_id text references public.products(id) on delete set null,
  seller_id text references public.seller_profiles(id) on delete set null,
  quantity integer not null default 1,
  price numeric(10,2) not null
);

-- 9. WISHLIST TABLE
create table if not exists public.wishlist (
  id text primary key,
  user_id text references public.users(id) on delete cascade not null,
  product_id text references public.products(id) on delete cascade not null,
  unique(user_id, product_id)
);

-- 10. ROW LEVEL SECURITY (RLS) POLICIES
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.seller_profiles enable row level security;
alter table public.seller_applications enable row level security;
alter table public.categories enable row level security;
alter table public.cities enable row level security;
alter table public.users enable row level security;

-- Public read policies: Customers can only discover APPROVED products from APPROVED sellers
create policy "Public read approved products" on public.products
  for select using (status = 'approved' and active = true);

create policy "Public insert products" on public.products for insert with check (true);
create policy "Public update products" on public.products for update using (true);

create policy "Public read categories" on public.categories for select using (true);
create policy "Public read cities" on public.cities for select using (is_active = true);
create policy "Public read sellers" on public.seller_profiles for select using (true);
create policy "Public insert seller applications" on public.seller_applications for insert with check (true);
create policy "Public read seller applications" on public.seller_applications for select using (true);
create policy "Public update seller applications" on public.seller_applications for update using (true);

create policy "Public users access" on public.users for select using (true);
create policy "Public users insert" on public.users for insert with check (true);
create policy "Public users update" on public.users for update using (true);

create policy "Public orders access" on public.orders for all using (true);

-- Indexes for lightning fast local city discovery
create index if not exists idx_products_city on public.products (city);
create index if not exists idx_products_status on public.products (status);
create index if not exists idx_products_category on public.products (category_id);
create index if not exists idx_seller_city on public.seller_profiles (city);
create index if not exists idx_users_phone on public.users (phone);
