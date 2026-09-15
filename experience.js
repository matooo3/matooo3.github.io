/* Optional interface extras. No dependencies, inference, or background polling. */
(() => {
  const root = document.documentElement, en = root.lang === 'en';
  const home = en ? '/' : '/de/', gallery = en ? '/projects/' : '/de/projects/';
  const ui = en ? {
    settings: 'Experience settings', title: 'Make it yours.', subtitle: 'Optional extras. Your choice.', atmosphere: 'Atmosphere mode', atmosphereHint: 'Soft light, subtle stars and section colours.', command: 'Command Center', commandHint: 'Jump anywhere with Ctrl / ⌘ K.', saved: 'Saved on this device. Motion follows your system preferences.', open: 'Open Command Center', search: 'Where would you like to go?', placeholder: 'Search pages, projects or actions…', close: 'Close Command Center', empty: 'No matches. Try a project name or “theme”.', navigate: 'Navigate', select: 'Open', escape: 'Close', projects: 'Projects', about: 'About me', skills: 'Skills', contact: 'Contact', fullGallery: 'Full gallery', list: 'Project directory', dark: 'Switch to dark mode', light: 'Switch to light mode', german: 'Deutsch', english: 'English', page: 'PAGE', project: 'PROJECT', action: 'ACTION', language: 'LANGUAGE', results: 'results', on: 'Turn atmosphere on', off: 'Turn atmosphere off'
  } : {
    settings: 'Einstellungen', title: 'So, wie du magst.', subtitle: 'Optionale Extras. Du entscheidest.', atmosphere: 'Atmosphäre-Modus', atmosphereHint: 'Sanftes Licht, dezente Sterne und Abschnittsfarben.', command: 'Command Center', commandHint: 'Direkt ans Ziel mit Strg / ⌘ K.', saved: 'Auf diesem Gerät gespeichert. Bewegung folgt deinen Systemeinstellungen.', open: 'Command Center öffnen', search: 'Wohin möchtest du?', placeholder: 'Seiten, Projekte oder Aktionen suchen…', close: 'Command Center schließen', empty: 'Keine Treffer. Probiere einen Projektnamen oder „Design“.', navigate: 'Navigieren', select: 'Öffnen', escape: 'Schließen', projects: 'Projekte', about: 'Über mich', skills: 'Skills', contact: 'Kontakt', fullGallery: 'Ganze Galerie', list: 'Projektverzeichnis', dark: 'Dunkles Design aktivieren', light: 'Helles Design aktivieren', german: 'Deutsch', english: 'English', page: 'SEITE', project: 'PROJEKT', action: 'AKTION', language: 'SPRACHE', results: 'Treffer', on: 'Atmosphäre einschalten', off: 'Atmosphäre ausschalten'
  };
  Object.assign(ui, en ? { ember: 'Ember mode', emberHint: 'Flowing fire, fine embers and warm click flares.', emberLoading: 'Preparing flame textures…', emberReduced: 'Fire effects pause with reduced motion enabled.', emberError: 'Fire effects could not load. You can try switching them on again.' } : { ember: 'Ember-Modus', emberHint: 'Fließendes Feuer, feine Glut und warme Klick-Effekte.', emberLoading: 'Flammentexturen werden vorbereitet…', emberReduced: 'Bei reduzierter Bewegung pausieren die Feuereffekte.', emberError: 'Die Feuereffekte konnten nicht geladen werden. Du kannst sie erneut einschalten.' });
  const script = document.currentScript;
  const emberURL = new URL(`ember.js?v=${script.dataset.emberVersion}`, script.src).href;
  const designURL = new URL(`design-extras.js?v=${script.dataset.designVersion}`, script.src).href;
  const designCSS = new URL(`design-extras.css?v=${script.dataset.designCssVersion}`, script.src).href;
  const key = 'matze-experience-v1', motion = matchMedia('(prefers-reduced-motion: reduce)'), fine = matchMedia('(pointer: fine)');
  const readPrefs = value => ({ atmosphere: value?.atmosphere !== false, command: value?.command !== false, ember: value?.ember === true, blueprint: value?.blueprint === true, sculpture: value?.sculpture === true });
  let prefs = readPrefs();
  try { prefs = readPrefs(JSON.parse(localStorage.getItem(key))); } catch { /* Works without storage. */ }
  const settings = document.createElement('details'); settings.className = 'experience-settings';
  settings.innerHTML = `<summary class="icon-button" aria-label="${ui.settings}" title="${ui.settings}"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none"><path d="m9.5 3-.7 2.2-2 .9-2.1-.5-2 3.4 1.5 1.7v2.6L2.7 15l2 3.4 2.2-.5 1.9 1 .7 2.1h4.1l.7-2.2 1.9-.9 2.2.5 2-3.4-1.5-1.7v-2.6L20.4 9l-2-3.4-2.2.5-1.9-.9-.7-2.2Z"/><circle cx="11.6" cy="12" r="3.2"/></svg></summary><div class="experience-panel"><p class="experience-eyebrow">EXPERIENCE</p><h2>${ui.title}</h2><p class="experience-subtitle">${ui.subtitle}</p><label class="experience-option"><span><strong>${ui.atmosphere}</strong><small>${ui.atmosphereHint}</small></span><input id="atmosphere-option" type="checkbox" role="switch"><span class="experience-switch" aria-hidden="true"></span></label><label class="experience-option"><span><strong>${ui.command}</strong><small>${ui.commandHint}</small></span><input id="command-option" type="checkbox" role="switch"><span class="experience-switch" aria-hidden="true"></span></label><button type="button" class="experience-open" hidden>${ui.open}<span aria-hidden="true">↗</span></button><p class="experience-note">${ui.saved}</p></div>`;
  document.querySelector('#theme-toggle').before(settings);
  const emberOption = document.createElement('label'); emberOption.className = 'experience-option';
  emberOption.innerHTML = `<span><strong>${ui.ember}<span class="ember-option-mark" aria-hidden="true">✧</span></strong><small>${ui.emberHint}</small></span><input id="ember-option" type="checkbox" role="switch"><span class="experience-switch" aria-hidden="true"></span>`;
  settings.querySelector('.experience-open').before(emberOption);
  const emberStatus = document.createElement('p'); emberStatus.className = 'ember-status'; emberStatus.setAttribute('role', 'status'); emberStatus.hidden = true; emberOption.after(emberStatus);
  const emberInput = settings.querySelector('#ember-option');
  let emberEffect = null, emberLoading = false;
  const designInputs = {};
  const designLabels = en ? {
    blueprint: ['Blueprint mode', 'A drafting grid, measured outlines and a brief scan.'],
    sculpture: ['M sculpture', 'Interactive hero artwork on the home page. Metal, glass or light.']
  } : {
    blueprint: ['Blueprint-Modus', 'Zeichenraster, Maßlinien und ein kurzer Scan.'],
    sculpture: ['M-Skulptur', 'Interaktives Titelmotiv auf der Startseite. Metall, Glas oder Licht.']
  };
  for (const name of ['blueprint', 'sculpture']) {
    const option = document.createElement('label'); option.className = 'experience-option';
    option.innerHTML = `<span><strong>${designLabels[name][0]}</strong><small>${designLabels[name][1]}</small></span><input id="${name}-option" type="checkbox" role="switch"><span class="experience-switch" aria-hidden="true"></span>`;
    settings.querySelector('.experience-open').before(option); designInputs[name] = option.querySelector('input');
    designInputs[name].addEventListener('change', () => { prefs[name] = designInputs[name].checked; save(); apply(); });
  }
  const designStatus = document.createElement('p'); designStatus.className = 'design-status'; designStatus.hidden = true; designStatus.setAttribute('role', 'status'); settings.querySelector('.experience-open').before(designStatus);
  let designModule, designLoading = false, blueprintEffect = null, sculptureEffect = null;
  const atmosphereInput = settings.querySelector('#atmosphere-option'), commandInput = settings.querySelector('#command-option'), openButton = settings.querySelector('.experience-open');
  const launcher = document.createElement('button'); launcher.type = 'button'; launcher.className = 'command-launcher'; launcher.hidden = true; launcher.title = ui.open; launcher.setAttribute('aria-label', ui.open); launcher.innerHTML = '<span aria-hidden="true">⌘</span><small>⌘ / Ctrl K</small>'; document.body.append(launcher);
  let dialog, input, list, status, commands = [], filtered = [], activeIndex = 0;
  let atmosphere, halo, sectionObserver, pointerFrame = 0, pointerX = 0, pointerY = 0;
  const languageMenu = document.querySelector('.language-switcher');
  settings.addEventListener('toggle', () => { if (settings.open) { languageMenu.open = false; const menu = document.querySelector('#menu-toggle'); if (menu.getAttribute('aria-expanded') === 'true') menu.click(); } });
  languageMenu.addEventListener('toggle', () => { if (languageMenu.open) settings.open = false; });
  document.querySelector('#menu-toggle').addEventListener('click', () => { if (document.querySelector('#menu-toggle').getAttribute('aria-expanded') === 'true') settings.open = false; });
  document.addEventListener('click', event => { if (!settings.contains(event.target)) settings.open = false; });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && settings.open) { settings.open = false; settings.querySelector('summary').focus(); }
    if (prefs.command && (event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === 'k' && !document.querySelector('dialog[open]:not(.command-dialog)')) { event.preventDefault(); if (dialog?.open) dialog.close(); else openCommand(); }
  });
  function save() { try { localStorage.setItem(key, JSON.stringify(prefs)); } catch { /* Preferences still apply this session. */ } }
  function apply() {
    atmosphereInput.checked = prefs.atmosphere; commandInput.checked = prefs.command;
    emberInput.checked = prefs.ember;
    launcher.hidden = openButton.hidden = !prefs.command;
    if (!prefs.command && dialog?.open) dialog.close();
    if (prefs.atmosphere && !atmosphere) createAtmosphere();
    syncAtmosphere();
    syncEmber();
    designInputs.blueprint.checked = prefs.blueprint; designInputs.sculpture.checked = prefs.sculpture;
    syncDesign();
  }
  atmosphereInput.addEventListener('change', () => { prefs.atmosphere = atmosphereInput.checked; save(); apply(); });
  commandInput.addEventListener('change', () => { prefs.command = commandInput.checked; save(); apply(); });
  emberInput.addEventListener('change', () => { prefs.ember = emberInput.checked; save(); apply(); });
  async function syncEmber() {
    if (!prefs.ember || motion.matches) {
      emberEffect?.destroy(); emberEffect = null;
      emberStatus.hidden = !prefs.ember; emberStatus.textContent = prefs.ember ? ui.emberReduced : '';
      return;
    }
    if (emberEffect || emberLoading) return;
    emberLoading = true; emberStatus.textContent = ui.emberLoading; emberStatus.hidden = false;
    try {
      const module = await import(emberURL);
      if (!prefs.ember || motion.matches) return;
      const effect = await module.createEmberEffect(() => prefs.ember && !motion.matches);
      if (effect && prefs.ember && !motion.matches) { emberEffect = effect; effect.start(); }
      else effect?.destroy();
    } catch {
      emberEffect?.destroy(); emberEffect = null;
      prefs.ember = false; emberInput.checked = false; save();
      emberStatus.textContent = ui.emberError;
    } finally {
      emberLoading = false;
      emberStatus.hidden = emberStatus.textContent !== ui.emberError && !(prefs.ember && motion.matches);
      if (prefs.ember && !motion.matches && !emberEffect) queueMicrotask(syncEmber);
    }
  }
  motion.addEventListener('change', syncEmber);
  async function syncDesign() {
    if (!prefs.blueprint) { blueprintEffect?.destroy(); blueprintEffect = null; }
    if (!prefs.sculpture) { sculptureEffect?.destroy(); sculptureEffect = null; }
    const figure = document.querySelector('.hero-art');
    if ((!prefs.blueprint && !(prefs.sculpture && figure)) || designLoading) return;
    designLoading = true;
    let stylesheet;
    try {
      if (!designModule) {
        designStatus.textContent = en ? 'Preparing the visual extras…' : 'Die visuellen Extras werden vorbereitet…'; designStatus.hidden = false;
        stylesheet = document.createElement('link'); stylesheet.rel = 'stylesheet'; stylesheet.href = designCSS;
        const cssReady = new Promise((resolve, reject) => { stylesheet.onload = resolve; stylesheet.onerror = reject; });
        document.head.append(stylesheet);
        const [module] = await Promise.all([import(designURL), cssReady]); designModule = module;
      }
      if (prefs.blueprint && !blueprintEffect) blueprintEffect = designModule.createBlueprint();
      if (prefs.sculpture && figure && !sculptureEffect) sculptureEffect = designModule.createSculpture(figure);
      designStatus.hidden = true;
    } catch {
      stylesheet?.remove(); designModule = null;
      blueprintEffect?.destroy(); sculptureEffect?.destroy(); blueprintEffect = sculptureEffect = null;
      prefs.blueprint = prefs.sculpture = false; designInputs.blueprint.checked = designInputs.sculpture.checked = false; save();
      designStatus.textContent = en ? 'The visual extras could not load. Please try again.' : 'Die visuellen Extras konnten nicht geladen werden. Bitte erneut versuchen.'; designStatus.hidden = false;
    } finally { designLoading = false; }
  }
  window.addEventListener('storage', event => { if (event.key !== key) return; try { prefs = readPrefs(JSON.parse(event.newValue)); apply(); } catch { /* Ignore invalid storage. */ } });
  launcher.addEventListener('click', openCommand); openButton.addEventListener('click', openCommand);
  function createAtmosphere() {
    atmosphere = document.createElement('div'); atmosphere.className = 'portfolio-atmosphere'; atmosphere.setAttribute('aria-hidden', 'true');
    atmosphere.innerHTML = '<div class="atmosphere-wash wash-one"></div><div class="atmosphere-wash wash-two"></div><div class="atmosphere-stars"></div><div class="atmosphere-pointer"></div>';
    document.body.prepend(atmosphere); halo = atmosphere.querySelector('.atmosphere-pointer');
    sectionObserver = new IntersectionObserver(entries => { for (const entry of entries) if (entry.isIntersecting) { const cool = /projekte|skills|gallery/.test(entry.target.id + ' ' + entry.target.className); atmosphere.style.setProperty('--atmosphere-a', cool ? '101,147,183' : '208,145,94'); atmosphere.style.setProperty('--atmosphere-b', cool ? '151,124,176' : '102,147,119'); } }, { rootMargin: '-35% 0px -45% 0px', threshold: 0 });
  }
  function pointerMove(event) {
    pointerX = event.clientX; pointerY = event.clientY;
    if (!pointerFrame) pointerFrame = requestAnimationFrame(() => { pointerFrame = 0; halo.style.transform = `translate3d(${pointerX - 150}px,${pointerY - 150}px,0)`; halo.classList.add('pointer-visible'); });
  }
  function hidePointer() { halo?.classList.remove('pointer-visible'); }
  function syncAtmosphere() {
    if (!atmosphere) return;
    const running = prefs.atmosphere && !document.hidden && !motion.matches;
    atmosphere.hidden = !prefs.atmosphere; atmosphere.classList.toggle('atmosphere-still', !running);
    document.body.classList.toggle('has-atmosphere', prefs.atmosphere);
    document.removeEventListener('pointermove', pointerMove); document.documentElement.removeEventListener('pointerleave', hidePointer);
    if (pointerFrame) cancelAnimationFrame(pointerFrame); pointerFrame = 0; hidePointer();
    sectionObserver.disconnect();
    if (prefs.atmosphere && !document.hidden) document.querySelectorAll('main>section').forEach(section => sectionObserver.observe(section));
    if (running && fine.matches) { document.addEventListener('pointermove', pointerMove, { passive: true }); document.documentElement.addEventListener('pointerleave', hidePointer); }
  }
  document.addEventListener('visibilitychange', syncAtmosphere); motion.addEventListener('change', syncAtmosphere); fine.addEventListener('change', syncAtmosphere);
  function samePage(path) { return location.pathname === home && path.startsWith(home + '#') ? path.slice(home.length) : path; }
  function buildCommands() {
    const entries = [
      [ui.projects, home + '#projekte', 'projects projekte work arbeiten'], [ui.fullGallery, gallery, 'gallery galerie orbit'], [ui.list, home + '#alle-projekte', 'directory list liste alle'], [ui.about, home + '#ueber-mich', 'about über mich matze'], [ui.skills, home + '#skills', 'skills technologien technologies'], [ui.contact, home + '#kontakt', 'contact kontakt email']
    ].map(([title, href, keywords]) => ({ title, href: samePage(href), keywords, kind: ui.page, symbol: '↗' }));
    for (const project of document.querySelectorAll('.project-row, .gallery-card')) {
      const name = (project.querySelector('h3') || project.querySelector('.row-name')).cloneNode(true); name.querySelectorAll('small').forEach(el => el.remove());
      entries.push({ title: name.textContent.trim(), href: '#' + project.id, keywords: project.dataset.search || '', kind: ui.project, symbol: '◇' });
    }
    entries.push({ title: root.dataset.theme === 'dark' ? ui.light : ui.dark, keywords: 'theme design mode dark light dunkel hell', kind: ui.action, symbol: '◐', run: () => document.querySelector('#theme-toggle').click() });
    entries.push({ title: prefs.atmosphere ? ui.off : ui.on, keywords: 'atmosphere atmosphäre stars sterne licht light', kind: ui.action, symbol: '✧', run: () => { prefs.atmosphere = !prefs.atmosphere; save(); apply(); } });
    const counterpart = [...languageMenu.querySelectorAll('a')].find(a => a.getAttribute('hreflang') === (en ? 'de' : 'en')) || [...languageMenu.querySelectorAll('a')].find(a => a.getAttribute('href') !== location.pathname);
    if (counterpart) entries.push({ title: en ? ui.german : ui.english, href: counterpart.getAttribute('href') + location.hash, keywords: 'language sprache deutsch german english englisch', kind: ui.language, symbol: '◎' });
    return entries;
  }
  function initCommand() {
    if (dialog) return;
    dialog = document.createElement('dialog'); dialog.className = 'command-dialog'; dialog.setAttribute('aria-labelledby', 'command-title');
    dialog.innerHTML = `<div class="command-top"><span class="command-mark" aria-hidden="true">⌘</span><h2 id="command-title">${ui.search}</h2><button class="command-close" type="button" aria-label="${ui.close}">×</button></div><div class="command-search"><span aria-hidden="true">⌕</span><input id="command-search" type="text" role="combobox" aria-autocomplete="list" aria-controls="command-results" aria-expanded="true" aria-label="${ui.search}" placeholder="${ui.placeholder}" autocomplete="off" spellcheck="false"></div><div id="command-results" role="listbox" aria-label="${ui.search}"></div><p class="command-empty" hidden>${ui.empty}</p><p class="sr-only command-status" role="status"></p><div class="command-footer"><span><kbd>↑ ↓</kbd> ${ui.navigate}</span><span><kbd>↵</kbd> ${ui.select}</span><span><kbd>esc</kbd> ${ui.escape}</span></div>`;
    document.body.append(dialog); input = dialog.querySelector('input'); list = dialog.querySelector('#command-results'); status = dialog.querySelector('.command-status');
    dialog.querySelector('.command-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
    dialog.addEventListener('close', () => { document.body.classList.remove('command-open'); input.removeAttribute('aria-activedescendant'); });
    input.addEventListener('input', render);
    input.addEventListener('keydown', event => {
      if (event.isComposing) return;
      if (['ArrowDown', 'ArrowUp'].includes(event.key)) { event.preventDefault(); if (filtered.length) select((activeIndex + (event.key === 'ArrowDown' ? 1 : -1) + filtered.length) % filtered.length, true); }
      if (event.key === 'Enter' && filtered.length) { event.preventDefault(); list.children[activeIndex].click(); }
    });
  }
  const normalize = value => value.toLocaleLowerCase(root.lang).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  function render() {
    const terms = normalize(input.value).trim().split(/\s+/).filter(Boolean);
    filtered = commands.filter(command => terms.every(term => normalize(command.title + ' ' + command.keywords).includes(term)));
    list.replaceChildren();
    filtered.forEach((command, index) => {
      const item = document.createElement(command.href ? 'a' : 'button'); if (!command.href) item.type = 'button'; else item.setAttribute('href', command.href);
      item.className = 'command-result'; item.id = 'command-result-' + index; item.tabIndex = -1; item.setAttribute('role', 'option');
      const icon = document.createElement('span'); icon.className = 'command-result-icon'; icon.textContent = command.symbol; icon.setAttribute('aria-hidden', 'true');
      const title = document.createElement('span'); title.textContent = command.title;
      const kind = document.createElement('small'); kind.textContent = command.kind;
      item.append(icon, title, kind);
      item.addEventListener('pointermove', () => { if (activeIndex !== index) select(index); });
      item.addEventListener('click', event => { dialog.close(); if (command.run) command.run(); else if (command.href.startsWith('#project-') && document.querySelector('.gallery-grid')?.hidden) document.querySelector('[data-view="grid"]').click(); });
      list.append(item);
    });
    dialog.querySelector('.command-empty').hidden = filtered.length !== 0;
    status.textContent = `${filtered.length} ${ui.results}`; activeIndex = 0;
    if (filtered.length) select(0); else input.removeAttribute('aria-activedescendant');
    list.scrollTop = 0;
  }
  function select(index, scroll = false) {
    activeIndex = index;
    [...list.children].forEach((item, i) => item.setAttribute('aria-selected', String(i === index)));
    input.setAttribute('aria-activedescendant', list.children[index].id);
    if (scroll) list.children[index].scrollIntoView({ block: 'nearest', behavior: 'instant' });
  }
  function openCommand() {
    if (!prefs.command || document.querySelector('dialog[open]:not(.command-dialog)')) return;
    initCommand(); if (dialog.open) return;
    settings.open = false; languageMenu.open = false;
    const menu = document.querySelector('#menu-toggle'); if (menu.getAttribute('aria-expanded') === 'true') menu.click();
    commands = buildCommands(); input.value = ''; render(); dialog.showModal(); document.body.classList.add('command-open'); input.focus();
  }
  apply();
})();
