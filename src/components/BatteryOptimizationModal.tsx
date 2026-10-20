import React, { useState } from 'react';
import {
  X,
  Battery,
  BatteryCharging,
  Zap,
  ShieldAlert,
  Smartphone,
  ExternalLink,
  Copy,
  Check,
  Power,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { BatteryState } from '../types/index.ts';
import {
  ANDROID_OPTIMIZATION_INTENTS,
  MANUFACTURER_GUIDES,
} from '../utils/batteryManager.ts';
import { logger } from '../utils/logger.ts';

interface BatteryOptimizationModalProps {
  battery: BatteryState;
  keepAliveAudio: boolean;
  isOpen: boolean;
  onClose: () => void;
  onToggleKeepAlive: (enabled: boolean) => void;
}

export const BatteryOptimizationModal: React.FC<BatteryOptimizationModalProps> = ({
  battery,
  keepAliveAudio,
  isOpen,
  onClose,
  onToggleKeepAlive,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string>('Samsung');

  if (!isOpen) return null;

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    logger.log('INFO', 'Battery', `Copied Android intent command to clipboard: ${text}`);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleTriggerIntent = (intentAction: string) => {
    logger.log('INFO', 'Battery', `Attempting Android Intent launch: ${intentAction}`);
    // Web intent / custom scheme attempt
    try {
      window.location.href = `intent:#Intent;action=${intentAction};package=com.hourlybeep.app;end`;
    } catch {
      // Intent scheme will be handled in native Android app wrapper
    }
  };

  const currentGuide = MANUFACTURER_GUIDES.find((g) => g.brand === selectedBrand) || MANUFACTURER_GUIDES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-white/10 shadow-2xl p-6 text-white max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Battery & Android Doze Optimization</h2>
              <p className="text-xs text-slate-400">
                Ensure persistent, accurate background interval chimes without system kills
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

        {/* Live Device Battery Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/10">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
              Battery Level
            </div>
            <div className="flex items-center gap-2">
              {battery.charging ? (
                <BatteryCharging className="w-5 h-5 text-emerald-400" />
              ) : (
                <Battery className="w-5 h-5 text-cyan-400" />
              )}
              <span className="text-xl font-mono font-bold">
                {battery.level !== null ? `${battery.level}%` : 'Standard'}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-black/40 border border-white/10">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
              Power State
            </div>
            <div className="text-sm font-medium text-slate-200">
              {battery.charging ? 'Charging (AC/USB)' : 'Discharging'}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-black/40 border border-white/10">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
              Timer Precision
            </div>
            <div className="text-sm font-medium text-emerald-400 flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              <span>Event Loop Batching</span>
            </div>
          </div>
        </div>

        {/* Keep-Alive Audio Priming Switch */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6 flex items-center justify-between gap-4">
          <div>
            <div className="font-semibold text-sm text-white flex items-center gap-2">
              <Power className="w-4 h-4 text-cyan-400" />
              <span>Background Audio Keep-Alive</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Prevents mobile browser tabs from being put to sleep by the operating system during long work sessions. Consumes ~0.8% extra battery per hour.
            </p>
          </div>
          <button
            onClick={() => onToggleKeepAlive(!keepAliveAudio)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              keepAliveAudio ? 'bg-cyan-500' : 'bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                keepAliveAudio ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Android Intent Settings Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-300">
              Android Intent & System Permissions
            </h3>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Modern Android (Doze Mode & Standby Buckets) suspends apps that run alarms. To keep hourly chimes on schedule, exempt Hourly Beep from battery optimization:
          </p>

          <div className="space-y-2.5">
            {ANDROID_OPTIMIZATION_INTENTS.map((intent, idx) => (
              <div
                key={intent.action}
                className="p-3 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-xs text-cyan-300">{intent.label}</div>
                  <button
                    onClick={() => handleTriggerIntent(intent.action)}
                    className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition"
                  >
                    <span>Open Intent</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
                <div className="text-[11px] text-slate-400 font-mono break-all bg-white/5 p-1.5 rounded">
                  {intent.action}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="truncate mr-2">{intent.description}</span>
                  <button
                    onClick={() => handleCopy(intent.adbCommand, idx)}
                    className="shrink-0 flex items-center gap-1 text-slate-300 hover:text-white"
                    title="Copy ADB debug command"
                  >
                    {copiedIndex === idx ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>ADB command</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Device Manufacturer Guide */}
        <div className="mb-6">
          <div className="text-xs uppercase tracking-wider font-semibold text-slate-300 mb-2">
            OEM Whitelist Guides (Prevent Background Kills)
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
            {MANUFACTURER_GUIDES.map((guide) => (
              <button
                key={guide.brand}
                onClick={() => setSelectedBrand(guide.brand)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                  selectedBrand === guide.brand
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {guide.brand} ({guide.uiName})
              </button>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs space-y-2">
            <div className="font-semibold text-slate-200">
              How to whitelist on {currentGuide.brand} ({currentGuide.uiName}):
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
              {currentGuide.steps.map((step, sIdx) => (
                <li key={sIdx}>{step}</li>
              ))}
            </ol>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm transition"
        >
          Got It
        </button>
      </div>
    </div>
  );
};
