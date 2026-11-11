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
}

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
    }),
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
