import { BroadcastCanvas } from './BroadcastCanvas';
import { BroadcastScheduleRail } from './BroadcastScheduler';
import { FoundationUtilityDeck } from './FoundationUtilityDeck';
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
import { useNews } from '../context/NewsContext';
import { Logo } from './Logo';

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
  } = useNews();

  const [activeTab, setActiveTab] = useState<'chat' | 'schedule' | 'channels' | 'reporter'>('chat');
  const [chatInput, setChatInput] = useState('');
  const [userName, setUserName] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const isStudioCameraActive = activeLiveStream.streamType === 'webrtc';

  // Auto-scroll chat
  useEffect(() => {
    const messages = chatEndRef.current?.parentElement;
    if (messages) messages.scrollTop = messages.scrollHeight;
  }, [chatMessages, activeTab]);

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
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto">
        {/* Left: Video Player Section */}
        <div ref={playerContainerRef} className="min-w-0 lg:col-span-8 bg-black self-start">
          <BroadcastCanvas />
        </div>

        {/* Right: Interactive Sidebar (Chat, EPG Schedule, Channels, Reporter Hotline) */}
        <div className="w-full min-w-0 lg:col-span-4 bg-[#091329] border-t lg:border-t-0 lg:border-l border-blue-900/60 flex flex-col shrink-0 min-h-0">
          <FoundationUtilityDeck />
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
            {activeTab === 'schedule' && <BroadcastScheduleRail />}

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
