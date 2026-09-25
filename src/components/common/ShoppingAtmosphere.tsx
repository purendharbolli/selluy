import React from 'react';

/**
 * ShoppingAtmosphere
 * Art-directed, spatial commerce background ambience matching the Selluy Gen-Z design.
 * Features the actual floating 3D assets: blurred shopping bags, location pin, and luminous color pools.
 * Purely decorative, aria-hidden, zero layout shift or pointer interception.
 */
export const ShoppingAtmosphere: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none select-none -z-10"
    >
      {/* 1. Luminous Atmospheric Color Pools matching the warm yellow & soft blue aura */}
      <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-amber-300/20 via-[#FACC15]/15 to-transparent rounded-full blur-3xl" />
      <div className="absolute top-16 right-6 w-[550px] h-[550px] bg-gradient-to-bl from-blue-500/15 via-indigo-500/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute top-[800px] left-8 w-[460px] h-[460px] bg-gradient-to-tr from-amber-200/15 via-blue-400/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute top-[1400px] right-12 w-[520px] h-[520px] bg-gradient-to-tl from-blue-600/12 via-amber-300/12 to-transparent rounded-full blur-3xl" />

      {/* 2. Top-Left: Blurred Warm Yellow 3D Shopping Bag (from mockup) */}
      <div className="absolute -top-4 -left-6 w-32 sm:w-40 opacity-70 pointer-events-none drop-shadow-md">
        <img
          src="/homepage/float-yellow-bag.png"
          alt=""
          className="w-full h-auto object-contain transform -rotate-6 select-none filter blur-[2px]"
        />
      </div>

      {/* 3. Mid-Left: Blurred Soft Blue Location Pin (from mockup) */}
      <div className="absolute top-[260px] -left-2 w-14 sm:w-16 opacity-75 pointer-events-none drop-shadow-sm">
        <img
          src="/homepage/float-blue-pin.png"
          alt=""
          className="w-full h-auto object-contain transform -rotate-12 select-none filter blur-[1.5px]"
        />
      </div>

      {/* 4. Top-Right: Blurred Soft Blue Shopping Bag (from mockup) */}
      <div className="absolute top-48 -right-4 sm:right-0 w-28 sm:w-36 opacity-70 pointer-events-none drop-shadow-md">
        <img
          src="/homepage/float-blue-bag.png"
          alt=""
          className="w-full h-auto object-contain transform rotate-6 select-none filter blur-[2px]"

        />
      </div>

      {/* 5. Playful 4-Point Yellow Sparkle Stars */}
      <svg
        className="absolute top-24 left-1/3 w-6 h-6 text-[#FACC15] opacity-60 animate-pulse"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
      </svg>

      <svg
        className="absolute top-[520px] left-16 w-5 h-5 text-[#FACC15] opacity-50"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 0L14 8.5L22 12L14 15.5L12 24L10 15.5L2 12L10 8.5L12 0Z" />
      </svg>

      <svg
        className="absolute top-[920px] right-1/4 w-7 h-7 text-[#FACC15] opacity-40 animate-pulse"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
      </svg>
    </div>
  );
};

export default ShoppingAtmosphere;
