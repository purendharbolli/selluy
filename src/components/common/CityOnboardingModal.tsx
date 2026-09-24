import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search, Check, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { Button } from '../ui/Button';

export const POPULAR_INDIAN_CITIES = [
  { name: 'Hyderabad', state: 'Telangana', popular: true },
  { name: 'Bengaluru', state: 'Karnataka', popular: true },
  { name: 'Chennai', state: 'Tamil Nadu', popular: true },
  { name: 'Mumbai', state: 'Maharashtra', popular: true },
  { name: 'Delhi', state: 'Delhi NCR', popular: true },
  { name: 'Pune', state: 'Maharashtra', popular: true },
  { name: 'Kolkata', state: 'West Bengal', popular: false },
  { name: 'Ahmedabad', state: 'Gujarat', popular: false },
  { name: 'Jaipur', state: 'Rajasthan', popular: false },
  { name: 'Kochi', state: 'Kerala', popular: false },
  { name: 'Chandigarh', state: 'Punjab / Haryana', popular: false },
  { name: 'Lucknow', state: 'Uttar Pradesh', popular: false },
  { name: 'Visakhapatnam', state: 'Andhra Pradesh', popular: false },
  { name: 'Goa', state: 'Goa', popular: false },
];

export const CityOnboardingModal: React.FC = () => {
  const { needsCityOnboarding, completeCityOnboarding } = useAuth();
  const { setCity } = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('Hyderabad');
  const [isSaving, setIsSaving] = useState(false);

  if (!needsCityOnboarding) return null;

  const filteredCities = POPULAR_INDIAN_CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConfirm = async () => {
    setIsSaving(true);
    try {
      setCity(selectedCity);
      await completeCityOnboarding(selectedCity);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop Blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          className="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-sand-200 z-10"
        >
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 350, damping: 20 }}
              className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 border border-blue-100 shadow-xs"
            >
              <MapPin className="w-7 h-7 text-blue-600" />
            </motion.div>
            <h2 className="text-2xl font-black text-stone-950 font-display tracking-tight">
              Where are you shopping from?
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1.5 leading-relaxed">
              Choose your city to discover verified independent makers and products around you.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search your city or state..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-sand-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-600 bg-sand-50/50 shadow-xs transition"
              autoFocus
            />
          </div>

          {/* City Options List */}
          <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 mb-6">
            {filteredCities.map((city) => {
              const isSelected = selectedCity.toLowerCase() === city.name.toLowerCase();
              return (
                <motion.button
                  key={city.name}
                  type="button"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedCity(city.name)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-left text-sm transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 text-blue-800 font-bold border border-blue-300 shadow-xs'
                      : 'hover:bg-sand-50 text-stone-700 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-stone-400'}`} />
                    <div>
                      <span className="block leading-tight">{city.name}</span>
                      <span className="text-[11px] text-stone-400">{city.state}</span>
                    </div>
                  </div>

                  {isSelected ? (
                    <Check className="w-4 h-4 text-blue-600" />
                  ) : city.popular ? (
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                      Popular
                    </span>
                  ) : null}
                </motion.button>
              );
            })}

            {filteredCities.length === 0 && (
              <div className="p-4 text-center text-xs text-stone-500">
                No matching city found. You can still set &quot;{searchQuery}&quot; as your city.
                <button
                  type="button"
                  onClick={() => setSelectedCity(searchQuery)}
                  className="block mx-auto mt-2 text-blue-600 font-bold underline cursor-pointer"
                >
                  Use &quot;{searchQuery}&quot;
                </button>
              </div>
            )}
          </div>

          {/* Confirm Button */}
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedCity || isSaving}
            isLoading={isSaving}
            size="lg"
            className="w-full py-3.5 shadow-md"
          >
            Start Exploring {selectedCity}
            <Sparkles className="w-4 h-4 ml-1.5" />
          </Button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CityOnboardingModal;
