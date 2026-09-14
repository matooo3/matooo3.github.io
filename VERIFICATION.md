# Verification — 2026-09-15

## Build and preservation

- `npm run build` generates complete English and German pages with 18 individual projects and 10 legacy redirects.
- `npm test` verifies all 57 original files against the baseline: 54 remain byte-identical, three permit only documented path repairs.
- The repository inventory contains exactly the 14 explicitly listed project repositories. No additional repository collections are imported.
- Local links, assets, bilingual deep links, language metadata and dark defaults are checked automatically.

## Browser coverage

English is the default language; `/de/` provides German. Both pages share the same approved projects. Language selection, flags, section preservation, search/counts, mobile navigation and archive access were tested. Desktop and mobile layouts have been visually reviewed.

Dark mode is the initial theme, regardless of the operating-system preference. The moon indicates dark mode; the sun indicates light mode. An explicitly chosen theme persists across language changes and reloads. Browser coverage verifies the default, both transitions, icon visibility and localized accessible labels.

Agentic Engineering includes autonomous app development, Codex, Grok Build, Claude Code and Antigravity in app/CLI workflows, MCP, plugins, structured agent instructions and API-based AI integration.

## Archive limitations

Original placeholder links, dynamic hash routes, external services and animations are retained. The previous browser checks covered the archived timers, RepCounter, Card Manager, Gem Calculator and Connect navigation. Third-party availability is outside the preservation guarantee.

Local evidence and privacy-review notes are kept under ignored `artifacts/`, not in the public source tree.
