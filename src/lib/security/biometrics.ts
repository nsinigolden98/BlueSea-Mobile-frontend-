import { Capacitor } from '@capacitor/core';
import { AccessControl, NativeBiometric } from '@capgo/capacitor-native-biometric';
import Cookies from 'js-cookie';

/** Native-only biometric helpers. Secrets are stored in the OS Keychain/Keystore. */
export const BIOMETRIC_TOKEN_KEY = 'biometric_payment_token';
const PAYMENT_VAULT_SERVER = 'bluesea-mobile-payment';
const LOGIN_VAULT_SERVER = 'bluesea-mobile-login';

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
    return !!res?.isAvailable;
  } catch {
    return false;
  }
};

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
  } catch (error) {
    console.info('Biometric authentication was not completed.');
    return false;
  }
};

/**
 * Check presence without retrieving the secret. This is used by Settings to
 * mirror backend enrollment without triggering a fingerprint prompt.
 */
export const hasBiometricToken = async (): Promise<boolean> => {
  if (!isNativePlatform()) return false;
  try {
    const result = await NativeBiometric.isCredentialsSaved({ server: PAYMENT_VAULT_SERVER });
    return result?.isSaved === true;
  } catch {
    return false;
  }
};

/**
 * Retrieve the payment token only through the plugin's biometric-protected
 * credential API. Older app versions saved this credential without
 * accessControl; those entries are migrated after an explicit biometric
 * verification, then re-saved with BIOMETRY_CURRENT_SET protection.
 */
export const getBiometricToken = async (): Promise<string> => {
  if (!isNativePlatform()) return '';
  try {
    const credentials = await NativeBiometric.getSecureCredentials({
      server: PAYMENT_VAULT_SERVER,
      reason: 'Authenticate to confirm this payment',
      title: 'Fingerprint Payment',
      subtitle: 'Verify your identity to continue',
      description: 'Your fingerprint is required to access your payment authorization token.',
    });
    return typeof credentials?.password === 'string' ? credentials.password.trim() : '';
  } catch (secureError) {
    const errorCode = Number((secureError as { code?: unknown })?.code);
    const errorMessage = String((secureError as { message?: unknown })?.message || '');
    const isLegacyCredential = errorCode === 21 || /no protected credentials found/i.test(errorMessage);
    if (!isLegacyCredential) {
      console.info('Biometric payment credential was not unlocked.');
      return '';
    }

    // Upgrade credentials created by the earlier unprotected implementation.
    try {
      await NativeBiometric.verifyIdentity({
        reason: 'Secure your existing payment fingerprint setup',
        title: 'Protect Payment Fingerprint',
        subtitle: 'Verify your identity to secure this device',
        description: 'Your existing payment authorization will be protected by your enrolled biometrics.',
      });
      const legacyCredentials = await NativeBiometric.getCredentials({ server: PAYMENT_VAULT_SERVER });
      const legacyToken = typeof legacyCredentials?.password === 'string' ? legacyCredentials.password.trim() : '';
      if (!legacyToken) return '';

      await NativeBiometric.setCredentials({
        username: 'payment-confirmation',
        password: legacyToken,
        server: PAYMENT_VAULT_SERVER,
        accessControl: AccessControl.BIOMETRY_CURRENT_SET,
      });
      return legacyToken;
    } catch (migrationError) {
      console.warn('Legacy payment biometric credential could not be upgraded.');
      return '';
    }
  }
};

export const setBiometricToken = async (token: string): Promise<void> => {
  if (!isNativePlatform()) throw new Error('Fingerprint payments are available only in the mobile app.');
  try {
    if (typeof token === 'string' && token.trim()) {
      await NativeBiometric.setCredentials({
        username: 'payment-confirmation',
        password: token.trim(),
        server: PAYMENT_VAULT_SERVER,
        accessControl: AccessControl.BIOMETRY_CURRENT_SET,
      });
    } else {
      await NativeBiometric.deleteCredentials({ server: PAYMENT_VAULT_SERVER });
    }
  } catch (error) {
    console.error('Could not update secure payment biometric storage:', error);
    throw error;
  }
};

/** Securely persist the rotating refresh token for optional native biometric login. */
export const setBiometricLoginCredential = async (email: string, refreshToken: string): Promise<void> => {
  if (!isNativePlatform()) throw new Error('Biometric login is available only in the mobile app.');
  if (!email || !refreshToken) throw new Error('A valid session is required to enable biometric login.');
  await NativeBiometric.setCredentials({
    username: email,
    password: refreshToken,
    server: LOGIN_VAULT_SERVER,
  });
};

export const getBiometricLoginCredential = async (): Promise<{ email: string; refreshToken: string } | null> => {
  if (!isNativePlatform()) return null;
  try {
    const authenticated = await promptBiometric('Unlock your BlueSea account');
    if (!authenticated) return null;
    const credentials = await NativeBiometric.getCredentials({ server: LOGIN_VAULT_SERVER });
    if (!credentials.username || !credentials.password) return null;
    return { email: credentials.username, refreshToken: credentials.password };
  } catch {
    return null;
  }
};

export const clearBiometricLoginCredential = async (): Promise<void> => {
  if (!isNativePlatform()) return;
  try {
    await NativeBiometric.deleteCredentials({ server: LOGIN_VAULT_SERVER });
  } catch {
    // Safe to continue logout even if secure storage was already empty.
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
    // Storage unavailable.
  }
};

export const biometricPaymentActive = (): boolean =>
  isNativePlatform() &&
  getBiometricFlag('biometricEnabled') &&
  getBiometricFlag('biometricPaymentEnabled');
