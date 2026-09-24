import { Category, SellerProfile, Product } from '../types';

/**
 * Standard marketplace category taxonomy.
 * All real products and sellers come strictly from the Supabase database.
 * No fake products or fake users exist in the customer experience.
 */
export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-fashion',
    name: 'Fashion & Apparel',
    slug: 'fashion',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
    active: true,
  },
  {
    id: 'cat-accessories',
    name: 'Accessories & Jewelry',
    slug: 'accessories',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
    active: true,
  },
  {
    id: 'cat-handmade',
    name: 'Handmade Crafts',
    slug: 'handmade',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
    active: true,
  },
  {
    id: 'cat-art',
    name: 'Art & Prints',
    slug: 'art',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
    active: true,
  },
  {
    id: 'cat-gifts',
    name: 'Custom Gifts',
    slug: 'gifts',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80',
    active: true,
  },
  {
    id: 'cat-home',
    name: 'Home & Decor',
    slug: 'home-decor',
    image: 'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?auto=format&fit=crop&w=600&q=80',
    active: true,
  },
  {
    id: 'cat-beauty',
    name: 'Clean Beauty & Soaps',
    slug: 'beauty',
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=600&q=80',
    active: true,
  },
  {
    id: 'cat-food',
    name: 'Artisanal & Homemade',
    slug: 'food-homemade',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
    active: true,
  }
];

// Zero fake products and sellers policy: Strictly empty defaults
export const INITIAL_SELLERS: SellerProfile[] = [];
export const INITIAL_PRODUCTS: Product[] = [];
