import React, { createContext, useContext, useState, useEffect } from 'react';

export interface LocationContextType {
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  availableCities: string[];
}

export const POPULAR_CITIES = [
  'All Cities',
  'Hyderabad',
  'Bengaluru',
  'Mumbai',
  'Pune',
  'Delhi NCR',
  'Chennai',
  'Kolkata',
  'Jaipur',
  'Ahmedabad'
];

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCity, setSelectedCityState] = useState<string>(() => {
    return localStorage.getItem('selluy_city') || 'Hyderabad';
  });

  const setSelectedCity = (city: string) => {
    setSelectedCityState(city);
    localStorage.setItem('selluy_city', city);
  };

  return (
    <LocationContext.Provider value={{ selectedCity, setSelectedCity, availableCities: POPULAR_CITIES }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
