import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const PORT = 3000;
const DIST = join(process.cwd(), 'dist-web');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const server = createServer((req, res) => {
  const url = new URL(req.url || '/', `http://localhost:${PORT}`);
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/') pathname = '/index.html';
  
  let filePath = join(DIST, pathname);
  if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
    if (existsSync(join(DIST, `${pathname}.html`))) {
      filePath = join(DIST, `${pathname}.html`);
    } else if (existsSync(join(filePath, 'index.html'))) {
      filePath = join(filePath, 'index.html');
    } else {
      filePath = join(DIST, 'index.html');
    }
  }

  const ext = extname(filePath);
  const contentType = MIME[ext] || 'application/octet-stream';

  try {
    const data = readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  } catch (err) {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Static server running at http://127.0.0.1:${PORT}`);
});
