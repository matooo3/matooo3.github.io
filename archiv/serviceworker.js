if ('serviceWorker' in navigator) {
    const workerUrl = new URL('./archive-worker.js', document.currentScript.src);
    window.addEventListener('load', function() {
      navigator.serviceWorker.register(workerUrl, { scope: new URL('./', workerUrl).pathname }).then(function(registration) {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }, function(err) {
        console.error('ServiceWorker registration failed: ', err);
      });
    });
  }