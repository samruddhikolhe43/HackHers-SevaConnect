import React from 'react';

interface SahaayLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  lightText?: boolean;
}

export const SahaayLogo: React.FC<SahaayLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  lightText = false,
}) => {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Distinctive Mark: Interlocking hands forming a protective shelter and rising leaf */}
      <div
        className={`${iconSizes[size]} rounded-xl bg-gradient-to-br from-forest-800 to-forest-950 text-white flex items-center justify-center shadow-sm p-1.5 shrink-0 border border-forest-700/40`}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          aria-hidden="true"
        >
          {/* Base hand curve / support */}
          <path
            d="M6 22C9 25 14 26 16 26C18 26 23 25 26 22"
            stroke="#F7CB75"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Central heart/leaf contour */}
          <path
            d="M16 6C13.5 10 9 13.5 9 17C9 20.866 12.134 24 16 24C19.866 24 23 20.866 23 17C23 13.5 18.5 10 16 6Z"
            fill="#3D8C6D"
            fillOpacity="0.4"
            stroke="#91C8B0"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Central sun/core of care */}
          <circle cx="16" cy="16" r="3" fill="#F1AC38" />
        </svg>
      </div>

      {showText && (
        <div className="leading-none">
          <span
            className={`${textSizes[size]} font-black tracking-tight font-sans ${
              lightText
                ? 'text-white'
                : 'text-slate-900 dark:text-white'
            }`}
          >
            SAHAAY
          </span>
          <span className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-forest-600 dark:text-forest-400 mt-0.5">
            Community Coordination
          </span>
        </div>
      )}
    </div>
  );
};
