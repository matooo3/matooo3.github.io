const root = document.documentElement;
const isEnglish = root.lang === 'en';
const ui = isEnglish ? {
  darkState: 'Dark mode active', lightState: 'Light mode active', openMenu: 'Open menu', closeMenu: 'Close menu', lightTheme: 'Switch to light mode', darkTheme: 'Switch to dark mode',
  project: 'project', projects: 'projects', copyEmail: 'Copy email address', emailCopied: 'Email address copied',
  copyFallback: 'Please select and copy the email address.'
} : {
  darkState: 'Dunkler Modus aktiv', lightState: 'Heller Modus aktiv', openMenu: 'Menü öffnen', closeMenu: 'Menü schließen', lightTheme: 'Helles Design aktivieren', darkTheme: 'Dunkles Design aktivieren',
  project: 'Projekt', projects: 'Projekte', copyEmail: 'E-Mail-Adresse kopieren', emailCopied: 'E-Mail-Adresse kopiert',
  copyFallback: 'Bitte die E-Mail-Adresse markieren und kopieren.'
};
const menuToggle = document.querySelector('#menu-toggle');
const nav = document.querySelector('#main-nav');
function closeMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', ui.openMenu);
  nav.classList.remove('is-open');
}
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? ui.closeMenu : ui.openMenu);
  nav.classList.toggle('is-open', open);
});
nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && nav.classList.contains('is-open')) { closeMenu(); menuToggle.focus(); } });
document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
const desktop = matchMedia('(min-width: 761px)');
desktop.addEventListener('change', closeMenu);

const themeToggle = document.querySelector('#theme-toggle');
function syncTheme() {
  const dark = root.dataset.theme === 'dark';
  themeToggle.setAttribute('aria-pressed', String(dark));
  const label = `${dark ? ui.darkState : ui.lightState}. ${dark ? ui.lightTheme : ui.darkTheme}`;
  themeToggle.setAttribute('aria-label', label);
  themeToggle.title = label;
  document.querySelector('meta[name="theme-color"]').content = dark ? '#191c19' : '#f7f7f2';
}
syncTheme();
themeToggle.addEventListener('click', () => {
  root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('matze-portfolio-theme', root.dataset.theme); } catch { /* Theme still works without persistence. */ }
  syncTheme();
});

const rows = [...document.querySelectorAll('.project-row')];
const filters = [...document.querySelectorAll('[data-filter]')];
const search = document.querySelector('#project-search');
const count = document.querySelector('#project-count');
let category = 'all';
document.querySelector('.directory-toolbar').hidden = false;
const normalize = text => text.toLocaleLowerCase(root.lang).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
function filterProjects() {
  const terms = normalize(search.value.trim()).split(/\s+/).filter(Boolean);
  let visible = 0;
  for (const row of rows) {
    const matches = (category === 'all' || row.dataset.category === category) && terms.every(term => normalize(row.dataset.search).includes(term));
    row.hidden = !matches;
    if (matches) visible++;
  }
  count.textContent = `${visible} ${visible === 1 ? ui.project : ui.projects}`;
  document.querySelector('.empty-state').hidden = visible !== 0;
  for (const filter of filters) {
    const active = filter.dataset.filter === category;
    filter.classList.toggle('active', active);
    filter.setAttribute('aria-pressed', String(active));
  }
}
filters.forEach(filter => filter.addEventListener('click', () => { category = filter.dataset.filter; filterProjects(); }));
search.addEventListener('input', filterProjects);
document.querySelector('#reset-filters').addEventListener('click', () => { category = 'all'; search.value = ''; filterProjects(); search.focus(); });
function revealProjectHash() {
  const id = location.hash.slice(1);
  if (!id.startsWith('project-')) return;
  const row = document.getElementById(id);
  if (!row?.classList.contains('project-row')) return;
  category = 'all'; search.value = ''; filterProjects(); row.open = true;
  requestAnimationFrame(() => row.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }));
}
window.addEventListener('hashchange', revealProjectHash);
document.addEventListener('click', event => {
  const link = event.target.closest('a[href^="#project-"]');
  if (link && link.hash === location.hash) revealProjectHash();
});
revealProjectHash();

const copyButton = document.querySelector('#copy-email');
copyButton.addEventListener('click', async () => {
  const status = document.querySelector('#copy-status');
  try {
    await navigator.clipboard.writeText('matze2948@gmail.com');
    copyButton.classList.add('copied');
    copyButton.setAttribute('aria-label', ui.emailCopied);
    status.textContent = ui.emailCopied + '.';
    setTimeout(() => { copyButton.classList.remove('copied'); copyButton.setAttribute('aria-label', ui.copyEmail); }, 2500);
  } catch {
    status.classList.remove('sr-only');
    status.textContent = ui.copyFallback;
  }
});
document.querySelector('#year').textContent = new Date().getFullYear();

// Content is visible by default, including without JS or with reduced motion.
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('revealed'); observer.unobserve(entry.target); }
  }), { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
}

// Native disclosure and ordinary links keep language selection usable without JS.
const languageMenu = document.querySelector('.language-switcher');
languageMenu.addEventListener('toggle', () => { if (languageMenu.open) closeMenu(); });
menuToggle.addEventListener('click', () => { languageMenu.open = false; });
document.addEventListener('click', event => { if (!languageMenu.contains(event.target)) languageMenu.open = false; });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && languageMenu.open) {
    languageMenu.open = false;
    languageMenu.querySelector('summary').focus();
  }
});
languageMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => { link.hash = location.hash; });
});
