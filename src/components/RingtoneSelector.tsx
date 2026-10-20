import React from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Vibrate,
  Radio,
  Check,
  ShieldAlert,
  Headphones,
  Sliders,
} from 'lucide-react';
import { AppSettings, SoundOption } from '../types/index.ts';
import { SOUND_OPTIONS, audioEngine } from '../utils/audioEngine.ts';
import { THEMES } from '../utils/themes.ts';

interface RingtoneSelectorProps {
  settings: AppSettings;
  onUpdateSettings: (patch: Partial<AppSettings>) => void;
}

export const RingtoneSelector: React.FC<RingtoneSelectorProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const theme = THEMES[settings.theme] || THEMES.casio;

  const handlePreview = (soundId: string) => {
    audioEngine.playAlert(soundId, settings.volume, false);
  };

  return (
    <div className={`rounded-2xl border p-5 sm:p-6 transition-all ${theme.cardBg} ${theme.cardBorder}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-cyan-400">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-semibold text-base sm:text-lg text-white">
              Tone & Alert Style
            </h2>
            <p className="text-xs text-slate-400">
              Select alert sound, preview ringtones, or enable vibrate-only mode
            </p>
          </div>
        </div>

        {/* Vibrate Only Toggle Switch */}
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl self-start sm:self-auto">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
            <Vibrate className="w-4 h-4 text-cyan-400" />
            <span>Vibrate-Only</span>
          </div>
          <button
            onClick={() => onUpdateSettings({ vibrateOnly: !settings.vibrateOnly })}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              settings.vibrateOnly ? 'bg-cyan-500' : 'bg-slate-700'
            }`}
            role="switch"
            aria-checked={settings.vibrateOnly}
            aria-label="Toggle vibrate only"
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                settings.vibrateOnly ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Volume Slider (Disabled if Vibrate-Only) */}
      <div className="mb-6 p-4 rounded-xl bg-black/30 border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
            {settings.vibrateOnly ? (
              <VolumeX className="w-4 h-4 text-slate-500" />
            ) : (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            )}
            <span>Master Alert Volume</span>
          </div>
          <span className="text-xs font-mono font-bold text-white">
            {settings.vibrateOnly ? 'Muted (Vibration)' : `${settings.volume}%`}
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          value={settings.volume}
          disabled={settings.vibrateOnly}
          onChange={(e) => onUpdateSettings({ volume: parseInt(e.target.value, 10) })}
          className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
            settings.vibrateOnly ? 'bg-slate-800' : 'bg-slate-700 accent-cyan-400'
          }`}
        />

        {/* Silent Mode Compatibility Note */}
        <div className="mt-3 flex items-start gap-2 text-[11px] text-slate-400 bg-white/5 rounded-lg p-2.5">
          <Headphones className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span>
            <strong>Silent Mode Override:</strong> Alert tones utilize the Web Audio Media channel. On most Android and mobile devices, sound continues to play audibly even when the physical ringer switch is set to Silent or Vibrate.
          </span>
        </div>
      </div>

      {/* Ringtone Sound Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {SOUND_OPTIONS.map((sound) => {
          const isSelected = settings.ringtoneId === sound.id;
          return (
            <div
              key={sound.id}
              onClick={() => onUpdateSettings({ ringtoneId: sound.id })}
              className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between relative group ${
                isSelected
                  ? 'bg-cyan-500/10 border-cyan-500/50 shadow-md ring-1 ring-cyan-500/30'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs sm:text-sm text-white">
                    {sound.name}
                  </span>
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-cyan-500 flex items-center justify-center text-slate-950">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                  {sound.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  {sound.category}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePreview(sound.id);
                  }}
                  className="px-2 py-1 rounded-lg bg-white/10 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 text-[11px] font-medium transition flex items-center gap-1"
                  title={`Preview ${sound.name}`}
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Preview</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
