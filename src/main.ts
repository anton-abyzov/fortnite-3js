import './ui/styles.css';
import { installDebug } from './core/debug';
import { Game } from './game';
import { Shell } from './ui/shell';

const canvas = document.getElementById('game') as HTMLCanvasElement;
const boot = document.getElementById('boot')!;
const bootFill = document.getElementById('boot-fill')!;
const bootText = document.getElementById('boot-text')!;

const params = new URLSearchParams(location.search);
const game = new Game(canvas, { seed: Number(params.get('seed') ?? 1977) || 1977 });
const debug = installDebug(game);

window.addEventListener('error', (e) => game.errors.push(String(e.message)));
window.addEventListener('unhandledrejection', (e) => game.errors.push(String(e.reason)));

function progress(fraction: number, label: string): void {
  bootFill.style.width = `${Math.round(fraction * 100)}%`;
  bootText.textContent = label;
}

game
  .init(progress)
  .then(() => {
    boot.classList.add('hidden');
    new Shell(game, document.getElementById('ui')!);
    // Development shortcut: ?at=x,z,yaw starts on foot at a map position.
    const at = params.get('at');
    if (at) {
      const [x, z, yaw] = at.split(',').map(Number);
      game.startAt(x ?? 0, z ?? 0, yaw ?? 0);
      game.input.freeLook = params.has('freelook');
    }
    debug.ready = true;
  })
  .catch((err: unknown) => {
    console.error(err);
    game.errors.push(String(err));
    bootText.textContent = `Could not start: ${String(err)}`;
  });
