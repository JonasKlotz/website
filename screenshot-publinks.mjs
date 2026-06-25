import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:4321/', { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 800));
// Get bounding boxes of all pub-links divs
const rects = await page.evaluate(() =>
  [...document.querySelectorAll('.pub-links')].map(el => {
    const r = el.getBoundingClientRect();
    return { top: r.top + window.scrollY, text: el.innerText };
  })
);
console.log(JSON.stringify(rects, null, 2));
await browser.close();
