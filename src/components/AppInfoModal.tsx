import React, { useState } from 'react';
import {
  X,
  Info,
  ShieldCheck,
  FileText,
  Mail,
  Heart,
  ExternalLink,
  Smartphone,
  Lock,
} from 'lucide-react';

interface AppInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFeedback: () => void;
}

export const AppInfoModal: React.FC<AppInfoModalProps> = ({
  isOpen,
  onClose,
  onOpenFeedback,
}) => {
  const [view, setView] = useState<'info' | 'privacy'>('info');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-white/10 shadow-2xl p-6 text-white max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              {view === 'info' ? <Info className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="font-semibold text-lg">
                {view === 'info' ? 'About Hourly Beep' : 'Privacy Policy'}
              </h2>
              <p className="text-xs text-slate-400">
                {view === 'info' ? 'Version & System Information' : 'Local Data & Security Commitments'}
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

        {view === 'info' ? (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {/* Version & Build Spec */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Application Name:</span>
                <span className="font-semibold text-white">Hourly Beep</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Version:</span>
                <span className="font-mono font-bold text-cyan-300">v1.4.0 (Production)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Build Number:</span>
                <span className="font-mono text-emerald-300">#2026.10.42</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Target Framework:</span>
                <span className="font-mono text-slate-300">React 19 • PWA Standalone</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Audio Synthesis:</span>
                <span className="font-mono text-slate-300">Web Audio API (Hardware Realtime)</span>
              </div>
            </div>

            {/* Privacy Policy Link Banner */}
            <div
              onClick={() => setView('privacy')}
              className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <div className="text-xs font-semibold text-white group-hover:text-cyan-300 transition">
                    View Privacy Policy
                  </div>
                  <div className="text-[11px] text-slate-400">
                    100% On-Device local processing, zero third-party telemetry
                  </div>
                </div>
              </div>
              <span className="text-xs text-cyan-400 font-medium">Read &rarr;</span>
            </div>

            {/* Support Contact */}
            <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-xs space-y-2">
              <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
                <Mail className="w-4 h-4" />
                <span>Support & Assistance</span>
              </div>
              <p className="text-slate-300">
                For questions, bug reports, audio tone recommendations, or Android installation help, contact our engineering inbox:
              </p>
              <div className="font-mono text-cyan-200 bg-black/40 p-2 rounded border border-cyan-800/40 select-all">
                mpldwdind@gmail.com
              </div>
            </div>

            {/* Purpose & Design */}
            <div className="text-xs text-slate-400 leading-relaxed">
              Hourly Beep is engineered to restore mindful awareness of the passage of time. Built with battery efficiency, low-light visual themes, and native Android compliance.
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3.5 text-xs text-slate-300 leading-relaxed pr-1">
            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 text-[11px]">
              <strong>Summary:</strong> Hourly Beep does not collect, store, sell, or transmit any personal data. Everything runs 100% locally on your browser or device.
            </div>

            <div>
              <h3 className="font-bold text-white mb-1">1. Local Execution & Data Storage</h3>
              <p className="text-slate-400">
                All settings, custom intervals, active schedules, and diagnostic logs are stored exclusively in your device's browser local storage. No data is ever transmitted to remote databases or analytics vendors.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-white mb-1">2. Biometric Security & Credentials</h3>
              <p className="text-slate-400">
                Biometric authentication uses the standard W3C Web Authentication (WebAuthn) API. Your fingerprint or face scan is processed strictly by your device's secure enclave / platform hardware. Hourly Beep never has access to raw biometric data.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-white mb-1">3. Permissions (Notifications & Audio)</h3>
              <p className="text-slate-400">
                Notification permissions are used solely to trigger interval alert banners while the app is backgrounded. Web Audio API synthesized tones are generated entirely on-device without streaming external audio media.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-white mb-1">4. Contact & Inquiries</h3>
              <p className="text-slate-400">
                If you have questions regarding this privacy policy or wish to exercise data rights, reach out to: <strong>mpldwdind@gmail.com</strong>.
              </p>
            </div>

            <button
              onClick={() => setView('info')}
              className="py-1.5 px-3 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-cyan-300 transition"
            >
              &larr; Back to App Information
            </button>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-white/10 flex gap-2 shrink-0">
          <button
            onClick={() => {
              onClose();
              onOpenFeedback();
            }}
            className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 transition"
          >
            Contact Support
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
