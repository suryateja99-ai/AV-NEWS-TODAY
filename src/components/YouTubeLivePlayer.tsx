import React, { useEffect, useRef, useState } from 'react';
import { Maximize2, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { LiveStreamConfig } from '../types';
import { nextQueueIndex } from '../utils/broadcast';
import { useNews } from '../context/NewsContext';
import { getViewportStyle } from '../utils/videoFraming';

interface Player {
  playVideo(): void;
  pauseVideo(): void;
  loadVideoById(id: string): void;
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  mute(): void;
  unMute(): void;
  isMuted(): boolean;
  setVolume(volume: number): void;
  getVolume(): number;
  destroy(): void;
}
interface YouTubeAPI {
  Player: new (element: HTMLIFrameElement, options: {
    events: {
      onReady(event: { target: Player }): void;
      onStateChange(event: { data: number }): void;
      onError(event: { data: number }): void;
      onAutoplayBlocked(): void;
    };
  }) => Player;
}
declare global {
  interface Window {
    YT?: YouTubeAPI;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<YouTubeAPI> | undefined;
function loadAPI(): Promise<YouTubeAPI> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;
  apiPromise = new Promise<YouTubeAPI>((resolve, reject) => {
    const previousReady = window.onYouTubeIframeAPIReady;
    const timeout = window.setTimeout(() => reject(new Error('YouTube did not load. Check your connection and retry.')), 20000);
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      window.clearTimeout(timeout);
      if (window.YT?.Player) resolve(window.YT);
    };
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.onerror = () => {
      window.clearTimeout(timeout);
      reject(new Error('YouTube could not load. Check your connection and retry.'));
    };
    document.head.appendChild(script);
  }).catch((error) => {
    apiPromise = undefined;
    throw error;
  });
  return apiPromise;
}

function formatTime(value: number) {
  const seconds = Math.max(0, Math.floor(value || 0));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export const YouTubeLivePlayer: React.FC<{ stream: LiveStreamConfig; onUnavailable?: () => void }> = ({ stream, onUnavailable }) => {
  const { broadcastSettings } = useNews();
  const hostRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const unavailableRef = useRef(onUnavailable);
  unavailableRef.current = onUnavailable;
  const [frame, setFrame] = useState({ width: 0, height: 0 });
  const playerRef = useRef<Player | null>(null);
  const indexRef = useRef(0);
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(80);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [message, setMessage] = useState('Loading broadcast…');
  const [retry, setRetry] = useState(0);
  const ids = stream.youtubePlaylist?.length
    ? stream.youtubePlaylist
    : [new URL(stream.streamUrl).pathname.split('/').filter(Boolean).pop()!];
  const playlistKey = ids.join(',');

  useEffect(() => {
    if (!viewportRef.current) return;
    const observer = new ResizeObserver(([entry]) => setFrame({ width: entry.contentRect.width, height: entry.contentRect.height }));
    observer.observe(viewportRef.current);
    return () => observer.disconnect();
  }, []);
  const fit = broadcastSettings.viewport?.fit || 'contain';
  const factor = fit === 'cover' ? Math.max(frame.width / 16, frame.height / 9) : Math.min(frame.width / 16, frame.height / 9);
  const mediaWidth = fit === 'fill' ? frame.width : factor * 16;
  const mediaHeight = fit === 'fill' ? frame.height : factor * 9;

  const changeVideo = (step: number) => {
    const player = playerRef.current;
    if (!player || !ready) return;
    indexRef.current = nextQueueIndex(indexRef.current, step, ids.length);
    setIndex(indexRef.current);
    setPosition(0);
    setMessage('');
    player.loadVideoById(ids[indexRef.current]);
  };

  useEffect(() => {
    let cancelled = false;
    let instance: Player | undefined;
    let poll: ReturnType<typeof setInterval> | undefined;
    let failures = 0;
    const videoIds = playlistKey.split(',');
    indexRef.current = 0;
    setIndex(0);
    setReady(false);
    setPlaying(false);
    setPosition(0);
    setDuration(0);
    setMuted(true);
    setVolume(80);
    setMessage('Loading broadcast…');
    loadAPI().then((api) => {
      if (cancelled || !hostRef.current) return;
      const iframe = document.createElement('iframe');
      const url = new URL(`https://www.youtube.com/embed/${videoIds[0]}`);
      url.search = new URLSearchParams({ enablejsapi: '1', origin: window.location.origin,
        controls: '0', autoplay: '1', mute: '1', playsinline: '1', disablekb: '1', rel: '0' }).toString();
      iframe.src = url.href;
      iframe.title = stream.title;
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      iframe.allowFullscreen = true;
      iframe.className = 'absolute inset-0 h-full w-full border-0';
      hostRef.current.appendChild(iframe);
      instance = new api.Player(iframe, { events: {
        onReady: ({ target }) => {
          if (cancelled) return;
          playerRef.current = target;
          target.mute();
          target.setVolume(80);
          setReady(true);
          setMessage('');
          target.playVideo();
          poll = setInterval(() => {
            if (cancelled) return;
            setPosition(target.getCurrentTime());
            setDuration(target.getDuration());
            setMuted(target.isMuted());
            setVolume(target.getVolume());
            setPlaying(target.getPlayerState() === 1);
          }, 500);
        },
        onStateChange: ({ data }) => {
          if (cancelled) return;
          setPlaying(data === 1);
          if (data === 1) { failures = 0; setMessage(''); }
          if (data === 0) {
            indexRef.current = nextQueueIndex(indexRef.current, 1, videoIds.length);
            setIndex(indexRef.current);
            setPosition(0);
            instance?.loadVideoById(videoIds[indexRef.current]);
          }
        },
        onError: ({ data }) => {
          if (cancelled) return;
          failures++;
          setMessage(`Video unavailable (YouTube ${data}). ${failures < videoIds.length ? 'Trying next video…' : 'Try another video or retry.'}`);
          if (failures < videoIds.length) {
            indexRef.current = nextQueueIndex(indexRef.current, 1, videoIds.length);
            setIndex(indexRef.current);
            instance?.loadVideoById(videoIds[indexRef.current]);
          } else unavailableRef.current?.();
        },
        onAutoplayBlocked: () => { if (!cancelled) setMessage('Press Play to start the broadcast.'); },
      } });
    }).catch((error: Error) => { if (!cancelled) setMessage(error.message); });
    return () => {
      cancelled = true;
      clearInterval(poll);
      playerRef.current = null;
      instance?.destroy();
      hostRef.current?.replaceChildren();
    };
  }, [stream.id, stream.streamUrl, stream.title, playlistKey, retry]);

  return (
    <div ref={containerRef} className="relative w-full flex flex-col bg-black">
      <div ref={viewportRef} className="relative aspect-video min-h-[200px] overflow-hidden">
        <div ref={hostRef} className="absolute" style={{ ...getViewportStyle(broadcastSettings), width: mediaWidth || '100%', height: mediaHeight || '100%', left: (frame.width - mediaWidth) / 2, top: (frame.height - mediaHeight) / 2 }} />
      </div>
      {message && <div role="status" className="flex items-center justify-between gap-2 bg-slate-900 px-3 py-1 text-xs text-amber-200">
        <span>{message}</span><button type="button" onClick={() => setRetry((value) => value + 1)} className="underline">Retry</button>
      </div>}
      <div className="flex flex-wrap items-center gap-2 bg-[#091329] border-t border-blue-900/60 px-3 py-2 text-white">
        <button type="button" disabled={!ready} onClick={() => changeVideo(-1)} aria-label="Previous video" className="p-1 disabled:opacity-40"><SkipBack size={17} /></button>
        <button type="button" disabled={!ready} onClick={() => playing ? playerRef.current?.pauseVideo() : playerRef.current?.playVideo()} aria-label={playing ? 'Pause' : 'Play'} className="p-1 disabled:opacity-40">{playing ? <Pause size={18} /> : <Play size={18} />}</button>
        <button type="button" disabled={!ready} onClick={() => changeVideo(1)} aria-label="Next video" className="p-1 disabled:opacity-40"><SkipForward size={17} /></button>
        <span className="text-[10px] font-mono tabular-nums">{formatTime(position)} / {formatTime(duration)}</span>
        <input aria-label="Seek video" type="range" min={0} max={duration || 1} step={1} value={Math.min(position, duration || 1)} disabled={!ready || !duration} onChange={(event) => { const value = Number(event.target.value); playerRef.current?.seekTo(value, true); setPosition(value); }} className="min-w-16 flex-1 accent-red-500" />
        <button type="button" disabled={!ready} onClick={() => { if (muted) playerRef.current?.unMute(); else playerRef.current?.mute(); setMuted(!muted); }} aria-label={muted ? 'Unmute' : 'Mute'} className="p-1 disabled:opacity-40">{muted ? <VolumeX size={17} /> : <Volume2 size={17} />}</button>
        <input aria-label="Volume" type="range" min={0} max={100} value={muted ? 0 : volume} disabled={!ready} onChange={(event) => { const value = Number(event.target.value); playerRef.current?.setVolume(value); playerRef.current?.unMute(); setVolume(value); setMuted(false); }} className="w-16 accent-red-500" />
        <span className="text-[10px] text-slate-300">{index + 1}/{ids.length} · Loop</span>
        <button type="button" onClick={() => { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); else containerRef.current?.parentElement?.requestFullscreen().catch(() => {}); }} aria-label="Toggle fullscreen" className="p-1"><Maximize2 size={17} /></button>
      </div>
    </div>
  );
};
