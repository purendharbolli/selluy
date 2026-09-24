import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface BadgeProps extends Omit<HTMLMotionProps<'span'>, 'children'> {
  children?: React.ReactNode;
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive' | 'brand';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

/**
 * Modern shadcn/ui + Kokonut UI inspired Badge with pill borders and optional live dot.
 */
export const Badge: React.FC<BadgeProps> = ({
  children,
  className = '',
  variant = 'default',
  size = 'md',
  dot = false,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center font-semibold rounded-full select-none transition-all';

  const variantStyles = {
    default: 'bg-stone-900 text-white border border-stone-800 shadow-xs',
    secondary: 'bg-sand-100 text-stone-700 border border-sand-200',
    outline: 'bg-transparent text-stone-700 border border-stone-300',
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-200/80',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200/80',
    destructive: 'bg-rose-50 text-rose-800 border border-rose-200/80',
    brand: 'bg-blue-50 text-blue-700 border border-blue-200/80',
  };

  const dotStyles = {
    default: 'bg-white',
    secondary: 'bg-stone-500',
    outline: 'bg-stone-400',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    destructive: 'bg-rose-500',
    brand: 'bg-blue-600',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[11px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3.5 py-1.5 text-xs sm:text-sm gap-2',
  };

  return (
    <motion.span
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotStyles[variant]}`} />
      )}
      {children}
    </motion.span>
  );
};

export default Badge;
