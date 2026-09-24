import React from 'react';

export interface SelluyLogoProps {
  variant?: 'full' | 'symbol' | 'mobile' | 'monochrome' | 'wordmark';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
}

/**
 * SELLUY Official Brand Logo System
 * Symbol: Custom Letter "S" subtly integrated with an Indian local commerce Shopping Tag.
 * Primary Blue: #2563EB with subtle violet accent #6366F1.
 */
export const SelluyLogo: React.FC<SelluyLogoProps> = ({
  variant = 'full',
  size = 'md',
  showTagline = false,
  className = '',
}) => {
  // Dimensions map
  const sizeMap = {
    xs: { icon: 24, font: 'text-base', sub: 'text-[9px]' },
    sm: { icon: 30, font: 'text-lg', sub: 'text-[10px]' },
    md: { icon: 38, font: 'text-2xl', sub: 'text-[11px]' },
    lg: { icon: 46, font: 'text-3xl', sub: 'text-xs' },
    xl: { icon: 56, font: 'text-4xl', sub: 'text-sm' },
  };

  const currentSize = sizeMap[size];
  const isMonochrome = variant === 'monochrome';

  // S + Shopping Tag Geometric SVG Emblem
  const SymbolIcon = (
    <svg
      width={currentSize.icon}
      height={currentSize.icon}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform group-hover:scale-105"
      aria-label="Selluy S-Tag Logo"
    >
      <defs>
        <linearGradient id="selluyTagGrad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={isMonochrome ? '#111827' : '#2563EB'} />
          <stop offset="85%" stopColor={isMonochrome ? '#1F2937' : '#1D4ED8'} />
          <stop offset="100%" stopColor={isMonochrome ? '#374151' : '#4F46E5'} />
        </linearGradient>
      </defs>

      {/* Geometric Tag Base with rounded corners & beveled tag top corner */}
      <rect
        x="3"
        y="3"
        width="42"
        height="42"
        rx="12"
        fill="url(#selluyTagGrad)"
      />

      {/* Tag Eyelet Hole (Upper Right Corner of the Tag) */}
      <circle
        cx="34"
        cy="14"
        r="2.5"
        fill={isMonochrome ? '#FFFFFF' : '#BFDBFE'}
        opacity="0.9"
      />

      {/* Geometric S Ribbon wrapping through the Shopping Tag */}
      <path
        d="M32 20C30 17 26 15 21 15C16 15 13 18 13 21.5C13 25.5 17 27 23 28C29 29 34 30.5 34 35C34 39.5 30 42 24 42C18 42 14 39 12.5 35"
        stroke="#FFFFFF"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  if (variant === 'symbol') {
    return <div className={`inline-flex items-center ${className}`}>{SymbolIcon}</div>;
  }

  if (variant === 'wordmark') {
    return (
      <div className={`inline-flex flex-col ${className}`}>
        <span className={`font-black tracking-tight leading-none ${currentSize.font} text-stone-950 font-display`}>
          SELLUY
        </span>
        {showTagline && (
          <span className={`text-stone-500 font-medium tracking-normal mt-0.5 ${currentSize.sub}`}>
            Discover local. Buy direct.
          </span>
        )}
      </div>
    );
  }

  if (variant === 'mobile') {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <svg
          width="28"
          height="28"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0"
        >
          <rect x="3" y="3" width="42" height="42" rx="11" fill="#2563EB" />
          <circle cx="34" cy="14" r="2.5" fill="#BFDBFE" />
          <path
            d="M32 20C30 17 26 15 21 15C16 15 13 18 13 21.5C13 25.5 17 27 23 28C29 29 34 30.5 34 35C34 39.5 30 42 24 42C18 42 14 39 12.5 35"
            stroke="#FFFFFF"
            strokeWidth="4.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="font-black text-xl tracking-tight text-stone-950 font-display">
          SELLUY
        </span>
      </div>
    );
  }

  // Full Horizontal Variant (Default)
  return (
    <div className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      {SymbolIcon}
      <div className="flex flex-col justify-center">
        <div className="flex items-center leading-none">
          <span className={`font-black tracking-tight ${currentSize.font} text-stone-950 font-display`}>
            SELLUY
          </span>
        </div>
        {showTagline && (
          <span className={`text-stone-500 font-semibold tracking-wide uppercase mt-1 ${currentSize.sub}`}>
            Discover local • Buy direct
          </span>
        )}
      </div>
    </div>
  );
};

export default SelluyLogo;
