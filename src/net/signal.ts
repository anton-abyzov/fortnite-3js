/** The signaling socket: room create and join, WebRTC handshakes, and the relay path. */

export type SignalMsg =
  | { t: 'created'; room: string; id: number }
  | { t: 'joined'; room: string; id: number }
  | { t: 'error'; code: 'no-room' | 'full'; room: string }
  | { t: 'peer-join'; id: number; name: string; token: string }
  | { t: 'peer-leave'; id: number }
  | { t: 'signal'; from: number; data: any }
  | { t: 'relay'; from: number; data: string }
  | { t: 'kicked'; reason: string }
  | { t: 'room-closed' };

/** Where signaling lives: `?signal=` when given, else `/signal` on the server the page came from. */
export function signalUrl(): string {
  const given = new URLSearchParams(location.search).get('signal');
  if (given) return given;
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${location.host}/signal`;
}

export class SignalClient {
  onMessage: (msg: SignalMsg) => void = () => {};
  onClose: () => void = () => {};
  private ws: WebSocket | null = null;
  private closing = false;

  connect(url = signalUrl(), timeoutMs = 8000): Promise<void> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(url);
      this.ws = ws;
      const timer = setTimeout(() => {
        ws.close();
        reject(new Error('The room server did not answer.'));
      }, timeoutMs);
      ws.onopen = () => {
        clearTimeout(timer);
        resolve();
      };
      ws.onerror = () => {
        clearTimeout(timer);
        reject(new Error('Could not reach the room server.'));
      };
      ws.onmessage = (e) => {
        try {
          this.onMessage(JSON.parse(String(e.data)) as SignalMsg);
        } catch (err) {
          console.warn('bad signaling message', err);
        }
      };
      ws.onclose = () => {
        if (!this.closing) this.onClose();
      };
    });
  }

  send(msg: Record<string, unknown>): void {
    if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(msg));
  }

  get open(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  close(): void {
    this.closing = true;
    this.send({ t: 'leave' });
    this.ws?.close();
    this.ws = null;
  }
}
