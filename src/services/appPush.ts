// App push bridge (Option B — no Firebase / no FCM).
// Turns the existing live pipe (`bluesea:notification` DOM events from the
// notification WebSocket) into real OS tray notifications while the app is
// open or backgrounded, using @capacitor/local-notifications.
//
// Limits: force-killed app / rebooted phone = no WebSocket = no alert.
// Upgrading to FCM later reuses this file: FCM handlers call the same
// `showSystemTray()` + tap routing below.

import { Capacitor } from '@capacitor/core';
import {
  LocalNotifications,
  type ActionPerformed,
} from '@capacitor/local-notifications';
import type { ServerNotification } from './notificationSocket';

export const PUSH_ENABLED_KEY = 'bluesea:push-enabled';
export const PUSH_TAP_EVENT = 'bluesea:push-tap';
const CHANNEL_ID = 'bluesea-alerts';

export interface PushTapDetail {
  notificationId?: number;
  route: string;
  type?: string;
}

const seenIds = new Set<number>();
let initialized = false;
let tapListenerHandle: { remove: () => Promise<void> } | null = null;

export function isNativePushSupported(): boolean {
  return Capacitor.isNativePlatform();
}

export function isPushEnabled(): boolean {
  try {
    const raw = localStorage.getItem(PUSH_ENABLED_KEY);
    return raw === null ? true : raw === 'true';
  } catch {
    return true;
  }
}

export function setPushEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(PUSH_ENABLED_KEY, String(enabled));
  } catch {
    // storage unavailable — permission state still applies per-call
  }
}

export async function getPushPermissionStatus(): Promise<'granted' | 'denied' | 'prompt'> {
  if (!isNativePushSupported()) {
    if (typeof Notification === 'undefined') return 'denied';
    return (Notification.permission as 'granted' | 'denied' | 'default') === 'default'
      ? 'prompt'
      : (Notification.permission as 'granted' | 'denied');
  }
  try {
    const { display } = await LocalNotifications.checkPermissions();
    return display as 'granted' | 'denied' | 'prompt';
  } catch {
    return 'prompt';
  }
}

export async function requestPushPermission(): Promise<boolean> {
  if (!isNativePushSupported()) {
    if (typeof Notification === 'undefined') return false;
    try {
      const result = await Notification.requestPermission();
      return result === 'granted';
    } catch {
      return false;
    }
  }
  try {
    const result = await LocalNotifications.requestPermissions();
    return result.display === 'granted';
  } catch (e) {
    console.error('Push permission request failed:', e);
    return false;
  }
}

export async function openPushSettings(): Promise<void> {
  if (!isNativePushSupported()) return;
  try {
    // Available on @capacitor/local-notifications v8+.
    await (LocalNotifications as unknown as { openSettings?: () => Promise<void> }).openSettings?.();
  } catch (e) {
    console.error('Failed to open notification settings:', e);
  }
}

async function ensureChannel(): Promise<void> {
  if (!isNativePushSupported()) return;
  try {
    await LocalNotifications.createChannel({
      id: CHANNEL_ID,
      name: 'BlueSea Alerts',
      description: 'Transaction and account alerts',
      importance: 5,
      vibration: true,
      lights: true,
    });
  } catch (e) {
    console.error('Failed to create notification channel:', e);
  }
}

function toScheduleId(id: number): number {
  if (Number.isSafeInteger(id) && id > 0 && id <= 2147483647) return id;
  return Math.abs(id) % 2147483647 || 1;
}

async function showSystemTray(n: ServerNotification): Promise<void> {
  const title = String(n.title ?? 'BlueSea Mobile');
  const body = String(n.message ?? '');
  if (!body && !n.title) return;

  const route = '/notifications';
  const extra: PushTapDetail = {
    notificationId: typeof n.id === 'number' ? n.id : undefined,
    route,
    type: typeof n.notification_type === 'string' ? (n.notification_type as string) : undefined,
  };

  if (!isNativePushSupported()) {
    // Web fallback: plain browser Notification (tab must be open).
    try {
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted' && document.hidden) {
        const webNotif = new Notification(title, { body });
        webNotif.onclick = () => {
          window.focus();
          window.dispatchEvent(new CustomEvent<PushTapDetail>(PUSH_TAP_EVENT, { detail: extra }));
          webNotif.close();
        };
      }
    } catch (e) {
      console.error('Web notification failed:', e);
    }
    return;
  }

  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          title,
          body,
          id: toScheduleId(n.id),
          channelId: CHANNEL_ID,
          schedule: { at: new Date(Date.now() + 200) },
          sound: undefined,
          extra,
        },
      ],
    });
  } catch (e) {
    console.error('Failed to schedule local notification:', e);
  }
}

function onServerNotificationEvent(e: Event): void {
  if (!isPushEnabled()) return;
  const n = (e as CustomEvent).detail as ServerNotification & {
    notification_type?: string;
  };
  if (typeof n?.id !== 'number') return;
  if (seenIds.has(n.id)) return;
  seenIds.add(n.id);
  // Foreground web tab already shows the in-app list/toast — only pop the
  // OS tray when the tab is hidden or running natively (backgrounded app).
  if (!isNativePushSupported() && !document.hidden) return;
  void showSystemTray(n);
}

function onTapAction(action: ActionPerformed): void {
  const extra = (action.notification.extra ?? {}) as Partial<PushTapDetail>;
  const detail: PushTapDetail = {
    notificationId: typeof extra.notificationId === 'number' ? extra.notificationId : undefined,
    route: typeof extra.route === 'string' ? extra.route : '/notifications',
    type: typeof extra.type === 'string' ? extra.type : undefined,
  };
  window.dispatchEvent(new CustomEvent<PushTapDetail>(PUSH_TAP_EVENT, { detail }));
}

/** Initialize once at app boot. Safe to call repeatedly; returns cleanup. */
export function initAppPush(): () => void {
  window.addEventListener('bluesea:notification', onServerNotificationEvent);
  if (initialized) {
    return () => window.removeEventListener('bluesea:notification', onServerNotificationEvent);
  }
  initialized = true;

  if (isNativePushSupported()) {
    void ensureChannel();
    void LocalNotifications.addListener('localNotificationActionPerformed', onTapAction).then(
      (h) => {
        tapListenerHandle = h;
      },
      (e) => console.error('Push tap listener failed:', e),
    );
  }

  return () => {
    window.removeEventListener('bluesea:notification', onServerNotificationEvent);
    void tapListenerHandle?.remove();
    tapListenerHandle = null;
    initialized = false;
  };
}

/** Dev/QA helper: dispatch a fake server push through the real pipeline. */
export function testAppPush(title = 'Test alert', message = 'Push bridge is working'): void {
  window.dispatchEvent(
    new CustomEvent<ServerNotification>('bluesea:notification', {
      detail: { id: Date.now() % 2147483647, title, message } as ServerNotification,
    }),
  );
}
