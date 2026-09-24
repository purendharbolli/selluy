import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, Check } from 'lucide-react';
import { useLocation, POPULAR_CITIES } from '../../context/LocationContext';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose }) => {
  const { selectedCity, setSelectedCity } = useLocation();

  if (!isOpen) return null;

  const handleSelect = (city: string) => {
    setSelectedCity(city);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm"
        />

        {/* Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-sand-200 z-10"
        >
          <div className="flex items-center justify-between pb-4 border-b border-sand-100">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shadow-xs">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-stone-950 font-display">Select Your City</h3>
                <p className="text-xs text-stone-500">Discover direct from verified local sellers</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-sand-100 hover:bg-sand-200 text-stone-400 hover:text-stone-700 flex items-center justify-center transition cursor-pointer"
              aria-label="Close location modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-5 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Popular Hubs</p>
            <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
              {POPULAR_CITIES.map((city) => {
                const isSelected = selectedCity.toLowerCase() === city.toLowerCase();
                return (
                  <motion.button
                    key={city}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleSelect(city)}
                    className={`flex items-center justify-between p-3 rounded-2xl border text-sm font-semibold transition text-left cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-xs'
                        : 'border-sand-200 bg-sand-50/50 hover:bg-sand-100 hover:border-sand-300 text-stone-800'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-600' : 'text-stone-400'}`} />
                      {city}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-sand-100 text-center">
            <p className="text-xs text-stone-500">
              More cities are joining every week. Discover products and verified sellers across India.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LocationModal;
