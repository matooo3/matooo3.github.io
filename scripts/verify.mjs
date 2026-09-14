import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { projects } from '../data/projects.mjs';
const root = process.cwd();
const manifest = JSON.parse(readFileSync('data/archive-manifest.json', 'utf8'));
const snapshot = JSON.parse(readFileSync('data/repositories.json', 'utf8'));
const originalTree = execFileSync('git', ['ls-tree', '-rz', '--name-only', manifest.baseCommit], {encoding:'utf8'}).split('\0').filter(Boolean);
assert.deepEqual(manifest.originalFiles, originalTree, 'Archive inventory must match the actual original Git tree');
assert.equal(manifest.originalFileCount, 57);
let unchanged = 0;
const replacements = {
  'RepCounter/settings.html': [['https://matooo3.github.io/', '../index.html']],
  'connect/manifest.json': [['"scope": "/"', '"scope": "./"'], ['"start_url": "/connect/index.html"', '"start_url": "./index.html"'], ['"src": "/connect/img/icons/connect.png"', '"src": "./img/icons/connect.png"']],
  'serviceworker.js': [["    window.addEventListener('load', function() {", "    const workerUrl = new URL('./archive-worker.js', document.currentScript.src);\n    window.addEventListener('load', function() {"], ["navigator.serviceWorker.register('/service-worker.js')", "navigator.serviceWorker.register(workerUrl, { scope: new URL('./', workerUrl).pathname })"]]
};
for (const path of originalTree) {
  assert.ok(existsSync(`archiv/${path}`), `Missing archived file: ${path}`);
  const original = execFileSync('git', ['show', `${manifest.baseCommit}:${path}`], {maxBuffer:100*1024*1024});
  const archived = readFileSync(`archiv/${path}`);
  if (!manifest.allowedChanges.includes(path)) {
    assert.ok(original.equals(archived), `Original content changed: ${path}`); unchanged++;
  } else {
    let expected = original.toString('utf8');
    for (const [from, to] of replacements[path]) { assert.ok(expected.includes(from)); expected = expected.replace(from, to); }
    assert.equal(archived.toString('utf8'), expected, `Changes beyond approved link repair: ${path}`);
  }
}
const listedRepos = new Set(projects.map(p => p.repo).filter(Boolean));
assert.equal(new Set(projects.map(p => p.name)).size, projects.length);
assert.deepEqual(snapshot.repositories.map(repo => repo.name).sort(), [...listedRepos].sort(), 'Only explicitly listed project repositories may be published');

function filesIn(dir) { return readdirSync(dir).flatMap(name => { const path = `${dir}/${name}`; return name.startsWith('.') || ['node_modules','artifacts'].includes(name) ? [] : statSync(path).isDirectory() ? filesIn(path) : [path]; }); }
const files = filesIn('.');
let checkedLinks = 0;
const ignoredOldFragments = [];
for (const file of files.filter(path => path.endsWith('.html'))) {
  const text = readFileSync(file, 'utf8');
  for (const match of text.matchAll(/\b(?:href|src)\s*=\s*["']([^"']*)["']/g)) {
    const link = match[1].replaceAll('&amp;', '&');
    if (!link || /^(?:https?:|mailto:|tel:|data:|javascript:|\/\/)/.test(link)) continue;
    const url = new URL(link, `https://portfolio.test/${file.replace(/^\.\//, '')}`);
    let target = resolve(root, '.' + decodeURIComponent(url.pathname));
    if (existsSync(target) && statSync(target).isDirectory()) target += '/index.html';
    assert.ok(existsSync(target), `${file} has missing target: ${link}`); checkedLinks++;
    if (url.hash && target.endsWith('.html')) {
      const fragment = decodeURIComponent(url.hash.slice(1));
      if (!fragment) continue;
      const targetText = readFileSync(target, 'utf8');
      const found = [...targetText.matchAll(/\bid=["']([^"']*)["']/g)].some(match => match[1] === fragment);
      if (!found && file.startsWith('./archiv/')) ignoredOldFragments.push(`${file}: ${link}`);
      else assert.ok(found, `${file} has broken section link: ${link}`);
    }
  }
}
const html = readFileSync('index.html','utf8');
const styles = readFileSync('styles.css','utf8');
for (const match of (html + styles).matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g)) assert.ok(existsSync(match[1]), `Missing CSS asset: ${match[1]}`);
for (const redirect of manifest.redirects) {
  const text = readFileSync(redirect.from,'utf8');
  assert.ok(text.includes('id="archive-target"'));
  assert.ok(!text.includes('http-equiv="refresh"'), 'Use redirect script to retain query and hash');
}
assert.equal((html.match(/<h1\b/g) || []).length, 1);
assert.ok(existsSync('.nojekyll'));
assert.ok(!existsSync('CNAME'));
assert.ok(!readFileSync('archiv/archive-worker.js','utf8').includes("addEventListener('fetch'"));
console.log(`PASS: all ${originalTree.length} original files archived; ${unchanged} byte-identical, exactly 3 limited link repairs.`);
console.log(`PASS: all ${snapshot.repositories.length} GitHub repositories represented, plus 4 original site projects.`);
console.log(`PASS: ${checkedLinks} local HTML links/assets, CSS assets, ${manifest.redirects.length} bookmark redirects and static hosting configuration.`);
if (ignoredOldFragments.length) console.log('Pre-existing archive fragment placeholders retained:', ignoredOldFragments.join(', '));

// Language pages must keep the same approved projects and stable deep links.
const germanHtml = readFileSync('de/index.html', 'utf8');
assert.match(html, /<html lang="en"[^>]*>/);
assert.match(germanHtml, /<html lang="de"[^>]*>/);
const projectIds = page => [...page.matchAll(/class="project-row" id="([^"]+)"/g)].map(match => match[1]);
assert.equal(projectIds(html).length, projects.length);
assert.deepEqual(projectIds(germanHtml), projectIds(html));
assert.match(html, /hreflang="de" href="https:\/\/matooo3\.github\.io\/de\/"/);
assert.match(germanHtml, /rel="canonical" href="https:\/\/matooo3\.github\.io\/de\/"/);
for (const page of [html, germanHtml]) {
  assert.match(page, /<html[^>]*data-theme="dark"/);
  assert.ok(!page.includes('class="course-repos"'));
  assert.match(page, /class="language-switcher"/);
  assert.match(page, /Agentic Engineering/);
}
console.log('PASS: English default, German page, matching project links and language metadata.');
