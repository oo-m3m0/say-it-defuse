import { sfx } from './sound.js';
export function strikeFeedback(flashEl) {
  try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch {}
  flashEl.classList.add('on');
  document.body.classList.add('shake');
  setTimeout(() => { flashEl.classList.remove('on'); document.body.classList.remove('shake'); }, 400);
  sfx.strike();
}
