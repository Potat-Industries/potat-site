/* eslint-disable import/prefer-default-export */
import { default as eventBus } from '../assets/eventBus';

export class StatsSocket {
  private socket: WebSocket | null = null;

  private readonly url: string;

  public constructor(url: string) {
    this.url = url;
    this.connect();
  }

  private connect(): void {
    if (this.socket?.readyState === WebSocket.OPEN) return;
    this.socket = new WebSocket(this.url);

    this.socket.addEventListener('open', () => console.log('Connected to stats server'));

    this.socket.addEventListener('message', (data: MessageEvent) => {
      try {
        const msg = JSON.parse(data.data);
        eventBus.$emit('update', { data: msg.data, topic: msg.topic.replace('stats/', '') });
      } catch {
        console.log('Invalid JSON received');
      }
    });

    this.socket.addEventListener('close', () => {
      console.log('Disconnected from stats server');
      this.reconnect();
    });
  }

  private reconnect() { setTimeout(this.connect.bind(this), 2500); }
}
