import './ui/styles.css';
import { installDebug } from './core/debug';
import { Game } from './game';

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
    debug.ready = true;
  })
  .catch((err: unknown) => {
    console.error(err);
    game.errors.push(String(err));
    bootText.textContent = `Could not start: ${String(err)}`;
  });
