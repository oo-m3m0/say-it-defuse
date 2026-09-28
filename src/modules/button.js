import { firstMatch, describeCond } from '../conditions.js';

export const id = 'button';
export const name = '버튼';
export const COLORS = ['빨강', '파랑', '노랑', '하양'];
export const LABELS = ['전송', '대기', '확인', '취소'];
export const ACTIONS = { tap: '한 번 짧게 누른다', double: '빠르게 두 번 누른다', hold: '게이지가 다 찰 때까지 길게 누른다' };

export const rules = [
  { cond: { type: 'all', of: [{ type: 'prop', key: 'label', label: '버튼 글자', value: '전송' }, { type: 'batteries', op: '>=', n: 2 }] }, action: 'double' },
  { cond: { type: 'all', of: [{ type: 'prop', key: 'color', label: '버튼 색', value: '파랑' }, { type: 'indicator', label: 'ACK' }] }, action: 'hold' },
  { cond: { type: 'prop', key: 'label', label: '버튼 글자', value: '대기' }, action: 'hold' },
  { cond: { type: 'all', of: [{ type: 'batteries', op: '==', n: 0 }, { type: 'edge', fact: 'serialLastOdd' }] }, action: 'double' },
  { cond: { type: 'else' }, action: 'tap' },
];

export function generate(rng) {
  return { color: rng.pick(COLORS), label: rng.pick(LABELS) };
}
export function solve(state, facts) {
  return firstMatch(rules, { facts, state });
}
export function check(state, facts, action) {
  return action === solve(state, facts);
}
export function enumerateActions() {
  return Object.keys(ACTIONS);
}
export function manual() {
  return {
    intro: '버튼은 색과 글자가 있다. 누르는 방법은 세 가지다. 한 번 짧게, 빠르게 두 번, 길게(원형 게이지가 다 찰 때까지 누른 뒤 손을 뗀다). 규칙은 위에서부터 읽고 처음 해당하는 줄만 따른다.',
    sections: [{ title: '누르는 방법', rows: rules.map((r) => ({ cond: describeCond(r.cond), action: ACTIONS[r.action] })) }],
  };
}
