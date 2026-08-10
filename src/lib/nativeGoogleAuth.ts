import { Capacitor } from '@capacitor/core';
import { SocialLogin } from '@capgo/capacitor-social-login';

const GOOGLE_WEB_CLIENT_ID = '557271059008-u6r4bna1r9jqe5r20rkhcjr4rof9s18u.apps.googleusercontent.com';

let isInitialized = false;

export const isNativeAndroid = (): boolean => {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
};

export const initializeNativeGoogleAuth = async (): Promise<void> => {
  if (!isNativeAndroid() || isInitialized) return;
  try {
    await SocialLogin.initialize({
      google: {
        webClientId: GOOGLE_WEB_CLIENT_ID,
      },
    });
    isInitialized = true;
  } catch (error) {
    console.error('Failed to initialize native Google Auth:', error);
  }
};

export const performNativeGoogleSignIn = async (): Promise<string> => {
  if (!isNativeAndroid()) {
    throw new Error('Native Google Sign-In is only available on Android native app.');
  }

  if (!isInitialized) {
    await initializeNativeGoogleAuth();
  }

  // Omit explicit scopes to avoid native MainActivity error
  const result = await SocialLogin.login({
    provider: 'google',
    options: {},
  });

  const res = result?.result as any;
  const idToken = res?.idToken || (result as any)?.idToken;

  if (idToken) {
    return idToken;
  }

  throw new Error('Google Sign-In failed: No ID token returned.');
};
