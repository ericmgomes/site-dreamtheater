// Follow the records, not the changing scrollHeight of the paginated list.
export function initializeShowTimeline() {
  const browser = document.querySelector<HTMLElement>('[data-setlist-browser]');
  const scroller = browser?.querySelector<HTMLElement>('[data-setlist-scroll]');
  const timeline = browser?.querySelector<HTMLElement>('[data-show-timeline]');
  const list = scroller?.querySelector<HTMLElement>('.setlist-list');
  if (!browser || !scroller || !timeline || !list) return;
  const cards = [...list.querySelectorAll<HTMLElement>('[data-setlist]')];
  const ticks = [...timeline.querySelectorAll<HTMLElement>('[data-timeline-year]')];
  const status = timeline.querySelector<HTMLElement>('[data-timeline-status]');
  if (!cards.length || !ticks.length) return;
  let activeYear: string | undefined;
  let scheduled = false;

  function update() {
    scheduled = false;
    const matching = cards.filter(card => card.dataset.filterMatch !== 'false');
    const years = [...new Set(matching.map(card => card.dataset.year!))];
    const positions = new Map(years.map((year, index) => [year, index / Math.max(1, years.length - 1) * 100]));
    ticks.forEach(tick => {
      tick.hidden = !positions.has(tick.dataset.timelineYear!);
      const target = matching.find(card => card.dataset.year === tick.dataset.timelineYear);
      const link = tick.querySelector('a');
      if (target && link) link.href = `#${target.id}`;
      tick.style.setProperty('--year-position', `${positions.get(tick.dataset.timelineYear!) ?? 0}%`);
    });
    timeline!.hidden = matching.length === 0;
    browser!.classList.toggle('has-timeline', matching.length > 0);
    const visible = matching.filter(card => !card.hidden);
    const bounds = visible.map(card => card.getBoundingClientRect());
    if (!bounds.length) return;
    const viewport = scroller!.getBoundingClientRect();
    const remaining = Math.max(0, scroller!.scrollHeight - scroller!.clientHeight - scroller!.scrollTop);
    // In the final viewport, move the reading point gradually toward the last card.
    // An intermediate page's end must never be treated as the end of the archive.
    const endProgress = visible.length === matching.length ? Math.max(0, 1 - remaining / scroller!.clientHeight) : 0;
    const readingLine = viewport.top + 4 + endProgress * Math.max(0, scroller!.clientHeight - 8);
    const rows: { index: number; top: number; height: number }[] = [];
    bounds.forEach((rect, index) => {
      if (!rows.length || Math.abs(rows.at(-1)!.top - rect.top) > 1) rows.push({ index, top: rect.top, height: rect.height });
    });
    // Fractional mobile pixels must not leave the marker on the previous, off-screen row.
    const rowIndex = Math.max(0, rows.findLastIndex(row => row.top <= readingLine + 1));
    const row = rows[rowIndex];
    const nextRow = rows[rowIndex + 1];
    const rowProgress = Math.max(0, Math.min(1, (readingLine - row.top) / Math.max(1, (nextRow?.top ?? row.top + row.height) - row.top)));
    // Interpolate through each card in a grid row, including rows spanning two years.
    const position = scroller!.scrollTop <= 1 ? 0 : Math.min(visible.length - 1, row.index + rowProgress * ((nextRow?.index ?? visible.length) - row.index));
    const index = Math.floor(position);
    const year = visible[index].dataset.year!;
    const nextYear = visible[Math.min(index + 1, visible.length - 1)].dataset.year!;
    const start = positions.get(year) ?? 0;
    const end = positions.get(nextYear) ?? start;
    timeline!.style.setProperty('--timeline-progress', `${start + (end - start) * (position - index)}%`);
    if (year !== activeYear) {
      ticks.forEach(tick => {
        if (tick.dataset.timelineYear === year) tick.setAttribute('aria-current', 'date');
        else tick.removeAttribute('aria-current');
      });
      if (status) status.textContent = `Ano em destaque: ${year}.`;
      activeYear = year;
    }
  }
  function schedule() {
    if (!scheduled) { scheduled = true; requestAnimationFrame(update); }
  }
  timeline.hidden = false;
  ticks.forEach(tick => tick.querySelector('a')?.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const target = cards.find(card => card.dataset.year === tick.dataset.timelineYear && card.dataset.filterMatch !== 'false');
    if (!target) return;
    event.preventDefault();
    scroller.dispatchEvent(new CustomEvent('listreveal', { detail: target }));
    target.querySelector('a')?.focus({ preventScroll: true });
    const inset = parseFloat(getComputedStyle(scroller).paddingTop) || 0;
    scroller.scrollTo({ top: scroller.scrollTop + target.getBoundingClientRect().top - scroller.getBoundingClientRect().top - scroller.clientTop - inset, behavior: 'instant' });
    schedule();
  }));
  browser.classList.add('has-timeline');
  scroller.addEventListener('scroll', schedule, { passive: true });
  scroller.addEventListener('listpagechange', schedule);
  window.addEventListener('resize', schedule, { passive: true });
  if (typeof ResizeObserver === 'function') new ResizeObserver(schedule).observe(list);
  document.fonts.ready.then(schedule);
  update();
}
