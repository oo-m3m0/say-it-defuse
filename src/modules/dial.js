export const id = 'dial';
export const name = '다이얼';
// 절차형 규칙. 순서대로 계산한다.
export const STEPS = [
  { text: '배터리 개수에서 시작한다', apply: (v, f) => f.batteries },
  { text: 'SYNC 표시등이 켜져 있으면 3을 더한다', apply: (v, f) => (f.SYNC ? v + 3 : v) },
  { text: '시리얼 끝자리가 짝수면 2를 곱한다', apply: (v, f) => (f.serialLastEven ? v * 2 : v) },
  { text: 'MSG 표시등이 켜져 있으면 1을 더한다', apply: (v, f) => (f.MSG ? v + 1 : v) },
  { text: '결과의 일의 자리 숫자에 다이얼을 맞추고 확인을 누른다', apply: (v) => v % 10 },
];

export function generate(rng) {
  return { start: rng.int(10) };
}
export function solve(state, facts) {
  return STEPS.reduce((v, s) => s.apply(v, facts), 0);
}
export function check(state, facts, action) {
  return action === solve(state, facts);
}
export function enumerateActions() {
  return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
}
export function manual() {
  return { intro: '다이얼은 0부터 9까지 돌아간다. 아래 순서대로 계산한다.', steps: STEPS.map((s) => s.text) };
}
