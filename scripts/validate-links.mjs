import { readFile, writeFile, mkdir } from 'node:fs/promises';

const html = await readFile('dist/index.html', 'utf8');
const urls = [...new Set([...html.matchAll(/href="(https:\/\/[^"]+)"/g)].map(match => match[1].replaceAll('&amp;', '&')))];
const report = [];
const internal = 'dreamtheater.com.br';
async function check(original) {
  const url = new URL(original);
  if (url.hostname === internal) return { url: original, status: 'deployment-pending', note: 'Canonical/custom domain validated in static output; requires published repository and DNS.' };
  let target = original;
  const videoId = url.hostname.includes('youtube.com') && url.searchParams.get('v');
  if (videoId) target = `https://www.youtube.com/oembed?url=${encodeURIComponent(original)}&format=json`;
  if (url.hostname === 'open.spotify.com') target = `https://open.spotify.com/oembed?url=${encodeURIComponent(original)}`;
  try {
    const response = await fetch(target, { signal: AbortSignal.timeout(20000), headers: { 'User-Agent': 'DreamTheaterBrasil-LinkCheck/1.0' } });
    const body = await response.text();
    let status = response.ok ? 'ok' : [401,403,429,999].includes(response.status) ? 'restricted' : response.status >= 500 ? 'unavailable' : 'broken';
    if (url.hostname.includes('instagram.com') && /login|log in|entrar/i.test(body)) status = 'login-gated';
    if (response.ok && target.includes('oembed')) {
      const payload = JSON.parse(body);
      return { url: original, status, http: response.status, method: 'oEmbed', title: payload.title, author: payload.author_name };
    }
    return { url: original, status, http: response.status, finalUrl: response.url };
  } catch (error) {
    return { url: original, status: 'unavailable', error: error.message };
  }
}
let next = 0;
await Promise.all(Array.from({length: 4}, async () => {
  while(next < urls.length) {
    const url = urls[next++];
    const result = await check(url);
    report.push(result);
    if (result.status !== 'ok') console.log(`${result.status}: ${url} (${result.http ?? result.error ?? ''})`);
  }
}));
report.sort((a,b) => a.url.localeCompare(b.url));
const counts = report.reduce((acc,r) => ({...acc,[r.status]:(acc[r.status]||0)+1}),{});
await mkdir('docs/research', {recursive:true});
await writeFile('docs/research/link-check.json', JSON.stringify({ checkedAt: new Date().toISOString(), counts, explanation: 'HTTP/oEmbed validates reachability, not full playback. Restricted or login-gated links must be checked against source evidence; never counted as OK.', results:report },null,2)+'\n');
console.log(JSON.stringify(counts));
if (report.some(result => result.status === 'broken')) process.exitCode = 1;
