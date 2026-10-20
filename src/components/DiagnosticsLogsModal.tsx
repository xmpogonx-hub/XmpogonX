import React, { useState, useEffect } from 'react';
import {
  X,
  Bug,
  Trash2,
  Copy,
  Download,
  AlertTriangle,
  Info,
  CheckCircle2,
  Bell,
  RefreshCw,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { LogEntry, LogLevel } from '../types/index.ts';
import { logger } from '../utils/logger.ts';
import { audioEngine } from '../utils/audioEngine.ts';
import { notificationManager } from '../utils/notificationManager.ts';
import { batteryService } from '../utils/batteryManager.ts';

interface DiagnosticsLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DiagnosticsLogsModal: React.FC<DiagnosticsLogsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const unsub = logger.subscribe((newLogs) => setLogs(newLogs));
      return unsub;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredLogs = logs.filter((log) => {
    if (filterLevel === 'ALL') return true;
    return log.level === filterLevel;
  });

  const handleCopyLogs = () => {
    navigator.clipboard.writeText(logger.exportJson());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([logger.exportJson()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hourly-beep-diagnostics-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerateTestError = () => {
    logger.log(
      'ERROR',
      'TestDiagnostic',
      'Simulated background watchdog exception to verify diagnostic capture.',
      { stack: 'Error at verifyStability (/src/utils/timerLogic.ts:42)' }
    );
  };

  const audioState = audioEngine.isUnlocked() ? 'Ready & Unlocked' : 'Suspended (Awaiting Gesture)';
  const notifState = notificationManager.getStatus();
  const batteryState = batteryService.getState();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-2xl bg-slate-900 border border-white/10 shadow-2xl p-6 text-white max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
              <Bug className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">System Diagnostics & Error Logs</h2>
              <p className="text-xs text-slate-400">
                Real-time execution log for debugging and background chime stability
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

        {/* Diagnostic Checklist */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 shrink-0">
          <div className="p-2.5 rounded-xl bg-black/40 border border-white/10">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              Audio Engine
            </div>
            <div className="text-xs font-mono font-medium text-cyan-300 truncate mt-0.5">
              {audioState}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-black/40 border border-white/10">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              Notifications
            </div>
            <div className="text-xs font-mono font-medium text-emerald-400 capitalize mt-0.5">
              {notifState}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-black/40 border border-white/10">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              Battery API
            </div>
            <div className="text-xs font-mono font-medium text-amber-300 mt-0.5">
              {batteryState.supported ? `${batteryState.level}% (Active)` : 'Emulated'}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-black/40 border border-white/10">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              Service Worker
            </div>
            <div className="text-xs font-mono font-medium text-emerald-400 mt-0.5">
              {'serviceWorker' in navigator ? 'Supported' : 'Unavailable'}
            </div>
          </div>
        </div>

        {/* Toolbar & Filter */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 shrink-0">
          <div className="flex gap-1.5 overflow-x-auto">
            {['ALL', 'ERROR', 'WARN', 'CHIME', 'INFO'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  filterLevel === lvl
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateTestError}
              className="px-2 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-medium border border-rose-500/30 transition flex items-center gap-1"
              title="Test log capture"
            >
              <span>Simulate Error</span>
            </button>

            <button
              onClick={handleCopyLogs}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
              title="Copy JSON logs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={handleDownload}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
              title="Download diagnostic file"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={() => logger.clear()}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 transition"
              title="Clear all logs"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Logs Table / Viewer */}
        <div className="flex-1 overflow-y-auto space-y-1.5 font-mono text-xs pr-1 border border-white/10 rounded-xl p-2 bg-black/50">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No logs found under filter "{filterLevel}".
            </div>
          ) : (
            filteredLogs.map((log) => {
              const timeStr = log.timestamp.slice(11, 19);
              let badgeColor = 'bg-slate-800 text-slate-300';
              if (log.level === 'ERROR') badgeColor = 'bg-rose-500/30 text-rose-300 border border-rose-500/50';
              else if (log.level === 'WARN') badgeColor = 'bg-amber-500/30 text-amber-300 border border-amber-500/50';
              else if (log.level === 'CHIME') badgeColor = 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50';
              else if (log.level === 'INFO') badgeColor = 'bg-blue-500/20 text-blue-300';

              return (
                <div
                  key={log.id}
                  className="p-2 rounded bg-white/5 hover:bg-white/10 transition flex flex-col gap-1 border border-white/5"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${badgeColor}`}>
                        {log.level}
                      </span>
                      <span className="text-slate-400">[{log.category}]</span>
                      <span className="text-slate-200">{log.message}</span>
                    </div>
                    <span className="text-slate-500 shrink-0">{timeStr}</span>
                  </div>

                  {log.details && (
                    <div className="text-[10px] text-slate-400 bg-black/40 p-1.5 rounded overflow-x-auto">
                      {typeof log.details === 'string'
                        ? log.details
                        : JSON.stringify(log.details)}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs sm:text-sm transition shrink-0 mt-3"
        >
          Close Diagnostics
        </button>
      </div>
    </div>
  );
};
