import React from 'react';
import { X, Moon, Sun, Calendar, Clock, Check } from 'lucide-react';
import { QuietHoursConfig } from '../types/index.ts';

interface ScheduleModalProps {
  config: QuietHoursConfig;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (config: QuietHoursConfig) => void;
}

const DAYS = [
  { day: 0, label: 'Sun' },
  { day: 1, label: 'Mon' },
  { day: 2, label: 'Tue' },
  { day: 3, label: 'Wed' },
  { day: 4, label: 'Thu' },
  { day: 5, label: 'Fri' },
  { day: 6, label: 'Sat' },
];

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  config,
  isOpen,
  onClose,
  onUpdate,
}) => {
  if (!isOpen) return null;

  const toggleDay = (day: number) => {
    const nextDays = config.daysActive.includes(day)
      ? config.daysActive.filter((d) => d !== day)
      : [...config.daysActive, day];
    onUpdate({ ...config, daysActive: nextDays });
  };

  const setPreset = (preset: 'sleep' | 'work' | 'all') => {
    if (preset === 'sleep') {
      onUpdate({
        ...config,
        enabled: true,
        startHour: 22,
        startMinute: 0,
        endHour: 7,
        endMinute: 0,
        daysActive: [0, 1, 2, 3, 4, 5, 6],
      });
    } else if (preset === 'work') {
      onUpdate({
        ...config,
        enabled: true,
        startHour: 18,
        startMinute: 0,
        endHour: 9,
        endMinute: 0,
        daysActive: [1, 2, 3, 4, 5],
      });
    } else {
      onUpdate({
        ...config,
        enabled: false,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-white/10 shadow-2xl p-6 text-white animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Quiet Hours & Schedule</h2>
              <p className="text-xs text-slate-400">
                Automatically mute beeps during sleep or focus windows
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Master Quiet Hours Switch */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 mb-5">
          <div>
            <div className="font-medium text-sm text-white">Enable Quiet Hours</div>
            <div className="text-xs text-slate-400">
              Mutes all interval alerts during the defined sleep schedule
            </div>
          </div>
          <button
            onClick={() => onUpdate({ ...config, enabled: !config.enabled })}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              config.enabled ? 'bg-indigo-500' : 'bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                config.enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="mb-5">
          <div className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">
            Schedule Presets
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setPreset('sleep')}
              className="py-2 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300 transition"
            >
              Sleep: 10PM - 7AM
            </button>
            <button
              onClick={() => setPreset('work')}
              className="py-2 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300 transition"
            >
              Work: 9AM - 6PM
            </button>
            <button
              onClick={() => setPreset('all')}
              className="py-2 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300 transition"
            >
              24/7 Always Active
            </button>
          </div>
        </div>

        {/* Time Window Settings */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="p-4 rounded-xl bg-black/40 border border-white/10">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
              Mute Starting (Sleep)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                max="23"
                value={config.startHour}
                onChange={(e) =>
                  onUpdate({ ...config, startHour: Math.max(0, Math.min(23, parseInt(e.target.value) || 0)) })
                }
                className="w-16 bg-white/5 border border-white/20 rounded-lg p-2 font-mono text-center text-sm"
              />
              <span className="self-center font-bold">:</span>
              <input
                type="number"
                min="0"
                max="59"
                value={config.startMinute}
                onChange={(e) =>
                  onUpdate({ ...config, startMinute: Math.max(0, Math.min(59, parseInt(e.target.value) || 0)) })
                }
                className="w-16 bg-white/5 border border-white/20 rounded-lg p-2 font-mono text-center text-sm"
              />
            </div>
            <span className="text-[11px] text-slate-400 mt-2 block font-mono">
              {config.startHour.toString().padStart(2, '0')}:{config.startMinute.toString().padStart(2, '0')}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-black/40 border border-white/10">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
              Resume Alerts (Wake)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                max="23"
                value={config.endHour}
                onChange={(e) =>
                  onUpdate({ ...config, endHour: Math.max(0, Math.min(23, parseInt(e.target.value) || 0)) })
                }
                className="w-16 bg-white/5 border border-white/20 rounded-lg p-2 font-mono text-center text-sm"
              />
              <span className="self-center font-bold">:</span>
              <input
                type="number"
                min="0"
                max="59"
                value={config.endMinute}
                onChange={(e) =>
                  onUpdate({ ...config, endMinute: Math.max(0, Math.min(59, parseInt(e.target.value) || 0)) })
                }
                className="w-16 bg-white/5 border border-white/20 rounded-lg p-2 font-mono text-center text-sm"
              />
            </div>
            <span className="text-[11px] text-slate-400 mt-2 block font-mono">
              {config.endHour.toString().padStart(2, '0')}:{config.endMinute.toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Days of Week Selection */}
        <div className="mb-6">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
            Active Days
          </label>
          <div className="grid grid-cols-7 gap-1.5">
            {DAYS.map(({ day, label }) => {
              const isActive = config.daysActive.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`py-2 text-center rounded-lg text-xs font-medium transition ${
                    isActive
                      ? 'bg-indigo-600 text-white font-bold shadow'
                      : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-sm transition"
        >
          Save & Close
        </button>
      </div>
    </div>
  );
};
