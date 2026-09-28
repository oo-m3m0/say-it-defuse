import { MODULES } from '../modules/index.js';
import { ACTIONS as BUTTON_ACTIONS } from '../modules/button.js';

const h = (tag, cls, html) => { const el = document.createElement(tag); if (cls) el.className = cls; if (html !== undefined) el.innerHTML = html; return el; };
const WIRE_HEX = { 주황: '#f28c28', 초록: '#3cae5c', 보라: '#8b5cf6', 하양: '#f4f4f0', 회색: '#8a8f99' };
const BTN_HEX = { 빨강: '#d9381e', 파랑: '#2563eb', 노랑: '#f5c400', 하양: '#f4f4f0' };

export function renderEdge(edge, el) {
  el.innerHTML = '';
  const s = h('div'); s.append(h('span', 'lbl', '시리얼'), h('div', 'serial', edge.serial));
  const b = h('div'); b.append(h('span', 'lbl', '배터리'), h('div', '', edge.batteries === 0 ? '없음' : '🔋'.repeat(edge.batteries)));
  const i = h('div'); i.append(h('span', 'lbl', '표시등'));
  const ind = h('div', 'ind');
  if (!edge.indicators.length) ind.append(h('span', '', '없음'));
  edge.indicators.forEach((x) => ind.append(h('span', x.on ? 'on' : '', x.label)));
  i.append(ind);
  el.append(s, b, i);
}

// hooks: { onSolve(moduleId), onStrike(moduleId) }
export function mountModule(m, facts, hooks) {
  const mod = MODULES[m.type];
  const card = h('section', 'mod'); card.dataset.id = m.id;
  card.append(h('h3', '', mod.name));
  const body = h('div', 'body'); card.append(body);
  const solved = () => { card.classList.add('done'); hooks.onSolve(m.id); };
  const strike = () => hooks.onStrike(m.id);
  const submit = (action) => (mod.check(m.state, facts, action) ? solved() : strike());
  RENDER[m.type](m.state, body, submit, strike, solved, mod, facts);
  return card;
}

const RENDER = {
  wires(state, body, submit) {
    state.items.forEach((c, i) => {
      const w = h('div', 'wire'); w.style.setProperty('--wc', WIRE_HEX[c]);
      w.append(h('span', 'n', `${i + 1}`));
      w.onclick = () => { if (w.classList.contains('cut')) return; w.classList.add('cut'); submit(i); };
      body.append(w);
    });
  },
  button(state, body, submit) {
    const b = h('button', 'bigbtn' + (state.color === '빨강' || state.color === '파랑' ? ' dark' : ''), state.label);
    b.style.background = BTN_HEX[state.color];
    const g = h('div', 'gauge'); g.style.setProperty('--p', 0); b.append(g);
    let t0 = 0, raf = 0, tapTimer = 0;
    const HOLD = 1500, DOUBLE = 400;
    const setP = (p) => g.style.setProperty('--p', Math.min(100, p));
    b.onpointerdown = (e) => { e.preventDefault(); b.setPointerCapture(e.pointerId); t0 = Date.now(); const loop = () => { setP(((Date.now() - t0) / HOLD) * 100); raf = requestAnimationFrame(loop); }; loop(); };
    b.onpointerup = () => {
      cancelAnimationFrame(raf); const dur = Date.now() - t0; setP(0);
      if (dur >= HOLD) return submit('hold');
      if (tapTimer) { clearTimeout(tapTimer); tapTimer = 0; return submit('double'); }
      tapTimer = setTimeout(() => { tapTimer = 0; submit('tap'); }, DOUBLE);
    };
    b.onpointercancel = () => { cancelAnimationFrame(raf); setP(0); };
    b.oncontextmenu = (e) => e.preventDefault();
    body.append(b, h('p', 'muted', Object.values(BUTTON_ACTIONS).join(' / ')));
  },
  keypad(state, body, submit, strike, solved, mod, facts) {
    const grid = h('div', 'keys'); let seq = [];
    const answer = mod.solve(state, facts);
    const reset = () => { seq = []; [...grid.children].forEach((k) => k.classList.remove('lit')); };
    state.items.forEach((s) => {
      const k = h('button', '', s);
      k.onclick = () => {
        if (k.classList.contains('lit')) return;
        if (answer[seq.length] !== s) { reset(); return strike(); }
        k.classList.add('lit'); seq.push(s);
        if (seq.length === answer.length) solved();
      };
      grid.append(k);
    });
    body.append(grid);
  },
  password(state, body, submit) {
    const pw = h('div', 'pw'); const idx = state.slots.map(() => 0);
    const chs = state.slots.map((slot, i) => {
      const s = h('div', 'slot'); const ch = h('div', 'ch', slot[0]);
      const up = h('button', '', '▲'), dn = h('button', '', '▼');
      const set = (d) => { idx[i] = (idx[i] + d + slot.length) % slot.length; ch.textContent = slot[idx[i]]; };
      up.onclick = () => set(-1); dn.onclick = () => set(1);
      s.append(up, ch, dn); pw.append(s); return ch;
    });
    const sb = h('button', 'submit', '제출');
    sb.onclick = () => submit(chs.map((c) => c.textContent).join(''));
    body.append(pw, sb);
  },
  dial(state, body, submit) {
    let v = state.start;
    const d = h('div', 'dial'); const val = h('div', 'v', v);
    const minus = h('button', '', '−'), plus = h('button', '', '+');
    minus.onclick = () => { v = (v + 9) % 10; val.textContent = v; };
    plus.onclick = () => { v = (v + 1) % 10; val.textContent = v; };
    d.append(minus, val, plus);
    const sb = h('button', 'submit', '확인'); sb.onclick = () => submit(v);
    body.append(d, sb);
  },
};
