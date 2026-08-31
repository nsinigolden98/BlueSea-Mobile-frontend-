import { Capacitor } from '@capacitor/core';

export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

export const getPlatform = (): string => {
  return Capacitor.getPlatform();
};

export const validateGmail = (email: string): boolean => {
  const gmailRegex = /^[A-Za-z0-9._%+-]+@gmail\.com$/;
  return gmailRegex.test(email.trim());
};

export const validateUsername = (username: string): boolean => {
  // Must start with @, total length 4-30 chars, lowercase letters, numbers, hyphens, underscores
  const usernameRegex = /^@[a-z0-9_-]{3,29}$/;
  return usernameRegex.test(username.trim());
};

export const normalizePhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('234')) {
    return cleaned.slice(3);
  }
  if (cleaned.startsWith('0')) {
    return cleaned.slice(1);
  }
  return cleaned;
};