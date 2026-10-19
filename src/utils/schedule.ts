import type { BroadcastProgram, BroadcastSettings, LiveStreamConfig } from '../types';

export const programEnd = (program: BroadcastProgram) => Date.parse(program.startAt) + program.durationMinutes * 60000;

export function resolveScheduledStream(streams: LiveStreamConfig[], settings: BroadcastSettings, current?: BroadcastProgram) {
  const manual = streams.find((stream) => stream.isActive) || streams[0];
  if (!settings.schedulerEnabled) return manual;
  return streams.find((stream) => stream.id === current?.streamId)
    || streams.find((stream) => stream.id === (current?.fallbackStreamId || settings.fallbackStreamId)) || manual;
}

export function getScheduleState(programs: BroadcastProgram[], time: number) {
  const ordered = [...programs].sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt));
  return {
    current: ordered.find((program) => Date.parse(program.startAt) <= time && programEnd(program) > time),
    next: ordered.find((program) => Date.parse(program.startAt) > time),
    upcoming: ordered.filter((program) => programEnd(program) > time && Date.parse(program.startAt) < time + 48 * 3600000),
  };
}

export function validateProgram(program: BroadcastProgram, existing: BroadcastProgram[], now: number) {
  const start = Date.parse(program.startAt);
  if (!program.title.trim() || !program.streamId) return 'A program title and video source are required.';
  if (!Number.isFinite(start) || ![30, 60].includes(program.durationMinutes)) return 'Choose a valid start time and a 30 or 60 minute duration.';
  if (programEnd(program) <= now || start > now + 48 * 3600000 || programEnd(program) > now + 48 * 3600000) return 'Place the program within the next 48 hours.';
  if (existing.some((item) => item.id !== program.id && start < programEnd(item) && programEnd(program) > Date.parse(item.startAt))) return 'This time overlaps another program. Choose a free slot.';
  return null;
}

export const formatBroadcastTime = (date: string | number) => new Date(date).toLocaleString('en-IN', {
  timeZone: 'Asia/Kolkata', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: true,
});

export function toISTInput(time: number) {
  return new Date(time + 330 * 60000).toISOString().slice(0, 16);
}
