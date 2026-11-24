// Native-app notification bridge. This uses the existing authenticated
// notification WebSocket while the native app is running and converts each
// received event into an OS notification. It is intentionally unavailable
// to browser/web users. It is not remote push: a force-stopped app cannot
// receive WebSocket events until it is running again.

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
    // Notifications are opt-in. A missing preference must never silently
    // turn the setting back on after an install, storage reset, or upgrade.
    return raw === 'true';
  } catch {
    return false;
  }
}

export function setPushEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(PUSH_ENABLED_KEY, String(enabled));
  } catch {
    // storage unavailable — permission state still applies per-call
  }
}

export async function getPushPermissionStatus(): Promise<'granted' | 'denied' | 'prompt' | 'prompt-with-rationale' | 'unsupported'> {
  if (!isNativePushSupported()) return 'unsupported';
  try {
    const { display } = await LocalNotifications.checkPermissions();
    return display as 'granted' | 'denied' | 'prompt' | 'prompt-with-rationale';
  } catch (error) {
    console.error('Could not check native notification permission:', error);
    return 'prompt';
  }
}

export async function requestPushPermission(): Promise<boolean> {
  if (!isNativePushSupported()) return false;
  try {
    const current = await LocalNotifications.checkPermissions();
    if (current.display === 'granted') return true;
    const result = await LocalNotifications.requestPermissions();
    return result.display === 'granted';
  } catch (error) {
    console.error('Native notification permission request failed:', error);
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

  if (!isNativePushSupported()) return;

  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          title,
          body,
          id: toScheduleId(n.id),
          channelId: CHANNEL_ID,
          // Alerts are immediate; exact-alarm access is unnecessary.
          schedule: { at: new Date(Date.now() + 200) },
          isExactNotification: false,
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
  if (!isNativePushSupported() || !isPushEnabled()) return;
  const n = (e as CustomEvent).detail as ServerNotification & {
    notification_type?: string;
  };
  if (typeof n?.id !== 'number') return;
  if (seenIds.has(n.id)) return;
  seenIds.add(n.id);
  // In-app UI handles foreground messages. Native OS tray notifications are
  // deliberately limited to the Capacitor app; web users never receive them.
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
