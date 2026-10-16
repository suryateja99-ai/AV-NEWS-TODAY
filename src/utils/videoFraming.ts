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
