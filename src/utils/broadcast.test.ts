import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyFallbackPreset, ensureFallbackStream, nextQueueIndex, normalizeBroadcastUrl, normalizeYuppTVSource } from './broadcast';
import { DEFAULT_FALLBACK_STREAM, INITIAL_BROADCAST_SETTINGS, INITIAL_LIVE_STREAMS } from '../data/initialData';
import { resolveScheduledStream } from './schedule';

test('the requested fallback plays when no program is scheduled', () => {
  assert.equal(resolveScheduledStream(INITIAL_LIVE_STREAMS, INITIAL_BROADCAST_SETTINGS)?.id, DEFAULT_FALLBACK_STREAM.id);
  assert.deepEqual(DEFAULT_FALLBACK_STREAM.youtubePlaylist, ['ksHd7AEHWss']);
});

test('existing browsers receive the fallback once and retain later admin choices', () => {
  const legacy = { ...INITIAL_BROADCAST_SETTINGS, fallbackPresetVersion: undefined, schedulerEnabled: false, fallbackStreamId: 'old-feed', tickerSpeed: 45 };
  const migrated = applyFallbackPreset(legacy, DEFAULT_FALLBACK_STREAM);
  assert.equal(migrated.schedulerEnabled, true);
  assert.equal(migrated.fallbackStreamId, DEFAULT_FALLBACK_STREAM.id);
  assert.equal(migrated.tickerSpeed, 45);
  const override = { ...migrated, schedulerEnabled: false, fallbackStreamId: 'custom-feed' };
  assert.deepEqual(applyFallbackPreset(override, DEFAULT_FALLBACK_STREAM), override);
  const streams = ensureFallbackStream([], DEFAULT_FALLBACK_STREAM);
  assert.equal(ensureFallbackStream(streams, DEFAULT_FALLBACK_STREAM).length, 1);
});

test('plays the requested queue in order and wraps in both directions', () => {
  const stream = INITIAL_LIVE_STREAMS.find((stream) => stream.isActive)!;
  assert.deepEqual(stream.youtubePlaylist, ['hR0iPLcbebM', 'bgcN5oZPN24', 'HO6o6BZ22JE']);
  assert.equal(INITIAL_LIVE_STREAMS.filter((stream) => stream.isActive).length, 1);
  let index = 0;
  const played = [stream.youtubePlaylist![index]];
  for (let count = 0; count < 4; count++) {
    index = nextQueueIndex(index, 1, 3);
    played.push(stream.youtubePlaylist![index]);
  }
  assert.deepEqual(played, ['hR0iPLcbebM', 'bgcN5oZPN24', 'HO6o6BZ22JE', 'hR0iPLcbebM', 'bgcN5oZPN24']);
  assert.equal(nextQueueIndex(0, -1, 3), 2);
  assert.equal(nextQueueIndex(0, 1, 1), 0);
});

test('normalizes supported YouTube links for muted autoplay', () => {
  for (const input of [
    'https://www.youtube.com/watch?v=jfKfPfyJRdk&si=share',
    'https://youtu.be/jfKfPfyJRdk?si=share',
    'https://m.youtube.com/watch?v=jfKfPfyJRdk',
    'https://www.youtube.com/shorts/jfKfPfyJRdk',
    'https://youtube.com/live/jfKfPfyJRdk?feature=share',
    'https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=0',
    'https://www.youtube-nocookie.com/embed/jfKfPfyJRdk',
  ]) {
    const result = normalizeBroadcastUrl(input);
    assert.equal(result.streamType, 'youtube');
    assert.equal(result.streamUrl, 'https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&mute=1&playsinline=1');
  }
});

test('detects direct feeds with query parameters', () => {
  assert.equal(normalizeBroadcastUrl('https://example.com/live.m3u8?token=abc').streamType, 'hls');
  assert.equal(normalizeBroadcastUrl('https://example.com/video.MP4?token=abc').streamType, 'mp4');
});

test('raw YouTube IDs work and RTMP requires a browser-playable feed', () => {
  assert.equal(normalizeBroadcastUrl('hR0iPLcbebM').streamType, 'youtube');
  assert.throws(() => normalizeBroadcastUrl('rtmp://example.com/live'), /HLS/);
});
test('YuppTV requires a secure authorized endpoint instead of guessing from a code', () => {
  assert.throws(() => normalizeYuppTVSource('channel-123', '123'), /authorized/);
  assert.throws(() => normalizeYuppTVSource('https://yupptv.com.evil.example/embed/123', '123'));
  assert.equal(normalizeYuppTVSource('https://www.yupptv.com/embed/123', '123').streamType, 'embed');
  assert.equal(normalizeYuppTVSource('https://cdn.example.com/live.m3u8?token=abc', '123').streamType, 'hls');
});

test('rejects invalid sources without treating unrelated hosts as YouTube', () => {
  for (const input of ['', 'not a URL', 'javascript:alert(1)',
    'https://youtube.com/watch?v=bad', 'https://youtube.com/@channel',
    'https://youtube.com.evil.example/watch?v=jfKfPfyJRdk',
    'https://example.com/?video=youtube.com/watch?v=jfKfPfyJRdk']) {
    assert.throws(() => normalizeBroadcastUrl(input));
  }
});
