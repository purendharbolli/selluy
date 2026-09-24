-- =========================================================
-- SELLUY COMPLETE SUPABASE DATABASE SETUP SCRIPT
-- Paste this ENTIRE script into the Supabase SQL Editor and click RUN
-- =========================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Clean up any previous partial tables so types match perfectly
drop table if exists public.order_items cascade;
drop table if exists public.orders cascade;
drop table if exists public.reviews cascade;
drop table if exists public.wishlist cascade;
drop table if exists public.reports cascade;
drop table if exists public.products cascade;
drop table if exists public.seller_profiles cascade;
drop table if exists public.categories cascade;
drop table if exists public.users cascade;

-- 1. USERS TABLE
create table public.users (
  id text primary key,
  name text not null,
  email text unique not null,
  phone text,
  role text not null check (role in ('buyer', 'seller', 'admin')) default 'buyer',
  avatar text,
  city text default 'Hyderabad',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. CATEGORIES TABLE
create table public.categories (
  id text primary key,
  name text not null,
  slug text unique not null,
  image text not null,
  active boolean default true not null
);

-- 3. SELLER PROFILES TABLE
create table public.seller_profiles (
  id text primary key,
  user_id text references public.users(id) on delete cascade not null,
  store_name text not null,
  description text,
  logo text,
  city text not null default 'Hyderabad',
  state text default 'Telangana',
  social_link text,
  category_focus text default 'Handmade Crafts',
  verification_status text not null check (verification_status in ('pending', 'approved', 'rejected', 'suspended')) default 'pending',
  rating numeric(3,2) default 5.0,
  total_reviews integer default 0,
  completed_orders integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. PRODUCTS TABLE
create table public.products (
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
  active boolean default true not null,
  featured boolean default false,
  trending boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. ORDERS TABLE
create table public.orders (
  id text primary key,
  buyer_id text references public.users(id) on delete set null,
  buyer_name text not null,
  buyer_email text not null,
  total_amount numeric(10,2) not null,
  shipping_address jsonb not null,
  status text not null check (status in ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')) default 'pending',
  payment_status text not null default 'paid_test_mode',
  payment_method text not null default 'test_upi',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. ORDER ITEMS TABLE
create table public.order_items (
  id text primary key,
  order_id text references public.orders(id) on delete cascade not null,
  product_id text references public.products(id) on delete set null,
  seller_id text references public.seller_profiles(id) on delete set null,
  quantity integer not null default 1,
  price numeric(10,2) not null
);

-- 7. WISHLIST TABLE
create table public.wishlist (
  id text primary key,
  user_id text references public.users(id) on delete cascade not null,
  product_id text references public.products(id) on delete cascade not null,
  unique(user_id, product_id)
);

-- 8. REVIEWS TABLE
create table public.reviews (
  id text primary key,
  user_id text references public.users(id) on delete cascade not null,
  seller_id text references public.seller_profiles(id) on delete cascade not null,
  product_id text references public.products(id) on delete set null,
  rating integer not null check (rating between 1 and 5),
  comment text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. REPORTS TABLE
create table public.reports (
  id text primary key,
  reporter_id text references public.users(id) on delete set null,
  reporter_name text,
  target_type text not null check (target_type in ('seller', 'product', 'review')),
  target_id text not null,
  target_title text,
  reason text not null,
  status text not null check (status in ('pending', 'reviewed', 'resolved', 'dismissed')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ROW LEVEL SECURITY (RLS) POLICIES
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.seller_profiles enable row level security;
alter table public.categories enable row level security;

-- Open policies for development MVP
create policy "Public read products" on public.products for select using (true);
create policy "Public insert products" on public.products for insert with check (true);
create policy "Public update products" on public.products for update using (true);
create policy "Public delete products" on public.products for delete using (true);

create policy "Public read categories" on public.categories for select using (true);
create policy "Public insert categories" on public.categories for insert with check (true);

create policy "Public read sellers" on public.seller_profiles for select using (true);
create policy "Public insert sellers" on public.seller_profiles for insert with check (true);
create policy "Public update sellers" on public.seller_profiles for update using (true);

create policy "Public read orders" on public.orders for select using (true);
create policy "Public insert orders" on public.orders for insert with check (true);
create policy "Public update orders" on public.orders for update using (true);

-- Indexes for performance
create index if not exists idx_products_city on public.products (city);
create index if not exists idx_products_category on public.products (category_id);
create index if not exists idx_seller_city on public.seller_profiles (city);

-- SEED DATA: CATEGORIES
insert into public.categories (id, name, slug, image, active) values
  ('cat-fashion', 'Fashion & Apparel', 'fashion', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80', true),
  ('cat-accessories', 'Accessories & Jewelry', 'accessories', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80', true),
  ('cat-handmade', 'Handmade Crafts', 'handmade', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80', true),
  ('cat-art', 'Art & Prints', 'art', 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80', true),
  ('cat-gifts', 'Custom Gifts', 'gifts', 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80', true),
  ('cat-home', 'Home & Decor', 'home-decor', 'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?auto=format&fit=crop&w=600&q=80', true),
  ('cat-beauty', 'Clean Beauty & Soaps', 'beauty', 'https://images.unsplash.com/photo-1608248597359-566b7201b17b?auto=format&fit=crop&w=600&q=80', true),
  ('cat-food', 'Artisanal & Homemade', 'food-homemade', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80', true);

-- SEED DATA: CREATOR USERS
insert into public.users (id, name, email, phone, role, city) values
  ('user-seller-1', 'Local Thread Studio', 'team@localthread.in', '+91 98765 00001', 'seller', 'Hyderabad'),
  ('user-seller-2', 'Clay & Co Studio', 'hello@clayandco.studio', '+91 98765 00002', 'seller', 'Bengaluru'),
  ('user-seller-3', 'Urban Trinkets', 'support@urbantrinkets.ind', '+91 98765 00003', 'seller', 'Hyderabad');

-- SEED DATA: SELLER PROFILES
insert into public.seller_profiles (id, user_id, store_name, description, logo, city, state, social_link, category_focus, verification_status, rating, total_reviews, completed_orders) values
  ('seller-1', 'user-seller-1', 'Local Thread', 'Slow-fashion indie studio crafting breathable handloom linen kurtas and oversized shirts in Hyderabad.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', 'Hyderabad', 'Telangana', 'instagram.com/localthread.in', 'Fashion & Apparel', 'approved', 4.9, 42, 128),
  ('seller-2', 'user-seller-2', 'Clay & Co', 'Hand-thrown stoneware ceramics, earthy matcha bowls, and textured coffee mugs.', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80', 'Bengaluru', 'Karnataka', 'instagram.com/clayandco.studio', 'Home & Decor', 'approved', 4.8, 35, 94),
  ('seller-3', 'user-seller-3', 'Urban Trinkets', 'Handcrafted polymer clay earrings and modern anti-tarnish jewelry made for daily wear.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', 'Hyderabad', 'Telangana', 'instagram.com/urbantrinkets.ind', 'Accessories & Jewelry', 'approved', 5.0, 58, 210);

-- SEED DATA: PRODUCTS
insert into public.products (id, seller_id, category_id, name, description, price, original_price, stock, images, city, active, featured, trending) values
  ('prod-1', 'seller-1', 'cat-fashion', 'Breeze Relaxed Linen Kurta Shirt', 'Crafted from 100% breathable organic handloom linen with wooden button details.', 1450, 1800, 12, array['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80'], 'Hyderabad', true, true, true),
  ('prod-2', 'seller-2', 'cat-home', 'Wabi-Sabi Speckled Matcha Ceramic Bowl', 'Hand-thrown on a traditional potter’s wheel using iron-rich terracotta stoneware.', 890, 1100, 6, array['https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80'], 'Bengaluru', true, true, true),
  ('prod-3', 'seller-3', 'cat-accessories', 'Terrazzo Arch Polymer Clay Dangles', 'Feather-light handmade statement earrings in sage and terracotta tones.', 520, 650, 15, array['https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80'], 'Hyderabad', true, true, true);
