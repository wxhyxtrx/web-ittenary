// Server lokal untuk mencoba web tanpa Vercel atau Supabase. Data hanya tersimpan di memori.
const http = require('http');
const fs = require('fs');
const path = require('path');

Object.assign(process.env, {
  NODE_ENV: 'development', STORE: 'memory', VIEW_PASSWORD: 'lihat', EDIT_PASSWORD: 'ubah', SESSION_SECRET: 'lokal',
});

const routes = { '/api/login': require('./api/login'), '/api/trip': require('./api/trip') };
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.jpg': 'image/jpeg' };
const root = path.resolve(__dirname, 'public');

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost').pathname;
  if (routes[url]) {
    let body = '';
    for await (const chunk of req) body += chunk;
    req.body = body ? JSON.parse(body) : undefined;
    return routes[url](req, res);
  }
  const name = url === '/' ? 'index.html' : url === '/edit' ? 'edit.html' : url.slice(1);
  const file = path.resolve(root, name);
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) { res.statusCode = 404; return res.end(); }
  res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
}).listen(3100, '127.0.0.1', () => console.log('http://127.0.0.1:3100'));
