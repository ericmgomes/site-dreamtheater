import test from 'node:test';
import assert from 'node:assert/strict';
import { handleRequest, prefersMarkdown } from './worker.mjs';

const request = (accept, method = 'GET') => new Request('https://dreamtheater.com.br/missing', { method, headers: { Accept: accept } });
const origin404 = () => new Response('<h1>Not found</h1>', { status: 404, headers: { 'Content-Type': 'text/html', 'Content-Length': '18', 'ETag': 'old', Vary: 'Accept-Encoding' } });

test('negotiates explicit Markdown, respecting quality and HTML preference', () => {
  for (const accept of ['text/markdown', 'TEXT/MARKDOWN; charset=utf-8', 'text/markdown;q=0.9,text/html;q=0.5']) assert(prefersMarkdown(accept));
  for (const accept of ['', '*/*', 'text/html,*/*;q=0.8', 'text/markdown;q=0', 'text/markdown;q=0.5,text/html', 'text/markdown;q=bad']) assert(!prefersMarkdown(accept));
});

test('returns a real 404 with a Markdown explanation and sitemap link', async () => {
  const response = await handleRequest(request('text/markdown'), origin404);
  assert.equal(response.status, 404);
  assert.equal(response.headers.get('Content-Type'), 'text/markdown; charset=utf-8');
  const body = await response.text();
  assert(body.length > 20);
  assert.match(body, /\[Mapa do site\]\(https:\/\/dreamtheater.com.br\/sitemap.xml\)/);
  assert.equal(response.headers.get('Content-Length'), null);
  assert.equal(response.headers.get('ETag'), null);
  assert.equal(response.headers.get('Vary'), 'Accept-Encoding, Accept');
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
});

test('preserves the HTML error for browsers', async () => {
  const response = await handleRequest(request('text/html'), origin404);
  assert.equal(response.status, 404);
  assert.equal(response.headers.get('Content-Type'), 'text/html');
  assert.equal(await response.text(), '<h1>Not found</h1>');
});

test('HEAD uses the negotiated headers without a body', async () => {
  const response = await handleRequest(request('text/markdown', 'HEAD'), origin404);
  assert.equal(response.status, 404);
  assert.match(response.headers.get('Content-Type'), /^text\/markdown/);
  assert.equal(await response.text(), '');
});

test('leaves successful pages, redirects and server errors unchanged', async () => {
  for (const status of [200, 301, 500]) {
    const origin = new Response('original', { status });
    assert.equal(await handleRequest(request('text/markdown'), () => origin), origin);
  }
});

test('does not transform POST responses', async () => {
  const origin = origin404();
  assert.equal(await handleRequest(request('text/markdown', 'POST'), () => origin), origin);
});
