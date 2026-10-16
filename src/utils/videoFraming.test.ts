import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_VIDEO_FRAMING, getVideoFraming, getVideoFramingStyle } from './videoFraming';

test('older saved settings display the original uncropped frame', () => {
  assert.deepEqual(getVideoFraming(undefined), DEFAULT_VIDEO_FRAMING);
  assert.deepEqual(getVideoFramingStyle(undefined), { transform: 'scale(1, 1)', transformOrigin: '50% 50%' });
});

test('restored horizontal and vertical zoom retain independent focus positions', () => {
  const saved = JSON.parse(JSON.stringify({ zoomX: 1.25, zoomY: 1.6, focusX: 80, focusY: 20 }));
  assert.deepEqual(getVideoFramingStyle(saved), { transform: 'scale(1.25, 1.6)', transformOrigin: '80% 20%' });
});

test('invalid saved framing values stay within visible zoom and focus limits', () => {
  assert.deepEqual(getVideoFraming({ zoomX: NaN, zoomY: 20, focusX: -30, focusY: Infinity }), {
    zoomX: 1, zoomY: 2.5, focusX: 0, focusY: 50,
  });
});
