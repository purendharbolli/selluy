import React from 'react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-sand-200">
        <div className="flex items-center justify-between pb-4 border-b border-sand-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Select Your City</h3>
              <p className="text-xs text-gray-500">Discover direct from creators nearby</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-sand-100 text-gray-400 hover:text-gray-700 transition"
            aria-label="Close location modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Popular hubs</p>
          <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
            {POPULAR_CITIES.map((city) => {
              const isSelected = selectedCity === city;
              return (
                <button
                  key={city}
                  onClick={() => handleSelect(city)}
                  className={`flex items-center justify-between p-3 rounded-2xl border text-sm font-medium transition text-left ${
                    isSelected
                      ? 'bg-brand-50 border-brand-500 text-brand-900 shadow-sm'
                      : 'border-sand-200 bg-sand-50/50 hover:bg-sand-100 hover:border-sand-300 text-gray-800'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-brand-600' : 'text-gray-400'}`} />
                    {city}
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-brand-600" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-sand-100 text-center">
          <p className="text-xs text-stone-500">
            More cities are joining every week! You can still order nationwide from any creator.
          </p>
        </div>
      </div>
    </div>
  );
};
