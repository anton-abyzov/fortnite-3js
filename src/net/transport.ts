import type { NetMsg } from './protocol';
import type { SignalClient } from './signal';

/** Public STUN only: free, no account. Without TURN some networks fall back to the relay. */
const ICE: RTCIceServer[] = [{ urls: 'stun:stun.l.google.com:19302' }];

/** `?net=relay` skips WebRTC and sends everything through the signaling socket. */
const FORCE_RELAY = new URLSearchParams(location.search).get('net') === 'relay';

export type LinkMode = 'connecting' | 'webrtc' | 'relay';

/**
 * The path between this browser and one other: two WebRTC data channels, `events` (reliable,
 * ordered) and `state` (unordered, no retransmits), with the signaling socket as the fallback.
 * Events go through whichever path is open and carry a sequence number, so they arrive once and
 * in order even when the path changes underneath them. State is dropped rather than queued.
 */
export class Link {
  onMessage: (msg: NetMsg) => void = () => {};
  readonly pc: RTCPeerConnection | null = null;
  private events: RTCDataChannel | null = null;
  private state: RTCDataChannel | null = null;
  private sendSeq = 0;
  private recvSeq = 0;
  private readonly held = new Map<number, NetMsg>();
  private closed = false;
  private readonly fallback: number;
  relayed = false;
  /** Messages and bytes each way, for tests and the room panel. */
  readonly stats = { sent: 0, received: 0, bytesOut: 0 };

  constructor(
    private readonly signal: SignalClient,
    /** Signaling id of the other end. */
    readonly peer: number,
    /** The host makes the offer. */
    offerer: boolean,
  ) {
    if (FORCE_RELAY || typeof RTCPeerConnection === 'undefined') {
      this.relayed = true;
      this.fallback = 0;
      return;
    }
    const pc = new RTCPeerConnection({ iceServers: ICE });
    (this as { pc: RTCPeerConnection }).pc = pc;
    pc.onicecandidate = (e) => {
      if (e.candidate) this.signal.send({ t: 'signal', to: peer, data: { ice: e.candidate.toJSON() } });
    };
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed') this.relayed = true;
    };
    if (offerer) {
      this.adopt(pc.createDataChannel('events', { ordered: true }));
      this.adopt(pc.createDataChannel('state', { ordered: false, maxRetransmits: 0 }));
      void pc
        .createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .then(() => this.signal.send({ t: 'signal', to: peer, data: { sdp: pc.localDescription } }))
        .catch((err) => {
          console.warn('offer failed', err);
          this.relayed = true;
        });
    } else pc.ondatachannel = (e) => this.adopt(e.channel);
    // No direct channel after a few seconds: keep using the relay.
    this.fallback = window.setTimeout(() => {
      if (this.mode !== 'webrtc') this.relayed = true;
    }, 6000);
  }

  get mode(): LinkMode {
    if (this.events?.readyState === 'open') return 'webrtc';
    return this.relayed ? 'relay' : 'connecting';
  }

  private adopt(ch: RTCDataChannel): void {
    if (ch.label === 'events') this.events = ch;
    else if (ch.label === 'state') this.state = ch;
    ch.onmessage = (e) => this.receive(String(e.data));
  }

  /** A WebRTC handshake message from the other end, through signaling. */
  async handshake(data: { sdp?: RTCSessionDescriptionInit; ice?: RTCIceCandidateInit }): Promise<void> {
    const pc = this.pc;
    if (!pc || this.closed) return;
    try {
      if (data.sdp) {
        await pc.setRemoteDescription(data.sdp);
        if (data.sdp.type === 'offer') {
          await pc.setLocalDescription(await pc.createAnswer());
          this.signal.send({ t: 'signal', to: this.peer, data: { sdp: pc.localDescription } });
        }
      } else if (data.ice) await pc.addIceCandidate(data.ice);
    } catch (err) {
      console.warn('handshake failed', err);
    }
  }

  /** A message that came the long way round, through the signaling socket. */
  relayIn(data: string): void {
    this.receive(data);
  }

  private receive(text: string): void {
    let msg: NetMsg & { q?: number };
    try {
      msg = JSON.parse(text);
    } catch {
      return;
    }
    this.stats.received++;
    const seq = msg.q;
    if (seq === undefined) {
      this.onMessage(msg);
      return;
    }
    if (seq <= this.recvSeq) return;
    this.held.set(seq, msg);
    // Deliver everything that is now in order.
    for (let next = this.held.get(this.recvSeq + 1); next; next = this.held.get(this.recvSeq + 1)) {
      this.held.delete(this.recvSeq + 1);
      this.recvSeq++;
      this.onMessage(next);
    }
  }

  /** Reliable and in order. */
  sendEvent(msg: NetMsg): void {
    if (this.closed) return;
    const text = JSON.stringify({ ...msg, q: ++this.sendSeq });
    this.stats.sent++;
    this.stats.bytesOut += text.length;
    if (this.events?.readyState === 'open') this.events.send(text);
    else this.signal.send({ t: 'relay', to: this.peer, data: text });
  }

  /** Newest wins; may be lost. */
  sendState(msg: NetMsg): void {
    if (this.closed) return;
    const text = JSON.stringify(msg);
    this.stats.sent++;
    this.stats.bytesOut += text.length;
    if (this.state?.readyState === 'open') this.state.send(text);
    else if (this.relayed || this.events?.readyState !== 'open') this.signal.send({ t: 'relay', to: this.peer, data: text });
  }

  close(): void {
    this.closed = true;
    clearTimeout(this.fallback);
    this.events?.close();
    this.state?.close();
    this.pc?.close();
  }
}
