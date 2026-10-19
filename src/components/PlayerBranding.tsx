import React from 'react';
import { Logo } from './Logo';
import { useNews } from '../context/NewsContext';

interface PlayerBrandingProps {
  time: string;
  showLive: boolean;
}

export const PlayerBranding: React.FC<PlayerBrandingProps> = ({ time, showLive }) => {
  const { broadcastSettings } = useNews();
  const position = broadcastSettings.watermarkPosition || 'top-right';
  const scale = Math.max(0.5, Math.min(1.5, broadcastSettings.watermarkScale || 1));
  const day = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    timeZone: 'Asia/Kolkata',
  });

  return (
    <div className={`absolute z-30 pointer-events-none flex flex-col gap-1 drop-shadow-lg ${position.includes('left') ? 'left-3 items-start' : 'right-3 items-end'} ${position.startsWith('bottom') ? 'bottom-14' : 'top-3'}`} style={{ transform: `scale(${scale})`, transformOrigin: position.replace('-', ' ') }}>
      <Logo size="custom" transparent showRing={false} className="w-24 h-12 sm:w-28 sm:h-14 opacity-90" />
      <div className="flex items-center gap-2 rounded bg-black/85 px-2 py-1 text-white border border-white/15 backdrop-blur-sm">
        {showLive && <span className="text-[9px] font-black text-red-400">LIVE</span>}
        <span className="whitespace-nowrap font-mono text-[10px] sm:text-[11px] font-bold tabular-nums">
          {day} {time}
        </span>
      </div>
    </div>
  );
};
