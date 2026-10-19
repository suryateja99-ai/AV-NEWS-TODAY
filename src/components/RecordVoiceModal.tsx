import { storeMedia } from '../utils/mediaStore';
import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Disc,
  Mic,
  MicOff,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Square,
  Upload,
  User,
  Volume2,
  X,
} from 'lucide-react';
import { useNews } from '../context/NewsContext';
import { GoldenMicIcon } from './GoldenMicIcon';

export const RecordVoiceModal: React.FC = () => {
  const {
    isRecordVoiceModalOpen,
    setIsRecordVoiceModalOpen,
    submitRadioVoice,
    currentUser,
  } = useNews();

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);

  // Review Player State
  const [isPlayingReview, setIsPlayingReview] = useState(false);
  const [reviewCurrentTime, setReviewCurrentTime] = useState(0);
  const [reviewDuration, setReviewDuration] = useState(0);
  const reviewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [titleTelugu, setTitleTelugu] = useState('');
  const [userName, setUserName] = useState(currentUser?.fullName || '');
  const [userCity, setUserCity] = useState(currentUser?.cityDistrict || '');
  const [topic, setTopic] = useState('ప్రజా గళం (Public Voice)');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // MediaRecorder Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  // Cleanup on unmount or modal close
  useEffect(() => {
    if (!isRecordVoiceModalOpen) {
      stopAndCleanup();
      resetForm();
    } else {
      if (currentUser) {
        setUserName(currentUser.fullName);
        setUserCity(currentUser.cityDistrict || 'Telangana');
      }
    }
  }, [isRecordVoiceModalOpen, currentUser]);

  const resetForm = () => {
    setTitle('');
    setTitleTelugu('');
    setFeedbackMsg(null);
    setRecordedAudioUrl(null);
    setRecordedBlob(null);
    setRecordingSeconds(0);
    setIsRecording(false);
    setIsPlayingReview(false);
  };

  const stopAndCleanup = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (reviewAudioRef.current) {
      reviewAudioRef.current.pause();
    }
  };

  // Start Voice Recording
  const startRecording = async () => {
    setFeedbackMsg(null);
    setRecordedAudioUrl(null);
    setRecordedBlob(null);
    recordedChunksRef.current = [];
    setRecordingSeconds(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')
        ? 'audio/ogg;codecs=opus'
        : 'audio/mp4';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(recordedChunksRef.current, {
          type: mimeType || 'audio/webm',
        });
        const url = URL.createObjectURL(audioBlob);
        setRecordedBlob(audioBlob);
        setRecordedAudioUrl(url);
        setIsRecording(false);
        setIsPaused(false);

        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }

        // Release mic stream
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track) => track.stop());
          mediaStreamRef.current = null;
        }
      };

      recorder.start(250);
      setIsRecording(true);
      setIsPaused(false);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Mic access error:', err);
      setFeedbackMsg({
        type: 'error',
        text: 'మైక్రోఫోన్ యాక్సెస్ అనుమతించబడలేదు. దయచేసి బ్రౌజర్ అనుమతులను తనిఖీ చేయండి (Microphone access denied).',
      });
    }
  };

  // Stop Recording to Review
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Review Player Controls
  const toggleReviewPlay = () => {
    if (!reviewAudioRef.current || !recordedAudioUrl) return;

    if (isPlayingReview) {
      reviewAudioRef.current.pause();
      setIsPlayingReview(false);
    } else {
      reviewAudioRef.current.play().then(() => {
        setIsPlayingReview(true);
      }).catch((e) => console.error(e));
    }
  };

  // Handle Submit Voice
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFeedbackMsg({
        type: 'error',
        text: 'దయచేసి మీ రికార్డింగ్‌కు ఒక శీర్షికను (Title) నమోదు చేయండి.',
      });
      return;
    }
    if (!recordedAudioUrl) {
      setFeedbackMsg({
        type: 'error',
        text: 'మొదట మీ స్వరాన్ని రికార్డ్ చేయండి.',
      });
      return;
    }

    const durationStr = formatTime(recordingSeconds || 60);

    let storedAudio: string;
    try {
      const blob = recordedBlob || await fetch(recordedAudioUrl).then((response) => response.blob());
      storedAudio = await storeMedia(blob);
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Could not save the recording. Check browser storage space and try again.' });
      return;
    }
    const result = submitRadioVoice({
      title: title.trim(),
      titleTelugu: titleTelugu.trim() || title.trim(),
      audioUrl: storedAudio,
      duration: durationStr,
      durationSeconds: recordingSeconds,
      userName: userName.trim() || 'Anonymous Citizen / పౌరుడు',
      userCity: userCity.trim() || 'Telangana',
      topic,
    });

    if (result.success) {
      setFeedbackMsg({
        type: 'success',
        text: result.message,
      });
      setTimeout(() => {
        setIsRecordVoiceModalOpen(false);
      }, 2200);
    } else {
      setFeedbackMsg({
        type: 'error',
        text: result.message,
      });
    }
  };

  if (!isRecordVoiceModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-[#0a142c] via-[#081024] to-[#050b18] border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto text-slate-100">
        {/* Top Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-[#0d1c3d] via-[#09142b] to-[#070e22] border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/40 flex items-center justify-center">
              <Mic className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <span>AV RADIO • VOICE RECORDING DESK</span>
                <span className="text-[10px] bg-amber-500 text-black font-extrabold px-1.5 py-0.2 rounded uppercase">
                  OPEN TO ALL
                </span>
              </h3>
              <p className="text-[10px] text-amber-300/80">
                ప్రజా గళం • మీ మాటలను రికార్డ్ చేసి నేరుగా ప్రపంచానికి వినిపించండి
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsRecordVoiceModalOpen(false)}
            className="p-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[82vh]">
          {/* Notification feedback */}
          {feedbackMsg && (
            <div
              className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2.5 ${
                feedbackMsg.type === 'success'
                  ? 'bg-emerald-950/90 border border-emerald-500 text-emerald-200'
                  : 'bg-red-950/90 border border-red-500 text-red-200'
              }`}
            >
              {feedbackMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span>{feedbackMsg.text}</span>
            </div>
          )}

          {/* Recording Studio Center Stage */}
          <div className="bg-[#060c1d] border border-blue-900/60 rounded-xl p-5 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-inner">
            <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-red-500/5 pointer-events-none"></div>

            {/* Golden Mic Icon */}
            <div className="relative my-2">
              <GoldenMicIcon className={`w-20 h-20 ${isRecording ? 'scale-110 drop-shadow-[0_0_24px_rgba(245,158,11,0.8)]' : 'drop-shadow-[0_0_12px_rgba(245,158,11,0.3)]'} transition-all`} />

              {/* Pulsing on-air soundwaves when recording */}
              {isRecording && (
                <div className="absolute -inset-3 flex items-center justify-center pointer-events-none">
                  <div className="w-24 h-24 rounded-full border-2 border-red-500 animate-ping opacity-60"></div>
                  <div className="w-28 h-28 rounded-full border border-amber-400 animate-pulse opacity-40"></div>
                </div>
              )}
            </div>

            {/* Recording Timer & Status */}
            <div className="mt-2 space-y-1">
              {isRecording ? (
                <div className="inline-flex items-center gap-2 bg-red-600/90 text-white text-xs font-black px-3 py-1 rounded-full animate-pulse shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-white"></span>
                  <span>RECORDING ON AIR • {formatTime(recordingSeconds)}</span>
                </div>
              ) : recordedAudioUrl ? (
                <div className="inline-flex items-center gap-1.5 bg-emerald-600/80 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>RECORDING COMPLETED ({formatTime(recordingSeconds)})</span>
                </div>
              ) : (
                <div className="text-xs text-slate-400 font-medium">
                  మైక్రోఫోన్ సిద్ధంగా ఉంది • క్లిక్ చేసి రికార్డింగ్ ప్రారంభించండి
                </div>
              )}
            </div>

            {/* Live Audio Meter / Equalizer visualization */}
            {isRecording && (
              <div className="flex items-center gap-1.5 justify-center mt-3 h-8">
                <span className="w-1 h-3 bg-red-500 rounded-full animate-bounce"></span>
                <span className="w-1 h-6 bg-amber-400 rounded-full animate-pulse"></span>
                <span className="w-1 h-8 bg-red-500 rounded-full animate-bounce"></span>
                <span className="w-1 h-5 bg-amber-300 rounded-full animate-pulse"></span>
                <span className="w-1 h-7 bg-red-400 rounded-full animate-bounce"></span>
                <span className="w-1 h-4 bg-amber-400 rounded-full animate-pulse"></span>
                <span className="w-1 h-2 bg-red-500 rounded-full animate-bounce"></span>
              </div>
            )}

            {/* Recording Action Buttons */}
            <div className="mt-4 flex items-center gap-3">
              {!isRecording && !recordedAudioUrl && (
                <button
                  type="button"
                  onClick={startRecording}
                  className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs px-5 py-2.5 rounded-full shadow-lg shadow-red-600/40 cursor-pointer transition-transform hover:scale-105 active:scale-95"
                >
                  <Mic className="w-4 h-4" />
                  <span>START RECORDING (రికార్డ్ చేయండి)</span>
                </button>
              )}

              {isRecording && (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xs px-5 py-2.5 rounded-full shadow-lg shadow-amber-500/30 cursor-pointer transition-transform hover:scale-105 active:scale-95"
                >
                  <Square className="w-4 h-4 fill-black" />
                  <span>STOP & REVIEW (పూర్తయింది)</span>
                </button>
              )}

              {recordedAudioUrl && !isRecording && (
                <button
                  type="button"
                  onClick={startRecording}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-700 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Re-Record (మళ్ళీ రికార్డ్ చేయండి)</span>
                </button>
              )}
            </div>
          </div>

          {/* Review Recorded Audio Section */}
          {recordedAudioUrl && (
            <div className="bg-[#091329] border border-amber-500/40 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>REVIEW RECORDED VOICE (మీ రికార్డింగ్ వినండి)</span>
                </span>
                <span className="text-[11px] font-mono text-slate-300">
                  Duration: {formatTime(recordingSeconds)}
                </span>
              </div>

              {/* HTML5 Audio Player */}
              <audio
                ref={reviewAudioRef}
                src={recordedAudioUrl}
                onTimeUpdate={() => {
                  if (reviewAudioRef.current) {
                    setReviewCurrentTime(reviewAudioRef.current.currentTime);
                  }
                }}
                onLoadedMetadata={() => {
                  if (reviewAudioRef.current) {
                    setReviewDuration(reviewAudioRef.current.duration);
                  }
                }}
                onEnded={() => setIsPlayingReview(false)}
                className="hidden"
              />

              {/* Custom Player Controls */}
              <div className="flex items-center gap-3 bg-[#060c1d] p-3 rounded-lg border border-blue-900/60">
                <button
                  type="button"
                  onClick={toggleReviewPlay}
                  className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 text-black flex items-center justify-center shrink-0 shadow-md hover:scale-105 transition-transform cursor-pointer"
                >
                  {isPlayingReview ? (
                    <Pause className="w-4 h-4 fill-black" />
                  ) : (
                    <Play className="w-4 h-4 fill-black ml-0.5" />
                  )}
                </button>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>{formatTime(reviewCurrentTime)}</span>
                    <span>{formatTime(reviewDuration || recordingSeconds)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={reviewDuration || recordingSeconds || 1}
                    value={reviewCurrentTime}
                    onChange={(e) => {
                      const time = parseFloat(e.target.value);
                      setReviewCurrentTime(time);
                      if (reviewAudioRef.current) {
                        reviewAudioRef.current.currentTime = time;
                      }
                    }}
                    className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-300 italic">
                💡 సంతృప్తి చెందితే కింద శీర్షిక (Title) ఇచ్చి అప్‌లోడ్ చేయండి. లేదా మళ్లీ రికార్డ్ చేయండి.
              </p>
            </div>
          )}

          {/* Submission Form (Title is mandatory) */}
          <form onSubmit={handleUploadSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-black text-slate-200 mb-1">
                VOICE TITLE / శీర్షిక <span className="text-red-400">* (తప్పనిసరి)</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ఉదా: నగరంలో డ్రైనేజీ సమస్యపై నా అభిప్రాయం / My view on public parks"
                className="w-full bg-[#070e20] border border-blue-900/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  మీ పేరు (Your Name)
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="మీ పేరు (లేదా Anonymous)"
                    className="w-full bg-[#070e20] border border-blue-900/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  ప్రాంతం / నగరం (Location / City)
                </label>
                <input
                  type="text"
                  value={userCity}
                  onChange={(e) => setUserCity(e.target.value)}
                  placeholder="ఉదా: హైదరాబాద్, వరంగల్, కరీంనగర్"
                  className="w-full bg-[#070e20] border border-blue-900/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                అంశం / విభాగం (Category / Topic)
              </label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-[#070e20] border border-blue-900/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="ప్రజా గళం (Public Voice)">ప్రజా గళం (Public Voice)</option>
                <option value="సామాజిక అంశాలు (Social Issues)">సామాజిక అంశాలు (Social Issues)</option>
                <option value="రైతు సంక్షేమం (Farmer Issues)">రైతు సంక్షేమం (Farmer Issues)</option>
                <option value="యువత & ఉపాధి (Youth & Career)">యువత & ఉపాధి (Youth & Career)</option>
                <option value="సంస్కృతి & సాహిత్యం (Culture & Arts)">సంస్కృతి & సాహిత్యం (Culture & Arts)</option>
                <option value="పర్యావరణం (Environment)">పర్యావరణం (Environment)</option>
                <option value="సాధారణ అభిప్రాయం (General Talk)">సాధారణ అభిప్రాయం (General Talk)</option>
              </select>
            </div>

            {/* Note about admin verification */}
            <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-800/40 text-[10px] text-slate-300 leading-relaxed flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>అడ్మిన్ పరిశీలన ప్రక్రియ:</strong> సమర్పించిన ప్రతి రికార్డింగ్‌ను AV Radio ఎడిటోరియల్ టీమ్ పరిశీలించి, అనుమతించిన వెంటనే AV Radio అధికారిక పేజీలో ప్రసారమవుతుంది.
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isRecording || !recordedAudioUrl}
              className={`w-full py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                isRecording || !recordedAudioUrl
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 shadow-amber-500/20 active:scale-98'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>UPLOAD TO AV RADIO (రికార్డింగ్ సమర్పించండి)</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
