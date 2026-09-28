import { ROUNDS } from './rounds.js';
import { MODULES } from './modules/index.js';

const h = (tag, cls, html) => { const el = document.createElement(tag); if (cls) el.className = cls; if (html !== undefined) el.innerHTML = html; return el; };
const fig = (svg, cap) => { const f = h('figure', 'fig', svg); f.append(h('figcaption', '', cap)); f.style.margin = '14px 0'; return f; };

// 해체자 화면이 어떻게 생겼는지 전문가에게 보여주는 그림. 실제 인스턴스 정보는 없다.
const FIGS = {
  edge: `<svg viewBox="0 0 320 90"><rect x="1" y="1" width="318" height="88" rx="8" fill="#1a1c21" stroke="#333"/>
    <text x="14" y="20" font-family="monospace" font-size="8" fill="#999">SERIAL</text><rect x="14" y="26" width="86" height="28" rx="2" fill="#f1eee4" transform="rotate(-1.5 57 40)"/><text x="22" y="46" font-family="monospace" font-size="15" fill="#111" letter-spacing="2">K7M2Q9</text>
    <text x="120" y="20" font-family="monospace" font-size="8" fill="#999">BATTERIES</text><rect x="120" y="28" width="80" height="24" rx="4" fill="#0f1013"/><rect x="126" y="34" width="22" height="12" rx="2" fill="#ccc"/><rect x="152" y="34" width="22" height="12" rx="2" fill="#ccc"/>
    <text x="222" y="20" font-family="monospace" font-size="8" fill="#999">INDICATORS</text>
    <circle cx="238" cy="38" r="6" fill="#ffb020"/><text x="238" y="58" font-family="monospace" font-size="8" fill="#f1d9a0" text-anchor="middle">CTX</text>
    <circle cx="276" cy="38" r="6" fill="#3a2c10" stroke="#000"/><text x="276" y="58" font-family="monospace" font-size="8" fill="#999" text-anchor="middle">SYNC</text></svg>`,
  wires: `<svg viewBox="0 0 320 120"><rect x="1" y="1" width="318" height="118" rx="8" fill="#1a1c21" stroke="#333"/>
    ${['#ff8a2a', '#f4f2ea', '#9b6bff'].map((c, i) => `<text x="14" y="${34 + i * 32}" font-family="monospace" font-size="9" fill="#999">${i + 1}</text><rect x="28" y="${24 + i * 32}" width="14" height="12" rx="2" fill="#bbb"/><rect x="278" y="${24 + i * 32}" width="14" height="12" rx="2" fill="#bbb"/><line x1="42" y1="${30 + i * 32}" x2="278" y2="${30 + i * 32}" stroke="${c}" stroke-width="9" stroke-linecap="round"/>`).join('')}</svg>`,
  button: `<svg viewBox="0 0 320 130"><rect x="1" y="1" width="318" height="128" rx="8" fill="#1a1c21" stroke="#333"/>
    <circle cx="160" cy="65" r="50" fill="#15171b"/><circle cx="160" cy="62" r="36" fill="#2f6df0"/><text x="160" y="68" text-anchor="middle" font-size="16" font-weight="800" fill="#fff">전송</text>
    <text x="230" y="50" font-size="9" fill="#999">색: 빨강 / 파랑 / 노랑 / 하양</text><text x="230" y="66" font-size="9" fill="#999">글자: 전송 / 대기 / 확인 / 취소</text>
    <text x="230" y="90" font-size="9" fill="#35e07a">길게 누르면 초록 게이지가 찬다</text></svg>`,
  keypad: `<svg viewBox="0 0 320 120"><rect x="1" y="1" width="318" height="118" rx="8" fill="#1a1c21" stroke="#333"/>
    ${[['★', 70, 40], ['♨', 160, 40], ['☂', 70, 90], ['⚑', 160, 90]].map(([s, x, y]) => `<rect x="${x - 40}" y="${y - 22}" width="80" height="44" rx="6" fill="#2a2d34" stroke="#000"/><text x="${x}" y="${y + 8}" text-anchor="middle" font-size="22" fill="#eee">${s}</text>`).join('')}
    <text x="222" y="50" font-size="9" fill="#999">기호 4개가 2×2로 있다.</text><text x="222" y="66" font-size="9" fill="#999">순서대로 누르면 불이 켜진다.</text><text x="222" y="82" font-size="9" fill="#ff3b2f">틀리면 처음부터 다시.</text></svg>`,
  password: `<svg viewBox="0 0 320 110"><rect x="1" y="1" width="318" height="108" rx="8" fill="#1a1c21" stroke="#333"/>
    ${[0, 1, 2, 3].map((i) => `<rect x="${20 + i * 48}" y="14" width="40" height="16" rx="3" fill="#2a2d34"/><text x="${40 + i * 48}" y="26" text-anchor="middle" font-size="9" fill="#ccc">▲</text><rect x="${20 + i * 48}" y="34" width="40" height="40" rx="3" fill="#0b0c0e"/><text x="${40 + i * 48}" y="61" text-anchor="middle" font-size="20" font-weight="800" fill="#eee">${'맥락공유'[i]}</text><rect x="${20 + i * 48}" y="78" width="40" height="16" rx="3" fill="#2a2d34"/><text x="${40 + i * 48}" y="90" text-anchor="middle" font-size="9" fill="#ccc">▼</text>`).join('')}
    <text x="222" y="40" font-size="9" fill="#999">칸마다 글자 6개가 돈다.</text><text x="222" y="56" font-size="9" fill="#999">네 글자를 맞추고 제출.</text></svg>`,
  dial: `<svg viewBox="0 0 320 120"><rect x="1" y="1" width="318" height="118" rx="8" fill="#1a1c21" stroke="#333"/>
    <circle cx="100" cy="62" r="34" fill="#2a2d34" stroke="#000"/><polygon points="100,34 104,44 96,44" fill="#ffb020"/><text x="100" y="68" text-anchor="middle" font-family="monospace" font-size="16" fill="#eee">4</text>
    ${Array.from({ length: 10 }, (_, n) => { const a = (-135 + n * 30) * Math.PI / 180; return `<text x="${100 + 48 * Math.sin(a)}" y="${66 - 48 * Math.cos(a)}" text-anchor="middle" font-family="monospace" font-size="8" fill="#999">${n}</text>`; }).join('')}
    <text x="170" y="52" font-size="9" fill="#999">0부터 9까지 돌아가는 노브.</text><text x="170" y="68" font-size="9" fill="#999">− + 로 돌리고 확인을 누른다.</text></svg>`,
};

const ASK = {
  wires: ['"전선이 몇 가닥이야? 위에서부터 색을 순서대로 읽어줘."', '"시리얼 끝자리 숫자가 뭐야?" (홀짝)', '"배터리 몇 개야?", "CTX 불 켜져 있어?"'],
  button: ['"버튼이 무슨 색이고 뭐라고 써 있어?"', '"배터리 몇 개야?", "ACK 불 켜져 있어?"', '"시리얼 끝자리 숫자가 뭐야?"'],
  keypad: ['"기호 네 개를 하나씩 설명해줘." (별, 우산, 달, 닻처럼 이름을 정해 두면 빠르다)', '"ECHO 표시등 있어? 켜져 있어?"'],
  password: ['"시리얼에 영어 모음(A, E, I, O, U)이 있어?"', '"첫째 칸에 나오는 글자들을 다 읽어줘."'],
  dial: ['"배터리 몇 개야?"', '"SYNC 불 켜져 있어?", "MSG 불 켜져 있어?"', '"시리얼 끝자리가 홀수야 짝수야?"'],
};

function renderEdgePage() {
  const p = h('section', 'page');
  p.append(h('h2', '', '<span class="no">§0</span> 먼저, 해체자에게 물어볼 것'));
  p.append(h('p', 'intro', '해체자 화면 맨 아래에 항상 붙어 있는 패널이다. 규칙이 이걸 자주 참조한다. 해체자는 이게 중요한지 모른다. 전문가가 먼저 물어야 한다.'));
  p.append(fig(FIGS.edge, 'FIG 0. 장치 하단 패널 (예시)'));
  p.append(h('dl', 'edge-list', `
    <dt>시리얼 (Serial)</dt><dd>영문과 숫자 6자. 끝자리는 항상 숫자. 규칙은 끝자리가 홀수인지 짝수인지, 모음(A, E, I, O, U)이 들어 있는지를 본다.</dd>
    <dt>배터리 (Batteries)</dt><dd>0개에서 4개.</dd>
    <dt>표시등 (Indicators)</dt><dd>MSG, CTX, ACK, SYNC, ECHO 중 일부만 달려 있다. 각각 켜짐(노란 불) 또는 꺼짐. 달려 있지 않은 표시등은 꺼진 것으로 본다.</dd>`));
  const a = h('div', 'ask', '<strong>QUESTIONS</strong>'); const ul = h('ul');
  ['"시리얼 여섯 글자를 하나씩 읽어줘."', '"배터리 몇 개 꽂혀 있어?"', '"표시등에 뭐라고 써 있고, 불 켜진 게 있어?"'].forEach((q) => ul.append(h('li', '', q)));
  a.append(ul); p.append(a);
  return p;
}

function renderModule(type, no) {
  const mod = MODULES[type];
  const m = mod.manual();
  const p = h('section', 'page');
  p.append(h('h2', '', `<span class="no">§${no}</span> ${mod.name}`));
  p.append(h('p', 'intro', m.intro));
  p.append(fig(FIGS[type], `FIG ${no}. 해체자에게 보이는 ${mod.name} 모듈 (예시)`));
  if (m.sections) for (const s of m.sections) {
    p.append(h('h3', '', s.title));
    s.rows.forEach((r, i) => { const row = h('div', 'rule' + (r.cond.startsWith('위 어느') ? ' else' : '')); row.append(h('div', 'n', `${i + 1}.`), h('div', 'c', r.cond), h('div', 'a', r.action)); p.append(row); });
  }
  if (m.columns) {
    p.append(h('h3', '', '기호 열'));
    const cols = h('div', 'cols');
    m.columns.forEach((c, i) => { const col = h('div', 'col'); col.append(h('strong', '', `${i + 1}열`)); c.forEach((s, j) => { const d = h('div', '', s); d.dataset.i = j + 1; col.append(d); }); cols.append(col); });
    p.append(cols);
  }
  if (m.lists) for (const l of m.lists) {
    p.append(h('h3', '', l.title));
    const w = h('div', 'words'); l.words.forEach((x, i) => { const d = h('div', '', x); d.dataset.i = String(i + 1).padStart(2, '0'); w.append(d); }); p.append(w);
  }
  if (m.steps) { p.append(h('h3', '', '계산 순서')); const ol = h('ol', 'steps'); m.steps.forEach((s) => ol.append(h('li', '', s))); p.append(ol); }
  const a = h('div', 'ask', '<strong>QUESTIONS</strong>'); const ul = h('ul');
  ASK[type].forEach((q) => ul.append(h('li', '', q))); a.append(ul); p.append(a);
  return p;
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
    body.append(t === 'edge' ? renderEdgePage() : renderModule(t, round.modules.indexOf(t) + 1));
    body.append(h('div', 'foot', `MANUAL v1.0 · ${roundId} · ${round.modules.length} MODULES · ${round.seconds / 60}:00`));
    window.scrollTo({ top: tabs.offsetTop - 4 });
  };
  for (const t of types) {
    const b = h('button', '', t === 'edge' ? '§0 물어볼 것' : `§${round.modules.indexOf(t) + 1} ${MODULES[t].name}`);
    b.dataset.t = t; b.onclick = () => show(t); tabs.append(b);
  }
  rootEl.append(tabs, body);
  show(types[0]);
}
