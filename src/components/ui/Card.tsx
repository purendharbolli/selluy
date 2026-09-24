import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children?: React.ReactNode;
  variant?: 'default' | 'subtle' | 'bento' | 'glass';
  isInteractive?: boolean;
}

/**
 * Modern shadcn/ui + Kokonut UI inspired Card with subtle spring elevation and bento styling.
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      className = '',
      variant = 'default',
      isInteractive = false,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'rounded-3xl border transition-all relative overflow-hidden';

    const variantStyles = {
      default: 'bg-white border-sand-200/90 shadow-soft-sm',
      subtle: 'bg-sand-50/70 border-sand-200/80',
      bento:
        'bg-white border-sand-200/80 hover:border-blue-300 hover:shadow-soft-lg group',
      glass:
        'bg-white/80 backdrop-blur-md border-white/60 shadow-soft-sm',
    };

    const motionProps = isInteractive
      ? {
          whileHover: { y: -3, transition: { type: 'spring' as const, stiffness: 400, damping: 25 } },
          whileTap: { scale: 0.98 },
        }
      : {};

    return (
      <motion.div
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${className}`}
        {...motionProps}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';
export default Card;
