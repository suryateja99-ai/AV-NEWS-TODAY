import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { useNews } from '../context/NewsContext';
import { YouTubeLivePlayer } from './YouTubeLivePlayer';
import { PlayerBranding } from './PlayerBranding';
import { getVideoFramingStyle, getViewportStyle } from '../utils/videoFraming';
import { formatBroadcastTime } from '../utils/schedule';
import { resolveMedia } from '../utils/mediaStore';

export function safeLink(value?: string) {
  try { const url = new URL(value || ''); return ['https:', 'http:'].includes(url.protocol) ? url.href : undefined; } catch { return undefined; }
}

export const BroadcastCanvas: React.FC<{ suspended?: boolean }> = ({ suspended = false }) => {
  const { activeLiveStream: source, activeLiveCameraStream, broadcastSettings: settings, scheduleState, liveStreams } = useNews();
  const ref = useRef<HTMLVideoElement>(null);
  const [time, setTime] = useState(Date.now());
  const [error, setError] = useState('');
  const [fallbackId, setFallbackId] = useState('');
  const failedSource = useRef('');
  const fallback = fallbackId && liveStreams.find((stream) => stream.id === fallbackId);
  const stream = fallback && failedSource.current === source.id ? fallback : source;
  const isNative = ['mp4', 'hls', 'webrtc'].includes(stream.streamType);
  useEffect(() => {
    const timer = setInterval(() => setTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => { setFallbackId(''); setError(''); }, [source.id]);
  useEffect(() => {
    if (suspended || !isNative || !ref.current) return;
    const video = ref.current;
    let hls: Hls | undefined;
    let cancelled = false;
    let objectUrl: string | undefined;
    setError('');
    const onError = () => {
      const fallbackStreamId = scheduleState.current?.fallbackStreamId || settings.fallbackStreamId;
      if (!fallbackId && fallbackStreamId && fallbackStreamId !== source.id && liveStreams.some((item) => item.id === fallbackStreamId)) {
        failedSource.current = source.id;
        setFallbackId(fallbackStreamId);
      } else setError('This feed is unavailable. Select another channel or update its source in Admin.');
    };
    video.addEventListener('error', onError);
    if (stream.streamType === 'webrtc') {
      video.srcObject = activeLiveCameraStream;
      if (!activeLiveCameraStream) setError('The studio camera is not broadcasting in this browser.');
      else video.play().catch(() => {});
    } else if (stream.streamType === 'hls' && Hls.isSupported()) {
      hls = new Hls(); hls.loadSource(stream.streamUrl); hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
      hls.on(Hls.Events.ERROR, (_, data) => { if (data.fatal) onError(); });
    } else {
      resolveMedia(stream.streamUrl).then((url) => {
        if (url.startsWith('blob:') && stream.streamUrl.startsWith('av-media:')) objectUrl = url;
        if (cancelled) { if (objectUrl) URL.revokeObjectURL(objectUrl); return; }
        video.src = url; video.play().catch(() => {});
      }).catch(() => { if (!cancelled) onError(); });
    }
    return () => { cancelled = true; video.removeEventListener('error', onError); hls?.destroy(); video.pause(); video.srcObject = null; video.removeAttribute('src'); video.load(); if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [stream.id, stream.streamUrl, stream.streamType, suspended, activeLiveCameraStream, fallbackId, scheduleState.current?.fallbackStreamId, settings.fallbackStreamId]);

  const creatives = settings.adCreatives || [];
  const creative = creatives[Math.floor(time / ((settings.adRotationSeconds || 30) * 1000)) % (creatives.length || 1)];
  const adSide = settings.lShapeSideAd;
  const adBottom = settings.lShapeBottomAd;
  const sideImage = creative?.sideImage || adSide.bannerUrl;
  const bottomImage = creative?.bottomImage || adBottom.bannerUrl;
  const sponsorTitle = creative?.title || adSide.title;
  const phone = creative?.phone || adSide.phone;
  const ads = settings.lShapeAdsEnabled;
  const viewport = settings.viewport || { scale: 1, panX: 0, panY: 0, fit: 'contain' };
  const tickerStyle = { animationDuration: `${settings.tickerSpeed || 30}s` };
  const telugu = settings.teluguTickerItems?.filter(Boolean).join(' • ') || settings.topTickerText;
  const english = settings.englishTickerItems?.filter(Boolean).join(' • ') || settings.bottomTickerText;
  const clock = new Date(time).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const adClick = safeLink(creative?.targetUrl || adSide.targetUrl);

  return <div className="w-full bg-black flex flex-col" data-broadcast-stream={stream.id} data-broadcast-program={settings.schedulerEnabled ? scheduleState.current?.id : undefined}>
    {settings.breakingFlashEnabled && settings.breakingFlashText && <div role="status" className="bg-red-700 px-3 py-2 text-xs font-bold text-white"><strong className="mr-2">BREAKING NEWS</strong>{settings.breakingFlashText}</div>}
    <div className="flex flex-wrap justify-between gap-2 px-3 py-2 bg-[#091329] border-b border-blue-900/50 text-[10px]">
      <span><strong className="text-red-400 mr-2">NOW SHOWING</strong>{settings.schedulerEnabled && scheduleState.current ? scheduleState.current.title : stream.title}</span>
      <span className="text-slate-400"><strong className="text-amber-300 mr-2">NEXT PROGRAM</strong>{scheduleState.next ? `${scheduleState.next.title} · ${formatBroadcastTime(scheduleState.next.startAt)}` : 'Continuous feed'}</span>
    </div>
    <div className="flex items-stretch bg-black">
      {ads && <aside className="shrink-0 flex flex-col justify-between bg-[#0b1730] border-r border-blue-800/60 p-2 text-center overflow-hidden" style={{ width: `clamp(64px, 18vw, ${Math.max(120, Math.min(160, settings.adSideWidth || 140))}px)` }}>
        <a href={adClick} target="_blank" rel="noreferrer" className="flex-1 min-h-0 flex flex-col justify-center gap-2"><span className="text-[9px] text-amber-300 uppercase">{adSide.tag}</span>{sideImage && <img src={sideImage} alt={sponsorTitle} className="w-full max-h-48 object-contain" />}<strong className="text-[10px] sm:text-xs">{sponsorTitle}</strong><span className="text-[9px] text-slate-300">{adSide.subtitle}</span></a>
        {phone && <a className="text-[9px] text-amber-300 break-all py-1" href={`tel:${phone.replace(/[^+\d]/g, '')}`}>{phone}</a>}
      </aside>}
      <div className="min-w-0 flex-1">
        <div className={`relative w-full overflow-hidden bg-black ${stream.streamType === 'youtube' && !suspended ? '' : 'aspect-video'}`}>
          {!suspended && (stream.streamType === 'youtube' ? <YouTubeLivePlayer key={stream.id} stream={stream} onUnavailable={() => {
            const id = scheduleState.current?.fallbackStreamId || settings.fallbackStreamId;
            if (!fallbackId && id && id !== source.id && liveStreams.some((item) => item.id === id)) { failedSource.current = source.id; setFallbackId(id); }
          }} /> : stream.streamType === 'embed' ? <iframe title={stream.title} src={safeLink(stream.streamUrl)} style={getViewportStyle(settings)} referrerPolicy="strict-origin-when-cross-origin" allow="autoplay; encrypted-media; fullscreen" allowFullScreen className="absolute inset-0 w-full h-full border-0" /> : <div className="absolute inset-0 overflow-hidden"><div className="absolute inset-0" style={{ transform: `translate(${viewport.panX}%, ${viewport.panY}%) scale(${viewport.scale})` }}><video ref={ref} controls loop={stream.streamType === 'mp4'} autoPlay muted playsInline className="h-full w-full" style={{ ...getVideoFramingStyle(settings.videoFraming), objectFit: viewport.fit }} /></div></div>)}
          {settings.isChannelLogoVisible && <PlayerBranding time={clock} showLive={settings.isLiveBadgeVisible} />}
          <span className="absolute bottom-14 left-3 pointer-events-none rounded bg-black/60 px-2 py-0.5 text-[9px] text-emerald-300">{stream.quality}</span>
          {error && <div role="alert" className="absolute bottom-12 left-3 right-3 bg-red-950/90 p-3 text-xs">{error}</div>}
        </div>
      </div>
    </div>
    {ads && <a href={safeLink(creative?.targetUrl || adBottom.targetUrl)} target="_blank" rel="noreferrer" className="shrink-0 flex items-center gap-3 bg-[#101d39] px-3 border-t border-amber-500/60" style={{ height: Math.max(70, Math.min(90, settings.adBottomHeight || 80)) }}>
      {bottomImage && <img src={bottomImage} alt={creative?.title || adBottom.title} className="h-full max-w-[45%] object-contain" />}<div className="min-w-0"><strong className="block text-xs text-amber-200">{creative?.title || adBottom.title}</strong><span className="text-[10px] text-slate-300">{adBottom.subtitle}</span><span className="block text-[10px] text-blue-300">{phone || 'Learn more'}</span></div>
    </a>}
    {[{ text: telugu, label: 'తెలుగు', background: `rgba(185,28,28,${settings.tickerOpacity ?? 1})` }, { text: english, label: 'ENGLISH', background: `rgba(9,21,51,${settings.tickerOpacity ?? 1})` }].map(({ text, label, background }) => <div key={label} className="flex gap-3 items-center px-3 py-1.5 text-xs" style={{ backgroundColor: background }}><strong className="shrink-0 text-[10px] text-amber-200">{label}</strong><div className="flex-1 overflow-hidden whitespace-nowrap"><div className="animate-marquee-smooth inline-flex gap-8" style={tickerStyle}><span>{text}</span><span aria-hidden>{text}</span></div></div></div>)}
  </div>;
};
