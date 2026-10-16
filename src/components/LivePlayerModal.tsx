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

export const LivePlayerModal: React.FC = () => {
  const {
    isLivePlayerOpen,
    setIsLivePlayerOpen,
    setActiveCategory,
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

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, activeTab]);

  // Stream handler for WebRTC Camera / HLS / MP4
  useEffect(() => {
    if (!isLivePlayerOpen) return;
    const video = videoRef.current;
    if (!video) return;

    if (isStudioCameraActive && activeLiveCameraStream) {
      video.srcObject = activeLiveCameraStream;
      video.muted = true; // Avoid audio feedback howling loop on same device while broadcasting
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
  }, [isLivePlayerOpen, activeLiveStream, activeLiveCameraStream, isStudioCameraActive]);

  if (!isLivePlayerOpen) return null;

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
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col overflow-hidden animate-fadeIn">
      {/* Top Header Bar in Blue Theme */}
      <div className="bg-[#071126] border-b border-blue-900/60 px-4 py-2.5 flex items-center justify-between gap-3 shrink-0 shadow-lg">
        {/* Left Info */}
        <div className="flex items-center gap-2.5">
          <Logo size="sm" showRing={true} alt="AV News Today Logo" />
          <div className="flex items-center">
            <span className="bg-red-600 text-white font-black text-xs px-1.5 py-0.5 rounded-l">AV</span>
            <span className="bg-slate-900 text-white font-black text-xs px-2 py-0.5 rounded-r border border-slate-700 flex items-center gap-1">
              <span>NEWS</span>
              <span className="text-red-500">TODAY</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 bg-red-600/90 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full animate-pulse shadow">
              <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
              <span>LIVE</span>
            </span>
            <span className="hidden sm:inline-block text-xs font-bold text-white truncate max-w-md">
              {activeLiveStream.title}
            </span>
            {isStudioCameraActive && (
              <span className="bg-red-500/20 text-red-300 border border-red-500/50 text-[10px] font-bold px-2.5 py-0.5 rounded-full animate-pulse flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                <span>CAMERA ON AIR</span>
              </span>
            )}
          </div>
        </div>

        {/* Channel Switcher Quick Pills */}
        <div className="hidden md:flex items-center gap-1.5">
          {liveStreams.map((stream) => {
            const isCur = stream.id === activeLiveStream.id;
            return (
              <button
                key={stream.id}
                onClick={() => setActiveLiveStream(stream.id)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                  isCur
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                }`}
              >
                {stream.channelName}
              </button>
            );
          })}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-blue-950/80 px-2.5 py-1 rounded-full border border-blue-800/60">
            <Users className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            <span className="font-bold text-white">
              {activeLiveStream.viewerCount.toLocaleString()}
            </span>
            <span className="hidden sm:inline text-slate-400">watching</span>
          </div>

          <button
            onClick={handleShare}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Share Stream"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsLivePlayerOpen(false)}
            className="p-1.5 rounded-full bg-red-600/80 hover:bg-red-500 text-white transition-colors cursor-pointer"
            title="Close Live TV"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {copiedToast && (
        <div className="absolute top-14 right-6 z-50 bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl animate-fadeIn flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" />
          <span>Stream link copied to clipboard!</span>
        </div>
      )}

      {/* Main Broadcast Split View */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left: Video Player Section */}
        <div
          ref={playerContainerRef}
          className="flex-1 flex flex-col bg-black relative justify-center overflow-hidden"
        >
          {/* Video / Embed Screen */}
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
              <YouTubeLivePlayer stream={activeLiveStream} />
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
                <span className="bg-black/40 text-[10px] font-mono px-1.5 py-0.5 rounded">REAL-TIME</span>
              </div>
            )}

            {broadcastSettings.isChannelLogoVisible && (
              <PlayerBranding time={digitalTime} showLive={broadcastSettings.isLiveBadgeVisible} />
            )}

            {/* Quality indicator (Top Left) */}
            <div className="absolute top-4 left-4 z-20 pointer-events-none flex items-center gap-2">
              <span className="bg-black/70 backdrop-blur-sm text-[10px] font-mono font-bold text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
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

          {/* Dual News Tickers on Video Bottom */}
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

        {/* Right: Interactive Sidebar (Chat, EPG Schedule, Channels, Reporter Hotline) */}
        <div className="w-full lg:w-96 bg-[#091329] border-t lg:border-t-0 lg:border-l border-blue-900/60 flex flex-col shrink-0 h-80 lg:h-auto">
          {/* Right Section Top Widget: Smaller Logo next to text 'Ayudh Vikas' + Golden Line Mic + AV Radio Button */}
          <div className="bg-gradient-to-b from-[#0b1736] via-[#091228] to-[#070e20] p-3 border-b border-blue-900/60 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden">
            {/* Subtle glow background */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

            {/* 1. Logo smaller and placed just next to the text: Ayudh Vikas */}
            <div className="flex items-center justify-center gap-2">
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
                setIsLivePlayerOpen(false);
                setActiveCategory('radio');
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
          <div className="flex items-center border-b border-blue-900/60 bg-[#060c1d] text-xs">
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

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {/* 1. LIVE CHAT */}
            {activeTab === 'chat' && (
              <div className="flex flex-col h-full justify-between space-y-3">
                <div className="space-y-2 overflow-y-auto pr-1 max-h-[calc(100vh-280px)]">
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
                <div className="space-y-2 pt-2 border-t border-blue-900/40">
                  <div className="flex flex-wrap gap-1">
                    {quickReactions.map((r, i) => (
                      <button
                        key={i}
                        onClick={() => addChatMessage(r, userName || 'Viewer')}
                        className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700 cursor-pointer"
                      >
                        {r}
                      </button>
                    ))}
                  </div>

                  {/* Input Form */}
                  <form onSubmit={handleSendChat} className="space-y-1.5">
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="మీ పేరు (Name)"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="w-28 bg-slate-900 border border-blue-900/60 rounded px-2 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="సందేశం పంపండి (Message)..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        className="flex-1 bg-slate-900 border border-blue-900/60 rounded px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="submit"
                        className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-xs font-bold flex items-center justify-center cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* 2. EPG SCHEDULE */}
            {activeTab === 'schedule' && (
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>నేటి ప్రత్యక్ష ప్రసారాల షెడ్యూల్ (Today's EPG)</span>
                </div>
                <div className="space-y-1.5">
                  {INITIAL_EPG_PROGRAMS.map((prog) => (
                    <div
                      key={prog.id}
                      className={`p-2 rounded border text-xs ${
                        prog.isCurrent
                          ? 'bg-blue-900/60 border-amber-400/80 shadow-md'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-400">{prog.time}</span>
                        {prog.isCurrent && (
                          <span className="bg-red-600 text-white text-[8px] font-black px-1.5 py-0.2 rounded animate-pulse">
                            ON AIR NOW
                          </span>
                        )}
                      </div>
                      <h5 className="font-bold text-white text-[11px] mt-0.5">{prog.title}</h5>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                        <span>వ్యాఖ్యాత: {prog.host}</span>
                        <span className="text-amber-400">{prog.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. MULTI-CHANNELS */}
            {activeTab === 'channels' && (
              <div className="space-y-2.5">
                <div className="text-[11px] font-bold text-slate-300">
                  లభ్యమైన ప్రత్యక్ష ఛానెల్స్ (Live Feeds):
                </div>
                {liveStreams.map((stream) => {
                  const isCur = stream.id === activeLiveStream.id;
                  return (
                    <div
                      key={stream.id}
                      onClick={() => setActiveLiveStream(stream.id)}
                      className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                        isCur
                          ? 'bg-blue-900/70 border-blue-400 shadow-lg'
                          : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs text-white">{stream.channelName}</span>
                        <span className="text-[10px] font-mono text-emerald-400">
                          {stream.quality}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-200 mt-1 line-clamp-2">{stream.title}</p>
                      <div className="flex items-center justify-between mt-2 text-[10px]">
                        <span className="text-red-400 font-bold">
                          {stream.viewerCount.toLocaleString()} watching
                        </span>
                        {isCur ? (
                          <span className="text-emerald-400 font-bold">● ACTIVE PLAYING</span>
                        ) : (
                          <span className="text-blue-400 font-semibold hover:underline">
                            Switch to this feed →
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 4. REPORTER HOTLINE */}
            {activeTab === 'reporter' && (
              <div className="space-y-3">
                <div className="bg-red-950/70 border border-red-500/50 rounded-lg p-3 text-center space-y-1">
                  <div className="text-xs font-black text-red-400 uppercase tracking-wide">
                    సిటిజన్ జర్నలిస్ట్ హాట్‌లైన్
                  </div>
                  <p className="text-[11px] text-slate-300">
                    మీ పరిసరాల్లోని ప్రజా సమస్యలు, వార్తలు, వీడియోలను మా బ్యూరోకు వాట్సాప్ చేయండి:
                  </p>
                  <a
                    href="https://wa.me/919000045073"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg"
                  >
                    WhatsApp: +91 90000 45073
                  </a>
                </div>

                <div className="bg-blue-950/60 border border-blue-900/50 rounded-lg p-3 space-y-2 text-xs text-slate-300">
                  <div className="font-bold text-white text-xs">AV News Today బ్యూరో ఆఫీసులు:</div>
                  <div>• హైదరాబాద్ ప్రధాన కార్యాలయం: బంజారాహిల్స్, రోడ్ నం. 12</div>
                  <div>• వరంగల్ బ్యూరో: నక్కలగుట్ట, హనుమకొండ</div>
                  <div>• ఢిల్లీ బ్యూరో: ప్రెస్ ఎన్‌క్లేవ్, సాకేత్, న్యూఢిల్లీ</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
