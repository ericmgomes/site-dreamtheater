import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { loadData } from './load-data.mjs';

const { setlists } = await loadData('setlists');
const { videos, moreVideos, rankedVideos, rankingMetadata } = await loadData('videos');
const { shows } = await loadData('shows');
const { coverBands } = await loadData('coverBands');
const { guitarists } = await loadData('guitarists');
const { bassists, keyboardists } = await loadData('coverMusicians');
const { materials } = await loadData('materials');
const { discography } = await loadData('discography');
const { researchedAt } = await loadData('site');
const canonical = JSON.parse(await readFile('docs/research/discography.json', 'utf8'));
const historyCoverage = JSON.parse(await readFile('docs/research/brazil-setlists.json', 'utf8'));
assert.equal(setlists.length, historyCoverage.expectedTotal, 'Incomplete Brazilian show history');
assert.equal(setlists[0]?.date, historyCoverage.lastDate, 'Latest Brazilian show missing');
assert.equal(setlists.at(-1)?.date, historyCoverage.firstDate, 'Earliest Brazilian show missing');
const historyByYear = setlists.reduce((counts, show) => ({ ...counts, [show.date.slice(0, 4)]: (counts[show.date.slice(0, 4)] || 0) + 1 }), {});
assert.deepEqual(historyByYear, historyCoverage.countsByYear, 'Brazilian history year coverage changed');
assert(setlists.length > 0, 'Brazilian show history is empty');
assert.equal(setlists.length, new Set(setlists.map(show => show.url)).size, 'Duplicate setlists');
const historyResearch = (await Promise.all(historyCoverage.researchFiles.map(async file => JSON.parse(await readFile(`docs/research/${file}`, 'utf8'))))).flatMap(part => part.setlists);
assert.deepEqual(setlists.map(show => show.url).sort(), historyResearch.map(show => show.url).sort(), 'Brazilian history must match verified sources');
for (const [index, show] of setlists.entries()) {
  assert.equal(show.countryCode, 'BR', 'History must contain only Brazilian shows');
  assert.match(show.date, /^\d{4}-\d{2}-\d{2}$/);
  assert(show.date <= researchedAt, 'Future event in history');
  if (index) assert(setlists[index - 1].date >= show.date, 'History must be descending');
  assert.match(show.url, /^https:\/\/www\.setlist\.fm\/setlist\/dream-theater\//);
}
for (const show of shows) assert(show.date > researchedAt, 'Past event shown as upcoming');
assert.equal(videos.length, 6);
assert.equal(moreVideos.length, 20);
const videoCoverage = JSON.parse(await readFile('docs/research/youtube-ranking.json', 'utf8'));
const videoCandidates = (await Promise.all(videoCoverage.researchFiles.map(async file => JSON.parse(await readFile(`docs/research/${file}`, 'utf8'))))).flatMap(part => part.candidates);
const eligibleVideos = [...new Map(videoCandidates.filter(video => video.availableInBrazil && video.playabilityStatus === 'OK').map(video => [video.id, video])).values()].sort((a, b) => b.viewCount - a.viewCount);
assert.equal(rankingMetadata.candidateCount, eligibleVideos.length);
assert.equal(rankingMetadata.date, videoCoverage.asOf);
assert.deepEqual(rankedVideos.map(video => video.youtubeId), eligibleVideos.slice(0, 26).map(video => video.id), 'Ranking must reflect researched view counts');
assert.deepEqual(rankedVideos.map(video => video.youtubeId), videoCoverage.selectedIds);
for (const [index, video] of rankedVideos.entries()) {
  assert.match(video.youtubeId, /^[\w-]{11}$/);
  assert(video.url.endsWith(video.youtubeId));
  assert.equal(video.countryCode, 'BR');
  assert.equal(video.viewCount, eligibleVideos[index].viewCount);
  assert(Number.isInteger(video.viewCount) && video.viewCount > 0);
  if (index < 6) assert(eligibleVideos[index].playableInEmbed, 'Featured video must allow embedding');
}
assert(coverBands.length >= 1);
assert(guitarists.length >= 1);
assert(bassists.length >= 1 && keyboardists.length >= 1, 'Cover instruments must be represented');
for (const person of [...coverBands, ...guitarists, ...bassists, ...keyboardists]) {
  if (person.instagram) assert.match(person.instagram, /^https:\/\/www\.instagram\.com\//);
  assert(person.instagram || person.youtube || person.website, 'Missing musician destination');
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
for (const list of [setlists, rankedVideos, shows, coverBands, guitarists, bassists, keyboardists, materials, discography]) {
  for (const item of list) {
    for (const value of Object.values(item)) {
      if (typeof value === 'string' && value.startsWith('https://')) assert.equal(new URL(value).protocol, 'https:');
    }
  }
}
console.log(`Data OK: ${setlists.length} setlists, ${rankedVideos.length} ranked videos, ${coverBands.length} tribute bands, ${guitarists.length + bassists.length + keyboardists.length} musicians, ${materials.length} materials, ${discography.length} albums.`);
if (!shows.length) console.log('Upcoming dates: none confirmed as of research date; official schedule fallback is intentional.');
