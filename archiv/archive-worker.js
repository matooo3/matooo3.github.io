// Archive-only, network-first: never cache or intercept the new portfolio.
// The original registration pointed to a missing /service-worker.js.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
