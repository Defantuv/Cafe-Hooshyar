import React from 'react';

interface HooshyarLogoProps {
  variant?: 'full' | 'compact' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  theme?: 'dark' | 'light';
}

export const HooshyarLogo: React.FC<HooshyarLogoProps> = ({
  variant = 'compact',
  size = 'md',
  className = '',
  theme = 'dark'
}) => {
  // Dimension definitions for icon
  const iconDimensions = {
    sm: { w: 32, h: 32 },
    md: { w: 44, h: 44 },
    lg: { w: 68, h: 68 },
    xl: { w: 100, h: 100 }
  }[size];

  // Colors based on theme
  const ringPrimary = theme === 'light' ? '#1E293B' : '#E2E8F0';
  const ringSecondary = theme === 'light' ? '#334155' : '#94A3B8';
  const ringDark = theme === 'light' ? '#0F172A' : '#1E293B';
  const circuitOrange = '#FF6F59';
  const circuitGlow = '#FFA245';
  const textColor = theme === 'light' ? '#0F2042' : '#F8FAFC';
  const subtextColor = theme === 'light' ? '#475569' : '#94A3B8';

  const renderIconSvg = () => (
    <svg
      width={iconDimensions.w}
      height={iconDimensions.h}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform hover:scale-105 duration-200"
      aria-label="نشان کافه هوش‌یار"
    >
      <defs>
        {/* Gradients for the 3D-like intertwined orbital rings */}
        <linearGradient id="ringGradA" x1="20" y1="20" x2="180" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={ringPrimary} />
          <stop offset="50%" stopColor={ringDark} />
          <stop offset="100%" stopColor={ringSecondary} />
        </linearGradient>

        <linearGradient id="ringGradB" x1="180" y1="20" x2="20" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={ringSecondary} />
          <stop offset="50%" stopColor={ringDark} />
          <stop offset="100%" stopColor={ringPrimary} />
        </linearGradient>

        {/* Glow filter for circuit nodes */}
        <filter id="orangeGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer Ellipse 1 (Tilted Diagonal Left) */}
      <g transform="rotate(-28 100 100)">
        <ellipse
          cx="100"
          cy="100"
          rx="72"
          ry="44"
          stroke="url(#ringGradA)"
          strokeWidth="15"
          fill="none"
          strokeLinecap="round"
        />
        {/* Circuit trace on Ring 1 */}
        <path
          d="M 40 100 A 60 34 0 0 1 156 88"
          stroke={circuitOrange}
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="42" cy="100" r="4.5" fill={circuitGlow} filter="url(#orangeGlow)" />
        <circle cx="156" cy="88" r="4.5" fill={circuitGlow} filter="url(#orangeGlow)" />
        <circle cx="95" cy="66" r="3" fill="#FFF" />
      </g>

      {/* Center Torus Ring */}
      <circle
        cx="100"
        cy="100"
        r="34"
        stroke={ringDark}
        strokeWidth="13"
        fill="none"
      />
      {/* Inner Circuit track */}
      <path
        d="M 78 100 A 22 22 0 0 1 122 100"
        stroke={circuitOrange}
        strokeWidth="3"
        fill="none"
      />
      <circle cx="78" cy="100" r="3.5" fill={circuitGlow} filter="url(#orangeGlow)" />
      <circle cx="122" cy="100" r="3.5" fill={circuitGlow} filter="url(#orangeGlow)" />

      {/* Outer Ellipse 2 (Tilted Diagonal Right) */}
      <g transform="rotate(32 100 100)">
        <ellipse
          cx="100"
          cy="100"
          rx="74"
          ry="46"
          stroke="url(#ringGradB)"
          strokeWidth="15"
          fill="none"
          strokeLinecap="round"
        />
        {/* Circuit trace on Ring 2 */}
        <path
          d="M 38 100 A 62 36 0 0 0 152 110"
          stroke={circuitOrange}
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="38" cy="100" r="4.5" fill={circuitGlow} filter="url(#orangeGlow)" />
        <circle cx="152" cy="110" r="4.5" fill={circuitGlow} filter="url(#orangeGlow)" />
        <circle cx="100" cy="136" r="3" fill="#FFF" />
      </g>
    </svg>
  );

  if (variant === 'icon') {
    return <div className={`inline-flex items-center justify-center ${className}`}>{renderIconSvg()}</div>;
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        {renderIconSvg()}
        <div className="flex flex-col text-right">
          <span
            className="font-extrabold tracking-tight leading-tight text-base sm:text-lg"
            style={{ color: textColor }}
          >
            کافه هوش‌یار
          </span>
          <span className="text-[10px] sm:text-xs font-medium text-[#FF6F59] leading-none">
            بازی ۶۰ روزه من پلاس (+M)
          </span>
        </div>
      </div>
    );
  }

  // Full Hero Variant (as displayed in the original attached Cafe.jpg)
  return (
    <div className={`flex flex-col items-center text-center select-none ${className}`}>
      <div className="relative mb-3 flex items-center justify-center p-2 rounded-2xl">
        {renderIconSvg()}
      </div>

      <h1
        className="text-2xl sm:text-3xl font-black tracking-tight mb-1"
        style={{ color: textColor }}
      >
        کافه هوش‌یار
      </h1>

      <div
        className="flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold tracking-wide"
        style={{ color: subtextColor }}
      >
        <span>چالش‌ها و مأموریت‌ها</span>
        <span className="text-[#FF6F59] font-bold">|</span>
        <span className="font-sans text-[11px] sm:text-xs">Interactive Challenges</span>
      </div>
    </div>
  );
};
