export type NewsCategory =
  | 'telangana'
  | 'national'
  | 'politics'
  | 'crime'
  | 'business'
  | 'sports'
  | 'cinema'
  | 'health'
  | 'social'
  | 'special-report'
  | 'ground-report'
  | 'explainer';

export interface VideoItem {
  id: string;
  title: string;
  titleTelugu?: string;
  category: NewsCategory;
  videoUrl: string;
  thumbnailUrl: string;
  duration: string;
  reporter: string;
  location?: string;
  description: string;
  tags: string[];
  uploadedAt: string;
  views: number;
  isLive?: boolean;
  isBreaking?: boolean;
  isSpecialReport?: boolean;
  isGroundReport?: boolean;
  isExplainer?: boolean;
}

export type StreamType = 'youtube' | 'hls' | 'mp4' | 'webrtc' | 'embed';

export interface BroadcastProgram {
  id: string;
  title: string;
  anchor: string;
  category: string;
  startAt: string;
  durationMinutes: 30 | 60;
  streamId: string;
  fallbackStreamId?: string;
}

export interface SponsorCreative {
  id: string;
  title: string;
  sideImage: string;
  bottomImage: string;
  targetUrl: string;
  phone: string;
}

export interface LiveStreamConfig {
  id: string;
  title: string;
  channelName: string;
  streamUrl: string;
  streamType: StreamType;
  youtubePlaylist?: string[];
  isActive: boolean;
  viewerCount: number;
  quality: string;
  category: string;
  description?: string;
  provider?: 'yupptv';
  channelCode?: string;
}

export interface BroadcastSettings {
  fallbackPresetVersion?: number;
  schedulerEnabled?: boolean;
  fallbackStreamId?: string;
  breakingFlashEnabled?: boolean;
  breakingFlashText?: string;
  teluguTickerItems?: string[];
  englishTickerItems?: string[];
  tickerSpeed?: number;
  tickerOpacity?: number;
  watermarkPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  watermarkScale?: number;
  viewport?: { scale: number; panX: number; panY: number; fit: 'contain' | 'cover' | 'fill' };
  adSideWidth?: number;
  adBottomHeight?: number;
  adRotationSeconds?: number;
  adCreatives?: SponsorCreative[];
  foundationLogoUrl?: string;
  videoFraming?: {
    zoomX: number;
    zoomY: number;
    focusX: number;
    focusY: number;
  };
  channelLogoUrl?: string;
  topTickerText: string;
  bottomTickerText: string;
  isLiveBadgeVisible: boolean;
  isChannelLogoVisible: boolean;
  lShapeAdsEnabled: boolean;
  lShapeBottomAd: {
    tag: string;
    title: string;
    subtitle: string;
    bannerUrl?: string;
    targetUrl?: string;
    phone?: string;
  };
  lShapeSideAd: {
    tag: string;
    title: string;
    subtitle: string;
    bannerUrl?: string;
    targetUrl?: string;
    phone?: string;
  };
  radioStreamUrl: string;
  radioTitle: string;
  radioIsLive: boolean;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface PollData {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  userVotedOptionId: string | null;
}

export interface ChatMessage {
  id: string;
  user: string;
  text: string;
  timestamp: string;
  isAnchor?: boolean;
  isVerified?: boolean;
  avatarColor?: string;
}

export interface EPGProgram {
  id: string;
  time: string;
  title: string;
  host: string;
  category: string;
  isCurrent: boolean;
}

export interface PhotoStory {
  id: string;
  title: string;
  caption: string;
  imageUrl: string;
  photographer: string;
  date: string;
}

export interface UpcomingEvent {
  id: string;
  month: string;
  day: string;
  title: string;
  dateTime: string;
  location: string;
  description: string;
}

export type GovtProofType =
  | 'aadhar'
  | 'pan'
  | 'driving_license'
  | 'voter_id'
  | 'passport';

export type RegistrationStatus = 'pending' | 'approved' | 'rejected';

export interface JournalistUser {
  id: string;
  journalistId: string; // e.g. "AV-JOURN-2026-4821"
  fullName: string;
  email: string;
  password: string;
  phone: string;
  designation: string; // e.g. "AV Life Generalist / Senior Bureau Reporter"
  cityDistrict: string;
  state: string;
  bio?: string;
  avatarUrl: string;
  govtProofType: GovtProofType;
  govtProofNumber: string;
  govtProofDocumentUrl: string;
  status: RegistrationStatus;
  appliedAt: string;
  reviewedAt?: string;
  reviewNotes?: string;
  qrCodeData?: string;
}

export type NewsFormatType = 'short' | 'article';
export type SubmissionStatus = 'pending' | 'approved' | 'rejected';

export interface JournalistNewsSubmission {
  id: string;
  userId: string;
  journalistId: string;
  journalistName: string;
  journalistDesignation: string;
  journalistAvatar: string;
  format: NewsFormatType;
  title: string;
  titleTelugu?: string;
  content: string;
  summary?: string;
  images: string[]; // Minimum 1 for short, Minimum 2 for article
  videos: string[];
  audios: string[]; // voice notes / audio reports
  location?: string;
  tags: string[];
  status: SubmissionStatus;
  assignedCategory?: NewsCategory | 'all';
  submittedAt: string;
  reviewedAt?: string;
  adminFeedback?: string;
  views: number;
}

export type RadioVoiceStatus = 'pending' | 'approved' | 'rejected';

export interface RadioVoice {
  id: string;
  title: string;
  titleTelugu?: string;
  audioUrl: string;
  duration: string;
  durationSeconds?: number;
  userName: string;
  userRole?: string;
  userCity?: string;
  topic?: string;
  status: RadioVoiceStatus;
  submittedAt: string;
  reviewedAt?: string;
  adminFeedback?: string;
  listens: number;
  likes: number;
}
