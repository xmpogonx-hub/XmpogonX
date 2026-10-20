import React, { useState } from 'react';
import {
  X,
  Mail,
  Send,
  MessageSquare,
  Bug,
  Lightbulb,
  Check,
  Copy,
  Paperclip,
  ShieldCheck,
} from 'lucide-react';
import { logger } from '../utils/logger.ts';
import { batteryService } from '../utils/batteryManager.ts';

interface UserFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserFeedbackModal: React.FC<UserFeedbackModalProps> = ({ isOpen, onClose }) => {
  const [feedbackType, setFeedbackType] = useState<'bug' | 'feature' | 'tone' | 'other'>('bug');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [includeLogs, setIncludeLogs] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  if (!isOpen) return null;

  const SUPPORT_EMAIL = 'mpldwdind@gmail.com';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(SUPPORT_EMAIL);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const battery = batteryService.getState();
    const diagnosticsSummary = includeLogs
      ? `\n\n--- System Diagnostics ---\nUser Agent: ${navigator.userAgent}\nScreen: ${window.innerWidth}x${window.innerHeight}\nBattery: ${battery.level !== null ? battery.level + '%' : 'N/A'}\nRecent Logs Count: ${logger.getLogs().length}\nLast Log: ${logger.getLogs()[0]?.message || 'None'}`
      : '';

    const emailSubject = encodeURIComponent(`[Hourly Beep] [${feedbackType.toUpperCase()}] ${subject || 'User Feedback'}`);
    const emailBody = encodeURIComponent(
      `Feedback Type: ${feedbackType}\nFrom: ${userEmail || 'Anonymous'}\n\nDescription:\n${message}${diagnosticsSummary}`
    );

    logger.log('INFO', 'Feedback', `User feedback submitted (${feedbackType}): "${subject}" to ${SUPPORT_EMAIL}`);

    // Trigger standard mail client
    const mailtoUrl = `mailto:${SUPPORT_EMAIL}?subject=${emailSubject}&body=${emailBody}`;
    window.location.href = mailtoUrl;

    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-white/10 shadow-2xl p-6 text-white max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Send Feedback & Bug Reports</h2>
              <p className="text-xs text-slate-400">
                Direct support assistance to{' '}
                <span className="font-mono text-cyan-300">{SUPPORT_EMAIL}</span>
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

        {submitted ? (
          <div className="py-8 text-center flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <Check className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold mb-2">Thank You for Your Feedback!</h3>
            <p className="text-xs text-slate-300 max-w-sm mb-6">
              Your report has been prepared for <strong className="text-white">{SUPPORT_EMAIL}</strong>. If your email app didn't open automatically, you can write directly to our address.
            </p>

            <button
              onClick={handleCopyEmail}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-slate-200 flex items-center gap-2 mb-4"
            >
              {copiedEmail ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedEmail ? 'Copied' : `Copy ${SUPPORT_EMAIL}`}</span>
            </button>

            <button
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm transition"
            >
              Return to App
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1">
            {/* Feedback Type Selection */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
                Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'bug', label: 'Bug Report', icon: Bug },
                  { id: 'feature', label: 'New Feature', icon: Lightbulb },
                  { id: 'tone', label: 'Sound Proposal', icon: Mail },
                  { id: 'other', label: 'General Help', icon: MessageSquare },
                ].map((type) => {
                  const Icon = type.icon;
                  const isSelected = feedbackType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFeedbackType(type.id as typeof feedbackType)}
                      className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Email Contact (Optional) */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 block">
                Your Email (for response)
              </label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Subject */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 block">
                Subject
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of issue or request"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 block">
                Description
              </label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Please describe what happened, expected behavior, or interval suggestions..."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400 resize-none"
              />
            </div>

            {/* Include diagnostics checkbox */}
            <div className="flex items-center gap-2 p-3 rounded-xl bg-black/40 border border-white/10">
              <input
                type="checkbox"
                id="includeLogs"
                checked={includeLogs}
                onChange={(e) => setIncludeLogs(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500 accent-cyan-500 cursor-pointer"
              />
              <label htmlFor="includeLogs" className="text-xs text-slate-300 cursor-pointer">
                Attach anonymous device specs & recent diagnostic error logs
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-950"
            >
              <Send className="w-4 h-4" />
              <span>Send to mpldwdind@gmail.com</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
