import type { BroadcastSettings } from '../types';

export const DEFAULT_VIDEO_FRAMING = { zoomX: 1, zoomY: 1, focusX: 50, focusY: 50 };

export function getVideoFraming(value?: BroadcastSettings['videoFraming']) {
  const clamp = (input: number | undefined, fallback: number, min: number, max: number) =>
    typeof input === 'number' && Number.isFinite(input) ? Math.max(min, Math.min(max, input)) : fallback;
  return {
    zoomX: clamp(value?.zoomX, 1, 1, 2.5),
    zoomY: clamp(value?.zoomY, 1, 1, 2.5),
    focusX: clamp(value?.focusX, 50, 0, 100),
    focusY: clamp(value?.focusY, 50, 0, 100),
  };
}

export function getVideoFramingStyle(value?: BroadcastSettings['videoFraming']) {
  const framing = getVideoFraming(value);
  return {
    transform: `scale(${framing.zoomX}, ${framing.zoomY})`,
    transformOrigin: `${framing.focusX}% ${framing.focusY}%`,
  };
}

export function getViewportStyle(settings: BroadcastSettings) {
  const framing = getVideoFraming(settings.videoFraming);
  const viewport = settings.viewport;
  const scale = Math.max(0.8, Math.min(1.2, viewport?.scale ?? 1));
  return {
    transform: `translate(${viewport?.panX ?? 0}%, ${viewport?.panY ?? 0}%) scale(${framing.zoomX * scale}, ${framing.zoomY * scale})`,
    transformOrigin: `${framing.focusX}% ${framing.focusY}%`,
  };
}
