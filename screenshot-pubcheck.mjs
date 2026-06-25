import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:4321/', { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 800));
const cards = await page.evaluate(() =>
  [...document.querySelectorAll('.pub-entry')].map(el => ({
    title: el.querySelector('.pub-title')?.innerText,
    links: [...el.querySelectorAll('.pub-links a')].map(a => ({ label: a.innerText, href: a.href }))
  }))
);
console.log(JSON.stringify(cards, null, 2));
await browser.close();
