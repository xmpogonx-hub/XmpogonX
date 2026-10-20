export interface ApkPackageInfo {
  packageName: string;
  appName: string;
  versionName: string;
  versionCode: number;
  minSdkVersion: number;
  targetSdkVersion: number;
}

export const DEFAULT_APK_INFO: ApkPackageInfo = {
  packageName: 'com.hourlybeep.app',
  appName: 'Hourly Beep',
  versionName: '1.4.0',
  versionCode: 1040,
  minSdkVersion: 24, // Android 7.0+
  targetSdkVersion: 34, // Android 14
};

export function generateAndroidManifest(info: ApkPackageInfo = DEFAULT_APK_INFO): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${info.packageName}">

    <!-- Permissions for accurate background chime and battery optimization exemption -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
    <uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="${info.appName}"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@android:style/Theme.DeviceDefault.NoActionBar.Fullscreen">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale"
            android:theme="@android:style/Theme.DeviceDefault.NoActionBar">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Receiver for Boot Completed to reschedule chimes upon device reboot -->
        <receiver
            android:name=".BootReceiver"
            android:enabled="true"
            android:exported="false">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
                <action android:name="android.intent.action.MY_PACKAGE_REPLACED" />
            </intent-filter>
        </receiver>

    </application>
</manifest>`;
}

export function generateTwaManifest(appUrl: string, info: ApkPackageInfo = DEFAULT_APK_INFO): string {
  return JSON.stringify(
    {
      packageId: info.packageName,
      host: typeof window !== 'undefined' ? window.location.hostname : 'app.hourlybeep.com',
      name: info.appName,
      launcherName: 'HourlyBeep',
      themeColor: '#090d16',
      navigationColor: '#090d16',
      backgroundColor: '#090d16',
      enableNotifications: true,
      startUrl: '/',
      iconUrl: '/icon.svg',
      maskableIconUrl: '/icon.svg',
      appVersionName: info.versionName,
      appVersionCode: info.versionCode,
      signingKey: {
        path: './android.keystore',
        alias: 'hourlybeep',
      },
      generatorApp: 'hourly-beep-apk-hub',
    },
    null,
    2
  );
}

export function generateBuildGradle(info: ApkPackageInfo = DEFAULT_APK_INFO): string {
  return `plugins {
    id 'com.android.application'
}

android {
    namespace '${info.packageName}'
    compileSdk ${info.targetSdkVersion}

    defaultConfig {
        applicationId "${info.packageName}"
        minSdk ${info.minSdkVersion}
        targetSdk ${info.targetSdkVersion}
        versionCode ${info.versionCode}
        versionName "${info.versionName}"
    }

    buildTypes {
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}

dependencies {
    implementation 'androidx.browser:browser:1.8.0'
    implementation 'com.google.android.material:material:1.11.0'
}`;
}
