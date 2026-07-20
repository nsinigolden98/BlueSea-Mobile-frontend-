import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.blueseamobile.app',
  appName: 'BlueSea Mobile',
  webDir: 'dist',
  server: {
    url: 'https://blueseamobile.com.ng',
    cleartext: true,
  }
};

export default config;
