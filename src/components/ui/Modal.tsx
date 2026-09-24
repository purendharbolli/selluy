import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showCloseButton?: boolean;
}

/**
 * Modern motion.dev + shadcn/ui inspired Modal dialog with spring physics and backdrop blur.
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
  showCloseButton = true,
}) => {
  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-950/50 backdrop-blur-sm"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            className={`relative w-full ${maxWidthStyles[maxWidth]} bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-sand-200 z-10`}
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  {title && (
                    <h3 className="text-xl font-black text-stone-950 font-display tracking-tight">
                      {title}
                    </h3>
                  )}
                  {description && (
                    <p className="text-xs sm:text-sm text-stone-500 mt-1">
                      {description}
                    </p>
                  )}
                </div>

                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full bg-sand-100 hover:bg-sand-200 text-stone-500 hover:text-stone-900 flex items-center justify-center transition shrink-0 cursor-pointer"
                    aria-label="Close modal"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {/* Body */}
            <div>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
