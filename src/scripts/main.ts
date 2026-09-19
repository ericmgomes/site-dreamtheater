// All shows are present in the static HTML; reveal another page near the list's end.
const historyScroller = document.querySelector<HTMLElement>('[data-setlist-scroll]');
const historySentinel = document.querySelector<HTMLElement>('[data-setlist-sentinel]');
const historyMore = document.querySelector<HTMLButtonElement>('[data-setlist-more]');
if (historyScroller && historySentinel && historyMore) {
  const rows = [...historyScroller.querySelectorAll<HTMLElement>('[data-setlist]')];
  const pageSize = Number(historyScroller.dataset.pageSize) || 12;
  const status = document.querySelector<HTMLElement>('[data-setlist-status]');
  const hint = document.querySelector<HTMLElement>('[data-setlist-hint]');
  const supportsAutoLoad = typeof IntersectionObserver === 'function';
  let visibleCount = Math.min(pageSize, rows.length);
  let observer: IntersectionObserver | undefined;
  const updateHistory = () => {
    rows.forEach((row, index) => { row.hidden = index >= visibleCount; });
    const complete = visibleCount >= rows.length;
    historySentinel.hidden = complete;
    if (status) status.textContent = complete ? `Todos os ${rows.length} shows carregados.` : `${visibleCount} de ${rows.length} shows carregados.`;
    if (hint) hint.textContent = complete ? 'Histórico completo · Do mais recente ao mais antigo.' : supportsAutoLoad ? 'Continue rolando para carregar mais shows.' : 'Use Carregar mais shows para continuar.';
    if (complete) observer?.disconnect();
  };
  const loadMore = (manual = false) => {
    if (visibleCount >= rows.length) return;
    const firstNew = rows[visibleCount];
    visibleCount = Math.min(visibleCount + pageSize, rows.length);
    updateHistory();
    // Reobserve after appending so fast scrolling cannot skip the next intersection.
    if (observer && visibleCount < rows.length) {
      observer.unobserve(historySentinel);
      observer.observe(historySentinel);
    }
    if (manual) firstNew?.querySelector<HTMLAnchorElement>('a')?.focus({ preventScroll: false });
  };
  historyMore.addEventListener('click', () => loadMore(true));
  historyMore.addEventListener('blur', () => {
    if (observer && visibleCount < rows.length) {
      observer.unobserve(historySentinel);
      observer.observe(historySentinel);
    }
  });
  updateHistory();
  if (supportsAutoLoad && visibleCount < rows.length) {
    observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting) && document.activeElement !== historyMore) loadMore();
    }, { root: historyScroller, rootMargin: '0px 0px 120px 0px' });
    observer.observe(historySentinel);
  }
}

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

// One YouTube player at a time; links are still usable if embeds are blocked or JS is off.
let activeVideo: { container: HTMLElement; trigger: HTMLAnchorElement } | undefined;
const stopVideo = () => {
  if (activeVideo) activeVideo.container.replaceChildren(activeVideo.trigger);
  activeVideo = undefined;
};
document.querySelectorAll<HTMLAnchorElement>('[data-video]').forEach(trigger => {
  trigger.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const container = trigger.closest<HTMLElement>('[data-video-container]');
    if (!container) return;
    event.preventDefault();
    stopVideo();
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${trigger.dataset.video}?autoplay=1&rel=0`;
    iframe.title = trigger.dataset.title ?? 'Vídeo do Dream Theater';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    container.replaceChildren(iframe);
    activeVideo = { container, trigger };
    // Transfer keyboard focus without moving the viewport or capturing a touch gesture.
    if (event.detail === 0) iframe.focus({ preventScroll: true });
  });
});

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
