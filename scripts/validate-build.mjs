import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const html = await readFile('dist/index.html', 'utf8');
assert.equal((html.match(/<h1\b/g) || []).length, 1, 'Exactly one H1');
assert(!/<iframe\b/.test(html), 'Players must not be present initially');
assert(!/<astro-island\b/.test(html), 'No hydrated framework needed');
assert(html.includes('lang="pt-BR"'));
assert(html.includes('href="https://dreamtheater.com.br/" rel="canonical"') || html.includes('rel="canonical" href="https://dreamtheater.com.br/"'));
for (const name of ['description', 'twitter:card', 'twitter:title', 'twitter:description']) assert(html.includes(`name="${name}"`));
for (const name of ['og:type', 'og:locale', 'og:site_name', 'og:title', 'og:description', 'og:url']) assert(html.includes(`property="${name}"`));
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(ids.length, new Set(ids).size, 'Duplicate IDs');
for (const match of html.matchAll(/href="#([^"]+)"/g)) assert(ids.includes(match[1]), `Missing anchor: ${match[1]}`);
for (const name of ['relembre', 'veja', 'va', 'toque', 'ouca']) assert(ids.includes(name));
assert(html.includes('https://wa.me/5511999503930'));
assert.equal((await readFile('dist/CNAME', 'utf8')).trim(), 'dreamtheater.com.br');
assert((await readFile('dist/robots.txt', 'utf8')).includes('https://dreamtheater.com.br/sitemap.xml'));
assert((await readFile('dist/sitemap.xml', 'utf8')).includes('<loc>https://dreamtheater.com.br/</loc>'));
for (const match of html.matchAll(/(?:src|href)="(\/[^"?#]+)"/g)) await stat(path.join('dist', decodeURI(match[1])));
const entries = await readdir('dist');
assert(!entries.includes('server'), 'Server output is forbidden');
assert(!entries.includes('_worker.js'), 'Worker output is forbidden');
const scripts = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(match => match[1]);
for (const script of scripts) {
  const bytes = (await stat(path.join('dist', script))).size;
  assert(bytes < 15000, `Unexpectedly large client bundle: ${bytes} bytes`);
  console.log(`Client JS: ${bytes} bytes`);
}
const inlineModules = [...html.matchAll(/<script[^>]*type="module"[^>]*>([\s\S]*?)<\/script>/g)];
for (const script of inlineModules) {
  const bytes = new TextEncoder().encode(script[1]).length;
  assert(bytes < 15000, `Unexpectedly large inline client bundle: ${bytes} bytes`);
  console.log(`Inline client JS: ${bytes} bytes`);
}
console.log('Static build OK: metadata, unique H1, anchors, local assets, on-demand players, CNAME, robots and sitemap.');
