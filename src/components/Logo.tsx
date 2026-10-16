import React from 'react';
import { useNews } from '../context/NewsContext';

interface LogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  alt?: string;
  showRing?: boolean;
  showGlow?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  alt = 'AV News Today Logo',
  showRing = true,
  showGlow = false,
}) => {
  const { broadcastSettings } = useNews();

  // Size mappings for consistent broadcast presentation
  const sizeClasses = {
    xs: 'w-12 h-6',
    sm: 'w-16 h-8',
    md: 'w-22 h-11 sm:w-24 sm:h-12',
    lg: 'w-32 h-16 sm:w-40 sm:h-20',
    xl: 'w-48 h-24 sm:w-56 sm:h-28',
    custom: '',
  };

  const ringClasses = showRing
    ? 'ring-2 ring-amber-400/80 shadow-lg'
    : '';

  const glowClasses = showGlow
    ? 'drop-shadow-[0_0_16px_rgba(245,158,11,0.5)]'
    : '';

  // Priority: 1) Custom logo if set in broadcastSettings, 2) /logo.jpg, 3) fallback
  const logoSrc = broadcastSettings?.channelLogoUrl || '/logo.jpg';

  return (
    <img
      src={logoSrc}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={(e) => {
        // Fallback to /logo.jpg or public asset if custom failed
        const target = e.currentTarget;
        if (target.src !== `${window.location.origin}/logo.jpg`) {
          target.src = '/logo.jpg';
        }
      }}
      className={`rounded-md object-contain bg-white shrink-0 ${sizeClasses[size]} ${ringClasses} ${glowClasses} ${className}`}
    />
  );
};
