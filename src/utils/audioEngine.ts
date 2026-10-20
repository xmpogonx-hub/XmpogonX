import { SoundOption } from '../types/index.ts';
import { logger } from './logger.ts';

export const SOUND_OPTIONS: SoundOption[] = [
  {
    id: 'classic_watch',
    name: 'Classic Watch Chime',
    description: 'Crisp dual-tone digital watch double beep (2048Hz / 4096Hz)',
    category: 'watch',
    durationMs: 300,
  },
  {
    id: 'zen_bell',
    name: 'Gentle Zen Bell',
    description: 'Resonant bronze bell chime with harmonic decay',
    category: 'bell',
    durationMs: 1800,
  },
  {
    id: 'singing_bowl',
    name: 'Tibetan Singing Bowl',
    description: 'Warm, meditative harmonic wash with acoustic vibrato',
    category: 'ambient',
    durationMs: 2500,
  },
  {
    id: 'modern_pulse',
    name: 'Modern High-Tech Pulse',
    description: 'Clean dual-ping digital notification',
    category: 'electronic',
    durationMs: 400,
  },
  {
    id: 'woodblock',
    name: 'Acoustic Woodblock',
    description: 'Natural organic percussive click',
    category: 'ambient',
    durationMs: 250,
  },
  {
    id: 'sonar_ping',
    name: 'Submarine Sonar',
    description: 'Clear maritime ping with soft resonance',
    category: 'electronic',
    durationMs: 1200,
  },
  {
    id: 'marimba',
    name: 'Warm Marimba Triad',
    description: 'Ascending 3-note melodic arpeggio (C5 - E5 - G5)',
    category: 'bell',
    durationMs: 700,
  },
  {
    id: 'chirp',
    name: 'Discreet Soft Chirp',
    description: 'Minimalist low-profile blip for office environments',
    category: 'electronic',
    durationMs: 200,
  },
];

class AudioEngine {
  private ctx: AudioContext | null = null;
  private silentSource: AudioBufferSourceNode | null = null;
  private isAudioUnlocked = false;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch((err) => {
        logger.log('WARN', 'Audio', 'AudioContext resume requested but suspended until user interaction', { error: String(err) });
      });
    }

    return this.ctx;
  }

  public unlockAudio(): boolean {
    const ctx = this.getAudioContext();
    if (!ctx) return false;

    if (ctx.state === 'suspended') {
      ctx.resume().then(() => {
        this.isAudioUnlocked = true;
        logger.log('INFO', 'Audio', 'Web Audio Context unlocked and ready.');
      }).catch((err) => {
        logger.log('WARN', 'Audio', 'Failed to unlock AudioContext', { error: String(err) });
      });
    } else {
      this.isAudioUnlocked = true;
    }
    return true;
  }

  public isUnlocked(): boolean {
    return this.isAudioUnlocked && this.ctx?.state === 'running';
  }

  /**
   * Triggers haptic vibration if supported by device.
   */
  public vibrate(pattern: number[] = [120, 60, 120]) {
    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch (e) {
      logger.log('WARN', 'Vibrate', 'Vibration API call failed', { error: String(e) });
    }
  }

  /**
   * Plays the chosen alert tone.
   * If vibrateOnly is true, bypasses audio and vibrates.
   */
  public playAlert(
    soundId: string = 'classic_watch',
    volume: number = 80,
    vibrateOnly: boolean = false,
    customVibratePattern?: number[]
  ) {
    // Trigger vibration in both vibrate-only and sound+vibrate modes
    const vibPattern = customVibratePattern || (vibrateOnly ? [200, 100, 200, 100, 300] : [120, 60, 120]);
    this.vibrate(vibPattern);

    if (vibrateOnly) {
      logger.log('CHIME', 'Alert', 'Alert triggered in Vibrate-Only mode.');
      return;
    }

    const ctx = this.getAudioContext();
    if (!ctx) {
      logger.log('WARN', 'Audio', 'Web Audio API not supported in this environment.');
      return;
    }

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const masterGain = ctx.createGain();
    const normalizedVol = Math.max(0.01, Math.min(1, volume / 100));
    masterGain.gain.setValueAtTime(normalizedVol, ctx.currentTime);
    masterGain.connect(ctx.destination);

    try {
      switch (soundId) {
        case 'classic_watch':
          this.playClassicWatch(ctx, masterGain);
          break;
        case 'zen_bell':
          this.playZenBell(ctx, masterGain);
          break;
        case 'singing_bowl':
          this.playSingingBowl(ctx, masterGain);
          break;
        case 'modern_pulse':
          this.playModernPulse(ctx, masterGain);
          break;
        case 'woodblock':
          this.playWoodblock(ctx, masterGain);
          break;
        case 'sonar_ping':
          this.playSonarPing(ctx, masterGain);
          break;
        case 'marimba':
          this.playMarimba(ctx, masterGain);
          break;
        case 'chirp':
        default:
          this.playChirp(ctx, masterGain);
          break;
      }
      logger.log('CHIME', 'Audio', `Alert chime played: "${soundId}" at ${volume}% volume.`);
    } catch (err) {
      logger.log('ERROR', 'Audio', `Failed to synthesize chime "${soundId}"`, { error: String(err) });
    }
  }

  // --- Sound Synthesizers (Web Audio API) ---

  /** Classic digital watch chime (Authentic dual-frequency 2048Hz / 4096Hz square-triangle) */
  private playClassicWatch(ctx: AudioContext, destination: GainNode) {
    const t = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    const gain2 = ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(2048, t);
    gain1.gain.setValueAtTime(0.8, t);
    gain1.gain.setValueAtTime(0, t + 0.08);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(4096, t + 0.1);
    gain2.gain.setValueAtTime(0, t);
    gain2.gain.setValueAtTime(0.9, t + 0.1);
    gain2.gain.setValueAtTime(0, t + 0.18);

    osc1.connect(gain1);
    gain1.connect(destination);
    osc2.connect(gain2);
    gain2.connect(destination);

    osc1.start(t);
    osc1.stop(t + 0.09);
    osc2.start(t + 0.1);
    osc2.stop(t + 0.19);
  }

  /** Gentle resonant bronze bell */
  private playZenBell(ctx: AudioContext, destination: GainNode) {
    const t = ctx.currentTime;
    const frequencies = [587.33, 880, 1174.66, 1760]; // D5, A5, D6, A6 harmonics
    const weights = [0.6, 0.35, 0.18, 0.08];

    frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(weights[idx], t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);

      osc.connect(gain);
      gain.connect(destination);

      osc.start(t);
      osc.stop(t + 1.8);
    });
  }

  /** Tibetan Singing Bowl with slow gentle beating */
  private playSingingBowl(ctx: AudioContext, destination: GainNode) {
    const t = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(432, t); // 432 Hz healing bowl fundamental

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(436, t); // 4 Hz binaural beat

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.7, t + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 2.4);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(destination);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 2.5);
    osc2.stop(t + 2.5);
  }

  /** Modern crisp electronic pulse */
  private playModernPulse(ctx: AudioContext, destination: GainNode) {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.08);

    gain.gain.setValueAtTime(0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(t);
    osc.stop(t + 0.15);

    // Second bounce
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1600, t + 0.12);
    osc2.frequency.exponentialRampToValueAtTime(800, t + 0.22);

    gain2.gain.setValueAtTime(0, t);
    gain2.gain.setValueAtTime(0.85, t + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.26);

    osc2.connect(gain2);
    gain2.connect(destination);

    osc2.start(t + 0.12);
    osc2.stop(t + 0.28);
  }

  /** Organic acoustic woodblock percussion */
  private playWoodblock(ctx: AudioContext, destination: GainNode) {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(840, t);
    osc.frequency.exponentialRampToValueAtTime(420, t + 0.06);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(750, t);
    filter.Q.setValueAtTime(8, t);

    gain.gain.setValueAtTime(0.9, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(destination);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  /** Submarine sonar echo */
  private playSonarPing(ctx: AudioContext, destination: GainNode) {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1480, t);

    gain.gain.setValueAtTime(0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.1);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(t);
    osc.stop(t + 1.2);
  }

  /** Warm marimba 3-tone arpeggio */
  private playMarimba(ctx: AudioContext, destination: GainNode) {
    const t = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5

    notes.forEach((freq, i) => {
      const startTime = t + i * 0.14;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, t);
      gain.gain.setValueAtTime(0.75, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(destination);

      osc.start(startTime);
      osc.stop(startTime + 0.38);
    });
  }

  /** Discreet soft chirp */
  private playChirp(ctx: AudioContext, destination: GainNode) {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(2200, t);
    osc.frequency.linearRampToValueAtTime(2800, t + 0.08);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(t);
    osc.stop(t + 0.14);
  }

  /**
   * Background Keep-Alive Audio Buffer:
   * Keeps audio subsystem primed in mobile browsers when active.
   */
  public setKeepAlive(enabled: boolean) {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    if (enabled && !this.silentSource) {
      try {
        const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        source.connect(ctx.destination);
        source.start();
        this.silentSource = source;
        logger.log('INFO', 'Audio', 'Background audio keep-alive activated for uninterrupted alerts.');
      } catch (err) {
        logger.log('WARN', 'Audio', 'Keep-alive audio setup error', { error: String(err) });
      }
    } else if (!enabled && this.silentSource) {
      try {
        this.silentSource.stop();
        this.silentSource.disconnect();
        this.silentSource = null;
        logger.log('INFO', 'Audio', 'Background audio keep-alive stopped to save power.');
      } catch {
        this.silentSource = null;
      }
    }
  }
}

export const audioEngine = new AudioEngine();
