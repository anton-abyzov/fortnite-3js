/**
 * A piece of the game that runs in the loop: vehicles, traffic, shops, bots, effects.
 * Register it with `game.addSystem(system)`.
 */
export interface GameSystem {
  /** Fixed 60 Hz step, before physics: read input edges, apply forces, move kinematic things. */
  fixedUpdate?(dt: number): void;
  /** Fixed step, right after physics: read back what the physics did. */
  postPhysics?(dt: number): void;
  /** Once per rendered frame. `alpha` is how far the frame is between the last two fixed steps. */
  frameUpdate?(dt: number, alpha: number): void;
  dispose?(): void;
}
