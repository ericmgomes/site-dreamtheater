import { test, expect, type Locator } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { setlists } from '../src/data/setlists';

test('static page, metadata, chronology, assets and responsive layout', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  const embedRequests: string[] = [];
  page.on('request', request => { if (/youtube-nocookie|open\.spotify\.com\/embed/.test(request.url())) embedRequests.push(request.url()); });
  await page.goto('/');
  await expect(page).toHaveTitle('Dream Theater Brasil — Shows, Vídeos, Covers, Songbooks e Discografia');
  await expect(page.locator('h1')).toHaveCount(1);
  expect(await page.locator('main > section').evaluateAll(sections => sections.map(s => s.id))).toEqual(['inicio','relembre','veja','va','toque','ouca']);
  await expect(page.locator('iframe')).toHaveCount(0);
  expect(embedRequests).toEqual([]);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','https://dreamtheater.com.br/');
  const dates = await page.locator('[data-setlist] time').evaluateAll(items => items.map(item => item.getAttribute('datetime')!));
  expect(dates).toEqual([...dates].sort().reverse());
  await page.evaluate(() => document.querySelectorAll('img').forEach(image => { image.loading = 'eager'; }));
  await expect.poll(() => page.locator('img').evaluateAll(elements => elements.filter((element): element is HTMLImageElement => element instanceof HTMLImageElement).filter(image => !image.complete || image.naturalWidth === 0).map(image => image.src)),{timeout:20000}).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await page.screenshot({ path: `test-results/${testInfo.project.name}-full.png`, fullPage: true });
  expect(errors).toEqual([]);
});

test('Brazilian history loads every page while scrolling and preserves earlier shows', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('group',{name:'Filtrar shows por país'})).toHaveCount(0);
  await expect(page.locator('[data-setlist]')).toHaveCount(setlists.length);
  await expect(page.locator('[data-setlist][data-country="BR"]')).toHaveCount(setlists.length);
  const scroller = page.getByRole('region',{name:'Histórico de shows no Brasil'});
  await expect(page.locator('[data-setlist]:visible')).toHaveCount(12);
  expect(await scroller.evaluate(element => element.scrollHeight > element.clientHeight)).toBeTruthy();
  await scroller.focus();
  await page.keyboard.press('PageDown');
  await expect.poll(() => scroller.evaluate(element => element.scrollTop)).toBeGreaterThan(0);
  for (let previous = 12; previous < setlists.length; previous += 12) {
    const count = Math.min(previous + 12,setlists.length);
    const position = await scroller.evaluate(element => { element.scrollTop = element.scrollHeight; return element.scrollTop; });
    await expect(page.locator('[data-setlist]:visible')).toHaveCount(count);
    expect(await scroller.evaluate(element => element.scrollTop)).toBeCloseTo(position,0);
    await expect(page.locator('[data-setlist]').first()).not.toHaveAttribute('hidden');
  }
  const links = await page.locator('[data-setlist]:visible a').evaluateAll(items => items.map(item => (item as HTMLAnchorElement).href));
  expect(links).toEqual(setlists.map(show => show.url));
  expect(new Set(links).size).toBe(setlists.length);
  await expect(page.locator('[data-setlist-status]')).toHaveText(`Todos os ${setlists.length} shows carregados.`);
  await expect(page.getByRole('button',{name:'Carregar mais shows'})).toBeHidden();
  await scroller.evaluate(element => { element.scrollTop = 0; });
  await expect(page.locator('[data-setlist]:visible')).toHaveCount(setlists.length);
});

test('history load-more fallback works without IntersectionObserver and preserves focus', async ({ page, isMobile }) => {
  await page.addInitScript(() => { Reflect.deleteProperty(window,'IntersectionObserver'); });
  await page.goto('/');
  for (let previous = 12; previous < setlists.length; previous += 12) {
    await page.getByRole('button',{name:'Carregar mais shows'}).click();
    await expect(page.locator('[data-setlist]:visible')).toHaveCount(Math.min(previous + 12,setlists.length));
    const firstNew = page.locator('[data-setlist] a').nth(previous);
    await expect(firstNew).toBeFocused();
    const link = (await firstNew.boundingBox())!;
    const boundary = (await page.locator(isMobile ? '[data-setlist-scroll]' : '.show-table-head').boundingBox())!;
    expect(link.y).toBeGreaterThanOrEqual(isMobile ? boundary.y : boundary.y + boundary.height);
  }
  await expect(page.getByRole('button',{name:'Carregar mais shows'})).toBeHidden();
});

test('album filters preserve content and counts', async ({ page }) => {
  await page.goto('/');
  const filters = page.getByRole('group',{name:'Filtrar discografia'});
  for (const [name,count] of [['Studio',16],['Live',10],['Compilations',1],['EPs',1],['Todos',28]] as const) {
    await filters.getByRole('button',{name,exact:true}).click();
    await expect(page.locator('[data-album]:visible')).toHaveCount(count);
    await expect(filters.getByRole('button',{name,exact:true})).toHaveAttribute('aria-pressed','true');
  }
});

test('fixed navigation, anchors, WhatsApp and enlarged text', async ({ page }) => {
  await page.goto('/');
  for (const id of ['relembre','veja','va','toque','ouca']) {
    const anchor = page.locator(`[data-nav="${id}"]`);
    await anchor.click();
    await expect(page).toHaveURL(new RegExp(`#${id}$`));
    await expect(anchor).toHaveAttribute('aria-current','location');
    const target = await page.locator(`#${id}`).boundingBox();
    const header = await page.locator('header').boundingBox();
    expect(target!.y).toBeGreaterThanOrEqual(header!.height - 1);
    expect(header!.y).toBe(0);
  }
  const whatsapp=page.getByRole('link',{name:/Fale com.*WhatsApp/});
  await expect(whatsapp).toHaveAttribute('href','https://wa.me/5511999503930');
  await expect(whatsapp).toHaveAttribute('target','_blank');
  expect((await whatsapp.boundingBox())!.width).toBeGreaterThanOrEqual(44);
  await page.addStyleTag({content:'html { font-size: 200%; }'});
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
});

test('YouTube and Spotify load only on demand and release previous players', async ({ page, isMobile }) => {
  const activate = async (locator: Locator) => {
    if (!isMobile) return locator.click();
    // Chrome needs a compositor update after scrolling past a cross-origin iframe;
    // otherwise headless mobile can send the next touch to the previous frame.
    await locator.scrollIntoViewIfNeeded();
    await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
    await locator.tap();
  };
  // Isolate our interaction contract from advertising, cookies and regional player restrictions.
  await page.route(/youtube-nocookie\.com\/embed|open\.spotify\.com\/embed/,route => route.fulfill({contentType:'text/html',body:'<!doctype html><title>Player boundary test</title><p>External media</p>'}));
  await page.goto('/');
  await expect(page.locator('iframe')).toHaveCount(0);
  await activate(page.locator('[data-video]').first());
  await expect(page.locator('iframe')).toHaveCount(1);
  await expect(page.locator('iframe')).toHaveAttribute('src',/youtube-nocookie\.com\/embed\/s6JJJyMaIfg/);
  await expect(page.frameLocator('iframe').getByText('External media')).toBeVisible();
  await activate(page.locator('[data-video]').last());
  await expect(page.locator('iframe')).toHaveCount(1);
  await expect(page.locator('[data-video-container]').first().locator('[data-video]')).toHaveCount(1);
  const album=page.locator('[data-spotify]').first();
  await activate(album);
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('iframe')).toHaveCount(1);
  await expect(page.locator('iframe')).toHaveAttribute('src',/open\.spotify\.com\/embed\/album\/0VIr9Gyc0xkTFfAf18iPRB/);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.locator('iframe')).toHaveCount(0);
  await expect(album).toBeFocused();
  await activate(page.locator('[data-spotify]').nth(1));
  await expect(page.locator('#player-title')).toHaveText('Parasomnia');
  await activate(page.getByRole('button',{name:'Fechar player'}));
  await expect(page.locator('iframe')).toHaveCount(0);
  await expect(page.getByRole('link',{name:'Ver Live at Luna Park no site oficial',exact:true})).not.toHaveAttribute('data-spotify');
});

test('WCAG accessibility and keyboard skip link', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link',{name:'Pular para o conteúdo'})).toBeFocused();
  const results = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  expect(results.violations).toEqual([]);
});

test('core content and external destinations work without JavaScript', async ({ browser }) => {
  const context=await browser.newContext({javaScriptEnabled:false});
  const page=await context.newPage();
  await page.goto('http://127.0.0.1:4322/');
  await expect(page.locator('[data-album]')).toHaveCount(28);
  await expect(page.locator('[data-setlist]')).toHaveCount(setlists.length);
  await expect(page.locator('[data-setlist][data-country="BR"]:visible')).toHaveCount(setlists.length);
  await expect(page.getByRole('button',{name:'Carregar mais shows'})).toBeHidden();
  await expect(page.getByRole('group',{name:'Filtrar shows por país'})).toHaveCount(0);
  await expect(page.locator('[data-video]').first()).toHaveAttribute('href','https://www.youtube.com/watch?v=s6JJJyMaIfg');
  await expect(page.locator('[data-spotify]').first()).toHaveAttribute('href','https://open.spotify.com/album/0VIr9Gyc0xkTFfAf18iPRB');
  await expect(page.locator('iframe')).toHaveCount(0);
  await context.close();
});
