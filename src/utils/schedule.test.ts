import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getScheduleState, programEnd, validateProgram, toISTInput, resolveScheduledStream } from './schedule';
import { BroadcastProgram } from '../types';
import { INITIAL_BROADCAST_SETTINGS, INITIAL_LIVE_STREAMS } from '../data/initialData';

const now = Date.parse('2026-10-16T06:30:00Z');
const first: BroadcastProgram = { id: 'first', title: 'Health Hour', anchor: 'Editor', category: 'health', startAt: new Date(now).toISOString(), durationMinutes: 30, streamId: 'health' };
const second: BroadcastProgram = { ...first, id: 'second', title: 'Crime Watch', streamId: 'crime', startAt: new Date(now + 1800000).toISOString(), durationMinutes: 60 };

test('scheduler resolves exact slot boundaries without overlap', () => {
  assert.equal(getScheduleState([second, first], now).current?.id, 'first');
  assert.equal(getScheduleState([second, first], now).next?.id, 'second');
  assert.equal(getScheduleState([first, second], programEnd(first)).current?.id, 'second');
  assert.equal(getScheduleState([first, second], programEnd(second)).current, undefined);
});
test('scheduler rejects overlapping and expired slots and accepts editing its own slot', () => {
  assert.match(validateProgram({ ...first, id: 'overlap' }, [first], now)!, /overlaps/);
  assert.equal(validateProgram(first, [first, second], now), null);
  assert.match(validateProgram(first, [], programEnd(first))!, /48 hours/);
  assert.match(validateProgram({ ...first, startAt: new Date(now + 48 * 3600000).toISOString() }, [], now)!, /48 hours/);
});
test('IST editor does not depend on the host timezone', () => {
  assert.equal(toISTInput(now), '2026-10-16T12:00');
  assert.equal(getScheduleState([first, second], now - 1).current, undefined);
});

test('automation selects scheduled sources, falls back for gaps and missing sources, and preserves manual takeover', () => {
  const streams = INITIAL_LIVE_STREAMS;
  const settings = { ...INITIAL_BROADCAST_SETTINGS, schedulerEnabled: true, fallbackStreamId: streams[1].id };
  const program = { ...first, streamId: streams[2].id, fallbackStreamId: streams[3].id };
  assert.equal(resolveScheduledStream(streams, settings, program)?.id, streams[2].id);
  assert.equal(resolveScheduledStream(streams, settings)?.id, streams[1].id);
  assert.equal(resolveScheduledStream(streams, settings, { ...program, streamId: 'deleted' })?.id, streams[3].id);
  assert.equal(resolveScheduledStream(streams, { ...settings, schedulerEnabled: false }, program)?.id, streams[0].id);
});
