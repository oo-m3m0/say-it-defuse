export const id = 'keypad';
export const name = '기호 키패드';
export const SYMBOLS = ['★', '☾', '☂', '♨', '⚑', '⌂', '♠', '♣', '♪', '☎', '✉', '⚓'];
// 열 3개 × 6기호. 열끼리 겹치는 기호가 2개 이하라 4개 조합은 정확히 한 열에만 있다.
export const COLUMNS = [
  [0, 1, 2, 3, 4, 5],
  [5, 6, 4, 7, 8, 9],
  [9, 10, 0, 11, 8, 1],
].map((col) => col.map((i) => SYMBOLS[i]));

export function generate(rng) {
  const col = rng.pick(COLUMNS);
  const chosen = rng.shuffle(col).slice(0, 4);
  return { items: rng.shuffle(chosen) };
}

// 정답: 눌러야 할 순서(기호 배열)
export function solve(state, facts) {
  const col = COLUMNS.find((c) => state.items.every((s) => c.includes(s)));
  const seq = col.filter((s) => state.items.includes(s));
  return facts.ECHO ? seq.slice().reverse() : seq;
}
export function check(state, facts, action) {
  const ans = solve(state, facts);
  return action.length === ans.length && action.every((s, i) => s === ans[i]);
}
export function enumerateActions(state) {
  const out = [];
  const perm = (rest, acc) => {
    if (!rest.length) return out.push(acc);
    rest.forEach((s, i) => perm(rest.filter((_, j) => j !== i), [...acc, s]));
  };
  perm(state.items, []);
  return out;
}
export function manual() {
  return {
    intro: '기호 4개가 있다. 아래 세 열 중 네 기호가 모두 들어 있는 열을 찾는다. 그 열에 적힌 순서(위에서 아래)대로 네 기호를 누른다. 단, ECHO 표시등이 켜져 있으면 반대 순서(아래에서 위)로 누른다.',
    columns: COLUMNS,
  };
}
