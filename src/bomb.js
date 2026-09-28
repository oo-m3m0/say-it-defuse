import { hashString, deriveRng } from './rng.js';
import { parseRoundCode } from './rounds.js';
import { generateEdge, edgeFacts } from './edge.js';
import { MODULES } from './modules/index.js';

// 라운드 코드 하나로 폭탄 전체가 결정된다. 같은 코드면 모든 팀이 같은 폭탄을 받는다.
export function generateBomb(code) {
  const parsed = parseRoundCode(code);
  if (!parsed) return null;
  const { round } = parsed;
  const seed = hashString(parsed.code);
  const edge = generateEdge(deriveRng(seed, 'edge'), round.level, { forceVowel: round.level === 1 });
  const facts = edgeFacts(edge);
  const modules = round.modules.map((type, i) => {
    const mod = MODULES[type];
    const state = mod.generate(deriveRng(seed, `${type}:${i}`), edge, round.level, facts);
    return { id: `${type}-${i}`, type, state };
  });
  return { code: parsed.code, round, edge, facts, modules };
}
