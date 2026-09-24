import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, PackageCheck, ArrowRight } from 'lucide-react';
import { SellerProfile } from '../../types';
import { VerifiedBadge } from '../common/VerifiedBadge';

interface SellerCardProps {
  seller: SellerProfile;
  productCount?: number;
}

export const SellerCard: React.FC<SellerCardProps> = ({ seller, productCount }) => {
  const isVerified = seller.verification_status === 'approved' || (seller.verification_status as string) === 'verified';

  return (
    <div className="bg-white rounded-3xl p-5 border border-sand-200/90 shadow-soft-sm hover:shadow-soft hover:border-blue-200 transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Header with avatar & details */}
        <div className="flex items-start gap-3.5 mb-3.5">
          <img
            src={seller.logo}
            alt={seller.store_name}
            className="w-14 h-14 rounded-2xl object-cover border border-sand-200 shadow-xs"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="font-bold text-gray-900 truncate text-base hover:text-blue-600 transition">
                <Link to={`/seller/${seller.id}`}>{seller.store_name}</Link>
              </h4>
              {isVerified && (
                <VerifiedBadge size="sm" showText={false} />
              )}
            </div>

            <div className="flex items-center gap-2 mt-1 text-xs text-stone-500">
              <span className="flex items-center gap-0.5 text-stone-800 font-semibold">
                <MapPin className="w-3 h-3 text-blue-600" />
                {seller.city}
              </span>
              {seller.rating && seller.total_reviews ? (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-amber-600 font-semibold">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {seller.rating.toFixed(1)} ({seller.total_reviews})
                  </span>
                </>
              ) : null}
            </div>
          </div>
        </div>

        {/* Bio snippet */}
        <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-4">
          {seller.description}
        </p>

        {/* Focus / Category Tag */}
        <div className="flex items-center justify-between p-2.5 bg-sand-50 rounded-2xl border border-sand-200/60 text-xs mb-4">
          <div>
            <span className="text-stone-400 block text-[10px] uppercase font-bold">Category</span>
            <span className="font-semibold text-stone-800 truncate block">
              {seller.category_focus || 'Handmade Crafts'}
            </span>
          </div>
          {isVerified && (
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
              Verified Maker
            </span>
          )}
        </div>
      </div>

      {/* Action */}
      <Link
        to={`/seller/${seller.id}`}
        className="w-full py-2.5 px-4 rounded-2xl bg-sand-100 hover:bg-stone-900 hover:text-white text-stone-900 font-bold text-xs flex items-center justify-center gap-1.5 transition duration-200"
      >
        <span>Visit Storefront</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
};

export default SellerCard;
