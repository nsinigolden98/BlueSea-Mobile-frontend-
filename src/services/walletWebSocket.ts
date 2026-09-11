import { getCookie } from '@/types';

export type WalletConnected = {
  type: 'connected';
  user_id: number;
  balance: string;
  balance_formatted: string;
  locked_balance: string;
  available_balance: string;
};

export type BalanceUpdate = {
  type: 'balance_update';
  balance: string;
  balance_formatted: string;
  locked_balance: string;
  locked_balance_formatted: string;
  available_balance: string;
  available_balance_formatted: string;
  amount?: string;
  reference?: string;
  description?: string;
  transaction_type?: 'CREDIT' | 'DEBIT';
};

export type WalletMessage =
  | WalletConnected
  | BalanceUpdate
  | { type: 'pong' }

type WalletUpdateHandler = (message: WalletConnected | BalanceUpdate) => void;

type CloseHandler = (code: number) => void;

const WS_OPEN = 1;
const NORMAL_CLOSE = 1000;
const JWT_EXPIRED_CLOSE = 4401;

function toWebSocketBase(base: string): string {
  if (base.startsWith('wss://') || base.startsWith('ws://')) return base;
  if (base.startsWith('https://')) return `wss://${base.slice('https://'.length)}`;
  if (base.startsWith('http://')) return `ws://${base.slice('http://'.length)}`;
  return `wss://${base.replace(/^\/+/, '')}`;
}

class ReconnectWebSocket {
  private ws?: WebSocket;
  private pingTimer?: number;
  private reconnectTimer?: number;
  private retries = 0;
  private closedByUser = false;

  constructor(
    private readonly urlFactory: () => string,
    private readonly onMessage: (message: WalletMessage) => void,
    private readonly onClose?: CloseHandler,
  ) {
    this.connect();
  }

  private clearTimers() {
    if (this.pingTimer !== undefined) {
      window.clearInterval(this.pingTimer);
      this.pingTimer = undefined;
    }
    if (this.reconnectTimer !== undefined) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }
  }

  private connect() {
    if (this.closedByUser) return;

    const token = getCookie('access_token');
    if (!token) return;

    this.clearTimers();

    try {
      this.ws = new WebSocket(this.urlFactory());
    } catch (error) {
      console.error('Failed to create wallet WebSocket:', error);
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      this.retries = 0;
      this.pingTimer = window.setInterval(() => {
        if (this.ws?.readyState === WS_OPEN) {
          this.ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, 25_000);

      // Ask for a fresh balance after every connection. This is an explicit
      // backend-supported request, not polling.
      this.send({ type: 'balance_request' });
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WalletMessage;
        this.onMessage(message);
      } catch (error) {
        console.error('Invalid wallet WebSocket message:', error);
      }
    };

    this.ws.onclose = (event) => {
      this.clearTimers();
      this.onClose?.(event.code);

      if (this.closedByUser || event.code === NORMAL_CLOSE || event.code === JWT_EXPIRED_CLOSE) {
        return;
      }

      this.scheduleReconnect();
    };

    this.ws.onerror = () => {
      // onclose performs the reconnect. Avoid duplicate reconnect timers here.
    };
  }

  private scheduleReconnect() {
    if (this.closedByUser || this.reconnectTimer !== undefined) return;

    const delay = Math.min(1_000 * 2 ** this.retries, 30_000);
    this.retries += 1;

    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = undefined;
      this.connect();
    }, delay);
  }

  send(data: unknown) {
    if (this.ws?.readyState === WS_OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  close() {
    this.closedByUser = true;
    this.clearTimers();
    this.ws?.close(NORMAL_CLOSE);
  }
}

export function createWalletWebSocket(
  apiBase: string,
  onUpdate: WalletUpdateHandler,
  onClose?: CloseHandler,
) {
  const wsBase = toWebSocketBase(apiBase);

  const socket = new ReconnectWebSocket(
    () => `${wsBase}/ws/wallet/?token=${encodeURIComponent(getCookie('access_token') || '')}`,
    (message) => {
      if (message.type === 'connected' || message.type === 'balance_update') {
        onUpdate(message);
      }
    },
    onClose,
  );

  return {
    requestBalance: () => socket.send({ type: 'balance_request' }),
    ping: () => socket.send({ type: 'ping' }),
    close: () => socket.close(),
  };
}
