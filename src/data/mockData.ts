import { Category, SellerProfile, Product } from '../types';

/**
 * Standard marketplace category taxonomy.
 * All real products and sellers come strictly from the Supabase database.
 * No fake products or fake users exist in the customer experience.
 */
export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-fashion',
    name: 'Fashion',
    slug: 'fashion',
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=400&q=80',
    active: true,
  },
  {
    id: 'cat-accessories',
    name: 'Accessories',
    slug: 'accessories',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80',
    active: true,
  },
  {
    id: 'cat-home',
    name: 'Home',
    slug: 'home-decor',
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=400&q=80',
    active: true,
  },
  {
    id: 'cat-beauty',
    name: 'Beauty',
    slug: 'beauty',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80',
    active: true,
  },
  {
    id: 'cat-electronics',
    name: 'Electronics',
    slug: 'electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80',
    active: true,
  },
  {
    id: 'cat-lifestyle',
    name: 'Lifestyle',
    slug: 'lifestyle',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=400&q=80',
    active: true,
  },
  {
    id: 'cat-gifts',
    name: 'Gifts',
    slug: 'gifts',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=400&q=80',
    active: true,
  },
  {
    id: 'cat-handmade',
    name: 'Handmade',
    slug: 'handmade',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=400&q=80',
    active: true,
  }
];

// Zero fake products and sellers policy: Strictly empty defaults
export const INITIAL_SELLERS: SellerProfile[] = [];
export const INITIAL_PRODUCTS: Product[] = [];
