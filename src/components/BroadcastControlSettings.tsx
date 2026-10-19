import React, { useState } from 'react';
import { useNews } from '../context/NewsContext';
import { BroadcastSettings, SponsorCreative } from '../types';
import { BroadcastFramingControls } from './BroadcastFramingControls';

const field = 'w-full bg-slate-950 border border-blue-900/60 rounded-lg p-2 text-xs text-white mt-1';
export const BroadcastControlSettings: React.FC<{ section: 'overlays' | 'ads' | 'viewport' }> = ({ section }) => {
  const { broadcastSettings: settings, updateBroadcastSettings: update } = useNews();
  const [message, setMessage] = useState('');
  const [creative, setCreative] = useState<Omit<SponsorCreative, 'id'>>({ title: '', sideImage: '', bottomImage: '', targetUrl: '', phone: '' });
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
        {numeric('Rotate sponsor every (seconds)', 'adRotationSeconds', settings.adRotationSeconds ?? 30, 10, 180)}
        <label className="text-xs">Default left image URL<input className={field} value={settings.lShapeSideAd.bannerUrl || ''} onChange={(event) => update({ lShapeSideAd: { ...settings.lShapeSideAd, bannerUrl: event.target.value } })} /></label>
        <label className="text-xs">Default bottom image URL<input className={field} value={settings.lShapeBottomAd.bannerUrl || ''} onChange={(event) => update({ lShapeBottomAd: { ...settings.lShapeBottomAd, bannerUrl: event.target.value } })} /></label>
        <label className="text-xs">Default target URL<input type="url" className={field} value={settings.lShapeSideAd.targetUrl || ''} onChange={(event) => update({ lShapeSideAd: { ...settings.lShapeSideAd, targetUrl: event.target.value }, lShapeBottomAd: { ...settings.lShapeBottomAd, targetUrl: event.target.value } })} /></label>
        <label className="text-xs">Sponsor phone<input className={field} value={settings.lShapeSideAd.phone || ''} onChange={(event) => update({ lShapeSideAd: { ...settings.lShapeSideAd, phone: event.target.value } })} /></label>
      </div>
      <form className="grid sm:grid-cols-2 gap-3 pt-3 border-t border-blue-900/50" onSubmit={(event) => {
        event.preventDefault(); update({ adCreatives: [...(settings.adCreatives || []), { ...creative, id: crypto.randomUUID() }] });
        setCreative({ title: '', sideImage: '', bottomImage: '', targetUrl: '', phone: '' }); setMessage('Sponsor added to rotation.');
      }}>
        <h4 className="text-xs font-bold sm:col-span-2">Add a rotating sponsor</h4>
        {(['title', 'sideImage', 'bottomImage', 'targetUrl', 'phone'] as const).map((key) => <label key={key} className="text-xs">{({ title: 'Sponsor name', sideImage: 'Left image URL', bottomImage: 'Bottom image URL', targetUrl: 'Click target URL', phone: 'Phone' })[key]}<input required={key === 'title'} type={key.includes('Image') || key === 'targetUrl' ? 'url' : 'text'} className={field} value={creative[key]} onChange={(event) => setCreative((previous) => ({ ...previous, [key]: event.target.value }))} /></label>)}
        <button className="bg-blue-600 rounded-lg p-2 text-xs self-end">Add sponsor</button>
      </form>
      {message && <p role="status" className="text-xs text-emerald-300">{message}</p>}
      {(settings.adCreatives || []).map((item) => <div key={item.id} className="flex justify-between text-xs py-2 border-b border-slate-800"><span>{item.title}</span><button className="text-red-300" onClick={() => update({ adCreatives: settings.adCreatives?.filter((creative) => creative.id !== item.id) })}>Remove</button></div>)}
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
