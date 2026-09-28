// 폭탄 가장자리 정보: 시리얼, 배터리, 표시등. 규칙이 이걸 참조하므로 전문가가 해체자에게 물어야 한다.
export const INDICATOR_LABELS = ['MSG', 'CTX', 'ACK', 'SYNC', 'ECHO'];
const VOWELS = 'AEIOU';
const CONSONANTS = 'BCDFGHJKLMNPQRSTVWXYZ';
const DIGITS = '0123456789';

export function generateEdge(rng, level, opts = {}) {
  // 시리얼 6자: 앞 5자는 영문/숫자 섞음, 마지막은 숫자
  let serial;
  do {
    let s = '';
    for (let i = 0; i < 5; i++) {
      const r = rng.int(3);
      s += r === 0 ? rng.pick(VOWELS.split('')) : r === 1 ? rng.pick(CONSONANTS.split('')) : rng.pick(DIGITS.split(''));
    }
    serial = s + rng.pick(DIGITS.split(''));
  } while (opts.forceVowel && !/[AEIOU]/.test(serial));

  const batteries = rng.int(5);

  // 표시등 0~2개. ECHO는 level 3에서만 나온다.
  const pool = level >= 3 ? INDICATOR_LABELS : INDICATOR_LABELS.filter((l) => l !== 'ECHO');
  const count = rng.int(3);
  const labels = rng.shuffle(pool).slice(0, count).sort();
  const indicators = labels.map((label) => ({ label, on: rng.int(2) === 1 }));

  return { serial, batteries, indicators };
}

export function edgeFacts(edge) {
  const last = Number(edge.serial[edge.serial.length - 1]);
  const on = (label) => edge.indicators.some((i) => i.label === label && i.on);
  return {
    serialLastOdd: last % 2 === 1,
    serialLastEven: last % 2 === 0,
    serialHasVowel: /[AEIOU]/.test(edge.serial),
    serialNoVowel: !/[AEIOU]/.test(edge.serial),
    batteries: edge.batteries,
    MSG: on('MSG'), CTX: on('CTX'), ACK: on('ACK'), SYNC: on('SYNC'), ECHO: on('ECHO'),
  };
}
