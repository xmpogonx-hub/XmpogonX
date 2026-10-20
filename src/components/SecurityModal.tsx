import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Fingerprint,
  KeyRound,
  Lock,
  Unlock,
  Check,
} from 'lucide-react';
import { biometricAuth } from '../utils/biometrics.ts';
import { logger } from '../utils/logger.ts';

interface SecurityModalProps {
  biometricLockEnabled: boolean;
  pinCode: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdateSecurity: (enabled: boolean, pin: string) => void;
}

export const SecurityModal: React.FC<SecurityModalProps> = ({
  biometricLockEnabled,
  pinCode,
  isOpen,
  onClose,
  onUpdateSecurity,
}) => {
  const [isBioAvailable, setIsBioAvailable] = useState<boolean>(false);
  const [enabled, setEnabled] = useState<boolean>(biometricLockEnabled);
  const [pin, setPin] = useState<string>(pinCode || '1234');
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string>('');

  useEffect(() => {
    biometricAuth.isBiometricAvailable().then((avail) => {
      setIsBioAvailable(avail);
    });
  }, []);

  if (!isOpen) return null;

  const handleRegisterBiometrics = async () => {
    setIsRegistering(true);
    setStatusMsg('');
    try {
      const ok = await biometricAuth.registerBiometrics('Hourly Beep User');
      if (ok) {
        setStatusMsg('Biometrics registered successfully!');
        setEnabled(true);
      }
    } catch (err) {
      setStatusMsg('Biometric registration prompt was cancelled or not supported.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleSave = () => {
    if (pin.length < 4) {
      setStatusMsg('PIN must be at least 4 digits.');
      return;
    }
    onUpdateSecurity(enabled, pin);
    logger.log('INFO', 'Security', `Security settings updated: Lock ${enabled ? 'Enabled' : 'Disabled'}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-white/10 shadow-2xl p-6 text-white animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Biometric Security & Lock</h2>
              <p className="text-xs text-slate-400">
                Protect your personal schedules and error logs
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

        {/* Master Security Toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 mb-5">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-cyan-400" />
            <div>
              <div className="font-medium text-sm text-white">App Lock Protection</div>
              <div className="text-xs text-slate-400">
                Require Fingerprint, Face ID or PIN to open
              </div>
            </div>
          </div>
          <button
            onClick={() => setEnabled(!enabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              enabled ? 'bg-cyan-500' : 'bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Biometrics Status */}
        <div className="p-4 rounded-xl bg-black/40 border border-white/10 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Fingerprint className="w-5 h-5 text-cyan-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Hardware Biometrics (WebAuthn)
              </span>
            </div>
            <span
              className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded ${
                isBioAvailable
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-amber-500/20 text-amber-300'
              }`}
            >
              {isBioAvailable ? 'Hardware Supported' : 'PIN Emulation Mode'}
            </span>
          </div>

          <p className="text-xs text-slate-400 mb-3">
            Supports Android BiometricPrompt (Fingerprint / Face Unlock), Apple Touch ID / Face ID, and Windows Hello.
          </p>

          <button
            type="button"
            onClick={handleRegisterBiometrics}
            disabled={isRegistering}
            className="w-full py-2 px-3 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-semibold text-white transition flex items-center justify-center gap-2"
          >
            <Fingerprint className="w-4 h-4 text-cyan-400" />
            <span>{isRegistering ? 'Scanning sensor...' : 'Register / Test Biometrics'}</span>
          </button>
        </div>

        {/* Fallback PIN Configuration */}
        <div className="p-4 rounded-xl bg-black/40 border border-white/10 mb-5">
          <div className="flex items-center gap-2 mb-2">
            <KeyRound className="w-4 h-4 text-cyan-400" />
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Backup Passcode (4-6 digits)
            </label>
          </div>
          <input
            type="password"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            placeholder="Enter 4-digit PIN"
            className="w-full bg-white/5 border border-white/20 rounded-xl px-3 py-2 text-center text-lg tracking-widest font-mono text-white focus:outline-none focus:border-cyan-400"
          />
          <div className="text-[11px] text-slate-400 text-center mt-1.5">
            Default fallback PIN is 1234
          </div>
        </div>

        {statusMsg && (
          <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-800/50 text-xs text-cyan-300 mb-4 text-center">
            {statusMsg}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-medium text-xs sm:text-sm transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs sm:text-sm transition"
          >
            Save Security
          </button>
        </div>
      </div>
    </div>
  );
};
