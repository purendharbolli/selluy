import React from 'react';
import { ShieldCheck, Check } from 'lucide-react';

export interface VerifiedBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

/**
 * Selloi Official Verified Seller Badge
 * Displayed exclusively for verified/approved independent sellers.
 */
export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  if (size === 'sm') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 text-[11px] font-bold ${className}`}
        title="Verified Indie Seller on Selloi"
      >
        <Check className="w-3 h-3 text-blue-600 stroke-[3]" />
        {showText && <span>Verified</span>}
      </span>
    );
  }

  if (size === 'lg') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold ${className}`}
        title="Verified Indie Seller on Selloi"
      >
        <ShieldCheck className="w-4 h-4 text-blue-600" />
        {showText && <span>Verified Seller</span>}
      </span>
    );
  }

  // Default 'md'
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold ${className}`}
      title="Verified Indie Seller on Selloi"
    >
      <Check className="w-3.5 h-3.5 text-blue-600 stroke-[2.5]" />
      {showText && <span>Verified Seller</span>}
    </span>
  );
};

export default VerifiedBadge;
