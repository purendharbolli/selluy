import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, MapPin, Store, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-24 md:pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-stone-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-brand-500 flex items-center justify-center">
                <span className="text-white font-extrabold text-xl">S</span>
              </div>
              <span className="text-2xl font-black tracking-tight text-white font-display">
                selluy<span className="text-brand-400">.</span>
              </span>
            </Link>
            <p className="text-sm text-stone-400 leading-relaxed max-w-sm">
              Discover local. Buy direct. The local-first marketplace empowering independent creators, handmade studios, and Instagram sellers across India.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-stone-400">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-800 border border-stone-700">
                <MapPin className="w-3.5 h-3.5 text-brand-400" />
                Hyderabad • Bengaluru • Mumbai • Pune
              </span>
            </div>
          </div>

          {/* Marketplace */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-200 mb-4">Marketplace</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/explore" className="hover:text-white transition">Explore Feed</Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-white transition">All Categories</Link>
              </li>
              <li>
                <Link to="/explore?filter=nearby" className="hover:text-white transition">Nearby Sellers</Link>
              </li>
              <li>
                <Link to="/explore?filter=trending" className="hover:text-white transition">Trending Drops</Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-white transition">Saved Wishlist</Link>
              </li>
            </ul>
          </div>

          {/* For Indie Sellers */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-200 mb-4">Independent Sellers</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/seller/onboarding" className="text-brand-400 hover:text-brand-300 font-medium transition flex items-center gap-1">
                  <Store className="w-3.5 h-3.5" />
                  Become a Seller
                </Link>
              </li>
              <li>
                <Link to="/seller/dashboard" className="hover:text-white transition">Seller Studio</Link>
              </li>
              <li>
                <Link to="/policies/seller" className="hover:text-white transition">Seller Handbook (Draft)</Link>
              </li>
              <li>
                <Link to="/policies/community" className="hover:text-white transition">Community Rules</Link>
              </li>
              <li>
                <span className="text-xs text-stone-500">Zero tech headaches for Instagram creators</span>
              </li>
            </ul>
          </div>

          {/* Trust & Safety */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-200 mb-4">Trust & Policies</h4>
            <ul className="space-y-2.5 text-sm text-stone-400">
              <li>
                <Link to="/policies/terms" className="hover:text-white transition">Terms of Service (Draft)</Link>
              </li>
              <li>
                <Link to="/policies/privacy" className="hover:text-white transition">Privacy Policy (Draft)</Link>
              </li>
              <li>
                <Link to="/policies/refund" className="hover:text-white transition">Refund & Return Guidelines</Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-white text-stone-500 transition">Admin Portal</Link>
              </li>
              <li className="pt-1">
                <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Indie Badging
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Selluy Technologies. Crafted for independent creators across India.</p>
          <p className="flex items-center gap-1 text-stone-400">
            Fostering honest local commerce <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          </p>
        </div>
      </div>
    </footer>
  );
};
