import './friends.css';
import type { Game } from '../game';
import { FRIEND_STARTS, FriendsSession, MAX_PLAYERS, saveName, savedName } from '../net/session';
import { button, el } from './dom';

const TRANSPORT_WORDS: Record<string, string> = {
  webrtc: 'Connected directly (WebRTC)',
  relay: 'Connected through the room server',
  connecting: 'Connecting',
};

/**
 * The friends room panel over the title screen: create a room or join one by code or link, see
 * who is in, and (the host) start the round. During a round a small tag shows the room.
 */
export class FriendsPanel {
  session: FriendsSession | null = null;
  private readonly panel = el('section', 'friends');
  private readonly body = el('div', 'friends-body');
  private readonly tag = el('div', 'friends-tag');
  private open = false;
  private busy = false;
  private error = '';
  private start = 0;
  private renderedKey = '';

  constructor(
    private readonly game: Game,
    private readonly root: HTMLElement,
  ) {
    this.panel.setAttribute('role', 'dialog');
    this.panel.setAttribute('aria-label', 'Play with friends');
    const card = el('div', 'friends-card');
    card.append(el('div', 'friends-kicker', 'Private room'), el('h2', 'friends-title', 'Play with friends'), this.body);
    this.panel.append(card);
    // Keys typed here are for the fields, not for the title screen behind.
    this.panel.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.code === 'Escape' && !this.session) this.setOpen(false);
    });
    root.append(this.panel, this.tag);

    const play = document.getElementById('play');
    const entry = button('friends-open-button', 'Play with friends', () => this.setOpen(true));
    entry.id = 'friends';
    play?.after(entry);

    game.events.on('phase', () => this.render());
    game.debugExt['friends'] = () => this.session?.snapshot() ?? null;
    window.setInterval(() => this.render(), 250);

    const code = new URLSearchParams(location.search).get('room');
    if (code) {
      this.setOpen(true);
      const name = savedName();
      if (name) void this.join(code, name);
    }
    this.render();
  }

  private setOpen(on: boolean): void {
    this.open = on;
    this.error = on ? this.error : '';
    this.renderedKey = '';
    this.render();
    if (on) (this.panel.querySelector('input') as HTMLInputElement | null)?.focus();
  }

  private async host(name: string): Promise<void> {
    if (this.busy) return;
    this.busy = true;
    this.error = '';
    saveName(name);
    try {
      this.adopt(await FriendsSession.host(this.game, name));
    } catch (err) {
      this.error = (err as Error).message;
    }
    this.busy = false;
    this.renderedKey = '';
    this.render();
  }

  private async join(code: string, name: string): Promise<void> {
    if (this.busy) return;
    this.busy = true;
    this.error = '';
    saveName(name);
    this.renderedKey = '';
    this.render();
    try {
      this.adopt(await FriendsSession.join(this.game, code, name));
    } catch (err) {
      this.error = (err as Error).message;
    }
    this.busy = false;
    this.renderedKey = '';
    this.render();
  }

  private adopt(s: FriendsSession): void {
    this.session = s;
    s.onChange = () => this.render();
    s.onEnd = (reason) => {
      this.session = null;
      this.error = reason;
      this.open = reason !== '';
      this.renderedKey = '';
      this.render();
    };
    // Back in the room panel with the room still open after a round.
    const url = new URL(location.href);
    if (s.role === 'host' && url.searchParams.has('room')) {
      url.searchParams.delete('room');
      history.replaceState(null, '', url);
    }
  }

  /** Redraw what changed. Cheap enough to run four times a second. */
  private render(): void {
    const g = this.game;
    const s = this.session;
    const playing = g.phase === 'match' || g.phase === 'ended';
    const show = (this.open || s !== null) && !playing && g.phase !== 'boot';
    this.panel.classList.toggle('show', show);
    this.panel.inert = !show;
    this.root.classList.toggle('friends-open', show);

    // The tag in the corner during a round.
    this.tag.classList.toggle('show', s !== null && playing);
    if (s && playing) {
      const away = s.players.filter((p) => p.away).map((p) => p.name);
      this.tag.textContent = `Room ${s.room} · ${s.players.length} of ${MAX_PLAYERS}${away.length ? ` · away: ${away.join(', ')}` : ''}`;
    }
    if (!show) return;

    const key = JSON.stringify([s?.room, s?.slot, s?.players, s?.transports, s?.running, this.error, this.busy, this.start]);
    if (key === this.renderedKey) return;
    this.renderedKey = key;
    this.body.replaceChildren(s ? this.roomView(s) : this.doorView());
  }

  private doorView(): HTMLElement {
    const box = el('div', 'friends-door');
    const nameLabel = el('label', 'friends-label', 'Your name');
    const name = el('input', 'friends-input friends-name');
    name.maxLength = 16;
    name.placeholder = 'Name';
    name.value = savedName() || `Player ${Math.floor(Math.random() * 90 + 10)}`;
    nameLabel.append(name);

    const code = el('input', 'friends-input friends-code');
    code.maxLength = 4;
    code.placeholder = 'CODE';
    code.value = (new URLSearchParams(location.search).get('room') ?? '').toUpperCase();
    code.addEventListener('input', () => (code.value = code.value.toUpperCase().replace(/[^A-Z]/g, '')));
    const create = button('friends-create', 'Create a room', () => void this.host(name.value.trim() || 'Host'));
    const join = button('friends-join', 'Join', () => {
      if (code.value.length === 4) void this.join(code.value, name.value.trim() || 'Friend');
      else this.fail('Room codes are four letters.');
    });
    code.addEventListener('keydown', (e) => {
      if (e.code === 'Enter') join.click();
    });
    create.disabled = join.disabled = this.busy;
    const joinRow = el('div', 'friends-row');
    joinRow.append(code, join);
    box.append(nameLabel, create, el('div', 'friends-or', 'or join a friend'), joinRow);
    if (this.busy) box.append(el('p', 'friends-status', 'Connecting to the room…'));
    if (this.error) box.append(el('p', 'friends-error', this.error));
    box.append(el('p', 'friends-note', `Up to ${MAX_PLAYERS} players. The host's browser runs the round; nothing is sent to any game server.`));
    box.append(button('friends-close', 'Back', () => this.setOpen(false)));
    return box;
  }

  private roomView(s: FriendsSession): HTMLElement {
    const box = el('div', 'friends-room');
    const code = el('div', 'friends-roomcode');
    code.append(el('span', 'friends-label', 'Room code'), el('strong', 'friends-code-big', s.room));
    box.append(code);

    const linkRow = el('div', 'friends-row');
    const link = el('input', 'friends-input friends-link');
    link.readOnly = true;
    link.value = s.inviteLink;
    const copy = button('friends-copy', 'Copy link', () => {
      link.select();
      void navigator.clipboard?.writeText(link.value).catch(() => document.execCommand('copy'));
      copy.textContent = 'Copied';
    });
    linkRow.append(link, copy);
    box.append(linkRow);

    const list = el('ul', 'friends-players');
    for (const p of s.players) {
      const li = el('li', 'friends-player');
      li.dataset.slot = String(p.slot);
      li.append(el('span', 'friends-player-name', p.name));
      const tags: string[] = [];
      if (p.slot === 0) tags.push('host');
      if (p.slot === s.slot) tags.push('you');
      if (p.away) tags.push('away');
      if (tags.length) li.append(el('span', 'friends-player-tag', tags.join(' · ')));
      list.append(li);
    }
    for (let i = s.players.length; i < MAX_PLAYERS; i++) list.append(el('li', 'friends-player empty', 'Open seat'));
    box.append(list);

    if (s.role === 'host') {
      const chips = el('div', 'chips friends-starts');
      FRIEND_STARTS.forEach((p, i) => {
        const chip = button(`chip${i === this.start ? ' on' : ''}`, '', () => {
          this.start = i;
          this.render();
        });
        chip.append(el('span', 'chip-name', p.name));
        chips.append(chip);
      });
      box.append(el('div', 'title-label', 'Start at'), chips);
      const go = button('play friends-start', s.players.length > 1 ? 'Start round' : 'Start round alone', () => s.startRound(this.start));
      box.append(go);
    } else {
      box.append(el('p', 'friends-status', s.running ? 'A round is on. You join the next one.' : 'Waiting for the host to start the round.'));
    }
    const modes = s.transports;
    if (modes.length) box.append(el('p', 'friends-note', [...new Set(modes)].map((m) => TRANSPORT_WORDS[m] ?? m).join(', ')));
    if (this.error) box.append(el('p', 'friends-error', this.error));
    box.append(button('friends-leave', s.role === 'host' ? 'Close room' : 'Leave room', () => s.leave()));
    return box;
  }

  private fail(text: string): void {
    this.error = text;
    this.renderedKey = '';
    this.render();
  }
}
