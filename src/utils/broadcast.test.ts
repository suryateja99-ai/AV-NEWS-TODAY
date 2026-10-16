import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nextQueueIndex, normalizeBroadcastUrl } from './broadcast';
import { INITIAL_LIVE_STREAMS } from '../data/initialData';

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

test('rejects invalid sources without treating unrelated hosts as YouTube', () => {
  for (const input of ['', 'not a URL', 'javascript:alert(1)',
    'https://youtube.com/watch?v=bad', 'https://youtube.com/@channel',
    'https://youtube.com.evil.example/watch?v=jfKfPfyJRdk',
    'https://example.com/?video=youtube.com/watch?v=jfKfPfyJRdk']) {
    assert.throws(() => normalizeBroadcastUrl(input));
  }
});
