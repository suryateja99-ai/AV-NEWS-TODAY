import React from 'react';
import { Logo } from './Logo';

interface PlayerBrandingProps {
  time: string;
  showLive: boolean;
}

export const PlayerBranding: React.FC<PlayerBrandingProps> = ({ time, showLive }) => {
  const day = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    timeZone: 'Asia/Kolkata',
  });

  return (
    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 pointer-events-none flex flex-col items-end gap-1 drop-shadow-lg">
      <Logo size="custom" showRing={false} className="w-24 h-12 sm:w-28 sm:h-14" />
      <div className="flex items-center gap-2 rounded bg-black/85 px-2 py-1 text-white border border-white/15 backdrop-blur-sm">
        {showLive && <span className="text-[9px] font-black text-red-400">LIVE</span>}
        <span className="whitespace-nowrap font-mono text-[10px] sm:text-[11px] font-bold tabular-nums">
          {day} {time}
        </span>
      </div>
    </div>
  );
};
