import type { Game } from '../game';

/**
 * Test and tooling surface on `window.__eyewall`.
 * Automated checks read game state here; they still drive the game with real keyboard and mouse events.
 */
export interface DebugApi {
  game: Game;
  ready: boolean;
  errors: string[];
  state(): Record<string, unknown>;
  /** Park the camera at a point looking at another, for screenshots. */
  view(x: number, y: number, z: number, tx: number, ty: number, tz: number): void;
  releaseView(): void;
  setHour(hour: number): void;
  /** What is at a map position: surface type, heights and the physics ground under the sky. */
  probe(x: number, z: number): WorldProbe;
  /** Counts that describe the generated city. */
  census(): Record<string, number>;
}

export interface WorldProbe {
  /** Cell type name from the world field. */
  type: string;
  water: boolean;
  /** Field height: ground, deck or roof top. */
  height: number;
  /** First solid surface below y = 400, from a physics ray. -1000 when nothing is hit. */
  ground: number;
  /** Water surface height right now. */
  wave: number;
  shore: number;
}

const CELL_NAMES = ['water', 'road', 'sidewalk', 'building', 'sand', 'grass', 'plaza', 'pier', 'bridge', 'yard', 'pool', 'lot'];

declare global {
  interface Window {
    __eyewall?: DebugApi;
  }
}

export function installDebug(game: Game): DebugApi {
  const api: DebugApi = {
    game,
    ready: false,
    errors: game.errors,
    state: () => ({
      phase: game.phase,
      time: game.engine?.time ?? 0,
      fps: game.engine?.fps ?? 0,
      frames: game.engine?.frameCount ?? 0,
      renderer: rendererName(game),
      drawCalls: game.engine?.renderer.info.render.calls ?? 0,
      triangles: game.engine?.renderer.info.render.triangles ?? 0,
      hour: game.world?.sky.hour ?? 0,
      night: game.world?.sky.night ?? 0,
    }),
    view: (x, y, z, tx, ty, tz) => {
      game.cameraOverride = true;
      game.engine.camera.position.set(x, y, z);
      game.viewTarget.set(tx, ty, tz);
      game.engine.camera.lookAt(game.viewTarget);
    },
    releaseView: () => {
      game.cameraOverride = false;
    },
    setHour: (hour) => game.world.setHour(hour),
    probe: (x, z) => {
      const w = game.world;
      return {
        type: CELL_NAMES[w.field.typeAt(x, z)] ?? 'unknown',
        water: w.field.isWater(x, z),
        height: w.field.heightAt(x, z),
        ground: game.physics.groundHeight(x, 400, z, 500, -1000),
        wave: w.water.height(x, z),
        shore: w.field.shoreDistance(x, z),
      };
    },
    census: () => {
      const w = game.world;
      const l = w.layout;
      return {
        buildings: w.city.buildings.length,
        palms: w.props.palms.length,
        lamps: w.props.lamps.length,
        bridges: l.segments.filter((r) => r.bridge).length,
        roads: l.segments.length,
        piers: l.piers.length,
        shops: l.lots.filter((x) => x.use === 'shop').length,
        pois: l.pois.length,
        colliders: game.physics.world.colliders.len(),
      };
    },
  };
  window.__eyewall = api;
  return api;
}

function rendererName(game: Game): string {
  const gl = game.engine?.renderer.getContext();
  if (!gl) return 'none';
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  return String(ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
}
