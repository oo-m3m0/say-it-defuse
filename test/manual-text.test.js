import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { MODULES } from '../src/modules/index.js';

test('src에 Math.random이 없다', () => {
  const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
  for (const f of walk('src')) assert.ok(!readFileSync(f, 'utf8').includes('Math.random'), f);
});

test('매뉴얼 문장에 undefined나 객체 흔적이 없다', () => {
  for (const mod of Object.values(MODULES)) {
    const text = JSON.stringify(mod.manual());
    assert.ok(!/undefined|\[object/.test(text), mod.id + ': ' + text);
  }
});
