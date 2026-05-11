/* eslint-disable import/prefer-default-export */
import eventBus from './eventBus';

export class StatsSocket {
  private socket: WebSocket | null = null;

  private readonly url: string;

  private attempt = 0;

  public constructor(url: string) {
    this.url = url;
    this.connect();
  }

  private connect(): void {
    if (this.socket?.readyState === WebSocket.OPEN) return;
    this.socket = new WebSocket(this.url);

    this.socket.addEventListener('open', () => {
      this.attempt = 0;
    });

    this.socket.addEventListener('message', (data: MessageEvent) => {
      try {
        const msg = JSON.parse(data.data);
        eventBus.$emit('update', { data: msg.data, topic: msg.topic.replace('stats/', '') });
      } catch {
        // ignore malformed messages
      }
    });

    this.socket.addEventListener('error', () => {
      // error detail is available in the close event; handled by reconnect
    });

    this.socket.addEventListener('close', () => {
      this.reconnect();
    });
  }

  private reconnect(): void {
    const delay = Math.min(1000 * 2 ** this.attempt, 30_000);
    this.attempt += 1;
    setTimeout(this.connect.bind(this), delay);
  }
}
