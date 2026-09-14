import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
const root = process.cwd();
const args = process.argv.slice(2);
const port = Number(args[args.indexOf('--port') + 1]) || 4173;
const host = args.includes('--host') ? args[args.indexOf('--host') + 1] : '0.0.0.0';
const mime = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.mjs':'text/javascript; charset=utf-8', '.json':'application/json', '.svg':'image/svg+xml', '.webp':'image/webp', '.png':'image/png', '.jpg':'image/jpeg', '.woff2':'font/woff2', '.mp3':'audio/mpeg', '.mp4':'video/mp4' };
createServer((req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const decoded = decodeURIComponent(url.pathname);
    if (decoded.split('/').some(part => part.startsWith('.'))) { res.writeHead(404); res.end(); return; }
    let path = resolve(root, '.' + decoded);
    if (path !== root && !path.startsWith(root + sep)) { res.writeHead(403); res.end(); return; }
    let stat;
    try { stat = statSync(path); } catch { res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' }); createReadStream(resolve(root, '404.html')).pipe(res); return; }
    if (stat.isDirectory()) {
      if (!decoded.endsWith('/')) { res.writeHead(301, { Location: url.pathname + '/' + url.search }); res.end(); return; }
      path = resolve(path, 'index.html'); stat = statSync(path);
    }
    res.writeHead(200, { 'Content-Type': mime[extname(path)] || 'application/octet-stream', 'Content-Length': stat.size, 'Cache-Control':'no-cache' });
    if (req.method === 'HEAD') res.end(); else createReadStream(path).pipe(res);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(port, host, () => console.log(`Portfolio preview: http://${host}:${port}`));
