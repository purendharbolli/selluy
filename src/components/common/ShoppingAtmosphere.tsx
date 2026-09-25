import React from 'react';

/**
 * ShoppingAtmosphere
 * Art-directed, spatial commerce background ambience matching the Selluy Gen-Z design.
 * Features blurred shopping bags, location pins, and luminous color pools (Blue, Yellow, Violet).
 * Purely decorative, aria-hidden, zero layout shift or pointer interception.
 */
export const ShoppingAtmosphere: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none select-none -z-10"
    >
      {/* 1. Luminous Atmospheric Color Pools */}
      <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-amber-300/15 via-[#FACC15]/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute top-20 right-10 w-[550px] h-[550px] bg-gradient-to-bl from-blue-500/12 via-indigo-500/8 to-transparent rounded-full blur-3xl" />
      <div className="absolute top-[800px] left-8 w-[460px] h-[460px] bg-gradient-to-tr from-amber-200/15 via-blue-400/8 to-transparent rounded-full blur-3xl" />
      <div className="absolute top-[1400px] right-12 w-[520px] h-[520px] bg-gradient-to-tl from-blue-600/10 via-amber-300/10 to-transparent rounded-full blur-3xl" />

      {/* 2. Top-Left: Blurred Warm Yellow 3D Shopping Bag (from mockup) */}
      <div className="absolute -top-6 -left-10 w-44 h-44 opacity-40 blur-md transform -rotate-12 pointer-events-none">
        <svg viewBox="0 0 100 100" fill="none" className="w-full h-full text-[#FACC15]">
          <rect x="20" y="32" width="60" height="58" rx="16" fill="url(#yellowBagGrad)" />
          <path d="M35 32V24C35 15.7 41.7 9 50 9C58.3 9 65 15.7 65 24V32" stroke="#EAB308" strokeWidth="6" strokeLinecap="round" />
          <defs>
            <linearGradient id="yellowBagGrad" x1="20" y1="32" x2="80" y2="90" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FDE047" />
              <stop offset="1" stopColor="#EAB308" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* 3. Mid-Left: Blurred Soft Blue Location Pin (from mockup) */}
      <div className="absolute top-[340px] -left-6 w-28 h-28 opacity-35 blur-sm transform -rotate-6 pointer-events-none">
        <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
          <path
            d="M50 15C36.2 15 25 26.2 25 40C25 58 50 85 50 85C50 85 75 58 75 40C75 26.2 63.8 15 50 15Z"
            fill="url(#bluePinGrad)"
          />
          <circle cx="50" cy="40" r="10" fill="#FFFFFF" fillOpacity="0.8" />
          <defs>
            <linearGradient id="bluePinGrad" x1="25" y1="15" x2="75" y2="85" gradientUnits="userSpaceOnUse">
              <stop stopColor="#60A5FA" />
              <stop offset="1" stopColor="#2563EB" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* 4. Top-Right: Blurred Soft Indigo/Blue Shopping Bag (from mockup) */}
      <div className="absolute top-44 -right-12 w-48 h-48 opacity-35 blur-md transform rotate-12 pointer-events-none">
        <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
          <rect x="20" y="32" width="60" height="58" rx="16" fill="url(#blueBagGrad)" />
          <path d="M35 32V24C35 15.7 41.7 9 50 9C58.3 9 65 15.7 65 24V32" stroke="#3B82F6" strokeWidth="6" strokeLinecap="round" />
          <defs>
            <linearGradient id="blueBagGrad" x1="20" y1="32" x2="80" y2="90" gradientUnits="userSpaceOnUse">
              <stop stopColor="#93C5FD" />
              <stop offset="1" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* 5. Delicate Line-Art Accent Tags and Packages */}
      <svg
        className="absolute top-[680px] right-8 w-24 h-24 text-[#FACC15] opacity-[0.16] transform rotate-12"
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 24L24 10H38V24L24 38L10 24Z" />
        <circle cx="32" cy="16" r="2.5" />
      </svg>

      {/* 6. Playful 4-Point Yellow Sparkle Stars */}
      <svg
        className="absolute top-24 left-1/3 w-6 h-6 text-[#FACC15] opacity-40 animate-pulse"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
      </svg>

      <svg
        className="absolute top-[520px] left-16 w-5 h-5 text-[#FACC15] opacity-35"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 0L14 8.5L22 12L14 15.5L12 24L10 15.5L2 12L10 8.5L12 0Z" />
      </svg>

      <svg
        className="absolute top-[920px] right-1/4 w-7 h-7 text-[#FACC15] opacity-30 animate-pulse"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
      </svg>

      <svg
        className="absolute top-[1600px] left-12 w-6 h-6 text-[#FACC15] opacity-40"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
      </svg>
    </div>
  );
};

export default ShoppingAtmosphere;
