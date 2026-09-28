import { ROUNDS } from './rounds.js';
import { MODULES } from './modules/index.js';

const h = (tag, cls, html) => { const el = document.createElement(tag); if (cls) el.className = cls; if (html !== undefined) el.innerHTML = html; return el; };

const EDGE_HELP = `
<h2>먼저, 해체자에게 물어볼 수 있는 것</h2>
<div class="card edge-help">
<p class="muted">해체자 화면 맨 아래에 항상 떠 있는 정보다. 규칙이 이걸 자주 참조하니 필요할 때 물어본다.</p>
<dl>
<dt>시리얼</dt><dd>영문과 숫자 6자. 끝자리가 홀수인지 짝수인지, 모음(A, E, I, O, U)이 있는지가 중요하다.</dd>
<dt>배터리</dt><dd>0개에서 4개.</dd>
<dt>표시등</dt><dd>MSG, CTX, ACK, SYNC, ECHO 중 일부가 있고, 각각 켜짐(노란색) 또는 꺼짐이다. 없는 표시등은 꺼진 것으로 본다.</dd>
</dl></div>`;

function renderModule(type) {
  const mod = MODULES[type];
  const m = mod.manual();
  const root = h('section');
  root.append(h('h2', '', mod.name));
  root.append(h('p', 'muted', m.intro));
  if (m.sections) for (const s of m.sections) {
    const card = h('div', 'card');
    card.append(h('h3', '', s.title));
    for (const r of s.rows) { const row = h('div', 'rule'); row.append(h('div', 'c', r.cond), h('div', 'a', r.action)); card.append(row); }
    root.append(card);
  }
  if (m.columns) {
    const cols = h('div', 'cols');
    m.columns.forEach((c, i) => { const col = h('div', 'col'); col.append(h('strong', '', `${i + 1}열`)); c.forEach((s) => col.append(h('div', '', s))); cols.append(col); });
    root.append(cols);
  }
  if (m.lists) for (const l of m.lists) {
    const card = h('div', 'card'); card.append(h('h3', '', l.title));
    const w = h('div', 'words'); l.words.forEach((x) => w.append(h('div', '', x))); card.append(w); root.append(card);
  }
  if (m.steps) { const ol = h('ol', 'steps'); m.steps.forEach((s) => ol.append(h('li', '', s))); root.append(ol); }
  return root;
}

export function renderManual(roundId, rootEl) {
  const round = ROUNDS[roundId];
  rootEl.innerHTML = '';
  const tabs = h('div', 'tabs');
  const body = h('div');
  const types = ['edge', ...round.modules];
  const show = (t) => {
    [...tabs.children].forEach((b) => b.classList.toggle('on', b.dataset.t === t));
    body.innerHTML = '';
    body.append(t === 'edge' ? h('div', '', EDGE_HELP) : renderModule(t));
    window.scrollTo(0, 0);
  };
  for (const t of types) {
    const b = h('button', '', t === 'edge' ? '물어볼 것' : MODULES[t].name);
    b.dataset.t = t; b.onclick = () => show(t); tabs.append(b);
  }
  rootEl.append(tabs, body);
  show(types[0]);
}
