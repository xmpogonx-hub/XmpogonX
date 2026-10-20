import React, { useState } from 'react';
import {
  Bell,
  BellOff,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  Vibrate,
  Clock,
  Compass,
  Check,
  AlertCircle,
  Moon,
} from 'lucide-react';
import { AppSettings, IntervalPreset, ThemeId } from '../types/index.ts';
import { THEMES } from '../utils/themes.ts';
import { formatTimeInZone } from '../utils/timezones.ts';

interface MainChimeCardProps {
  settings: AppSettings;
  currentTime: Date;
  nextChimeTimestamp: number;
  timeRemainingFormatted: string;
  progressRatio: number;
  isQuietHourNow: boolean;
  onUpdateSettings: (patch: Partial<AppSettings>) => void;
  onTestChime: () => void;
  onUnlockAudio: () => void;
  isAudioUnlocked: boolean;
}

const INTERVAL_PRESETS: IntervalPreset[] = [
  { id: '15m', label: '15 Min', minutes: 15, description: 'Micro-focus sprints & posture breaks' },
  { id: '30m', label: '30 Min', minutes: 30, description: 'Pomodoro half-hour time boxing' },
  { id: '45m', label: '45 Min', minutes: 45, description: 'Deep study & ergonomic cadence' },
  { id: '60m', label: '1 Hour', minutes: 60, description: 'Standard hourly clock chime' },
  { id: '120m', label: '2 Hours', minutes: 120, description: 'Hydration & long-range milestone' },
];

export const MainChimeCard: React.FC<MainChimeCardProps> = ({
  settings,
  currentTime,
  nextChimeTimestamp,
  timeRemainingFormatted,
  progressRatio,
  isQuietHourNow,
  onUpdateSettings,
  onTestChime,
  onUnlockAudio,
  isAudioUnlocked,
}) => {
  const [customInput, setCustomInput] = useState<string>(
    [15, 30, 45, 60, 120].includes(settings.intervalMinutes) ? '' : String(settings.intervalMinutes)
  );
  const [showCustom, setShowCustom] = useState<boolean>(
    ![15, 30, 45, 60, 120].includes(settings.intervalMinutes)
  );

  const theme = THEMES[settings.theme] || THEMES.casio;

  const localTimeInfo = formatTimeInZone(currentTime, 'local');
  const targetTimeInfo = formatTimeInZone(currentTime, settings.timezone);

  const nextChimeDate = new Date(nextChimeTimestamp);
  const nextChimeTimeStr = formatTimeInZone(nextChimeDate, settings.timezone).time;

  const handleSelectPreset = (minutes: number) => {
    setShowCustom(false);
    onUpdateSettings({ intervalMinutes: minutes });
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customInput, 10);
    if (!isNaN(val) && val >= 1 && val <= 720) {
      onUpdateSettings({ intervalMinutes: val });
    }
  };

  // Circular progress SVG calculations
  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <div
      className={`rounded-2xl border p-5 sm:p-7 transition-all duration-300 shadow-xl ${theme.cardBg} ${theme.cardBorder} ${theme.glowColor}`}
    >
      {/* Top Banner: Dual Time & Quiet Hours Alert */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-cyan-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">
              {settings.timezone === 'local' ? 'Current Time' : `Synced (${targetTimeInfo.tzLabel})`}
            </div>
            <div className="text-xl sm:text-2xl font-mono font-bold tracking-tight text-white flex items-center gap-2">
              <span>{targetTimeInfo.time}</span>
              <span className="text-xs font-normal text-slate-400 font-sans">
                {targetTimeInfo.dateStr}
              </span>
            </div>
          </div>
        </div>

        {isQuietHourNow ? (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-medium self-start sm:self-auto">
            <Moon className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span>Quiet Hours Active (Muted)</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Active Schedule</span>
          </div>
        )}
      </div>

      {/* Main Countdown & Gauge Visual */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Circular Dial / Progress Display */}
        <div className="md:col-span-5 flex flex-col items-center justify-center py-2">
          <div className="relative w-52 h-52 flex items-center justify-center">
            {/* Background SVG Gauge */}
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r={radius}
                className="stroke-white/10"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="100"
                cy="100"
                r={radius}
                className="transition-all duration-1000 ease-linear"
                stroke="currentColor"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={settings.enabled ? strokeDashoffset : circumference}
                strokeLinecap="round"
                fill="transparent"
                style={{
                  color: settings.enabled ? (theme.id === 'casio' ? '#34d399' : '#38bdf8') : '#64748b',
                }}
              />
            </svg>

            {/* Inner Content Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                {settings.enabled ? 'Next Chime In' : 'Alerts Disabled'}
              </span>

              <span
                className={`text-4xl sm:text-5xl font-mono font-extrabold tracking-tight my-1 transition-all ${
                  settings.enabled ? 'text-white' : 'text-slate-500'
                }`}
              >
                {settings.enabled ? timeRemainingFormatted : '--:--'}
              </span>

              <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                {settings.enabled ? (
                  <>
                    <Bell className="w-3 h-3 text-cyan-400" />
                    <span>at {nextChimeTimeStr}</span>
                  </>
                ) : (
                  <span>Toggle ON to start</span>
                )}
              </span>
            </div>
          </div>

          {/* Quick Progress Bar percentage */}
          {settings.enabled && (
            <div className="w-full max-w-[200px] mt-3">
              <div className="flex justify-between text-[11px] text-slate-400 mb-1 font-mono">
                <span>Cycle progress</span>
                <span>{Math.round(progressRatio * 100)}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.round(progressRatio * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Master Toggle & Interval Frequency Selection */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-5">
          {/* Master Alert Switch */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl transition-all ${
                  settings.enabled
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-white/5 text-slate-500 border border-white/5'
                }`}
              >
                {settings.enabled ? <Bell className="w-6 h-6 animate-bounce" /> : <BellOff className="w-6 h-6" />}
              </div>
              <div>
                <div className="font-semibold text-sm sm:text-base text-white">
                  {settings.enabled ? 'Hourly Chimes Active' : 'Hourly Chimes Muted'}
                </div>
                <div className="text-xs text-slate-400">
                  {settings.enabled
                    ? `Beeps every ${settings.intervalMinutes} min ${
                        settings.alignToHour ? '(clock-aligned)' : ''
                      }`
                    : 'Turn on to receive interval notifications'}
                </div>
              </div>
            </div>

            {/* Toggle Button */}
            <button
              onClick={() => onUpdateSettings({ enabled: !settings.enabled })}
              className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                settings.enabled ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
              role="switch"
              aria-checked={settings.enabled}
              aria-label="Toggle alerts"
            >
              <span
                className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  settings.enabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Interval Frequency Presets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Interval Frequency
              </label>
              <button
                onClick={() => setShowCustom(!showCustom)}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition"
              >
                {showCustom ? 'Use Presets' : 'Custom Interval'}
              </button>
            </div>

            {!showCustom ? (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {INTERVAL_PRESETS.map((preset) => {
                  const isSelected = settings.intervalMinutes === preset.minutes;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset.minutes)}
                      className={`py-2 px-2 rounded-xl text-center border font-medium text-xs sm:text-sm transition-all ${
                        isSelected
                          ? `${theme.accentBg} font-bold shadow-md scale-102`
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            ) : (
              <form onSubmit={handleCustomSubmit} className="flex gap-2 items-center">
                <input
                  type="number"
                  min="1"
                  max="720"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Minutes (e.g. 25, 45, 90)"
                  className="flex-1 bg-black/40 border border-white/20 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs sm:text-sm transition"
                >
                  Set Minutes
                </button>
              </form>
            )}
          </div>

          {/* Clock Alignment Switch */}
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="text-xs font-medium text-slate-200">
                  Align to Top-of-Hour (:00)
                </span>
                <p className="text-[11px] text-slate-400">
                  Sync beeps to clock marks (e.g. 1:00, 1:15, 1:30)
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              id="alignToggle"
              checked={settings.alignToHour}
              onChange={(e) => onUpdateSettings({ alignToHour: e.target.checked })}
              className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500 accent-cyan-500 cursor-pointer"
            />
          </div>

          {/* Test Chime Trigger & Audio Permissions Check */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={onTestChime}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium text-sm transition active:scale-98 shadow-sm"
            >
              <Play className="w-4 h-4 text-cyan-400 fill-cyan-400" />
              <span>Test Chime Tone</span>
            </button>

            {!isAudioUnlocked && (
              <button
                onClick={onUnlockAudio}
                className="px-3 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-medium hover:bg-amber-500/30 transition flex items-center gap-1.5"
                title="Browser needs 1 user click to permit sound alerts"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Prime Audio Engine</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
