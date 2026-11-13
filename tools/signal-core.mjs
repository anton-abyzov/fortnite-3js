// Signaling for friends rooms: hands WebRTC offers, answers and candidates between the host and the
// guests of a room, and relays game traffic when a direct channel cannot open. It keeps no game state.
// Mounted on the Vite dev and preview servers (see vite.config.ts) and by tools/signal-server.mjs.
import { WebSocketServer } from 'ws';

/** Letters that cannot be mistaken for each other when read aloud or typed. */
const LETTERS = 'ABCDEFGHJKMNPQRSTUVWXYZ';
const MAX_PLAYERS = 4;

/**
 * Serve signaling on `path` of an existing HTTP server (upgrade requests only).
 * Returns a handle with `rooms` (for tests and logs) and `close()`.
 */
export function attachSignaling(httpServer, { path = '/signal', log = () => {} } = {}) {
  const wss = new WebSocketServer({ noServer: true, maxPayload: 256 * 1024 });
  /** code -> { code, host: socket, peers: Map<id, socket>, next } */
  const rooms = new Map();

  const send = (ws, msg) => {
    if (ws && ws.readyState === 1) ws.send(JSON.stringify(msg));
  };

  const newCode = () => {
    for (;;) {
      let code = '';
      for (let i = 0; i < 4; i++) code += LETTERS[Math.floor(Math.random() * LETTERS.length)];
      if (!rooms.has(code)) return code;
    }
  };

  const leave = (ws) => {
    const room = ws.room;
    if (!room) return;
    ws.room = null;
    if (ws.peerId === 0) {
      rooms.delete(room.code);
      for (const peer of room.peers.values()) {
        send(peer, { t: 'room-closed' });
        peer.room = null;
        peer.close();
      }
      log(`room ${room.code} closed`);
      return;
    }
    room.peers.delete(ws.peerId);
    send(room.host, { t: 'peer-leave', id: ws.peerId });
    log(`room ${room.code}: peer ${ws.peerId} left`);
  };

  const target = (ws, to) => {
    const room = ws.room;
    if (!room) return null;
    if (to === 0) return room.host;
    // Guests talk to the host only.
    if (ws.peerId !== 0) return null;
    return room.peers.get(to) ?? null;
  };

  wss.on('connection', (ws) => {
    ws.room = null;
    ws.peerId = -1;
    ws.isAlive = true;
    ws.on('pong', () => (ws.isAlive = true));
    ws.on('message', (raw) => {
      let msg;
      try {
        msg = JSON.parse(String(raw));
      } catch {
        return;
      }
      if (!msg || typeof msg.t !== 'string') return;
      switch (msg.t) {
        case 'create': {
          if (ws.room) return;
          const code = newCode();
          const room = { code, host: ws, peers: new Map(), next: 1 };
          rooms.set(code, room);
          ws.room = room;
          ws.peerId = 0;
          send(ws, { t: 'created', room: code, id: 0 });
          log(`room ${code} created`);
          break;
        }
        case 'join': {
          if (ws.room) return;
          const code = String(msg.room ?? '').toUpperCase();
          const room = rooms.get(code);
          if (!room) return send(ws, { t: 'error', code: 'no-room', room: code });
          if (room.peers.size + 1 >= MAX_PLAYERS) return send(ws, { t: 'error', code: 'full', room: code });
          const id = room.next++;
          room.peers.set(id, ws);
          ws.room = room;
          ws.peerId = id;
          send(ws, { t: 'joined', room: code, id });
          send(room.host, { t: 'peer-join', id, name: String(msg.name ?? '').slice(0, 24), token: String(msg.token ?? '').slice(0, 64) });
          log(`room ${code}: peer ${id} joined`);
          break;
        }
        case 'signal':
        case 'relay': {
          const to = target(ws, Number(msg.to));
          if (to) send(to, { t: msg.t, from: ws.peerId, data: msg.data });
          break;
        }
        case 'kick': {
          if (ws.peerId !== 0 || !ws.room) return;
          const peer = ws.room.peers.get(Number(msg.id));
          if (!peer) return;
          send(peer, { t: 'kicked', reason: String(msg.reason ?? '') });
          ws.room.peers.delete(peer.peerId);
          peer.room = null;
          peer.close();
          break;
        }
        case 'leave':
          leave(ws);
          break;
      }
    });
    ws.on('close', () => leave(ws));
    ws.on('error', () => leave(ws));
  });

  // Sockets that stop answering (a laptop lid closed) are dropped, so their room hears they left.
  const beat = setInterval(() => {
    for (const ws of wss.clients) {
      if (!ws.isAlive) {
        ws.terminate();
        continue;
      }
      ws.isAlive = false;
      ws.ping();
    }
  }, 10_000);

  const onUpgrade = (req, socket, head) => {
    const url = new URL(req.url ?? '/', 'http://x');
    if (url.pathname !== path) return;
    wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req));
  };
  httpServer.on('upgrade', onUpgrade);
  httpServer.on('close', () => clearInterval(beat));

  return {
    rooms,
    close() {
      clearInterval(beat);
      httpServer.off('upgrade', onUpgrade);
      for (const ws of wss.clients) ws.terminate();
      wss.close();
    },
  };
}
