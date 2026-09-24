import React from 'react';
import { CheckCircle2, MapPin, Sparkles, Clock, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';
import { OrderStatus, SellerVerificationStatus } from '../../types';

export const VerifiedBadge: React.FC<{ size?: 'sm' | 'md'; showText?: boolean }> = ({
  size = 'md',
  showText = true,
}) => {
  const isSm = size === 'sm';
  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 ${
        isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      }`}
      title="Verified Seller: Identity and store vetted by Selluy"
    >
      <CheckCircle2 className={`${isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-emerald-600 fill-emerald-100`} />
      {showText && <span>Verified</span>}
    </span>
  );
};

export const CityBadge: React.FC<{ city: string; size?: 'sm' | 'md' }> = ({ city, size = 'sm' }) => {
  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full bg-sand-100 text-stone-700 border border-sand-200 ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <MapPin className="w-3 h-3 text-stone-500" />
      <span>{city}</span>
    </span>
  );
};

export const VerificationStatusBadge: React.FC<{ status: SellerVerificationStatus }> = ({ status }) => {
  switch (status) {
    case 'approved':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle className="w-3.5 h-3.5" /> Approved / Verified
        </span>
      );
    case 'pending':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="w-3.5 h-3.5" /> Pending Review
        </span>
      );
    case 'rejected':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="w-3.5 h-3.5" /> Rejected
        </span>
      );
    case 'suspended':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300">
          <AlertTriangle className="w-3.5 h-3.5" /> Suspended
        </span>
      );
  }
};

export const OrderStatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
  const styles: Record<OrderStatus, { bg: string; text: string; border: string; label: string }> = {
    pending: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', label: 'Order Placed' },
    confirmed: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200', label: 'Confirmed' },
    processing: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200', label: 'Crafting / Preparing' },
    shipped: { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200', label: 'Shipped' },
    delivered: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', label: 'Delivered' },
    cancelled: { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200', label: 'Cancelled' },
  };

  const current = styles[status] || styles.pending;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${current.bg} ${current.text} ${current.border}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {current.label}
    </span>
  );
};
