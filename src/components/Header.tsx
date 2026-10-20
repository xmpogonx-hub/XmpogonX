import React from 'react';
import {
  Bell,
  BellOff,
  Battery,
  BatteryCharging,
  Shield,
  ShieldAlert,
  Smartphone,
  Bug,
  Info,
  Palette,
  Clock,
  Moon,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { AppSettings, BatteryState, ThemeId } from '../types/index.ts';
import { THEMES } from '../utils/themes.ts';
import { NotificationStatus } from '../utils/notificationManager.ts';

interface HeaderProps {
  settings: AppSettings;
  battery: BatteryState;
  notificationStatus: NotificationStatus;
  isLocked: boolean;
  onOpenSettings: (modal: string) => void;
  onToggleMaster: () => void;
  onRequestNotification: () => void;
  onLockApp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  battery,
  notificationStatus,
  isLocked,
  onOpenSettings,
  onToggleMaster,
  onRequestNotification,
  onLockApp,
}) => {
  const currentTheme = THEMES[settings.theme] || THEMES.casio;

  return (
    <header className="w-full border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* App Branding with Circular Icon & Subtle Notification Indicator */}
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer" onClick={() => onOpenSettings('info')}>
            {/* Circular App Icon */}
            <div className="w-10 h-10 rounded-full bg-slate-900 border-2 border-slate-700/80 shadow-md flex items-center justify-center relative overflow-hidden transition-transform active:scale-95 group-hover:border-cyan-500/60">
              {/* Dial markings */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[1px] h-2 bg-slate-400 absolute top-0.5" />
                <div className="w-[1px] h-2 bg-slate-400 absolute bottom-0.5" />
                <div className="h-[1px] w-2 bg-slate-400 absolute left-0.5" />
                <div className="h-[1px] w-2 bg-slate-400 absolute right-0.5" />
              </div>
              {/* Clock hands pointing at 12 */}
              <div className="w-0.5 h-3 bg-cyan-400 rounded-full mb-2 origin-bottom" />
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-300 absolute" />

              {/* Subtle Notification Indicator Beacon at upper right */}
              <div
                className={`absolute top-1 right-1 w-2.5 h-2.5 rounded-full border border-black transition-all ${
                  settings.enabled
                    ? 'bg-cyan-400 shadow-[0_0_8px_#38bdf8] animate-pulse'
                    : 'bg-slate-600'
                }`}
                title={settings.enabled ? 'Chime Active' : 'Chime Off'}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base sm:text-lg tracking-tight leading-none text-white flex items-center gap-1.5">
                Hourly Beep
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-medium">
                v1.4.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Time Management & Interval Chime
            </p>
          </div>
        </div>

        {/* Action Controls & Indicators */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Notification Permission Button */}
          {notificationStatus !== 'granted' && (
            <button
              onClick={onRequestNotification}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition animate-pulse"
              title="Enable background notifications for alerts while app is closed"
            >
              <BellOff className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Allow Background Alerts</span>
            </button>
          )}

          {/* Battery Status Button */}
          <button
            onClick={() => onOpenSettings('battery')}
            className={`flex items-center gap-1.5 px-2 py-1 text-xs rounded-lg border transition ${
              battery.batterySaverActive
                ? 'bg-amber-950/40 border-amber-800/50 text-amber-300'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
            title="Battery Optimization & Android Settings Intent"
          >
            {battery.charging ? (
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Battery className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span className="font-mono text-[11px]">
              {battery.level !== null ? `${battery.level}%` : 'Eco'}
            </span>
          </button>

          {/* Theme Switcher Button */}
          <button
            onClick={() => onOpenSettings('theme')}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition"
            title="Personalize Color Theme & Dark Mode"
            aria-label="Theme Settings"
          >
            <Palette className="w-4 h-4" />
          </button>

          {/* Time Zone Synchronization */}
          <button
            onClick={() => onOpenSettings('timezone')}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition"
            title="Time Zone Synchronization"
            aria-label="Timezone Settings"
          >
            <Clock className="w-4 h-4" />
          </button>

          {/* Android APK Distribution Button */}
          <button
            onClick={() => onOpenSettings('apk')}
            className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 text-xs font-medium transition"
            title="Install Android APK / Native PWA"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Get APK</span>
          </button>

          {/* Biometric Security Lock Button */}
          {settings.biometricLockEnabled && (
            <button
              onClick={onLockApp}
              className="p-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 transition"
              title="Lock with Biometrics / PIN"
              aria-label="Lock App"
            >
              <Shield className="w-4 h-4" />
            </button>
          )}

          {/* Error Diagnostics Logs */}
          <button
            onClick={() => onOpenSettings('diagnostics')}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition"
            title="System Diagnostics & Error Logs"
            aria-label="Diagnostics"
          >
            <Bug className="w-4 h-4" />
          </button>

          {/* User Feedback Modal */}
          <button
            onClick={() => onOpenSettings('feedback')}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition"
            title="Send Bug Report / Feature Request to mpldwdind@gmail.com"
            aria-label="Feedback"
          >
            <span className="text-xs font-semibold">?</span>
          </button>

          {/* App Info Button */}
          <button
            onClick={() => onOpenSettings('info')}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition"
            title="About App & Privacy Policy"
            aria-label="App Info"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
