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

export type PaymentUpdate = {
  type: 'payment_update';
  reference_id: string;
  status: 'pending' | 'delivered' | 'failed' | 'reversed';
  payment_type: string;
  vtpass_transaction_id?: string;
  amount: string;
};

export type WalletMessage =
  | WalletConnected
  | BalanceUpdate
  | PaymentUpdate
  | { type: 'pong' };

type CloseHandler = (code: number, reason: string, wasClean: boolean) => void;

class ReconnectWS {
  private ws?: WebSocket;
  private pingTimer?: number;
  private reconnectTimer?: number;
  private retries = 0;
  private readonly urlFactory: () => string;
  private readonly onMsg: (message: WalletMessage) => void;
  private readonly onCloseCode?: CloseHandler;
  private closedByUser = false;

  constructor(
    urlFactory: () => string,
    onMsg: (message: WalletMessage) => void,
    onCloseCode?: CloseHandler,
  ) {
    this.urlFactory = urlFactory;
    this.onMsg = onMsg;
    this.onCloseCode = onCloseCode;
    this.connect();
  }

  private connect() {
    if (this.closedByUser) return;

    const url = this.urlFactory();
    const tokenQueryPresent = url.includes('token=');

    if (!tokenQueryPresent) {
      console.error('Wallet WebSocket was not opened because the access token is missing.');
      this.scheduleReconnect();
      return;
    }

    try {
      this.ws = new WebSocket(url);
    } catch (error) {
      console.error('Failed to create wallet WebSocket:', error);
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      this.retries = 0;
      this.clearReconnectTimer();
      this.clearPing();

      console.info('Wallet WebSocket connected.');

      this.pingTimer = window.setInterval(() => {
        if (this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, 25_000);

      // Backend-supported initialization request; this is not polling.
      this.send({ type: 'balance_request' });
    };

    this.ws.onmessage = (event: MessageEvent<string>) => {
      try {
        const message = JSON.parse(event.data) as WalletMessage;
        this.onMsg(message);
      } catch (error) {
        console.error('Invalid wallet WebSocket message:', error);
      }
    };

    this.ws.onerror = (event: Event) => {
      // Browsers intentionally expose very little information on WebSocket
      // error events. The useful server-side diagnostic is emitted by onclose.
      console.error('Wallet WebSocket error:', event);
    };

    this.ws.onclose = (event: CloseEvent) => {
      this.clearPing();
      this.onCloseCode?.(event.code, event.reason, event.wasClean);

      console.warn('Wallet WebSocket closed:', {
        code: event.code,
        reason: event.reason || '(no reason supplied)',
        wasClean: event.wasClean,
      });

      if (this.closedByUser || event.code === 1000) {
        return;
      }

      // 4401 means the server rejected the JWT. Do not reconnect endlessly
      // with the same expired token. AuthContext can recreate this service
      // after the existing auth flow obtains a valid token.
      if (event.code === 4401) {
        return;
      }

      this.scheduleReconnect();
    };
  }

  private scheduleReconnect() {
    if (this.closedByUser || this.reconnectTimer !== undefined) return;

    const delay = Math.min(1_000 * 2 ** this.retries, 30_000);
    this.retries += 1;

    console.warn(`Wallet WebSocket reconnect scheduled in ${delay}ms.`);

    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = undefined;
      if (!this.closedByUser) this.connect();
    }, delay);
  }

  private clearPing() {
    if (this.pingTimer !== undefined) {
      window.clearInterval(this.pingTimer);
      this.pingTimer = undefined;
    }
  }

  private clearReconnectTimer() {
    if (this.reconnectTimer !== undefined) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }
  }

  send(data: unknown) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  close() {
    this.closedByUser = true;
    this.clearPing();
    this.clearReconnectTimer();

    if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
      this.ws.close(1000, 'Client closed wallet WebSocket');
    }
  }
}

function getCookie(name: string): string {
  if (typeof document === 'undefined') return '';

  const prefix = `${name}=`;
  const cookie = document.cookie
    .split('; ')
    .find((item) => item.startsWith(prefix));

  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : '';
}

function toWebSocketBase(base: string): string {
  const trimmed = base.replace(/\/+$/, '');

  if (trimmed.startsWith('https://')) {
    return `wss://${trimmed.slice('https://'.length)}`;
  }

  if (trimmed.startsWith('http://')) {
    return `ws://${trimmed.slice('http://'.length)}`;
  }

  if (trimmed.startsWith('wss://') || trimmed.startsWith('ws://')) {
    return trimmed;
  }

  return trimmed;
}

export function createWalletWebSocket(
  base: string,
  onUpdate: (data: BalanceUpdate | WalletConnected) => void,
  onCloseCode?: (code: number, reason?: string, wasClean?: boolean) => void,
) {
  const socket = new ReconnectWS(
    () => {
      const token = getCookie('access_token');
      const wsBase = toWebSocketBase(base);
      return `${wsBase}/ws/wallet/?token=${encodeURIComponent(token)}`;
    },
    (message) => {
      if (message.type === 'connected' || message.type === 'balance_update') {
        onUpdate(message);
      }
    },
    (code: number, reason: string, wasClean: boolean) => {
      onCloseCode?.(code, reason, wasClean);

      if (code === 4401) {
        console.warn(
          'Wallet WebSocket authentication expired (4401). Waiting for the existing auth/token-refresh flow.',
        );
      }
    },
  );

  return {
    requestBalance: () => socket.send({ type: 'balance_request' }),
    ping: () => socket.send({ type: 'ping' }),
    close: () => socket.close(),
  };
}

export const walletWS = createWalletWebSocket;

export const paymentsWS = (
  base: string,
  referenceId: string,
  onUpdate: (data: PaymentUpdate) => void,
) => {
  const socket = new ReconnectWS(
    () => {
      const token = getCookie('access_token');
      const wsBase = toWebSocketBase(base);
      return `${wsBase}/ws/payments/${encodeURIComponent(referenceId)}/?token=${encodeURIComponent(token)}`;
    },
    (message) => {
      if (message.type === 'payment_update') {
        onUpdate(message);
      }
    },
    (code: number, reason: string, wasClean: boolean) => {
      console.warn('Payment WebSocket closed:', { code, reason, wasClean });
    },
  );

  return {
    ping: () => socket.send({ type: 'ping' }),
    close: () => socket.close(),
  };
};
