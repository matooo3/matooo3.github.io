/* Optional, dependency-free gallery orbit. Nothing animates until explicitly opened. */
(() => {
  const grid = document.querySelector('.gallery-grid');
  if (!grid || !window.HTMLDialogElement) return;
  const en = document.documentElement.lang === 'en';
  const text = en ? {
    grid: 'Grid', orbit: 'Orbit view', views: 'Gallery view', title: 'Ideas in orbit.',
    hint: 'Drag or use ← → · Shift + scroll to rotate', mobile: 'Swipe to explore · Tap a card to open',
    scene: 'Project orbit. Use left and right arrow keys to explore, Enter to open a project.',
    previous: 'Previous project', next: 'Next project', open: 'Open project', close: 'Close project',
    pause: 'Pause motion', play: 'Resume motion', position: 'of', eyebrow: 'A DIFFERENT PERSPECTIVE'
  } : {
    grid: 'Raster', orbit: 'Orbit-Ansicht', views: 'Galerieansicht', title: 'Ideen auf Umlaufbahn.',
    hint: 'Ziehen oder ← → · Umschalt + Scrollen zum Drehen', mobile: 'Wischen zum Entdecken · Karte antippen zum Öffnen',
    scene: 'Projektorbit. Mit den Pfeiltasten links und rechts navigieren, mit Enter ein Projekt öffnen.',
    previous: 'Vorheriges Projekt', next: 'Nächstes Projekt', open: 'Projekt öffnen', close: 'Projekt schließen',
    pause: 'Bewegung pausieren', play: 'Bewegung fortsetzen', position: 'von', eyebrow: 'EINE ANDERE PERSPEKTIVE'
  };
  const sources = [...grid.querySelectorAll('.gallery-card')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const controls = document.createElement('div');
  controls.className = 'gallery-view-switch';
  controls.setAttribute('role', 'group');
  controls.setAttribute('aria-label', text.views);
  controls.innerHTML = `<button type="button" aria-pressed="true" data-view="grid"><span aria-hidden="true">▦</span> ${text.grid}</button><button type="button" aria-pressed="false" data-view="orbit"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="5"/><ellipse cx="12" cy="12" rx="11" ry="4" transform="rotate(-30 12 12)"/></svg>${text.orbit}</button>`;
  document.querySelector('.gallery-count').append(controls);
  const [gridButton, orbitButton] = controls.querySelectorAll('button');
  let active = false, section, stage, deck, dialog, label, position, previous, next, motionButton;
  let cards = [], items = [], current = 0, target = 0, frame = 0, lastTime = 0;
  let radius = 300, verticalRadius = 102, paused = false, inView = true, dragging = false, pointerId, startX = 0, startY = 0, startTarget = 0, moved = false;
  let suppressClickUntil = 0, idleAfter = 0, idleTimer = 0, wheelTime = 0, wheelAmount = 0, wheelDirection = 0, resizeObserver;
  const wrap = (value, n) => ((value % n) + n) % n;
  const selected = () => items.length ? wrap(Math.round(target), items.length) : 0;
  const cleanClone = node => {
    const copy = node.cloneNode(true);
    copy.querySelectorAll('.hover-demo-layer').forEach(layer => layer.remove());
    for (const visual of [copy, ...copy.querySelectorAll('.is-demo-playing, .is-preview-hovered')]) visual.classList.remove('is-demo-playing', 'is-preview-hovered');
    // Illustrations contain SVG IDs. Give every copy its own references.
    const prefix = `orbit-${++cleanClone.serial}-`;
    const ids = new Map([...copy.querySelectorAll('[id]')].map(el => [el.id, prefix + el.id]));
    for (const el of [copy, ...copy.querySelectorAll('*')]) {
      if (el.id) el.id = ids.get(el.id) || prefix + el.id;
      for (const attr of [...el.attributes]) {
        let value = attr.value;
        for (const [id, replacement] of ids) {
          value = value.replaceAll(`url(#${id})`, `url(#${replacement})`);
          if (['href', 'xlink:href'].includes(attr.name) && value === '#' + id) value = '#' + replacement;
          if (['aria-labelledby', 'aria-describedby'].includes(attr.name)) value = value.split(' ').map(part => part === id ? replacement : part).join(' ');
        }
        if (value !== attr.value) el.setAttribute(attr.name, value);
      }
    }
    return copy;
  };
  cleanClone.serial = 0;

  function initialize() {
    if (section) return;
    section = document.createElement('div');
    section.id = 'project-orbit';
    section.className = 'project-orbit';
    section.hidden = true;
    section.innerHTML = `<div class="orbit-stage" tabindex="0" role="region" aria-roledescription="carousel" aria-label="${text.scene}">
      <div class="orbit-space" aria-hidden="true"><div class="orbit-stars"></div><div class="orbit-glow"></div><div class="orbit-ring ring-one"></div><div class="orbit-ring ring-two"></div><div class="orbit-core"></div></div>
      <div class="orbit-heading"><span>${text.eyebrow}</span><h2>${text.title}</h2></div>
      <div class="orbit-deck"></div><div class="orbit-bottom-hint"><span class="orbit-desktop-hint">${text.hint}</span><span class="orbit-mobile-hint">${text.mobile}</span></div>
    </div><div class="orbit-navigation"><button class="orbit-arrow" type="button" data-orbit-prev aria-label="${text.previous}">←</button><button class="orbit-current" type="button"><span class="orbit-position"></span><strong></strong><span class="orbit-open">${text.open} ↗</span></button><button class="orbit-arrow" type="button" data-orbit-next aria-label="${text.next}">→</button><button class="orbit-motion" type="button" aria-pressed="false" aria-label="${text.pause}" title="${text.pause}">Ⅱ</button></div>`;
    grid.before(section);
    stage = section.querySelector('.orbit-stage');
    stage.before(section.querySelector('.orbit-navigation'));
    deck = section.querySelector('.orbit-deck');
    label = section.querySelector('.orbit-current strong');
    position = section.querySelector('.orbit-position');
    position.setAttribute('role', 'status');
    position.setAttribute('aria-live', 'polite');
    position.setAttribute('aria-atomic', 'true');
    previous = section.querySelector('[data-orbit-prev]');
    next = section.querySelector('[data-orbit-next]');
    motionButton = section.querySelector('.orbit-motion');
    section.querySelector('.orbit-current').addEventListener('click', () => openProject(items[selected()]));
    previous.addEventListener('click', () => step(-1));
    next.addEventListener('click', () => step(1));
    motionButton.addEventListener('click', () => { paused = !paused; syncMotion(); });
    // Small fixed particle field; only its containing layer moves.
    const stars = section.querySelector('.orbit-stars');
    for (let i = 0; i < 28; i++) {
      const star = document.createElement('i');
      star.style.cssText = `left:${(i * 37 + 11) % 100}%;top:${(i * 23 + 7) % 100}%;opacity:${0.2 + (i % 4) * 0.15};width:${i % 5 === 0 ? 3 : 2}px;height:${i % 5 === 0 ? 3 : 2}px`;
      stars.append(star);
    }
    dialog = document.createElement('dialog');
    dialog.className = 'orbit-dialog';
    dialog.innerHTML = `<button type="button" class="orbit-close" aria-label="${text.close}">×</button><div class="orbit-dialog-body"></div>`;
    document.body.append(dialog);
    dialog.querySelector('.orbit-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
    dialog.addEventListener('close', () => { document.body.classList.remove('orbit-modal-open'); idleAfter = performance.now() + 2500; syncMotion(); });
    stage.addEventListener('keydown', event => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); step(event.key === 'ArrowRight' ? 1 : -1); }
      if (event.target === stage && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); openProject(items[selected()]); }
      if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); target = event.key === 'Home' ? 0 : items.length - 1; settle(); }
    });
    stage.addEventListener('wheel', event => {
      if (!active || items.length < 2 || event.ctrlKey) return;
      if (!event.shiftKey && Math.abs(event.deltaY) >= Math.abs(event.deltaX)) return;
      event.preventDefault();
      const now = performance.now();
      const amount = (Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY) * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? stage.clientHeight : 1);
      if (now - wheelTime > 240 || Math.sign(amount) !== wheelDirection) wheelAmount = 0;
      wheelAmount += amount;
      if (Math.abs(wheelAmount) >= 35 && now - wheelTime > 160) { step(Math.sign(wheelAmount)); wheelAmount = 0; wheelTime = now; }
      wheelDirection = Math.sign(amount);
    }, { passive: false });
    stage.addEventListener('pointerdown', event => {
      if (event.button !== 0 || items.length < 2) return;
      pointerId = event.pointerId; startX = event.clientX; startY = event.clientY; startTarget = current; moved = false; dragging = true;
      idleAfter = performance.now() + 3000; syncMotion();
    });
    stage.addEventListener('pointermove', event => {
      if (!dragging || event.pointerId !== pointerId) return;
      const dx = event.clientX - startX, dy = event.clientY - startY;
      if (!moved && Math.abs(dy) > Math.abs(dx) + 8) { finishDrag(); return; }
      if (!moved && Math.abs(dx) > 7) { moved = true; stage.setPointerCapture(pointerId); stage.classList.add('is-dragging'); }
      if (moved) { target = startTarget - dx / Math.max(90, stage.clientWidth * .16); if (reduced.matches) { current = target; paint(); } wake(); }
    });
    stage.addEventListener('pointerup', finishDrag);
    stage.addEventListener('pointercancel', finishDrag);
    stage.addEventListener('lostpointercapture', finishDrag);
    stage.addEventListener('dragstart', event => event.preventDefault());
    stage.addEventListener('focusin', syncMotion);
    stage.addEventListener('focusout', () => queueMicrotask(syncMotion));
    // Stop motion immediately when off screen, in a background tab, or behind a dialog.
    new IntersectionObserver(entries => { inView = entries[0].isIntersecting; syncMotion(); }, { threshold: 0.05 }).observe(stage);
    resizeObserver = new ResizeObserver(() => { radius = Math.min(440, stage.clientWidth * .36); verticalRadius = stage.clientWidth < 600 ? 72 : 102; if (active) paint(); });
    resizeObserver.observe(stage);
    document.addEventListener('visibilitychange', syncMotion);
    document.addEventListener('portfolio:dialog', syncMotion);
    reduced.addEventListener('change', () => { current = target = Math.round(target); syncMotion(); paint(); });
  }
  function finishDrag() {
    if (!dragging) return;
    dragging = false;
    if (moved) suppressClickUntil = performance.now() + 250;
    stage.classList.remove('is-dragging');
    if (stage.hasPointerCapture(pointerId)) stage.releasePointerCapture(pointerId);
    target = Math.round(target); settle();
  }
  function openProject(source) {
    if (!source) return;
    const copy = cleanClone(source);
    copy.hidden = false;
    copy.classList.remove('gallery-card');
    copy.classList.add('orbit-detail-card');
    copy.removeAttribute('data-search');
    const heading = copy.querySelector('h3');
    copy.setAttribute('aria-labelledby', heading.id);
    dialog.setAttribute('aria-labelledby', heading.id);
    dialog.querySelector('.orbit-dialog-body').replaceChildren(copy);
    dialog.showModal();
    document.body.classList.add('orbit-modal-open');
    syncMotion();
  }
  function refresh() {
    const old = items[selected()];
    items = sources.filter(source => !source.hidden);
    current = target = Math.max(0, items.indexOf(old));
    deck.replaceChildren();
    cards = items.map(source => {
      const card = document.createElement('button');
      card.type = 'button'; card.className = 'orbit-card'; card.tabIndex = -1;
      card.setAttribute('aria-label', `${text.open}: ${source.querySelector('h3').textContent}`);
      const visual = cleanClone(source.querySelector('.project-visual'));
      visual.setAttribute('aria-hidden', 'true');
      visual.querySelectorAll('img').forEach(img => { img.draggable = false; });
      const caption = document.createElement('span'); caption.className = 'orbit-card-caption';
      const name = document.createElement('strong'); name.textContent = source.querySelector('h3').textContent;
      const arrow = document.createElement('span'); arrow.textContent = '↗'; arrow.setAttribute('aria-hidden', 'true');
      caption.append(name, arrow); card.append(visual, caption);
      card.addEventListener('click', () => { if (performance.now() >= suppressClickUntil) openProject(source); });
      card.addEventListener('focus', () => { idleAfter = Infinity; });
      card.addEventListener('blur', () => { idleAfter = performance.now() + 2500; });
      deck.append(card); return card;
    });
    section.hidden = !active || !items.length;
    previous.disabled = next.disabled = items.length < 2;
    idleAfter = performance.now() + 3500;
    syncMotion(); paint();
  }
  function paint() {
    if (!items.length || !active) return;
    const n = items.length;
    const nearest = wrap(Math.round(current), n);
    cards.forEach((card, i) => {
      const distance = wrap(i - current + n / 2, n) - n / 2;
      const visible = Math.abs(distance) < 4.65;
      if (card.hidden === visible) card.hidden = !visible;
      if (!visible) return;
      const angle = distance * (n < 10 ? 2 * Math.PI / n : .60);
      const depth = (Math.cos(angle) + 1) / 2;
      const x = Math.sin(angle) * radius;
      const y = Math.cos(angle) * verticalRadius - Math.sin(angle) * (verticalRadius * .35);
      const scale = .48 + depth * .52;
      card.style.transform = `translate(-50%,-50%) translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) scale(${scale.toFixed(4)}) perspective(900px) rotateY(${(-Math.sin(angle) * 28).toFixed(2)}deg) rotateZ(${(-Math.sin(angle) * 5).toFixed(2)}deg)`;
      card.style.zIndex = String(Math.round(depth * 100));
      card.style.opacity = String(Math.min(1, (4.65 - Math.abs(distance)) * 2));
      card.classList.toggle('is-front', i === nearest);
      card.tabIndex = i === nearest ? 0 : -1;
    });
    const index = selected();
    const name = items[index].querySelector('h3').textContent;
    const nameChanged = label.textContent !== name;
    if (nameChanged) label.textContent = name;
    const counter = `${String(index + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`;
    if (position.textContent !== counter || nameChanged) {
      position.textContent = counter;
      section.querySelector('.orbit-current').setAttribute('aria-label', `${text.open}: ${name}, ${index + 1} ${text.position} ${n}`);
    }
  }
  function canRun() { return active && items.length && inView && !document.hidden && !document.querySelector('dialog[open]'); }
  function canAuto() { return canRun() && !paused && !reduced.matches && !dragging && !stage.contains(document.activeElement) && items.length > 1; }
  function scheduleIdle() {
    clearTimeout(idleTimer); idleTimer = 0;
    if (canAuto() && Number.isFinite(idleAfter)) {
      const wait = idleAfter - performance.now();
      if (wait > 0) idleTimer = setTimeout(syncMotion, wait + 1); else wake();
    }
  }
  function animate(time) {
    frame = 0;
    if (!canRun()) return;
    const dt = Math.min(40, time - (lastTime || time)); lastTime = time;
    if (canAuto() && time >= idleAfter) target += dt * .000055;
    const before = current;
    current += (target - current) * (1 - Math.exp(-dt / 95));
    if (Math.abs(target - current) < .0001) current = target;
    // Keep cyclic coordinates bounded, including after a long open session.
    if (Math.abs(current) > items.length * 100) { const loops = Math.trunc(current / items.length) * items.length; current -= loops; target -= loops; }
    if (current !== before) paint();
    if (Math.abs(target - current) > .0001 || (canAuto() && time >= idleAfter)) frame = requestAnimationFrame(animate);
    else scheduleIdle();
  }
  function wake() { if (!frame && canRun()) { lastTime = 0; frame = requestAnimationFrame(animate); } }
  function syncMotion() {
    if (!section) return;
    section.classList.toggle('motion-paused', !canAuto());
    motionButton.hidden = reduced.matches;
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.setAttribute('aria-label', paused ? text.play : text.pause);
    motionButton.title = paused ? text.play : text.pause;
    motionButton.textContent = paused ? '▷' : 'Ⅱ';
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    clearTimeout(idleTimer); idleTimer = 0;
    if (Math.abs(target - current) > .0001) wake(); else scheduleIdle();
  }
  function settle() { idleAfter = performance.now() + 3500; if (reduced.matches) current = target; paint(); wake(); }
  function step(direction) { if (items.length > 1) { target = Math.round(target) + direction; settle(); } }
  function setView(orbit) {
    if (orbit) initialize();
    active = orbit;
    grid.hidden = orbit;
    gridButton.setAttribute('aria-pressed', String(!orbit));
    orbitButton.setAttribute('aria-pressed', String(orbit));
    if (orbit) refresh();
    else if (section) { section.hidden = true; syncMotion(); }
  }
  gridButton.addEventListener('click', () => setView(false));
  orbitButton.addEventListener('click', () => setView(true));
  document.addEventListener('portfolio:filter', () => { if (active) refresh(); });
  window.addEventListener('hashchange', () => { if (location.hash.startsWith('#project-') && active) setView(false); });
  document.addEventListener('portfolio:quiet', () => setView(false));
})();
