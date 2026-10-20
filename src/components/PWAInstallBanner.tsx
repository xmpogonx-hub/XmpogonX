import React, { useState } from 'react';
import { Smartphone, Download, Share, X } from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall.ts';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (isInstalled || dismissed) {
    return null;
  }

  if (isInstallable) {
    return (
      <div className="bg-gradient-to-r from-cyan-950/80 via-slate-900 to-emerald-950/80 border-b border-cyan-500/30 px-4 py-2.5 text-xs text-white flex items-center justify-between gap-3 sticky top-[57px] z-20 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            Install <strong>Hourly Beep</strong> on your Android or PC home screen for seamless background chimes.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={install}
            className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  if (isIOS) {
    return (
      <>
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950/80 border-b border-indigo-500/30 px-4 py-2 text-xs text-white flex items-center justify-between gap-3 sticky top-[57px] z-20 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Install Hourly Beep on iPhone / iPad</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowIOSGuide(true)}
              className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition"
            >
              How to Install
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-white/10 p-6 text-white shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base">Install on iPhone / iPad</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                1. Tap the <strong className="text-cyan-400">Share</strong> icon in the Safari navigation bar.<br />
                2. Scroll down and tap <strong className="text-cyan-400">Add to Home Screen</strong>.<br />
                3. Tap <strong className="text-cyan-400">Add</strong> in top right.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
