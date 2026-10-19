import { test } from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_BROADCAST_SETTINGS } from '../data/initialData';
import { isAdImage, resolveLAdSlot, visibleHorizontalScrolls } from './liveGraphics';
import type { SponsorCreative } from '../types';

const ad = (id: string, durationSeconds: number, intervalSeconds: number, enabled = true): SponsorCreative => ({
  id, title: id, sideImage: 'https://example.com/side.jpg', bottomImage: 'https://example.com/bottom.jpg', targetUrl: '', phone: '', durationSeconds, intervalSeconds, enabled,
});

test('admin can hide the built-in horizontal scrolls and add another bar', () => {
  const defaults = visibleHorizontalScrolls(INITIAL_BROADCAST_SETTINGS);
  assert.deepEqual(defaults.map((scroll) => scroll.id), ['builtin-telugu', 'builtin-english']);
  const custom = visibleHorizontalScrolls({
    ...INITIAL_BROADCAST_SETTINGS,
    teluguScrollVisible: false,
    englishScrollVisible: false,
    horizontalScrolls: [
      { id: 'mandi', label: 'MANDI', text: 'Paddy ₹2,200', enabled: true },
      { id: 'blank', label: 'EMPTY', text: '   ', enabled: true },
      { id: 'off', label: 'OFF', text: 'Hidden headline', enabled: false },
    ],
  });
  assert.deepEqual(custom.map((scroll) => scroll.id), ['mandi']);
});

test('headline text from the ticker editors still fills the built-in scrolls', () => {
  const scrolls = visibleHorizontalScrolls({
    ...INITIAL_BROADCAST_SETTINGS,
    teluguTickerItems: ['వర్షం'],
    englishTickerItems: ['Rain alert', ''],
  });
  assert.equal(scrolls[0].text, 'వర్షం');
  assert.equal(scrolls[1].text, 'Rain alert');
});

test('L-ads run for the settled duration, then wait for the settled interval', () => {
  const creatives = [ad('alpha', 10, 5), ad('beta', 20, 0)];
  assert.equal(resolveLAdSlot(creatives, 0).creative?.id, 'alpha');
  assert.equal(resolveLAdSlot(creatives, 9999).creative?.id, 'alpha');
  assert.deepEqual(resolveLAdSlot(creatives, 10000), { creative: null, visible: false });
  assert.deepEqual(resolveLAdSlot(creatives, 14999), { creative: null, visible: false });
  assert.equal(resolveLAdSlot(creatives, 15000).creative?.id, 'beta');
  assert.equal(resolveLAdSlot(creatives, 34999).creative?.id, 'beta');
  assert.equal(resolveLAdSlot(creatives, 35000).creative?.id, 'alpha');
});

test('removed and disabled L-ads leave the rotation, and missing timing uses the default duration', () => {
  const stay: SponsorCreative = { id: 'stay', title: 'stay', sideImage: '', bottomImage: '', targetUrl: '', phone: '' };
  assert.equal(resolveLAdSlot([ad('gone', 30, 30, false)], 0).visible, true);
  assert.equal(resolveLAdSlot([ad('gone', 30, 30, false)], 0).creative, null);
  assert.equal(resolveLAdSlot([ad('gone', 10, 10, false), stay], 0, 30).creative?.id, 'stay');
  assert.equal(resolveLAdSlot([stay], 29999, 30).creative?.id, 'stay');
  assert.equal(resolveLAdSlot([stay], 30000, 30).creative?.id, 'stay');
});

test('ad images accept stored files and web URLs', () => {
  assert.equal(isAdImage('av-media:abc'), true);
  assert.equal(isAdImage('https://cdn.example.com/ad.png'), true);
  assert.equal(isAdImage('javascript:alert(1)'), false);
  assert.equal(isAdImage('not a url'), false);
});
