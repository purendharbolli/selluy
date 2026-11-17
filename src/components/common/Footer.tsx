import React from 'react';
import { Link } from 'react-router-dom';
import { SelloiLogo } from './SelloiLogo';
import { Instagram, Youtube, Twitter } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-stone-200/80 pt-10 pb-12 text-stone-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-stone-100">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center">
              <SelloiLogo variant="full" size="sm" showTagline={false} />
            </Link>
            <span className="text-xs text-stone-400 border-l border-stone-200 pl-3">
              Shop local. Support local.
            </span>
          </div>

          {/* Center Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-stone-600">
            <Link to="/about" className="hover:text-[#2563EB] transition">About</Link>
            <Link to="/help" className="hover:text-[#2563EB] transition">Help</Link>
            <Link to="/policies/terms" className="hover:text-[#2563EB] transition">Terms</Link>
            <Link to="/policies/privacy" className="hover:text-[#2563EB] transition">Privacy</Link>
            <Link to="/contact" className="hover:text-[#2563EB] transition">Contact</Link>
          </div>

          {/* Right Social Icons */}
          <div className="flex items-center gap-4 text-stone-500">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-full hover:bg-stone-100 hover:text-stone-900 transition"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-full hover:bg-stone-100 hover:text-stone-900 transition"
              aria-label="YouTube"
            >
              <Youtube className="w-4 h-4" />
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-full hover:bg-stone-100 hover:text-stone-900 transition"
              aria-label="X (Twitter)"
            >
              <Twitter className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-6 text-center text-xs text-stone-400">
          <p>© 2026 Selloi. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
