import React from 'react';
import { X, Palette, Check, Sparkles, Moon } from 'lucide-react';
import { ThemeId } from '../types/index.ts';
import { THEMES } from '../utils/themes.ts';

interface ThemeModalProps {
  currentTheme: ThemeId;
  isOpen: boolean;
  onClose: () => void;
  onSelectTheme: (theme: ThemeId) => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  currentTheme,
  isOpen,
  onClose,
  onSelectTheme,
}) => {
  if (!isOpen) return null;

  const themesList = Object.values(THEMES);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-white/10 shadow-2xl p-6 text-white animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Custom Themes & Dark Mode</h2>
              <p className="text-xs text-slate-400">
                Personalize contrast, watch styling, and low-light eye comfort
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {themesList.map((th) => {
            const isSelected = currentTheme === th.id;
            return (
              <div
                key={th.id}
                onClick={() => onSelectTheme(th.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-cyan-400 ring-2 ring-cyan-500/40 bg-white/10 shadow-lg'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-sm text-white">{th.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 font-mono text-slate-300">
                      {th.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                    {th.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <div className="flex items-center gap-1.5">
                    {th.previewColors.map((col, idx) => (
                      <span
                        key={idx}
                        className="w-4 h-4 rounded-full border border-black/30 shadow-sm"
                        style={{ backgroundColor: col }}
                      />
                    ))}
                  </div>

                  {isSelected ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-cyan-400">
                      <Check className="w-3.5 h-3.5" />
                      <span>Active</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400">Select</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm transition"
        >
          Apply & Return
        </button>
      </div>
    </div>
  );
};
