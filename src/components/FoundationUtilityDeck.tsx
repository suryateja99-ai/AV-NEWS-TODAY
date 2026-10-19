import React, { useState } from 'react';
import { Logo } from './Logo';
import { GoldenMicIcon } from './GoldenMicIcon';
import { useNews } from '../context/NewsContext';

export const FoundationUtilityDeck: React.FC = () => {
  const { setActiveCategory, setIsLivePlayerOpen, broadcastSettings } = useNews();
  const [healthOpen, setHealthOpen] = useState(false);
  const [area, setArea] = useState('');
  return <>
    <section className="px-4 py-4 text-center border-b border-blue-900/50 bg-[#091329] shrink-0 space-y-3">
      <a href="https://ayudh-vikas-foundation.ai.studio" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-black text-sm">
        {broadcastSettings.foundationLogoUrl ? <img src={broadcastSettings.foundationLogoUrl} alt="Ayudh Vikas Foundation" className="w-8 h-8 object-contain" /> : <Logo size="xs" transparent showRing={false} alt="Ayudh Vikas media network" />}
        <span>Ayudh Vikas</span>
      </a>
      <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] font-bold"><a className="rounded border border-blue-700 px-2 py-1.5" href="tel:0870412082">☎ 0870412082</a><a className="rounded border border-blue-700 px-2 py-1.5" href="tel:8008120820">☎ 8008120820</a></div>
      <div className="relative w-20 h-20 mx-auto flex items-center justify-center"><span className="absolute inset-2 rounded-full border border-amber-500/25 animate-pulse" /><span className="absolute inset-0 rounded-full border border-amber-500/10" /><GoldenMicIcon className="w-16 h-16 text-amber-300" /></div>
      <p className="text-[9px] font-bold tracking-widest text-amber-300">24x7 VOICE OF THE PEOPLE</p>
      <button onClick={() => { setIsLivePlayerOpen(false); setActiveCategory('radio'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="rounded-full bg-gradient-to-r from-amber-500 to-amber-300 text-slate-950 px-8 py-2 text-xs font-black hover:brightness-110 transition">AV RADIO</button>
      <button onClick={() => setHealthOpen(true)} className="block w-full rounded-lg bg-red-600 px-4 py-2 text-xs font-black hover:bg-red-500 transition">GET HEALTH HELP</button>
    </section>
    {healthOpen && <div className="fixed inset-0 z-[70] bg-black/80 flex items-center justify-center p-4" onClick={() => setHealthOpen(false)}><section role="dialog" aria-modal="true" aria-labelledby="health-title" className="w-full max-w-md rounded-xl border border-blue-800 bg-[#091329] p-5 space-y-4 text-left" onClick={(event) => event.stopPropagation()}>
      <div className="flex justify-between items-center"><h3 id="health-title" className="font-black">Health help & hospital locator</h3><button aria-label="Close health help" onClick={() => setHealthOpen(false)} className="p-2">✕</button></div>
      <p className="text-xs text-slate-300">Contact the Foundation assistance desk or find hospitals near your area.</p>
      <div className="flex gap-2 text-xs"><a href="tel:0870412082" className="flex-1 rounded bg-red-700 px-3 py-3 text-center">Call 0870412082</a><a href="tel:8008120820" className="flex-1 rounded bg-red-700 px-3 py-3 text-center">Call 8008120820</a></div>
      <form onSubmit={(event) => { event.preventDefault(); window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`hospitals ${area || 'near me'}`)}`, '_blank', 'noopener,noreferrer'); }} className="space-y-2"><label className="block text-xs">City or area<input autoFocus className="block w-full mt-1 rounded border border-blue-800 bg-slate-950 p-2 text-sm" value={area} onChange={(event) => setArea(event.target.value)} placeholder="e.g. Warangal, Hyderabad, Vijayawada" /></label><button className="bg-blue-600 rounded px-3 py-2 text-xs font-bold w-full">Find hospitals on Maps</button></form>
    </section></div>}
  </>;
};
