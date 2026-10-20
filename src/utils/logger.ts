import { LogEntry, LogLevel } from '../types/index.ts';

const STORAGE_KEY = 'hourly_beep_logs_v1';
const MAX_LOGS = 250;

class DiagnosticLogger {
  private logs: LogEntry[] = [];
  private listeners: Array<(logs: LogEntry[]) => void> = [];

  constructor() {
    this.loadFromStorage();
    this.log('INFO', 'System', 'Application initialized. Diagnostic logger active.');
  }

  private loadFromStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          this.logs = JSON.parse(stored);
        }
      }
    } catch {
      this.logs = [];
    }
  }

  private saveToStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.logs.slice(-MAX_LOGS)));
      }
    } catch {
      // Storage full or private mode, maintain in-memory
    }
  }

  public log(level: LogLevel, category: string, message: string, details?: Record<string, unknown> | string) {
    const entry: LogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      epoch: Date.now(),
      level,
      category,
      message,
      details,
    };

    this.logs.unshift(entry);
    if (this.logs.length > MAX_LOGS) {
      this.logs = this.logs.slice(0, MAX_LOGS);
    }

    this.saveToStorage();
    this.notify();

    if (level === 'ERROR') {
      console.error(`[${category}] ${message}`, details || '');
    } else if (level === 'WARN') {
      console.warn(`[${category}] ${message}`, details || '');
    }
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  public clear() {
    this.logs = [];
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(STORAGE_KEY);
    }
    this.log('INFO', 'System', 'Diagnostic logs cleared by user.');
    this.notify();
  }

  public exportJson(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  public subscribe(listener: (logs: LogEntry[]) => void): () => void {
    this.listeners.push(listener);
    listener([...this.logs]);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    for (const listener of this.listeners) {
      listener([...this.logs]);
    }
  }
}

export const logger = new DiagnosticLogger();
