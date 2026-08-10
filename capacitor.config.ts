import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.blueseamobile.app',
  appName: 'BlueSea Mobile',
  webDir: 'dist',
  server: {
    url: 'https://blueseamobile.com.ng',
    cleartext: true,
    allowNavigation: [
      'blueseamobile.com.ng', 
      '*.blueseamobile.com.ng'
    ]
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    backgroundColor: '#0284c7',
  },
  plugins: {
    SocialLogin: {
      google: {
        webClientId: '557271059008-u6r4bna1r9jqe5r20rkhcjr4rof9s18u.apps.googleusercontent.com',
      },
    },
  },
};

export default config;