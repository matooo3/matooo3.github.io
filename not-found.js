// Only redirect known, exact legacy paths. Unknown paths remain a useful 404.
fetch('/data/archive-manifest.json').then(response => response.ok ? response.json() : null).then(manifest => {
  let path;
  try { path = decodeURIComponent(location.pathname).replace(/^\//, ''); } catch { return; }
  if (manifest?.originalFiles.includes(path) && path !== 'index.html') {
    const target = new URL(`/archiv/${path}`, location.origin);
    target.search = location.search;
    target.hash = location.hash;
    location.replace(target.href);
  }
}).catch(() => {});
