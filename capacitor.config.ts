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
        webClientId: '557271059008-valbqrb7fmmls90n65dqci9ecrg54u0u.apps.googleusercontent.com',
      },
    },
  },
};

export default config;