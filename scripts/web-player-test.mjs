import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const html = readFileSync(new URL('../app/index.html', import.meta.url), 'utf8');
const start = html.indexOf('let hlsLibrary;');
const end = html.indexOf('function play(c)', start);
assert.ok(start >= 0 && end > start);

let session, script, attempts = 0;
class FakeHls {
  static isSupported() { return true; }
  static Events = {ERROR: 'error', MANIFEST_PARSED: 'manifest'};
  static ErrorTypes = {NETWORK_ERROR: 'network'};
  constructor() { this.handlers = {}; session = this; }
  on(key, cb) { this.handlers[key] = cb; }
  attachMedia(video) { this.video = video; }
  loadSource(url) { this.url = url; }
  destroy() { this.destroyed = true; }
}
const video = {
  src: '', load() {}, pause() {},
  removeAttribute() { this.src = ''; },
  play() { attempts++; return Promise.resolve(); }
};
const sandbox = {
  document: { createElement: () => ({}), head: {appendChild(node) { script = node; }} },
  window: {MediaSource: {}, Hls: FakeHls}, clearTimeout() {}, setTimeout() {},
  $: () => video, playbackRequest: 1, playerError(message) { throw Error(message); }
};
runInNewContext(html.slice(start, end), sandbox);
sandbox.openWebPlayback('https://station.test/one.m3u8', 1);
sandbox.playbackRequest++;
sandbox.openWebPlayback('https://station.test/two.m3u8?live=1', 2);
script.onload();
await new Promise(resolve => setImmediate(resolve));
assert.equal(session.url, 'https://station.test/two.m3u8?live=1');
session.handlers.manifest();
assert.equal(attempts, 1);
session.handlers.error(null, {fatal: false});
assert.equal(session.destroyed, undefined);
session.handlers.error(null, {fatal: true, type: 'network', response: {code: 404}});
assert.ok(session.destroyed);
assert.equal(video.src, session.url);
assert.equal(attempts, 2);
session.handlers.manifest();
assert.equal(attempts, 2, 'discard callbacks from a released HLS session');
sandbox.playbackRequest++;
sandbox.openWebPlayback('https://station.test/movie.mp4', 3);
session.handlers.error(null, {fatal: true});
assert.equal(video.src, 'https://station.test/movie.mp4');
sandbox.stopWebPlayback();
assert.equal(video.src, '');
console.log('HLS startup, channel switching, retry and cleanup passed.');
