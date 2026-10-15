// Generic reconnecting WebSocket: the same lifecycle the wallet socket
// uses (reconnect with backoff, ping keepalive, 4401 stops), parameterized
// over the message type so notification/plans sockets share it without
// duplicating the state machine.

export type CloseHandler = (code: number, reason: string, wasClean: boolean) => void;

interface Options {
  onCloseCode?: CloseHandler;
  /** Message sent right after open (e.g. subscription/initial fetch). */
  init?: unknown;
  /** Ping interval ms; omit to disable keepalive. */
  pingMs?: number;
  label?: string;
}

export class ReconnectWS {
  private ws?: WebSocket;
  private pingTimer?: number;
  private reconnectTimer?: number;
  private retries = 0;
  private closedByUser = false;
  private readonly urlFactory: () => string;
  private readonly onMsg: (message: any) => void;
  private readonly opts: Options;

  constructor(
    urlFactory: () => string,
    onMsg: (message: any) => void,
    opts: Options = {},
  ) {
    this.urlFactory = urlFactory;
    this.onMsg = onMsg;
    this.opts = opts;
    this.connect();
  }

  private get label() {
    return this.opts.label ?? 'WebSocket';
  }

  private connect() {
    if (this.closedByUser) return;

    const url = this.urlFactory();
    if (!url.includes('token=')) {
      console.error(`${this.label} was not opened because the access token is missing.`);
      this.scheduleReconnect();
      return;
    }

    try {
      this.ws = new WebSocket(url);
    } catch (error) {
      console.error(`Failed to create ${this.label}:`, error);
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      this.retries = 0;
      this.clearReconnectTimer();
      this.clearPing();
      console.log(`${this.label} opened: ${url}`);
      if (this.opts.pingMs) {
        this.pingTimer = window.setInterval(() => {
          if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, this.opts.pingMs);
      }
      if (this.opts.init !== undefined) this.send(this.opts.init);
    };

    this.ws.onmessage = (event: MessageEvent<string>) => {
      try {
        this.onMsg(JSON.parse(event.data));
      } catch (error) {
        console.error(`Invalid ${this.label} message:`, error);
      }
    };

    this.ws.onerror = (event: Event) => {
      console.error(`${this.label} error:`, event);
    };

    this.ws.onclose = (event: CloseEvent) => {
      this.clearPing();
      console.log(`${this.label} closed: code=${event.code} reason=${event.reason} wasClean=${event.wasClean}`);
      this.opts.onCloseCode?.(event.code, event.reason, event.wasClean);
      if (this.closedByUser || event.code === 1000 || event.code === 4401) {
        // 4401: server rejected the JWT — don't retry with the same token.
        return;
      }
      this.scheduleReconnect();
    };
  }

  private scheduleReconnect() {
    if (this.closedByUser || this.reconnectTimer !== undefined) return;
    const delay = Math.min(1000 * 2 ** this.retries, 30_000);
    this.retries += 1;
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = undefined;
      this.connect();
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

  send(message: unknown) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  close() {
    this.closedByUser = true;
    this.clearPing();
    this.clearReconnectTimer();
    this.ws?.close();
    this.ws = undefined;
  }
}

export function toWebSocketBase(base: string): string {
  const trimmed = base.trim().replace(/\/+$/, '');
  if (trimmed.startsWith('https://')) return `wss://${trimmed.slice('https://'.length)}`;
  if (trimmed.startsWith('http://')) return `ws://${trimmed.slice('http://'.length)}`;
  return trimmed;
}
