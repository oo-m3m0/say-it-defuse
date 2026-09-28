// 규칙 조건 DSL. evalCond(판정)와 describeCond(매뉴얼 문장)가 같은 객체를 읽는다.
// ctx = { facts: edgeFacts(edge), state: 모듈 상태 }

const FACT_TEXT = {
  serialLastOdd: '시리얼 끝자리가 홀수',
  serialLastEven: '시리얼 끝자리가 짝수',
  serialHasVowel: '시리얼에 모음(A, E, I, O, U)이 있음',
  serialNoVowel: '시리얼에 모음이 없음',
};
const OP = {
  '==': (a, b) => a === b, '!=': (a, b) => a !== b,
  '>=': (a, b) => a >= b, '<=': (a, b) => a <= b, '>': (a, b) => a > b, '<': (a, b) => a < b,
};
const OP_TEXT = { '==': '정확히 {n}개', '!=': '{n}개가 아님', '>=': '{n}개 이상', '<=': '{n}개 이하', '>': '{n}개 초과', '<': '{n}개 미만' };

export function evalCond(cond, ctx) {
  const { facts, state } = ctx;
  switch (cond.type) {
    case 'else': return true;
    case 'edge': return !!facts[cond.fact];
    case 'indicator': return facts[cond.label] === (cond.on !== false);
    case 'batteries': return OP[cond.op](facts.batteries, cond.n);
    case 'count': return OP[cond.op](state.items.filter((x) => x === cond.value).length, cond.n);
    case 'last': return state.items[state.items.length - 1] === cond.value;
    case 'first': return state.items[0] === cond.value;
    case 'prop': return state[cond.key] === cond.value;
    case 'all': return cond.of.every((c) => evalCond(c, ctx));
    case 'any': return cond.of.some((c) => evalCond(c, ctx));
    case 'not': return !evalCond(cond.of, ctx);
    default: throw new Error('unknown cond ' + cond.type);
  }
}

// noun: count/last/first 조건이 가리키는 대상 이름 (예: '전선')
export function describeCond(cond, noun = '항목') {
  switch (cond.type) {
    case 'else': return '위 어느 것에도 해당하지 않으면';
    case 'edge': return FACT_TEXT[cond.fact];
    case 'indicator': return `${cond.label} 표시등이 ${cond.on === false ? '꺼져' : '켜져'} 있음`;
    case 'batteries': return `배터리가 ${OP_TEXT[cond.op].replace('{n}', cond.n)}`;
    case 'count': return cond.op === '==' && cond.n === 0 ? `${cond.value} ${noun}이 없음` : `${cond.value} ${noun}이 ${OP_TEXT[cond.op].replace('{n}', cond.n)}`;
    case 'last': return `마지막 ${noun}이 ${cond.value}`;
    case 'first': return `첫 번째 ${noun}이 ${cond.value}`;
    case 'prop': return `${cond.label || cond.key}이(가) ${cond.value}`;
    case 'all': return cond.of.map((c) => describeCond(c, noun)).join(', 그리고 ');
    case 'any': return cond.of.map((c) => describeCond(c, noun)).join(', 또는 ');
    case 'not': return describeCond(cond.of, noun) + '이 아님';
    default: throw new Error('unknown cond ' + cond.type);
  }
}

// 규칙 목록에서 첫 매치의 action
export function firstMatch(rules, ctx) {
  for (const r of rules) if (evalCond(r.cond, ctx)) return r.action;
  throw new Error('no rule matched');
}
