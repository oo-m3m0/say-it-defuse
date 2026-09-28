import { firstMatch, describeCond } from '../conditions.js';

export const id = 'wires';
export const name = '전선';
export const COLORS = ['주황', '초록', '보라', '하양', '회색'];

// action: { index: n } 은 1부터 세는 번호, -1은 마지막. { colorLast: c } 는 그 색 중 마지막, { colorFirst: c } 는 첫 번째.
export const rules = {
  3: [
    { cond: { type: 'count', value: '보라', op: '==', n: 0 }, action: { index: 1 } },
    { cond: { type: 'all', of: [{ type: 'count', value: '보라', op: '==', n: 1 }, { type: 'edge', fact: 'serialLastOdd' }] }, action: { colorFirst: '보라' } },
    { cond: { type: 'last', value: '하양' }, action: { index: 2 } },
    { cond: { type: 'else' }, action: { index: -1 } },
  ],
  4: [
    { cond: { type: 'all', of: [{ type: 'count', value: '초록', op: '>=', n: 2 }, { type: 'batteries', op: '>=', n: 2 }] }, action: { colorLast: '초록' } },
    { cond: { type: 'all', of: [{ type: 'count', value: '회색', op: '==', n: 0 }, { type: 'indicator', label: 'CTX' }] }, action: { index: 3 } },
    { cond: { type: 'count', value: '주황', op: '<=', n: 1 }, action: { index: 1 } },
    { cond: { type: 'else' }, action: { index: 2 } },
  ],
  5: [
    { cond: { type: 'all', of: [{ type: 'last', value: '회색' }, { type: 'edge', fact: 'serialHasVowel' }] }, action: { index: 4 } },
    { cond: { type: 'count', value: '보라', op: '==', n: 1 }, action: { index: 1 } },
    { cond: { type: 'count', value: '하양', op: '==', n: 0 }, action: { index: -1 } },
    { cond: { type: 'else' }, action: { index: 3 } },
  ],
};

export function generate(rng, edge, level) {
  const n = Math.min(5, 2 + level);
  const items = [];
  for (let i = 0; i < n; i++) items.push(rng.pick(COLORS));
  return { items };
}

// 정답: 잘라야 할 전선의 0-based 인덱스
export function solve(state, facts) {
  const a = firstMatch(rules[state.items.length], { facts, state });
  const items = state.items;
  if (a.index !== undefined) return a.index === -1 ? items.length - 1 : a.index - 1;
  if (a.colorFirst) return items.indexOf(a.colorFirst);
  if (a.colorLast) return items.lastIndexOf(a.colorLast);
  throw new Error('bad action');
}

export function check(state, facts, action) {
  return action === solve(state, facts);
}

export function enumerateActions(state) {
  return state.items.map((_, i) => i);
}

export function describeAction(a) {
  if (a.index !== undefined) return a.index === -1 ? '마지막 전선을 자른다' : `${a.index}번째 전선을 자른다`;
  if (a.colorFirst) return `첫 번째 ${a.colorFirst} 전선을 자른다`;
  if (a.colorLast) return `마지막 ${a.colorLast} 전선을 자른다`;
}

// 매뉴얼용: [{ title, rows: [{ cond, action }] }]
export function manual() {
  return {
    intro: '전선은 위에서 아래로 1번, 2번, ... 순서로 센다. 규칙은 위에서부터 읽고, 처음으로 해당하는 줄 하나만 따른다. 전선은 딱 한 가닥만 잘라야 한다.',
    sections: [3, 4, 5].map((n) => ({
      title: `전선이 ${n}가닥일 때`,
      rows: rules[n].map((r) => ({ cond: describeCond(r.cond, '전선'), action: describeAction(r.action) })),
    })),
  };
}
