import React from 'react';
import { useNews } from '../context/NewsContext';

export const RadioModerationSettings: React.FC = () => {
  const { broadcastSettings: settings, updateBroadcastSettings: update, isBackgroundMusicEnabled, setIsBackgroundMusicEnabled, backgroundMusicVolume, setBackgroundMusicVolume } = useNews();
  return <section className="space-y-3 border-b border-blue-900/50 pb-4 text-xs">
    <h3 className="font-bold text-sm">Radio broadcast settings</h3>
    <p className="text-slate-400">Citizens record → review their audio → submit → Admin previews and moderates → approved voices appear on /radio.</p>
    <label className="block">Radio title<input value={settings.radioTitle} onChange={(event) => update({ radioTitle: event.target.value })} className="w-full mt-1 p-2 bg-slate-950 rounded border border-blue-900" /></label>
    <label className="block">Live radio audio URL<input value={settings.radioStreamUrl} onChange={(event) => update({ radioStreamUrl: event.target.value })} className="w-full mt-1 p-2 bg-slate-950 rounded border border-blue-900" /></label>
    <div className="flex flex-wrap gap-4"><label className="flex gap-2 items-center"><input type="checkbox" checked={settings.radioIsLive} onChange={(event) => update({ radioIsLive: event.target.checked })} />Radio live feed enabled</label><label className="flex gap-2 items-center"><input type="checkbox" checked={isBackgroundMusicEnabled} onChange={(event) => setIsBackgroundMusicEnabled(event.target.checked)} />Procedural ambient soundtrack</label></div>
    <label className="block">Ambient volume: {Math.round(backgroundMusicVolume * 100)}%<input className="w-full accent-amber-400" type="range" min={0} max={0.3} step={0.01} value={backgroundMusicVolume} onChange={(event) => setBackgroundMusicVolume(Number(event.target.value))} /></label>
  </section>;
};
