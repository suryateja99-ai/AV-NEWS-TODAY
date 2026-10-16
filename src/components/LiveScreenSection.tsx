import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Copy,
  Eye,
  Heart,
  Maximize2,
  MessageSquare,
  Mic,
  Minimize2,
  Radio,
  Send,
  Share2,
  Smile,
  Tv,
  Users,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import Hls from 'hls.js';
import { useNews } from '../context/NewsContext';
import { INITIAL_EPG_PROGRAMS } from '../data/initialData';
import { GoldenMicIcon } from './GoldenMicIcon';
import { Logo } from './Logo';
import { PlayerBranding } from './PlayerBranding';
import { YouTubeLivePlayer } from './YouTubeLivePlayer';

export const LiveScreenSection: React.FC = () => {
  const {
    setActiveCategory,
    isLivePlayerOpen,
    activeLiveStream,
    liveStreams,
    setActiveLiveStream,
    broadcastSettings,
    chatMessages,
    addChatMessage,
    activeLiveCameraStream,
  } = useNews();

  const [activeTab, setActiveTab] = useState<'chat' | 'schedule' | 'channels' | 'reporter'>('chat');
  const [chatInput, setChatInput] = useState('');
  const [userName, setUserName] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [digitalTime, setDigitalTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setDigitalTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
          timeZone: 'Asia/Kolkata',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const isStudioCameraActive =
    (activeLiveStream.id === 'stream-live-studio-cam' ||
      activeLiveStream.streamType === 'webrtc') &&
    Boolean(activeLiveCameraStream);

  // Auto-scroll chat when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, activeTab]);

  // Stream handler for WebRTC Camera / HLS / MP4
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isStudioCameraActive && activeLiveCameraStream) {
      video.srcObject = activeLiveCameraStream;
      video.muted = true; // Avoid feedback howling loop on same device while broadcasting
      video.play().catch((e) => console.log('Camera play error', e));
      return () => {
        video.srcObject = null;
      };
    } else {
      video.srcObject = null;
    }

    if (activeLiveStream.streamType === 'hls') {
      if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true });
        hls.loadSource(activeLiveStream.streamUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {});
        });
        return () => {
          hls.destroy();
        };
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = activeLiveStream.streamUrl;
        video.play().catch(() => {});
      }
    } else if (activeLiveStream.streamType === 'mp4' && !isStudioCameraActive) {
      video.src = activeLiveStream.streamUrl;
      video.play().catch(() => {});
    }
  }, [activeLiveStream, activeLiveCameraStream, isStudioCameraActive]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    addChatMessage(chatInput.trim(), userName.trim() || 'Viewer');
    setChatInput('');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 3000);
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const quickReactions = ['🙏 జై భారత్', '👍 నిజం కోసం AV News', '⚡ బ్రేకింగ్ న్యూస్', '📢 ప్రజా సమస్య'];

  return (
    <section
      id="live-broadcast-screen"
      className="w-full bg-[#070e22] border border-blue-900/60 rounded-2xl overflow-hidden shadow-2xl flex flex-col transition-all scroll-mt-20"
    >
      {/* Top Live Broadcast Header Bar */}
      <div className="bg-gradient-to-r from-[#091533] via-[#071126] to-[#091533] border-b border-blue-900/60 px-3.5 sm:px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-md">
        {/* Left: TV Brand & Live Badge */}
        <div className="flex items-center gap-2.5">
          <Logo size="sm" showRing={true} alt="AV News Today Logo" />
          <div className="flex items-center">
            <span className="bg-red-600 text-white font-black text-xs px-2 py-0.5 rounded-l shadow">
              AV
            </span>
            <span className="bg-slate-900 text-white font-black text-xs px-2 py-0.5 rounded-r border border-slate-700 flex items-center gap-1">
              <span>NEWS</span>
              <span className="text-red-500">TODAY</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full animate-pulse shadow">
              <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
              <span>LIVE BROADCAST</span>
            </span>

            <span className="hidden md:inline-block text-xs font-bold text-white truncate max-w-sm lg:max-w-md">
              {activeLiveStream.title}
            </span>

            {isStudioCameraActive && (
              <span className="bg-red-500/20 text-red-300 border border-red-500/50 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                <span>STUDIO ON-AIR</span>
              </span>
            )}
          </div>
        </div>

        {/* Center: Channel Switcher Quick Pills */}
        <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto">
          {liveStreams.map((stream) => {
            const isCur = stream.id === activeLiveStream.id;
            return (
              <button
                key={stream.id}
                onClick={() => setActiveLiveStream(stream.id)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full border transition-all cursor-pointer whitespace-nowrap ${
                  isCur
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                    : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {stream.channelName}
              </button>
            );
          })}
        </div>

        {/* Right Controls: Viewers, Share, Fullscreen */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-blue-950/80 px-2.5 py-1 rounded-full border border-blue-800/60">
            <Users className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            <span className="font-bold text-white">
              {activeLiveStream.viewerCount.toLocaleString()}
            </span>
            <span className="hidden sm:inline text-[11px] text-slate-400">watching</span>
          </div>

          <button
            onClick={handleShare}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Share Stream Link"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {copiedToast && (
        <div className="bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 text-center animate-fadeIn flex items-center justify-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" />
          <span>Stream link copied to clipboard!</span>
        </div>
      )}

      {/* Main Broadcast Split View (Responsive Layout) */}
      <div className="flex flex-col lg:flex-row items-stretch overflow-hidden">
        {/* ========================================================= */}
        {/* LEFT: VIDEO PLAYER SECTION */}
        {/* ========================================================= */}
        <div
          ref={playerContainerRef}
          className="flex-1 min-w-0 flex flex-col bg-black relative justify-between overflow-hidden min-h-[380px] sm:min-h-[440px] lg:min-h-[540px] lg:h-[540px] xl:h-[580px]"
        >
          {/* Main Screen Display: Studio Camera Feed OR Telugu 'త్వరలో (Coming Soon)' Broadcast Screen */}
          <div className="relative w-full flex-1 flex items-center justify-center bg-black overflow-hidden">
            {isStudioCameraActive && activeLiveCameraStream ? (
              <video
                ref={videoRef}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              ></video>
            ) : activeLiveStream.streamType === 'youtube' ? (
              !isLivePlayerOpen && <YouTubeLivePlayer stream={activeLiveStream} />
            ) : ['hls', 'mp4'].includes(activeLiveStream.streamType) ? (
              <video ref={videoRef} controls autoPlay muted playsInline className="absolute inset-0 w-full h-full object-contain" />
            ) : (
              /* Broadcast Standby Live Screen: "త్వరలో... (Coming Soon)" in Telugu */
              <div className="relative w-full h-full min-h-[320px] flex-1 flex flex-col items-center justify-center px-4 pb-6 pt-28 sm:px-6 sm:pt-24 text-center overflow-hidden bg-gradient-to-br from-[#020614] via-[#081533] to-[#030818] select-none">
                {/* Tech Radar / Grid Overlay Background */}
                <div className="absolute inset-0 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:22px_22px] opacity-35 pointer-events-none"></div>

                {/* Ambient Broadcast Glow Rings */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 sm:w-96 sm:h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-amber-500/20 rounded-full pointer-events-none animate-ping opacity-20"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-52 h-52 border border-blue-500/25 rounded-full pointer-events-none"></div>

                {/* Center Broadcast Graphics */}
                <div className="relative z-10 flex flex-col items-center max-w-lg mx-auto space-y-3 sm:space-y-4">
                  {/* Top Live Satellite Signal Pill */}
                  <div className="inline-flex items-center gap-2 bg-slate-950/85 backdrop-blur-md border border-amber-500/50 px-3.5 py-1 rounded-full shadow-xl">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-black text-amber-400 tracking-wider uppercase">
                      24x7 HD శాటిలైట్ లైవ్ సిగ్నల్
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="font-mono text-[10px] sm:text-[11px] text-slate-300 font-bold">
                      {digitalTime || 'LIVE'}
                    </span>
                  </div>

                  {/* Channel Logo & Main 'త్వరలో...' Telugu Typography */}
                  <div className="flex flex-col items-center space-y-2 py-1">

                    <div className="space-y-1">
                      <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-400 drop-shadow-[0_4px_28px_rgba(245,158,11,0.65)] font-serif">
                        త్వరలో...
                      </h1>
                      <div className="text-xs sm:text-sm font-extrabold tracking-widest text-amber-300/90 uppercase drop-shadow">
                        ( COMING SOON )
                      </div>
                    </div>
                  </div>

                  {/* Telugu Announcement Message */}
                  <div className="space-y-1.5 px-3">
                    <p className="text-sm sm:text-base md:text-lg font-black text-white leading-snug drop-shadow-md">
                      లైవ్ ప్రసారాలు త్వరలో ప్రారంభం కానున్నాయి
                    </p>
                    <p className="text-xs sm:text-sm text-blue-200/90 font-medium">
                      AV News Today • ఆయుధ్ వికాస్ నెట్‌వర్క్ • సత్యం కోసం... సమాజం కోసం...
                    </p>
                  </div>

                  {/* Highlights Badges */}
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[10px] sm:text-[11px]">
                    <span className="bg-blue-950/80 border border-blue-500/40 text-blue-200 px-2.5 py-1 rounded-full font-semibold shadow-sm">
                      📡 హై-డెఫినిషన్ 1080p HD
                    </span>
                    <span className="bg-red-950/80 border border-red-500/40 text-red-200 px-2.5 py-1 rounded-full font-semibold shadow-sm">
                      🔴 24x7 ప్రత్యక్ష ప్రసారం
                    </span>
                    <span className="bg-amber-950/80 border border-amber-500/40 text-amber-200 px-2.5 py-1 rounded-full font-semibold shadow-sm">
                      🎙️ AV రేడియో అనుసంధానం
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Studio Camera On-Air Banner Overlay */}
            {isStudioCameraActive && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex items-center gap-2 bg-red-600/90 backdrop-blur-md text-white font-black text-xs px-4 py-1.5 rounded-full shadow-2xl animate-pulse border border-red-400">
                <span className="w-2.5 h-2.5 rounded-full bg-white"></span>
                <span>STUDIO LIVE CAMERA • BROADCASTING NOW</span>
                <span className="bg-black/40 text-[10px] font-mono px-1.5 py-0.5 rounded">
                  REAL-TIME
                </span>
              </div>
            )}

            {broadcastSettings.isChannelLogoVisible && (
              <PlayerBranding time={digitalTime} showLive={broadcastSettings.isLiveBadgeVisible} />
            )}

            {/* Quality indicator (Top Left) */}
            <div className="absolute top-4 left-4 z-20 pointer-events-none flex items-center gap-2">
              <span className="bg-black/75 backdrop-blur-sm text-[10px] font-mono font-bold text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                {activeLiveStream.quality}
              </span>
            </div>

            {/* L-Shape (L-Band) Broadcast Advertising Overlay */}
            {broadcastSettings.lShapeAdsEnabled && (
              <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-end">
                {/* Side Banner (Right) */}
                <div className="absolute right-0 top-16 bottom-16 w-36 sm:w-44 bg-blue-950/90 border-l border-blue-500/60 p-2 flex flex-col justify-between shadow-2xl backdrop-blur-sm pointer-events-auto">
                  <div className="space-y-1">
                    <span className="text-[8px] font-black bg-amber-500 text-black px-1 py-0.5 rounded">
                      {broadcastSettings.lShapeSideAd.tag}
                    </span>
                    <h5 className="text-[11px] font-black text-white leading-tight">
                      {broadcastSettings.lShapeSideAd.title}
                    </h5>
                    <p className="text-[9px] text-slate-300">
                      {broadcastSettings.lShapeSideAd.subtitle}
                    </p>
                  </div>
                  {broadcastSettings.lShapeSideAd.bannerUrl && (
                    <img
                      src={broadcastSettings.lShapeSideAd.bannerUrl}
                      alt="Ad"
                      className="w-full h-24 object-cover rounded border border-blue-800"
                    />
                  )}
                </div>

                {/* Bottom Banner */}
                <div className="w-full bg-gradient-to-r from-red-700 via-blue-900 to-slate-900 border-t-2 border-amber-400 p-2 flex items-center justify-between text-white pointer-events-auto shadow-2xl">
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-400 text-black text-[9px] font-black px-1.5 py-0.5 rounded">
                      {broadcastSettings.lShapeBottomAd.tag}
                    </span>
                    <span className="text-xs font-black">
                      {broadcastSettings.lShapeBottomAd.title}
                    </span>
                    <span className="hidden md:inline text-[11px] text-slate-200">
                      - {broadcastSettings.lShapeBottomAd.subtitle}
                    </span>
                  </div>
                  <a
                    href="https://wa.me/919000045073"
                    target="_blank"
                    rel="noreferrer"
                    className="bg-amber-400 hover:bg-amber-300 text-black text-[10px] font-black px-3 py-1 rounded shadow cursor-pointer transition-colors"
                  >
                    CONTACT US
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Dual News Tickers on Video Bottom - Smooth Continuous Marquee */}
          <div className="shrink-0 z-30">
            {/* Top Red Breaking Ticker */}
            <div className="bg-red-700 text-white text-xs font-bold py-1 px-3 flex items-center gap-2 shadow-md">
              <span className="bg-white text-red-700 text-[10px] font-black px-1.5 py-0.5 rounded shrink-0 shadow-sm">
                BREAKING
              </span>
              <div className="overflow-hidden whitespace-nowrap flex-1">
                <div className="animate-marquee-smooth inline-flex items-center gap-6">
                  <span>{broadcastSettings.topTickerText}</span>
                  <span className="text-amber-300">🔴</span>
                  <span>{broadcastSettings.topTickerText}</span>
                  <span className="text-amber-300">🔴</span>
                </div>
              </div>
            </div>

            {/* Bottom Navy Headlines Ticker */}
            <div className="bg-[#091533] border-t border-blue-800/80 text-slate-200 text-xs py-1 px-3 flex items-center gap-2">
              <span className="text-amber-400 font-black text-[10px] shrink-0 uppercase tracking-widest">
                AV NEWS TODAY HEADLINES
              </span>
              <div className="overflow-hidden whitespace-nowrap flex-1 text-[11px]">
                <div className="animate-marquee-smooth inline-flex items-center gap-6">
                  <span>{broadcastSettings.bottomTickerText}</span>
                  <span className="text-amber-400">⚡</span>
                  <span>{broadcastSettings.bottomTickerText}</span>
                  <span className="text-amber-400">⚡</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT SECTION OF LIVE SCREEN: AYUDH VIKAS, GOLDEN MIC, AV RADIO, TABS */}
        {/* ========================================================= */}
        <div className="w-full lg:w-96 xl:w-[410px] bg-[#091329] border-t lg:border-t-0 lg:border-l border-blue-900/60 flex flex-col shrink-0 lg:h-[540px] xl:h-[580px]">
          {/* Top Widget: Smaller Logo next to text 'Ayudh Vikas' + Golden Lines Mic + AV Radio Button */}
          <div className="bg-gradient-to-b from-[#0b1736] via-[#091228] to-[#070e20] p-3.5 border-b border-blue-900/60 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden shrink-0">
            {/* Subtle glow background */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

            {/* 1. Logo smaller and placed just next to the text: Ayudh Vikas */}
            <div className="flex items-center justify-center gap-2">
              <Logo size="xs" showRing={false} alt="AV News Today" />
              <div className="flex items-center">
                <span className="bg-red-600 text-white font-black text-[10px] px-1.5 py-0.5 rounded-l shadow">
                  AV
                </span>
                <span className="bg-slate-900 text-white font-black text-[10px] px-1.5 py-0.5 rounded-r border border-slate-700 flex items-center gap-0.5">
                  <span>NEWS</span>
                  <span className="text-red-500">TODAY</span>
                </span>
              </div>
              <span className="text-white font-extrabold text-sm tracking-wide drop-shadow">
                Ayudh Vikas
              </span>
            </div>

            {/* 2. Below it: mic image with golden lines no background */}
            <div className="my-1.5 flex items-center justify-center">
              <GoldenMicIcon className="w-14 h-14 drop-shadow-[0_0_12px_rgba(245,158,11,0.45)]" />
            </div>

            {/* 3. Button below it: "AV Radio" -> redirects to AV Radio page */}
            <button
              onClick={() => {
                setActiveCategory('radio');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs px-6 py-2 rounded-full shadow-lg shadow-amber-500/25 cursor-pointer transition-all transform hover:scale-105 active:scale-95 border border-amber-300 tracking-wider uppercase"
              title="Redirect to AV Radio Page"
            >
              <Mic className="w-3.5 h-3.5 text-slate-950" />
              <span>AV Radio</span>
            </button>
            <span className="text-[10px] text-amber-300/80 font-medium mt-1">
              ప్రజా గళం • రికార్డ్ చేసి మీ స్వరాన్ని పంచుకోండి
            </span>
          </div>

          {/* Tabs bar */}
          <div className="flex items-center border-b border-blue-900/60 bg-[#060c1d] text-xs shrink-0">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-2.5 font-bold flex items-center justify-center gap-1.5 cursor-pointer border-b-2 transition-colors ${
                activeTab === 'chat'
                  ? 'border-red-600 text-white bg-blue-950/60'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>LIVE CHAT</span>
            </button>

            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex-1 py-2.5 font-bold flex items-center justify-center gap-1.5 cursor-pointer border-b-2 transition-colors ${
                activeTab === 'schedule'
                  ? 'border-red-600 text-white bg-blue-950/60'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>SCHEDULE</span>
            </button>

            <button
              onClick={() => setActiveTab('channels')}
              className={`flex-1 py-2.5 font-bold flex items-center justify-center gap-1.5 cursor-pointer border-b-2 transition-colors ${
                activeTab === 'channels'
                  ? 'border-red-600 text-white bg-blue-950/60'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>CHANNELS</span>
            </button>

            <button
              onClick={() => setActiveTab('reporter')}
              className={`flex-1 py-2.5 font-bold flex items-center justify-center gap-1.5 cursor-pointer border-b-2 transition-colors ${
                activeTab === 'reporter'
                  ? 'border-red-600 text-white bg-blue-950/60'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5 text-red-400" />
              <span>HOTLINE</span>
            </button>
          </div>

          {/* Tab Content Panel (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[220px]">
            {/* 1. LIVE CHAT */}
            {activeTab === 'chat' && (
              <div className="flex flex-col h-full justify-between space-y-3">
                <div className="space-y-2 overflow-y-auto pr-1 max-h-[230px] lg:max-h-[270px]">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-2 rounded-lg text-xs ${
                        msg.isAnchor
                          ? 'bg-red-950/60 border border-red-500/40 text-red-100'
                          : 'bg-blue-950/40 border border-blue-900/40 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`font-black text-[11px] flex items-center gap-1 ${
                            msg.isAnchor ? 'text-red-400' : 'text-blue-300'
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded-full ${
                              msg.avatarColor || 'bg-blue-600'
                            } text-white flex items-center justify-center text-[9px] font-bold`}
                          >
                            {msg.user.charAt(0)}
                          </span>
                          {msg.user}
                          {msg.isAnchor && (
                            <span className="text-[9px] bg-red-600 text-white px-1 rounded">
                              ANCHOR
                            </span>
                          )}
                          {msg.isVerified && (
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          )}
                        </span>
                        <span className="text-[9px] text-slate-500">{msg.timestamp}</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">{msg.text}</p>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                {/* Quick Phrases */}
                <div className="space-y-2 pt-2 border-t border-blue-900/50 shrink-0">
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                    {quickReactions.map((reaction, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => addChatMessage(reaction, userName || 'Viewer')}
                        className="bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-300 px-2 py-1 rounded border border-slate-700 whitespace-nowrap cursor-pointer transition-colors"
                      >
                        {reaction}
                      </button>
                    ))}
                  </div>

                  {/* Chat Input */}
                  <form onSubmit={handleSendChat} className="space-y-1.5">
                    <input
                      type="text"
                      placeholder="మీ పేరు (Your Name - Optional)"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full bg-[#050b18] border border-blue-900/80 rounded px-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500"
                    />
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder="లైవ్ చాట్ లో కామెంట్ చేయండి..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        className="flex-1 bg-[#050b18] border border-blue-900/80 rounded px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                      />
                      <button
                        type="submit"
                        className="bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center justify-center cursor-pointer transition-colors shadow"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* 2. SCHEDULE / EPG */}
            {activeTab === 'schedule' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="font-bold text-white flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-red-400" />
                    <span>నేటి ప్రసారాల జాబితా (Schedule)</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">24x7 LIVE</span>
                </div>

                {INITIAL_EPG_PROGRAMS.map((item) => (
                  <div
                    key={item.id}
                    className={`p-2 rounded-lg text-xs flex items-center justify-between ${
                      item.isCurrent
                        ? 'bg-red-950/70 border border-red-500 text-white font-bold shadow'
                        : 'bg-blue-950/30 border border-blue-900/30 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-slate-400">{item.time}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-white text-xs">{item.title}</span>
                          {item.isCurrent && (
                            <span className="bg-red-600 text-white text-[8px] font-black px-1 rounded animate-pulse">
                              NOW ON AIR
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">Anchor: {item.host}</span>
                      </div>
                    </div>
                    <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                      {item.category}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* 3. CHANNELS LIST */}
            {activeTab === 'channels' && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-white mb-1">
                  అన్ని ప్రసార ఛానెల్స్ (Select Channel to Watch)
                </div>
                {liveStreams.map((stream) => {
                  const isCur = stream.id === activeLiveStream.id;
                  return (
                    <div
                      key={stream.id}
                      onClick={() => setActiveLiveStream(stream.id)}
                      className={`p-2.5 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-all ${
                        isCur
                          ? 'bg-blue-600/90 text-white font-bold border border-blue-400 shadow-md'
                          : 'bg-blue-950/40 text-slate-300 border border-blue-900/40 hover:bg-blue-900/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center shrink-0 border border-slate-700">
                          <Tv className="w-4 h-4 text-red-400" />
                        </div>
                        <div>
                          <div className="text-white font-bold flex items-center gap-1.5">
                            <span>{stream.channelName}</span>
                            {isCur && (
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">{stream.title}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] bg-black/60 px-1.5 py-0.5 rounded text-amber-400 font-mono">
                          {stream.quality}
                        </span>
                        <div className="text-[9px] text-slate-400 mt-0.5">
                          {stream.viewerCount.toLocaleString()} viewers
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 4. CITIZEN REPORTER HOTLINE */}
            {activeTab === 'reporter' && (
              <div className="space-y-3 text-xs">
                <div className="bg-red-950/60 border border-red-500/40 rounded-lg p-3 text-center space-y-1">
                  <h4 className="font-black text-white text-sm">AV News Today 24x7 ప్రజా ఫిర్యాదుల విభాగం</h4>
                  <p className="text-[11px] text-red-200">
                    మీ ప్రాంత సమస్యలు, అత్యవసర సమాచారాన్ని మా న్యూస్ డెస్క్‌కు పంపండి
                  </p>
                </div>

                <div className="space-y-2">
                  <a
                    href="https://wa.me/919000045073"
                    target="_blank"
                    rel="noreferrer"
                    className="block bg-emerald-600 hover:bg-emerald-500 text-white font-black text-center py-2.5 rounded-lg shadow transition-colors cursor-pointer"
                  >
                    💬 WhatsApp లో సమాచారం పంపండి (90000 45073)
                  </a>

                  <a
                    href="tel:04023456789"
                    className="block bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-center py-2 rounded-lg border border-slate-700 transition-colors"
                  >
                    📞 బ్యూరో డెస్క్ కాల్: 040-23456789
                  </a>
                </div>

                <div className="p-2.5 rounded-lg bg-blue-950/40 border border-blue-900/60 text-[11px] text-slate-300 space-y-1">
                  <div className="font-bold text-amber-300">జర్నలిస్ట్ గుర్తింపు కార్డు ఉన్నదా?</div>
                  <p className="text-[10px] text-slate-400">
                    ఆన్‌లైన్‌లో రిజిస్ట్రేషన్ చేసుకుని AV Life జనరలిస్ట్‌గా వార్తలు పోస్ట్ చేయవచ్చు.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
