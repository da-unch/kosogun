(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const reveal = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      reveal.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -5% 0px' });

  document.querySelectorAll('[data-masonry]').forEach((grid) => {
    const cards = [...grid.querySelectorAll('.card')];
    let cols = 0;

    const layout = (force) => {
      const width = grid.clientWidth;
      const n = width < 520 ? 2 : Math.max(2, Math.min(6, Math.floor(width / 240)));
      if (!force && n === cols) return;
      cols = n;
      const columns = Array.from({ length: n }, () => Object.assign(document.createElement('div'), { className: 'col' }));
      const heights = new Array(n).fill(0);
      grid.classList.add('is-masonry');
      grid.replaceChildren(...columns);
      cards.forEach((card) => {
        const i = heights.indexOf(Math.min(...heights));
        columns[i].appendChild(card);
        heights[i] += card.offsetHeight;
      });
    };

    const images = [...grid.querySelectorAll('img')];
    const loaded = Promise.all(images.map((img) => (img.complete ? null : new Promise((resolve) => {
      img.addEventListener('load', resolve, { once: true });
      img.addEventListener('error', resolve, { once: true });
    }))));

    Promise.race([loaded, new Promise((resolve) => setTimeout(resolve, 2500))]).then(() => {
      layout(true);
      cards.forEach((card, i) => {
        card.style.transitionDelay = reduce ? '0ms' : `${Math.min(i, 14) * 45}ms`;
        reveal.observe(card);
      });
      loaded.then(() => layout(true));
      new ResizeObserver(() => layout(false)).observe(grid);
    });
  });

  document.querySelectorAll('[data-carousel]').forEach((root) => {
    const track = root.querySelector('.carousel');
    const count = track.children.length;
    if (count < 2) return;
    const dots = [...root.querySelectorAll('.dots button')];
    const counter = root.querySelector('[data-counter]');
    const current = () => Math.round(track.scrollLeft / track.clientWidth);
    const go = (i) => track.scrollTo({ left: track.clientWidth * Math.max(0, Math.min(count - 1, i)), behavior: reduce ? 'auto' : 'smooth' });
    const update = () => {
      const i = current();
      dots.forEach((dot, j) => dot.setAttribute('aria-current', String(i === j)));
      if (counter) counter.textContent = `${i + 1} / ${count}`;
    };
    track.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
    dots.forEach((dot, i) => dot.addEventListener('click', () => go(i)));
    root.querySelector('[data-prev]').addEventListener('click', () => go(current() - 1));
    root.querySelector('[data-next]').addEventListener('click', () => go(current() + 1));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') go(current() - 1);
      if (e.key === 'ArrowRight') go(current() + 1);
    });
    update();
  });

  const back = document.querySelector('[data-back]');
  if (back) {
    // Returning via history keeps the grid's scroll position, like Pinterest.
    back.addEventListener('click', (e) => {
      if (document.referrer.startsWith(location.origin) && history.length > 1) {
        e.preventDefault();
        history.back();
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') back.click();
    });
  }
})();
