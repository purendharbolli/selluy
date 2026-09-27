-- =========================================================
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

-- 7. Restore the applicant's submitted application from screenshot ('Artsofhemaa' - app-1790356298880)
insert into public.seller_applications (
  id,
  user_id,
  full_name,
  store_name,
  seller_type,
  city,
  area,
  category,
  description,
  phone,
  email,
  product_types,
  craft_type,
  product_range,
  delivery_method,
  status,
  created_at
) values (
  'app-1790356298880',
  'usr_artsofhemaa',
  'Hemaa',
  'Artsofhemaa',
  'individual',
  'Hyderabad',
  'Hyderabad',
  'Art & Prints',
  'Original handmade art, canvas paintings, and customized art prints based out of Hyderabad.',
  '+91 63007 45350',
  'artsofhemaa@gmail.com',
  'Art, Canvas Prints, Hand-painted items',
  '100% Handcrafted by Me / Our Artisans',
  '₹500 - ₹2,000',
  'Local Same-Day / Next-Day Delivery',
  'under_review',
  '2026-09-25T16:30:00Z'
) on conflict (id) do update set
  status = excluded.status,
  store_name = excluded.store_name,
  category = excluded.category;
