import React, { useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Globe,
  IdCard,
  LogIn,
  LogOut,
  Mic,
  PlusCircle,
  Radio,
  Search,
  Settings,
  ShieldCheck,
  User,
  Volume2,
  X,
} from 'lucide-react';
import { useNews } from '../context/NewsContext';
import { Logo } from './Logo';

export const Navbar: React.FC = () => {
  const {
    activeCategory,
    setActiveCategory,
    setIsLivePlayerOpen,
    setIsAdminOpen,
    tickers,
    searchQuery,
    setSearchQuery,
    setSelectedLocation,
    currentUser,
    logoutJournalist,
    setIsAuthModalOpen,
    setAuthModalMode,
    setIsProfileModalOpen,
    setIsMyNewsModalOpen,
    setIsUploadNewsModalOpen,
  } = useNews();

  const [currentTickerIdx, setCurrentTickerIdx] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Auto-advance ticker
  useEffect(() => {
    if (tickers.length === 0) return;
    const interval = setInterval(() => {
      setCurrentTickerIdx((prev) => (prev + 1) % tickers.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [tickers.length]);

  const nextTicker = () => {
    setCurrentTickerIdx((prev) => (prev + 1) % tickers.length);
  };

  const prevTicker = () => {
    setCurrentTickerIdx((prev) => (prev - 1 + tickers.length) % tickers.length);
  };

  const navItems = [
    { id: 'home', label: 'HOME' },
    { id: 'live-news', label: 'LIVE NEWS', isLiveTrigger: true },
    { id: 'radio', label: '🎙️ AV RADIO' },
    { id: 'breaking', label: 'BREAKING NEWS' },
    { id: 'telangana', label: 'TELANGANA' },
    { id: 'national', label: 'NATIONAL' },
    { id: 'politics', label: 'POLITICS' },
    { id: 'crime', label: 'CRIME' },
    { id: 'business', label: 'BUSINESS' },
    { id: 'sports', label: 'SPORTS' },
    { id: 'cinema', label: 'CINEMA' },
    { id: 'health', label: 'HEALTH' },
    { id: 'social', label: 'SOCIAL' },
    { id: 'contact', label: 'CONTACT' },
  ];

  const handleNavClick = (id: string, isLiveTrigger?: boolean) => {
    setSelectedLocation(null);
    if (isLiveTrigger) {
      if (activeCategory !== 'home') {
        setActiveCategory('home');
      }
      setTimeout(() => {
        document.getElementById('live-broadcast-screen')?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
      return;
    }
    setActiveCategory(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-[#060b18] border-b border-blue-900/40 shadow-2xl">
      {/* Top Main Branding Bar */}
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand Identity */}
        <button
          type="button"
          onClick={() => handleNavClick('home')}
          aria-label="AV News Today home"
          className="flex items-center gap-4 cursor-pointer group select-none text-left shrink-0 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-400"
        >
          <Logo
            size="custom"
            showRing={false}
            className="w-36 h-18 sm:w-48 sm:h-24 transition-transform duration-200 group-hover:scale-[1.02]"
          />

          {/* Sub Tagline */}
          <div className="hidden xl:flex flex-col text-[11px] font-semibold text-slate-400 leading-tight">
            <span className="tracking-widest uppercase text-slate-300 font-bold">
              NEWS • TELANGANA • INDIA • WORLD
            </span>
            <span className="text-[10px] text-red-400 font-medium">
              Ayudh Vikas Foundation Digital Network
            </span>
          </div>
        </button>

        {/* Right Action Items */}
        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3 ml-auto">
          {/* Search Trigger */}
          <div className="relative">
            {isSearchOpen ? (
              <div className="flex items-center bg-slate-900 border border-blue-500/60 rounded-full px-3 py-1 shadow-lg animate-fadeIn">
                <Search className="w-3.5 h-3.5 text-blue-400 mr-2" />
                <input
                  type="text"
                  placeholder="వార్తలను వెతకండి (Search)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="bg-transparent border-none text-xs text-white placeholder-slate-400 focus:outline-none w-36 sm:w-56"
                />
                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="text-slate-400 hover:text-white ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Search News"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Social Icons */}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-300">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider mr-1">FOLLOW US:</span>
            {/* YouTube */}
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              className="w-6 h-6 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center transition-transform hover:scale-110 shadow-sm"
              title="YouTube"
            >
              <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
            {/* Facebook */}
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              className="w-6 h-6 rounded-full bg-[#1877F2] hover:bg-blue-600 text-white flex items-center justify-center transition-transform hover:scale-110 shadow-sm"
              title="Facebook"
            >
              <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-600 hover:opacity-90 text-white flex items-center justify-center transition-transform hover:scale-110 shadow-sm"
              title="Instagram"
            >
              <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
          </div>

          {/* Journalist Sign In / Profile Section */}
          {currentUser ? (
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => setIsUploadNewsModalOpen(true)}
                className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black px-3 py-1.5 rounded-lg text-[11px] shadow cursor-pointer transition-transform hover:scale-105"
                title="Post new ground report or article"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ UPLOAD NEWS</span>
              </button>

              <button
                onClick={() => setIsMyNewsModalOpen(true)}
                className="hidden md:flex items-center gap-1 bg-blue-950/80 hover:bg-blue-900 border border-blue-600/50 text-blue-200 px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer"
                title="My submitted news"
              >
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span>MY NEWS</span>
              </button>

              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="flex items-center gap-2 bg-[#091329] hover:bg-slate-800 border border-amber-500/50 px-2 py-1 rounded-lg cursor-pointer transition-all"
                title="View Press Accreditation ID Card"
              >
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.fullName}
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
                  }}
                  className="w-6 h-6 rounded-full object-cover border border-amber-400"
                />
                <div className="hidden xl:flex flex-col text-left leading-none">
                  <span className="text-[11px] font-black text-white truncate max-w-[100px]">
                    {currentUser.fullName}
                  </span>
                  <span className="text-[9px] font-mono text-amber-300">PRESS ID</span>
                </div>
                <IdCard className="w-3.5 h-3.5 text-amber-400 xl:hidden" />
              </button>
              <button
                type="button"
                onClick={logoutJournalist}
                className="flex items-center gap-1.5 border border-red-500/40 bg-red-950/40 hover:bg-red-900/60 text-red-200 px-2.5 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
                title="Log out of journalist account"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>LOGOUT</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setAuthModalMode('login');
                setIsAuthModalOpen(true);
              }}
              className="flex items-center gap-1.5 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 text-white font-bold px-3 py-1.5 rounded-lg text-[11px] shadow cursor-pointer transition-colors"
              title="Journalist Sign In or Register with Govt Proof"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>LOGIN</span>
            </button>
          )}

          {/* Admin Control Portal Button */}
          <button
            onClick={() => setIsAdminOpen(true)}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-blue-300 hover:text-white border border-blue-500/30 px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors"
            title="Admin Control Studio"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">ADMIN</span>
          </button>

          {/* AV Radio Header Button */}
          <button
            onClick={() => {
              setActiveCategory('radio');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black cursor-pointer transition-all border ${
              activeCategory === 'radio'
                ? 'bg-amber-400 text-black border-amber-300 shadow-lg shadow-amber-500/20'
                : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/40'
            }`}
            title="Listen & Share Voice on AV Radio"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>AV RADIO</span>
          </button>

          {/* Prominent Red pulsating ((•)) LIVE Button */}
          {!currentUser && (
            <button
              onClick={() => {
                if (activeCategory !== 'home') {
                  setActiveCategory('home');
                }
                setTimeout(() => {
                  document.getElementById('live-broadcast-screen')?.scrollIntoView({ behavior: 'smooth' });
                }, 50);
              }}
              className="group relative flex items-center gap-2 bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-red-600 text-white font-black px-4 py-1.5 rounded-full text-xs tracking-wider shadow-lg shadow-red-600/50 cursor-pointer transition-all hover:scale-105 active:scale-95"
              title="Watch Live Broadcast Directly on Home Page"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
              </span>
              <span>((•)) LIVE</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Menu Bar */}
      <div className="bg-[#0b152d] border-t border-b border-blue-900/50 overflow-x-auto scrollbar-none">
        <div className="max-w-[1440px] mx-auto px-3 flex items-center gap-0.5 sm:gap-1 text-xs whitespace-nowrap">
          {navItems.map((item) => {
            const isActive = activeCategory === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id, item.isLiveTrigger)}
                className={`px-3 py-2 text-[12px] font-bold tracking-wide transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-slate-200 hover:text-white hover:bg-blue-900/40'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Breaking News Ticker Bar */}
      <div className="bg-[#080f22] border-b border-blue-950/80 text-xs">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6 py-1.5 flex items-center justify-between gap-3">
          {/* Left Breadcrumb Tag */}
          <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-bold text-amber-400 shrink-0">
            <span>HOME</span>
            <span className="text-slate-500">&gt;</span>
            <span className="uppercase text-slate-300">
              {activeCategory === 'home' ? 'PAGE 1' : activeCategory}
            </span>
          </div>

          {/* Center Red Breaking News Label + Scrolling Text */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="flex items-center gap-1 bg-red-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded shadow-sm shrink-0 tracking-wider">
              <Volume2 className="w-3.5 h-3.5 animate-bounce" />
              <span>BREAKING NEWS</span>
            </div>

            {/* Cycling headline */}
            <div className="overflow-hidden relative flex-1">
              <div
                key={currentTickerIdx}
                className="text-slate-200 text-xs font-semibold truncate animate-fadeIn flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                <span>{tickers[currentTickerIdx] || 'AV News Today 24x7 తాజా వార్తలు'}</span>
              </div>
            </div>
          </div>

          {/* Prev / Next controls */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={prevTicker}
              className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
              title="Previous Headline"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={nextTicker}
              className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
              title="Next Headline"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
