import { Capacitor } from '@capacitor/core';
import { Camera, type PermissionStatus } from '@capacitor/camera';
import type { CameraPermissionResult, CameraPermissionState } from './types';

export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}

function normalizePermissionState(status?: string): CameraPermissionState {
  switch (status) {
    case 'granted':
      return 'granted';
    case 'denied':
      return 'denied';
    case 'prompt':
      return 'prompt';
    case 'prompt-with-rationale':
      return 'prompt-with-rationale';
    default:
      return 'unavailable';
  }
}

export async function checkCameraPermission(): Promise<CameraPermissionResult> {
  if (!isNativePlatform()) {
    return {
      camera: 'unavailable',
      isNative: false,
    };
  }

  try {
    const status: PermissionStatus = await Camera.checkPermissions();
    return {
      camera: normalizePermissionState(status.camera),
      isNative: true,
    };
  } catch (error) {
    console.warn('Error checking camera permission:', error);
    return {
      camera: 'unavailable',
      isNative: true,
    };
  }
}

export async function requestCameraPermission(): Promise<CameraPermissionResult> {
  if (!isNativePlatform()) {
    return {
      camera: 'unavailable',
      isNative: false,
    };
  }

  try {
    const status: PermissionStatus = await Camera.requestPermissions({ permissions: ['camera'] });
    return {
      camera: normalizePermissionState(status.camera),
      isNative: true,
    };
  } catch (error) {
    console.warn('Error requesting camera permission:', error);
    return {
      camera: 'unavailable',
      isNative: true,
    };
  }
}

export async function checkAndRequestCameraPermission(): Promise<CameraPermissionResult> {
  if (!isNativePlatform()) {
    return {
      camera: 'unavailable',
      isNative: false,
    };
  }

  try {
    const currentStatus = await checkCameraPermission();

    if (currentStatus.camera === 'granted') {
      return currentStatus;
    }

    return await requestCameraPermission();
  } catch (error) {
    console.warn('Error executing checkAndRequestCameraPermission:', error);
    return {
      camera: 'unavailable',
      isNative: true,
    };
  }
} 