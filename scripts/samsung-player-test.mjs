import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('../tizen/samsung.js', import.meta.url), 'utf8');
let state = 'NONE';
let callbacks;
let listener;
const keys = [];
const api = {
  getState: () => state,
  open() { assert.equal(state, 'NONE'); state = 'IDLE'; },
  close() { state = 'NONE'; },
  setListener(value) { listener = value; },
  setDisplayRect(...args) { assert.deepEqual(args, [0, 0, 1920, 1080]); },
  setDisplayMethod(mode) { assert.match(mode, /^PLAYER_DISPLAY_MODE_/); },
  prepareAsync(ok, fail) { callbacks = {ok, fail}; },
  play() { state = 'PLAYING'; },
  pause() { state = 'PAUSED'; }
};
const window = { webapis: { avplay: api }, tizen: { tvinputdevice: {registerKey(key) { keys.push(key); }} } };
runInNewContext(source, {window});
const player = window.vistaarPlayer;
assert.ok(keys.includes('ChannelUp') && keys.includes('MediaPlayPause'));
let errors = 0;
player.open('https://example.org/first', 0, () => errors++);
const stale = callbacks;
player.open('https://example.org/second', 0, () => errors++);
stale.ok();
stale.fail();
assert.equal(state, 'IDLE');
assert.equal(errors, 0);
callbacks.ok();
assert.equal(state, 'PLAYING');
player.control('toggle');
assert.equal(state, 'PAUSED');
player.control('play');
assert.equal(state, 'PLAYING');
listener.onerror();
assert.equal(state, 'NONE');
assert.equal(errors, 1);
callbacks.ok();
assert.equal(state, 'NONE');
player.open('https://example.org/third', 0, () => errors++);
player.close();
callbacks.ok();
assert.equal(state, 'NONE');
assert.equal(errors, 1);
console.log('Samsung player lifecycle checks passed.');
