/* Small, finite concept demos. No video downloads, recording, or background loops. */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const en = document.documentElement.lang === 'en';
  const kinds = {
    'life-demo-visual': 'life', 'nutrition-visual': 'nutri', 'codex-visual': 'codex', 'voice-visual': 'voice',
    'search-visual': 'search', 'reps-visual': 'reps', 'cxr-visual': 'cxr', 'hockey-visual': 'hockey',
    'reconstruction-visual': 'reconstruction', 'pencil-visual': 'pencil', 'aqua-visual': 'aqua',
    'connect-visual': 'connect', 'cards-visual': 'cards', 'gems-visual': 'gems',
    'portfolio-demo-visual': 'portfolio', 'egg-visual': 'egg', 'routing-visual': 'routing', 'campfire-visual': 'campfire'
  };
  const words = en ? {
    sample: 'Animated concept · Sample data', focus: 'A little progress, every day.', week: 'Your week',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], generate: 'Create weekly plan', planning: 'Planning your week…', ready: 'Your week is ready',
    meals: ['Veggie bowl', 'Pasta & pesto', 'Lentil curry', 'Roasted vegetables', 'Rice & tofu', 'Couscous salad', 'Vegetable soup'],
    prompt: 'Build a focus timer.', tasks: ['Read the project', 'Build the timer', 'Check the result'], done: 'Ready for your review',
    listen: 'Listening', transcribe: 'Transcribing', saved: 'Ready to use', transcript: 'A new idea: a little more focus, a little more room to create.'
  } : {
    sample: 'Animiertes Konzept · Beispieldaten', focus: 'Jeden Tag ein kleines Stück weiter.', week: 'Deine Woche',
    days: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'], generate: 'Wochenplan erstellen', planning: 'Deine Woche entsteht…', ready: 'Deine Woche ist bereit',
    meals: ['Gemüse-Bowl', 'Pasta & Pesto', 'Linsen-Curry', 'Ofengemüse', 'Reis & Tofu', 'Couscous-Salat', 'Gemüsesuppe'],
    prompt: 'Baue einen Fokus-Timer.', tasks: ['Projekt verstehen', 'Timer umsetzen', 'Ergebnis prüfen'], done: 'Bereit für deinen Review',
    listen: 'Zuhören', transcribe: 'Transkribieren', saved: 'Bereit zum Verwenden', transcript: 'Eine neue Idee: etwas mehr Fokus und mehr Raum, um Neues zu schaffen.'
  };
  let current = null, hovered = null, focused = null, poised = null;
  let mouse = null, lastMouse = null, scrollTimer = 0, resumeBlocked = false;
  const timers = new Set();
  function later(fn, delay) {
    const id = setTimeout(() => { timers.delete(id); fn(); }, delay);
    timers.add(id);
  }
  function stop() {
    observer.disconnect();
    timers.forEach(clearTimeout); timers.clear();
    if (!current) return;
    current.cleanup?.();
    current.visual.classList.remove('is-demo-playing');
    current.layer?.remove();
    current = null;
  }
  function pose(visual) {
    if (poised === visual) return;
    poised?.classList.remove('is-preview-hovered');
    poised = visual;
    poised?.classList.add('is-preview-hovered');
  }
  function cancel() {
    clearTimeout(scrollTimer); scrollTimer = 0; mouse = null;
    resumeBlocked = true;
    hovered = focused = null; pose(null); stop();
  }
  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.target === current?.visual && !entry.isIntersecting)) {
      // Keep the pending scroll recovery; its hit test chooses the new visible card.
      hovered = focused = null; pose(null); stop();
    }
  });
  function ownerOf(target) {
    return target instanceof Element ? target.closest('.visual-link, .flow-card, .orbit-card, .gallery-card') : null;
  }
  function arm() {
    if (scrollTimer || resumeBlocked) return;
    if (document.querySelector('dialog[open]')) { cancel(); return; }
    const owner = focused || hovered;
    const visual = owner?.querySelector('.project-visual');
    pose(!reduced.matches && !document.hidden ? visual : null);
    if (current?.owner === owner) return;
    observer.disconnect(); stop();
    if (!owner || reduced.matches || document.hidden) return;
    const kind = visual && Object.keys(kinds).find(cls => visual.classList.contains(cls));
    if (!kind || !visual.checkVisibility()) return;
    current = { owner, visual, kind: kinds[kind] };
    observer.observe(visual);
    // Crossfade over the final part of the turn, including its progress on re-entry.
    const turnDuration = parseFloat(getComputedStyle(visual).getPropertyValue('--preview-turn-duration')) || 450;
    const overlap = 80;
    const turns = visual.getAnimations({ subtree: true }).filter(animation => animation.transitionProperty === 'transform');
    const pending = current;
    const startPreview = () => { if (current === pending) play(); };
    if (turns.length) {
      Promise.allSettled(turns.map(animation => animation.ready)).then(() => {
        if (current !== pending) return;
        const remaining = Math.max(0, ...turns.map(animation =>
          (animation.effect.getComputedTiming().endTime - (animation.currentTime || 0)) / (animation.playbackRate || 1)
        ));
        later(startPreview, Math.max(0, remaining - overlap));
      });
    } else later(startPreview, Math.max(0, turnDuration - overlap)); // Flow and Orbit position their cards separately.
  }
  function play() {
    if (!current || !current.visual.checkVisibility() || reduced.matches || document.hidden) { cancel(); return; }
    const { visual, kind } = current;
    // Clone just the illustration, leaving the original DOM and link untouched.
    const layer = kind === 'pencil' ? document.createElement('div') : visual.firstElementChild.cloneNode(true);
    if (kind === 'pencil') {
      for (const child of visual.children) layer.append(child.cloneNode(true));
      const foot = document.createElement('span'); foot.className = 'gallery-footnote'; layer.append(foot);
    }
    layer.classList.add('hover-demo-layer'); layer.setAttribute('aria-hidden', 'true');
    layer.querySelector('.gallery-footnote').textContent = words.sample;
    current.layer = layer;
    const find = selector => layer.querySelector(selector);
    if (kind === 'life') {
      find('.life-demo-board').innerHTML = `<div class="life-demo-top"><span>${words.week}</span><b>↗</b></div><p class="clip-life-label">${words.focus}</p><svg class="clip-chart" viewBox="0 0 400 130" fill="none"><path class="clip-grid" d="M0 25H400M0 70H400M0 115H400"/><path class="clip-area" d="M8 114C40 114 38 95 72 99S110 69 139 78S181 44 207 56S250 25 276 35S322 9 346 17S375 5 392 5V125H8Z"/><path class="clip-line" pathLength="1" d="M8 114C40 114 38 95 72 99S110 69 139 78S181 44 207 56S250 25 276 35S322 9 346 17S375 5 392 5"/><circle class="clip-end" cx="392" cy="5" r="4"/></svg><div class="clip-week">${words.days.map(day => `<span>${day}</span>`).join('')}</div>`;
    } else if (kind === 'nutri') {
      find('.nutrition-planner').innerHTML = `<div class="planner-top"><span>${words.week}</span><b>↗</b></div><div class="clip-plan-action">${words.generate}<span>↗</span></div><div class="clip-meals">${words.days.map((day, i) => `<div class="clip-meal"><b>${day}</b><span>${words.meals[i]}</span><i>✓</i></div>`).join('')}</div>`;
      layer.classList.add('clip-nutri');
      later(() => { layer.classList.add('clip-generating'); find('.clip-plan-action').textContent = words.planning; }, 650);
      [...layer.querySelectorAll('.clip-meal')].forEach((row, i) => later(() => row.classList.add('is-ready'), 1300 + i * 330));
      later(() => { layer.classList.add('clip-complete'); find('.clip-plan-action').textContent = '✓ ' + words.ready; }, 3800);
    } else if (kind === 'codex') {
      find('.demo-chat').innerHTML = `<span class="demo-model">✦ Codex</span><p class="clip-prompt">${words.prompt}</p>${words.tasks.map(text => `<div class="demo-task clip-task"><span>✓</span>${text}</div>`).join('')}<div class="demo-composer"><span class="clip-typing">${words.prompt}</span><b>↑</b></div>`;
      layer.classList.add('clip-codex');
      later(() => { layer.classList.add('clip-sent'); find('.demo-composer>span').textContent = '…'; }, 1600);
      [...layer.querySelectorAll('.clip-task')].forEach((row, i) => later(() => row.classList.add('is-ready'), 2300 + i * 900));
      later(() => { layer.classList.add('clip-complete'); find('.demo-composer>span').textContent = words.done; }, 5100);
    } else if (kind === 'voice') {
      layer.classList.add('clip-voice');
      find('.voice-time').textContent = '00:01';
      find('.voice-note').innerHTML = `<div><span>${words.listen}</span><b>✦</b></div><div class="clip-transcript-space"><span class="clip-listening">···</span><div class="clip-loading"><i></i></div><p class="clip-transcript">${words.transcript}</p></div>`;
      [...layer.querySelectorAll('.voice-wave i')].forEach((bar, i) => bar.style.setProperty('--beat', `${i * -73}ms`));
      later(() => { find('.voice-time').textContent = '00:02'; }, 1000);
      later(() => { layer.classList.add('clip-processing'); find('.voice-note>div>span').textContent = words.transcribe; }, 2400);
      later(() => { layer.classList.add('clip-complete'); find('.voice-note>div>span').textContent = words.saved; }, 3400);
    } else playProject(kind, layer, find);
    visual.append(layer); visual.classList.add('is-demo-playing');
  }
  function playProject(kind, layer, find) {
    const t = (english, german) => en ? english : german;
    layer.classList.add('clip-' + kind);
    const reveal = (selector, start = 800, step = 550) => {
      [...layer.querySelectorAll(selector)].forEach((node, i) => later(() => node.classList.add('is-ready'), start + i * step));
    };
    const caption = text => {
      const node = document.createElement('span'); node.className = 'clip-caption'; node.textContent = text; layer.append(node); return node;
    };
    if (kind === 'search') {
      find('.search-screen').remove();
      const panel = document.createElement('div'); panel.className = 'clip-search-panel';
      panel.innerHTML = `<div class="clip-search-input"><span>⌕</span><b>${t('A day in Tübingen', 'Ein Tag in Tübingen')}</b><i>↵</i></div><div class="clip-search-results">${[t('Old town & the Neckar', 'Altstadt & Neckar'),t('Paths through the Schönbuch', 'Wege durch den Schönbuch'),t('Culture in Tübingen', 'Kultur in Tübingen')].map((name, i) => `<div class="clip-search-result"><small>0${i+1} / TÜBINGEN</small><strong>${name}</strong><span></span><span></span></div>`).join('')}</div>`;
      layer.append(panel); reveal('.clip-search-result', 1700, 500);
    } else if (kind === 'reps') {
      // Keep the actual 430×720 app screenshot. Overlay only its changing values
      // and button feedback, using the original UI's coordinates and typography.
      const phone = find('.phone-preview'), screenshot = phone.querySelector('img');
      const screen = document.createElement('div'); screen.className = 'clip-rep-original';
      screen.append(screenshot);
      screen.insertAdjacentHTML('beforeend', '<span class="clip-rep-time">00 : 00</span><span class="clip-rep-number">0</span><span class="clip-rep-press clip-rep-start">Start</span><span class="clip-rep-press clip-rep-stop">Stop</span><span class="clip-rep-press clip-rep-add">+ 1</span>');
      phone.append(screen);
      find('.reps-ghost').textContent = '00';
      const tap = selector => {
        const button = find(selector); button.classList.add('is-pressed');
        later(() => button.classList.remove('is-pressed'), 300);
      };
      later(() => tap('.clip-rep-start'), 650);
      for (let i = 1; i <= 6; i++) later(() => {
        find('.clip-rep-time').textContent = '00 : 0' + i;
      }, 650 + i * 1000);
      // Steady taps run faster than the independent one-second timer.
      for (let count = 1; count <= 9; count++) later(() => {
        tap('.clip-rep-add');
        find('.clip-rep-number').textContent = String(count);
        find('.reps-ghost').textContent = String(count).padStart(2, '0');
      }, 780 + count * 640);
      later(() => tap('.clip-rep-stop'), 6900);
    } else if (kind === 'cxr') {
      find('.cxr-inputs>div').insertAdjacentHTML('beforeend', '<i class="clip-scan"></i>');
      find('.cxr-output').textContent = t('Compare image & prompts', 'Bild & Prompts vergleichen');
      [...layer.querySelectorAll('.prompt-stack i, .embedding-line i')].forEach((node, i) => node.style.setProperty('--clip-delay', `${i * 130}ms`));
      // Illustrative similarities, not probabilities or measured project results.
      const scores = [
        [t('Atelectasis', 'Atelektase'), .42, .68],
        [t('Pleural effusion', 'Pleuraerguss'), .61, .47],
        [t('Cardiomegaly', 'Kardiomegalie'), .28, .35]
      ];
      const score = value => value.toFixed(2).replace('.', en ? '.' : ',');
      layer.insertAdjacentHTML('beforeend', `<div class="clip-cxr-results"><div class="clip-score-heading"><span>${t('Same image · different prompts', 'Gleiches Bild · andere Prompts')}</span><b>↔</b></div><div class="clip-score-legend"><span>${t('A · Baseline', 'A · Basis')}</span><span>${t('B · Descriptive', 'B · Beschreibend')}</span></div><div class="clip-score-rows">${scores.map(([name, before, after]) => `<div class="clip-score-row"><div><span>${name}</span><b><small>${score(before)}</small><i>→</i><strong>${score(before)}</strong></b></div><div class="clip-score-track"><i style="--score:${before}"></i><em style="--before:${before};--after:${after}"></em></div></div>`).join('')}</div><p>${t('Illustrative similarity scores', 'Illustrative Ähnlichkeits-Scores')}</p></div>`);
      later(() => {
        layer.classList.add('clip-results-visible');
        find('.gallery-footnote').textContent = t('Sample scores · not measured results', 'Beispiel-Scores · keine Messergebnisse');
      }, 2900);
      later(() => {
        layer.classList.add('clip-scores-updated');
        [...layer.querySelectorAll('.clip-score-row strong')].forEach((node, i) => { node.textContent = score(scores[i][2]); });
      }, 3900);
    } else if (kind === 'hockey') {
      // Move the existing two agent illustrations through a short, illustrative rally.
      const svg = find('.hockey-rink');
      for (const [x, cls] of [['178','clip-agent-a'], ['405','clip-agent-b']]) {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g'); group.setAttribute('class', cls);
        svg.querySelectorAll(`circle[cx="${x}"]`).forEach(circle => group.append(circle)); svg.append(group);
      }
      find('.hockey-match').textContent = t('SAC · Competition', 'SAC · Competition');
      later(() => { find('.hockey-match').textContent = t('SAC · Goal', 'SAC · Tor'); }, 4200);
    } else if (kind === 'reconstruction') {
      renderReconstruction(layer, find);
      const label = find('.cloud-label'); label.textContent = t('01 / Camera views', '01 / Kameraansichten');
      layer.insertAdjacentHTML('beforeend', '<div class="clip-cameras"><i>01</i><i>02</i><i>03</i></div>');
      later(() => { label.textContent = t('02 / Reconstruct', '02 / Rekonstruieren'); }, 1300);
      later(() => { label.textContent = t('03 / A new viewpoint', '03 / Ein neuer Blickwinkel'); }, 3300);
    } else if (kind === 'pencil') {
      find('.visual-pill').textContent = t('Sketch + Prompt → Image', 'Skizze + Prompt → Bild');
      find('.sketch-inset span').textContent = t('01 / Sketch', '01 / Skizze');
      find('.gallery-footnote').textContent = t('Illustrative prompt · original project images', 'Beispiel-Prompt · originale Projektbilder');
      const result = document.createElement('div'); result.className = 'clip-pencil-result';
      result.append(find('.pencil-output'));
      result.insertAdjacentHTML('beforeend', `<span>${t('Generated image', 'Generiertes Bild')}</span>`);
      layer.append(result);
      layer.insertAdjacentHTML('beforeend', `<svg class="clip-pencil-connectors" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none" aria-hidden="true"><path pathLength="1" d="M41 40C47 40 46 46 51 46M41 73C48 73 45 62 51 62"/><path class="clip-pencil-arrowheads" d="m49.5 44.5 1.5 1.5-1.5 1.5m0 13 1.5 1.5-1.5 1.5"/></svg><div class="clip-pencil-prompt"><span>${t('02 / Text prompt', '02 / Text-Prompt')}</span><p>${t('Pink airplane above the clouds.', 'Pinkes Flugzeug über den Wolken.')}</p></div>`);
    } else if (kind === 'aqua') {
      find('.aqua-art').outerHTML = `<svg class="aqua-art clip-game-scene" viewBox="0 0 500 300"><path d="M78 193Q35 136 127 87T331 78Q441 105 427 168T324 241Q182 274 78 193Z" fill="#e1c991"/><path d="M94 176Q68 135 146 101T326 94Q407 108 404 158T309 219Q185 243 94 176Z" fill="#9ead76"/><ellipse cx="256" cy="168" rx="100" ry="38" fill="#b9bc83"/><g stroke="#85684d" stroke-width="8" stroke-linecap="round"><path d="M128 163q18-37 7-65M335 151q-9-34 0-61"/></g><g fill="#5d8266"><path d="M135 100q-49-34-54 4 31-15 54-4Zm0 0q25-49 56-15-30-7-56 15Zm0 0q-12-45-33-29 21 11 33 29Z"/><path d="M335 93q-40-29-48 2 24-11 48-2Zm0 0q27-36 49-10-23-4-49 10Zm0 0q-10-39-26-25 16 7 26 25Z"/></g><g class="clip-player"><ellipse cx="230" cy="188" rx="16" ry="6" fill="#637b6350"/><rect x="219" y="160" width="22" height="24" rx="7" fill="#b97054"/><circle cx="230" cy="153" r="11" fill="#ecd2ae"/></g><g stroke="#896b4d" stroke-width="8" stroke-linecap="round"><path d="m266 190 27-10m-24 21 27-10m-21 20 27-10"/></g><g class="clip-pirate"><path d="M30 178h55l-9 14H42Z" fill="#536368"/><path d="M56 143v35m2-33 17 24H58Z" stroke="#536368" stroke-width="2" fill="#dce4dc"/></g></svg>`;
      const status = caption(t('Collect resources', 'Ressourcen sammeln'));
      layer.insertAdjacentHTML('beforeend', '<div class="clip-resources"><i>✦</i><i>✦</i><i>✦</i></div><div class="clip-boat"><svg viewBox="0 0 80 70"><path d="M8 48h66L62 62H22Z" fill="#685f47"/><path d="M39 8v40M42 12l23 30H42Z" fill="#fbebc5" stroke="#685f47" stroke-width="2"/><path d="M34 22 16 42h18Z" fill="#cf8863"/></svg></div>');
      later(() => { status.textContent = t('Build your boat', 'Das Schiff entsteht'); layer.classList.add('clip-built'); }, 1900);
      later(() => { status.textContent = t('Set sail', 'Die Insel verlassen'); layer.classList.add('clip-sail'); }, 3600);
    } else if (kind === 'connect') {
      const phone = find('.phone-preview'), screenshot = phone.querySelector('img');
      const original = document.createElement('div'); original.className = 'clip-connect-original';
      const asset = name => screenshot.getAttribute('src').replace('connect.png', name);
      const repScreen = `<div class="clip-rep-original"><img src="${asset('repcounter.png')}" alt="" width="430" height="720"><span class="clip-rep-time">00 : 00</span><span class="clip-rep-number">0</span><span class="clip-rep-press clip-rep-start">Start</span><span class="clip-rep-press clip-rep-add">+ 1</span></div>`;
      original.append(screenshot);
      original.insertAdjacentHTML('beforeend', `<span class="clip-connect-selection"></span><div class="clip-connect-view clip-connect-reps">${repScreen}</div>`);
      phone.append(original);
      const screens = [
        ['RepCounter', 'reps', repScreen],
        ['Card Manager', 'cards', `<img src="${asset('connect-cards.png')}" alt="" width="430" height="720">`],
        ['Gem Calculator', 'gems', `<img src="${asset('connect-gems.png')}" alt="" width="430" height="1250">`],
        ['Egg Timer', 'egg', `<img src="${asset('connect-egg.png')}" alt="" width="430" height="720"><span class="clip-connect-time">05:00</span><span class="clip-connect-start"></span>`]
      ];
      layer.insertAdjacentHTML('beforeend', `<div class="clip-connect-fan">${screens.map(([name, kind, content], index) => `<div class="clip-fan-device" style="--device:${index};--angle:${[-5,-2,2,5][index]}deg"><div class="clip-fan-screen clip-fan-${kind}">${content}</div><span class="clip-fan-label">${name}</span></div>`).join('')}</div>`);
      const allText = (selector, value) => layer.querySelectorAll(selector).forEach(node => { node.textContent = value; });
      const tap = selector => {
        layer.querySelectorAll(selector).forEach(node => node.classList.add('is-pressed'));
        later(() => layer.querySelectorAll(selector).forEach(node => node.classList.remove('is-pressed')), 300);
      };
      later(() => layer.classList.add('clip-connect-selected'), 600);
      later(() => { layer.classList.add('clip-show-reps'); find('.connect-caption').textContent = 'Connect → RepCounter'; }, 1100);
      later(() => tap('.clip-rep-start'), 1700);
      for (let i = 1; i <= 3; i++) later(() => allText('.clip-rep-time', '00 : 0' + i), 1700 + i * 1000);
      [2200, 2900, 4500, 5300].forEach((delay, index) => later(() => { tap('.clip-rep-add'); allText('.clip-rep-number', String(index + 1)); }, delay));
      later(() => {
        layer.classList.add('clip-connect-overview');
        find('.gallery-headline').textContent = t('Four tools. One home.', 'Vier Tools. Ein Zuhause.');
        find('.connect-caption').textContent = t('Your everyday tools, connected.', 'Deine Alltagstools, verbunden.');
      }, 3800);
      later(() => layer.classList.add('clip-fan-active'), 4800);
      later(() => allText('.clip-connect-time', '04:59'), 5800);
      later(() => allText('.clip-connect-time', '04:58'), 6800);
    } else if (kind === 'cards') {
      const qr = '<svg viewBox="0 0 29 29" fill="currentColor"><path d="M2 2h7v7H2zm18 0h7v7h-7zM2 20h7v7H2z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4 4h3v3H4zm18 0h3v3h-3zM4 22h3v3H4zM12 2h3v5h-3zm0 8h5v3h-5zm7 2h3v5h-3zm5 0h3v3h-3zM2 12h5v3H2zm7 3h4v4H9zm5 6h3v6h-3zm6-2h3v3h-3zm4 5h3v3h-3zm-5 0h3v3h-3zM3 17h3v2H3z"/></svg>';
      const cards = [
        [t('Fitness card', 'Fitnesskarte'), '<div class="wallet-fitness"><b>FIT / CLUB</b><span>MEMBER</span><i></i></div>'],
        [t('Bank card', 'Bankkarte'), '<div class="wallet-bank"><span>DEMO BANK</span><i></i><b>•••• &nbsp; •••• &nbsp; ••••</b></div>'],
        [t('QR card', 'QR-Karte'), `<div class="wallet-qr">${qr}<span>DEMO / PASS</span></div>`]
      ];
      const stack = find('.collection-stack');
      stack.innerHTML = cards.map(([name, face], index) => `<div class="collection-card front-card clip-wallet-card" style="--card:${index};--entry:${index % 2 ? 48 : -48}cqw;--entry-turn:${index % 2 ? 18 : -18}deg;--turn:${[-9, 7, -3][index]}deg"><strong>${name}</strong><div class="collection-landscape">${face}</div><div class="collection-tags"><span>${t('Saving on this device…', 'Auf diesem Gerät speichern…')}</span></div></div>`).join('') + '<div class="collection-plus">+</div>';
      [...stack.querySelectorAll('.clip-wallet-card')].forEach((card, index) => {
        later(() => {
          stack.querySelectorAll('.is-in').forEach(previous => previous.classList.add('is-stacked'));
          find('.collection-plus').textContent = '+';
          card.classList.add('is-in');
        }, 150 + index * 2000);
        later(() => {
          card.querySelector('.collection-tags span').textContent = t('Saved on this device', 'Auf diesem Gerät gespeichert');
          find('.collection-plus').textContent = '✓';
        }, 1150 + index * 2000);
      });
    } else if (kind === 'gems') {
      find('.gem-comparison small').textContent = t('Compare time saved per gem.', 'Gesparte Zeit pro Gem vergleichen.');
      later(() => { find('.gem-comparison small').textContent = t('Option A · more time per gem', 'Option A · mehr Zeit pro Gem'); layer.classList.add('clip-complete'); }, 3000);
    } else if (kind === 'portfolio') {
      find('.mini-portfolio').classList.remove('mini-site');
      find('.mini-portfolio').innerHTML = `<div class="clip-site-nav"><b>matze<span>.</span></b><span>EN &nbsp; ☾ &nbsp; ≡</span></div><div class="clip-site-stage"><div class="clip-site-home"><small>${t('Hi, I’m Matze.', 'Hi, ich bin Matze.')}</small><strong>${t('Turning ideas<br>into <em>reality.</em>', 'Aus Ideen<br>wird <em>Wirklichkeit.</em>')}</strong><span class="clip-site-button">${t('My projects', 'Meine Projekte')} ↗</span><div class="clip-site-object"><i></i><i></i><i></i></div></div><div class="clip-site-gallery"><small>${t('BUILT FROM CURIOSITY', 'GEBAUT AUS NEUGIER')}</small><div class="clip-site-projects"><div><div class="clip-site-chart"><svg viewBox="0 0 100 60"><path pathLength="1" d="M5 52C25 50 20 30 42 36S62 12 78 18L95 6" fill="none" stroke="currentColor" stroke-width="3"/></svg></div><span>MyLifeGraph</span></div><div><div class="clip-site-plan"><b><span>✓</span> &nbsp; <span>✓</span> &nbsp; <span>✓</span></b><i></i><i></i><i></i></div><span>NutriPilot</span></div><div><div class="clip-site-code"><small>codex ui</small><i></i><i></i><b class="clip-site-ready">✓ Ready</b></div><span>Codex UI</span></div></div></div></div><div class="clip-site-bottom"><span>Built with curiosity.</span><span>↗</span></div>`;
      later(() => layer.classList.add('clip-portfolio-gallery'), 1700);
      reveal('.clip-site-projects>div', 2050, 230);
    } else if (kind === 'egg') {
      find('.egg-timer small').textContent = t('Timer running', 'Timer läuft'); find('.timer-play').textContent = 'Ⅱ';
      for (let i = 1; i <= 5; i++) later(() => { find('.egg-timer>span').textContent = '04:' + (60-i); }, i * 1000);
    } else if (kind === 'routing') {
      ['info', 'settings', 'home'].forEach((page, i) => later(() => {
        find('.route-address').innerHTML = `/${page} <b>↗</b>`;
        const selected = ['home','info','settings'].indexOf(page);
        [...layer.querySelectorAll('.route-tabs span')].forEach((tab, index) => tab.classList.toggle('route-active', selected === index));
        find('.route-body').innerHTML = page === 'settings' ? '<div class="clip-route-switch"><i></i><i></i></div>' : page === 'info' ? `<strong class="clip-route-info">${t('A little about this page.', 'Ein bisschen über diese Seite.')}</strong><i></i><i></i>` : '<i></i><i></i><i></i>';
      }, 900 + i * 1350));
    } else if (kind === 'campfire') {
      layer.insertAdjacentHTML('beforeend', `<div class="clip-embers">${Array.from({length:7},(_,i)=>`<i style="--spark:${i};--drift:${(i%3-1)*4}cqw"></i>`).join('')}</div>`);
    }
  }
  function renderReconstruction(layer, find) {
    const canvas = document.createElement('canvas');
    canvas.className = 'point-cloud clip-cloud';
    canvas.setAttribute('aria-hidden', 'true');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const resolution = Math.min(window.devicePixelRatio || 1, 1.75);
    canvas.width = Math.round(600 * resolution);
    canvas.height = Math.round(360 * resolution);
    ctx.scale(canvas.width / 600, canvas.height / 360);
    find('.point-cloud').replaceWith(canvas);
    // Unit sphere: equal radii on all three axes. Orthographic projection keeps
    // its silhouette circular from every angle, including during the turn.
    const points = [];
    for (let ring = 0; ring <= 24; ring++) {
      const latitude = Math.PI * ring / 24;
      const radius = Math.sin(latitude), count = Math.max(1, Math.round(48 * radius));
      for (let step = 0; step < count; step++) {
        const angle = (step + (ring % 2) * .5) / count * Math.PI * 2;
        const x = radius * Math.cos(angle);
        points.push({ x, y: -Math.cos(latitude), z: radius * Math.sin(angle), color: x > 0 ? '#e5bdff' : '#86dedc' });
      }
    }
    const active = current;
    let frame = 0, started;
    current.cleanup = () => cancelAnimationFrame(frame);
    const ease = value => { const v = Math.max(0, Math.min(1, value)); return v * v * (3 - 2 * v); };
    function draw(now) {
      if (current !== active || reduced.matches || document.hidden) return;
      if (started === undefined) started = now;
      const elapsed = now - started;
      const yaw = -.38 + ease((elapsed - 2400) / 3600) * 1.55;
      const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(-.24), sp = Math.sin(-.24);
      const project = ({x, y, z}) => {
        const rx = x * cy + z * sy, rz = -x * sy + z * cy;
        const ry = y * cp - rz * sp, depth = y * sp + rz * cp;
        return { x: 300 + rx * 118, y: 177 + ry * 118, depth };
      };
      ctx.clearRect(0, 0, 600, 360);
      // Restore the original pyramidal construction lines in the same 3D space.
      const corners = [[-1.55,-1.55],[1.55,-1.55],[1.55,1.55],[-1.55,1.55]]
        .map(([x,z]) => project({ x, y: 1.02, z }));
      const apex = project({ x: 0, y: -1.02, z: 0 });
      ctx.lineWidth = .8; ctx.strokeStyle = '#a6b2dd'; ctx.globalAlpha = .28;
      for (let i = 0; i < 4; i++) {
        const a = corners[i], b = corners[(i + 1) % 4];
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
        ctx.moveTo(a.x, a.y); ctx.lineTo(apex.x, apex.y); ctx.stroke();
      }
      const reveal = Math.max(0, Math.min(1, elapsed / 2300));
      const projected = points.map(point => ({...project(point), point})).sort((a, b) => a.depth - b.depth);
      for (const dot of projected) {
        const alpha = ease((reveal * 2.3 - (dot.point.x + 1)) / .3);
        if (alpha === 0) continue;
        ctx.globalAlpha = alpha * (.28 + (dot.depth + 1.2) / 2.4 * .6);
        ctx.fillStyle = dot.point.color;
        ctx.beginPath(); ctx.arc(dot.x, dot.y, 2 + dot.depth * .55, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (elapsed < 6000) frame = requestAnimationFrame(draw);
    }
    frame = requestAnimationFrame(draw);
  }
  // Delegation also covers the lazily created Flow and Orbit cards.
  function trackMouse(event) {
    if (event.pointerType !== 'mouse' || event.buttons) return;
    const moved = !lastMouse || event.clientX !== lastMouse.x || event.clientY !== lastMouse.y;
    // Removing a preview can itself emit pointerover. After Escape/click/blur,
    // require fresh pointer movement instead of immediately undoing the cancel.
    if (resumeBlocked && (event.type !== 'pointermove' || !moved)) return;
    lastMouse = { x: event.clientX, y: event.clientY };
    resumeBlocked = false;
    mouse = { x: event.clientX, y: event.clientY };
    const owner = ownerOf(event.target);
    if (owner !== hovered || (!current && owner)) { hovered = owner; arm(); }
  }
  document.addEventListener('pointerover', trackMouse);
  document.addEventListener('pointermove', trackMouse, { passive: true });
  document.addEventListener('pointerout', event => {
    if (event.pointerType !== 'mouse') return;
    if (!event.relatedTarget) mouse = null;
    hovered = ownerOf(event.relatedTarget); arm();
  });
  document.addEventListener('focusin', event => {
    focused = event.target.matches(':focus-visible') ? ownerOf(event.target) : null;
    if (focused) resumeBlocked = false;
    arm();
  });
  document.addEventListener('focusout', event => { focused = ownerOf(event.relatedTarget); arm(); });
  document.addEventListener('pointerdown', cancel, { passive: true });
  document.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    hovered = focused = null; pose(null); stop();
    // Scrolling can move a new card under a stationary pointer without a new
    // pointerover event. Re-evaluate only once scrolling settles, then use the
    // normal rotation/preview delay. Also retain keyboard-focus auto-scrolling.
    scrollTimer = setTimeout(() => {
      scrollTimer = 0;
      if (resumeBlocked || document.hidden || reduced.matches || document.querySelector('dialog[open]')) return;
      const active = document.activeElement;
      focused = active?.matches(':focus-visible') ? ownerOf(active) : null;
      hovered = mouse ? ownerOf(document.elementFromPoint(mouse.x, mouse.y)) : null;
      arm();
    }, 140);
  }, { capture: true, passive: true });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') cancel(); });
  document.addEventListener('visibilitychange', cancel);
  for (const name of ['portfolio:dialog', 'portfolio:quiet', 'portfolio:filter']) document.addEventListener(name, cancel);
  window.addEventListener('blur', cancel);
  window.addEventListener('pagehide', cancel);
  reduced.addEventListener('change', cancel);
})();
