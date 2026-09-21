import { initializeShowTimeline } from './show-timeline';

// Static content stays complete without JS; each scroll area reveals its own pages.
function initializeScrollPagination(prefix: string, rowSelector: string, noun: string, completeHint: string) {
  const scroller = document.querySelector<HTMLElement>(`[data-${prefix}-scroll]`);
  const sentinel = scroller?.querySelector<HTMLElement>(`[data-${prefix}-sentinel]`);
  const more = scroller?.querySelector<HTMLButtonElement>(`[data-${prefix}-more]`);
  if (!scroller || !sentinel || !more) return;
  const rows = [...scroller.querySelectorAll<HTMLElement>(rowSelector)];
  const cityFilter = document.querySelector<HTMLSelectElement>(`[data-${prefix}-city]`);
  let matchingRows = rows;
  const pageSize = Number(scroller.dataset.pageSize) || 12;
  const status = document.querySelector<HTMLElement>(`[data-${prefix}-status]`);
  const hint = document.querySelector<HTMLElement>(`[data-${prefix}-hint]`);
  const supportsAutoLoad = typeof IntersectionObserver === 'function';
  let visibleCount = Math.min(pageSize, rows.length);
  let observer: IntersectionObserver | undefined;
  const update = () => {
    rows.forEach(row => { row.hidden = true; });
    matchingRows.slice(0, visibleCount).forEach(row => { row.hidden = false; });
    const complete = visibleCount >= matchingRows.length;
    sentinel.hidden = complete;
    if (status) status.textContent = cityFilter?.value
      ? complete ? `${matchingRows.length} ${matchingRows.length === 1 ? 'show' : noun} em ${cityFilter.value}.` : `${visibleCount} de ${matchingRows.length} ${noun} · ${cityFilter.value}.`
      : complete ? `Todos os ${matchingRows.length} ${noun} carregados.` : `${visibleCount} de ${matchingRows.length} ${noun} carregados.`;
    if (hint) hint.textContent = complete ? completeHint : supportsAutoLoad ? `Continue rolando para carregar mais ${noun}.` : `Use Carregar mais ${noun} para continuar.`;
    if (complete) observer?.disconnect();
    scroller.dispatchEvent(new Event('listpagechange'));
  };
  // Reobserve after appending or leaving the button so fast scrolling cannot skip a page.
  const observeNext = () => {
    if (observer && visibleCount < matchingRows.length) {
      observer.unobserve(sentinel);
      observer.observe(sentinel);
    }
  };
  const loadMore = (manual = false) => {
    if (visibleCount >= matchingRows.length) return;
    const firstNew = matchingRows[visibleCount];
    visibleCount = Math.min(visibleCount + pageSize, matchingRows.length);
    update();
    observeNext();
    if (manual) firstNew?.querySelector<HTMLAnchorElement>('a')?.focus({ preventScroll: false });
  };
  more.addEventListener('click', () => loadMore(true));
  more.addEventListener('blur', observeNext);
  update();
  if (supportsAutoLoad && visibleCount < rows.length) {
    observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting) && document.activeElement !== more) loadMore();
    }, { root: scroller, rootMargin: `0px 0px ${Number(scroller.dataset.loadMargin ?? 120)}px 0px` });
    observer.observe(sentinel);
  }
  if (cityFilter) {
    document.querySelector<HTMLElement>(`[data-${prefix}-filter]`)?.removeAttribute('hidden');
    cityFilter.addEventListener('change', () => {
      observer?.disconnect();
      matchingRows = rows.filter(row => !cityFilter.value || row.dataset.city === cityFilter.value);
      rows.forEach(row => { row.dataset.filterMatch = String(!cityFilter.value || row.dataset.city === cityFilter.value); });
      visibleCount = Math.min(pageSize, matchingRows.length);
      scroller.scrollTop = 0;
      update();
      observeNext();
    });
  }
}
initializeScrollPagination('setlist', '[data-setlist]', 'shows', 'Histórico completo · Do mais recente ao mais antigo.');
initializeScrollPagination('ranking', '[data-ranked-video]', 'vídeos', 'Lista completa · Do mais visto ao menos visto.');
initializeShowTimeline();

document.querySelectorAll<HTMLElement>('[data-filter-group="album"]').forEach(group => {
  const items = document.querySelectorAll<HTMLElement>('[data-album]');
  const status = document.querySelector<HTMLElement>('[data-album-status]');
  group.querySelectorAll<HTMLButtonElement>('button').forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      group.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      let count = 0;
      items.forEach(item => {
        const visible = filter === 'all' || item.dataset.category === filter;
        item.hidden = !visible;
        if (visible) count++;
      });
      if (status) status.textContent = `${count} álbuns na seleção.`;
    });
  });
});

// Anchors remain functional without JavaScript. Only the current-section marker needs JS.
const navLinks = [...document.querySelectorAll<HTMLAnchorElement>('[data-nav]')];
const sections = navLinks.map(link => document.getElementById(link.dataset.nav!)).filter((section): section is HTMLElement => !!section);
let scheduled = false;
function updateActiveSection() {
  const header = document.querySelector('header')?.getBoundingClientRect().height ?? 100;
  const active = [...sections].reverse().find(section => section.getBoundingClientRect().top <= header + 100);
  navLinks.forEach(link => {
    if (link.dataset.nav === active?.id) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  scheduled = false;
}
window.addEventListener('scroll', () => {
  if (!scheduled) { scheduled = true; requestAnimationFrame(updateActiveSection); }
}, { passive: true });
window.addEventListener('resize', updateActiveSection, { passive: true });
updateActiveSection();

// Native modal keeps videos large while links still work without JavaScript.
const videoDialog = document.querySelector<HTMLDialogElement>('.video-dialog');
const videoContainer = document.querySelector<HTMLElement>('[data-youtube-container]');
const videoTitle = document.getElementById('video-player-title');
const videoExternal = document.querySelector<HTMLAnchorElement>('[data-youtube-external]');
const stopVideo = () => {
  videoContainer?.replaceChildren();
  if (videoDialog?.open) videoDialog.close();
};
if (videoDialog && videoContainer && videoTitle && videoExternal) {
  document.querySelectorAll<HTMLAnchorElement>('[data-video]').forEach(trigger => {
    trigger.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !videoDialog.showModal) return;
      const videoId = trigger.dataset.video;
      if (!videoId || !/^[\w-]{11}$/.test(videoId)) return;
      event.preventDefault();
      document.querySelector<HTMLDialogElement>('.spotify-dialog[open]')?.close();
      document.querySelector('[data-spotify-container]')?.replaceChildren();
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
      iframe.title = trigger.dataset.title ?? 'Vídeo do Dream Theater';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      videoTitle.textContent = iframe.title;
      videoExternal.href = trigger.href;
      videoContainer.replaceChildren(iframe);
      if (!videoDialog.open) videoDialog.showModal();
    });
  });
  videoDialog.querySelector('[data-close-video]')?.addEventListener('click', stopVideo);
  videoDialog.addEventListener('close', () => { if (!videoDialog.open) videoContainer.replaceChildren(); });
  videoDialog.addEventListener('click', event => {
    const rect = videoDialog.getBoundingClientRect();
    if (event.target === videoDialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) stopVideo();
  });
}

// Native dialog gives focus containment, Escape and focus restoration without a UI framework.
const dialog = document.querySelector<HTMLDialogElement>('.spotify-dialog');
const playerContainer = document.querySelector<HTMLElement>('[data-spotify-container]');
const playerTitle = document.getElementById('player-title');
const externalLink = document.querySelector<HTMLAnchorElement>('.player-external');
if (dialog && playerContainer && playerTitle && externalLink) {
  document.querySelectorAll<HTMLAnchorElement>('[data-spotify]').forEach(trigger => {
    trigger.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !dialog.showModal) return;
      const spotifyUrl = trigger.dataset.spotify;
      const albumId = spotifyUrl?.match(/^https:\/\/open\.spotify\.com\/album\/([a-zA-Z0-9]{22})$/)?.[1];
      if (!albumId) return;
      event.preventDefault();
      stopVideo();
      const iframe = document.createElement('iframe');
      iframe.src = `https://open.spotify.com/embed/album/${albumId}?utm_source=generator&theme=0`;
      iframe.title = `Ouvir ${trigger.dataset.albumTitle} no Spotify`;
      iframe.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      playerTitle.textContent = trigger.dataset.albumTitle ?? '';
      externalLink.href = spotifyUrl!;
      playerContainer.replaceChildren(iframe);
      dialog.showModal();
    });
  });
  dialog.querySelector('.close-player')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => playerContainer.replaceChildren());
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
}
