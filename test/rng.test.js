import test from 'node:test';
import assert from 'node:assert/strict';
import { hashString, mulberry32, deriveRng } from '../src/rng.js';

test('같은 문자열은 같은 수열', () => {
  const a = mulberry32(hashString('R1')), b = mulberry32(hashString('R1'));
  for (let i = 0; i < 10; i++) assert.equal(a.next(), b.next());
});
test('다른 문자열은 다른 수열', () => {
  assert.notEqual(hashString('R1'), hashString('R2'));
  assert.notEqual(deriveRng(1, 'wires').next(), deriveRng(1, 'button').next());
});
test('shuffle은 원본을 바꾸지 않는다', () => {
  const src = [1, 2, 3, 4];
  mulberry32(7).shuffle(src);
  assert.deepEqual(src, [1, 2, 3, 4]);
});
