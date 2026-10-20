import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateNextChimeTimestamp,
  isWithinQuietHours,
  formatTimeRemaining,
  calculateProgress
} from './timerLogic.ts';

test('calculateNextChimeTimestamp aligns correctly to next 15-minute interval', () => {
  // 14:10:00 -> next 15-min should be 14:15:00
  const baseDate = new Date(2026, 9, 20, 14, 10, 0, 0);
  const nextTimestamp = calculateNextChimeTimestamp(baseDate.getTime(), 15, true);
  const resultDate = new Date(nextTimestamp);

  assert.equal(resultDate.getHours(), 14);
  assert.equal(resultDate.getMinutes(), 15);
  assert.equal(resultDate.getSeconds(), 0);
});

test('calculateNextChimeTimestamp aligns correctly to hourly mark', () => {
  // 14:35:20 -> next 60-min should be 15:00:00
  const baseDate = new Date(2026, 9, 20, 14, 35, 20, 0);
  const nextTimestamp = calculateNextChimeTimestamp(baseDate.getTime(), 60, true);
  const resultDate = new Date(nextTimestamp);

  assert.equal(resultDate.getHours(), 15);
  assert.equal(resultDate.getMinutes(), 0);
  assert.equal(resultDate.getSeconds(), 0);
});

test('isWithinQuietHours handles window crossing midnight', () => {
  const config = {
    enabled: true,
    startHour: 22,
    startMinute: 0,
    endHour: 7,
    endMinute: 0,
    daysActive: [0, 1, 2, 3, 4, 5, 6]
  };

  // 23:30 should be quiet
  const nightTime = new Date(2026, 9, 20, 23, 30, 0, 0).getTime();
  assert.equal(isWithinQuietHours(nightTime, config), true);

  // 05:15 should be quiet
  const earlyMorning = new Date(2026, 9, 21, 5, 15, 0, 0).getTime();
  assert.equal(isWithinQuietHours(earlyMorning, config), true);

  // 12:00 should NOT be quiet
  const noonTime = new Date(2026, 9, 21, 12, 0, 0, 0).getTime();
  assert.equal(isWithinQuietHours(noonTime, config), false);
});

test('formatTimeRemaining formats accurately', () => {
  assert.equal(formatTimeRemaining(45000).formatted, '00:45');
  assert.equal(formatTimeRemaining(125000).formatted, '02:05');
  assert.equal(formatTimeRemaining(3665000).formatted, '01:01:05');
});

test('calculateProgress bounds between 0 and 1', () => {
  assert.equal(calculateProgress(100, 100, 200), 0);
  assert.equal(calculateProgress(150, 100, 200), 0.5);
  assert.equal(calculateProgress(250, 100, 200), 1);
});
