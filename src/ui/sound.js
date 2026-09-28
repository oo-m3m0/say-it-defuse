// 파일 없이 WebAudio로 합성하는 효과음. 첫 사용자 제스처 뒤 init()을 불러야 iOS에서 난다.
let ctx = null, enabled = true;
export function init() {
  try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); ctx.resume(); } catch { ctx = null; }
}
export function setEnabled(v) { enabled = v; }
const now = () => ctx.currentTime;
function tone(type, freq, dur, gain = 0.2, t = 0, slideTo) {
  if (!ctx || !enabled) return;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, now() + t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, now() + t + dur);
  g.gain.setValueAtTime(gain, now() + t); g.gain.exponentialRampToValueAtTime(0.001, now() + t + dur);
  o.connect(g).connect(ctx.destination); o.start(now() + t); o.stop(now() + t + dur + 0.05);
}
function noise(dur, gain = 0.3, filterFreq = 1000, type = 'lowpass', t = 0) {
  if (!ctx || !enabled) return;
  const len = Math.floor(ctx.sampleRate * dur), buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = buf; f.type = type; f.frequency.value = filterFreq; g.gain.value = gain;
  s.connect(f).connect(g).connect(ctx.destination); s.start(now() + t);
}
export const sfx = {
  tick: () => tone('square', 1400, 0.03, 0.05),
  beep: () => tone('sine', 880, 0.06, 0.12),
  click: () => { tone('square', 600, 0.02, 0.08); noise(0.03, 0.08, 3000, 'highpass'); },
  snip: () => { noise(0.08, 0.35, 2500, 'highpass'); tone('triangle', 300, 0.08, 0.1, 0, 90); },
  press: () => tone('sine', 220, 0.05, 0.15),
  solve: () => { tone('sine', 660, 0.12, 0.15); tone('sine', 990, 0.25, 0.15, 0.1); },
  strike: () => { tone('sawtooth', 110, 0.35, 0.25); tone('square', 82, 0.35, 0.15); },
  boom: () => { noise(1.6, 0.9, 400); tone('sine', 60, 1.2, 0.5, 0, 30); },
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone('sine', f, 0.3, 0.15, i * 0.12)),
  count: (last) => tone('sine', last ? 1320 : 880, last ? 0.4 : 0.1, 0.18),
};
