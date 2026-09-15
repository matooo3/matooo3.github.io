/* A finite, opt-in project stream. The existing featured grids remain the source. */
(() => {
  const section = document.querySelector('#projekte.selected');
  if (!section) return;
  const first = section.querySelector('.featured-grid');
  const more = section.querySelector('#more-featured');
  const moreButton = section.querySelector('#show-more-projects');
  const en = document.documentElement.lang === 'en';
  const words = en ? {
    standard: 'Standard', flow: 'Flow view', view: 'Featured project view',
    eyebrow: 'IDEAS IN MOTION', hint: 'Scroll or drag to explore · Click to discover',
    touch: 'Swipe to explore · Tap to discover', prev: 'Previous', next: 'Next',
    pause: 'Pause animation', play: 'Play animation', gallery: 'View full gallery',
    end: 'There’s more to discover.', endText: 'Every project. A new perspective.',
    projects: 'projects', scene: 'Featured projects. Navigate with the left and right arrow keys. Enter opens the selected project.'
  } : {
    standard: 'Standard', flow: 'Flow-Ansicht', view: 'Ansicht der ausgewählten Projekte',
    eyebrow: 'IDEEN IN BEWEGUNG', hint: 'Scrollen oder ziehen · Anklicken zum Entdecken',
    touch: 'Wischen zum Entdecken · Antippen zum Öffnen', prev: 'Zurück', next: 'Weiter',
    pause: 'Animation pausieren', play: 'Animation starten', gallery: 'Zur ganzen Galerie',
    end: 'Da ist noch mehr.', endText: 'Alle Projekte. Eine neue Perspektive.',
    projects: 'Projekte', scene: 'Ausgewählte Projekte. Mit den Pfeiltasten links und rechts navigieren. Enter öffnet das ausgewählte Projekt.'
  };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const switcher = document.createElement('div');
  switcher.className = 'featured-view-switch';
  switcher.setAttribute('role', 'group');
  switcher.setAttribute('aria-label', words.view);
  switcher.innerHTML = `<button type="button" data-featured-view="standard" aria-pressed="true"><span aria-hidden="true">▦</span>${words.standard}</button><button type="button" data-featured-view="flow" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none"><path d="M2 8h10M2 12h7M2 16h10M14 6l7 6-7 6"/></svg>${words.flow}</button>`;
  first.before(switcher);
  const [standardButton, flowButton] = switcher.querySelectorAll('button');
  let active = false, expanded = moreButton.getAttribute('aria-expanded') === 'true';
  let flow, stage, deck, cards = [], titles = [], currentLink, counter, prev, next, pauseButton;
  let current = 0, target = 0, spacing = 420, frame = 0, timer = 0, lastTime = 0;
  let visible = true, paused = false, hovered = false, dragging = false, moved = false;
  let pointer, startX = 0, startY = 0, startTarget = 0, suppressClick = 0, wheelAt = 0, wheelTotal = 0, serial = 0;
  const clamp = value => Math.max(0, Math.min(cards.length - 1, value));
  const canRun = () => active && visible && !document.hidden;
  const canAuto = () => canRun() && !paused && !reduced.matches && !hovered && !dragging && !stage.contains(document.activeElement) && target < cards.length - 1;

  function cloneVisual(source) {
    const copy = source.cloneNode(true), prefix = `flow-${++serial}-`;
    const ids = new Map([...copy.querySelectorAll('[id]')].map(node => [node.id, prefix + node.id]));
    for (const node of [copy, ...copy.querySelectorAll('*')]) {
      if (node.id) node.id = ids.get(node.id) || prefix + node.id;
      for (const attr of [...node.attributes]) {
        let value = attr.value;
        for (const [id, replacement] of ids) {
          value = value.replaceAll(`url(#${id})`, `url(#${replacement})`);
          if (['href', 'xlink:href'].includes(attr.name) && value === '#' + id) value = '#' + replacement;
          if (['aria-labelledby', 'aria-describedby'].includes(attr.name)) value = value.split(' ').map(part => part === id ? replacement : part).join(' ');
        }
        if (value !== attr.value) node.setAttribute(attr.name, value);
      }
    }
    copy.setAttribute('aria-hidden', 'true');
    copy.querySelectorAll('img').forEach(img => { img.draggable = false; });
    return copy;
  }
  function init() {
    if (flow) return;
    flow = document.createElement('div'); flow.id = 'featured-flow'; flow.className = 'featured-flow'; flow.hidden = true;
    flow.innerHTML = `<div class="flow-stage" tabindex="0" role="region" aria-roledescription="carousel" aria-label="${words.scene}"><div class="flow-atmosphere" aria-hidden="true"><div class="flow-light"></div><div class="flow-lines"></div><div class="flow-dust"></div></div><div class="flow-eyebrow">${words.eyebrow}<span aria-hidden="true">— →</span></div><div class="flow-deck"></div><div class="flow-hint"><span class="flow-desktop-hint">${words.hint}</span><span class="flow-touch-hint">${words.touch}</span></div></div><div class="flow-navigation"><button type="button" class="flow-arrow" data-flow-prev aria-label="${words.prev}">←</button><a class="flow-current"><span class="flow-counter" role="status" aria-live="polite" aria-atomic="true"></span><strong></strong></a><button type="button" class="flow-arrow" data-flow-next aria-label="${words.next}">→</button><button type="button" class="flow-pause" aria-pressed="false" aria-label="${words.pause}" title="${words.pause}">Ⅱ</button></div>`;
    first.before(flow);
    stage = flow.querySelector('.flow-stage'); deck = flow.querySelector('.flow-deck');
    currentLink = flow.querySelector('.flow-current'); counter = flow.querySelector('.flow-counter');
    prev = flow.querySelector('[data-flow-prev]'); next = flow.querySelector('[data-flow-next]'); pauseButton = flow.querySelector('.flow-pause');
    prev.addEventListener('click', () => go(Math.round(target) - 1));
    next.addEventListener('click', () => go(Math.round(target) + 1));
    pauseButton.addEventListener('click', () => { paused = !paused; sync(); });
    stage.addEventListener('keydown', event => {
      if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        if (event.target !== stage) stage.focus({ preventScroll: true });
        go(event.key === 'Home' ? 0 : event.key === 'End' ? cards.length - 1 : Math.round(target) + (event.key === 'ArrowRight' ? 1 : -1));
      } else if (event.target === stage && ['Enter', ' '].includes(event.key)) { event.preventDefault(); currentLink.click(); }
    });
    stage.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') { hovered = true; sync(); } });
    stage.addEventListener('pointerleave', event => { if (event.pointerType === 'mouse') { hovered = false; sync(); } if (dragging && !moved) finishDrag(); });
    stage.addEventListener('focusin', sync);
    stage.addEventListener('focusout', () => queueMicrotask(sync));
    stage.addEventListener('wheel', event => {
      if (event.ctrlKey || !active) return;
      const delta = (Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY) * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? stage.clientHeight : 1);
      const direction = Math.sign(delta), destination = clamp(Math.round(target) + direction);
      if (destination === Math.round(target)) return; // Let the page scroll past either end.
      event.preventDefault();
      const now = performance.now();
      if (now - wheelAt > 250 || Math.sign(wheelTotal) !== direction) wheelTotal = 0;
      wheelTotal += delta;
      if (Math.abs(wheelTotal) >= 35 && now - wheelAt > 220) { go(destination); wheelAt = now; wheelTotal = 0; }
    }, { passive: false });
    stage.addEventListener('pointerdown', event => {
      if (event.button !== 0) return;
      dragging = true; moved = false; pointer = event.pointerId; startX = event.clientX; startY = event.clientY; startTarget = current; sync();
    });
    stage.addEventListener('pointermove', event => {
      if (!dragging || event.pointerId !== pointer) return;
      const dx = event.clientX - startX, dy = event.clientY - startY;
      if (!moved && Math.abs(dy) > Math.abs(dx) + 8) { finishDrag(); return; }
      if (!moved && Math.abs(dx) > 7) { moved = true; stage.setPointerCapture(pointer); stage.classList.add('is-dragging'); }
      if (moved) { target = clamp(startTarget - dx / spacing); if (reduced.matches) { current = target; paint(); } wake(); }
    });
    stage.addEventListener('pointerup', finishDrag);
    stage.addEventListener('pointercancel', finishDrag);
    stage.addEventListener('lostpointercapture', finishDrag);
    stage.addEventListener('dragstart', event => event.preventDefault());
    stage.addEventListener('click', event => { if (performance.now() < suppressClick) { event.preventDefault(); event.stopPropagation(); } }, true);
    new ResizeObserver(() => { spacing = Math.min(435, stage.clientWidth * .77); paint(); }).observe(stage);
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }, { threshold: .08 }).observe(stage);
    document.addEventListener('visibilitychange', sync);
    reduced.addEventListener('change', () => { current = target = Math.round(target); paint(); sync(); });
  }
  function finishDrag() {
    if (!dragging) return;
    dragging = false;
    if (moved) suppressClick = performance.now() + 300;
    stage.classList.remove('is-dragging');
    if (stage.hasPointerCapture(pointer)) stage.releasePointerCapture(pointer);
    go(Math.round(target));
  }
  function refresh() {
    const oldHref = cards[Math.round(target)]?.getAttribute('href');
    const sources = [...first.children, ...more.children];
    deck.replaceChildren(); titles = [];
    cards = sources.map(source => {
      const link = document.createElement('a'); link.className = 'flow-card';
      link.href = source.querySelector('.visual-link').getAttribute('href');
      const name = source.querySelector('h3').textContent; titles.push(name);
      link.setAttribute('aria-label', name); link.tabIndex = -1;
      const caption = document.createElement('div'); caption.className = 'flow-card-caption';
      const heading = document.createElement('strong'); heading.textContent = name;
      const arrow = document.createElement('span'); arrow.textContent = '↗'; arrow.setAttribute('aria-hidden', 'true');
      const description = document.createElement('p'); description.textContent = source.querySelector(':scope > p').textContent;
      caption.append(heading, arrow, description); link.append(cloneVisual(source.querySelector('.project-visual')), caption); deck.append(link); return link;
    });
    const finale = document.createElement('a'); finale.className = 'flow-card flow-finale';
    finale.href = en ? '/projects/' : '/de/projects/'; finale.tabIndex = -1;
    finale.innerHTML = `<div class="flow-finale-art" aria-hidden="true"><i></i><i></i><i></i><span>↗</span></div><div class="flow-finale-copy"><span>${words.endText}</span><strong>${words.end}</strong><span class="flow-gallery-cta">${words.gallery} ↗</span></div>`;
    finale.setAttribute('aria-label', words.gallery); deck.append(finale); cards.push(finale); titles.push(words.gallery);
    // Keep the current project when switching views.
    const oldIndex = cards.findIndex(card => card.getAttribute('href') === oldHref);
    current = target = Math.max(0, oldIndex);
    paint(); sync();
  }
  function paint() {
    if (!active || !cards.length) return;
    cards.forEach((card, i) => {
      const d = i - current, distance = Math.abs(d);
      const show = distance < 2.65;
      if (card.hidden === show) card.hidden = !show;
      if (!show) return;
      // A straight stream: departed cards recede upwards; incoming cards fly in from the right.
      const depth = Math.max(0, Math.min(1, distance));
      const x = d * spacing * (d < 0 ? .87 : 1);
      const y = d < 0 ? -Math.min(115, distance * 65) : Math.min(32, distance * 22);
      const scale = 1 - Math.min(.48, distance * .20);
      card.style.transform = `translate(-50%,-50%) translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) scale(${scale.toFixed(4)}) perspective(1000px) rotateY(${(d * -12).toFixed(2)}deg) rotateZ(${(d * 2).toFixed(2)}deg)`;
      card.style.opacity = String(Math.max(0, Math.min(1, (2.65 - distance) * 1.6)));
      card.style.zIndex = String(Math.round(100 - distance * 20));
      card.classList.toggle('is-current', i === Math.round(current));
      card.tabIndex = i === Math.round(current) ? 0 : -1;
    });
    const index = clamp(Math.round(target));
    currentLink.href = cards[index].getAttribute('href');
    const title = currentLink.querySelector('strong');
    if (title.textContent !== titles[index]) title.textContent = titles[index];
    const countText = index === cards.length - 1 ? `${cards.length - 1} ${words.projects} · ↗` : `${String(index + 1).padStart(2, '0')} / ${String(cards.length - 1).padStart(2, '0')}`;
    if (counter.textContent !== countText) counter.textContent = countText;
    prev.disabled = target <= 0; next.disabled = target >= cards.length - 1;
  }
  function schedule() {
    clearTimeout(timer); timer = 0;
    if (canAuto()) timer = setTimeout(() => { timer = 0; if (canAuto()) go(Math.round(target) + 1); }, 4200);
  }
  function animate(time) {
    frame = 0;
    if (!canRun()) return;
    const dt = Math.min(45, time - (lastTime || time)); lastTime = time;
    current += (target - current) * (1 - Math.exp(-dt / 160));
    if (Math.abs(target - current) < .001) current = target;
    paint();
    if (current !== target) frame = requestAnimationFrame(animate);
    else schedule();
  }
  function wake() { if (!frame && canRun() && current !== target) { lastTime = 0; frame = requestAnimationFrame(animate); } }
  function sync() {
    if (!flow) return;
    clearTimeout(timer); timer = 0;
    if (frame) cancelAnimationFrame(frame); frame = 0;
    flow.classList.toggle('flow-still', !canAuto());
    pauseButton.hidden = reduced.matches;
    pauseButton.setAttribute('aria-pressed', String(paused));
    pauseButton.setAttribute('aria-label', paused ? words.play : words.pause); pauseButton.title = paused ? words.play : words.pause;
    pauseButton.textContent = paused ? '▷' : 'Ⅱ';
    wake(); if (current === target) schedule();
  }
  function go(value) {
    target = clamp(value);
    clearTimeout(timer); timer = 0;
    if (reduced.matches) current = target;
    paint(); sync();
  }
  function setView(value) {
    if (value) init();
    active = value;
    first.hidden = value; more.hidden = value || !expanded;
    moreButton.hidden = value;
    standardButton.setAttribute('aria-pressed', String(!value)); flowButton.setAttribute('aria-pressed', String(value));
    if (flow) flow.hidden = !value;
    if (value) refresh(); else sync();
  }
  standardButton.addEventListener('click', () => setView(false));
  flowButton.addEventListener('click', () => setView(true));
  document.addEventListener('portfolio:featured', event => {
    expanded = event.detail.expanded;
    if (active) more.hidden = true;
  });
})();
