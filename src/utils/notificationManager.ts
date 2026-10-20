import { logger } from './logger.ts';

export type NotificationStatus = 'granted' | 'denied' | 'default' | 'unsupported';

class NotificationManager {
  private wakeLock: WakeLockSentinel | null = null;

  public getStatus(): NotificationStatus {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission as NotificationStatus;
  }

  public async requestPermission(): Promise<NotificationStatus> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      logger.log('WARN', 'Notification', 'Notification API not supported by browser.');
      return 'unsupported';
    }

    try {
      const result = await Notification.requestPermission();
      logger.log(
        result === 'granted' ? 'INFO' : 'WARN',
        'Notification',
        `Notification permission result: ${result}`
      );
      return result as NotificationStatus;
    } catch (err) {
      logger.log('ERROR', 'Notification', 'Error requesting notification permission', { error: String(err) });
      return this.getStatus();
    }
  }

  /**
   * Dispatches a notification for the chime.
   * Uses active Service Worker registration when available for background display.
   */
  public async sendChimeNotification(title: string, body: string, vibratePattern: number[] = [150, 100, 150]) {
    if (this.getStatus() !== 'granted') {
      logger.log('WARN', 'Notification', 'Cannot show notification: permission not granted.');
      return;
    }

    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration && 'showNotification' in registration) {
          await registration.showNotification(title, {
            body,
            icon: '/icon.svg',
            badge: '/icon.svg',
            tag: 'hourly-chime-alert',
            renotify: true,
            vibrate: vibratePattern,
            silent: false,
          } as NotificationOptions);
          logger.log('INFO', 'Notification', `Background ServiceWorker notification displayed: "${title}"`);
          return;
        }
      }

      // Standalone fallback
      new Notification(title, {
        body,
        icon: '/icon.svg',
        tag: 'hourly-chime-alert',
      });
      logger.log('INFO', 'Notification', `Desktop notification displayed: "${title}"`);
    } catch (err) {
      logger.log('WARN', 'Notification', 'Notification dispatch encountered error', { error: String(err) });
    }
  }

  /**
   * Request Screen WakeLock to prevent device from sleeping during crucial sessions.
   */
  public async requestWakeLock(): Promise<boolean> {
    if (typeof window === 'undefined' || !('wakeLock' in navigator)) {
      return false;
    }

    try {
      this.wakeLock = await navigator.wakeLock.request('screen');
      logger.log('INFO', 'Power', 'Screen WakeLock acquired to ensure alert delivery.');

      this.wakeLock.addEventListener('release', () => {
        this.wakeLock = null;
        logger.log('INFO', 'Power', 'Screen WakeLock released.');
      });
      return true;
    } catch (err) {
      logger.log('WARN', 'Power', 'Screen WakeLock request failed or disallowed', { error: String(err) });
      return false;
    }
  }

  public releaseWakeLock() {
    if (this.wakeLock) {
      this.wakeLock.release().catch(() => {});
      this.wakeLock = null;
    }
  }
}

export const notificationManager = new NotificationManager();
