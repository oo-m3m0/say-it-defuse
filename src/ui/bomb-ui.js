import { MODULES } from '../modules/index.js';
import { sfx } from './sound.js';

const h = (tag, cls, html) => { const el = document.createElement(tag); if (cls) el.className = cls; if (html !== undefined) el.innerHTML = html; return el; };
const svg = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; };
const WIRE_HEX = { 주황: '#ff8a2a', 초록: '#3ec26a', 보라: '#9b6bff', 하양: '#f4f2ea', 회색: '#7d838f' };
const BTN_HEX = { 빨강: ['#e63b25', '#8f1f12'], 파랑: ['#2f6df0', '#183b8a'], 노랑: ['#ffcf2e', '#a37f0a'], 하양: ['#f4f2ea', '#9a978d'] };

export function renderEdge(edge, el) {
  const panel = h('div', 'panel');
  const s = h('div'); s.append(h('span', 'lbl', 'Serial'), h('div', 'sticker', edge.serial));
  const b = h('div'); b.append(h('span', 'lbl', 'Batteries'));
  const batts = h('div', 'batts');
  if (!edge.batteries) batts.append(h('span', 'none', '없음'));
  for (let i = 0; i < edge.batteries; i++) batts.append(h('i', 'batt'));
  b.append(batts);
  const i = h('div'); i.append(h('span', 'lbl', 'Indicators'));
  const lamps = h('div', 'lamps');
  if (!edge.indicators.length) lamps.append(h('span', 'none', '없음'));
  edge.indicators.forEach((x) => { const l = h('div', 'lamp' + (x.on ? ' on' : '')); l.append(h('i'), h('span', '', x.label)); lamps.append(l); });
  i.append(lamps);
  panel.append(s, b, i);
  el.innerHTML = ''; el.append(panel);
}

// hooks: { onSolve(moduleId), onStrike(moduleId) }
export function mountModule(m, facts, hooks) {
  const mod = MODULES[m.type];
  const card = h('section', 'mod'); card.dataset.id = m.id;
  const title = h('h3', '', `<span>${mod.name}</span>`); title.append(h('i', 'led'));
  const body = h('div', 'body');
  card.append(title, body, h('div', 'scr'));
  const solved = () => { card.classList.add('done'); sfx.solve(); hooks.onSolve(m.id); };
  const strike = () => hooks.onStrike(m.id);
  const submit = (action) => (mod.check(m.state, facts, action) ? solved() : strike());
  RENDER[m.type](m.state, body, submit, strike, solved, mod, facts);
  return card;
}

const RENDER = {
  wires(state, body, submit) {
    const box = h('div', 'wires');
    state.items.forEach((c, i) => {
      const w = svg(`<svg class="wire" viewBox="0 0 320 46" preserveAspectRatio="none" style="--wc:${WIRE_HEX[c]}">
        <text class="num" x="4" y="28">${i + 1}</text>
        <rect class="term" x="18" y="16" width="18" height="14" rx="2"/><rect class="term" x="284" y="16" width="18" height="14" rx="2"/>
        <g class="full"><path class="core" d="M36 23 L 284 23"/><path class="sheen" d="M42 20 L 278 20"/></g>
        <g class="l"><path class="core" d="M36 23 L 158 23"/><path class="sheen" d="M42 20 L 154 20"/></g>
        <g class="r"><path class="core" d="M162 23 L 284 23"/><path class="sheen" d="M166 20 L 278 20"/></g>
        <circle class="spark" cx="160" cy="23" r="2"/></svg>`);
      w.setAttribute('preserveAspectRatio', 'none');
      w.addEventListener('click', () => { if (w.classList.contains('cut')) return; w.classList.add('cut'); sfx.snip(); submit(i); });
      box.append(w);
    });
    body.append(box, h('p', 'hint', '전선을 누르면 잘린다. 되돌릴 수 없다.'));
  },
  button(state, body, submit) {
    const [bc, bcd] = BTN_HEX[state.color];
    const wrap = h('div', 'btnwrap'); const bezel = h('div', 'bezel');
    const b = h('button', 'bigbtn' + (state.color === '빨강' || state.color === '파랑' ? ' dark' : ''), state.label);
    b.style.setProperty('--bc', bc); b.style.setProperty('--bcd', bcd);
    const g = h('div', 'gauge'); g.style.setProperty('--p', 0);
    bezel.append(g, b); wrap.append(bezel);
    let t0 = 0, raf = 0, tapTimer = 0, down = false;
    const HOLD = 1500, DOUBLE = 400;
    const setP = (p) => g.style.setProperty('--p', Math.min(100, p));
    b.onpointerdown = (e) => { e.preventDefault(); b.setPointerCapture(e.pointerId); down = true; b.classList.add('pressed'); sfx.press(); t0 = Date.now(); const loop = () => { if (!down) return; setP(((Date.now() - t0) / HOLD) * 100); raf = requestAnimationFrame(loop); }; loop(); };
    b.onpointerup = () => {
      if (!down) return; down = false; b.classList.remove('pressed'); cancelAnimationFrame(raf); const dur = Date.now() - t0; setP(0);
      if (dur >= HOLD) return submit('hold');
      if (tapTimer) { clearTimeout(tapTimer); tapTimer = 0; return submit('double'); }
      tapTimer = setTimeout(() => { tapTimer = 0; submit('tap'); }, DOUBLE);
    };
    b.onpointercancel = () => { down = false; b.classList.remove('pressed'); cancelAnimationFrame(raf); setP(0); };
    b.oncontextmenu = (e) => e.preventDefault();
    body.append(wrap, h('p', 'hint', '한 번 / 빠르게 두 번 / 게이지가 찰 때까지 길게'));
  },
  keypad(state, body, submit, strike, solved, mod, facts) {
    const grid = h('div', 'keys'); let seq = [];
    const answer = mod.solve(state, facts);
    const reset = () => { seq = []; [...grid.children].forEach((k) => k.classList.remove('lit')); };
    state.items.forEach((s) => {
      const k = h('button', 'key', s);
      k.onclick = () => {
        if (k.classList.contains('lit')) return;
        sfx.click();
        if (answer[seq.length] !== s) { reset(); return strike(); }
        k.classList.add('lit'); seq.push(s);
        if (seq.length === answer.length) solved();
      };
      grid.append(k);
    });
    body.append(grid, h('p', 'hint', '순서대로 네 개를 누른다'));
  },
  password(state, body, submit) {
    const pw = h('div', 'pw'); const idx = state.slots.map(() => 0);
    const chs = state.slots.map((slot, i) => {
      const r = h('div', 'roller'); const win = h('div', 'win'); const ch = h('div', 'ch', slot[0]); win.append(ch);
      const up = h('button', '', '▲'), dn = h('button', '', '▼');
      const set = (d) => { idx[i] = (idx[i] + d + slot.length) % slot.length; ch.style.transform = `translateY(${d * -14}px)`; ch.style.opacity = 0; setTimeout(() => { ch.textContent = slot[idx[i]]; ch.style.transform = ''; ch.style.opacity = 1; }, 90); sfx.tick(); };
      up.onclick = () => set(-1); dn.onclick = () => set(1);
      r.append(up, win, dn); pw.append(r); return { get: () => slot[idx[i]] };
    });
    const sb = h('button', 'submit', '제출');
    sb.onclick = () => { sfx.click(); submit(chs.map((c) => c.get()).join('')); };
    body.append(pw, sb);
  },
  dial(state, body, submit) {
    let v = state.start;
    const wrap = h('div', 'dialwrap');
    const ticks = Array.from({ length: 10 }, (_, n) => { const a = (-135 + n * 30) * Math.PI / 180; const x1 = 75 + 62 * Math.sin(a), y1 = 75 - 62 * Math.cos(a), x2 = 75 + 54 * Math.sin(a), y2 = 75 - 54 * Math.cos(a), tx = 75 + 70 * Math.sin(a), ty = 75 - 70 * Math.cos(a) + 4; return `<line class="tick" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/><text class="tnum" x="${tx}" y="${ty}">${n}</text>`; }).join('');
    const knob = h('div', 'knob');
    const s = svg(`<svg viewBox="0 0 150 150"><defs><radialGradient id="kg" cx="40%" cy="35%"><stop offset="0" stop-color="#4a4e58"/><stop offset="1" stop-color="#1c1e24"/></radialGradient></defs>${ticks}<g class="rot"><circle class="cap" cx="75" cy="75" r="46"/><polygon class="ptr" points="75,33 80,46 70,46"/></g></svg>`);
    const cur = h('div', 'cur', v);
    knob.append(s, cur);
    const rot = s.querySelector('.rot');
    const draw = () => { rot.style.transform = `rotate(${-135 + v * 30}deg)`; cur.textContent = v; };
    draw();
    const minus = h('button', '', '−'), plus = h('button', '', '+');
    minus.onclick = () => { v = (v + 9) % 10; sfx.tick(); draw(); };
    plus.onclick = () => { v = (v + 1) % 10; sfx.tick(); draw(); };
    wrap.append(minus, knob, plus);
    const sb = h('button', 'submit', '확인'); sb.onclick = () => { sfx.click(); submit(v); };
    body.append(wrap, sb);
  },
};
