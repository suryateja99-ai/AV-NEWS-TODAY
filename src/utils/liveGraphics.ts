import type { BroadcastSettings, HorizontalScroll, SponsorCreative } from '../types';

export function visibleHorizontalScrolls(settings: BroadcastSettings): HorizontalScroll[] {
  const opacity = settings.tickerOpacity ?? 1;
  const telugu = settings.teluguTickerItems?.filter(Boolean).join(' • ') || settings.topTickerText || '';
  const english = settings.englishTickerItems?.filter(Boolean).join(' • ') || settings.bottomTickerText || '';
  const builtin: HorizontalScroll[] = [
    { id: 'builtin-telugu', label: 'తెలుగు', text: telugu, enabled: settings.teluguScrollVisible !== false, background: `rgba(185,28,28,${opacity})` },
    { id: 'builtin-english', label: 'ENGLISH', text: english, enabled: settings.englishScrollVisible !== false, background: `rgba(9,21,51,${opacity})` },
  ];
  const extras = settings.horizontalScrolls || [];
  return [...builtin, ...extras].filter((scroll) => scroll.enabled !== false && scroll.text.trim());
}

export function isAdImage(value: string) {
  const image = value.trim();
  if (image.startsWith('av-media:')) return true;
  try {
    const url = new URL(image);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

export interface LAdSlot {
  creative: SponsorCreative | null;
  visible: boolean;
}

/** Walks the admin rotation: each ad is on screen for its duration, then hidden for its interval. */
export function resolveLAdSlot(creatives: SponsorCreative[], nowMs: number, fallbackDurationSeconds = 30): LAdSlot {
  const active = creatives.filter((creative) => creative.enabled !== false);
  if (!active.length) return { creative: null, visible: true };
  const slots = active.map((creative) => ({
    creative,
    duration: Math.max(1, creative.durationSeconds ?? fallbackDurationSeconds) * 1000,
    interval: Math.max(0, creative.intervalSeconds ?? 0) * 1000,
  }));
  const cycle = slots.reduce((sum, slot) => sum + slot.duration + slot.interval, 0);
  let cursor = ((nowMs % cycle) + cycle) % cycle;
  for (const slot of slots) {
    if (cursor < slot.duration) return { creative: slot.creative, visible: true };
    cursor -= slot.duration;
    if (cursor < slot.interval) return { creative: null, visible: false };
    cursor -= slot.interval;
  }
  return { creative: active[0], visible: true };
}
