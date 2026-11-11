import './ui/styles.css';
import { SunbreakGame } from './game/sunbreak-game';

const container = document.getElementById('app');
if (!container) {
  throw new Error('Missing #app mount element');
}

const game = new SunbreakGame(container);
game.init().catch((err) => {
  console.error('Failed to initialize Sunbreak: Biscayne', err);
});
