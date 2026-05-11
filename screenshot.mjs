import puppeteer from 'puppeteer';
import { existsSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';

const url   = process.argv[2] || 'http://localhost:4321';
const label = process.argv[3] || '';

const dir = 'temporary screenshots';
if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

const count = readdirSync(dir).filter(f => /^screenshot-\d+/.test(f)).length;
const filename = join(dir, `screenshot-${count + 1}${label ? '-' + label : ''}.png`);

const browser = await puppeteer.launch({
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
await page.screenshot({ path: filename, fullPage: true });
await browser.close();

console.log(`Saved: ${filename}`);
