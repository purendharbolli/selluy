import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, ShoppingBag, Heart, Store } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export const MobileBottomNav: React.FC = () => {
  const { cartCount, wishlist } = useCart();
  const { role } = useAuth();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-sand-200 px-2 py-1.5 shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-3 text-[11px] font-semibold transition ${
              isActive ? 'text-blue-600' : 'text-stone-500 hover:text-stone-900'
            }`
          }
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/explore"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-3 text-[11px] font-semibold transition ${
              isActive ? 'text-blue-600' : 'text-stone-500 hover:text-stone-900'
            }`
          }
        >
          <Compass className="w-5 h-5 mb-0.5" />
          <span>Explore</span>
        </NavLink>

        <NavLink
          to="/cart"
          className={({ isActive }) =>
            `relative flex flex-col items-center py-1 px-3 text-[11px] font-semibold transition ${
              isActive ? 'text-blue-600' : 'text-stone-500 hover:text-stone-900'
            }`
          }
        >
          <ShoppingBag className="w-5 h-5 mb-0.5" />
          {cartCount > 0 && (
            <span className="absolute top-0.5 right-2 w-4 h-4 bg-blue-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
              {cartCount}
            </span>
          )}
          <span>Bag</span>
        </NavLink>

        <NavLink
          to="/wishlist"
          className={({ isActive }) =>
            `relative flex flex-col items-center py-1 px-3 text-[11px] font-semibold transition ${
              isActive ? 'text-blue-600' : 'text-stone-500 hover:text-stone-900'
            }`
          }
        >
          <Heart className="w-5 h-5 mb-0.5" />
          {wishlist.length > 0 && (
            <span className="absolute top-0.5 right-2 w-3.5 h-3.5 bg-blue-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
              {wishlist.length}
            </span>
          )}
          <span>Saved</span>
        </NavLink>

        {role === 'seller' ? (
          <NavLink
            to="/seller/dashboard"
            className={({ isActive }) =>
              `flex flex-col items-center py-1 px-3 text-[11px] font-semibold transition ${
                isActive ? 'text-blue-600' : 'text-stone-500 hover:text-stone-900'
              }`
            }
          >
            <Store className="w-5 h-5 mb-0.5 text-blue-600" />
            <span>Studio</span>
          </NavLink>
        ) : (
          <NavLink
            to="/seller/onboarding"
            className={({ isActive }) =>
              `flex flex-col items-center py-1 px-3 text-[11px] font-semibold transition ${
                isActive ? 'text-blue-600' : 'text-stone-500 hover:text-stone-900'
              }`
            }
          >
            <Store className="w-5 h-5 mb-0.5" />
            <span>Sell</span>
          </NavLink>
        )}
      </div>
    </div>
  );
};

export default MobileBottomNav;
