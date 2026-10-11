// Live notifications over `/ws/notifications/` (JWT in `?token=`).
// Server sends `connected {unread_count}` on open, `unread_update`
// refreshes, and `new_notification` pushes. Auth-gated exactly like the
// wallet socket (4401 stops reconnects until a fresh login).

import { ReconnectWS, toWebSocketBase, type CloseHandler } from './reconnectWs';
import { getSessionToken } from '@/lib/session';

export interface ServerNotification {
  id: number;
  title?: string;
  message?: string;
  [key: string]: unknown;
}

interface Handlers {
  onUnread: (count: number) => void;
  onNotification: (n: ServerNotification) => void;
}

export function createNotificationSocket(
  base: string,
  handlers: Handlers,
  onCloseCode?: CloseHandler,
) {
  const socket = new ReconnectWS(
    () => {
      const token = getSessionToken() ?? '';
      return `${toWebSocketBase(base)}/ws/notifications/?token=${encodeURIComponent(token)}`;
    },
    (message: any) => {
      if (message?.type === 'connected' || message?.type === 'unread_update') {
        if (typeof message.unread_count === 'number') handlers.onUnread(message.unread_count);
        return;
      }
      if (message?.type === 'new_notification' && typeof message?.id === 'number') {
        const { type: _type, ...rest } = message;
        handlers.onNotification({ id: message.id, ...rest } as ServerNotification);
      }
    },
    {
      label: 'Notification WebSocket',
      pingMs: 25_000,
      onCloseCode: (code, reason, wasClean) => {
        if (code === 4401) {
          console.warn('Notification WebSocket authentication expired (4401). Waiting for re-login.');
        }
        onCloseCode?.(code, reason, wasClean);
      },
    },
  );
  return { close: () => socket.close() };
}
