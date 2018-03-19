import test from 'ava';
import { getOptions } from '../../../src/lib/parameters';

test('getOptions throws with invalid JSON', t => {
  t.throws(() => getOptions('invalid'));
});

test('getOptions returns parsed JSON', async t => {
  const obj = { test: 13, array: ['1', 2] };

  t.deepEqual(getOptions(JSON.stringify(obj)), obj);
});
