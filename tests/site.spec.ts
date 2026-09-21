import { test, expect, type Locator } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { setlists } from '../src/data/setlists';
import { videos, moreVideos } from '../src/data/videos';

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
  // A compact grid can reach the next page with one PageDown; reset for exact batch checks.
  await page.reload();
  await scroller.focus();
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

test('city filter updates shows, timeline and pagination when returning to all cities', async ({ page }) => {
  await page.goto('/');
  const filter = page.getByRole('combobox', {name:'Cidade',exact:true});
  const scroller = page.locator('[data-setlist-scroll]');
  const cities = [...new Set(setlists.map(show => show.city))].sort((a,b) => a.localeCompare(b,'pt-BR'));
  expect(await filter.locator('option').evaluateAll(options => options.map(option => (option as HTMLOptionElement).value))).toEqual(['',...cities]);
  for (const city of cities) {
    await filter.selectOption(city);
    const expected = setlists.filter(show => show.city === city);
    await expect(page.locator('[data-setlist]:visible')).toHaveCount(Math.min(12,expected.length));
    for (let count = 12; count < expected.length; count += 12) {
      await scroller.evaluate(element => {element.scrollTop = element.scrollHeight;});
      await expect(page.locator('[data-setlist]:visible')).toHaveCount(Math.min(count+12,expected.length));
    }
    expect(await page.locator('[data-setlist]:visible a').evaluateAll(links=>links.map(link=>(link as HTMLAnchorElement).href))).toEqual(expected.map(show=>show.url));
    await expect(page.locator('[data-setlist-status]')).toContainText(city);
    const years = [...new Set(expected.map(show=>show.date.slice(0,4)))];
    await expect.poll(()=>page.locator('[data-timeline-year]:visible').allTextContents()).toEqual(years);
    await expect(page.locator('[data-timeline-year][aria-current="date"]')).toBeVisible();
    if (expected.length <= 12) await expect(page.locator('[data-setlist-more]')).toBeHidden();
  }
  await filter.selectOption('');
  await expect(page.locator('[data-setlist]:visible')).toHaveCount(12);
  expect(await scroller.evaluate(element=>element.scrollTop)).toBe(0);
  await expect(page.locator('[data-timeline-year][aria-current="date"]')).toHaveText('2026');
  await scroller.evaluate(element=>{element.scrollTop=element.scrollHeight;});
  await expect(page.locator('[data-setlist]:visible')).toHaveCount(24);
});

test('scroll lists have manual fallback without IntersectionObserver and preserve focus', async ({ page }) => {
  await page.addInitScript(() => { Reflect.deleteProperty(window,'IntersectionObserver'); });
  await page.goto('/');
  await page.getByRole('combobox',{name:'Cidade',exact:true}).selectOption('Olinda');
  await expect(page.locator('[data-setlist]:visible')).toHaveCount(setlists.filter(show=>show.city==='Olinda').length);
  await page.getByRole('combobox',{name:'Cidade',exact:true}).selectOption('');
  for (let previous = 12; previous < setlists.length; previous += 12) {
    await page.getByRole('button',{name:'Carregar mais shows'}).click();
    await expect(page.locator('[data-setlist]:visible')).toHaveCount(Math.min(previous + 12,setlists.length));
    const firstNew = page.locator('[data-setlist] a').nth(previous);
    await expect(firstNew).toBeFocused();
    const link = (await firstNew.boundingBox())!;
    const boundary = (await page.locator('[data-setlist-scroll]').boundingBox())!;
    expect(link.y).toBeGreaterThanOrEqual(boundary.y);
    expect(link.y + link.height).toBeLessThanOrEqual(boundary.y + boundary.height);
  }
  await expect(page.getByRole('button',{name:'Carregar mais shows'})).toBeHidden();
  for (let previous = 5; previous < moreVideos.length; previous += 5) {
    await page.getByRole('button',{name:'Carregar mais vídeos'}).click();
    await expect(page.locator('[data-ranked-video]:visible')).toHaveCount(Math.min(previous + 5,moreVideos.length));
    await expect(page.locator('[data-ranked-video] a').nth(previous)).toBeFocused();
  }
  await expect(page.getByRole('button',{name:'Carregar mais vídeos'})).toBeHidden();
});

test('show timeline follows loaded records in both directions and after responsive resize', async ({ page, isMobile }) => {
  await page.goto('/');
  const scroller = page.locator('[data-setlist-scroll]');
  const timeline = page.locator('[data-show-timeline]');
  const activeYear = timeline.locator('[aria-current="date"]');
  const progress = () => timeline.evaluate(element => parseFloat(element.style.getPropertyValue('--timeline-progress')));
  await expect(timeline).toBeVisible();
  await expect(timeline.locator('[data-timeline-year]')).toHaveText([...new Set(setlists.map(show => show.date.slice(0,4)))]);
  await expect(activeYear).toHaveText('2026');
  expect(await progress()).toBe(0);
  await scroller.focus();
  for (let previous = 12; previous < setlists.length; previous += 12) {
    await scroller.evaluate(element => { element.scrollTop = element.scrollHeight; });
    await expect(page.locator('[data-setlist]:visible')).toHaveCount(previous + 12);
    await expect(activeYear).not.toHaveText('1997');
    await expect(scroller).toBeFocused();
  }
  await scroller.evaluate(element => { element.scrollTop = element.scrollHeight; });
  await expect(activeYear).toHaveText('1997');
  await expect.poll(progress).toBe(100);
  const goToCard = async (index: number) => {
    await page.locator('[data-setlist]').nth(index).evaluate(card => {
      const container = card.closest<HTMLElement>('[data-setlist-scroll]')!;
      container.scrollTop += card.getBoundingClientRect().top - container.getBoundingClientRect().top - 4;
    });
  };
  await goToCard(24);
  await expect(activeYear).toHaveText('2014');
  await page.locator('#relembre').evaluate(section => section.scrollIntoView({block:'start'}));
  await page.screenshot({path:`test-results/timeline-${isMobile ? 'mobile' : 'desktop'}.png`});
  const middle = await progress();
  await goToCard(18);
  await expect(activeYear).toHaveText('2016');
  expect(await progress()).toBeLessThan(middle);
  if (!isMobile) {
    for (const width of [900,390,1440]) {
      await page.setViewportSize({width,height:1000});
      await expect.poll(async () => {
        const year = await activeYear.textContent();
        return page.locator('[data-setlist-scroll]').evaluate((element, year) => {
          const viewport = element.getBoundingClientRect();
          return [...element.querySelectorAll<HTMLElement>('[data-setlist]')].some(card => {
            const rect = card.getBoundingClientRect();
            return !card.hidden && card.dataset.year === year && rect.bottom > viewport.top && rect.top < viewport.bottom;
          });
        },year);
      }).toBeTruthy();
    }
  }
  await scroller.evaluate(element => { element.scrollTop = 0; });
  await expect(activeYear).toHaveText('2026');
  await expect.poll(progress).toBe(0);
});

test('Brazil video ranking scrolls independently and covers are grouped by instrument', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-nav="relembre"]')).toHaveText('Shows');
  await expect(page.locator('[data-nav="va"]')).toHaveText('Covers');
  await expect(page.locator('#remember-title')).toHaveText('Shows');
  await expect(page.locator('#go-title')).toHaveText('Covers');
  await expect(page.locator('.tour-panel')).toHaveCount(0);
  await expect(page.locator('.video-card')).toHaveCount(6);
  const scroller = page.getByRole('region',{name:'Mais vídeos do Dream Theater no Brasil'});
  await expect(page.locator('[data-ranked-video]:visible')).toHaveCount(5);
  await expect(page.locator('[data-ranked-video][data-country="BR"]')).toHaveCount(44);
  expect(await scroller.evaluate(element => element.scrollHeight > element.clientHeight)).toBeTruthy();
  await scroller.focus();
  for (let previous = 5; previous < moreVideos.length; previous += 5) {
    const position = await scroller.evaluate(element => { element.scrollTop = element.scrollHeight; return element.scrollTop; });
    await expect(page.locator('[data-ranked-video]:visible')).toHaveCount(Math.min(previous + 5, moreVideos.length));
    expect(await scroller.evaluate(element => element.scrollTop)).toBeCloseTo(position,0);
  }
  expect(await page.locator('[data-ranked-video] a').evaluateAll(links => links.map(link => (link as HTMLAnchorElement).href))).toEqual(moreVideos.map(video => video.url));
  await expect(page.locator('[data-ranking-status]')).toHaveText('Todos os 44 vídeos carregados.');
  await expect(page.getByRole('button',{name:'Carregar mais vídeos'})).toBeHidden();
  // Loading videos must not consume a page of the separate show history.
  await expect(page.locator('[data-setlist]:visible')).toHaveCount(12);
  for (const [instrument,count] of [['guitar',6],['bass',3],['keys',3]] as const) {
    await expect(page.locator(`#va [data-instrument="${instrument}"] .musician-item`)).toHaveCount(count);
  }
  for (const name of ['Samuel Zechin','Marcelo Barbosa','Alex Lima']) await expect(page.locator('#va').getByRole('heading',{name,exact:true})).toHaveCount(1);
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
  const timelineLabelRight = await page.locator('[data-timeline-year]').evaluateAll(labels => Math.max(...labels.map(label => label.getBoundingClientRect().right)));
  expect(timelineLabelRight).toBeLessThan((await page.locator('[data-setlist-scroll]').boundingBox())!.x);
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
  const firstVideo = page.locator('.video-trigger').first();
  const videoModal = page.locator('.video-dialog');
  await activate(firstVideo);
  await expect(videoModal).toBeVisible();
  await expect(page.getByRole('button', { name: 'Fechar vídeo' })).toBeFocused();
  await expect(page.locator('iframe')).toHaveCount(1);
  await expect(page.locator('iframe')).toHaveAttribute('src',`https://www.youtube-nocookie.com/embed/${videos[0].youtubeId}?autoplay=1&rel=0`);
  await expect(page.frameLocator('iframe').getByText('External media')).toBeVisible();
  const bounds = await videoModal.boundingBox();
  expect(bounds!.width).toBeGreaterThan(page.viewportSize()!.width * .94);
  expect(bounds!.width).toBeLessThan(page.viewportSize()!.width);
  expect(bounds!.height).toBeLessThanOrEqual(page.viewportSize()!.height * .95);
  await expect(page.locator('[data-youtube-external]')).toHaveAttribute('href', videos[0].url);
  const modalA11y = await new AxeBuilder({page}).include('.video-dialog').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  expect(modalA11y.violations).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(videoModal).not.toBeVisible();
  await expect(page.locator('iframe')).toHaveCount(0);
  await expect(firstVideo).toBeFocused();
  const caption = page.locator('.video-caption [data-video]').last();
  await activate(caption);
  await expect(page.locator('iframe')).toHaveAttribute('src',`https://www.youtube-nocookie.com/embed/${videos[5].youtubeId}?autoplay=1&rel=0`);
  await activate(page.getByRole('button', {name:'Fechar vídeo'}));
  await expect(page.locator('iframe')).toHaveCount(0);
  await expect(caption).toBeFocused();
  const rankedVideo = page.locator('.ranked-video-link').first();
  await activate(rankedVideo);
  await expect(page.locator('iframe')).toHaveAttribute('src',`https://www.youtube-nocookie.com/embed/${moreVideos[0].youtubeId}?autoplay=1&rel=0`);
  // The small outer gutter is the modal backdrop on desktop and mobile.
  await page.mouse.click(1, 1);
  await expect(videoModal).not.toBeVisible();
  await expect(page.locator('iframe')).toHaveCount(0);
  await expect(rankedVideo).toBeFocused();
  const album=page.locator('[data-spotify]').first();
  await activate(album);
  await expect(page.locator('.spotify-dialog')).toBeVisible();
  await expect(page.locator('iframe')).toHaveCount(1);
  await expect(page.locator('iframe')).toHaveAttribute('src',/open\.spotify\.com\/embed\/album\/0VIr9Gyc0xkTFfAf18iPRB/);
  await page.keyboard.press('Escape');
  await expect(page.locator('.spotify-dialog')).not.toBeVisible();
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
  await expect(page.locator('[data-show-timeline]')).toBeHidden();
  await expect(page.getByRole('button',{name:'Carregar mais shows'})).toBeHidden();
  await expect(page.getByRole('group',{name:'Filtrar shows por país'})).toHaveCount(0);
  await expect(page.locator('[data-video]').first()).toHaveAttribute('href',videos[0].url);
  await expect(page.locator('[data-ranked-video]:visible')).toHaveCount(44);
  await expect(page.getByRole('button',{name:'Carregar mais vídeos'})).toBeHidden();
  await expect(page.locator('[data-spotify]').first()).toHaveAttribute('href','https://open.spotify.com/album/0VIr9Gyc0xkTFfAf18iPRB');
  await expect(page.locator('iframe')).toHaveCount(0);
  await context.close();
});
