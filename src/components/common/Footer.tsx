import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin, Store } from 'lucide-react';
import { SelluyLogo } from './SelluyLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-24 md:pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-stone-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <SelluyLogo variant="full" size="md" className="brightness-125" />
            </Link>
            <p className="text-sm text-stone-400 leading-relaxed max-w-sm">
              Discover local. Buy direct. The local-first marketplace empowering verified independent creators, handmade studios, and local artisans across India.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-stone-400">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-800 border border-stone-700">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                Hyderabad • Bengaluru • Mumbai • Pune • Delhi • Chennai
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
                <Link to="/wishlist" className="hover:text-white transition">Saved Wishlist</Link>
              </li>
            </ul>
          </div>

          {/* For Indie Sellers */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-200 mb-4">Independent Sellers</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/seller/onboarding" className="text-blue-400 hover:text-blue-300 font-medium transition flex items-center gap-1">
                  <Store className="w-3.5 h-3.5" />
                  Become a Seller
                </Link>
              </li>
              <li>
                <Link to="/seller/dashboard" className="hover:text-white transition">Seller Studio</Link>
              </li>
              <li>
                <Link to="/policies/seller" className="hover:text-white transition">Seller Guidelines</Link>
              </li>
            </ul>
          </div>

          {/* Trust & Policies */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-200 mb-4">Trust & Policies</h4>
            <ul className="space-y-2.5 text-sm text-stone-400">
              <li>
                <Link to="/policies/terms" className="hover:text-white transition">Terms of Service</Link>
              </li>
              <li>
                <Link to="/policies/privacy" className="hover:text-white transition">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/policies/refund" className="hover:text-white transition">Refund & Return Guidelines</Link>
              </li>
              <li className="pt-2">
                <Link to="/admin/login" className="hover:text-stone-300 text-stone-500 text-xs transition">
                  Internal Admin
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} SELLUY Technologies Pvt. Ltd. Discover local. Buy direct.</p>
          <div className="flex items-center gap-2 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Strict Verified Seller Moderation</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
