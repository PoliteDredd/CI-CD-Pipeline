// Flash wallet demo — Buy data bundle page + JSON API: node data-app/server.js
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { BUNDLES, formatZar, evaluatePurchase } = require('./public/bundle-rules');

const PORT = 3003;
const accounts = new Map(); // accountId -> { balanceCents, purchases: [] }
let nextAccount = 1;
let nextReference = 1;

function send(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

function readJson(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => { raw += chunk; });
    req.on('end', () => { try { resolve(JSON.parse(raw || '{}')); } catch { resolve({}); } });
  });
}

http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, `http://localhost:${PORT}`);

  if (req.method === 'GET' && pathname === '/data-bundle') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return fs.createReadStream(path.join(__dirname, 'public', 'data-bundle.html')).pipe(res);
  }

  if (req.method === 'GET' && pathname === '/api/bundles') {
    return send(res, 200, BUNDLES.map((b) => ({ code: b.code, name: b.name, price: formatZar(b.priceCents) })));
  }

  if (req.method === 'POST' && pathname === '/api/accounts') {
    const body = await readJson(req);
    const balanceCents = Math.round(Number.parseFloat(body.startingBalance ?? '300.00') * 100);
    const accountId = `F-${String(nextAccount++).padStart(4, '0')}`;
    accounts.set(accountId, { balanceCents, purchases: [] });
    return send(res, 201, { accountId, balance: formatZar(balanceCents) });
  }

  const match = pathname.match(/^\/api\/accounts\/([^/]+)(\/bundles|\/purchases)?$/);
  const account = match && accounts.get(match[1]);
  if (match && !account) return send(res, 404, { message: 'Account not found' });

  if (match && !match[2] && req.method === 'GET') {
    return send(res, 200, { accountId: match[1], balance: formatZar(account.balanceCents) });
  }

  if (match && match[2] === '/purchases' && req.method === 'GET') return send(res, 200, account.purchases);

  if (match && match[2] === '/bundles' && req.method === 'POST') {
    const body = await readJson(req);
    const outcome = evaluatePurchase(account.balanceCents, account.purchases.length,
      String(body.mobileNumber ?? ''), String(body.bundleCode ?? ''));
    if (outcome.result === 'error') {
      return send(res, 422, { result: 'error', message: outcome.message, balance: formatZar(account.balanceCents) });
    }
    account.balanceCents = outcome.balanceCents;
    const reference = `DB-${String(nextReference++).padStart(6, '0')}`;
    account.purchases.push({ reference, mobileNumber: body.mobileNumber, bundle: outcome.bundle.name, price: formatZar(outcome.bundle.priceCents) });
    return send(res, 201, { result: 'success', message: outcome.message, reference, balance: formatZar(account.balanceCents) });
  }

  send(res, 404, { message: 'Not found' });
}).listen(PORT, () => console.log(`Flash data bundle demo on http://localhost:${PORT}/data-bundle?account=<id>`));
