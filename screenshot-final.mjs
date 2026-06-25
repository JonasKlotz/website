import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });

// Hero kicker check
await page.goto('http://localhost:4321/sae-metric', { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 1000));
await page.screenshot({ path: 'temporary screenshots/final-hero.png', clip: { x: 0, y: 0, width: 1440, height: 300 } });

// Main site pubs check
await page.goto('http://localhost:4321/', { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 800));
await page.evaluate(() => document.getElementById('publications')?.scrollIntoView());
await new Promise(r => setTimeout(r, 400));
await page.screenshot({ path: 'temporary screenshots/final-pubs.png' });

await browser.close();
