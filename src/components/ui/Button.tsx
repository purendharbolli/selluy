import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children?: React.ReactNode;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'subtle';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

/**
 * Modern shadcn/ui + motion.dev inspired Button with spring micro-interactions.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = '',
      variant = 'default',
      size = 'md',
      isLoading = false,
      disabled,
      ...props
    },
    ref
  ) => {
    // Base styles with focus-visible ring
    const baseStyles =
      'inline-flex items-center justify-center font-bold select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 disabled:pointer-events-none disabled:opacity-50 transition-colors cursor-pointer';

    // Variant tokens (shadcn-inspired)
    const variantStyles = {
      default:
        'bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-700 shadow-sm hover:shadow-md',
      secondary:
        'bg-sand-100 text-stone-900 hover:bg-sand-200 active:bg-sand-300',
      outline:
        'border border-sand-300 bg-white text-stone-800 hover:bg-sand-50 hover:border-sand-400 shadow-xs',
      ghost:
        'bg-transparent text-stone-700 hover:bg-sand-100 hover:text-stone-950',
      destructive:
        'bg-rose-600 text-white hover:bg-rose-500 active:bg-rose-700 shadow-xs',
      subtle:
        'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/80',
    };

    // Size tokens
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-xs rounded-full gap-1.5',
      md: 'px-5 py-2.5 text-xs sm:text-sm rounded-full gap-2',
      lg: 'px-7 py-3.5 text-sm sm:text-base rounded-full gap-2.5',
      icon: 'w-9 h-9 p-0 rounded-full flex items-center justify-center',
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        whileHover={{ y: -1 }}
        transition={{ type: 'spring', stiffness: 450, damping: 25 }}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
