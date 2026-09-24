import React, { useState } from 'react';
import { MapPin, Search, Check, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-sand-200">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-3">
            <MapPin className="w-6 h-6 text-brand-600" />
          </div>
          <h2 className="text-2xl font-black text-stone-950 font-display">
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
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sand-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            autoFocus
          />
        </div>

        {/* City Options List */}
        <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 mb-6">
          {filteredCities.map((city) => {
            const isSelected = selectedCity.toLowerCase() === city.name.toLowerCase();
            return (
              <button
                key={city.name}
                type="button"
                onClick={() => setSelectedCity(city.name)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-sm transition ${
                  isSelected
                    ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200'
                    : 'hover:bg-sand-50 text-stone-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <MapPin className={`w-4 h-4 ${isSelected ? 'text-brand-600' : 'text-stone-400'}`} />
                  <div>
                    <span className="block leading-tight">{city.name}</span>
                    <span className="text-[11px] text-stone-400">{city.state}</span>
                  </div>
                </div>

                {isSelected ? (
                  <Check className="w-4 h-4 text-brand-600" />
                ) : city.popular ? (
                  <span className="text-[10px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                    Popular
                  </span>
                ) : null}
              </button>
            );
          })}

          {filteredCities.length === 0 && (
            <div className="p-4 text-center text-xs text-stone-500">
              No matching city found. You can still set &quot;{searchQuery}&quot; as your city.
              <button
                type="button"
                onClick={() => setSelectedCity(searchQuery)}
                className="block mx-auto mt-2 text-brand-600 font-bold underline"
              >
                Use &quot;{searchQuery}&quot;
              </button>
            </div>
          )}
        </div>

        {/* Confirm Button */}
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!selectedCity || isSaving}
          className="w-full py-3 rounded-full bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
        >
          {isSaving ? 'Saving...' : `Start Exploring ${selectedCity}`}
          <Sparkles className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CityOnboardingModal;
