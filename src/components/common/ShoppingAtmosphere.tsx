import React from 'react';

/**
 * ShoppingAtmosphere
 * Art-directed, ultra-subtle commerce background ambience.
 * Low opacity (4%–10%), delicate outlines, warm yellow and soft blue lighting.
 * Purely decorative, aria-hidden, zero layout shift or pointer interception.
 */
export const ShoppingAtmosphere: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none select-none -z-10"
    >
      {/* 1. Luminous Atmospheric Color Pools (Blue + Warm Yellow + Subtle Violet) */}
      <div className="absolute top-12 right-1/4 w-[520px] h-[520px] bg-gradient-to-br from-blue-500/7 via-indigo-500/4 to-transparent rounded-full blur-3xl" />
      <div className="absolute top-36 right-10 w-[380px] h-[380px] bg-gradient-to-tr from-amber-300/12 via-[#FACC15]/8 to-transparent rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-8 w-[420px] h-[420px] bg-gradient-to-tr from-blue-400/5 via-violet-400/4 to-transparent rounded-full blur-3xl" />

      {/* 2. Delicate Line-Art Shopping Elements in Margins */}
      <svg
        className="absolute top-16 right-6 w-32 h-32 text-blue-600 opacity-[0.06] transform rotate-6"
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Modern Shopping Tote Outline */}
        <path d="M12 16H36L33 40H15L12 16Z" />
        <path d="M18 16V12C18 8.686 20.686 6 24 6C27.314 6 30 8.686 30 12V16" />
      </svg>

      {/* Warm Yellow Shopping Tag in Left Margin */}
      <svg
        className="absolute top-72 left-8 w-24 h-24 text-[#FACC15] opacity-[0.14] transform -rotate-12"
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

      {/* Subtle Studio Package Box in Lower Right */}
      <svg
        className="absolute top-[850px] right-12 w-28 h-28 text-indigo-600 opacity-[0.05] transform rotate-12"
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M24 6L40 14V34L24 42L8 34V14L24 6Z" />
        <path d="M24 22L40 14" />
        <path d="M24 22L8 14" />
        <path d="M24 22V42" />
      </svg>

      {/* Tiny Sparkle Star (Yellow Commerce Spark) */}
      <svg
        className="absolute top-28 left-1/3 w-6 h-6 text-[#FACC15] opacity-25"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
      </svg>

      <svg
        className="absolute top-[480px] right-1/3 w-5 h-5 text-blue-500 opacity-20"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 0L14 8.5L22 12L14 15.5L12 24L10 15.5L2 12L10 8.5L12 0Z" />
      </svg>
    </div>
  );
};

export default ShoppingAtmosphere;
