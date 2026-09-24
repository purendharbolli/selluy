# Selluy — Discover local. Buy direct. 🛍️✨

Selluy is a modern, local-first social-commerce marketplace designed for independent creators, handmade studios, and small businesses that currently sell through Instagram, WhatsApp, and word-of-mouth.

Instead of competing as a generic corporate catalog, Selluy focuses on:
- **Local Discovery**: City-first filtering (Hyderabad, Bengaluru, Mumbai, Pune, etc.)
- **Seller Trust**: Vetted independent creators with verified seller badges
- **Direct Accountability**: Transparent prices, authentic creator stories, and real reviews
- **Zero Tech Headache**: Instant professional storefronts without chaotic DM conversations

---

## 🚀 Quick Start (Running in VS Code)

### 1. Requirements
- Node.js LTS (already configured on your machine)

### 2. Start the Development Server
In your terminal or VS Code terminal, run:
```bash
npm run dev
```

Open your browser at:
👉 **[http://localhost:5173](http://localhost:5173)**

---

## 👥 How to Test the MVP (3 Perspectives in 1 Click)

At the top of the screen in development mode, you will see the **Selluy MVP Mode Bar**:
1. **Buyer Mode**: Browse local creations, filter by city (Hyderabad, Bengaluru, etc.), add items to cart, test simulated direct checkout.
2. **Seller Mode (Local Thread)**: Open the **Seller Studio** (`/seller/dashboard`) to add new products, edit pricing/stock, update order fulfillment status, and adjust store profile settings.
3. **Admin Mode**: Open the **Admin Console** (`/admin`) to review pending seller applications, approve/reject verified badges, moderate listings, manage categories, and handle user reports.

---

## 🗄️ Relational Database (Supabase) Setup

Selluy is pre-configured with a clean relational schema ready for Supabase:
1. Create a free project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** tab in your Supabase dashboard.
3. Paste the contents of [`supabase/schema.sql`](./supabase/schema.sql) and click **Run**.
4. In your project root, open `.env` and fill in your keys:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-public-anon-key
   ```
*(If no keys are provided, Selluy seamlessly runs on its built-in local development state so you can test all features offline!)*

---

## 🌐 Free Deployment to Vercel (No Custom Domain Required)

1. Push this repository to your GitHub account:
   ```bash
   git init
   git add .
   git commit -m "Initial Selluy marketplace commit"
   git branch -M main
   git remote add origin https://github.com/your-username/selluy.git
   git push -u origin main
   ```
2. Log in to [vercel.com](https://vercel.com) and click **Add New Project**.
3. Import your `selluy` repository.
4. Keep the default settings (Framework: Vite, Build Command: `npm run build`, Output Directory: `dist`).
5. (Optional) Add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` under Environment Variables.
6. Click **Deploy**. Vercel will give you a free live URL such as `https://selluy.vercel.app`.

---

## 📁 Project Architecture

```
selluy/
├── src/
│   ├── components/
│   │   ├── common/       # Navbar, Footer, MobileBottomNav, LocationModal, Badges
│   │   ├── product/      # ProductCard with local tags and quick add
│   │   └── seller/       # SellerCard with verification and metrics
│   ├── context/          # LocationContext, AuthContext, CartContext
│   ├── data/             # Realistic mock data (6 creators, 20 products, 8 categories)
│   ├── pages/            # Home, Explore, ProductDetails, Storefront, Cart, Checkout, etc.
│   ├── services/         # MarketplaceService for state persistence
│   ├── types/            # TypeScript data contracts (User, Seller, Product, Order)
│   └── styles/           # Tailwind CSS theme and custom scrollbars
├── supabase/
│   └── schema.sql        # Complete PostgreSQL DDL with RLS policies
└── vite.config.ts        # Vite configuration with path aliases
```

---

## 📱 Mobile-First Testing

Selluy is designed mobile-first. In your browser's Developer Tools (F12), test at:
- **360px / 390px** (Mobile with bottom app navigation)
- **768px** (Tablet)
- **1024px / 1440px** (Desktop widescreen)
