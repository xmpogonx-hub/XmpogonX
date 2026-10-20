import React, { useState } from 'react';
import { X, Clock, Globe, Check, Search, Compass } from 'lucide-react';
import { POPULAR_TIMEZONES, getLocalTimeZone, formatTimeInZone } from '../utils/timezones.ts';

interface TimezoneSyncModalProps {
  currentTime: Date;
  selectedZone: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectZone: (zone: string) => void;
}

export const TimezoneSyncModal: React.FC<TimezoneSyncModalProps> = ({
  currentTime,
  selectedZone,
  isOpen,
  onClose,
  onSelectZone,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const localZone = getLocalTimeZone();
  const filteredZones = POPULAR_TIMEZONES.filter(
    (tz) =>
      tz.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tz.sampleCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tz.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-white/10 shadow-2xl p-6 text-white max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">International Timezone Sync</h2>
              <p className="text-xs text-slate-400">
                Synchronize hourly alerts across international time zones
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

        {/* Current Active Sync Banner */}
        <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 mb-4 shrink-0">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Current Device Local:</span>
            <span className="font-mono text-cyan-300">{localZone}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white">Active Chime Reference:</span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {selectedZone === 'local' ? `Local (${localZone})` : selectedZone}
            </span>
          </div>
        </div>

        {/* Search input */}
        <div className="relative mb-3 shrink-0">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search timezone by city, country or code..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Timezone List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 my-2">
          {filteredZones.map((tz) => {
            const isSelected = selectedZone === tz.id;
            const timePreview = formatTimeInZone(currentTime, tz.id).time;

            return (
              <div
                key={tz.id}
                onClick={() => {
                  onSelectZone(tz.id);
                  onClose();
                }}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-cyan-500/15 border-cyan-500/50 shadow-md'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs sm:text-sm text-white">
                      {tz.label}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-slate-400 font-mono">
                      {tz.offset}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {tz.sampleCity}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-mono text-xs sm:text-sm font-bold text-cyan-300">
                      {timePreview}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase">{tz.region}</div>
                  </div>

                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center text-slate-950">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs sm:text-sm transition shrink-0 mt-3"
        >
          Close
        </button>
      </div>
    </div>
  );
};
