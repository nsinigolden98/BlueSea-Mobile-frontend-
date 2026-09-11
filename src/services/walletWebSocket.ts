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

type CloseHandler = (code: number) => void;

class ReconnectWS {
  private ws?: WebSocket;
  private ping?: number;
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

    try {
      this.ws = new WebSocket(url);
    } catch (error) {
      console.error('Failed to create wallet WebSocket:', error);
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      this.retries = 0;

      if (this.ping !== undefined) {
        window.clearInterval(this.ping);
      }

      this.ping = window.setInterval(() => {
        if (this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, 25_000);

      // The backend explicitly supports balance_request. This is a
      // request/response initialization event, not polling.
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

    this.ws.onerror = (error) => {
      console.error('Wallet WebSocket error:', error);
    };

    this.ws.onclose = (event: CloseEvent) => {
      this.clearPing();
      this.onCloseCode?.(event.code);

      if (this.closedByUser || event.code === 1000 || event.code === 4401) {
        return;
      }

      this.scheduleReconnect();
    };
  }

  private scheduleReconnect() {
    if (this.closedByUser) return;

    const delay = Math.min(1_000 * 2 ** this.retries, 30_000);
    this.retries += 1;

    window.setTimeout(() => {
      if (!this.closedByUser) {
        this.connect();
      }
    }, delay);
  }

  private clearPing() {
    if (this.ping !== undefined) {
      window.clearInterval(this.ping);
      this.ping = undefined;
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

    if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
      this.ws.close(1000);
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
  onCloseCode?: (code: number) => void,
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
    (code: number) => {
      onCloseCode?.(code);

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

// Backward-compatible alias for existing imports.
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

      return `${wsBase}/ws/payments/${encodeURIComponent(
        referenceId,
      )}/?token=${encodeURIComponent(token)}`;
    },
    (message) => {
      if (message.type === 'payment_update') {
        onUpdate(message);
      }
    },
    (code) => {
      onCloseCode?.(code);
      if (code === 4401) {
        console.warn(
          'Payment WebSocket authentication expired (4401). Waiting for the existing auth/token-refresh flow.',
        );
      }
    },
  );

  return {
    ping: () => socket.send({ type: 'ping' }),
    close: () => socket.close(),
  };
};
function onCloseCode(code: number) {
  if (code !== 1000 && code !== 4401) {
    console.warn(`Payment WebSocket closed unexpectedly (code ${code}).`);
  }
}

