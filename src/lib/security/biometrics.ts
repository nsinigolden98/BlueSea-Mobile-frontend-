import { Capacitor } from '@capacitor/core';
import { NativeBiometric } from '@capgo/capacitor-native-biometric';
import Cookies from 'js-cookie';

/**
 * Shared biometric (fingerprint) helpers — mobile app only.
 * Web always reports unsupported/disabled so payment flows keep the PIN.
 *
 * State lives in cookies (js-cookie), never localStorage: the device
 * token minted by /accounts/biometric/enable/ plus the three flags.
 */

/** Cookie holding the device token minted by /accounts/biometric/enable/. */
export const BIOMETRIC_TOKEN_KEY = 'biometric_payment_token';

/** Biometric flags persisted as cookies. */
export type BiometricFlagKey =
  | 'biometricEnabled'
  | 'biometricLoginEnabled'
  | 'biometricPaymentEnabled';

const COOKIE_OPTS = { expires: 365, sameSite: 'strict' as const };

export const isNativePlatform = (): boolean => Capacitor.isNativePlatform();

export const isBiometricSupported = async (): Promise<boolean> => {
  if (!isNativePlatform()) return false;
  try {
    const res = await NativeBiometric.isAvailable();
    return !!(res as any)?.isAvailable;
  } catch {
    return false;
  }
};

/**
 * Show the native fingerprint/Face ID prompt.
 * Resolves true only on a verified match; cancel/failure/no-plugin => false.
 */
export const promptBiometric = async (reason: string): Promise<boolean> => {
  if (!isNativePlatform()) return false;
  try {
    await NativeBiometric.verifyIdentity({
      reason,
      title: 'Biometric Authentication',
      subtitle: reason,
      description: 'Please authenticate to continue',
    });
    return true;
  } catch (e) {
    console.error('Biometric authentication failed:', e);
    return false;
  }
};

export const getBiometricToken = (): string => {
  try {
    return Cookies.get(BIOMETRIC_TOKEN_KEY) || '';
  } catch {
    return '';
  }
};

export const setBiometricToken = (token: string): void => {
  try {
    if (token) Cookies.set(BIOMETRIC_TOKEN_KEY, token, COOKIE_OPTS);
    else Cookies.remove(BIOMETRIC_TOKEN_KEY);
  } catch {
    /* storage unavailable — token simply won't persist */
  }
};

export const getBiometricFlag = (key: BiometricFlagKey): boolean => {
  try {
    return Cookies.get(key) === 'true';
  } catch {
    return false;
  }
};

export const setBiometricFlag = (key: BiometricFlagKey, value: boolean): void => {
  try {
    if (value) Cookies.set(key, 'true', COOKIE_OPTS);
    else Cookies.remove(key);
  } catch {
    /* storage unavailable */
  }
};

/**
 * Whether payments should try fingerprint confirmation: native platform,
 * enrolled (server flag mirrored locally), payment toggle on, and the
 * device token still present.
 */
export const biometricPaymentActive = (): boolean =>
  isNativePlatform() &&
  getBiometricFlag('biometricEnabled') &&
  getBiometricFlag('biometricPaymentEnabled') &&
  !!getBiometricToken();
