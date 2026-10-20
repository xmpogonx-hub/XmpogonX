import { TimeZoneOption } from '../types/index.ts';

export const POPULAR_TIMEZONES: TimeZoneOption[] = [
  { id: 'local', label: 'Device Local Time', offset: 'Auto', region: 'Local', sampleCity: 'Detected from device' },
  { id: 'UTC', label: 'Universal Time (UTC)', offset: 'UTC+0', region: 'Global', sampleCity: 'Reykjavik, London (Winter)' },
  { id: 'America/New_York', label: 'Eastern Time (ET)', offset: 'UTC-5 / -4', region: 'North America', sampleCity: 'New York, Toronto, Miami' },
  { id: 'America/Chicago', label: 'Central Time (CT)', offset: 'UTC-6 / -5', region: 'North America', sampleCity: 'Chicago, Dallas, Mexico City' },
  { id: 'America/Denver', label: 'Mountain Time (MT)', offset: 'UTC-7 / -6', region: 'North America', sampleCity: 'Denver, Phoenix, Calgary' },
  { id: 'America/Los_Angeles', label: 'Pacific Time (PT)', offset: 'UTC-8 / -7', region: 'North America', sampleCity: 'Los Angeles, Seattle, Vancouver' },
  { id: 'Europe/London', label: 'Greenwich Mean Time (GMT/BST)', offset: 'UTC+0 / +1', region: 'Europe', sampleCity: 'London, Dublin, Lisbon' },
  { id: 'Europe/Paris', label: 'Central European Time (CET)', offset: 'UTC+1 / +2', region: 'Europe', sampleCity: 'Paris, Berlin, Rome, Madrid' },
  { id: 'Asia/Dubai', label: 'Gulf Standard Time (GST)', offset: 'UTC+4', region: 'Middle East', sampleCity: 'Dubai, Abu Dhabi, Muscat' },
  { id: 'Asia/Kolkata', label: 'India Standard Time (IST)', offset: 'UTC+5:30', region: 'South Asia', sampleCity: 'New Delhi, Mumbai, Bengaluru' },
  { id: 'Asia/Singapore', label: 'Singapore / Malaysia Time (SGT)', offset: 'UTC+8', region: 'Asia Pacific', sampleCity: 'Singapore, Kuala Lumpur, Hong Kong' },
  { id: 'Asia/Tokyo', label: 'Japan Standard Time (JST)', offset: 'UTC+9', region: 'East Asia', sampleCity: 'Tokyo, Seoul, Osaka' },
  { id: 'Australia/Sydney', label: 'Australian Eastern Time (AEST)', offset: 'UTC+10 / +11', region: 'Oceania', sampleCity: 'Sydney, Melbourne, Brisbane' },
  { id: 'Pacific/Auckland', label: 'New Zealand Time (NZST)', offset: 'UTC+12 / +13', region: 'Oceania', sampleCity: 'Auckland, Wellington' },
];

export function getLocalTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

export function formatTimeInZone(date: Date, timezone: string): { time: string; dateStr: string; tzLabel: string } {
  const actualZone = timezone === 'local' ? getLocalTimeZone() : timezone;

  try {
    const timeFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: actualZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    const dateFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: actualZone,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    return {
      time: timeFormatter.format(date),
      dateStr: dateFormatter.format(date),
      tzLabel: actualZone.replace(/_/g, ' '),
    };
  } catch {
    return {
      time: date.toLocaleTimeString(),
      dateStr: date.toLocaleDateString(),
      tzLabel: 'Local',
    };
  }
}
