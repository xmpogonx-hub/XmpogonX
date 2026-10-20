import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Download,
  Copy,
  Check,
  FileCode,
  Layers,
  ArrowRight,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import {
  generateAndroidManifest,
  generateTwaManifest,
  generateBuildGradle,
  DEFAULT_APK_INFO,
} from '../utils/apkGenerator.ts';

interface ApkDistributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  isInstallable: boolean;
  onInstallPwa: () => void;
}

export const ApkDistributionModal: React.FC<ApkDistributionModalProps> = ({
  isOpen,
  onClose,
  isInstallable,
  onInstallPwa,
}) => {
  const [activeTab, setActiveTab] = useState<'pwa' | 'manifest' | 'gradle' | 'twa'>('pwa');
  const [copied, setCopied] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (content: string, type: string) => {
    navigator.clipboard.writeText(content);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownloadFile = (content: string, filename: string, type: string = 'text/plain') => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const androidManifestCode = generateAndroidManifest();
  const buildGradleCode = generateBuildGradle();
  const twaManifestCode = generateTwaManifest(
    typeof window !== 'undefined' ? window.location.origin : 'https://hourlybeep.app'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-2xl bg-slate-900 border border-white/10 shadow-2xl p-6 text-white max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Android .APK Installation & Distribution</h2>
              <p className="text-xs text-slate-400">
                Install as a standalone native app on Android with background chime permissions
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

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-4 shrink-0 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('pwa')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'pwa'
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            1-Click Native App Install
          </button>
          <button
            onClick={() => setActiveTab('manifest')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'manifest'
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            AndroidManifest.xml
          </button>
          <button
            onClick={() => setActiveTab('twa')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'twa'
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            TWA Bubblewrap CLI
          </button>
          <button
            onClick={() => setActiveTab('gradle')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'gradle'
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            build.gradle
          </button>
        </div>

        {/* Tab 1: PWA 1-Click Install */}
        {activeTab === 'pwa' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-900 border-2 border-emerald-400 flex items-center justify-center shrink-0">
                    <Smartphone className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">Direct Android App Installation</h3>
                    <p className="text-xs text-slate-300">
                      Installs with standalone window, circular app icon, and persistent background notification workers.
                    </p>
                  </div>
                </div>

                <button
                  onClick={onInstallPwa}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-emerald-950"
                >
                  <Download className="w-4 h-4" />
                  <span>Install App on Device</span>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-xs space-y-3">
              <div className="font-semibold text-slate-200">
                Installation Instructions for Android Phones & Tablets:
              </div>
              <div className="space-y-2 text-slate-300">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0 font-bold text-[11px] text-cyan-400">
                    1
                  </span>
                  <span>
                    <strong>In Google Chrome / Edge:</strong> Tap the <strong>Install App</strong> button above, or open the browser menu (⋮) and tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0 font-bold text-[11px] text-cyan-400">
                    2
                  </span>
                  <span>
                    Confirm the installation. The circular <strong>Hourly Beep</strong> icon will appear on your Android launcher and app drawer.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0 font-bold text-[11px] text-cyan-400">
                    3
                  </span>
                  <span>
                    Grant notification permission on first launch and exempt the app from battery optimization for seamless background chimes.
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Package ID: {DEFAULT_APK_INFO.packageName} (SDK 24-34)</span>
              </span>
              <span className="font-mono text-slate-300">v{DEFAULT_APK_INFO.versionName}</span>
            </div>
          </div>
        )}

        {/* Tab 2: AndroidManifest.xml */}
        {activeTab === 'manifest' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">AndroidManifest.xml</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(androidManifestCode, 'manifest')}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300 flex items-center gap-1.5 transition"
                >
                  {copied === 'manifest' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copied === 'manifest' ? 'Copied' : 'Copy XML'}</span>
                </button>
                <button
                  onClick={() =>
                    handleDownloadFile(androidManifestCode, 'AndroidManifest.xml', 'application/xml')
                  }
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            <pre className="p-3.5 rounded-xl bg-black/60 border border-white/10 font-mono text-[11px] text-emerald-300 overflow-x-auto leading-relaxed">
              {androidManifestCode}
            </pre>
          </div>
        )}

        {/* Tab 3: TWA Bubblewrap CLI */}
        {activeTab === 'twa' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-xs text-cyan-200">
              Compile a standalone Google Play ready <strong>.APK</strong> or <strong>.AAB</strong> using Google's official Bubblewrap CLI in one terminal command:
            </div>

            <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-slate-300 space-y-2">
              <div className="text-slate-400"># 1. Install Google Bubblewrap CLI</div>
              <div className="text-cyan-400">npm install -g @bubblewrap/cli</div>
              <div className="text-slate-400 mt-2"># 2. Build signed Android APK</div>
              <div className="text-emerald-400">npx @bubblewrap/cli build</div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">twa-manifest.json</span>
              <button
                onClick={() => handleCopy(twaManifestCode, 'twa')}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300 flex items-center gap-1.5 transition"
              >
                {copied === 'twa' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copied === 'twa' ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>

            <pre className="p-3 rounded-xl bg-black/60 border border-white/10 font-mono text-[11px] text-slate-300 overflow-x-auto">
              {twaManifestCode}
            </pre>
          </div>
        )}

        {/* Tab 4: build.gradle */}
        {activeTab === 'gradle' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">app/build.gradle</span>
              <button
                onClick={() => handleCopy(buildGradleCode, 'gradle')}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300 flex items-center gap-1.5 transition"
              >
                {copied === 'gradle' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copied === 'gradle' ? 'Copied' : 'Copy Gradle'}</span>
              </button>
            </div>

            <pre className="p-3.5 rounded-xl bg-black/60 border border-white/10 font-mono text-[11px] text-cyan-300 overflow-x-auto">
              {buildGradleCode}
            </pre>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs sm:text-sm transition shrink-0 mt-3"
        >
          Close APK Hub
        </button>
      </div>
    </div>
  );
};
