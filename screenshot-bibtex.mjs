import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:4321/sae-metric', { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 1500));
// Scroll to BibTeX section
await page.evaluate(() => document.getElementById('paper')?.scrollIntoView());
await new Promise(r => setTimeout(r, 500));
await page.screenshot({ path: 'temporary screenshots/check-bibtex2.png' });
await browser.close();
console.log('done');
