export const id = 'password';
export const name = '비밀번호';
export const LIST_A = ['적극경청', '맥락공유', '명확전달', '상호존중', '질문먼저', '결론부터', '근거제시', '요약확인', '의도파악', '반복확인', '핵심정리', '배경설명', '단어통일', '우선순위', '공동목표', '열린질문'];
export const LIST_B = ['정보공유', '기대수준', '역할분담', '진행상황', '기준합의', '사실확인', '감정인정', '관점차이', '속도조절', '순서정리', '예시제시', '오해방지', '기록남김', '약속이행', '목적확인', '방향정렬'];
const POOL = [...new Set([...LIST_A, ...LIST_B].join('').split(''))];
const SLOTS = 4, CANDS = 6;

function listFor(facts) {
  return facts.serialHasVowel ? LIST_A : LIST_B;
}
function buildable(word, slots) {
  return word.split('').every((ch, i) => slots[i].includes(ch));
}

export function generate(rng, edge, level, facts) {
  const list = listFor(facts);
  const answer = rng.pick(list);
  // 만들 수 있는 목록 단어가 정답 하나뿐일 때까지 후보를 다시 뽑는다
  for (let tries = 0; tries < 100; tries++) {
    const slots = answer.split('').map((ch) => {
      const others = rng.shuffle(POOL.filter((c) => c !== ch)).slice(0, CANDS - 1);
      return rng.shuffle([ch, ...others]);
    });
    if (list.filter((w) => buildable(w, slots)).length === 1) return { slots };
  }
  throw new Error('password: no unique candidate set');
}
export function solve(state, facts) {
  return listFor(facts).find((w) => buildable(w, state.slots));
}
export function check(state, facts, action) {
  return action === solve(state, facts);
}
export function enumerateActions(state) {
  const out = [];
  const rec = (i, acc) => {
    if (i === SLOTS) return out.push(acc);
    for (const ch of state.slots[i]) rec(i + 1, acc + ch);
  };
  rec(0, '');
  return out;
}
export function manual() {
  return {
    intro: '네 칸에 글자를 맞춰 네 글자 단어를 만든다. 각 칸의 위아래 화살표로 글자를 바꿀 수 있다. 시리얼에 모음(A, E, I, O, U)이 하나라도 있으면 목록 A, 없으면 목록 B에서 만들 수 있는 단어를 찾아 제출한다.',
    lists: [{ title: '목록 A (시리얼에 모음이 있을 때)', words: LIST_A }, { title: '목록 B (시리얼에 모음이 없을 때)', words: LIST_B }],
  };
}
