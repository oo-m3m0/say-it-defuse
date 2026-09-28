import test from 'node:test';
import assert from 'node:assert/strict';
import { generateBomb } from '../src/bomb.js';
import { parseRoundCode } from '../src/rounds.js';

test('코드 파싱: 대소문자, 공백, 변형 접미사', () => {
  assert.equal(parseRoundCode(' r2-b ').code, 'R2-B');
  assert.equal(parseRoundCode('R4'), null);
  assert.equal(parseRoundCode(''), null);
});
test('같은 코드는 같은 폭탄', () => {
  assert.deepEqual(generateBomb('R1'), generateBomb('r1'));
  assert.notDeepEqual(generateBomb('R1'), generateBomb('R1-B'));
});
test('프리셋대로 모듈 수와 시간', () => {
  const b = generateBomb('R3');
  assert.equal(b.modules.length, 5);
  assert.equal(b.round.seconds, 420);
});
test('R1은 시리얼에 모음이 있고 ECHO가 없다', () => {
  for (const v of ['', '-A', '-B', '-C', '-D', '-E']) {
    const b = generateBomb('R1' + v);
    assert.ok(/[AEIOU]/.test(b.edge.serial), b.edge.serial);
    assert.ok(!b.edge.indicators.some((i) => i.label === 'ECHO'));
  }
});
