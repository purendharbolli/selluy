import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, Store, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DemoRoleBanner: React.FC = () => {
  const { role, switchDemoRole } = useAuth();

  return (
    <div className="bg-stone-900 text-stone-200 text-xs px-4 py-2 border-b border-stone-800 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium text-stone-300">
            <span className="text-white font-semibold">Selluy MVP Mode:</span> Test the full marketplace workflow
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          <span className="text-stone-400 mr-1 hidden md:inline">View as:</span>

          <button
            onClick={() => switchDemoRole('buyer')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-medium transition ${
              role === 'buyer'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            <ShoppingBag className="w-3 h-3" />
            Buyer
          </button>

          <button
            onClick={() => switchDemoRole('seller')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-medium transition ${
              role === 'seller'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            <Store className="w-3 h-3" />
            Seller (Local Thread)
          </button>

          <button
            onClick={() => switchDemoRole('admin')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-medium transition ${
              role === 'admin'
                ? 'bg-emerald-500 text-stone-950 font-bold shadow-sm'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            <Shield className="w-3 h-3" />
            Admin
          </button>

          {role === 'seller' && (
            <Link
              to="/seller/dashboard"
              className="ml-2 inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold underline"
            >
              Open Seller Studio <ArrowRight className="w-3 h-3" />
            </Link>
          )}

          {role === 'admin' && (
            <Link
              to="/admin"
              className="ml-2 inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold underline"
            >
              Open Admin Control <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
