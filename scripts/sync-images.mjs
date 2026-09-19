// Maintenance-only download. No network request is needed to build or serve the site.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { Buffer } from 'node:buffer';
import sharp from 'sharp';
import { loadData } from './load-data.mjs';

const research = JSON.parse(await readFile('docs/research/discography.json', 'utf8'));
const { guitarists } = await loadData('guitarists');
await mkdir('public/images/albums', { recursive: true });
await mkdir('public/images/musicians', { recursive: true });
const albums = [];
for (const { slug, evidence, sourceNote, ...album } of research.albums) {
  const response = await fetch(album.cover, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`Cover HTTP ${response.status}: ${album.title}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  const filename = `${slug}.webp`;
  await sharp(buffer).resize(480, 480, { fit: 'cover' }).webp({ quality: 83 }).toFile(`public/images/albums/${filename}`);
  albums.push({ ...album, cover: `/images/albums/${filename}`, ...(sourceNote ? { sourceNote } : {}) });
}
await writeFile('src/data/discography.ts', `// Official source URLs and provenance: docs/research/discography.json\nimport type { Album } from './types';\n\nexport const discography: Album[] = ${JSON.stringify(albums, null, 2)};\n`);
for (const musician of guitarists) {
  if (!musician.image?.startsWith('https://')) continue;
  const response = await fetch(musician.image, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`Portrait HTTP ${response.status}: ${musician.name}`);
  const filename = musician.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replaceAll(' ', '-') + '.webp';
  await sharp(Buffer.from(await response.arrayBuffer())).resize(200, 200, { fit: 'cover', position: 'attention' }).webp({ quality: 85 }).toFile(`public/images/musicians/${filename}`);
  musician.image = `/images/musicians/${filename}`;
}
await writeFile('src/data/guitarists.ts', `import type { Guitarist } from './types';\n\nexport const guitarists: Guitarist[] = ${JSON.stringify(guitarists, null, 2)};\n`);
console.log(`Saved ${albums.length} optimized album covers and available artist portraits.`);
