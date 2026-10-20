export type ThemeId = 'casio' | 'midnight' | 'cyberpunk' | 'sunset' | 'slate' | 'forest';

export interface SoundOption {
  id: string;
  name: string;
  description: string;
  category: 'watch' | 'bell' | 'electronic' | 'ambient';
  durationMs: number;
}

export interface IntervalPreset {
  id: string;
  label: string;
  minutes: number;
  description: string;
}

export interface QuietHoursConfig {
  enabled: boolean;
  startHour: number; // 0-23
  startMinute: number; // 0-59
  endHour: number; // 0-23
  endMinute: number; // 0-59
  daysActive: number[]; // 0 (Sun) to 6 (Sat)
}

export interface TimeZoneOption {
  id: string;
  label: string;
  offset: string;
  region: string;
  sampleCity: string;
}

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'CHIME';

export interface LogEntry {
  id: string;
  timestamp: string;
  epoch: number;
  level: LogLevel;
  category: string;
  message: string;
  details?: Record<string, unknown> | string;
}

export interface BatteryState {
  level: number | null; // 0 - 1
  charging: boolean | null;
  supported: boolean;
  batterySaverActive: boolean;
}

export interface AppSettings {
  enabled: boolean;
  intervalMinutes: number;
  alignToHour: boolean;
  ringtoneId: string;
  volume: number; // 0 - 100
  vibrateOnly: boolean;
  vibratePattern: number[];
  quietHours: QuietHoursConfig;
  timezone: string; // 'local' or IANA identifier e.g. 'America/New_York'
  theme: ThemeId;
  biometricLockEnabled: boolean;
  pinCode: string;
  batterySaverActive: boolean;
  keepAliveAudio: boolean;
}
