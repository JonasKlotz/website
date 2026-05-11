import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, extname } from 'path';

const PORT = 3000;
const BASE = existsSync('./dist') ? './dist' : '.';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.webp': 'image/webp',
  '.ico':  'image/x-icon',
  '.woff2': 'font/woff2',
};

createServer((req, res) => {
  let p = req.url.split('?')[0];
  if (p.endsWith('/')) p += 'index.html';

  const candidates = [
    join(BASE, p),
    join(BASE, p, 'index.html'),
    join(BASE, p.replace(/\/$/, ''), 'index.html'),
  ];

  const file = candidates.find(existsSync);
  if (!file) {
    const f404 = join(BASE, '404.html');
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end(existsSync(f404) ? readFileSync(f404) : 'Not found');
    return;
  }

  res.setHeader('Content-Type', MIME[extname(file)] ?? 'application/octet-stream');
  res.end(readFileSync(file));
}).listen(PORT, () => console.log(`Serving ${BASE} → http://localhost:${PORT}`));
