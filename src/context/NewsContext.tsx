import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  INITIAL_BROADCAST_SETTINGS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_JOURNALIST_NEWS,
  INITIAL_JOURNALISTS,
  INITIAL_LIVE_STREAMS,
  INITIAL_POLL,
  INITIAL_RADIO_VOICES,
  INITIAL_TICKERS,
  INITIAL_VIDEOS,
} from '../data/initialData';
import {
  BroadcastSettings,
  ChatMessage,
  JournalistNewsSubmission,
  JournalistUser,
  LiveStreamConfig,
  NewsCategory,
  PollData,
  RadioVoice,
  VideoItem,
} from '../types';

interface NewsContextType {
  // Videos
  videos: VideoItem[];
  addVideo: (video: Omit<VideoItem, 'id' | 'views' | 'uploadedAt'>) => void;
  updateVideo: (id: string, updates: Partial<VideoItem>) => void;
  deleteVideo: (id: string) => void;

  // Live Streams
  liveStreams: LiveStreamConfig[];
  activeLiveStream: LiveStreamConfig;
  setActiveLiveStream: (id: string) => void;
  updateLiveStream: (id: string, updates: Partial<LiveStreamConfig>) => void;
  addLiveStream: (stream: Omit<LiveStreamConfig, 'id'>) => void;
  deleteLiveStream: (id: string) => void;

  // Broadcast & Overlays
  broadcastSettings: BroadcastSettings;
  updateBroadcastSettings: (updates: Partial<BroadcastSettings>) => void;

  // Tickers
  tickers: string[];
  addTicker: (text: string) => void;
  removeTicker: (index: number) => void;

  // Poll
  poll: PollData;
  votePoll: (optionId: string) => void;
  updatePollQuestion: (question: string, options: string[]) => void;

  // Live Chat
  chatMessages: ChatMessage[];
  addChatMessage: (text: string, user?: string) => void;

  // Navigation & Active View
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  selectedVideo: VideoItem | null;
  setSelectedVideo: (video: VideoItem | null) => void;
  selectedLocation: string | null;
  setSelectedLocation: (loc: string | null) => void;

  // Modals & Overlays
  isLivePlayerOpen: boolean;
  setIsLivePlayerOpen: (open: boolean) => void;
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  isEpaperOpen: boolean;
  setIsEpaperOpen: (open: boolean) => void;
  isEditorialOpen: boolean;
  setIsEditorialOpen: (open: boolean) => void;
  isPhotosOpen: boolean;
  setIsPhotosOpen: (open: boolean) => void;
  isContactOpen: boolean;
  setIsContactOpen: (open: boolean) => void;

  // Journalist & Member Auth
  currentUser: JournalistUser | null;
  allJournalists: JournalistUser[];
  registerJournalist: (
    data: Omit<JournalistUser, 'id' | 'journalistId' | 'status' | 'appliedAt' | 'qrCodeData'>
  ) => { success: boolean; message: string };
  loginJournalist: (
    email: string,
    password: string
  ) => { success: boolean; message: string; user?: JournalistUser };
  logoutJournalist: () => void;
  updateJournalistStatus: (
    userId: string,
    status: 'approved' | 'rejected',
    notes?: string
  ) => void;

  // Journalist News Submissions & Verification Desk
  allNewsSubmissions: JournalistNewsSubmission[];
  submitNews: (
    submission: Omit<
      JournalistNewsSubmission,
      'id' | 'status' | 'submittedAt' | 'views'
    >
  ) => { success: boolean; message: string; submissionId?: string };
  verifyAndApproveNews: (
    submissionId: string,
    assignedCategory?: NewsCategory | 'all',
    feedback?: string
  ) => void;
  rejectNews: (submissionId: string, feedback?: string) => void;

  // Article Reader Modal
  selectedArticle: JournalistNewsSubmission | null;
  setSelectedArticle: (article: JournalistNewsSubmission | null) => void;

  // Auth & Journalist Modals
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'register';
  setAuthModalMode: (mode: 'login' | 'register') => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  isMyNewsModalOpen: boolean;
  setIsMyNewsModalOpen: (open: boolean) => void;
  isUploadNewsModalOpen: boolean;
  setIsUploadNewsModalOpen: (open: boolean) => void;

  // Live Camera Real-time Broadcast
  activeLiveCameraStream: MediaStream | null;
  isCameraBroadcasting: boolean;
  startLiveCameraBroadcast: (stream: MediaStream) => void;
  stopLiveCameraBroadcast: (blobUrl?: string) => void;

  // Radio Audio & AV Radio Platform
  isRadioPlaying: boolean;
  setIsRadioPlaying: (playing: boolean) => void;
  toggleRadio: () => void;

  // AV Radio Voice Submissions & Concept
  allRadioVoices: RadioVoice[];
  activePlayingVoice: RadioVoice | null;
  setActivePlayingVoice: (voice: RadioVoice | null) => void;
  isRecordVoiceModalOpen: boolean;
  setIsRecordVoiceModalOpen: (open: boolean) => void;
  submitRadioVoice: (data: {
    title: string;
    titleTelugu?: string;
    audioUrl: string;
    duration: string;
    durationSeconds?: number;
    userName?: string;
    userRole?: string;
    userCity?: string;
    topic?: string;
  }) => { success: boolean; message: string; voice?: RadioVoice };
  approveRadioVoice: (id: string) => void;
  rejectRadioVoice: (id: string, reason?: string) => void;
  deleteRadioVoice: (id: string) => void;
  updateRadioVoiceTitle: (id: string, newTitle: string, newTitleTelugu?: string) => void;

  // Slow Background Music for AV Radio (default low volume)
  isBackgroundMusicEnabled: boolean;
  setIsBackgroundMusicEnabled: (enabled: boolean) => void;
  backgroundMusicVolume: number;
  setBackgroundMusicVolume: (volume: number) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Reset Data
  resetToInitialData: () => void;
}

const STORAGE_KEYS = {
  VIDEOS: 'av_news_videos_v1',
  LIVE_STREAMS: 'av_news_live_streams_v1',
  SETTINGS: 'av_news_settings_v1',
  TICKERS: 'av_news_tickers_v1',
  POLL: 'av_news_poll_v1',
  CHAT: 'av_news_chat_v1',
  JOURNALISTS: 'av_news_journalists_v1',
  SUBMISSIONS: 'av_news_submissions_v1',
  CURRENT_USER: 'av_news_current_user_v1',
  RADIO_VOICES: 'av_news_radio_voices_v1',
};

const NewsContext = createContext<NewsContextType | undefined>(undefined);

export const NewsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Videos
  const [videos, setVideos] = useState<VideoItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VIDEOS);
      return saved ? JSON.parse(saved) : INITIAL_VIDEOS;
    } catch {
      return INITIAL_VIDEOS;
    }
  });

  // 2. Live Streams
  const [liveStreams, setLiveStreams] = useState<LiveStreamConfig[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LIVE_STREAMS);
      const streams: LiveStreamConfig[] = saved ? JSON.parse(saved) : INITIAL_LIVE_STREAMS;
      const loop = INITIAL_LIVE_STREAMS[0];
      // Activate the requested queue once for existing installations, preserving saved feeds.
      return streams.some((stream) => stream.id === loop.id)
        ? streams
        : [loop, ...streams.map((stream) => ({ ...stream, isActive: false }))];
    } catch {
      return INITIAL_LIVE_STREAMS;
    }
  });

  // 3. Settings
  const [broadcastSettings, setBroadcastSettings] = useState<BroadcastSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : INITIAL_BROADCAST_SETTINGS;
    } catch {
      return INITIAL_BROADCAST_SETTINGS;
    }
  });

  // 4. Tickers
  const [tickers, setTickers] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TICKERS);
      return saved ? JSON.parse(saved) : INITIAL_TICKERS;
    } catch {
      return INITIAL_TICKERS;
    }
  });

  // 5. Poll
  const [poll, setPoll] = useState<PollData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.POLL);
      return saved ? JSON.parse(saved) : INITIAL_POLL;
    } catch {
      return INITIAL_POLL;
    }
  });

  // 6. Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CHAT);
      return saved ? JSON.parse(saved) : INITIAL_CHAT_MESSAGES;
    } catch {
      return INITIAL_CHAT_MESSAGES;
    }
  });

  // Navigation State
  const [activeCategory, setActiveCategory] = useState<string>('home');
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  // Modals
  const [isLivePlayerOpen, setIsLivePlayerOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isEpaperOpen, setIsEpaperOpen] = useState<boolean>(false);
  const [isEditorialOpen, setIsEditorialOpen] = useState<boolean>(false);
  const [isPhotosOpen, setIsPhotosOpen] = useState<boolean>(false);
  const [isContactOpen, setIsContactOpen] = useState<boolean>(false);

  // Journalist & Member Auth State
  const [allJournalists, setAllJournalists] = useState<JournalistUser[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.JOURNALISTS);
      return saved ? JSON.parse(saved) : INITIAL_JOURNALISTS;
    } catch {
      return INITIAL_JOURNALISTS;
    }
  });

  // Each page load starts signed out; only a successful login sets the user.
  const [currentUser, setCurrentUser] = useState<JournalistUser | null>(null);

  // Journalist News Submissions State
  const [allNewsSubmissions, setAllNewsSubmissions] = useState<JournalistNewsSubmission[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
      return saved ? JSON.parse(saved) : INITIAL_JOURNALIST_NEWS;
    } catch {
      return INITIAL_JOURNALIST_NEWS;
    }
  });

  // Additional Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isMyNewsModalOpen, setIsMyNewsModalOpen] = useState<boolean>(false);
  const [isUploadNewsModalOpen, setIsUploadNewsModalOpen] = useState<boolean>(false);
  const [selectedArticle, setSelectedArticle] = useState<JournalistNewsSubmission | null>(null);

  // Live Camera state
  const [activeLiveCameraStream, setActiveLiveCameraStream] = useState<MediaStream | null>(null);
  const [isCameraBroadcasting, setIsCameraBroadcasting] = useState<boolean>(false);

  // Radio audio playback
  const [isRadioPlaying, setIsRadioPlaying] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 9. AV Radio Voices & Recording
  const [allRadioVoices, setAllRadioVoices] = useState<RadioVoice[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RADIO_VOICES);
      return saved ? JSON.parse(saved) : INITIAL_RADIO_VOICES;
    } catch {
      return INITIAL_RADIO_VOICES;
    }
  });
  const [activePlayingVoice, setActivePlayingVoice] = useState<RadioVoice | null>(null);
  const [isRecordVoiceModalOpen, setIsRecordVoiceModalOpen] = useState<boolean>(false);
  const [isBackgroundMusicEnabled, setIsBackgroundMusicEnabled] = useState<boolean>(true);
  const [backgroundMusicVolume, setBackgroundMusicVolume] = useState<number>(0.15); // default 15% low volume

  const bgMusicAudioRef = useRef<HTMLAudioElement | null>(null);
  const synthAudioCtxRef = useRef<AudioContext | null>(null);
  const synthNodesRef = useRef<any[]>([]);

  // Initialize and manage slow background music for AV Radio
  useEffect(() => {
    try {
      const audio = new Audio(
        'https://assets.mixkit.co/music/preview/mixkit-relaxing-in-nature-522.mp3'
      );
      audio.loop = true;
      audio.volume = backgroundMusicVolume;
      bgMusicAudioRef.current = audio;
    } catch (e) {
      console.warn('Audio element error', e);
    }

    return () => {
      if (bgMusicAudioRef.current) {
        bgMusicAudioRef.current.pause();
        bgMusicAudioRef.current = null;
      }
      stopSynthAmbient();
    };
  }, []);

  useEffect(() => {
    if (bgMusicAudioRef.current) {
      bgMusicAudioRef.current.volume = Math.max(0, Math.min(1, backgroundMusicVolume));
    }
  }, [backgroundMusicVolume]);

  const playSynthAmbient = () => {
    try {
      stopSynthAmbient();
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      synthAudioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(backgroundMusicVolume * 0.35, ctx.currentTime);
      masterGain.connect(ctx.destination);

      // Low pass filter for soft slow tone
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(420, ctx.currentTime);
      filter.connect(masterGain);

      // Warm soothing chord frequencies (C3, G3, B3, E4)
      const freqs = [130.81, 196.0, 246.94, 329.63];
      const nodes: OscillatorNode[] = [];

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0.08, ctx.currentTime);
        osc.connect(oscGain);
        oscGain.connect(filter);
        osc.start();
        nodes.push(osc);
      });

      synthNodesRef.current = nodes;
    } catch {
      // AudioContext not allowed before user gesture
    }
  };

  const stopSynthAmbient = () => {
    try {
      if (synthNodesRef.current.length > 0) {
        synthNodesRef.current.forEach((node) => {
          try {
            node.stop();
            node.disconnect();
          } catch {}
        });
        synthNodesRef.current = [];
      }
      if (synthAudioCtxRef.current) {
        synthAudioCtxRef.current.close().catch(() => {});
        synthAudioCtxRef.current = null;
      }
    } catch {}
  };

  // Play / pause background music automatically when a voice is played
  useEffect(() => {
    if (activePlayingVoice && isBackgroundMusicEnabled) {
      if (bgMusicAudioRef.current) {
        bgMusicAudioRef.current.currentTime = 0;
        bgMusicAudioRef.current
          .play()
          .catch(() => {
            playSynthAmbient();
          });
      } else {
        playSynthAmbient();
      }
    } else {
      if (bgMusicAudioRef.current) {
        bgMusicAudioRef.current.pause();
      }
      stopSynthAmbient();
    }
  }, [activePlayingVoice, isBackgroundMusicEnabled]);

  // Persist radio voices to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RADIO_VOICES, JSON.stringify(allRadioVoices));
    } catch (e) {
      console.error('Failed to save radio voices', e);
    }
  }, [allRadioVoices]);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.JOURNALISTS, JSON.stringify(allJournalists));
    } catch (e) {
      console.error('Failed to save journalists', e);
    }
  }, [allJournalists]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(allNewsSubmissions));
    } catch (e) {
      console.error('Failed to save submissions', e);
    }
  }, [allNewsSubmissions]);

  useEffect(() => {
    try {
      // Clear sessions saved by the previous automatic demo login.
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    } catch (e) {
      console.error('Failed to clear legacy session', e);
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videos));
    } catch (e) {
      console.error('Failed to save videos', e);
    }
  }, [videos]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LIVE_STREAMS, JSON.stringify(liveStreams));
    } catch (e) {
      console.error('Failed to save live streams', e);
    }
  }, [liveStreams]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(broadcastSettings));
    } catch (e) {
      console.error('Failed to save broadcast settings', e);
    }
  }, [broadcastSettings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TICKERS, JSON.stringify(tickers));
    } catch (e) {
      console.error('Failed to save tickers', e);
    }
  }, [tickers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.POLL, JSON.stringify(poll));
    } catch (e) {
      console.error('Failed to save poll', e);
    }
  }, [poll]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CHAT, JSON.stringify(chatMessages));
    } catch (e) {
      console.error('Failed to save chat', e);
    }
  }, [chatMessages]);

  // Derived active stream
  const activeLiveStream =
    liveStreams.find((s) => s.isActive) || liveStreams[0] || INITIAL_LIVE_STREAMS[0];

  // Actions
  const addVideo = (videoData: Omit<VideoItem, 'id' | 'views' | 'uploadedAt'>) => {
    const newVideo: VideoItem = {
      ...videoData,
      id: `v-${Date.now()}`,
      uploadedAt: 'Just now',
      views: 1,
    };
    setVideos((prev) => [newVideo, ...prev]);
  };

  const updateVideo = (id: string, updates: Partial<VideoItem>) => {
    setVideos((prev) => prev.map((v) => (v.id === id ? { ...v, ...updates } : v)));
  };

  const deleteVideo = (id: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== id));
  };

  const setActiveLiveStream = (id: string) => {
    setLiveStreams((prev) =>
      prev.map((s) => ({
        ...s,
        isActive: s.id === id,
      }))
    );
  };

  const updateLiveStream = (id: string, updates: Partial<LiveStreamConfig>) => {
    setLiveStreams((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const addLiveStream = (streamData: Omit<LiveStreamConfig, 'id'>) => {
    const newStream: LiveStreamConfig = {
      ...streamData,
      id: `stream-${Date.now()}`,
    };
    // if active, deactivate others
    if (newStream.isActive) {
      setLiveStreams((prev) => [...prev.map((s) => ({ ...s, isActive: false })), newStream]);
    } else {
      setLiveStreams((prev) => [...prev, newStream]);
    }
  };

  const deleteLiveStream = (id: string) => {
    setLiveStreams((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      if (filtered.length > 0 && !filtered.some((s) => s.isActive)) {
        filtered[0].isActive = true;
      }
      return filtered;
    });
  };

  const startLiveCameraBroadcast = (stream: MediaStream) => {
    setActiveLiveCameraStream(stream);
    setIsCameraBroadcasting(true);

    const studioStream: LiveStreamConfig = {
      id: 'stream-live-studio-cam',
      title: '🔴 AV NEWS STUDIO LIVE - ANCHOR DESK',
      channelName: 'AV STUDIO LIVE',
      streamUrl: 'live-camera-feed',
      streamType: 'webrtc',
      isActive: true,
      viewerCount: 68420,
      quality: '1080p 60fps WebRTC',
      category: 'live-news',
      description: 'Live studio anchor camera broadcast from AV News Today control room.',
    };

    setLiveStreams((prev) => {
      const others = prev
        .filter((s) => s.id !== 'stream-live-studio-cam')
        .map((s) => ({ ...s, isActive: false }));
      return [studioStream, ...others];
    });
  };

  const stopLiveCameraBroadcast = (blobUrl?: string) => {
    setIsCameraBroadcasting(false);
    setActiveLiveCameraStream(null);

    if (blobUrl) {
      setLiveStreams((prev) =>
        prev.map((s) =>
          s.id === 'stream-live-studio-cam'
            ? {
                ...s,
                title: `🔴 Studio Recorded Broadcast (${new Date().toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })})`,
                streamUrl: blobUrl,
                streamType: 'mp4',
                isActive: true,
              }
            : s
        )
      );
    }
  };

  const updateBroadcastSettings = (updates: Partial<BroadcastSettings>) => {
    setBroadcastSettings((prev) => ({ ...prev, ...updates }));
  };

  const addTicker = (text: string) => {
    if (!text.trim()) return;
    setTickers((prev) => [text.trim(), ...prev]);
  };

  const removeTicker = (index: number) => {
    setTickers((prev) => prev.filter((_, i) => i !== index));
  };

  const votePoll = (optionId: string) => {
    setPoll((prev) => {
      if (prev.userVotedOptionId) return prev; // already voted
      const updatedOptions = prev.options.map((opt) =>
        opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
      );
      return {
        ...prev,
        options: updatedOptions,
        totalVotes: prev.totalVotes + 1,
        userVotedOptionId: optionId,
      };
    });
  };

  const updatePollQuestion = (question: string, optionTexts: string[]) => {
    setPoll({
      id: `poll-${Date.now()}`,
      question,
      options: optionTexts.map((txt, idx) => ({
        id: `opt-${idx + 1}`,
        text: txt,
        votes: Math.floor(Math.random() * 400) + 100,
      })),
      totalVotes: 1200,
      userVotedOptionId: null,
    });
  };

  const addChatMessage = (text: string, user = 'Viewer') => {
    if (!text.trim()) return;
    const colors = ['bg-blue-600', 'bg-indigo-600', 'bg-purple-600', 'bg-emerald-600', 'bg-amber-600'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      user,
      text: text.trim(),
      timestamp: 'Just now',
      avatarColor: randomColor,
    };
    setChatMessages((prev) => [...prev.slice(-49), newMsg]);
  };

  // Journalist Auth Functions
  const registerJournalist = (
    data: Omit<JournalistUser, 'id' | 'journalistId' | 'status' | 'appliedAt' | 'qrCodeData'>
  ) => {
    const existing = allJournalists.find(
      (j) => j.email.toLowerCase() === data.email.trim().toLowerCase()
    );
    if (existing) {
      return { success: false, message: 'This email is already registered with AV News Digital Network.' };
    }

    const generatedJournalistId = `AV-LIFE-GEN-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newJournalist: JournalistUser = {
      ...data,
      id: `user-journ-${Date.now()}`,
      journalistId: generatedJournalistId,
      status: 'pending',
      appliedAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      qrCodeData: `AV-PRESS-VALID:${generatedJournalistId}:${data.fullName.toUpperCase().replace(/\s+/g, '_')}:PENDING_APPROVAL`,
    };

    setAllJournalists((prev) => [newJournalist, ...prev]);
    return {
      success: true,
      message:
        'Registration submitted successfully! Your credentials and Government ID proof have been forwarded to the AV News Editorial Board. Once reviewed and verified by Admin, you will be granted access to log in.',
    };
  };

  const loginJournalist = (email: string, password: string) => {
    const user = allJournalists.find(
      (j) => j.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (!user || user.password !== password) {
      return { success: false, message: 'Invalid email address or password.' };
    }
    if (user.status === 'pending') {
      return {
        success: false,
        message:
          'Your registration is currently under review by the AV NEWS editorial verification desk. You will be able to log in once an editor verifies your documents.',
      };
    }
    if (user.status === 'rejected') {
      return {
        success: false,
        message: `Your registration application was not approved by the editorial desk. ${
          user.reviewNotes ? `Reason: ${user.reviewNotes}` : 'Please contact administrator.'
        }`,
      };
    }

    setCurrentUser(user);
    return { success: true, message: `Welcome back, ${user.fullName}!`, user };
  };

  const logoutJournalist = () => {
    setCurrentUser(null);
    setIsProfileModalOpen(false);
    setIsMyNewsModalOpen(false);
    setIsUploadNewsModalOpen(false);
  };

  const updateJournalistStatus = (
    userId: string,
    status: 'approved' | 'rejected',
    notes?: string
  ) => {
    const reviewedAt = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    setAllJournalists((prev) =>
      prev.map((j) => {
        if (j.id === userId) {
          const updated: JournalistUser = {
            ...j,
            status,
            reviewedAt,
            reviewNotes: notes,
            qrCodeData: `AV-PRESS-VALID:${j.journalistId}:${j.fullName.toUpperCase().replace(/\s+/g, '_')}:${status.toUpperCase()}`,
          };
          if (currentUser?.id === userId) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return j;
      })
    );
  };

  // Journalist News Submissions & Verification
  const submitNews = (
    submission: Omit<JournalistNewsSubmission, 'id' | 'status' | 'submittedAt' | 'views'>
  ) => {
    if (submission.format === 'short' && (!submission.images || submission.images.length === 0)) {
      return { success: false, message: 'A photo is mandatory for Short News!' };
    }
    if (submission.format === 'article' && (!submission.images || submission.images.length < 2)) {
      return { success: false, message: 'Minimum 2 images are mandatory for Article Level News!' };
    }

    const newSub: JournalistNewsSubmission = {
      ...submission,
      id: `sub-${Date.now()}`,
      status: 'pending',
      submittedAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      views: 0,
    };

    setAllNewsSubmissions((prev) => [newSub, ...prev]);
    return {
      success: true,
      message: 'News submitted to Admin for verification! It will be published upon approval.',
      submissionId: newSub.id,
    };
  };

  const verifyAndApproveNews = (
    submissionId: string,
    assignedCategory?: NewsCategory | 'all',
    feedback?: string
  ) => {
    const reviewedAt = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    const targetCat = assignedCategory && assignedCategory !== 'all' ? assignedCategory : 'telangana';

    setAllNewsSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.id === submissionId) {
          return {
            ...sub,
            status: 'approved' as const,
            assignedCategory: assignedCategory || 'telangana',
            reviewedAt,
            adminFeedback: feedback,
          };
        }
        return sub;
      })
    );

    const sub = allNewsSubmissions.find((s) => s.id === submissionId);
    if (sub) {
      const newVideo: VideoItem = {
        id: `v-journ-${sub.id}`,
        title: sub.title,
        titleTelugu: sub.titleTelugu || sub.title,
        category: targetCat as NewsCategory,
        videoUrl:
          sub.videos[0] ||
          sub.audios[0] ||
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
        thumbnailUrl:
          sub.images[0] ||
          'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=600&q=80',
        duration: sub.format === 'article' ? 'In-Depth Article' : sub.audios.length > 0 ? 'Audio Report' : 'Ground Short',
        reporter: `${sub.journalistName} (${sub.journalistDesignation})`,
        location: sub.location || 'Telangana',
        description: sub.summary || sub.content.slice(0, 180),
        tags: sub.tags,
        uploadedAt: 'Just now',
        views: 1,
        isSpecialReport: sub.format === 'article',
        isGroundReport: sub.format === 'short',
      };
      setVideos((prev) => [newVideo, ...prev.filter((v) => v.id !== newVideo.id)]);
    }
  };

  const rejectNews = (submissionId: string, feedback?: string) => {
    const reviewedAt = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    setAllNewsSubmissions((prev) =>
      prev.map((sub) =>
        sub.id === submissionId
          ? { ...sub, status: 'rejected' as const, reviewedAt, adminFeedback: feedback }
          : sub
      )
    );
  };

  const toggleRadio = () => {
    setIsRadioPlaying((prev) => !prev);
  };

  // AV Radio Voice Actions
  const submitRadioVoice = (data: {
    title: string;
    titleTelugu?: string;
    audioUrl: string;
    duration: string;
    durationSeconds?: number;
    userName?: string;
    userRole?: string;
    userCity?: string;
    topic?: string;
  }) => {
    if (!data.title.trim()) {
      return { success: false, message: 'దయచేసి మీ రికార్డింగ్‌కు ఒక శీర్షికను (Title) ఇవ్వండి.' };
    }
    if (!data.audioUrl) {
      return { success: false, message: 'ఆడియో రికార్డింగ్ ఫైల్ లభించలేదు.' };
    }

    const newVoice: RadioVoice = {
      id: `voice-${Date.now()}`,
      title: data.title.trim(),
      titleTelugu: data.titleTelugu || data.title.trim(),
      audioUrl: data.audioUrl,
      duration: data.duration || '01:00',
      durationSeconds: data.durationSeconds || 60,
      userName: data.userName?.trim() || currentUser?.fullName || 'Anonymous Citizen / ప్రజా వాయిస్',
      userRole: data.userRole || (currentUser ? 'Accredited Journalist' : 'Citizen Speaker / పౌరుడు'),
      userCity: data.userCity || currentUser?.cityDistrict || 'Telangana',
      topic: data.topic || 'ప్రజా గళం (Public Voice)',
      status: 'pending', // Sent to admin for review
      submittedAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      listens: 0,
      likes: 0,
    };

    setAllRadioVoices((prev) => [newVoice, ...prev]);
    return {
      success: true,
      message: 'మీ వాయిస్ విజయవంతంగా సమర్పించబడింది! అడ్మిన్ పరిశీలన తర్వాత AV Radio లో ప్రసారమవుతుంది.',
      voice: newVoice,
    };
  };

  const approveRadioVoice = (id: string) => {
    const reviewedAt = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    setAllRadioVoices((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, status: 'approved' as const, reviewedAt } : v
      )
    );
  };

  const rejectRadioVoice = (id: string, reason?: string) => {
    const reviewedAt = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    setAllRadioVoices((prev) =>
      prev.map((v) =>
        v.id === id
          ? { ...v, status: 'rejected' as const, reviewedAt, adminFeedback: reason }
          : v
      )
    );
  };

  const deleteRadioVoice = (id: string) => {
    setAllRadioVoices((prev) => prev.filter((v) => v.id !== id));
    if (activePlayingVoice?.id === id) {
      setActivePlayingVoice(null);
    }
  };

  const updateRadioVoiceTitle = (id: string, newTitle: string, newTitleTelugu?: string) => {
    setAllRadioVoices((prev) =>
      prev.map((v) =>
        v.id === id
          ? {
              ...v,
              title: newTitle.trim(),
              titleTelugu: newTitleTelugu ? newTitleTelugu.trim() : newTitle.trim(),
            }
          : v
      )
    );
  };

  const resetToInitialData = () => {
    setVideos(INITIAL_VIDEOS);
    setLiveStreams(INITIAL_LIVE_STREAMS);
    setBroadcastSettings(INITIAL_BROADCAST_SETTINGS);
    setTickers(INITIAL_TICKERS);
    setPoll(INITIAL_POLL);
    setChatMessages(INITIAL_CHAT_MESSAGES);
    setAllJournalists(INITIAL_JOURNALISTS);
    setAllNewsSubmissions(INITIAL_JOURNALIST_NEWS);
    setAllRadioVoices(INITIAL_RADIO_VOICES);
    setCurrentUser(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.VIDEOS);
      localStorage.removeItem(STORAGE_KEYS.LIVE_STREAMS);
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
      localStorage.removeItem(STORAGE_KEYS.TICKERS);
      localStorage.removeItem(STORAGE_KEYS.POLL);
      localStorage.removeItem(STORAGE_KEYS.CHAT);
      localStorage.removeItem(STORAGE_KEYS.JOURNALISTS);
      localStorage.removeItem(STORAGE_KEYS.SUBMISSIONS);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      localStorage.removeItem(STORAGE_KEYS.RADIO_VOICES);
    } catch (e) {
      console.error('Reset error', e);
    }
  };

  return (
    <NewsContext.Provider
      value={{
        videos,
        addVideo,
        updateVideo,
        deleteVideo,
        liveStreams,
        activeLiveStream,
        setActiveLiveStream,
        updateLiveStream,
        addLiveStream,
        deleteLiveStream,
        broadcastSettings,
        updateBroadcastSettings,
        tickers,
        addTicker,
        removeTicker,
        poll,
        votePoll,
        updatePollQuestion,
        chatMessages,
        addChatMessage,
        activeCategory,
        setActiveCategory,
        selectedVideo,
        setSelectedVideo,
        selectedLocation,
        setSelectedLocation,
        isLivePlayerOpen,
        setIsLivePlayerOpen,
        isAdminOpen,
        setIsAdminOpen,
        isEpaperOpen,
        setIsEpaperOpen,
        isEditorialOpen,
        setIsEditorialOpen,
        isPhotosOpen,
        setIsPhotosOpen,
        isContactOpen,
        setIsContactOpen,
        currentUser,
        allJournalists,
        registerJournalist,
        loginJournalist,
        logoutJournalist,
        updateJournalistStatus,
        allNewsSubmissions,
        submitNews,
        verifyAndApproveNews,
        rejectNews,
        selectedArticle,
        setSelectedArticle,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        isProfileModalOpen,
        setIsProfileModalOpen,
        isMyNewsModalOpen,
        setIsMyNewsModalOpen,
        isUploadNewsModalOpen,
        setIsUploadNewsModalOpen,
        activeLiveCameraStream,
        isCameraBroadcasting,
        startLiveCameraBroadcast,
        stopLiveCameraBroadcast,
        isRadioPlaying,
        setIsRadioPlaying,
        toggleRadio,
        allRadioVoices,
        activePlayingVoice,
        setActivePlayingVoice,
        isRecordVoiceModalOpen,
        setIsRecordVoiceModalOpen,
        submitRadioVoice,
        approveRadioVoice,
        rejectRadioVoice,
        deleteRadioVoice,
        updateRadioVoiceTitle,
        isBackgroundMusicEnabled,
        setIsBackgroundMusicEnabled,
        backgroundMusicVolume,
        setBackgroundMusicVolume,
        searchQuery,
        setSearchQuery,
        resetToInitialData,
      }}
    >
      {children}
    </NewsContext.Provider>
  );
};

export const useNews = () => {
  const context = useContext(NewsContext);
  if (!context) {
    throw new Error('useNews must be used within a NewsProvider');
  }
  return context;
};
