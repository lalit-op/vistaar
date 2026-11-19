import { readFileSync } from 'node:fs';
import { Script, runInNewContext } from 'node:vm';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
const manifest = JSON.parse(readFileSync(new URL('package.json', root), 'utf8'));
const html = readFileSync(new URL('app/index.html', root), 'utf8');
assert.equal(manifest.packageType, 'app');
assert.equal(manifest.appName, 'Vistaar');
assert.equal(manifest.appPath, 'app/index.html');
assert.deepEqual(manifest.keys, [], 'default remote keys should not be registered by the module');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/gi)];
assert.equal(scripts.length, 1, 'expected one inline app script');
new Script(scripts[0][1], { filename: 'app/index.html' });
const source = scripts[0][1];
const start = source.indexOf('function parseM3U(src){');
const end = source.indexOf('\nfunction classify(', start);
assert.ok(start >= 0 && end > start, 'M3U parser missing');
const validUrl = value => { try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; } };
const parseM3U = runInNewContext('(' + source.slice(start, end) + ')', { URL, validUrl });
const channels = parseM3U('#EXTM3U\n#EXTINF:-1 tvg-id="test.news" group-title="News",Test News HD\nhttps://example.com/live.m3u8');
assert.equal(channels.length, 1);
assert.equal(channels[0].name, 'Test News HD');
assert.equal(channels[0].tvgId, 'test.news');
assert.equal(channels[0].group, 'News');
assert.equal(channels[0].hd, true);
const [quoted] = parseM3U('#EXTINF:-1 http-user-agent="Browser (one, two)" tvg-language="Hindi" group-title="News",News (1080p)\nhttps://example.com/tv');
assert.equal(quoted.name, 'News (1080p)');
assert.equal(quoted.language, 'Hindi');
assert.equal(quoted.hd, true);
const dateStart = source.indexOf('function xmlTime(');
const dateEnd = source.indexOf('function timeLabel(', dateStart);
const xmlTime = runInNewContext('(' + source.slice(dateStart, dateEnd) + ')');
assert.equal(xmlTime('20261119193000 +0530'), Date.UTC(2026, 10, 19, 14));
assert.ok(Number.isNaN(xmlTime('unknown')));
assert.ok(source.includes('function moveFocus(direction)'));
console.log('Vistaar TizenBrew smoke checks passed.');

// Some Samsung remotes emit keydown/keyup without the browser's synthetic click.
const handlerStart = source.indexOf("document.addEventListener('keydown'");
const handlerEnd = source.indexOf("document.addEventListener('visibilitychange'", handlerStart);
let keydown;
let clicks = 0;
const button = { tagName: 'BUTTON', click() { clicks++; } };
const home = {contains: el => el === button};
const player = {};
runInNewContext(source.slice(handlerStart, handlerEnd), {
  document: {activeElement: button, addEventListener(type, handler) { keydown = handler; }},
  activeLayer: () => home,
  $: id => id === 'player' ? player : null,
});
for (const repeat of [false, true]) {
  let prevented = false;
  keydown({key: 'Enter', keyCode: 13, repeat, preventDefault() { prevented = true; }});
  assert.ok(prevented, 'suppress duplicate browser activation');
}
assert.equal(clicks, 1, 'one OK press activates the focused button once');
