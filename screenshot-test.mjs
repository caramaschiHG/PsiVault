import pkg from '/home/caramaschi/.npm-global/lib/node_modules/playwright/index.js';
const { chromium } = pkg;
import { mkdir } from 'fs/promises';

const BASE = 'http://localhost:3001';
const OUT = './screenshots-visual-test';

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();

async function shot(page, name, url, { width = 1440, height = 900, wait = 1000 } = {}) {
  await page.setViewportSize({ width, height });
  await page.goto(`${BASE}${url}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(wait);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
  console.log(`✓ ${name}`);
}

// Desktop screenshots
const desk = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const dp = await desk.newPage();

await shot(dp, '01-inicio-desktop', '/inicio');
await shot(dp, '02-patients-desktop', '/patients');
await shot(dp, '03-agenda-desktop', '/agenda');
await shot(dp, '04-financeiro-desktop', '/financeiro');
await shot(dp, '05-signin-desktop', '/sign-in');
await shot(dp, '06-patients-new', '/patients/new');

// Mobile screenshots (375px)
const mob = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2 });
const mp = await mob.newPage();

await shot(mp, '07-inicio-mobile', '/inicio', { width: 375, height: 812 });
await shot(mp, '08-patients-mobile', '/patients', { width: 375, height: 812 });
await shot(mp, '09-agenda-mobile', '/agenda', { width: 375, height: 812 });
await shot(mp, '10-financeiro-mobile', '/financeiro', { width: 375, height: 812 });

await browser.close();
console.log(`\nSalvo em ${OUT}/`);
