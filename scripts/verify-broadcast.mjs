// Isolated Chromium smoke checks using the browser's built-in DevTools protocol.
import { spawn } from 'node:child_process';
import { mkdtemp, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';

const profile = await mkdtemp(path.join(os.tmpdir(), 'av-news-browser-'));
const browser = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
  '--headless=new', '--remote-debugging-port=9228', `--user-data-dir=${profile}`,
  '--no-first-run', '--no-default-browser-check', '--disable-background-networking', 'about:blank',
], { windowsHide: true, stdio: 'ignore' });
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let socket;
let debug;
try {
  let pages;
  for (let attempt = 0; attempt < 100; attempt++) {
    try { pages = await fetch('http://127.0.0.1:9228/json').then((response) => response.json()); if (pages.length) break; } catch {}
    await pause(100);
  }
  if (!pages?.length) throw new Error('Chromium did not start.');
  socket = new WebSocket(pages.find((page) => page.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let sequence = 0;
  const waiting = new Map();
  const exceptions = [];
  socket.onmessage = ({ data }) => {
    const message = JSON.parse(data);
    if (message.id && waiting.has(message.id)) {
      const { resolve, reject, timer } = waiting.get(message.id); clearTimeout(timer); waiting.delete(message.id);
      if (message.error) reject(new Error(JSON.stringify(message.error))); else resolve(message.result);
    }
    if (message.method === 'Runtime.exceptionThrown') exceptions.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => { waiting.delete(id); reject(new Error(`Timeout: ${method}`)); }, 20000);
    waiting.set(id, { resolve, reject, timer }); socket.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async (expression) => {
    const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    return result.result?.value;
  };
  debug = async () => {
    console.error('Browser exceptions:', JSON.stringify(exceptions));
    console.error('Page:', await evaluate('document.body.innerText.slice(0, 5000)'));
    console.error('URL:', await evaluate('location.href'));
  };
  const waitFor = async (expression) => {
    for (let attempt = 0; attempt < 300; attempt++) {
      try { if (await evaluate(expression)) return; } catch { /* A navigation can briefly have no document. */ }
      await pause(100);
    }
    throw new Error(`Not found: ${expression}`);
  };
  const click = (text) => evaluate(`(() => { const button = [...document.querySelectorAll('button')].find((button) => button.textContent.includes(${JSON.stringify(text)})); if (!button) throw new Error('Button missing: ' + ${JSON.stringify(text)}); button.click(); })()`);
  const input = (label, value) => evaluate(`(() => { const wrapper = [...document.querySelectorAll('label')].find((label) => label.textContent.startsWith(${JSON.stringify(label)})); const input = wrapper?.querySelector('input,select,textarea'); if (!input) throw new Error('Input missing: ' + ${JSON.stringify(label)}); const prototype = input instanceof HTMLSelectElement ? HTMLSelectElement.prototype : input instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(prototype, 'value').set.call(input, ${JSON.stringify(value)}); input.dispatchEvent(new Event('input', { bubbles: true })); input.dispatchEvent(new Event('change', { bubbles: true })); })()`);
  await send('Runtime.enable'); await send('Page.enable'); await send('Network.enable');
  // Do not claim remote video availability from these UI checks.
  await send('Network.setBlockedURLs', { urls: ['*youtube.com/*', '*ytimg.com/*', '*googlevideo.com/*', '*fonts.googleapis.com/*', '*images.unsplash.com/*'] });
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: 'http://localhost:3000/admin' });
  await waitFor(`document.body.textContent.includes('SCREEN ZOOM & VIEWPORT')`);
  await click('48-HOUR SCHEDULER');
  await waitFor(`document.body.textContent.includes('48-hour broadcast scheduler')`);
  await input('Program title', 'Smoke test Health Hour');
  await input('Anchor', 'Smoke test editor');
  await input('Video source', 'stream-avnews-main');
  const start = new Date(Date.now() + 330 * 60000 - 60000).toISOString().slice(0, 16);
  await input('Start time', start);
  await click('Save program');
  await waitFor(`document.body.textContent.includes('Program saved.')`);
  await evaluate(`(() => { const checkbox = document.querySelector('label input[type=checkbox]'); if (!checkbox.checked) checkbox.click(); })()`);
  await waitFor(`JSON.parse(localStorage.getItem('av_news_settings_v1')).schedulerEnabled === true`);
  await click('DUAL TICKERS');
  await waitFor(`document.body.textContent.includes('Live graphics & bilingual tickers')`);
  await input('Breaking flash text', 'SMOKE TEST BREAKING FLASH');
  await evaluate(`document.querySelector('label input[type=checkbox]').click()`);
  await input('Telugu headlines', 'తెలుగు పరీక్ష వార్త');
  await input('English dispatches', 'English smoke-test dispatch');
  await click('L-SHAPE');
  await waitFor(`document.body.textContent.includes('L-band layout & sponsor rotation')`);
  await evaluate(`document.querySelector('label input[type=checkbox]').click()`);
  await click('SCREEN ZOOM');
  await input('Screen scale', '1.1');
  await input('Horizontal zoom', '1.2');
  await waitFor(`JSON.parse(localStorage.getItem('av_news_settings_v1')).viewport.scale === 1.1`);
  await evaluate(`document.querySelector('button[title="Close Admin Portal"],button[title="Close Admin"]')?.click()`);
  // Navigate through the actual browser route if a legacy close button has no title.
  await send('Page.navigate', { url: 'http://localhost:3000/' });
  await waitFor(`document.body.textContent.includes('SMOKE TEST BREAKING FLASH')`);
  assert.equal(await evaluate(`document.body.textContent.includes('Smoke test Health Hour')`), true);
  assert.equal(await evaluate(`document.querySelector('[data-broadcast-stream]').dataset.broadcastStream`), 'stream-avnews-main');
  assert.equal(await evaluate(`!!document.querySelector('aside')`), true);
  const imageLayout = await evaluate(`(() => { const aside = document.querySelector('aside'); const picture = aside.nextElementSibling.getBoundingClientRect(); const ad = aside.getBoundingClientRect(); return { adRight: ad.right, pictureLeft: picture.left, adWidth: ad.width }; })()`);
  assert.ok(imageLayout.adWidth >= 120 && imageLayout.pictureLeft >= imageLayout.adRight - 1);
  await click('GET HEALTH HELP');
  await waitFor(`!!document.querySelector('[aria-labelledby="health-title"]')`);
  assert.equal(await evaluate(`document.querySelector('[aria-labelledby="health-title"] a').getAttribute('href')`), 'tel:0870412082');
  await evaluate(`document.querySelector('[aria-label="Close health help"]').click()`);
  // Audio blobs survive a full reload and remain playable by URL resolution.
  const stored = await evaluate(`(async () => { const media = await import('/src/utils/mediaStore.ts'); const key = await media.storeMedia(new Blob(['audio-smoke'], {type:'audio/webm'})); localStorage.setItem('av_smoke_media', key); return key; })()`);
  assert.ok(stored.startsWith('av-media:'));
  await send('Page.reload'); await waitFor(`document.body.textContent.includes('SMOKE TEST BREAKING FLASH')`);
  assert.equal(await evaluate(`(async () => { const media = await import('/src/utils/mediaStore.ts'); const url = await media.resolveMedia(localStorage.getItem('av_smoke_media')); const value = await fetch(url).then(response => response.text()); URL.revokeObjectURL(url); await media.deleteStoredMedia(localStorage.getItem('av_smoke_media')); return value; })()`), 'audio-smoke');
  await waitFor("[...document.querySelectorAll('button')].some(button => button.textContent === 'SCHEDULE')");
  await click('SCHEDULE');
  await waitFor(`document.body.textContent.includes('48-hour schedule · IST')`);
  await evaluate("document.getElementById('live-broadcast-screen').scrollIntoView({ block: 'start' })");
  await pause(500);
  const desktop = path.join(profile, 'broadcast-desktop.png');
  await writeFile(desktop, Buffer.from((await send('Page.captureScreenshot', { format: 'png' })).data, 'base64'));
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await send('Page.navigate', { url: 'http://localhost:3000/admin' });
  await waitFor(`document.body.textContent.includes('SCREEN ZOOM & VIEWPORT')`);
  await click('SCREEN ZOOM');
  await waitFor(`document.body.textContent.includes('Screen viewport alignment')`);
  const widths = await evaluate(`({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth })`);
  assert.ok(widths.scroll <= widths.client + 1, `Mobile overflow: ${JSON.stringify(widths)}`);
  assert.equal(await evaluate(`JSON.parse(localStorage.getItem('av_news_settings_v1')).videoFraming.zoomX`), 1.2);
  const mobile = path.join(profile, 'admin-mobile.png');
  await writeFile(mobile, Buffer.from((await send('Page.captureScreenshot', { format: 'png' })).data, 'base64'));
  // The same-origin storage update path drives moderation and the public grid.
  await evaluate(`(async () => {
    const media = await import('/src/utils/mediaStore.ts');
    const buffer = new ArrayBuffer(16044); const view = new DataView(buffer);
    const ascii = (offset, text) => [...text].forEach((letter, index) => view.setUint8(offset + index, letter.charCodeAt(0)));
    ascii(0, 'RIFF'); view.setUint32(4, 16036, true); ascii(8, 'WAVE'); ascii(12, 'fmt ');
    view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
    view.setUint32(24, 8000, true); view.setUint32(28, 16000, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
    ascii(36, 'data'); view.setUint32(40, 16000, true);
    const audioUrl = await media.storeMedia(new Blob([buffer], {type: 'audio/wav'}));
    localStorage.setItem('av_smoke_preview', audioUrl);
    const key = 'av_news_radio_voices_v1';
    const voices = JSON.parse(localStorage.getItem(key));
    voices.unshift({ id: 'smoke-voice', title: 'Smoke test community voice', audioUrl, duration: '0:01', userName: 'Smoke test citizen', userCity: 'Warangal', status: 'pending', submittedAt: new Date().toISOString(), listens: 0, likes: 0 });
    const value = JSON.stringify(voices); localStorage.setItem(key, value); window.dispatchEvent(new StorageEvent('storage', { key, newValue: value }));
  })()`);
  await click('AV RADIO VOICES');
  await waitFor(`!!document.querySelector('[data-voice-id="smoke-voice"]')`);
  await evaluate(`[...document.querySelectorAll('[data-voice-id="smoke-voice"] button')].find(button => button.textContent.includes('LISTEN VOICE')).click()`);
  await waitFor(`[...document.querySelectorAll('audio')].some(audio => audio.duration === 1)`);
  assert.equal(await evaluate(`(() => { const audio = [...document.querySelectorAll('audio')].find(audio => audio.duration === 1); audio.pause(); audio.currentTime = 0.5; return audio.currentTime; })()`), 0.5);
  await evaluate(`[...document.querySelectorAll('[data-voice-id="smoke-voice"] button')].find(button => button.textContent.includes('APPROVE')).click()`);
  await waitFor(`JSON.parse(localStorage.getItem('av_news_radio_voices_v1')).find(voice => voice.id === 'smoke-voice').status === 'approved'`);
  await send('Page.navigate', { url: 'http://localhost:3000/radio' });
  await waitFor(`document.body.textContent.includes('Smoke test community voice')`);
  await evaluate(`(() => {
    const key = 'av_news_radio_voices_v1'; const voices = JSON.parse(localStorage.getItem(key));
    const voice = voices.find(voice => voice.id === 'smoke-voice'); voice.status = 'rejected'; voice.adminFeedback = 'INTERNAL MODERATION NOTE';
    const value = JSON.stringify(voices); localStorage.setItem(key, value); window.dispatchEvent(new StorageEvent('storage', { key, newValue: value }));
  })()`);
  await waitFor(`!document.body.textContent.includes('Smoke test community voice')`);
  assert.equal(await evaluate(`document.body.textContent.includes('INTERNAL MODERATION NOTE')`), false);
  await evaluate(`(async () => { const media = await import('/src/utils/mediaStore.ts'); await media.deleteStoredMedia(localStorage.getItem('av_smoke_preview')); })()`);
  assert.deepEqual(exceptions, [], 'Uncaught browser exceptions');
  console.log(JSON.stringify({ result: 'passed', checks: ['scheduler editor and source automation', 'overlay controls', 'L-band layout', 'saved viewport and framing', 'health-help dialog', 'persistent audio blobs', 'schedule rail', 'mobile Admin navigation', 'radio audio preview and scrubbing', 'radio approval and publication', 'storage update handling', 'rejected voices and private notes excluded', 'no uncaught browser exceptions'], desktop, mobile }, null, 2));
  socket.send(JSON.stringify({ id: ++sequence, method: 'Browser.close' }));
} catch (error) {
  await debug?.();
  throw error;
} finally {
  socket?.close(); browser.kill();
}
