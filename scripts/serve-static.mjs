// Test-only static file server; never deployed. It serves the exact contents of dist/.
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve('dist');
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css', '.js':'text/javascript', '.svg':'image/svg+xml', '.webp':'image/webp', '.woff2':'font/woff2', '.xml':'application/xml', '.txt':'text/plain' };
http.createServer(async (request,response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url,'http://localhost').pathname);
    let file = path.resolve(root, `.${pathname}`);
    if (file !== root && !file.startsWith(root + path.sep)) { response.writeHead(403).end(); return; }
    if ((await stat(file)).isDirectory()) file = path.join(file,'index.html');
    response.setHeader('Content-Type',types[path.extname(file)] || 'application/octet-stream');
    response.end(await readFile(file));
  } catch { response.writeHead(404).end('Not found'); }
}).listen(4322,'127.0.0.1', () => console.log('Static test server: http://127.0.0.1:4322'));
