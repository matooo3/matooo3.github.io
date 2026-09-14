# Matze — Portfolio

A responsive, bilingual English/German portfolio for GitHub Pages. Static HTML, CSS and JavaScript; no runtime dependencies, analytics, backend or external font requests.

- Portfolio (English, default): https://matooo3.github.io/
- German: https://matooo3.github.io/de/
- Original website: https://matooo3.github.io/archiv/
- Repository baseline before the redesign: `ea3393b158b1f907dabf4737e505824f8f785287`
- First migration commit: `bd9ce3c` — moves all 57 original files without content changes.

## Local development

Requires Node.js 20 or newer. No dependency installation is needed.

```sh
npm run build
npm test
npm run dev -- --port 4173
```

Open http://localhost:4173. The server serves the actual committed files and mimics static directory redirects. GitHub Pages serves the repository root on `main`; `.nojekyll` prevents Jekyll from interpreting the archived files.

## Editing

- `data/projects.mjs`: curated project names, descriptions, tags, visibility and links.
- `data/repositories.json`: explicitly approved repository inventory dated 2026-09-14. No source code or credentials from other repositories are copied here.
- `scripts/snapshot-repositories.mjs`: refreshes metadata only for the already approved inventory; it never imports additional account repositories automatically.
- `scripts/build.mjs`: generates `index.html`, legacy redirect stubs and the archive manifest. Run after changing content, and commit the generated HTML.
- `data/i18n.mjs`: English copy and the language control. The build emits complete English and German HTML, including metadata and accessible labels. The archive is preserved in its original language.
- `styles.css`: responsive layout and light/dark themes.
- `app.js`: progressive enhancements: search, category filters, project details, navigation, copy email and theme persistence. Dark mode is the default; the theme icon shows the current mode. An explicitly chosen mode persists across both languages.
- `assets/`: local fonts, licensed icons, project imagery and generated hero illustration. See `ASSETS.md`.

The project directory lists 18 projects (14 explicitly approved repositories and 4 original website experiments). Approved private projects expose their names, repository metadata and brief summaries; their source code, runtime data and credentials are not copied into this repository.

## Archive preservation

Everything from the original tracked Git tree lives under `archiv/`. The original history and archive migration are preserved. `npm test` compares every archived file against the original commit: 54 files must remain byte-identical and the remaining three permit only explicit path substitutions:

1. RepCounter's Website link now returns to the archived homepage.
2. Connect's manifest uses relative start, icon and scope paths.
3. The original service worker registration pointed at a nonexistent root file. It now registers the new `archiv/archive-worker.js` relative to the registration script. That worker only controls the archive, intercepts no requests and caches nothing.

The 10 old non-home HTML routes have small redirect stubs. They preserve query parameters and fragments, including hash routing. The 404 page also resolves exact known old file paths. Unknown paths remain 404s. `/` is intentionally the new portfolio; `/archiv/` is the original homepage.

Original placeholder links and externally hosted services are retained inside the archive. Their external availability cannot be restored by moving this repository. In particular, the old `#fun` link points to the navigation itself rather than a dedicated content section, and some historical meal-planning/demo servers were unavailable during the redesign. No new main-portfolio live-demo claim is made for those services.

## Verification

`npm test` checks preservation, allowed repairs, repository coverage, every local HTML reference, CSS asset references, and legacy redirect coverage. Browser checks and known external limitations are recorded in `VERIFICATION.md`.

To recover the exact original version, check out the baseline commit in a separate worktree. The archive-only commit also preserves the original contents without any path repairs. Do not overwrite `archiv/` when updating the new portfolio.
