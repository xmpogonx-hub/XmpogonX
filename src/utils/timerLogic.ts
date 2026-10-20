import type { QuietHoursConfig } from '../types/index.ts';

/**
 * Calculates the exact timestamp in ms of the next chime.
 * If alignToHour is true, intervals are synchronized to the clock minutes.
 * E.g., for 15 min interval: :00, :15, :30, :45.
 * For 60 min interval: top of the hour :00:00.
 */
export function calculateNextChimeTimestamp(
  nowMs: number,
  intervalMinutes: number,
  alignToHour: boolean = true,
  lastChimeMs?: number
): number {
  if (intervalMinutes <= 0) {
    intervalMinutes = 60;
  }

  const nowDate = new Date(nowMs);
  const intervalMs = intervalMinutes * 60 * 1000;

  if (!alignToHour) {
    const base = lastChimeMs && lastChimeMs > 0 ? lastChimeMs : nowMs;
    let next = base + intervalMs;
    while (next <= nowMs) {
      next += intervalMs;
    }
    return next;
  }

  // Aligned to clock
  if (intervalMinutes >= 60 && intervalMinutes % 60 === 0) {
    const hourStep = intervalMinutes / 60;
    const currentHour = nowDate.getHours();
    const nextHour = Math.floor(currentHour / hourStep) * hourStep + hourStep;

    const nextDate = new Date(nowDate);
    nextDate.setHours(nextHour, 0, 0, 0);

    // If result is in past or current ms (edge case), add interval
    if (nextDate.getTime() <= nowMs) {
      nextDate.setTime(nextDate.getTime() + intervalMs);
    }
    return nextDate.getTime();
  }

  // Sub-hour intervals aligned to the top of the hour (:00, :15, :30, etc.)
  const currentMinute = nowDate.getMinutes();

  const nextIntervalIndex = Math.floor(currentMinute / intervalMinutes) + 1;
  const targetMinute = nextIntervalIndex * intervalMinutes;

  const nextDate = new Date(nowDate);
  if (targetMinute >= 60) {
    nextDate.setHours(nextDate.getHours() + 1, targetMinute - 60, 0, 0);
  } else {
    nextDate.setMinutes(targetMinute, 0, 0);
  }

  if (nextDate.getTime() <= nowMs) {
    nextDate.setTime(nextDate.getTime() + intervalMs);
  }

  return nextDate.getTime();
}

/**
 * Checks if a given timestamp falls into quiet hours.
 */
export function isWithinQuietHours(timestampMs: number, config: QuietHoursConfig): boolean {
  if (!config.enabled) {
    return false;
  }

  const date = new Date(timestampMs);
  const dayOfWeek = date.getDay(); // 0 is Sunday, 6 is Saturday

  if (!config.daysActive.includes(dayOfWeek)) {
    return false;
  }

  const minutesOfDay = date.getHours() * 60 + date.getMinutes();
  const startMinutes = config.startHour * 60 + config.startMinute;
  const endMinutes = config.endHour * 60 + config.endMinute;

  // Case 1: Window does not cross midnight (e.g. 13:00 to 17:00)
  if (startMinutes <= endMinutes) {
    return minutesOfDay >= startMinutes && minutesOfDay < endMinutes;
  }

  // Case 2: Window crosses midnight (e.g. 22:00 to 07:00)
  return minutesOfDay >= startMinutes || minutesOfDay < endMinutes;
}

/**
 * Formats time remaining in milliseconds into a readable countdown object.
 */
export function formatTimeRemaining(diffMs: number): {
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
} {
  const safeDiff = Math.max(0, Math.floor(diffMs / 1000));
  const hours = Math.floor(safeDiff / 3600);
  const minutes = Math.floor((safeDiff % 3600) / 60);
  const seconds = safeDiff % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  const formatted = hours > 0
    ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(minutes)}:${pad(seconds)}`;

  return { hours, minutes, seconds, formatted };
}

/**
 * Calculates progress towards next chime from 0 (just chimed) to 1 (about to chime).
 */
export function calculateProgress(nowMs: number, startMs: number, nextMs: number): number {
  if (nextMs <= startMs) return 1;
  const elapsed = nowMs - startMs;
  const total = nextMs - startMs;
  const ratio = elapsed / total;
  return Math.min(1, Math.max(0, ratio));
}
