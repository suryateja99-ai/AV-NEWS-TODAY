import React, { useEffect, useState } from 'react';
import { useNews } from '../context/NewsContext';
import { BroadcastSettings, HorizontalScroll, SponsorCreative } from '../types';
import { isAdImage } from '../utils/liveGraphics';
import { resolveMedia, storeMedia } from '../utils/mediaStore';
import { BroadcastFramingControls } from './BroadcastFramingControls';

const field = 'w-full bg-slate-950 border border-blue-900/60 rounded-lg p-2 text-xs text-white mt-1';
const emptyCreative = (): Omit<SponsorCreative, 'id'> => ({ title: '', sideImage: '', bottomImage: '', targetUrl: '', phone: '', durationSeconds: 30, intervalSeconds: 15, enabled: true });

const StoredImage: React.FC<{ source?: string; alt: string; className: string }> = ({ source, alt, className }) => {
  const [url, setUrl] = useState('');
  useEffect(() => {
    if (!source) { setUrl(''); return; }
    let cancelled = false;
    let revoke = '';
    resolveMedia(source).then((resolved) => {
      if (cancelled) { if (resolved.startsWith('blob:')) URL.revokeObjectURL(resolved); return; }
      if (resolved.startsWith('blob:')) revoke = resolved;
      setUrl(resolved);
    }).catch(() => { if (!cancelled) setUrl(''); });
    return () => { cancelled = true; if (revoke) URL.revokeObjectURL(revoke); };
  }, [source]);
  if (!url) return null;
  return <img src={url} alt={alt} className={className} />;
};

export const BroadcastControlSettings: React.FC<{ section: 'overlays' | 'ads' | 'viewport' }> = ({ section }) => {
  const { broadcastSettings: settings, updateBroadcastSettings: update } = useNews();
  const [message, setMessage] = useState('');
  const [creative, setCreative] = useState<Omit<SponsorCreative, 'id'>>(emptyCreative);
  const [adFormKey, setAdFormKey] = useState(0);
  const [scrollDraft, setScrollDraft] = useState({ label: '', text: '' });
  const numeric = (label: string, key: keyof BroadcastSettings, value: number, min: number, max: number, step = 1) => <label className="block text-xs text-slate-300">{label}: <output>{value}</output><input className="w-full accent-blue-500 mt-2" type="range" min={min} max={max} step={step} value={value} onChange={(event) => update({ [key]: Number(event.target.value) })} /></label>;
  return <section className="border-b border-blue-900/50 pb-5 mb-5 space-y-4">
    <h3 className="text-sm font-black">{section === 'overlays' ? 'Live graphics & bilingual tickers' : section === 'ads' ? 'L-band layout & sponsor rotation' : 'Screen viewport alignment'}</h3>
    <p className="text-xs text-slate-400">Changes apply immediately and are saved in this browser.</p>
    {section === 'overlays' && <>
      <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={!!settings.breakingFlashEnabled} onChange={(event) => update({ breakingFlashEnabled: event.target.checked })} />Show top breaking-news flash</label>
      <label className="block text-xs">Breaking flash text<input className={field} value={settings.breakingFlashText || ''} onChange={(event) => update({ breakingFlashText: event.target.value })} /></label>
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="text-xs">Telugu headlines · one item per line<textarea rows={4} className={field} value={(settings.teluguTickerItems || []).join('\n')} onChange={(event) => update({ teluguTickerItems: event.target.value.split('\n') })} /></label>
        <label className="text-xs">English dispatches · one item per line<textarea rows={4} className={field} value={(settings.englishTickerItems || []).join('\n')} onChange={(event) => update({ englishTickerItems: event.target.value.split('\n') })} /></label>
        {numeric('Ticker cycle (seconds)', 'tickerSpeed', settings.tickerSpeed ?? 30, 10, 120)}
        {numeric('Ticker background opacity', 'tickerOpacity', settings.tickerOpacity ?? 1, 0.2, 1, 0.05)}
        <div className="sm:col-span-2 border-t border-blue-900/50 pt-3 space-y-3">
          <h4 className="text-xs font-bold">Horizontal scrolls on the live screen</h4>
          <p className="text-slate-400">Add or remove the scrolling headline bars under the live picture. Changes show on the live screen immediately.</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="border border-blue-700 rounded-lg px-3 py-2" onClick={() => update({ teluguScrollVisible: settings.teluguScrollVisible === false })}>{settings.teluguScrollVisible === false ? 'Add Telugu scroll' : 'Remove Telugu scroll'}</button>
            <button type="button" className="border border-blue-700 rounded-lg px-3 py-2" onClick={() => update({ englishScrollVisible: settings.englishScrollVisible === false })}>{settings.englishScrollVisible === false ? 'Add English scroll' : 'Remove English scroll'}</button>
          </div>
          <form className="grid sm:grid-cols-2 gap-3" onSubmit={(event) => {
            event.preventDefault();
            const text = scrollDraft.text.trim();
            const label = scrollDraft.label.trim();
            if (!text || !label) { setMessage('Enter a label and the headline text for the new scroll.'); return; }
            const next: HorizontalScroll = { id: crypto.randomUUID(), label, text, enabled: true, background: '#14532d' };
            update({ horizontalScrolls: [...(settings.horizontalScrolls || []), next] });
            setScrollDraft({ label: '', text: '' });
            setMessage('Horizontal scroll added to the live screen.');
          }}>
            <label className="text-xs">New scroll label<input className={field} value={scrollDraft.label} onChange={(event) => setScrollDraft((previous) => ({ ...previous, label: event.target.value }))} placeholder="MANDI" /></label>
            <label className="text-xs">Headline text<input className={field} value={scrollDraft.text} onChange={(event) => setScrollDraft((previous) => ({ ...previous, text: event.target.value }))} placeholder="పసిడి రేటు • మార్కెట్ ధరలు" /></label>
            <button className="bg-blue-600 rounded-lg p-2 text-xs self-end">Add horizontal scroll</button>
          </form>
          {(settings.horizontalScrolls || []).map((scroll) => <div key={scroll.id} className="flex items-center justify-between gap-3 text-xs py-2 border-b border-slate-800"><span className="min-w-0 truncate"><strong>{scroll.label}</strong> · {scroll.text}</span><button type="button" className="text-red-300 shrink-0" onClick={() => update({ horizontalScrolls: settings.horizontalScrolls?.filter((item) => item.id !== scroll.id) })}>Remove</button></div>)}
          {message && <p role="status" className="text-xs text-emerald-300">{message}</p>}
        </div>
        <label className="text-xs">Watermark image URL<input className={field} value={settings.channelLogoUrl || ''} onChange={(event) => update({ channelLogoUrl: event.target.value })} /><span className="text-slate-500">Use a transparent PNG or SVG for a transparent watermark.</span></label>
        <label className="text-xs">Watermark position<select className={field} value={settings.watermarkPosition || 'top-right'} onChange={(event) => update({ watermarkPosition: event.target.value as BroadcastSettings['watermarkPosition'] })}>{['top-right', 'top-left', 'bottom-right', 'bottom-left'].map((position) => <option key={position}>{position}</option>)}</select></label>
        {numeric('Watermark scale', 'watermarkScale', settings.watermarkScale ?? 1, 0.5, 1.5, 0.05)}
        <label className="text-xs">Foundation logo URL<input className={field} value={settings.foundationLogoUrl || ''} onChange={(event) => update({ foundationLogoUrl: event.target.value })} /></label>
      </div>
    </>}
    {section === 'ads' && <>
      <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={settings.lShapeAdsEnabled} onChange={(event) => update({ lShapeAdsEnabled: event.target.checked })} />Enable L-band (left + bottom)</label>
      <div className="grid sm:grid-cols-2 gap-4">
        {numeric('Left banner width (px)', 'adSideWidth', settings.adSideWidth ?? 140, 120, 160)}
        {numeric('Bottom banner height (px)', 'adBottomHeight', settings.adBottomHeight ?? 80, 70, 90)}
        {numeric('Default ad duration when one is not set (seconds)', 'adRotationSeconds', settings.adRotationSeconds ?? 30, 10, 180)}
        <label className="text-xs">Default left image URL<input className={field} value={settings.lShapeSideAd.bannerUrl || ''} onChange={(event) => update({ lShapeSideAd: { ...settings.lShapeSideAd, bannerUrl: event.target.value } })} /></label>
        <label className="text-xs">Default bottom image URL<input className={field} value={settings.lShapeBottomAd.bannerUrl || ''} onChange={(event) => update({ lShapeBottomAd: { ...settings.lShapeBottomAd, bannerUrl: event.target.value } })} /></label>
        <label className="text-xs">Default target URL<input type="url" className={field} value={settings.lShapeSideAd.targetUrl || ''} onChange={(event) => update({ lShapeSideAd: { ...settings.lShapeSideAd, targetUrl: event.target.value }, lShapeBottomAd: { ...settings.lShapeBottomAd, targetUrl: event.target.value } })} /></label>
        <label className="text-xs">Sponsor phone<input className={field} value={settings.lShapeSideAd.phone || ''} onChange={(event) => update({ lShapeSideAd: { ...settings.lShapeSideAd, phone: event.target.value } })} /></label>
      </div>
      <form className="grid sm:grid-cols-2 gap-3 pt-3 border-t border-blue-900/50" onSubmit={(event) => {
        event.preventDefault();
        const sideImage = creative.sideImage.trim();
        const bottomImage = creative.bottomImage.trim() || sideImage;
        if (!sideImage && !bottomImage) { setMessage('Add an image for this L-ad.'); return; }
        if ((sideImage && !isAdImage(sideImage)) || (bottomImage && !isAdImage(bottomImage))) { setMessage('Use an image file or an http(s) image URL.'); return; }
        const durationSeconds = Math.min(600, Math.max(5, Number(creative.durationSeconds) || 30));
        const intervalSeconds = Math.min(3600, Math.max(0, Number(creative.intervalSeconds) || 0));
        update({ lShapeAdsEnabled: true, adCreatives: [...(settings.adCreatives || []), { ...creative, sideImage: sideImage || bottomImage, bottomImage, durationSeconds, intervalSeconds, enabled: true, id: crypto.randomUUID() }] });
        setCreative(emptyCreative()); setAdFormKey((key) => key + 1); setMessage('L-ad added. The live screen runs it for its duration, then waits for its interval.');
      }} key={adFormKey}>
        <h4 className="text-xs font-bold sm:col-span-2">Add an L-ad</h4>
        <p className="text-xs text-slate-400 sm:col-span-2">Each ad shows on the live screen for its duration, then the L-band hides for its interval before the next ad. The cycle repeats.</p>
        <label className="text-xs">Sponsor name<input required className={field} value={creative.title} onChange={(event) => setCreative((previous) => ({ ...previous, title: event.target.value }))} /></label>
        <label className="text-xs">L-ad image file<input type="file" accept="image/*" className={field} onChange={async (event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          const stored = await storeMedia(file);
          setCreative((previous) => ({ ...previous, sideImage: stored, bottomImage: stored }));
          setMessage('Image stored for this L-ad.');
        }} /></label>
        <label className="text-xs">Left image URL<input className={field} value={creative.sideImage.startsWith('av-media:') ? '' : creative.sideImage} placeholder={creative.sideImage.startsWith('av-media:') ? 'Image file selected' : 'https://...'} onChange={(event) => setCreative((previous) => ({ ...previous, sideImage: event.target.value }))} /></label>
        <label className="text-xs">Bottom image URL<input className={field} value={creative.bottomImage.startsWith('av-media:') ? '' : creative.bottomImage} placeholder={creative.bottomImage.startsWith('av-media:') ? 'Uses the selected image' : 'https://...'} onChange={(event) => setCreative((previous) => ({ ...previous, bottomImage: event.target.value }))} /></label>
        <label className="text-xs">Click target URL<input type="url" className={field} value={creative.targetUrl} onChange={(event) => setCreative((previous) => ({ ...previous, targetUrl: event.target.value }))} /></label>
        <label className="text-xs">Phone<input className={field} value={creative.phone} onChange={(event) => setCreative((previous) => ({ ...previous, phone: event.target.value }))} /></label>
        <label className="text-xs">Duration on screen (seconds)<input required type="number" min={5} max={600} className={field} value={creative.durationSeconds ?? 30} onChange={(event) => setCreative((previous) => ({ ...previous, durationSeconds: Number(event.target.value) }))} /></label>
        <label className="text-xs">Interval before the next ad (seconds)<input required type="number" min={0} max={3600} className={field} value={creative.intervalSeconds ?? 0} onChange={(event) => setCreative((previous) => ({ ...previous, intervalSeconds: Number(event.target.value) }))} /></label>
        <button className="bg-blue-600 rounded-lg p-2 text-xs self-end">Add L-ad</button>
      </form>
      {message && <p role="status" className="text-xs text-emerald-300">{message}</p>}
      {(settings.adCreatives || []).map((item) => <div key={item.id} className="grid sm:grid-cols-[auto_1fr_auto] gap-3 items-center text-xs py-2 border-b border-slate-800">
        <StoredImage source={item.sideImage || item.bottomImage} alt="" className="h-12 w-12 object-contain bg-slate-950 rounded" />
        <div className="min-w-0 space-y-2">
          <div className="font-bold truncate">{item.title}</div>
          <div className="flex flex-wrap gap-3">
            <label>Duration (s)<input type="number" min={5} max={600} className="ml-2 w-20 bg-slate-950 border border-blue-900/60 rounded p-1" value={item.durationSeconds ?? settings.adRotationSeconds ?? 30} onChange={(event) => update({ adCreatives: settings.adCreatives?.map((creative) => creative.id === item.id ? { ...creative, durationSeconds: Math.min(600, Math.max(5, Number(event.target.value) || 5)) } : creative) })} /></label>
            <label>Interval (s)<input type="number" min={0} max={3600} className="ml-2 w-20 bg-slate-950 border border-blue-900/60 rounded p-1" value={item.intervalSeconds ?? 0} onChange={(event) => update({ adCreatives: settings.adCreatives?.map((creative) => creative.id === item.id ? { ...creative, intervalSeconds: Math.min(3600, Math.max(0, Number(event.target.value) || 0)) } : creative) })} /></label>
          </div>
        </div>
        <button type="button" className="text-red-300" onClick={() => update({ adCreatives: settings.adCreatives?.filter((creative) => creative.id !== item.id) })}>Remove</button>
      </div>)}
    </>}
    {section === 'viewport' && <>
      <div className="grid sm:grid-cols-2 gap-4">
        {([
          ['scale', 'Screen scale', 0.8, 1.2, 0.01, 1], ['panX', 'Horizontal pan (%)', -20, 20, 1, 0], ['panY', 'Vertical pan (%)', -20, 20, 1, 0],
        ] as const).map(([key, label, min, max, step, fallback]) => <label key={key} className="text-xs">{label}: {settings.viewport?.[key] ?? fallback}<input type="range" className="w-full accent-blue-500 mt-2" min={min} max={max} step={step} value={settings.viewport?.[key] ?? fallback} onChange={(event) => update({ viewport: { scale: 1, panX: 0, panY: 0, fit: 'contain', ...settings.viewport, [key]: Number(event.target.value) } })} /></label>)}
        <label className="text-xs">Aspect fit<select className={field} value={settings.viewport?.fit || 'contain'} onChange={(event) => update({ viewport: { scale: 1, panX: 0, panY: 0, ...settings.viewport, fit: event.target.value as 'contain' | 'cover' | 'fill' } })}>{['contain', 'cover', 'fill'].map((fit) => <option key={fit}>{fit}</option>)}</select></label>
      </div>
      <button className="border border-blue-700 rounded-lg px-3 py-2 text-xs" onClick={() => update({ viewport: { scale: 1, panX: 0, panY: 0, fit: 'contain' } })}>Reset viewport</button>
      <BroadcastFramingControls />
    </>}
  </section>;
};
