const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4174;
const APP_DIR = path.join(__dirname, 'app');
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

const server = http.createServer((req, res) => {
  const requestPath = req.url.split('?')[0] || '/';
  const safePath = requestPath === '/' ? '/login.html' : requestPath;
  const filePath = path.join(APP_DIR, safePath);

  if (!filePath.startsWith(APP_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[extension] || 'text/plain; charset=utf-8',
    });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`Flash Wallet app running at http://127.0.0.1:${PORT}`);
});
