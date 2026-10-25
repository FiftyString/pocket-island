// Optional browser tooling lives outside this game's dependencies.
// PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs node scripts/browser-check.mjs
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import assert from 'node:assert/strict';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = resolve('dist');
const server = createServer(async (req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  if (pathname === '/pocket-island') { res.writeHead(301, { Location: '/pocket-island/' }); res.end(); return; }
  if (!pathname.startsWith('/pocket-island/')) { res.writeHead(404); res.end(); return; }
  const file = resolve(root, '.' + pathname.slice('/pocket-island'.length) + (pathname.endsWith('/') ? 'index.html' : ''));
  if (!file.startsWith(root + '/')) { res.writeHead(403); res.end(); return; }
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': ({ '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml' })[extname(file)] || 'application/octet-stream', Vary: 'Origin' });
    res.end(body);
  } catch { res.writeHead(404); res.end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const origin = `http://127.0.0.1:${server.address().port}`;
const url = `${origin}/pocket-island/`;
let browser;
try {
  browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}), args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(url.slice(0, -1)); assert.equal(page.url(), url);
  await page.locator('#play').click(); await page.locator('#got').click();
  assert.equal(await page.locator('body').evaluate(e => e.classList.contains('reduced')), true);
  const box = await page.locator('canvas').boundingBox();
  await page.touchscreen.tap(box.x + box.width / 12, box.y + box.height * 35 / 432);
  const saved = () => page.evaluate(() => JSON.parse(localStorage.getItem('pocket-island-v1')));
  assert.equal((await saved()).game.board.filter(Boolean).length, 1);
  await page.locator('#undo').click();
  assert.equal((await saved()).game.board.filter(Boolean).length, 0);
  assert.equal((await saved()).game.undoUsed, true);
  await page.touchscreen.tap(box.x + box.width / 12, box.y + box.height * 35 / 432);
  await page.locator('#settings').click(); await page.locator('#sound').uncheck(); await page.locator('#resume').click();
  const before = await saved();
  await page.reload(); await page.locator('#play').click(); assert.deepEqual(await saved(), before);
  for (const width of [320, 375, 390, 430, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `horizontal overflow at ${width}`);
    for (const selector of ['#home', '#settings', '#undo', '#help', '#restart']) {
      const b = await page.locator(selector).boundingBox();
      assert.ok(b.width >= 44 && b.height >= 44, `${selector}: touch target at ${width}`);
    }
  }
  const metadata = await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.ready;
    const manifest = await (await fetch('./manifest.webmanifest')).json();
    const cacheKeys = await caches.keys();
    const cache = await caches.open(cacheKeys.find(k => k.includes('/pocket-island/sw.js')));
    return { scope: reg.scope, manifest, assets: (await cache.keys()).map(r => r.url) };
  });
  assert.equal(metadata.scope, url);
  assert.equal(new URL(metadata.manifest.start_url, url).href, url);
  assert.equal(new URL(metadata.manifest.scope, url).href, url);
  assert.ok(metadata.assets.length >= 7);
  assert.ok(metadata.assets.every(asset => asset.startsWith(url)));
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true); await page.reload(); await page.locator('#play').click();
  assert.deepEqual(await saved(), before);
  await page.close();
  const reopened = await context.newPage(); await reopened.goto(url); await reopened.locator('#play').click();
  assert.deepEqual(await reopened.evaluate(() => JSON.parse(localStorage.getItem('pocket-island-v1'))), before);
  await context.close();
  const blocked = await browser.newContext();
  await blocked.addInitScript(() => { Storage.prototype.setItem = () => { throw new DOMException('Blocked', 'QuotaExceededError'); }; });
  const blockedPage = await blocked.newPage(); await blockedPage.goto(url); await blockedPage.locator('#play').click(); await blockedPage.locator('#got').click();
  assert.match(await blockedPage.locator('#storage').innerText(), /无法保存/);
  await blocked.close(); assert.deepEqual(errors, []);
  console.log('PASS: subpath redirect/assets/manifest/SW scope; touch placement + undo; settings + reload; 320/375/390/430/1280 layouts and touch targets; reduced motion; offline reload + new tab; storage failure fallback.');
} finally { await browser?.close(); await new Promise(r => server.close(r)); }
