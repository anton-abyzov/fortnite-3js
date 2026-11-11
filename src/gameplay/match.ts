import type { Character } from '../character/character';
import type { Game } from '../game';

/** Where the player is in the round. */
export type Stage = 'none' | 'aboard' | 'falling' | 'canopy' | 'ground' | 'over';

/**
 * One round, from the seaplane to the last survivor. It owns who is in the round; the drop, the
 * storm and the bots are systems it starts.
 */
export class Match {
  /** Everyone in the round, the player first. */
  readonly combatants: Character[] = [];
  /** Number of rounds started, so each one flies a different route. */
  round = 0;
  running = false;

  constructor(private readonly game: Game) {}

  /** Start a round: everyone boards the seaplane. */
  start(): void {
    const game = this.game;
    const player = game.ensurePlayer();
    this.round++;
    this.running = true;
    this.combatants.length = 0;
    for (const c of game.characters) this.combatants.push(c);
    player.health = player.maxHealth;
    player.alive = true;
    game.drop.begin(this.combatants, game.options.seed + this.round * 7919);
    // Look out over the wing, down toward the bay.
    game.camera.yaw = player.facing + 0.5;
    game.camera.pitch = -0.42;
    game.camera.snap();
    game.cameraOverride = false;
    game.input.setWantLock(true);
    game.setPhase('match');
  }

  /** Leave the round and put the seaplane away. */
  stop(): void {
    this.running = false;
    this.game.drop.clear();
  }

  get stage(): Stage {
    const p = this.game.player;
    if (!this.running || !p) return 'none';
    if (p.state === 'plane') return 'aboard';
    if (p.state === 'freefall') return 'falling';
    if (p.state === 'chute') return 'canopy';
    return p.alive ? 'ground' : 'over';
  }
}
