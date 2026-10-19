import { resolveMedia } from '../utils/mediaStore';
import React, { useEffect, useRef, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Filter,
  Headphones,
  Heart,
  MapPin,
  Mic,
  Music,
  Pause,
  Play,
  Radio,
  RotateCcw,
  Search,
  Share2,
  Sliders,
  Sparkles,
  User,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useNews } from '../context/NewsContext';
import { RadioVoice } from '../types';
import { GoldenMicIcon } from './GoldenMicIcon';

export const RadioPage: React.FC = () => {
  const {
    allRadioVoices,
    activePlayingVoice,
    setActivePlayingVoice,
    setIsVoiceAudioPlaying,
    setIsRecordVoiceModalOpen,
    isBackgroundMusicEnabled,
    setIsBackgroundMusicEnabled,
    backgroundMusicVolume,
    setBackgroundMusicVolume,
    setActiveCategory,
  } = useNews();

  // Search & Filter state
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [likedVoices, setLikedVoices] = useState<Record<string, boolean>>({});

  // Audio Player State for Active Voice
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  // Filter approved voices
  const approvedVoices = allRadioVoices.filter((v) => v.status === 'approved');

  const filteredVoices = approvedVoices.filter((v) => {
    const matchesTopic =
      selectedTopic === 'all' ||
      (v.topic && v.topic.toLowerCase().includes(selectedTopic.toLowerCase()));
    const matchesQuery =
      searchQuery === '' ||
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.titleTelugu && v.titleTelugu.toLowerCase().includes(searchQuery.toLowerCase())) ||
      v.userName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTopic && matchesQuery;
  });

  const topicsList = [
    { id: 'all', label: 'అన్నీ (All Voices)' },
    { id: 'ప్రజా గళం', label: 'ప్రజా గళం (Public Voice)' },
    { id: 'సామాజిక', label: 'సామాజిక అంశాలు (Social)' },
    { id: 'రైతు', label: 'రైతు సమస్యలు (Farmers)' },
    { id: 'యువత', label: 'యువత & విద్య (Youth & Tech)' },
    { id: 'సంస్కృతి', label: 'సంస్కృతి & కళలు (Culture)' },
    { id: 'పర్యావరణం', label: 'పర్యావరణం (Environment)' },
  ];

  // Play a voice
  const handlePlayVoice = (voice: RadioVoice) => {
    if (activePlayingVoice?.id === voice.id) {
      if (isPlaying) {
        if (activeAudioRef.current) activeAudioRef.current.pause();
        setIsPlaying(false);
      } else {
        if (activeAudioRef.current) {
          activeAudioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        }
      }
    } else {
      setActivePlayingVoice(voice);
      setIsPlaying(true);
      setCurrentTime(0);
    }
  };

  useEffect(() => () => setActivePlayingVoice(null), []);

  // Sync activeAudioRef when activePlayingVoice changes
  useEffect(() => {
    if (!activePlayingVoice) {
      setIsPlaying(false);
      activeAudioRef.current?.pause();
      return;
    }
    let cancelled = false;
    let objectUrl: string | undefined;
    const audio = activeAudioRef.current;
    resolveMedia(activePlayingVoice.audioUrl).then((url) => {
      if (url.startsWith('blob:')) objectUrl = url;
      if (cancelled || !audio) { if (objectUrl) URL.revokeObjectURL(objectUrl); return; }
      audio.src = url;
      audio.currentTime = 0;
      audio.play().then(() => { if (!cancelled) setIsPlaying(true); }).catch(() => setIsPlaying(false));
    }).catch(() => setIsPlaying(false));
    return () => { cancelled = true; audio?.pause(); if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [activePlayingVoice]);

  const toggleLike = (id: string) => {
    setLikedVoices((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const formatSeconds = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-[1560px] mx-auto px-3 sm:px-4 lg:px-6 py-6 space-y-6">
      {/* Hidden Master Audio Element for Active Voice */}
      <audio
        ref={activeAudioRef}
        onPlay={() => setIsVoiceAudioPlaying(true)}
        onPause={() => setIsVoiceAudioPlaying(false)}
        onTimeUpdate={() => {
          if (activeAudioRef.current) {
            setCurrentTime(activeAudioRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (activeAudioRef.current) {
            setDuration(activeAudioRef.current.duration);
          }
        }}
        onEnded={() => {
          setIsPlaying(false);
          setActivePlayingVoice(null);
        }}
      />

      {/* ========================================================= */}
      {/* HERO BANNER: AV RADIO & GOLDEN MIC */}
      {/* ========================================================= */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#0c1938] via-[#09132b] to-[#060b18] border border-amber-500/40 p-6 sm:p-8 overflow-hidden shadow-2xl">
        {/* Glow Effects */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-10 w-60 h-60 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Left Info & Branding */}
          <div className="space-y-3 text-center lg:text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600/90 to-amber-600/90 text-white text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow">
              <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
              <span>AV RADIO 24x7 • PUBLIC VOICE PLATFORM</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-wide leading-tight">
              ప్రజా గళం... మీ ఆలోచనలు... మీ స్వరం!
            </h1>

            <p className="text-amber-300 font-bold text-sm sm:text-base">
              Voice of the People • Any citizen can record and share their words
            </p>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              మీరు ఏ అంశంపైనైనా మీ అభిప్రాయాలను, సమస్యలను, ఆలోచనలను రికార్డ్ చేసి AV Radio వేదికగా ప్రపంచానికి వినిపించవచ్చు. అడ్మిన్ పరిశీలన తర్వాత మీ స్వరం ఇక్కడ అధికారికంగా ప్రసారమవుతుంది.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={() => setIsRecordVoiceModalOpen(true)}
                className="group inline-flex items-center gap-2.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm px-6 py-3 rounded-full shadow-xl shadow-amber-500/25 cursor-pointer transition-transform hover:scale-105 active:scale-95 border border-amber-300"
              >
                <Mic className="w-4 h-4 text-slate-950" />
                <span>RECORD YOUR VOICE (స్వరం రికార్డ్ చేయండి)</span>
              </button>

              <button
                onClick={() => setActiveCategory('home')}
                className="inline-flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold text-xs px-4 py-3 rounded-full border border-slate-700 cursor-pointer transition-colors"
              >
                <span>Back to Home</span>
              </button>
            </div>
          </div>

          {/* Right: Golden Mic Graphic Display */}
          <div className="flex flex-col items-center justify-center shrink-0">
            <div className="relative p-5 rounded-2xl bg-gradient-to-b from-blue-950/40 to-black/60 border border-amber-500/30 flex flex-col items-center shadow-inner">
              {/* Golden line microphone with no background */}
              <GoldenMicIcon className="w-24 h-24 sm:w-28 sm:h-28 drop-shadow-[0_0_24px_rgba(245,158,11,0.5)]" />

              <div className="mt-2 text-center">
                <span className="text-xs font-black text-amber-400 tracking-wider">
                  AV RADIO ON AIR
                </span>
                <p className="text-[10px] text-slate-400">
                  A Unit of Ayudh Vikas Foundation
                </p>
              </div>

              {/* Slow Background Music Controls Strip */}
              <div className="mt-3 w-full bg-[#060b18]/80 rounded-xl p-2.5 border border-amber-500/20 text-left space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-amber-300 flex items-center gap-1">
                    <Music className="w-3 h-3 text-amber-400" />
                    <span>Slow Background Music</span>
                  </span>
                  <button
                    onClick={() => setIsBackgroundMusicEnabled(!isBackgroundMusicEnabled)}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-black cursor-pointer transition-colors ${
                      isBackgroundMusicEnabled
                        ? 'bg-amber-400 text-black'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isBackgroundMusicEnabled ? 'ON' : 'OFF'}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <Volume2 className="w-3 h-3 text-slate-400 shrink-0" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={backgroundMusicVolume}
                    onChange={(e) => setBackgroundMusicVolume(parseFloat(e.target.value))}
                    className="w-full accent-amber-400 h-1 bg-slate-700 rounded cursor-pointer"
                    title={`Background music volume: ${Math.round(backgroundMusicVolume * 100)}%`}
                  />
                  <span className="text-[9px] font-mono text-amber-400 shrink-0">
                    {Math.round(backgroundMusicVolume * 100)}%
                  </span>
                </div>
                <p className="text-[9px] text-slate-400 leading-none">
                  (వాయిస్ ప్లే అయినప్పుడు స్వల్ప శబ్దంతో ఆహ్లాదకర సంగీతం ప్లే అవుతుంది)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* FILTER & SEARCH BAR */}
      {/* ========================================================= */}
      <div className="bg-[#0b152d] border border-blue-900/60 rounded-xl p-3.5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Topic Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none pb-1 md:pb-0">
          {topicsList.map((t) => {
            const isSelected = selectedTopic === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTopic(t.id)}
                className={`text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                    : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64 shrink-0">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="వాయిస్ శీర్షికను వెతకండి..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#070e20] border border-blue-900/80 rounded-full pl-9 pr-3.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* ========================================================= */}
      {/* APPROVED VOICES GRID (Modern, Stylish Cards) */}
      {/* ========================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-amber-500 rounded-sm"></span>
            <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
              ప్రజా స్వరం రికార్డింగ్‌లు (COMMUNITY VOICE BROADCASTS)
            </h2>
            <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/40">
              {filteredVoices.length} Voices
            </span>
          </div>

          <button
            onClick={() => setIsRecordVoiceModalOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shadow cursor-pointer transition-transform hover:scale-105"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>+ RECORD YOUR VOICE</span>
          </button>
        </div>

        {filteredVoices.length === 0 ? (
          <div className="bg-[#0b152d] border border-blue-900/50 rounded-xl p-10 text-center space-y-3">
            <GoldenMicIcon className="w-16 h-16 mx-auto opacity-40" />
            <h3 className="text-sm font-bold text-slate-300">
              ఈ విభాగంలో రికార్డింగ్‌లు కనుగొనబడలేదు (No voices found in this category).
            </h3>
            <p className="text-xs text-slate-400">
              మీరే మొదటి స్వరాన్ని రికార్డ్ చేసి పంపించండి!
            </p>
            <button
              onClick={() => setIsRecordVoiceModalOpen(true)}
              className="mt-2 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs px-4 py-2 rounded-full cursor-pointer"
            >
              Start Recording Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVoices.map((voice) => {
              const isThisPlaying = activePlayingVoice?.id === voice.id && isPlaying;
              const isLiked = Boolean(likedVoices[voice.id]);

              return (
                <div
                  key={voice.id}
                  className={`relative rounded-2xl p-4.5 transition-all shadow-xl flex flex-col justify-between space-y-3.5 overflow-hidden ${
                    isThisPlaying
                      ? 'bg-gradient-to-b from-[#102450] via-[#091533] to-[#070e20] border-2 border-amber-400 shadow-amber-500/20 scale-[1.01]'
                      : 'bg-[#091329] border border-blue-900/60 hover:border-amber-500/40 hover:bg-[#0c1836]'
                  }`}
                >
                  {/* Playing Ambient Glow */}
                  {isThisPlaying && (
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none"></div>
                  )}

                  {/* Card Header: Topic & Time */}
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="bg-amber-500/15 border border-amber-500/30 text-amber-300 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider text-[10px]">
                      {voice.topic || 'ప్రజా గళం'}
                    </span>
                    <span className="text-slate-400 font-medium">{voice.submittedAt}</span>
                  </div>

                  {/* Text Name / Title of the Voice */}
                  <div className="space-y-1">
                    <h3
                      onClick={() => handlePlayVoice(voice)}
                      className={`text-sm sm:text-base font-black leading-snug cursor-pointer line-clamp-2 transition-colors ${
                        isThisPlaying ? 'text-amber-300' : 'text-white hover:text-amber-200'
                      }`}
                    >
                      {voice.titleTelugu || voice.title}
                    </h3>
                    {voice.titleTelugu && voice.titleTelugu !== voice.title && (
                      <p className="text-xs text-slate-400 line-clamp-1 italic">
                        {voice.title}
                      </p>
                    )}
                  </div>

                  {/* Audio Player Controls Box */}
                  <div className="bg-[#050a17] border border-blue-900/70 rounded-xl p-3 flex items-center gap-3 shadow-inner">
                    <button
                      onClick={() => handlePlayVoice(voice)}
                      className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 shadow-lg cursor-pointer transition-transform hover:scale-105 active:scale-95 ${
                        isThisPlaying
                          ? 'bg-gradient-to-tr from-amber-400 to-amber-300 text-black'
                          : 'bg-red-600 hover:bg-red-500 text-white'
                      }`}
                      title={isThisPlaying ? 'Pause Voice' : 'Play Voice'}
                    >
                      {isThisPlaying ? (
                        <Pause className="w-5 h-5 fill-black" />
                      ) : (
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1">
                        <span>{isThisPlaying ? formatSeconds(currentTime) : '00:00'}</span>
                        <span className="text-amber-400 font-bold">
                          {voice.duration || '01:20'}
                        </span>
                      </div>

                      {/* Animated Soundwave or static waveform */}
                      {isThisPlaying ? (
                        <div className="flex items-center gap-1 h-3.5 overflow-hidden">
                          <span className="w-1 h-2 bg-amber-400 rounded-full animate-bounce"></span>
                          <span className="w-1 h-3 bg-red-500 rounded-full animate-pulse"></span>
                          <span className="w-1 h-3.5 bg-amber-300 rounded-full animate-bounce"></span>
                          <span className="w-1 h-2 bg-red-400 rounded-full animate-pulse"></span>
                          <span className="w-1 h-3 bg-amber-400 rounded-full animate-bounce"></span>
                          <span className="w-1 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                          <span className="w-1 h-3 bg-amber-300 rounded-full animate-bounce"></span>
                          <span className="w-1 h-2.5 bg-red-400 rounded-full animate-pulse"></span>
                          <span className="w-1 h-3.5 bg-amber-400 rounded-full animate-bounce"></span>
                          <span className="w-1 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 h-2 opacity-50">
                          <span className="w-1 h-1.5 bg-slate-500 rounded-full"></span>
                          <span className="w-1 h-2 bg-slate-400 rounded-full"></span>
                          <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
                          <span className="w-1 h-2 bg-slate-400 rounded-full"></span>
                          <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
                          <span className="w-1 h-2 bg-slate-400 rounded-full"></span>
                          <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
                          <span className="w-1 h-1.5 bg-slate-500 rounded-full"></span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer: Speaker Info & Social */}
                  <div className="pt-2 border-t border-blue-900/40 flex items-center justify-between text-xs text-slate-300">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-blue-950 border border-blue-700/60 flex items-center justify-center shrink-0">
                        <User className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <div className="truncate">
                        <p className="font-bold text-white text-[11px] truncate">
                          {voice.userName}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5 text-red-400" />
                          <span>{voice.userCity || 'Telangana'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleLike(voice.id)}
                        className={`p-1.5 rounded-lg flex items-center gap-1 text-[11px] font-bold cursor-pointer transition-colors ${
                          isLiked
                            ? 'text-rose-400 bg-rose-950/40'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                        title="Applaud Voice"
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`}
                        />
                        <span>{(voice.likes || 0) + (isLiked ? 1 : 0)}</span>
                      </button>

                      <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                        <Headphones className="w-3 h-3 text-slate-500" />
                        <span>{voice.listens || 450}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* FLOATING AUDIO CONTROLLER (When Voice is Playing) */}
      {/* ========================================================= */}
      {activePlayingVoice && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-[480px] z-40 bg-[#091533]/95 backdrop-blur-md border-2 border-amber-400 rounded-2xl p-4 shadow-2xl animate-fadeIn">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
                NOW PLAYING ON AV RADIO
              </span>
            </div>
            <button
              onClick={() => {
                if (activeAudioRef.current) activeAudioRef.current.pause();
                setActivePlayingVoice(null);
                setIsPlaying(false);
              }}
              className="text-slate-400 hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (!activeAudioRef.current) return;
                if (isPlaying) {
                  activeAudioRef.current.pause();
                  setIsPlaying(false);
                } else {
                  activeAudioRef.current.play().then(() => setIsPlaying(true));
                }
              }}
              className="w-10 h-10 rounded-full bg-amber-400 text-black flex items-center justify-center shrink-0 shadow hover:scale-105 cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-black" />
              ) : (
                <Play className="w-4 h-4 fill-black ml-0.5" />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-black text-white truncate">
                {activePlayingVoice.titleTelugu || activePlayingVoice.title}
              </h4>
              <p className="text-[10px] text-slate-300 truncate">
                {activePlayingVoice.userName} • {activePlayingVoice.userCity}
              </p>

              <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono mt-1">
                <span>{formatSeconds(currentTime)}</span>
                <span>{formatSeconds(duration || 60)}</span>
              </div>
              <input
                type="range"
                min="0"
                max={duration || 60}
                value={currentTime}
                onChange={(e) => {
                  const t = parseFloat(e.target.value);
                  setCurrentTime(t);
                  if (activeAudioRef.current) activeAudioRef.current.currentTime = t;
                }}
                className="w-full accent-amber-400 h-1 bg-slate-700 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Background Ambient Music Indicator */}
          <div className="mt-2.5 pt-2 border-t border-blue-900/60 flex items-center justify-between text-[10px]">
            <span className="text-amber-300 font-medium flex items-center gap-1.5">
              <Music className="w-3 h-3 text-amber-400 animate-pulse" />
              <span>Slow Ambient BGM: Active ({Math.round(backgroundMusicVolume * 100)}%)</span>
            </span>
            <button
              onClick={() => setIsBackgroundMusicEnabled(!isBackgroundMusicEnabled)}
              className="text-[9px] text-slate-400 hover:text-white underline cursor-pointer"
            >
              {isBackgroundMusicEnabled ? 'Mute BGM' : 'Unmute BGM'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
