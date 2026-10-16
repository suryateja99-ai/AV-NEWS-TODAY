import React from 'react';
import { useNews } from '../context/NewsContext';
import { DEFAULT_VIDEO_FRAMING, getVideoFraming, getVideoFramingStyle } from '../utils/videoFraming';

export const BroadcastFramingControls: React.FC = () => {
  const { broadcastSettings, updateBroadcastSettings, activeLiveStream } = useNews();
  const framing = getVideoFraming(broadcastSettings.videoFraming);
  const videoId = activeLiveStream.youtubePlaylist?.[0]
    || (activeLiveStream.streamType === 'youtube' ? new URL(activeLiveStream.streamUrl).pathname.split('/').pop() : null);

  return (
    <section className="bg-[#081126] border border-blue-900/60 rounded-xl p-4 sm:p-5 space-y-4" aria-label="Broadcast video framing">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-black text-white">Video zoom & framing</h3>
        <button type="button" onClick={() => updateBroadcastSettings({ videoFraming: { ...DEFAULT_VIDEO_FRAMING } })} className="text-xs font-bold text-blue-300 hover:text-white border border-blue-800 rounded-lg px-3 py-1.5">Reset framing</button>
      </div>
      <p className="text-xs text-slate-400">Zoom horizontally or vertically to crop the picture. Adjust the focus to choose which area stays visible. Changes apply immediately and are saved automatically in this browser.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-4">
          {([
            { key: 'zoomX', label: 'Horizontal zoom', min: 1, max: 2.5, step: 0.01 },
            { key: 'zoomY', label: 'Vertical zoom', min: 1, max: 2.5, step: 0.01 },
            { key: 'focusX', label: 'Horizontal focus (left → right)', min: 0, max: 100, step: 1 },
            { key: 'focusY', label: 'Vertical focus (top → bottom)', min: 0, max: 100, step: 1 },
          ] as const).map(({ key, label, min, max, step }) => (
            <label key={key} className="block text-xs font-bold text-slate-300">
              <span className="flex items-center justify-between gap-2 mb-2"><span>{label}</span><output className="font-mono text-amber-300">{Math.round(framing[key] * (key.startsWith('zoom') ? 100 : 1))}%</output></span>
              <input type="range" min={min} max={max} step={step} value={framing[key]} onChange={(event) => updateBroadcastSettings({ videoFraming: { ...framing, [key]: Number(event.target.value) } })} className="w-full accent-blue-500" />
            </label>
          ))}
        </div>
        <div className="space-y-2 min-w-0">
          <div className="relative aspect-video overflow-hidden rounded-lg bg-black border border-blue-900/60">
            <div className="absolute inset-0" style={getVideoFramingStyle(framing)}>
              {videoId ? <img src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`} alt="Broadcast thumbnail framing preview" className="w-full h-full object-cover" /> : <div className="h-full w-full bg-[linear-gradient(45deg,#172554,#0f172a)] flex items-center justify-center text-sm text-slate-300">Broadcast picture</div>}
            </div>
            <div className="absolute inset-0 border border-white/20 pointer-events-none" />
          </div>
          <p className="text-[11px] text-slate-500">Framing preview. The live video uses these same zoom and focus settings; player controls keep their normal size.</p>
        </div>
      </div>
    </section>
  );
};
