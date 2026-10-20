/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AppSettings, BatteryState, ThemeId, QuietHoursConfig } from './types/index.ts';
import { THEMES } from './utils/themes.ts';
import { calculateNextChimeTimestamp, isWithinQuietHours, formatTimeRemaining, calculateProgress } from './utils/timerLogic.ts';
import { audioEngine } from './utils/audioEngine.ts';
import { notificationManager, NotificationStatus } from './utils/notificationManager.ts';
import { batteryService } from './utils/batteryManager.ts';
import { logger } from './utils/logger.ts';
import { usePWAInstall } from './utils/usePWAInstall.ts';
import { formatTimeInZone } from './utils/timezones.ts';

import { Header } from './components/Header.tsx';
import { PWAInstallBanner } from './components/PWAInstallBanner.tsx';
import { MainChimeCard } from './components/MainChimeCard.tsx';
import { RingtoneSelector } from './components/RingtoneSelector.tsx';
import { ScheduleModal } from './components/ScheduleModal.tsx';
import { BatteryOptimizationModal } from './components/BatteryOptimizationModal.tsx';
import { TimezoneSyncModal } from './components/TimezoneSyncModal.tsx';
import { ThemeModal } from './components/ThemeModal.tsx';
import { SecurityModal } from './components/SecurityModal.tsx';
import { LockScreen } from './components/LockScreen.tsx';
import { DiagnosticsLogsModal } from './components/DiagnosticsLogsModal.tsx';
import { ApkDistributionModal } from './components/ApkDistributionModal.tsx';
import { UserFeedbackModal } from './components/UserFeedbackModal.tsx';
import { AppInfoModal } from './components/AppInfoModal.tsx';

import {
  Bell,
  Clock,
  Battery,
  Shield,
  Smartphone,
  Calendar,
  Volume2,
  Sparkles,
  ExternalLink,
  Zap,
} from 'lucide-react';

const SETTINGS_STORAGE_KEY = 'hourly_beep_settings_v14';

const DEFAULT_SETTINGS: AppSettings = {
  enabled: true,
  intervalMinutes: 60,
  alignToHour: true,
  ringtoneId: 'classic_watch',
  volume: 85,
  vibrateOnly: false,
  vibratePattern: [120, 60, 120],
  quietHours: {
    enabled: true,
    startHour: 22,
    startMinute: 0,
    endHour: 7,
    endMinute: 0,
    daysActive: [0, 1, 2, 3, 4, 5, 6],
  },
  timezone: 'local',
  theme: 'casio',
  biometricLockEnabled: false,
  pinCode: '1234',
  batterySaverActive: false,
  keepAliveAudio: false,
};

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (stored) {
          return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
        }
      }
    } catch {
      // Fallback to default
    }
    return DEFAULT_SETTINGS;
  });

  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [nextChimeTimestamp, setNextChimeTimestamp] = useState<number>(() => {
    return calculateNextChimeTimestamp(Date.now(), DEFAULT_SETTINGS.intervalMinutes, DEFAULT_SETTINGS.alignToHour);
  });
  const [battery, setBattery] = useState<BatteryState>(batteryService.getState());
  const [notificationStatus, setNotificationStatus] = useState<NotificationStatus>(notificationManager.getStatus());
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isAudioUnlocked, setIsAudioUnlocked] = useState<boolean>(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const { isInstallable, install } = usePWAInstall();
  const lastTriggeredChimeRef = useRef<number>(0);

  // Save settings on update
  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...patch };
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Storage limit
      }
      return updated;
    });
  }, []);

  // Update next chime timestamp whenever interval, alignment, or timezone changes
  useEffect(() => {
    const next = calculateNextChimeTimestamp(Date.now(), settings.intervalMinutes, settings.alignToHour);
    setNextChimeTimestamp(next);
  }, [settings.intervalMinutes, settings.alignToHour, settings.timezone]);

  // Battery service subscription
  useEffect(() => {
    const unsub = batteryService.subscribe((state) => {
      setBattery(state);
    });
    return unsub;
  }, []);

  // Check initial audio state
  useEffect(() => {
    setIsAudioUnlocked(audioEngine.isUnlocked());
  }, []);

  // Handle keepAlive audio sync
  useEffect(() => {
    audioEngine.setKeepAlive(settings.keepAliveAudio);
  }, [settings.keepAliveAudio]);

  // Main 1-second ticking clock loop & chime trigger check
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const nowMs = now.getTime();
      setCurrentTime(now);

      if (!settings.enabled) return;

      // Check if current moment reached or passed next chime timestamp
      if (nowMs >= nextChimeTimestamp) {
        // Prevent double triggers within same minute
        if (nowMs - lastTriggeredChimeRef.current >= 30000) {
          lastTriggeredChimeRef.current = nowMs;

          const isQuiet = isWithinQuietHours(nowMs, settings.quietHours);
          if (!isQuiet) {
            // Trigger Chime
            audioEngine.playAlert(
              settings.ringtoneId,
              settings.volume,
              settings.vibrateOnly,
              settings.vibratePattern
            );

            // Send Notification
            const timeLabel = formatTimeInZone(now, settings.timezone).time;
            notificationManager.sendChimeNotification(
              'Hourly Beep Time Alert',
              `Time check: ${timeLabel}. Stay focused on your goals!`,
              settings.vibratePattern
            );

            logger.log('CHIME', 'Scheduler', `Scheduled interval chime triggered at ${timeLabel}`);
          } else {
            logger.log('INFO', 'Scheduler', 'Chime skipped due to active Quiet Hours schedule.');
          }

          // Advance to next interval
          const next = calculateNextChimeTimestamp(nowMs + 1000, settings.intervalMinutes, settings.alignToHour);
          setNextChimeTimestamp(next);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [settings, nextChimeTimestamp]);

  // Test Chime Trigger
  const handleTestChime = () => {
    audioEngine.playAlert(
      settings.ringtoneId,
      settings.volume,
      settings.vibrateOnly,
      settings.vibratePattern
    );
    setIsAudioUnlocked(true);

    const timeLabel = formatTimeInZone(new Date(), settings.timezone).time;
    notificationManager.sendChimeNotification(
      'Test Alert - Hourly Beep',
      `Manual chime test sounded at ${timeLabel}. All alerts active.`
    );
    logger.log('CHIME', 'ManualTest', `Manual chime test played: ${settings.ringtoneId}`);
  };

  // Prime / Unlock audio engine
  const handleUnlockAudio = () => {
    const ok = audioEngine.unlockAudio();
    if (ok) {
      setIsAudioUnlocked(true);
      handleTestChime();
    }
  };

  // Request notifications
  const handleRequestNotification = async () => {
    const status = await notificationManager.requestPermission();
    setNotificationStatus(status);
  };

  const isQuietHourNow = isWithinQuietHours(currentTime.getTime(), settings.quietHours);
  const timeRemainingMs = Math.max(0, nextChimeTimestamp - currentTime.getTime());
  const { formatted: timeRemainingFormatted } = formatTimeRemaining(timeRemainingMs);

  const cycleDurationMs = settings.intervalMinutes * 60 * 1000;
  const cycleStartMs = nextChimeTimestamp - cycleDurationMs;
  const progressRatio = calculateProgress(currentTime.getTime(), cycleStartMs, nextChimeTimestamp);

  const currentTheme = THEMES[settings.theme] || THEMES.casio;

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-500 font-sans ${currentTheme.bgClass}`}
    >
      {/* Header */}
      <Header
        settings={settings}
        battery={battery}
        notificationStatus={notificationStatus}
        isLocked={isLocked}
        onOpenSettings={(modal) => setActiveModal(modal)}
        onToggleMaster={() => updateSettings({ enabled: !settings.enabled })}
        onRequestNotification={handleRequestNotification}
        onLockApp={() => setIsLocked(true)}
      />

      {/* In-app PWA install prompt banner */}
      <PWAInstallBanner />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Main Countdown & Control Card */}
        <MainChimeCard
          settings={settings}
          currentTime={currentTime}
          nextChimeTimestamp={nextChimeTimestamp}
          timeRemainingFormatted={timeRemainingFormatted}
          progressRatio={progressRatio}
          isQuietHourNow={isQuietHourNow}
          onUpdateSettings={updateSettings}
          onTestChime={handleTestChime}
          onUnlockAudio={handleUnlockAudio}
          isAudioUnlocked={isAudioUnlocked}
        />

        {/* Ringtone & Audio Tone Selection */}
        <RingtoneSelector
          settings={settings}
          onUpdateSettings={updateSettings}
        />

        {/* Quick Access Utility Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Schedule / Quiet Hours */}
          <button
            onClick={() => setActiveModal('schedule')}
            className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-left transition flex flex-col justify-between group shadow-sm"
          >
            <div className="flex items-center justify-between text-indigo-400 mb-2">
              <Calendar className="w-5 h-5" />
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20">
                {settings.quietHours.enabled ? 'Active' : 'Off'}
              </span>
            </div>
            <div>
              <div className="font-semibold text-xs sm:text-sm text-white group-hover:text-indigo-300 transition">
                Quiet Hours
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {settings.quietHours.enabled
                  ? `${settings.quietHours.startHour}:00 - ${settings.quietHours.endHour}:00`
                  : 'Mute alerts at night'}
              </p>
            </div>
          </button>

          {/* Time Zone Sync */}
          <button
            onClick={() => setActiveModal('timezone')}
            className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-left transition flex flex-col justify-between group shadow-sm"
          >
            <div className="flex items-center justify-between text-cyan-400 mb-2">
              <Clock className="w-5 h-5" />
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/20">
                Sync
              </span>
            </div>
            <div>
              <div className="font-semibold text-xs sm:text-sm text-white group-hover:text-cyan-300 transition">
                Time Zone Sync
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                {settings.timezone === 'local' ? 'Local Device' : settings.timezone}
              </p>
            </div>
          </button>

          {/* Android Battery Optimization */}
          <button
            onClick={() => setActiveModal('battery')}
            className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-left transition flex flex-col justify-between group shadow-sm"
          >
            <div className="flex items-center justify-between text-emerald-400 mb-2">
              <Battery className="w-5 h-5" />
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20">
                Intent
              </span>
            </div>
            <div>
              <div className="font-semibold text-xs sm:text-sm text-white group-hover:text-emerald-300 transition">
                Battery & Doze
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Android Intent setup
              </p>
            </div>
          </button>

          {/* Biometric Security */}
          <button
            onClick={() => setActiveModal('security')}
            className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-left transition flex flex-col justify-between group shadow-sm"
          >
            <div className="flex items-center justify-between text-sky-400 mb-2">
              <Shield className="w-5 h-5" />
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-sky-500/20">
                {settings.biometricLockEnabled ? 'Protected' : 'Open'}
              </span>
            </div>
            <div>
              <div className="font-semibold text-xs sm:text-sm text-white group-hover:text-sky-300 transition">
                Biometric Lock
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {settings.biometricLockEnabled ? 'Fingerprint / PIN' : 'Secure user data'}
              </p>
            </div>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/10 py-6 mt-12 bg-black/40 text-center text-xs text-slate-400">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">Hourly Beep</span>
            <span>•</span>
            <span>v1.4.0 (#2026.10.42)</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => setActiveModal('info')}
              className="hover:text-white transition"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setActiveModal('apk')}
              className="hover:text-white transition"
            >
              Get Android APK
            </button>
            <button
              onClick={() => setActiveModal('feedback')}
              className="hover:text-white transition"
            >
              Email Support (mpldwdind@gmail.com)
            </button>
          </div>
        </div>
      </footer>

      {/* Full-Screen Biometric / PIN Lock Screen */}
      {isLocked && (
        <LockScreen
          pinCode={settings.pinCode}
          onUnlock={() => setIsLocked(false)}
        />
      )}

      {/* Modals */}
      <ScheduleModal
        config={settings.quietHours}
        isOpen={activeModal === 'schedule'}
        onClose={() => setActiveModal(null)}
        onUpdate={(quietHours) => updateSettings({ quietHours })}
      />

      <BatteryOptimizationModal
        battery={battery}
        keepAliveAudio={settings.keepAliveAudio}
        isOpen={activeModal === 'battery'}
        onClose={() => setActiveModal(null)}
        onToggleKeepAlive={(keepAliveAudio) => updateSettings({ keepAliveAudio })}
      />

      <TimezoneSyncModal
        currentTime={currentTime}
        selectedZone={settings.timezone}
        isOpen={activeModal === 'timezone'}
        onClose={() => setActiveModal(null)}
        onSelectZone={(timezone) => updateSettings({ timezone })}
      />

      <ThemeModal
        currentTheme={settings.theme}
        isOpen={activeModal === 'theme'}
        onClose={() => setActiveModal(null)}
        onSelectTheme={(theme) => updateSettings({ theme })}
      />

      <SecurityModal
        biometricLockEnabled={settings.biometricLockEnabled}
        pinCode={settings.pinCode}
        isOpen={activeModal === 'security'}
        onClose={() => setActiveModal(null)}
        onUpdateSecurity={(biometricLockEnabled, pinCode) =>
          updateSettings({ biometricLockEnabled, pinCode })
        }
      />

      <DiagnosticsLogsModal
        isOpen={activeModal === 'diagnostics'}
        onClose={() => setActiveModal(null)}
      />

      <ApkDistributionModal
        isOpen={activeModal === 'apk'}
        onClose={() => setActiveModal(null)}
        isInstallable={isInstallable}
        onInstallPwa={install}
      />

      <UserFeedbackModal
        isOpen={activeModal === 'feedback'}
        onClose={() => setActiveModal(null)}
      />

      <AppInfoModal
        isOpen={activeModal === 'info'}
        onClose={() => setActiveModal(null)}
        onOpenFeedback={() => setActiveModal('feedback')}
      />
    </div>
  );
}
