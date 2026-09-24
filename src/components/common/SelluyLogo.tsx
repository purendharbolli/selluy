import React from 'react';

export interface SelluyLogoProps {
  variant?: 'full' | 'symbol' | 'mobile' | 'monochrome' | 'wordmark' | 'badge';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
  theme?: 'light' | 'dark';
}

/**
 * SELLUY Official Brand Logo System
 * Symbol: The Artisan Nexus — An interlocking geometric ribbon forming the 'S' monogram
 * integrated with a craftsman's parcel loop and a golden verification rivet (#F59E0B).
 * Gradient: Deep Cobalt (#1D4ED8) -> Royal Electric (#2563EB) -> Radiant Violet (#6366F1).
 */
export const SelluyLogo: React.FC<SelluyLogoProps> = ({
  variant = 'full',
  size = 'md',
  showTagline = false,
  className = '',
  theme = 'light',
}) => {
  const isDark = theme === 'dark';
  const textColor = isDark ? 'text-white' : 'text-stone-950';
  const tagColor = isDark ? 'text-stone-400' : 'text-stone-500';
  // Dimensions map
  const sizeMap = {
    xs: { icon: 26, font: 'text-base', sub: 'text-[9px]' },
    sm: { icon: 32, font: 'text-lg', sub: 'text-[10px]' },
    md: { icon: 42, font: 'text-2xl', sub: 'text-[11px]' },
    lg: { icon: 52, font: 'text-3xl', sub: 'text-xs' },
    xl: { icon: 64, font: 'text-4xl', sub: 'text-sm' },
  };

  const currentSize = sizeMap[size];
  const isMonochrome = variant === 'monochrome';

  // The Artisan Nexus SVG Emblem
  const SymbolIcon = (
    <svg
      width={currentSize.icon}
      height={currentSize.icon}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-md"
      aria-label="Selluy Artisan Nexus Emblem"
    >
      <defs>
        {/* Primary Ribbon Gradient */}
        <linearGradient id="selluyMainGrad" x1="6" y1="6" x2="50" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={isMonochrome ? '#0F172A' : '#1D4ED8'} />
          <stop offset="50%" stopColor={isMonochrome ? '#1E293B' : '#2563EB'} />
          <stop offset="100%" stopColor={isMonochrome ? '#334155' : '#4F46E5'} />
        </linearGradient>

        {/* Dynamic Highlight Gradient */}
        <linearGradient id="selluyShineGrad" x1="12" y1="8" x2="38" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
          <stop offset="60%" stopColor="#60A5FA" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#818CF8" stopOpacity="0.3" />
        </linearGradient>

        {/* Golden Brass Eyelet / Verification Rivet */}
        <radialGradient id="selluyGoldRivet" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="60%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </radialGradient>

        {/* Ambient Glow Filter */}
        <filter id="selluyDropGlow" x="0" y="0" width="56" height="56" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#2563EB" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Tactile Sculpted Squircle Canvas */}
      <rect
        x="3"
        y="3"
        width="50"
        height="50"
        rx="15"
        fill="url(#selluyMainGrad)"
        filter="url(#selluyDropGlow)"
      />

      {/* Inner Bevel Border */}
      <rect
        x="3.5"
        y="3.5"
        width="49"
        height="49"
        rx="14.5"
        stroke="url(#selluyShineGrad)"
        strokeWidth="1.2"
      />

      {/* Upper Interlocking Ribbon: Handle / Parcel Bow */}
      <path
        d="M38 18.5C38 14.36 34.42 11 29.8 11H25C19.48 11 15 15.48 15 21C15 25.5 18 29.2 22.5 30.5L32 33.2C36.4 34.5 39.5 38.5 39.5 43.1C39.5 48.6 35 53 29.5 53"
        stroke="none"
      />

      {/* Continuous Geometric S Ribbon */}
      <path
        d="M36.5 19C35 15.5 31.5 14 27.5 14C22.25 14 18 18 18 22.5C18 27.5 22.5 29.5 29 31.5C36 33.5 40 36.5 40 42C40 47.5 35 50.5 27 50.5C21 50.5 16.5 47.5 15 43"
        stroke="#FFFFFF"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Forward Arrow / Direct Trade Notch */}
      <path
        d="M15 43L12 41L15 37"
        stroke="#93C5FD"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Specular Ridge Glow Accent */}
      <path
        d="M27.5 14C22.25 14 18 18 18 22.5"
        stroke="#BFDBFE"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.8"
      />

      {/* Artisan Gold Rivet (Verified Maker Pin) */}
      <circle
        cx="39"
        cy="15"
        r="3.5"
        fill="url(#selluyGoldRivet)"
        stroke="#FFFFFF"
        strokeWidth="1.2"
      />
      <circle
        cx="39"
        cy="15"
        r="1.2"
        fill="#78350F"
        opacity="0.75"
      />
    </svg>
  );

  if (variant === 'symbol') {
    return <div className={`inline-flex items-center ${className}`}>{SymbolIcon}</div>;
  }

  if (variant === 'wordmark') {
    return (
      <div className={`inline-flex flex-col ${className}`}>
        <div className="flex items-baseline">
          <span className={`font-black tracking-tight leading-none ${currentSize.font} ${textColor} font-display`}>
            SELLUY
          </span>
          <span className="w-2 h-2 rounded-full bg-blue-600 ml-1 mb-0.5 inline-block" />
        </div>
        {showTagline && (
          <span className={`font-semibold tracking-wider uppercase mt-1 ${tagColor} ${currentSize.sub}`}>
            Discover local • Buy direct
          </span>
        )}
      </div>
    );
  }

  if (variant === 'mobile') {
    return (
      <div className={`inline-flex items-center gap-2.5 ${className}`}>
        {SymbolIcon}
        <div className="flex items-baseline">
          <span className={`font-black text-xl tracking-tight ${textColor} font-display`}>
            SELLUY
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 ml-0.5 inline-block" />
        </div>
      </div>
    );
  }

  // Full Horizontal Variant (Default)
  return (
    <div className={`inline-flex items-center gap-3 group select-none ${className}`}>
      {SymbolIcon}
      <div className="flex flex-col justify-center">
        <div className="flex items-baseline leading-none">
          <span className={`font-black tracking-tight ${currentSize.font} ${textColor} font-display`}>
            SELLUY
          </span>
          <span className="w-2 h-2 rounded-full bg-blue-600 ml-1 inline-block shrink-0 shadow-xs" />
        </div>
        {showTagline && (
          <span className={`font-bold tracking-widest uppercase mt-1 ${tagColor} ${currentSize.sub}`}>
            Discover local • Buy direct
          </span>
        )}
      </div>
    </div>
  );
};

export default SelluyLogo;
