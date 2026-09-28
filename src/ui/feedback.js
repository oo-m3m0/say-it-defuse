let ctx = null;
export function initAudio() {
  try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); ctx.resume(); } catch { ctx = null; }
}
export function strikeFeedback(flashEl, sound) {
  try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch {}
  flashEl.classList.add('on');
  setTimeout(() => flashEl.classList.remove('on'), 300);
  if (sound && ctx) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'square'; o.frequency.value = 180; g.gain.value = 0.15;
    o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.25);
  }
}
