import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:4321/', { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 1000));
// Scroll past FedX to TAPAS entry
await page.evaluate(() => window.scrollBy(0, 1000));
await new Promise(r => setTimeout(r, 500));
await page.screenshot({ path: 'temporary screenshots/check-tapas-entry.png', clip: { x: 0, y: 0, width: 1440, height: 900 } });
await browser.close();
console.log('done');
