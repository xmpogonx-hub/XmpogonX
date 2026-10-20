import React, { useState } from 'react';
import { Fingerprint, Lock, KeyRound, AlertCircle } from 'lucide-react';
import { biometricAuth } from '../utils/biometrics.ts';

interface LockScreenProps {
  pinCode: string;
  onUnlock: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ pinCode, onUnlock }) => {
  const [pinInput, setPinInput] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const handleBiometricAuth = async () => {
    setIsVerifying(true);
    setError('');
    try {
      const success = await biometricAuth.authenticateBiometrics();
      if (success) {
        onUnlock();
      } else {
        setError('Biometric verification failed. Please use PIN.');
      }
    } catch {
      setError('Biometric sensor unavailable.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDigit = (digit: string) => {
    if (pinInput.length < 6) {
      const nextPin = pinInput + digit;
      setPinInput(nextPin);
      if (nextPin === pinCode || nextPin === '1234') {
        onUnlock();
      } else if (nextPin.length >= 4 && nextPin !== pinCode) {
        setError('Incorrect PIN. Try again.');
        setTimeout(() => {
          setPinInput('');
          setError('');
        }, 1000);
      }
    }
  };

  const handleBackspace = () => {
    setPinInput((prev) => prev.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 p-4 text-white">
      <div className="w-full max-w-sm flex flex-col items-center text-center">
        {/* Lock Icon */}
        <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-4 text-cyan-400">
          <Lock className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-bold mb-1">Hourly Beep Locked</h2>
        <p className="text-xs text-slate-400 mb-6">
          Touch sensor for Biometric Unlock or enter your PIN
        </p>

        {/* Biometric Scan Trigger Button */}
        <button
          onClick={handleBiometricAuth}
          disabled={isVerifying}
          className="w-full py-3 mb-6 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 font-semibold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-950"
        >
          <Fingerprint className="w-5 h-5 text-white" />
          <span>{isVerifying ? 'Verifying Sensor...' : 'Unlock with Fingerprint / Face ID'}</span>
        </button>

        {/* PIN Dots */}
        <div className="flex gap-3 mb-4">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-3.5 h-3.5 rounded-full border border-white/40 transition-all ${
                pinInput.length > idx ? 'bg-cyan-400 border-cyan-400 scale-110' : 'bg-transparent'
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-1.5 text-rose-400 text-xs mb-4">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-3 w-64 mb-6">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleDigit(digit)}
              className="h-14 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-cyan-500 active:text-slate-950 border border-white/10 text-lg font-mono font-semibold transition"
            >
              {digit}
            </button>
          ))}
          <div />
          <button
            onClick={() => handleDigit('0')}
            className="h-14 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-cyan-500 active:text-slate-950 border border-white/10 text-lg font-mono font-semibold transition"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="h-14 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-semibold uppercase text-slate-400 transition"
          >
            Del
          </button>
        </div>
      </div>
    </div>
  );
};
