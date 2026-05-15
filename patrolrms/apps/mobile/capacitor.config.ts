import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.patrolrms.app',
  appName: 'PatrolRMS',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: false,
  },
  plugins: {
    SecureStoragePlugin: {
      keychainAccessibility: 'afterFirstUnlock',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    Camera: {
      permissions: ['camera', 'photos'],
    },
  },
  android: {
    buildOptions: {
      keystorePath: 'patrolrms-release.jks',
      keystoreAlias: 'patrolrms',
    },
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
};

export default config;
