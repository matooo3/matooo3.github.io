import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, relative } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const assetVersion = path => createHash('sha256').update(readFileSync(path)).digest('hex').slice(0, 10);
import { projects, categoryLabels } from '../data/projects.mjs';
import { englishHtml, languageSwitcher, projectTranslations } from '../data/i18n.mjs';

const baseCommit = 'ea3393b158b1f907dabf4737e505824f8f785287';
const snapshot = JSON.parse(readFileSync('data/repositories.json', 'utf8'));
const repoMap = new Map(snapshot.repositories.map(repo => [repo.name, repo]));
for (const project of projects) {
  if (project.repo && !repoMap.has(project.repo)) throw new Error(`Missing repository: ${project.repo}`);
  if (project.repo) project.private = repoMap.get(project.repo).private;
}
const esc = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const icon = (name, cls = '') => `<span class="icon ${cls}" aria-hidden="true" style="--icon:url('assets/icons/${name}.svg')"></span>`;
const slug = project => (project.repo || project.name).toLowerCase().replace(/[^a-z0-9]+/g, '-');
const anchor = (url, text, cls = '') => `<a class="${cls}" href="${esc(url)}"${url.startsWith('https://') ? ' target="_blank" rel="noopener noreferrer"' : ''}>${text}</a>`;
const tags = project => project.tags.map(tag => `<span>${esc(tag)}</span>`).join('');
function actions(project) {
  const links = [];
  if (project.demo) links.push(anchor(project.demo, `${esc(project.demoLabel || 'Projekt öffnen')} ${icon('arrow-up-right')}`, 'text-link'));
  if (project.repo && !project.private) links.push(anchor(`https://github.com/${project.repo}`, `Code ${icon('github-logo')}`, 'text-link'));
  if (project.private) links.push(`<span class="private-code">Privater Code</span>`);
  if (project.download) links.push(anchor(project.download, `Android-Download ${icon('arrow-up-right')}`, 'text-link'));
  return links.join('');
}
function visual(project) {
  if (project.visual === 'life') return `<div class="project-visual life-visual"><span class="visual-kicker">MYLIFEGRAPH / DESIGN SYSTEM</span><img src="assets/mylifegraph.webp" width="1280" height="675" loading="lazy" alt="MyLifeGraph: Vorschau des hellen Designsystems mit Planungselementen und Statusanzeigen"><span class="visual-footnote">Flutter · Persönliche Tagesplanung</span></div>`;
  if (project.visual === 'pencil') return `<div class="project-visual pencil-visual"><img class="pencil-output" src="assets/pencil2pixel.webp" width="1024" height="1024" loading="lazy" alt="Pencil2Pixel: Ein aus einer Skizze generiertes pinkes Flugzeug in einer Wolkenlandschaft"><div class="sketch-inset"><img src="assets/pencil-sketch.webp" width="1111" height="1111" loading="lazy" alt="Die ursprüngliche handgezeichnete Flugzeugskizze"><span>Alles beginnt mit einer Skizze.</span></div><span class="visual-pill">Skizze → Bild</span></div>`;
  if (project.visual === 'nutri') return `<div class="project-visual nutri-visual"><span class="visual-kicker">NUTRIPILOT / V&M FUEL</span><p class="visual-headline">Weniger planen.<br>Bewusster essen.</p><div class="nutri-bottom"><span>Meal Planning<br>& Einkaufslisten</span>${icon('arrow-up-right')}</div></div>`;
  return `<div class="project-visual yapp-visual"><span class="visual-kicker">YAPP AI / VOICE TO TEXT</span><p class="visual-headline">Ein Gedanke.<br>Einfach gesagt.</p><div class="yapp-bottom"><span>Windows & Android</span><span>Sprache wird Text ${icon('arrow-right')}</span></div></div>`;
}
const featured = projects.filter(project => project.featured).map((project, index) => `<article class="featured-project reveal" aria-labelledby="featured-${slug(project)}">
  <a class="visual-link" href="#project-${slug(project)}" aria-label="Mehr über ${esc(project.name)}">${visual(project)}</a>
  <div class="project-heading"><div><span class="eyebrow">0${index + 1} / ${esc(categoryLabels[project.category])}</span><h3 id="featured-${slug(project)}">${esc(project.name)}</h3></div><a class="round-link" href="#project-${slug(project)}" aria-label="Details zu ${esc(project.name)}">${icon('arrow-up-right')}</a></div>
  <p>${esc(project.description)}</p><div class="tags">${tags(project)}</div><div class="project-actions">${actions(project)}</div>
</article>`).join('');
const rows = projects.map((project, index) => `<details class="project-row" id="project-${slug(project)}" data-category="${project.category}" data-search="${esc([project.name, project.repo || '', project.description, ...project.tags, ...Object.values(projectTranslations[project.repo || project.name])].join(' ').toLowerCase())}">
  <summary><span class="row-number">${String(index + 1).padStart(2, '0')}</span><span class="row-name">${esc(project.name)}${project.private ? '<small>Privat</small>' : ''}</span><span class="row-category">${esc(categoryLabels[project.category])}</span><span class="row-tech">${esc(project.tags[0])}</span>${icon('arrow-down', 'row-arrow')}</summary>
  <div class="row-detail"><p>${esc(project.detail || project.description)}</p><div class="tags">${tags(project)}</div><div class="project-actions">${actions(project)}</div></div>
</details>`).join('');
const filters = Object.entries(categoryLabels).map(([id, label]) => `<button type="button" class="filter${id === 'all' ? ' active' : ''}" data-filter="${id}" aria-pressed="${id === 'all'}">${label}</button>`).join('');

const html = `<!doctype html>
<html lang="de" data-theme="dark">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Matze — Software, KI & gute Ideen.</title>
  <meta name="description" content="Ich bin Matze. Ich entwickle Apps, erkunde künstliche Intelligenz und mache aus Neugier eigene Projekte. Entdecke mein Portfolio und die ursprüngliche Website im Archiv.">
  <meta name="theme-color" content="#191c19"><meta name="color-scheme" content="dark light">
  <link rel="canonical" href="https://matooo3.github.io/">
  <meta property="og:type" content="website"><meta property="og:locale" content="de_DE"><meta property="og:title" content="Matze — Software, KI & gute Ideen."><meta property="og:description" content="Apps, KI-Experimente und Projekte aus echter Neugier. Das Portfolio von Matze."><meta property="og:url" content="https://matooo3.github.io/"><meta property="og:image" content="https://matooo3.github.io/assets/curiosity.webp">
  <link rel="icon" href="assets/icons/code.svg" type="image/svg+xml">
  <link rel="preload" href="assets/fonts/manrope-latin.woff2" as="font" type="font/woff2" crossorigin>
  <script src="theme-init.js?v=${assetVersion('theme-init.js')}"></script><link rel="stylesheet" href="styles.css?v=${assetVersion('styles.css')}"><script src="app.js?v=${assetVersion('app.js')}" defer></script>
</head>
<body>
<a class="skip-link" href="#main">Zum Inhalt springen</a>
<header class="site-header"><div class="nav-wrap">
  <a href="#" class="wordmark" aria-label="Matze – Startseite">matze<span>.</span></a>
  <nav id="main-nav" aria-label="Hauptnavigation"><a href="#projekte">Projekte</a><a href="#ueber-mich">Über mich</a><a href="#skills">Skills</a><a href="#kontakt">Kontakt</a></nav>
  <div class="nav-actions"><!--LANGUAGE_SWITCH--><a class="archive-nav" href="archiv/" aria-label="Archiv">${icon('archive-box')} <span class="archive-label">Archiv</span></a><button class="icon-button" id="theme-toggle" type="button" aria-label="Dunkler Modus aktiv. Zum hellen Modus wechseln" title="Dunkler Modus aktiv. Zum hellen Modus wechseln" aria-pressed="true">${icon('moon', 'moon-icon')}${icon('sun', 'sun-icon')}</button><button class="icon-button menu-button" id="menu-toggle" type="button" aria-label="Menü öffnen" aria-expanded="false" aria-controls="main-nav">${icon('list', 'menu-open')}${icon('x', 'menu-close')}</button></div>
</div></header>
<main id="main">
  <section class="hero wrap" aria-labelledby="hero-title">
    <div class="hero-top"><span class="eyebrow"><span class="status-dot"></span> NEUGIER ALS ANTRIEB</span><span class="hero-location">${icon('map-pin')} Tübingen, Deutschland</span></div>
    <div class="hero-grid"><div class="hero-copy"><p class="hello">Hi, ich bin Matze.</p><h1 id="hero-title">Aus Ideen<br>wird <span>Wirklichkeit.</span></h1><p class="hero-description">Ich entwickle Apps, erkunde künstliche Intelligenz und baue Dinge, die meinen Alltag besser machen.</p><div class="hero-actions"><a class="button primary" href="#projekte">Meine Projekte ${icon('arrow-down')}</a><a class="button quiet" href="https://github.com/matooo3" target="_blank" rel="noopener noreferrer">${icon('github-logo')} GitHub ${icon('arrow-up-right')}</a></div></div>
    <figure class="hero-art"><img src="assets/curiosity.webp" width="1536" height="1024" fetchpriority="high" alt="Orangefarbene, verschlungene Skulptur als Sinnbild für Ideen, die sich verbinden"><figcaption><span>NEUGIER VERBINDET.</span><span>01 — ∞</span></figcaption></figure></div>
    <div class="hero-footer"><p>Informatik im Kopf. <span>Bewegung im Alltag.</span></p><div><span>SOFTWARE</span><span>ARTIFICIAL INTELLIGENCE</span><span>FITNESS</span></div></div>
  </section>
  <section class="selected wrap section-space" id="projekte" aria-labelledby="projects-title"><div class="section-heading"><div><p class="eyebrow">01 / AUSGEWÄHLTE ARBEITEN</p><h2 id="projects-title">Gebaut aus Neugier<span>.</span></h2></div><p>Vom ersten kleinen Tool bis zur KI-App.<br>Ein Einblick in das, woran ich arbeite.</p></div><div class="featured-grid">${featured}</div><a class="button outline all-projects-link" href="#alle-projekte">Alle Projekte entdecken ${icon('arrow-down')}</a></section>
  <section class="about-section section-space" id="ueber-mich" aria-labelledby="about-title"><div class="wrap about-grid"><div><p class="eyebrow">02 / DER MENSCH DAHINTER</p><h2 id="about-title">Mehr als<br>nur Code<span>.</span></h2><p class="about-signature">Matze <span>/ aka matooo</span></p></div><div class="about-content"><p class="about-lead">Mich interessiert, wie Dinge funktionieren. Und wie man sie ein bisschen besser machen kann.</p><p>Ich studiere Informatik in Tübingen. In meinen Projekten treffen Softwareentwicklung, künstliche Intelligenz und praktische Ideen aufeinander – vom Trainingstool bis zum persönlichen Alltagsbegleiter.</p><p>Abseits des Bildschirms gehören Calisthenics, Fitness und Ernährung zu meinem Alltag. Mein Hintergrund im Rettungsdienst bringt eine weitere Perspektive mit: Technik ist dann spannend, wenn sie Menschen hilft.</p><div class="interest-grid"><div>${icon('code')}<h3>Verstehen & bauen</h3><p>Ideen ausprobieren und durch eigene Projekte lernen.</p></div><div>${icon('barbell')}<h3>Dranbleiben</h3><p>Im Training genauso wie an der nächsten Herausforderung.</p></div></div></div></div></section>
  <section class="wrap section-space skills-section" id="skills" aria-labelledby="skills-title"><div class="section-heading"><div><p class="eyebrow">03 / MEIN WERKZEUGKASTEN</p><h2 id="skills-title">Was ich mitbringe<span>.</span></h2></div><p>Technologien, mit denen ich in meinen<br>eigenen und gemeinsamen Projekten arbeite.</p></div><div class="skills-grid">
    <article><span class="skill-index">01</span>${icon('code')}<h3>Web & Apps</h3><p>Von der Browser-Idee zur mobilen Anwendung.</p><div class="tags"><span>JavaScript</span><span>TypeScript</span><span>HTML & CSS</span><span>Next.js</span><span>Flutter / Dart</span><span>Java</span></div></article>
    <article><span class="skill-index">02</span>${icon('brain')}<h3>KI & Daten</h3><p>Modelle verstehen, ausprobieren und in Projekte bringen.</p><div class="tags"><span>Python</span><span>Generative AI</span><span>Computer Vision</span><span>Reinforcement Learning</span><span>Jupyter</span></div></article>
    <article><span class="skill-index">03</span>${icon('github-logo')}<h3>Systeme & Tools</h3><p>Das Fundament hinter funktionierender Software.</p><div class="tags"><span>Git / GitHub</span><span>FastAPI</span><span>Supabase</span><span>PostgreSQL</span><span>Scala</span><span>C# / Unity</span></div></article>
    <article class="agent-skills"><span class="skill-index">04</span>${icon('code')}<div><h3>Agentic Engineering</h3><p>Konzeption und Steuerung autonomer Entwicklungsabläufe und integrierter Apps mit Codex, Grok Build, Claude Code (App und CLI) und Antigravity (App und CLI). Schwerpunkte sind Kontextmanagement, strukturierte Agent-Anweisungen, MCP, Plugins und die Integration von KI-Funktionen über APIs.</p><div class="tags"><span>Codex</span><span>Grok Build</span><span>Claude Code · App & CLI</span><span>Antigravity · App & CLI</span><span>MCP</span><span>Plugins & Skills</span><span>API- & KI-Integration</span><span>AGENTS.md / SKILL.md</span><span>Kontextmanagement</span><span>Autonome Workflows</span></div></div></article>
  </div></section>
  <section class="wrap section-space directory" id="alle-projekte" aria-labelledby="directory-title"><div class="section-heading"><div><p class="eyebrow">04 / PROJEKTVERZEICHNIS</p><h2 id="directory-title">Die ganze Sammlung<span>.</span></h2></div><p>Apps, Experimente und erste Schritte.<br>Jedes Projekt ist ein Stück Lernkurve.</p></div>
    <div class="directory-toolbar" hidden><div class="filters" role="group" aria-label="Projekte nach Kategorie filtern">${filters}</div><label class="search-box">${icon('magnifying-glass')}<span class="sr-only">Projekte durchsuchen</span><input id="project-search" type="search" placeholder="Projekt oder Technologie" autocomplete="off"></label></div>
    <div class="directory-caption"><span>PROJEKT / NAME</span><span id="project-count" role="status" aria-live="polite">${projects.length} Projekte</span></div>
    <div id="project-list">${rows}</div><div class="empty-state" hidden><h3>Hier ist noch Platz für eine neue Idee.</h3><p>Für diese Suche wurde kein Projekt gefunden.</p><button class="button outline" id="reset-filters" type="button">Alle Projekte anzeigen</button></div>
  </section>
  <section class="wrap archive-section" aria-labelledby="archive-title"><div class="archive-icon">${icon('archive-box')}</div><div class="archive-copy"><p class="eyebrow">DIE ERSTE VERSION BLEIBT.</p><h2 id="archive-title">Jede Entwicklung hat einen Anfang.</h2><p>Meine ursprüngliche Website, alle kleinen Apps und die komplette alte Sammlung.</p></div><a class="button outline" href="archiv/">Archiv · Alte Version ${icon('arrow-up-right')}</a></section>
  <section class="contact-section section-space" id="kontakt" aria-labelledby="contact-title"><div class="wrap"><div class="contact-top"><p class="eyebrow">05 / LASS UNS REDEN</p><span>Von einer Idee zum nächsten Projekt.</span></div><h2 id="contact-title">Gute Ideen beginnen<br>mit einem <a href="mailto:matze2948@gmail.com">Hallo.${icon('arrow-up-right')}</a></h2><div class="contact-bottom"><div class="email-group"><a href="mailto:matze2948@gmail.com" class="contact-email">matze2948@gmail.com</a><button class="icon-button" id="copy-email" aria-label="E-Mail-Adresse kopieren" type="button">${icon('copy')}</button><span id="copy-status" class="sr-only" role="status"></span></div><a href="https://github.com/matooo3" target="_blank" rel="noopener noreferrer" class="contact-github">${icon('github-logo')} GitHub ${icon('arrow-up-right')}</a></div></div></section>
</main>
<footer class="site-footer wrap"><a class="wordmark" href="#" aria-label="Zurück nach oben">matze<span>.</span></a><p>Mit Neugier gebaut. © <span id="year">2026</span> Matze</p><a href="archiv/">Archiv ${icon('arrow-up-right')}</a><a href="#">Nach oben ${icon('arrow-up-right')}</a></footer>
</body></html>`;
const alternates = '<link rel="alternate" hreflang="en" href="https://matooo3.github.io/"><link rel="alternate" hreflang="de" href="https://matooo3.github.io/de/"><link rel="alternate" hreflang="x-default" href="https://matooo3.github.io/">';
const source = html.replace('</head>', alternates + '</head>');
writeFileSync('index.html', englishHtml(source).replace('<!--LANGUAGE_SWITCH-->', languageSwitcher('en')));
mkdirSync('de', { recursive: true });
const german = source.replace('<!--LANGUAGE_SWITCH-->', languageSwitcher('de'))
  .replace('<link rel="canonical" href="https://matooo3.github.io/">', '<link rel="canonical" href="https://matooo3.github.io/de/">')
  .replace('property="og:url" content="https://matooo3.github.io/"', 'property="og:url" content="https://matooo3.github.io/de/"')
  .replace(/\b(href|src)="([^"]*)"/g, (match, attribute, value) => /^(?:[a-z]+:|\/|#|$)/i.test(value) ? match : `${attribute}="../${value}"`)
  .replaceAll("url('assets/", "url('../assets/");
writeFileSync('de/index.html', german);

// Preserve bookmarked legacy HTML routes with redirect stubs, never copies of the old files.
const oldFiles = execFileSync('git', ['ls-tree', '-rz', '--name-only', baseCommit], { encoding: 'utf8' }).split('\0').filter(Boolean);
const redirects = [];
for (const path of oldFiles.filter(file => file.endsWith('.html') && file !== 'index.html')) {
  const target = relative(dirname(path), `archiv/${path}`).replaceAll('\\', '/');
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Zur alten Version</title><meta name="robots" content="noindex"><link rel="canonical" href="https://matooo3.github.io/archiv/${path}"></head><body><p>Die ursprüngliche Seite ist jetzt im Archiv. <a id="archive-target" href="${target}">Alte Version öffnen</a></p><script src="${relative(dirname(path), 'legacy-redirect.js').replaceAll('\\', '/')}"></script></body></html>\n`);
  redirects.push({ from: path, to: `archiv/${path}` });
}
writeFileSync('data/archive-manifest.json', JSON.stringify({ baseCommit, originalFileCount: oldFiles.length, originalFiles: oldFiles, redirects, allowedChanges: ['RepCounter/settings.html', 'connect/manifest.json', 'serviceworker.js'], addedHelpers: ['archive-worker.js'] }, null, 2) + '\n');
console.log(`Built ${projects.length} projects and ${redirects.length} legacy redirects.`);
