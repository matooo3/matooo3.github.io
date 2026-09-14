import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

// Refresh only the explicitly approved inventory. New repositories must be
// deliberately added to data/repositories.json before they can be published.
const path = 'data/repositories.json';
const approved = JSON.parse(readFileSync(path, 'utf8'));
const names = approved.repositories.map(repo => repo.name);
if (new Set(names).size !== names.length) throw new Error('Duplicate approved repository');
const repositories = names.map(name => {
  const repo = JSON.parse(execFileSync('gh', ['api', `repos/${name}`], { encoding: 'utf8' }));
  if (repo.full_name !== name) throw new Error(`Repository identity changed: ${name}`);
  return { name, private: repo.private, language: repo.language, url: repo.html_url };
});
// Write only after every approved repository was fetched successfully.
writeFileSync(path, JSON.stringify({ captured: new Date().toISOString().slice(0, 10), repositories }, null, 2) + '\n');
console.log(`Updated ${repositories.length} approved repositories; no new projects imported.`);
