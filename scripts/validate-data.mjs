import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { loadData } from './load-data.mjs';

const { setlists } = await loadData('setlists');
const { videos } = await loadData('videos');
const { shows } = await loadData('shows');
const { coverBands } = await loadData('coverBands');
const { guitarists } = await loadData('guitarists');
const { materials } = await loadData('materials');
const { discography } = await loadData('discography');
const { researchedAt } = await loadData('site');
const canonical = JSON.parse(await readFile('docs/research/discography.json', 'utf8'));
assert(setlists.length > 0, 'Brazilian show history is empty');
assert.equal(setlists.length, new Set(setlists.map(show => show.url)).size, 'Duplicate setlists');
for (const [index, show] of setlists.entries()) {
  assert.equal(show.countryCode, 'BR', 'History must contain only Brazilian shows');
  assert.match(show.date, /^\d{4}-\d{2}-\d{2}$/);
  assert(show.date <= researchedAt, 'Future event in history');
  if (index) assert(setlists[index - 1].date >= show.date, 'History must be descending');
  assert.match(show.url, /^https:\/\/www\.setlist\.fm\/setlist\/dream-theater\//);
}
for (const show of shows) assert(show.date > researchedAt, 'Past event shown as upcoming');
assert.equal(videos.length, 6);
for (const video of videos) { assert.match(video.youtubeId, /^[\w-]{11}$/); assert(video.url.endsWith(video.youtubeId)); }
assert(coverBands.length >= 1);
assert(guitarists.length >= 1);
for (const person of [...coverBands, ...guitarists]) {
  assert.match(person.instagram, /^https:\/\/www\.instagram\.com\//);
  assert(person.sourceUrls.length > 0, 'Missing provenance');
}
for (const instrument of ['guitar', 'bass', 'drums', 'keys']) assert(materials.some(item => item.instrument === instrument), `Missing material for ${instrument}`);
assert.equal(discography.length, canonical.albums.length, 'Incomplete official discography');
assert.equal(new Set(discography.map(album => album.officialUrl)).size, discography.length);
for (const [index, album] of discography.entries()) {
  const source = canonical.albums[index];
  assert.equal(album.officialUrl, source.officialUrl, 'Official ordering changed');
  assert.equal(album.spotifyUrl, source.spotifyUrl, 'Spotify must come from official page');
  assert.equal(album.year, source.year);
  if (album.spotifyUrl) assert.match(album.spotifyUrl, /^https:\/\/open\.spotify\.com\/album\/[a-zA-Z0-9]{22}$/);
  assert(['studio', 'live', 'compilation', 'ep'].includes(album.category));
}
for (const list of [setlists, videos, shows, coverBands, guitarists, materials, discography]) {
  for (const item of list) {
    for (const value of Object.values(item)) {
      if (typeof value === 'string' && value.startsWith('https://')) assert.equal(new URL(value).protocol, 'https:');
    }
  }
}
console.log(`Data OK: ${setlists.length} setlists, ${videos.length} videos, ${coverBands.length} tribute bands, ${guitarists.length} guitarists, ${materials.length} materials, ${discography.length} albums.`);
if (!shows.length) console.log('Upcoming dates: none confirmed as of research date; official schedule fallback is intentional.');
