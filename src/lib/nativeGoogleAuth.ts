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
    isInitialized = false;
    console.error('Failed to initialize native Google Auth:', error);
    const detail = error instanceof Error ? error.message : 'Unknown initialization error';
    throw new Error(`Google Sign-In could not be initialized. ${detail}`);
  }
};

export const performNativeGoogleSignIn = async (): Promise<string> => {
  if (!isNativeAndroid()) {
    throw new Error('Native Google Sign-In is only available on Android native app.');
  }

  if (!isInitialized) {
    await initializeNativeGoogleAuth();
  }

  if (!isInitialized) {
    throw new Error('Google Sign-In is not ready. Please close and reopen the app, then try again.');
  }

  // Keep the existing provider options: the release login flow is now working.
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
