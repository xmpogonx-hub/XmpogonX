import { BatteryState } from '../types/index.ts';
import { logger } from './logger.ts';

interface BatteryManagerExtended extends EventTarget {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
  onchargingchange: ((this: BatteryManagerExtended, ev: Event) => void) | null;
  onlevelchange: ((this: BatteryManagerExtended, ev: Event) => void) | null;
}

export interface AndroidOptimizationIntent {
  action: string;
  uriScheme: string;
  description: string;
  label: string;
  adbCommand: string;
}

export const ANDROID_OPTIMIZATION_INTENTS: AndroidOptimizationIntent[] = [
  {
    label: 'Request Ignore Battery Optimizations',
    action: 'android.settings.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS',
    uriScheme: 'package:com.hourlybeep.app',
    description: 'Prompts system dialog to exempt Hourly Beep from Android Doze mode and background execution throttles.',
    adbCommand: 'adb shell dumpsys deviceidle whitelist +com.hourlybeep.app',
  },
  {
    label: 'Application Details Settings',
    action: 'android.settings.APPLICATION_DETAILS_SETTINGS',
    uriScheme: 'package:com.hourlybeep.app',
    description: 'Opens App Info screen where user toggles "Battery Usage" to "Unrestricted".',
    adbCommand: 'adb shell am start -a android.settings.APPLICATION_DETAILS_SETTINGS -d package:com.hourlybeep.app',
  },
  {
    label: 'Power Usage Summary',
    action: 'android.settings.POWER_USAGE_SUMMARY_SETTINGS',
    uriScheme: '',
    description: 'System battery usage menu for managing background activity and standby quotas.',
    adbCommand: 'adb shell am start -a android.intent.action.POWER_USAGE_SUMMARY',
  },
];

export interface ManufacturerGuide {
  brand: string;
  uiName: string;
  steps: string[];
}

export const MANUFACTURER_GUIDES: ManufacturerGuide[] = [
  {
    brand: 'Samsung',
    uiName: 'One UI',
    steps: [
      'Open Settings > Apps > Hourly Beep > Battery.',
      'Select "Unrestricted" (instead of Optimized or Restricted).',
      'Go to Device Care > Battery > Background usage limits.',
      'Add Hourly Beep to "Never sleeping apps".',
    ],
  },
  {
    brand: 'Google Pixel',
    uiName: 'Stock Android',
    steps: [
      'Open Settings > Apps > All Apps > Hourly Beep.',
      'Tap "App battery usage".',
      'Change setting from "Optimized" to "Unrestricted".',
      'Ensure "Allow background usage" toggle is turned ON.',
    ],
  },
  {
    brand: 'Xiaomi / Redmi / POCO',
    uiName: 'MIUI / HyperOS',
    steps: [
      'Go to Settings > Apps > Manage Apps > Hourly Beep.',
      'Enable "Autostart".',
      'Scroll down to "Battery Saver" and select "No restrictions".',
      'Lock Hourly Beep in Recent Apps overview.',
    ],
  },
  {
    brand: 'OnePlus / Oppo',
    uiName: 'OxygenOS / ColorOS',
    steps: [
      'Settings > Battery > More settings > Optimize battery use.',
      'Locate Hourly Beep and choose "Don\'t optimize".',
      'Under App management > Hourly Beep > Allow auto-launch and background activity.',
    ],
  },
];

class BatteryService {
  private batteryObj: BatteryManagerExtended | null = null;
  private state: BatteryState = {
    level: null,
    charging: null,
    supported: false,
    batterySaverActive: false,
  };
  private listeners: Array<(state: BatteryState) => void> = [];

  constructor() {
    this.init();
  }

  private async init() {
    if (typeof window !== 'undefined' && 'getBattery' in navigator) {
      try {
        const getBattery = (navigator as unknown as { getBattery: () => Promise<BatteryManagerExtended> }).getBattery;
        this.batteryObj = await getBattery();
        this.state = {
          level: Math.round(this.batteryObj.level * 100),
          charging: this.batteryObj.charging,
          supported: true,
          batterySaverActive: this.batteryObj.level <= 0.20 && !this.batteryObj.charging,
        };

        this.batteryObj.addEventListener('levelchange', () => this.updateBattery());
        this.batteryObj.addEventListener('chargingchange', () => this.updateBattery());
        logger.log('INFO', 'Battery', `Battery status detected: ${this.state.level}% (Charging: ${this.state.charging})`);
        this.notify();
      } catch (err) {
        logger.log('INFO', 'Battery', 'Battery Status API not supported or restricted in this browser.');
      }
    } else {
      this.state.supported = false;
    }
  }

  private updateBattery() {
    if (!this.batteryObj) return;
    this.state = {
      level: Math.round(this.batteryObj.level * 100),
      charging: this.batteryObj.charging,
      supported: true,
      batterySaverActive: this.batteryObj.level <= 0.20 && !this.batteryObj.charging,
    };
    logger.log('INFO', 'Battery', `Battery update: ${this.state.level}%`);
    this.notify();
  }

  public getState(): BatteryState {
    return { ...this.state };
  }

  public subscribe(listener: (state: BatteryState) => void): () => void {
    this.listeners.push(listener);
    listener(this.state);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    for (const l of this.listeners) {
      l({ ...this.state });
    }
  }
}

export const batteryService = new BatteryService();
