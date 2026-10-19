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
  } = useNews();

  const [activeTab, setActiveTab] = useState<'chat' | 'schedule' | 'channels' | 'reporter'>('chat');
  const [chatInput, setChatInput] = useState('');
  const [userName, setUserName] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const isStudioCameraActive = activeLiveStream.streamType === 'webrtc';

  // Auto-scroll chat when messages update
  useEffect(() => {
    const messages = chatEndRef.current?.parentElement;
    if (messages) messages.scrollTop = messages.scrollHeight;
  }, [chatMessages, activeTab]);


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
      <div className="grid grid-cols-1 lg:grid-cols-12 items-start overflow-hidden">
        {/* ========================================================= */}
        {/* LEFT: VIDEO PLAYER SECTION */}
        {/* ========================================================= */}
        <div ref={playerContainerRef} className="min-w-0 lg:col-span-8 bg-black self-start">
          <BroadcastCanvas suspended={isLivePlayerOpen} />
        </div>

        {/* ========================================================= */}
        {/* RIGHT SECTION OF LIVE SCREEN: AYUDH VIKAS, GOLDEN MIC, AV RADIO, TABS */}
        {/* ========================================================= */}
        <div className="w-full min-w-0 lg:col-span-4 bg-[#091329] border-t lg:border-t-0 lg:border-l border-blue-900/60 flex flex-col shrink-0 lg:max-h-[850px]">
          <FoundationUtilityDeck />

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
            {activeTab === 'schedule' && <BroadcastScheduleRail />}

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
