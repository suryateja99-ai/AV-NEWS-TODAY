import { RadioModerationSettings } from './RadioModerationSettings';
import { BroadcastScheduler } from './BroadcastScheduler';
import { BroadcastControlSettings } from './BroadcastControlSettings';
import { resolveMedia, storeMedia } from '../utils/mediaStore';
import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Copy,
  Edit3,
  FileCheck,
  FileText,
  FileVideo,
  Filter,
  IdCard,
  Image as ImageIcon,
  Layers,
  MapPin,
  Mic,
  Music,
  Pause,
  Play,
  Plus,
  Radio,
  RefreshCw,
  Save,
  Search,
  Shield,
  ShieldCheck,
  Trash2,
  Tv,
  Upload,
  UserCheck,
  UserX,
  Users,
  Video,
  Volume2,
  X,
} from 'lucide-react';
import { useNews } from '../context/NewsContext';
import { Logo } from './Logo';
import { normalizeBroadcastUrl, normalizeYuppTVSource } from '../utils/broadcast';
import { BroadcastFramingControls } from './BroadcastFramingControls';
import {
  JournalistNewsSubmission,
  JournalistUser,
  NewsCategory,
  RadioVoice,
  VideoItem,
} from '../types';

export const AdminPortal: React.FC = () => {
  const {
    isAdminOpen,
    setActiveCategory,
    setIsAdminOpen,
    setIsLivePlayerOpen,
    activeLiveStream,
    liveStreams,
    addLiveStream,
    updateLiveStream,
    deleteLiveStream,
    setActiveLiveStream,
    isCameraBroadcasting,
    startLiveCameraBroadcast,
    stopLiveCameraBroadcast,
    broadcastSettings,
    updateBroadcastSettings,
    videos,
    addVideo,
    deleteVideo,
    tickers,
    addTicker,
    removeTicker,
    poll,
    updatePollQuestion,
    resetToInitialData,
    allJournalists,
    updateJournalistStatus,
    allNewsSubmissions,
    verifyAndApproveNews,
    rejectNews,
    setSelectedArticle,
    allRadioVoices,
    approveRadioVoice,
    rejectRadioVoice,
    deleteRadioVoice,
    updateRadioVoiceTitle,
  } = useNews();

  const [activeAdminTab, setActiveAdminTab] = useState<
    | 'live-studio'
    | 'registrations'
    | 'news-verification'
    | 'journalists'
    | 'scheduler'
    | 'screen-zoom'
    | 'av-radio'
    | 'overlays'
    | 'l-shape-ads'
    | 'upload-video'
    | 'tickers-poll'
    | 'manage'
  >('live-studio');

  // AV Radio Admin State
  const [voiceStatusFilter, setVoiceStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [voiceSearchQuery, setVoiceSearchQuery] = useState('');
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [editingVoice, setEditingVoice] = useState<RadioVoice | null>(null);
  const [editTitleInput, setEditTitleInput] = useState('');
  const [editTitleTeluguInput, setEditTitleTeluguInput] = useState('');
  const [rejectingVoiceId, setRejectingVoiceId] = useState<string | null>(null);
  const [rejectVoiceReason, setRejectVoiceReason] = useState('');
  const adminAudioRef = useRef<HTMLAudioElement | null>(null);

  // Journalist Registrations Admin State
  const [regStatusFilter, setRegStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [regSearchQuery, setRegSearchQuery] = useState('');
  const [selectedProofUser, setSelectedProofUser] = useState<JournalistUser | null>(null);
  const [rejectingUserId, setRejectingUserId] = useState<string | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  // Journalist News Verification Desk State
  const [newsStatusFilter, setNewsStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [newsFormatFilter, setNewsFormatFilter] = useState<'all' | 'short' | 'article' | 'audio'>('all');
  const [newsSearchQuery, setNewsSearchQuery] = useState('');
  const [verifyingNewsItem, setVerifyingNewsItem] = useState<JournalistNewsSubmission | null>(null);
  const [verifyCategory, setVerifyCategory] = useState<NewsCategory | 'all'>('all');
  const [verifyFeedback, setVerifyFeedback] = useState('');
  const [rejectingNewsId, setRejectingNewsId] = useState<string | null>(null);
  const [rejectNewsFeedback, setRejectNewsFeedback] = useState('');

  // Broadcast Mode: 'url' | 'record' | 'upload'
  const [broadcastMode, setBroadcastMode] = useState<'url' | 'record' | 'upload'>('url');

  // URL Stream Form
  const [streamTitle, setStreamTitle] = useState(activeLiveStream.title);
  const [streamChannel, setStreamChannel] = useState(activeLiveStream.channelName);
  const [streamUrl, setStreamUrl] = useState(activeLiveStream.streamUrl);
  const [streamError, setStreamError] = useState('');
  const [sourceProvider, setSourceProvider] = useState<'auto' | 'yupptv'>(activeLiveStream.provider || 'auto');
  const [channelCode, setChannelCode] = useState(activeLiveStream.channelCode || '');
  const [streamViewers, setStreamViewers] = useState(activeLiveStream.viewerCount);
  const [streamQuality, setStreamQuality] = useState(activeLiveStream.quality);

  // Recording WebRTC
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingVideoPreviewRef = useRef<HTMLVideoElement>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Local File Upload
  const [localVideoFile, setLocalVideoFile] = useState<File | null>(null);
  const [localVideoPreviewUrl, setLocalVideoPreviewUrl] = useState<string | null>(null);

  // Overlays state
  const [topTicker, setTopTicker] = useState(broadcastSettings.topTickerText);
  const [bottomTicker, setBottomTicker] = useState(broadcastSettings.bottomTickerText);
  const [showLogo, setShowLogo] = useState(broadcastSettings.isChannelLogoVisible);
  const [showLiveBadge, setShowLiveBadge] = useState(broadcastSettings.isLiveBadgeVisible);

  // L-Shape Ads state
  const [adsEnabled, setAdsEnabled] = useState(broadcastSettings.lShapeAdsEnabled);
  const [bottomAdTitle, setBottomAdTitle] = useState(broadcastSettings.lShapeBottomAd.title);
  const [bottomAdSubtitle, setBottomAdSubtitle] = useState(
    broadcastSettings.lShapeBottomAd.subtitle
  );
  const [sideAdTitle, setSideAdTitle] = useState(broadcastSettings.lShapeSideAd.title);
  const [sideAdSubtitle, setSideAdSubtitle] = useState(broadcastSettings.lShapeSideAd.subtitle);

  useEffect(() => {
    setAdsEnabled(broadcastSettings.lShapeAdsEnabled);
  }, [broadcastSettings.lShapeAdsEnabled]);
  useEffect(() => {
    setTopTicker(broadcastSettings.topTickerText);
    setBottomTicker(broadcastSettings.bottomTickerText);
    setShowLogo(broadcastSettings.isChannelLogoVisible);
    setShowLiveBadge(broadcastSettings.isLiveBadgeVisible);
  }, [broadcastSettings.topTickerText, broadcastSettings.bottomTickerText, broadcastSettings.isChannelLogoVisible, broadcastSettings.isLiveBadgeVisible]);

  // Prestored Video Form
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoCategory, setNewVideoCategory] = useState<NewsCategory>('telangana');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoThumbnail, setNewVideoThumbnail] = useState('');
  const [newVideoDuration, setNewVideoDuration] = useState('3:45');
  const [newVideoReporter, setNewVideoReporter] = useState('');
  const [newVideoLocation, setNewVideoLocation] = useState('');
  const [newVideoDesc, setNewVideoDesc] = useState('');
  const [newVideoTags, setNewVideoTags] = useState('');
  const [isBreakingCheck, setIsBreakingCheck] = useState(false);
  const [isSpecialReportCheck, setIsSpecialReportCheck] = useState(false);
  const [isGroundReportCheck, setIsGroundReportCheck] = useState(false);
  const [isExplainerCheck, setIsExplainerCheck] = useState(false);

  // New Ticker input
  const [newTickerInput, setNewTickerInput] = useState('');

  // Poll Form
  const [pollQuestionInput, setPollQuestionInput] = useState(poll.question);
  const [pollOpt1, setPollOpt1] = useState(poll.options[0]?.text || '');
  const [pollOpt2, setPollOpt2] = useState(poll.options[1]?.text || '');
  const [pollOpt3, setPollOpt3] = useState(poll.options[2]?.text || '');
  const [pollOpt4, setPollOpt4] = useState(poll.options[3]?.text || '');

  // Feedback Notification
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  useEffect(() => {
    if (!isAdminOpen || activeAdminTab !== 'av-radio') {
      adminAudioRef.current?.pause();
      setPlayingVoiceId(null);
    }
    return () => { adminAudioRef.current?.pause(); };
  }, [isAdminOpen, activeAdminTab]);

  // WebRTC Start Recording
  const startCameraRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      mediaStreamRef.current = stream;
      if (recordingVideoPreviewRef.current) {
        recordingVideoPreviewRef.current.srcObject = stream;
        recordingVideoPreviewRef.current.play();
      }

      recordedChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };
      recorder.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedBlobUrl(url);
        try { stopLiveCameraBroadcast(await storeMedia(blob)); }
        catch { stopLiveCameraBroadcast(url); showToast('Recording is available this session, but browser storage could not save it.'); }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);

      // Immediately reflect on the Live Screen in real-time
      startLiveCameraBroadcast(stream);

      showToast('🔴 LIVE ON AIR! Camera recording started and immediately reflecting on the Live Screen!');
    } catch (err) {
      console.error(err);
      showToast('Camera access denied or unavailable. Please check permissions.');
    }
  };

  const stopCameraRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    setIsRecording(false);
    showToast('Recording stopped! Feed transitioned to recorded edition.');
  };

  const handleActivateRecordedLive = async () => {
    if (!recordedBlobUrl) return;
    let storedUrl: string;
    try { storedUrl = await storeMedia(await fetch(recordedBlobUrl).then((response) => response.blob())); }
    catch { showToast('Could not save this recording to browser storage.'); return; }
    addLiveStream({
      title: `🔴 Anchor Live Broadcast (${new Date().toLocaleTimeString()})`,
      channelName: 'AV LIVE ANCHOR',
      streamUrl: storedUrl,
      streamType: 'mp4',
      isActive: true,
      viewerCount: 52400,
      quality: '1080p WebRTC',
      category: 'live-news',
      description: 'Live studio recorded broadcast from AV News Today control room.',
    });
    showToast('Recorded video is now ACTIVE on AV News Today Live Player!');
  };

  // File Upload
  const handleLocalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLocalVideoFile(file);
      const url = URL.createObjectURL(file);
      setLocalVideoPreviewUrl(url);
      showToast(`Loaded ${file.name} successfully!`);
    }
  };

  const handleActivateUploadedFile = async () => {
    if (!localVideoPreviewUrl || !localVideoFile) return;
    let storedUrl: string;
    try { storedUrl = await storeMedia(localVideoFile); }
    catch { showToast('Could not save this video. Check browser storage space.'); return; }
    addLiveStream({
      title: `🔴 Local Feed: ${localVideoFile.name.replace(/\.[^/.]+$/, '')}`,
      channelName: 'AV LOCAL FEED',
      streamUrl: storedUrl,
      streamType: 'mp4',
      isActive: true,
      viewerCount: 46800,
      quality: '1080p Local',
      category: 'live-news',
      description: 'Uploaded broadcast video streaming directly.',
    });
    showToast('Uploaded local video activated as LIVE on the player!');
  };

  // Save URL Stream
  const handleSaveUrlStream = (e: React.FormEvent) => {
    e.preventDefault();
    setStreamError('');
    let source: ReturnType<typeof normalizeBroadcastUrl> | ReturnType<typeof normalizeYuppTVSource>;
    try {
      source = sourceProvider === 'yupptv' ? normalizeYuppTVSource(streamUrl, channelCode) : normalizeBroadcastUrl(streamUrl);
    } catch (error) {
      setStreamError(error instanceof Error ? error.message : 'Invalid video URL.');
      return;
    }

    addLiveStream({
      title: streamTitle.trim() || 'AV News Today 24x7 HD LIVE',
      channelName: streamChannel.trim() || 'AV News Today HD',
      ...source,
      isActive: true,
      viewerCount: Number(streamViewers) || 48000,
      quality: streamQuality || '1080p HD',
      category: 'live-news',
    });

    setActiveCategory('home');
    setIsLivePlayerOpen(false);
    setIsAdminOpen(false);
    setTimeout(() => document.getElementById('live-broadcast-screen')?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  // Save Overlays
  const handleSaveOverlays = () => {
    updateBroadcastSettings({
      topTickerText: topTicker,
      bottomTickerText: bottomTicker,
      isChannelLogoVisible: showLogo,
      isLiveBadgeVisible: showLiveBadge,
    });
    showToast('Tickers and live watermark logos updated successfully!');
  };

  // Save L-Shape Ads
  const handleSaveAds = () => {
    updateBroadcastSettings({
      lShapeAdsEnabled: adsEnabled,
      lShapeBottomAd: {
        ...broadcastSettings.lShapeBottomAd,
        title: bottomAdTitle,
        subtitle: bottomAdSubtitle,
      },
      lShapeSideAd: {
        ...broadcastSettings.lShapeSideAd,
        title: sideAdTitle,
        subtitle: sideAdSubtitle,
      },
    });
    showToast('L-Shape TV broadcast advertisements saved!');
  };

  // Save Prestored Video
  const handleSavePrestoredVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideoTitle.trim() || !newVideoUrl.trim()) {
      showToast('Please enter both Title and Video URL.');
      return;
    }

    let url = newVideoUrl.trim();
    if (url.includes('watch?v=')) {
      const vid = url.split('watch?v=')[1]?.split('&')[0];
      url = `https://www.youtube.com/embed/${vid}`;
    }

    addVideo({
      title: newVideoTitle.trim(),
      category: newVideoCategory,
      videoUrl: url,
      thumbnailUrl:
        newVideoThumbnail.trim() ||
        'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80',
      duration: newVideoDuration.trim() || '3:30',
      reporter: newVideoReporter.trim() || 'AV News Bureau',
      location: newVideoLocation.trim() || 'Telangana',
      description: newVideoDesc.trim() || 'AV News Today ప్రత్యేక కథనం.',
      tags: newVideoTags ? newVideoTags.split(',').map((t) => t.trim()) : ['AV News'],
      isBreaking: isBreakingCheck,
      isSpecialReport: isSpecialReportCheck,
      isGroundReport: isGroundReportCheck,
      isExplainer: isExplainerCheck,
    });

    setNewVideoTitle('');
    setNewVideoUrl('');
    setNewVideoThumbnail('');
    setNewVideoDesc('');
    setNewVideoTags('');
    showToast(`Video published to ${newVideoCategory.toUpperCase()} page successfully!`);
  };

  // Save Poll
  const handleSavePoll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pollQuestionInput.trim()) return;
    const opts = [pollOpt1, pollOpt2, pollOpt3, pollOpt4].filter((o) => o.trim().length > 0);
    updatePollQuestion(pollQuestionInput.trim(), opts);
    showToast('Public Opinion Poll updated on the Home Page!');
  };

  if (!isAdminOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-[#0b1428] border border-blue-800/80 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#070e1e] border-b border-blue-900/60 p-4 sm:px-6 flex items-center justify-between gap-3 shrink-0">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Logo size="sm" showRing={false} />
            <div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-xs font-black text-red-500 uppercase tracking-wider">
                  AV News Today
                </span>
                <span className="hidden sm:inline text-[10px] bg-blue-950 text-blue-300 font-bold px-2 py-0.5 rounded border border-blue-800">
                  ADMIN CONTROL STUDIO
                </span>
              </div>
              <h2 className="text-xs sm:text-lg font-black text-white">
                Live Broadcast & Content Control Studio
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (confirm('Reset all content, videos, and settings to original state?')) {
                  resetToInitialData();
                  showToast('All content & seed data reset to original state!');
                }
              }}
              className="bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold px-3 py-1.5 rounded-lg border border-amber-500/40 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Reset Seed Data</span>
            </button>

            <button
              aria-label="Close Admin"
              onClick={() => setIsAdminOpen(false)}
              className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toast alert */}
        {toastMsg && (
          <div className="bg-emerald-950 border-b border-emerald-500/60 text-emerald-200 px-4 py-2 text-xs font-bold flex items-center gap-2 shrink-0 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="grid grid-cols-1 min-[440px]:grid-cols-2 lg:grid-cols-3 gap-1 p-2.5 bg-[#081022] border-b border-blue-900/40 text-xs shrink-0 max-h-[28vh] overflow-y-auto" role="tablist" aria-label="Admin sections">
          {[
            { id: 'live-studio', label: '🔴 LIVE BROADCAST STUDIO', icon: Radio },
            {
              id: 'registrations',
              label: `👥 JOURNALIST REGISTRATIONS${
                allJournalists.filter((j) => j.status === 'pending').length > 0
                  ? ` (${allJournalists.filter((j) => j.status === 'pending').length})`
                  : ''
              }`,
              icon: Users,
            },
            {
              id: 'news-verification',
              label: `📰 NEWS VERIFICATION DESK${
                allNewsSubmissions.filter((s) => s.status === 'pending').length > 0
                  ? ` (${allNewsSubmissions.filter((s) => s.status === 'pending').length})`
                  : ''
              }`,
              icon: FileCheck,
            },
            {
              id: 'av-radio',
              label: `🎙️ AV RADIO VOICES${
                allRadioVoices.filter((v) => v.status === 'pending').length > 0
                  ? ` (${allRadioVoices.filter((v) => v.status === 'pending').length})`
                  : ''
              }`,
              icon: Mic,
            },
            { id: 'journalists', label: 'EDITORIAL & JOURNALIST PRESS DESK', icon: FileCheck },
            { id: 'scheduler', label: '48-HOUR SCHEDULER', icon: Radio },
            { id: 'screen-zoom', label: 'SCREEN ZOOM & VIEWPORT', icon: Layers },
            { id: 'overlays', label: '🎨 DUAL TICKERS & LOGO', icon: Layers },
            { id: 'l-shape-ads', label: '📺 L-SHAPE (L-BAND) ADS', icon: Tv },
            { id: 'upload-video', label: '📹 UPLOAD PRESTORED VIDEO', icon: Upload },
            { id: 'tickers-poll', label: '📰 TICKERS & OPINION POLL', icon: AlertCircle },
            { id: 'manage', label: '🗂️ MANAGE ALL CONTENT', icon: Edit3 },
          ].map((tab) => {
            const isCur = activeAdminTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isCur}
                onClick={() => setActiveAdminTab(tab.id as any)}
                className={`flex min-w-0 items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-left cursor-pointer transition-all ${
                  isCur
                    ? 'bg-gradient-to-r from-red-600 to-blue-600 text-white shadow-lg'
                    : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* ========================================================= */}
          {/* TAB 1: LIVE BROADCAST STUDIO */}
          {/* ========================================================= */}
          {activeAdminTab === 'journalists' && <section className="space-y-4">
            <h3 className="font-bold">Editorial & journalist press desk</h3>
            <p className="text-xs text-slate-400">Review credentials before granting journalist access. Approve reports for the public feed; reports tagged ?breaking? also enter both live tickers.</p>
            <div className="flex flex-wrap gap-3"><button className="rounded-lg bg-blue-600 px-4 py-3 text-xs font-bold" onClick={() => setActiveAdminTab('registrations')}>Review journalist applications ({allJournalists.filter((user) => user.status === 'pending').length})</button><button className="rounded-lg bg-blue-600 px-4 py-3 text-xs font-bold" onClick={() => setActiveAdminTab('news-verification')}>Review field reports ({allNewsSubmissions.filter((report) => report.status === 'pending').length})</button></div>
          </section>}
          {activeAdminTab === 'scheduler' && <BroadcastScheduler />}
          {activeAdminTab === 'screen-zoom' && <BroadcastControlSettings section="viewport" />}
          {activeAdminTab === 'overlays' && <BroadcastControlSettings section="overlays" />}
          {activeAdminTab === 'l-shape-ads' && <BroadcastControlSettings section="ads" />}
          {activeAdminTab === 'live-studio' && (
            <div className="space-y-6">
              <BroadcastFramingControls />
              {/* Broadcast Mode Selector */}
              <div className="bg-[#081126] border border-blue-900/60 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs font-black text-amber-400 tracking-wider">
                  CHOOSE BROADCAST MODE:
                </span>
                <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setBroadcastMode('url')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      broadcastMode === 'url'
                        ? 'bg-blue-600 text-white shadow'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    1. Live Stream URL / Feed
                  </button>
                  <button
                    onClick={() => setBroadcastMode('record')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      broadcastMode === 'record'
                        ? 'bg-red-600 text-white shadow'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    2. Record Camera Video
                  </button>
                  <button
                    onClick={() => setBroadcastMode('upload')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      broadcastMode === 'upload'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    3. Upload Local File
                  </button>
                </div>
              </div>

              {/* MODE 1: STREAM URL */}
              {broadcastMode === 'url' && (
                <form
                  onSubmit={handleSaveUrlStream}
                  className="bg-[#081126] border border-blue-900/60 rounded-xl p-4 sm:p-5 space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-blue-900/50 pb-2">
                    <h3 className="text-sm font-black text-white">
                      Live Stream Video Source Settings
                    </h3>
                    <span className="text-xs font-mono text-emerald-400">
                      Currently Active: {activeLiveStream.channelName}
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <label className="text-xs">Source provider<select className="w-full bg-slate-950 border border-blue-900 rounded-lg p-2 mt-1" value={sourceProvider} onChange={(event) => setSourceProvider(event.target.value as 'auto' | 'yupptv')}><option value="auto">YouTube ID / URL, HLS, or MP4</option><option value="yupptv">YuppTV authorized feed</option></select></label>
                    {sourceProvider === 'yupptv' && <label className="text-xs">YuppTV channel code<input className="w-full bg-slate-950 border border-blue-900 rounded-lg p-2 mt-1" value={channelCode} onChange={(event) => setChannelCode(event.target.value)} /><span className="text-slate-400">A channel code also needs its authorized playback or embed URL below.</span></label>}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Broadcast Title / Headline
                      </label>
                      <input
                        type="text"
                        value={streamTitle}
                        onChange={(e) => setStreamTitle(e.target.value)}
                        placeholder="e.g. AV News Today 24x7 HD LIVE"
                        className="w-full bg-slate-950 border border-blue-900/60 rounded-lg p-2 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Channel Name / Badge
                      </label>
                      <input
                        type="text"
                        value={streamChannel}
                        onChange={(e) => setStreamChannel(e.target.value)}
                        placeholder="e.g. AV News Today HD"
                        className="w-full bg-slate-950 border border-blue-900/60 rounded-lg p-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Live Stream URL (YouTube video / HLS .m3u8 / MP4 Direct)
                    </label>
                    <input
                      type="text"
                      value={streamUrl}
                      onChange={(e) => setStreamUrl(e.target.value)}
                      placeholder="Paste a YouTube video link, HLS feed, or MP4 URL"
                      className="w-full bg-slate-950 border border-blue-900/60 rounded-lg p-2 text-xs text-white font-mono"
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-[10px] text-slate-400">Quick Presets:</span>
                      <button
                        type="button"
                        onClick={() =>
                          setStreamUrl('https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&mute=0')
                        }
                        className="text-[10px] bg-slate-800 text-blue-300 px-2 py-0.5 rounded hover:bg-slate-700"
                      >
                        YouTube Live Preset
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setStreamUrl(
                            'https://player.mslivestream.net/telugu/5d076e5c3d34cb8bb08e54a4bb7e223e.sdp/playlist.m3u8'
                          )
                        }
                        className="text-[10px] bg-slate-800 text-amber-300 px-2 py-0.5 rounded hover:bg-slate-700"
                      >
                        SVBC TTD HLS .m3u8 Preset
                      </button>
                    </div>
                  </div>

                  {streamError && <p role="alert" className="text-xs text-red-400">{streamError}</p>}
                  <p className="text-[11px] text-slate-400">YouTube starts muted. Use the player controls to turn on sound.</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Estimated Live Viewers
                      </label>
                      <input
                        type="number"
                        value={streamViewers}
                        onChange={(e) => setStreamViewers(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-blue-900/60 rounded-lg p-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Quality</label>
                      <select
                        value={streamQuality}
                        onChange={(e) => setStreamQuality(e.target.value)}
                        className="w-full bg-slate-950 border border-blue-900/60 rounded-lg p-2 text-xs text-white"
                      >
                        <option value="1080p HD 60fps">1080p HD 60fps</option>
                        <option value="1080p HD">1080p HD</option>
                        <option value="720p HD">720p HD</option>
                        <option value="4K UHD">4K UHD</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-500 hover:to-blue-500 text-white text-xs font-black py-2.5 rounded-lg shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>SAVE & ACTIVATE ON LIVE PLAYER</span>
                  </button>
                </form>
              )}

              {/* MODE 2: RECORD WEBRTC CAMERA */}
              {broadcastMode === 'record' && (
                <div className="bg-[#081126] border border-blue-900/60 rounded-xl p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-blue-900/50 pb-2">
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <Camera className="w-4 h-4 text-red-500" />
                      <span>Direct Webcam & Mic Anchor Studio</span>
                    </h3>
                    <span className="text-[10px] text-slate-400">
                      Record an anchor live report and stream directly
                    </span>
                  </div>

                  <div className="relative w-full h-64 bg-black rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center">
                    <video
                      ref={recordingVideoPreviewRef}
                      muted
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    {!isRecording && !recordedBlobUrl && (
                      <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center p-4 text-center">
                        <Camera className="w-10 h-10 text-slate-600 mb-2" />
                        <p className="text-xs text-slate-300">
                          Click "Start Camera & Recording" to capture anchor broadcast
                        </p>
                      </div>
                    )}
                    {isRecording && (
                      <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1.5 animate-pulse shadow-lg">
                        <span className="w-2 h-2 rounded-full bg-white"></span>
                        <span>ON AIR • REFLECTING ON LIVE SCREEN</span>
                      </div>
                    )}
                  </div>

                  {isRecording && (
                    <div className="bg-red-950/60 border border-red-500/70 rounded-lg p-3 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
                      <div className="flex items-center gap-2.5">
                        <span className="relative flex h-2.5 w-2.5 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                        </span>
                        <div>
                          <p className="text-xs font-black text-white">
                            BROADCASTING LIVE ON MAIN SCREEN (AV News Today HD)
                          </p>
                          <p className="text-[10px] text-red-200">
                            Your webcam feed and audio are instantly visible on the TV live player.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsLivePlayerOpen(true)}
                        className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-black px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md transition-transform hover:scale-105 cursor-pointer shrink-0"
                      >
                        <Tv className="w-3.5 h-3.5" />
                        <span>OPEN LIVE SCREEN</span>
                      </button>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    {!isRecording ? (
                      <button
                        type="button"
                        onClick={startCameraRecording}
                        className="flex-1 bg-red-600 hover:bg-red-500 text-white text-xs font-black py-2.5 rounded-lg flex items-center justify-center gap-2 shadow cursor-pointer"
                      >
                        <Camera className="w-4 h-4" />
                        <span>START CAMERA & RECORDING</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={stopCameraRecording}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-red-400 border border-red-500/50 text-xs font-black py-2.5 rounded-lg flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>STOP RECORDING</span>
                      </button>
                    )}

                    {recordedBlobUrl && (
                      <button
                        type="button"
                        onClick={handleActivateRecordedLive}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black py-2.5 rounded-lg flex items-center justify-center gap-2 shadow cursor-pointer"
                      >
                        <Radio className="w-4 h-4" />
                        <span>ACTIVATE RECORDED VIDEO AS LIVE BROADCAST</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* MODE 3: UPLOAD LOCAL FILE */}
              {broadcastMode === 'upload' && (
                <div className="bg-[#081126] border border-blue-900/60 rounded-xl p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-blue-900/50 pb-2">
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <FileVideo className="w-4 h-4 text-emerald-400" />
                      <span>Upload Local Video File for Live Broadcast</span>
                    </h3>
                  </div>

                  <div className="border-2 border-dashed border-blue-900/80 hover:border-blue-500/80 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-950/40">
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/ogg"
                      onChange={handleLocalFileChange}
                      className="hidden"
                      id="admin-video-upload"
                    />
                    <label htmlFor="admin-video-upload" className="cursor-pointer block">
                      <Upload className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                      <p className="text-xs font-bold text-white">
                        Click here or drag-and-drop video file (MP4, WebM)
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Broadcasts smoothly in high-definition
                      </p>
                    </label>
                  </div>

                  {localVideoPreviewUrl && (
                    <div className="space-y-3">
                      <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Loaded: {localVideoFile?.name}</span>
                      </div>
                      <video
                        src={localVideoPreviewUrl}
                        controls
                        className="w-full max-h-56 bg-black rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={handleActivateUploadedFile}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black py-2.5 rounded-lg flex items-center justify-center gap-2 shadow cursor-pointer"
                      >
                        <Radio className="w-4 h-4" />
                        <span>SET UPLOADED VIDEO AS ACTIVE LIVE STREAM</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: DUAL TICKERS & LOGO */}
          {/* ========================================================= */}
          {activeAdminTab === 'overlays' && (
            <div className="bg-[#081126] border border-blue-900/60 rounded-xl p-4 sm:p-5 space-y-4">
              <h3 className="text-sm font-black text-white border-b border-blue-900/50 pb-2">
                Dual Broadcast Tickers & Watermark Customization
              </h3>

              <div>
                <label className="block text-xs font-bold text-red-400 mb-1">
                  Top Red Breaking News Ticker Text
                </label>
                <textarea
                  rows={2}
                  value={topTicker}
                  onChange={(e) => setTopTicker(e.target.value)}
                  className="w-full bg-slate-950 border border-blue-900/60 rounded-lg p-2.5 text-xs text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-blue-400 mb-1">
                  Bottom Headlines News Ticker Text
                </label>
                <textarea
                  rows={2}
                  value={bottomTicker}
                  onChange={(e) => setBottomTicker(e.target.value)}
                  className="w-full bg-slate-950 border border-blue-900/60 rounded-lg p-2.5 text-xs text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showLogo}
                    onChange={(e) => setShowLogo(e.target.checked)}
                    className="accent-red-600"
                  />
                  <span>Show AV News Today Watermark Logo Overlay</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showLiveBadge}
                    onChange={(e) => setShowLiveBadge(e.target.checked)}
                    className="accent-red-600"
                  />
                  <span>Show Blinking 🔴 LIVE Badge</span>
                </label>
              </div>

              <button
                type="button"
                onClick={handleSaveOverlays}
                className="w-full bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-500 hover:to-blue-500 text-white text-xs font-black py-2.5 rounded-lg flex items-center justify-center gap-2 shadow cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>SAVE OVERLAY SETTINGS</span>
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: L-SHAPE (L-BAND) ADS */}
          {/* ========================================================= */}
          {activeAdminTab === 'l-shape-ads' && (
            <div className="bg-[#081126] border border-blue-900/60 rounded-xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-blue-900/50 pb-2">
                <div>
                  <h3 className="text-sm font-black text-white">
                    Broadcast L-Shape (L-Band) Advertisements
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Displays broadcast-grade sponsor banners along the bottom and right edges of the
                    Live Player.
                  </p>
                </div>

                <label className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={adsEnabled}
                    onChange={(e) => setAdsEnabled(e.target.checked)}
                    className="accent-amber-500"
                  />
                  <span className="text-xs font-bold text-amber-400">ENABLE L-BAND ADS</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  <h4 className="text-xs font-bold text-amber-300">Bottom Strip Sponsor</h4>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Headline</label>
                    <input
                      type="text"
                      value={bottomAdTitle}
                      onChange={(e) => setBottomAdTitle(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Subtitle / Promo</label>
                    <input
                      type="text"
                      value={bottomAdSubtitle}
                      onChange={(e) => setBottomAdSubtitle(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="space-y-3 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  <h4 className="text-xs font-bold text-amber-300">Side Banner Sponsor</h4>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Headline</label>
                    <input
                      type="text"
                      value={sideAdTitle}
                      onChange={(e) => setSideAdTitle(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Subtitle / Promo</label>
                    <input
                      type="text"
                      value={sideAdSubtitle}
                      onChange={(e) => setSideAdSubtitle(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveAds}
                className="w-full bg-amber-600 hover:bg-amber-500 text-black text-xs font-black py-2.5 rounded-lg flex items-center justify-center gap-2 shadow cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>SAVE L-SHAPE ADS CONFIGURATION</span>
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: UPLOAD PRESTORED VIDEO FOR CATEGORY PAGES */}
          {/* ========================================================= */}
          {activeAdminTab === 'upload-video' && (
            <form
              onSubmit={handleSavePrestoredVideo}
              className="bg-[#081126] border border-blue-900/60 rounded-xl p-4 sm:p-5 space-y-4"
            >
              <div className="border-b border-blue-900/50 pb-2">
                <h3 className="text-sm font-black text-white">
                  Upload Prestored Video to Category Pages
                </h3>
                <p className="text-[11px] text-slate-300">
                  Published videos will appear in their respective section (Telangana, National,
                  Politics, Crime, etc.)
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Video Title</label>
                  <input
                    type="text"
                    required
                    value={newVideoTitle}
                    onChange={(e) => setNewVideoTitle(e.target.value)}
                    placeholder="e.g. హైదరాబాద్ లో కొత్త ప్రాజెక్ట్ ప్రారంభం..."
                    className="w-full bg-slate-950 border border-blue-900/60 rounded-lg p-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
                  <select
                    value={newVideoCategory}
                    onChange={(e) => setNewVideoCategory(e.target.value as NewsCategory)}
                    className="w-full bg-slate-950 border border-blue-900/60 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="telangana">TELANGANA (తెలంగాణ)</option>
                    <option value="national">NATIONAL (జాతీయం)</option>
                    <option value="politics">POLITICS (రాజకీయం)</option>
                    <option value="crime">CRIME (నేరాలు)</option>
                    <option value="business">BUSINESS (వాణిజ్యం)</option>
                    <option value="sports">SPORTS (క్రీడలు)</option>
                    <option value="cinema">CINEMA (సినిమా)</option>
                    <option value="health">HEALTH (ఆరోగ్యం)</option>
                    <option value="social">SOCIAL HELP (సామాజికం)</option>
                    <option value="special-report">SPECIAL REPORT (ప్రత్యేక కథనం)</option>
                    <option value="ground-report">GROUND REPORT (క్షేత్రస్థాయి)</option>
                    <option value="explainer">EXPLAINER (విశ్లేషణ)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Video URL (YouTube link or MP4)
                  </label>
                  <input
                    type="text"
                    required
                    value={newVideoUrl}
                    onChange={(e) => setNewVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full bg-slate-950 border border-blue-900/60 rounded-lg p-2 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Thumbnail Image URL
                  </label>
                  <input
                    type="text"
                    value={newVideoThumbnail}
                    onChange={(e) => setNewVideoThumbnail(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-slate-950 border border-blue-900/60 rounded-lg p-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Duration</label>
                  <input
                    type="text"
                    value={newVideoDuration}
                    onChange={(e) => setNewVideoDuration(e.target.value)}
                    placeholder="e.g. 3:45"
                    className="w-full bg-slate-950 border border-blue-900/60 rounded-lg p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Reporter / Bureau
                  </label>
                  <input
                    type="text"
                    value={newVideoReporter}
                    onChange={(e) => setNewVideoReporter(e.target.value)}
                    placeholder="e.g. హైదరాబాద్ బ్యూరో"
                    className="w-full bg-slate-950 border border-blue-900/60 rounded-lg p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={newVideoLocation}
                    onChange={(e) => setNewVideoLocation(e.target.value)}
                    placeholder="e.g. Hyderabad"
                    className="w-full bg-slate-950 border border-blue-900/60 rounded-lg p-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Article Summary / Description
                </label>
                <textarea
                  rows={2}
                  value={newVideoDesc}
                  onChange={(e) => setNewVideoDesc(e.target.value)}
                  placeholder="వార్త లేదా కథనం యొక్క సంక్షిప్త సమాచారం..."
                  className="w-full bg-slate-950 border border-blue-900/60 rounded-lg p-2 text-xs text-white"
                />
              </div>

              {/* Flags */}
              <div className="flex flex-wrap gap-4 pt-1">
                <label className="flex items-center gap-1.5 text-xs text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBreakingCheck}
                    onChange={(e) => setIsBreakingCheck(e.target.checked)}
                    className="accent-red-600"
                  />
                  <span>Mark as Breaking News</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSpecialReportCheck}
                    onChange={(e) => setIsSpecialReportCheck(e.target.checked)}
                    className="accent-red-600"
                  />
                  <span>Feature in Special Report</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isGroundReportCheck}
                    onChange={(e) => setIsGroundReportCheck(e.target.checked)}
                    className="accent-red-600"
                  />
                  <span>Feature in Ground Report</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isExplainerCheck}
                    onChange={(e) => setIsExplainerCheck(e.target.checked)}
                    className="accent-red-600"
                  />
                  <span>Feature in Explainer</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-500 hover:to-blue-500 text-white text-xs font-black py-2.5 rounded-lg flex items-center justify-center gap-2 shadow cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>PUBLISH VIDEO TO PLATFORM</span>
              </button>
            </form>
          )}

          {/* ========================================================= */}
          {/* TAB 5: TICKERS & OPINION POLL */}
          {/* ========================================================= */}
          {activeAdminTab === 'tickers-poll' && (
            <div className="space-y-6">
              {/* Tickers */}
              <div className="bg-[#081126] border border-blue-900/60 rounded-xl p-4 sm:p-5 space-y-3">
                <h3 className="text-sm font-black text-white border-b border-blue-900/50 pb-2">
                  Top Breaking News Marquee Headlines
                </h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTickerInput}
                    onChange={(e) => setNewTickerInput(e.target.value)}
                    placeholder="కొత్త బ్రేకింగ్ న్యూస్ హెడ్‌లైన్ టైప్ చేయండి..."
                    className="flex-1 bg-slate-950 border border-blue-900/60 rounded-lg p-2 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newTickerInput.trim()) return;
                      addTicker(newTickerInput);
                      setNewTickerInput('');
                      showToast('New ticker headline added!');
                    }}
                    className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                <div className="space-y-1.5 max-h-44 overflow-y-auto">
                  {tickers.map((t, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800 text-xs text-slate-200"
                    >
                      <span className="truncate pr-2">
                        {idx + 1}. {t}
                      </span>
                      <button
                        onClick={() => {
                          removeTicker(idx);
                          showToast('Headline removed.');
                        }}
                        className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Poll */}
              <form
                onSubmit={handleSavePoll}
                className="bg-[#081126] border border-blue-900/60 rounded-xl p-4 sm:p-5 space-y-3"
              >
                <h3 className="text-sm font-black text-white border-b border-blue-900/50 pb-2">
                  Manage "Your Opinion Matters" Poll
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Poll Question
                  </label>
                  <input
                    type="text"
                    value={pollQuestionInput}
                    onChange={(e) => setPollQuestionInput(e.target.value)}
                    className="w-full bg-slate-950 border border-blue-900/60 rounded-lg p-2 text-xs text-white font-bold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Option 1</label>
                    <input
                      type="text"
                      value={pollOpt1}
                      onChange={(e) => setPollOpt1(e.target.value)}
                      className="w-full bg-slate-950 border border-blue-900/60 rounded p-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Option 2</label>
                    <input
                      type="text"
                      value={pollOpt2}
                      onChange={(e) => setPollOpt2(e.target.value)}
                      className="w-full bg-slate-950 border border-blue-900/60 rounded p-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Option 3</label>
                    <input
                      type="text"
                      value={pollOpt3}
                      onChange={(e) => setPollOpt3(e.target.value)}
                      className="w-full bg-slate-950 border border-blue-900/60 rounded p-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Option 4</label>
                    <input
                      type="text"
                      value={pollOpt4}
                      onChange={(e) => setPollOpt4(e.target.value)}
                      className="w-full bg-slate-950 border border-blue-900/60 rounded p-1.5 text-xs text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer"
                >
                  Update Poll Question & Choices
                </button>
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 6: MANAGE ALL CONTENT & VIDEOS */}
          {/* ========================================================= */}
          {activeAdminTab === 'manage' && (
            <div className="bg-[#081126] border border-blue-900/60 rounded-xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-blue-900/50 pb-2">
                <h3 className="text-sm font-black text-white">
                  All Prestored Videos & News Stories ({videos.length})
                </h3>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {videos.map((vid) => (
                  <div
                    key={vid.id}
                    className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <img
                        src={vid.thumbnailUrl}
                        alt={vid.title}
                        className="w-14 h-10 object-cover rounded shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="bg-blue-950 text-blue-300 font-bold uppercase text-[9px] px-1.5 py-0.2 rounded border border-blue-800">
                            {vid.category}
                          </span>
                          <span className="text-[10px] text-slate-400">{vid.uploadedAt}</span>
                        </div>
                        <h5 className="font-bold text-white truncate mt-0.5">{vid.title}</h5>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          addLiveStream({
                            title: vid.title,
                            channelName: 'AV FEATURED LIVE',
                            streamUrl: vid.videoUrl,
                            streamType: 'youtube',
                            isActive: true,
                            viewerCount: 42000,
                            quality: '1080p HD',
                            category: vid.category,
                          });
                          showToast(`Set "${vid.title.slice(0, 30)}..." to Active Live Stream!`);
                        }}
                        className="bg-red-600/80 hover:bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded cursor-pointer"
                        title="Broadcast this video as Live"
                      >
                        Make Live
                      </button>

                      <button
                        onClick={() => {
                          deleteVideo(vid.id);
                          showToast('Video removed from platform.');
                        }}
                        className="p-1 rounded bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 cursor-pointer"
                        title="Delete Video"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 7: JOURNALIST & MEMBER REGISTRATIONS (GOVT PROOFS) */}
          {/* ========================================================= */}
          {activeAdminTab === 'registrations' && (
            <div className="space-y-5">
              <div className="bg-[#081126] border border-blue-900/60 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span>JOURNALIST & GENERALIST REGISTRATIONS REVIEW</span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Review submitted government identity proofs (Aadhaar, PAN, DL, Voter ID) and approve
                    accredited access.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search member, email, proof..."
                      value={regSearchQuery}
                      onChange={(e) => setRegSearchQuery(e.target.value)}
                      className="bg-[#060c1d] border border-blue-900/70 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 w-44 sm:w-60"
                    />
                  </div>
                </div>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1">
                {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => {
                  const count =
                    st === 'all'
                      ? allJournalists.length
                      : allJournalists.filter((j) => j.status === st).length;
                  return (
                    <button
                      key={st}
                      onClick={() => setRegStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-lg font-bold uppercase transition-colors cursor-pointer ${
                        regStatusFilter === st
                          ? 'bg-blue-600 text-white shadow'
                          : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      {st === 'all' ? 'All Registrations' : st} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Registrations List */}
              <div className="space-y-3">
                {allJournalists
                  .filter((j) => regStatusFilter === 'all' || j.status === regStatusFilter)
                  .filter((j) => {
                    const q = regSearchQuery.toLowerCase().trim();
                    if (!q) return true;
                    return (
                      j.fullName.toLowerCase().includes(q) ||
                      j.email.toLowerCase().includes(q) ||
                      j.phone.toLowerCase().includes(q) ||
                      j.govtProofNumber.toLowerCase().includes(q) ||
                      j.cityDistrict.toLowerCase().includes(q)
                    );
                  })
                  .map((user) => (
                    <div
                      key={user.id}
                      className="bg-[#081126] border border-blue-900/60 hover:border-blue-700/80 rounded-xl p-4 transition-colors space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-900/40 pb-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatarUrl}
                            alt={user.fullName}
                            onError={(e) => {
                              e.currentTarget.src =
                                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
                            }}
                            className="w-12 h-12 rounded-xl object-cover border border-blue-500/60 shadow"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-black text-white">{user.fullName}</h4>
                              {user.status === 'approved' && (
                                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded border border-emerald-500/40 flex items-center gap-1">
                                  <ShieldCheck className="w-3 h-3" />
                                  <span>APPROVED PRESS</span>
                                </span>
                              )}
                              {user.status === 'pending' && (
                                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded border border-amber-500/40 animate-pulse">
                                  PENDING VERIFICATION
                                </span>
                              )}
                              {user.status === 'rejected' && (
                                <span className="bg-red-500/20 text-red-300 text-[10px] font-black px-2 py-0.5 rounded border border-red-500/40">
                                  REJECTED
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-amber-300">
                              {user.designation || 'AV Life Generalist'} · {user.cityDistrict},{' '}
                              {user.state}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              Press ID: <strong className="text-white">{user.journalistId}</strong>
                            </p>
                          </div>
                        </div>

                        {/* Status Actions */}
                        <div className="flex items-center gap-2">
                          {user.status === 'pending' && (
                            <>
                              <button
                                onClick={() => {
                                  updateJournalistStatus(user.id, 'approved');
                                  showToast(
                                    `Accreditation Approved for ${user.fullName}! User can now login.`
                                  );
                                }}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow cursor-pointer transition-transform hover:scale-105"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>APPROVE & VERIFY</span>
                              </button>

                              <button
                                onClick={() => {
                                  setRejectingUserId(user.id);
                                  setRejectionReasonInput('');
                                }}
                                className="bg-slate-800 hover:bg-red-950 text-red-400 hover:text-red-300 text-xs font-bold px-3 py-1.5 rounded-lg border border-red-500/30 flex items-center gap-1 cursor-pointer"
                              >
                                <UserX className="w-3.5 h-3.5" />
                                <span>REJECT</span>
                              </button>
                            </>
                          )}

                          {user.status === 'approved' && (
                            <button
                              onClick={() => {
                                updateJournalistStatus(user.id, 'rejected', 'Revoked by Editorial Board');
                                showToast(`Accreditation revoked for ${user.fullName}`);
                              }}
                              className="text-[11px] text-slate-400 hover:text-red-400 underline cursor-pointer"
                            >
                              Revoke Press Pass
                            </button>
                          )}

                          {user.status === 'rejected' && (
                            <button
                              onClick={() => {
                                updateJournalistStatus(user.id, 'approved');
                                showToast(`Re-approved ${user.fullName}`);
                              }}
                              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded cursor-pointer"
                            >
                              Re-Approve Access
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Details & Proof Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-[#060c1d] p-3 rounded-lg border border-blue-900/40">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                            Contact Credentials:
                          </span>
                          <span className="font-bold text-white block truncate">{user.email}</span>
                          <span className="text-slate-300 text-[11px] block">{user.phone}</span>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            Applied: {user.appliedAt}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                            Government ID Proof Attached:
                          </span>
                          <span className="font-bold text-amber-300 uppercase block">
                            {user.govtProofType}
                          </span>
                          <span className="font-mono text-white text-[11px] block">
                            ID: {user.govtProofNumber}
                          </span>
                        </div>

                        <div className="flex flex-col justify-center items-start sm:items-end">
                          <button
                            type="button"
                            onClick={() => setSelectedProofUser(user)}
                            className="bg-blue-950 hover:bg-blue-900 border border-blue-500/50 text-blue-300 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow transition-colors"
                          >
                            <IdCard className="w-3.5 h-3.5 text-blue-400" />
                            <span>INSPECT GOVT PROOF SCAN</span>
                          </button>
                        </div>
                      </div>

                      {user.reviewNotes && (
                        <p className="text-[11px] text-red-300 italic bg-red-950/40 p-2 rounded border border-red-500/30">
                          Rejection Reason: {user.reviewNotes}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 8: JOURNALIST NEWS VERIFICATION & MODERATION DESK */}
          {/* ========================================================= */}
          {activeAdminTab === 'news-verification' && (
            <div className="space-y-5">
              <div className="bg-[#081126] border border-blue-900/60 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-400" />
                    <span>JOURNALIST NEWS VERIFICATION & BROADCAST DESK</span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Review and verify submitted short ground reports and in-depth articles. Select target
                    category to publish on Home Page and Category channels!
                  </p>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search headline or journalist..."
                    value={newsSearchQuery}
                    onChange={(e) => setNewsSearchQuery(e.target.value)}
                    className="bg-[#060c1d] border border-blue-900/70 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 w-44 sm:w-60"
                  />
                </div>
              </div>

              {/* Detailed Level Filterization Toolbar */}
              <div className="bg-[#060c1d] border border-blue-900/50 p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
                {/* Status Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Status:
                  </span>
                  {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setNewsStatusFilter(st)}
                      className={`px-2.5 py-1 rounded font-bold uppercase transition-colors cursor-pointer ${
                        newsStatusFilter === st
                          ? 'bg-red-600 text-white shadow'
                          : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                {/* Format Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Format:
                  </span>
                  {[
                    { id: 'all', label: 'All Formats' },
                    { id: 'short', label: 'Short News' },
                    { id: 'article', label: 'Articles' },
                    { id: 'audio', label: 'Voice Notes' },
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      onClick={() => setNewsFormatFilter(fmt.id as any)}
                      className={`px-2.5 py-1 rounded font-bold transition-colors cursor-pointer ${
                        newsFormatFilter === fmt.id
                          ? 'bg-blue-600 text-white shadow'
                          : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* News Submissions Stream */}
              <div className="space-y-4">
                {allNewsSubmissions
                  .filter((s) => newsStatusFilter === 'all' || s.status === newsStatusFilter)
                  .filter((s) => {
                    if (newsFormatFilter === 'all') return true;
                    if (newsFormatFilter === 'short') return s.format === 'short';
                    if (newsFormatFilter === 'article') return s.format === 'article';
                    if (newsFormatFilter === 'audio') return s.audios && s.audios.length > 0;
                    return true;
                  })
                  .filter((s) => {
                    const q = newsSearchQuery.toLowerCase().trim();
                    if (!q) return true;
                    return (
                      s.title.toLowerCase().includes(q) ||
                      (s.titleTelugu && s.titleTelugu.toLowerCase().includes(q)) ||
                      s.journalistName.toLowerCase().includes(q) ||
                      s.journalistId.toLowerCase().includes(q)
                    );
                  })
                  .map((sub) => {
                    const isArticle = sub.format === 'article';
                    return (
                      <div
                        key={sub.id}
                        className="bg-[#081126] border border-blue-900/60 hover:border-blue-700/80 rounded-xl p-4 transition-colors space-y-3"
                      >
                        {/* Journalist Header & Status */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-900/40 pb-2">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={sub.journalistAvatar}
                              alt={sub.journalistName}
                              className="w-9 h-9 rounded-full object-cover border border-amber-500"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-black text-xs text-white">
                                  {sub.journalistName}
                                </span>
                                <span className="text-[10px] font-mono text-amber-300">
                                  ({sub.journalistId})
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400">
                                {sub.journalistDesignation} · Submitted {sub.submittedAt}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                                isArticle
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                              }`}
                            >
                              {isArticle
                                ? `📰 ARTICLE (${sub.images.length} Photos)`
                                : '⚡ SHORT NEWS'}
                            </span>

                            {sub.status === 'approved' && (
                              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded border border-emerald-500/40 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>LIVE ON AIR ({sub.assignedCategory || 'home'})</span>
                              </span>
                            )}

                            {sub.status === 'pending' && (
                              <span className="bg-amber-500/20 text-amber-400 text-[10px] font-black px-2 py-0.5 rounded border border-amber-500/40 animate-pulse">
                                PENDING APPROVAL
                              </span>
                            )}

                            {sub.status === 'rejected' && (
                              <span className="bg-red-500/20 text-red-400 text-[10px] font-black px-2 py-0.5 rounded border border-red-500/40">
                                REJECTED
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Title & Preview Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                          {sub.images && sub.images.length > 0 && (
                            <div className="sm:col-span-3 space-y-1">
                              <div className="relative rounded-lg overflow-hidden h-28 bg-slate-900 border border-slate-800">
                                <img
                                  src={sub.images[0]}
                                  alt={sub.title}
                                  className="w-full h-full object-cover"
                                />
                                {sub.images.length > 1 && (
                                  <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                    +{sub.images.length - 1} photos
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          <div
                            className={
                              sub.images && sub.images.length > 0
                                ? 'sm:col-span-9 space-y-1.5'
                                : 'sm:col-span-12 space-y-1.5'
                            }
                          >
                            <h4 className="text-sm font-black text-white">{sub.title}</h4>
                            {sub.titleTelugu && (
                              <h5 className="text-xs font-bold text-amber-300">{sub.titleTelugu}</h5>
                            )}
                            <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                              {sub.summary || sub.content}
                            </p>

                            {/* Audio Player if present */}
                            {sub.audios && sub.audios.length > 0 && (
                              <div className="flex items-center gap-2 bg-[#060c1d] p-1.5 rounded-lg border border-blue-900/40 mt-1">
                                <Volume2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />
                                <span className="text-[10px] font-bold text-emerald-300">
                                  Spoken Audio Report:
                                </span>
                                <audio src={sub.audios[0]} controls className="h-6 flex-1 max-w-xs" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Admin Action Buttons */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-blue-900/40">
                          <div className="text-[11px] text-slate-400 flex items-center gap-2">
                            <span>Location: {sub.location || 'Telangana'}</span>
                            {sub.tags && (
                              <span>· Tags: {sub.tags.join(', ')}</span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {isArticle && (
                              <button
                                onClick={() => setSelectedArticle(sub)}
                                className="bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                              >
                                Preview Article View
                              </button>
                            )}

                            {sub.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => {
                                    setVerifyingNewsItem(sub);
                                    setVerifyCategory(sub.assignedCategory || 'all');
                                    setVerifyFeedback('');
                                  }}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-4 py-1.5 rounded-lg flex items-center gap-1.5 shadow cursor-pointer transition-transform hover:scale-105"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>VERIFY & APPROVE NEWS</span>
                                </button>

                                <button
                                  onClick={() => {
                                    setRejectingNewsId(sub.id);
                                    setRejectNewsFeedback('');
                                  }}
                                  className="bg-slate-800 hover:bg-red-950 text-red-400 hover:text-red-300 text-xs font-bold px-3 py-1.5 rounded-lg border border-red-500/30 cursor-pointer"
                                >
                                  REJECT
                                </button>
                              </>
                            )}

                            {sub.status === 'approved' && (
                              <button
                                onClick={() => {
                                  rejectNews(sub.id, 'Unpublished by Editorial Board');
                                  showToast('News story removed from broadcast.');
                                }}
                                className="text-[11px] text-slate-400 hover:text-red-400 underline cursor-pointer"
                              >
                                Unpublish
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: AV RADIO VOICE SUBMISSIONS & EDITORIAL DESK */}
          {/* ========================================================= */}
          {activeAdminTab === 'av-radio' && (
            <div className="space-y-5">
              <RadioModerationSettings />
              {/* Audio preview with scrubbing */}
              <audio
                ref={adminAudioRef}
                onEnded={() => setPlayingVoiceId(null)}
                controls
                className="w-full h-10"
              />

              {/* Stats Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#081126] border border-blue-900/60 rounded-xl p-3.5 shadow">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    TOTAL SUBMISSIONS
                  </div>
                  <div className="text-xl font-black text-white mt-1">
                    {allRadioVoices.length}
                  </div>
                  <div className="text-[10px] text-blue-400 mt-0.5">Recorded voices</div>
                </div>

                <div className="bg-[#081126] border border-amber-500/40 rounded-xl p-3.5 shadow">
                  <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                    PENDING REVIEW
                  </div>
                  <div className="text-xl font-black text-amber-300 mt-1">
                    {allRadioVoices.filter((v) => v.status === 'pending').length}
                  </div>
                  <div className="text-[10px] text-amber-400/80 mt-0.5 animate-pulse">
                    Requires editorial action
                  </div>
                </div>

                <div className="bg-[#081126] border border-emerald-500/40 rounded-xl p-3.5 shadow">
                  <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                    ON-AIR (APPROVED)
                  </div>
                  <div className="text-xl font-black text-emerald-300 mt-1">
                    {allRadioVoices.filter((v) => v.status === 'approved').length}
                  </div>
                  <div className="text-[10px] text-emerald-400/80 mt-0.5">Live on AV Radio</div>
                </div>

                <div className="bg-[#081126] border border-red-500/30 rounded-xl p-3.5 shadow">
                  <div className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
                    REJECTED
                  </div>
                  <div className="text-xl font-black text-red-300 mt-1">
                    {allRadioVoices.filter((v) => v.status === 'rejected').length}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Not approved</div>
                </div>
              </div>

              {/* Filter and Search Bar */}
              <div className="bg-[#081126] border border-blue-900/60 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow">
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                  {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setVoiceStatusFilter(st)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg capitalize cursor-pointer transition-all ${
                        voiceStatusFilter === st
                          ? 'bg-amber-500 text-black shadow'
                          : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      {st === 'all'
                        ? `All (${allRadioVoices.length})`
                        : st === 'pending'
                        ? `Pending (${allRadioVoices.filter((v) => v.status === 'pending').length})`
                        : st === 'approved'
                        ? `Approved (${allRadioVoices.filter((v) => v.status === 'approved').length})`
                        : `Rejected (${allRadioVoices.filter((v) => v.status === 'rejected').length})`}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={voiceSearchQuery}
                    onChange={(e) => setVoiceSearchQuery(e.target.value)}
                    placeholder="Search voices or speaker..."
                    className="w-full bg-[#050a17] border border-blue-900/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Voices List */}
              <div className="space-y-3">
                {allRadioVoices
                  .filter((v) => voiceStatusFilter === 'all' || v.status === voiceStatusFilter)
                  .filter((v) => {
                    const q = voiceSearchQuery.toLowerCase().trim();
                    if (!q) return true;
                    return (
                      v.title.toLowerCase().includes(q) ||
                      (v.titleTelugu && v.titleTelugu.toLowerCase().includes(q)) ||
                      v.userName.toLowerCase().includes(q) ||
                      (v.userCity && v.userCity.toLowerCase().includes(q))
                    );
                  })
                  .map((voice) => {
                    const isVoicePlaying = playingVoiceId === voice.id;

                    return (
                      <div
                        key={voice.id}
                        data-voice-id={voice.id}
                        className={`bg-[#081126] border rounded-xl p-4 transition-all space-y-3 shadow-md ${
                          isVoicePlaying
                            ? 'border-amber-400 bg-[#0c1836]'
                            : 'border-blue-900/60 hover:border-blue-700/80'
                        }`}
                      >
                        {/* Header: Submitter info and Status */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-900/40 pb-2.5">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-blue-950 border border-blue-700 flex items-center justify-center shrink-0">
                              <Mic className="w-4 h-4 text-amber-400" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-black text-xs text-white truncate">
                                  {voice.userName}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400">
                                  • {voice.userRole || 'Citizen Voice'}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400 flex items-center gap-2">
                                <span>{voice.userCity || 'Telangana'}</span>
                                <span>•</span>
                                <span>Submitted: {voice.submittedAt}</span>
                                <span>•</span>
                                <span className="font-mono text-amber-300">
                                  Duration: {voice.duration}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {voice.status === 'approved' && (
                              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-2.5 py-0.5 rounded border border-emerald-500/40 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>APPROVED & LIVE ON AIR</span>
                              </span>
                            )}
                            {voice.status === 'pending' && (
                              <span className="bg-amber-500/20 text-amber-400 text-[10px] font-black px-2.5 py-0.5 rounded border border-amber-500/40 animate-pulse flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                <span>PENDING EDITORIAL REVIEW</span>
                              </span>
                            )}
                            {voice.status === 'rejected' && (
                              <span className="bg-red-500/20 text-red-400 text-[10px] font-black px-2.5 py-0.5 rounded border border-red-500/40">
                                REJECTED
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Title and Audio Player Row */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#050a17] p-3 rounded-xl border border-blue-900/60">
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-black text-white">
                                {voice.titleTelugu || voice.title}
                              </h4>
                              {/* Edit Title Button */}
                              <button
                                onClick={() => {
                                  setEditingVoice(voice);
                                  setEditTitleInput(voice.title);
                                  setEditTitleTeluguInput(voice.titleTelugu || voice.title);
                                }}
                                className="p-1 rounded hover:bg-slate-800 text-amber-400 hover:text-amber-300 cursor-pointer transition-colors"
                                title="Change Voice Title (శీర్షికను మార్చండి)"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {editingVoice?.id === voice.id && <form className="space-y-2 mt-2" onSubmit={(event) => {
                              event.preventDefault(); updateRadioVoiceTitle(voice.id, editTitleInput.trim(), editTitleTeluguInput.trim()); setEditingVoice(null); showToast('Voice title updated.');
                            }}>
                              <label className="block text-xs">English title<input required aria-label="Voice English title" value={editTitleInput} onChange={(event) => setEditTitleInput(event.target.value)} className="block w-full rounded bg-slate-950 border border-blue-800 p-2 mt-1" /></label>
                              <label className="block text-xs">Telugu title<input aria-label="Voice Telugu title" value={editTitleTeluguInput} onChange={(event) => setEditTitleTeluguInput(event.target.value)} className="block w-full rounded bg-slate-950 border border-blue-800 p-2 mt-1" /></label>
                              <div className="flex gap-3 text-xs"><button className="rounded bg-blue-600 px-3 py-1.5">Save title</button><button type="button" onClick={() => setEditingVoice(null)}>Cancel</button></div>
                            </form>}
                            {voice.titleTelugu && voice.titleTelugu !== voice.title && (
                              <p className="text-xs text-slate-400">{voice.title}</p>
                            )}

                            {voice.adminFeedback && (
                              <p className="text-[11px] text-red-300 italic">
                                Note: {voice.adminFeedback}
                              </p>
                            )}
                          </div>

                          {/* Listen & Review Audio Player */}
                          <div className="flex items-center gap-3 shrink-0">
                            <button
                              onClick={async () => {
                                if (isVoicePlaying) {
                                  if (adminAudioRef.current) adminAudioRef.current.pause();
                                  setPlayingVoiceId(null);
                                } else {
                                  setPlayingVoiceId(voice.id);
                                  if (adminAudioRef.current) {
                                    try {
                                      const audio = adminAudioRef.current;
                                      const url = await resolveMedia(voice.audioUrl);
                                      if (audio.src.startsWith('blob:')) URL.revokeObjectURL(audio.src);
                                      audio.src = url;
                                    } catch { showToast('This recording could not be loaded from browser storage.'); setPlayingVoiceId(null); return; }
                                    adminAudioRef.current.play().catch(() => {});
                                  }
                                }
                              }}
                              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black shadow cursor-pointer transition-all ${
                                isVoicePlaying
                                  ? 'bg-amber-400 text-black hover:bg-amber-300'
                                  : 'bg-red-600 hover:bg-red-500 text-white'
                              }`}
                            >
                              {isVoicePlaying ? (
                                <>
                                  <Pause className="w-4 h-4 fill-black" />
                                  <span>PAUSE AUDIO</span>
                                </>
                              ) : (
                                <>
                                  <Play className="w-4 h-4 fill-white ml-0.5" />
                                  <span>LISTEN VOICE ({voice.duration})</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Action Buttons: Approve, Reject, Edit Title, Delete */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                          <div className="flex items-center gap-2">
                            {voice.status !== 'approved' && (
                              <button
                                onClick={() => {
                                  approveRadioVoice(voice.id);
                                  showToast(`Voice "${voice.title}" approved and published to AV Radio!`);
                                }}
                                className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black px-4 py-2 rounded-lg shadow cursor-pointer transition-transform hover:scale-102"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>APPROVE & PUBLISH TO AV RADIO</span>
                              </button>
                            )}

                            {voice.status === 'pending' && (
                              <button
                                onClick={() => {
                                  setRejectingVoiceId(voice.id);
                                  setRejectVoiceReason('');
                                }}
                                className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-red-950/60 text-slate-300 hover:text-red-300 border border-slate-700 hover:border-red-500/50 text-xs font-bold px-3 py-2 rounded-lg cursor-pointer transition-colors"
                              >
                                <UserX className="w-3.5 h-3.5" />
                                <span>REJECT</span>
                              </button>
                            )}

                            {voice.status === 'approved' && (
                              <button
                                onClick={() => {
                                  rejectRadioVoice(voice.id, 'Unpublished by Editorial Board');
                                  showToast('Voice unpublished from AV Radio.');
                                }}
                                className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-amber-400 underline cursor-pointer"
                              >
                                <span>Unpublish from AV Radio</span>
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingVoice(voice);
                                setEditTitleInput(voice.title);
                                setEditTitleTeluguInput(voice.titleTelugu || voice.title);
                              }}
                              className="inline-flex items-center gap-1.5 bg-blue-950/80 hover:bg-blue-900 text-blue-200 border border-blue-600/50 text-xs font-bold px-3 py-2 rounded-lg cursor-pointer transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                              <span>Change Title</span>
                            </button>

                            {/* Delete Voice (can delete pending OR already approved voices) */}
                            <button
                              onClick={() => {
                                if (
                                  confirm(
                                    `Are you sure you want to permanently delete "${voice.title}"?`
                                  )
                                ) {
                                  deleteRadioVoice(voice.id);
                                  showToast('Voice recording deleted permanently.');
                                }
                              }}
                              className="inline-flex items-center gap-1 bg-red-950/50 hover:bg-red-900 border border-red-800/60 text-red-300 hover:text-white text-xs font-bold px-3 py-2 rounded-lg cursor-pointer transition-colors"
                              title="Delete voice"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: GOVT PROOF INSPECTOR (POPUP DIALOG) */}
      {/* ========================================================= */}
      {selectedProofUser && (
        <div className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4">
          <div className="bg-[#091226] border border-blue-500 rounded-2xl p-5 max-w-lg w-full space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-blue-900/60 pb-2">
              <div className="flex items-center gap-2">
                <IdCard className="w-5 h-5 text-amber-400" />
                <h4 className="text-sm font-black text-white">GOVT PROOF DOCUMENT VERIFICATION</h4>
              </div>
              <button
                onClick={() => setSelectedProofUser(null)}
                className="p-1 rounded-full bg-slate-800 text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-slate-300">
                Journalist: <strong className="text-white">{selectedProofUser.fullName}</strong> (
                {selectedProofUser.email})
              </p>
              <p className="text-slate-300">
                Proof Type:{' '}
                <strong className="text-amber-400 uppercase">
                  {selectedProofUser.govtProofType}
                </strong>{' '}
                · ID Number:{' '}
                <span className="font-mono text-white font-bold">
                  {selectedProofUser.govtProofNumber}
                </span>
              </p>
            </div>

            <div className="relative rounded-xl overflow-hidden bg-black border border-slate-700 max-h-72 flex items-center justify-center">
              <img
                src={selectedProofUser.govtProofDocumentUrl}
                alt="Govt proof scan"
                className="max-h-72 w-full object-contain"
              />
              <span className="absolute bottom-2 right-2 bg-black/80 text-[9px] text-amber-300 font-mono px-2 py-0.5 rounded border border-amber-500/40">
                CONFIDENTIAL VERIFICATION RECORD
              </span>
            </div>

            <div className="flex gap-2 pt-2">
              {selectedProofUser.status === 'pending' && (
                <button
                  onClick={() => {
                    updateJournalistStatus(selectedProofUser.id, 'approved');
                    showToast(`Accreditation approved for ${selectedProofUser.fullName}!`);
                    setSelectedProofUser(null);
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs py-2 rounded-lg cursor-pointer"
                >
                  Approve Member Accreditation
                </button>
              )}
              <button
                onClick={() => setSelectedProofUser(null)}
                className="px-4 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-2 rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: VERIFY & SELECT BROADCAST CATEGORY MODAL */}
      {/* ========================================================= */}
      {verifyingNewsItem && (
        <div className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4">
          <div className="bg-[#091226] border-2 border-emerald-500 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-blue-900/60 pb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h4 className="text-sm font-black text-white">VERIFY & APPROVE NEWS DISPATCH</h4>
              </div>
              <button
                onClick={() => setVerifyingNewsItem(null)}
                className="p-1 rounded-full bg-slate-800 text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <h5 className="text-xs font-bold text-white line-clamp-2">
                {verifyingNewsItem.title}
              </h5>
              <p className="text-[11px] text-slate-400">
                Reporter: {verifyingNewsItem.journalistName} ({verifyingNewsItem.journalistId})
              </p>
            </div>

            {/* Category Dropdown Selection (as requested by user) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-amber-300">
                Select a category to post this news (Optional):
              </label>
              <select
                value={verifyCategory}
                onChange={(e) => setVerifyCategory(e.target.value as any)}
                className="w-full bg-[#060c1d] border border-blue-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="all">Home & General News (Default / No category)</option>
                <option value="telangana">Telangana News (తెలంగాణ వార్తలు)</option>
                <option value="national">National & World (జాతీయ వార్తలు)</option>
                <option value="politics">Politics (రాజకీయాలు)</option>
                <option value="crime">Crime & Law (నేరాలు & చట్టం)</option>
                <option value="business">Business & Economy (వాణిజ్యం)</option>
                <option value="sports">Sports (క్రీడలు)</option>
                <option value="cinema">Cinema & Entertainment (సినిమా)</option>
                <option value="health">Health & Wellness (ఆరోగ్యం)</option>
                <option value="social">Social & Public Voice (సామాజిక స్పృహ)</option>
                <option value="special-report">Special Report (ప్రత్యేక పరిశోధన కథనం)</option>
                <option value="ground-report">Ground Report (క్షేత్రస్థాయి నివేదిక)</option>
                <option value="explainer">Explainer & Analysis (విశ్లేషణ)</option>
              </select>
              <p className="text-[10px] text-slate-300 leading-relaxed italic bg-blue-950/40 p-2 rounded border border-blue-900/60">
                ℹ️ <strong>Broadcast Rule:</strong> Whatever category is selected, this approved news will
                be prominently listed on the <strong>Home Page</strong> AND in the{' '}
                <strong>Selected Category</strong> page!
              </p>
            </div>

            {/* Optional Editorial Feedback */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                Editorial Feedback / Commendation (Optional):
              </label>
              <input
                type="text"
                value={verifyFeedback}
                onChange={(e) => setVerifyFeedback(e.target.value)}
                placeholder="e.g. Excellent ground coverage, approved for prime bulletin."
                className="w-full bg-[#060c1d] border border-blue-900/70 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  verifyAndApproveNews(verifyingNewsItem.id, verifyCategory, verifyFeedback);
                  showToast(
                    `News approved & published to Home & ${
                      verifyCategory === 'all' ? 'General' : verifyCategory
                    }!`
                  );
                  setVerifyingNewsItem(null);
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs py-2.5 rounded-lg shadow-lg cursor-pointer transition-transform hover:scale-102"
              >
                CONFIRM & PUBLISH ON AIR
              </button>

              <button
                type="button"
                onClick={() => setVerifyingNewsItem(null)}
                className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold py-2.5 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Prompt Modal */}
      {rejectingUserId && (
        <div className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4">
          <div className="bg-[#091226] border border-red-500 rounded-xl p-5 max-w-sm w-full space-y-3 shadow-2xl">
            <h4 className="text-sm font-black text-white flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span>Reject Member Registration</span>
            </h4>
            <p className="text-xs text-slate-300">
              Provide reason for rejection (e.g. illegible government ID proof):
            </p>
            <input
              type="text"
              value={rejectionReasonInput}
              onChange={(e) => setRejectionReasonInput(e.target.value)}
              placeholder="e.g. Govt ID photo is blurry / expired"
              className="w-full bg-[#060c1d] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
            />
            <div className="flex gap-2 justify-end pt-1">
              <button
                onClick={() => setRejectingUserId(null)}
                className="px-3 py-1.5 bg-slate-800 text-xs text-slate-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateJournalistStatus(rejectingUserId, 'rejected', rejectionReasonInput);
                  showToast('Member registration rejected.');
                  setRejectingUserId(null);
                }}
                className="px-3 py-1.5 bg-red-600 text-xs font-bold text-white rounded"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejecting News Modal */}
      {rejectingNewsId && (
        <div className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4">
          <div className="bg-[#091226] border border-red-500 rounded-xl p-5 max-w-sm w-full space-y-3 shadow-2xl">
            <h4 className="text-sm font-black text-white flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span>Reject News Submission</span>
            </h4>
            <p className="text-xs text-slate-300">
              State editorial feedback for the journalist to revise:
            </p>
            <input
              type="text"
              value={rejectNewsFeedback}
              onChange={(e) => setRejectNewsFeedback(e.target.value)}
              placeholder="e.g. Needs additional source verification"
              className="w-full bg-[#060c1d] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
            />
            <div className="flex gap-2 justify-end pt-1">
              <button
                onClick={() => setRejectingNewsId(null)}
                className="px-3 py-1.5 bg-slate-800 text-xs text-slate-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  rejectNews(rejectingNewsId, rejectNewsFeedback);
                  showToast('News report rejected.');
                  setRejectingNewsId(null);
                }}
                className="px-3 py-1.5 bg-red-600 text-xs font-bold text-white rounded"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CHANGE VOICE TITLE */}
      {rejectingVoiceId && (
        <div className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4">
          <div className="bg-[#091226] border border-red-500 rounded-xl p-5 max-w-sm w-full space-y-3 shadow-2xl">
            <h4 className="text-sm font-black text-white flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span>Reject Voice Recording</span>
            </h4>
            <p className="text-xs text-slate-300">
              State editorial rejection reason / context note:
            </p>
            <input
              type="text"
              value={rejectVoiceReason}
              onChange={(e) => setRejectVoiceReason(e.target.value)}
              placeholder="e.g. Unclear audio / inappropriate context"
              className="w-full bg-[#060c1d] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
            />
            <div className="flex gap-2 justify-end pt-1">
              <button
                onClick={() => setRejectingVoiceId(null)}
                className="px-3 py-1.5 bg-slate-800 text-xs text-slate-300 rounded cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  rejectRadioVoice(rejectingVoiceId, rejectVoiceReason);
                  showToast('Voice rejected.');
                  setRejectingVoiceId(null);
                }}
                className="px-3 py-1.5 bg-red-600 text-xs font-bold text-white rounded cursor-pointer"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
