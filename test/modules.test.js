import test from 'node:test';
import assert from 'node:assert/strict';
import { deriveRng } from '../src/rng.js';
import { generateEdge, edgeFacts } from '../src/edge.js';
import { MODULES } from '../src/modules/index.js';
import { evalCond } from "../src/conditions.js";
import { COLUMNS } from '../src/modules/keypad.js';

const N = Number(process.env.SEEDS || 2000);

for (const [type, mod] of Object.entries(MODULES)) {
  test(`${type}: 모든 시드에서 정답이 정확히 하나`, () => {
    for (let level = 1; level <= 3; level++) {
      for (let seed = 0; seed < N; seed++) {
        const edge = generateEdge(deriveRng(seed, 'edge'), level, { forceVowel: level === 1 });
        const facts = edgeFacts(edge);
        const state = mod.generate(deriveRng(seed, type), edge, level, facts);
        const hits = mod.enumerateActions(state).filter((a) => mod.check(state, facts, a));
        assert.equal(hits.length, 1, `${type} level ${level} seed ${seed}: ${hits.length} hits`);
      }
    }
  });
}

test('keypad 열끼리 겹치는 기호는 2개 이하', () => {
  for (let i = 0; i < COLUMNS.length; i++)
    for (let j = i + 1; j < COLUMNS.length; j++)
      assert.ok(COLUMNS[i].filter((s) => COLUMNS[j].includes(s)).length <= 2);
  for (const c of COLUMNS) assert.equal(new Set(c).size, 6);
});

test('wires: 모든 규칙 줄이 실제로 쓰인다', () => {
  const mod = MODULES.wires;
  for (let level = 1; level <= 3; level++) {
    const used = new Set();
    for (let seed = 0; seed < N; seed++) {
      const edge = generateEdge(deriveRng(seed, 'edge'), level);
      const facts = edgeFacts(edge);
      const state = mod.generate(deriveRng(seed, 'wires'), edge, level, facts);
      const rules = mod.rules[state.items.length];
      const idx = rules.findIndex((r) => {
        
        return evalCond(r.cond, { facts, state });
      });
      used.add(idx);
    }
    assert.equal(used.size, mod.rules[2 + level].length, `level ${level} used ${[...used]}`);
  }
});
