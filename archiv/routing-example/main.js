// main.js
import loadHome from './pages/home.js';
import loadAbout from './pages/about.js';
import loadSettings from './pages/settings.js';

const routes = {
    home: loadHome,
    about: loadAbout,
    settings: loadSettings
};

function router() {
    const hash = window.location.hash.slice(1);
    const loadPage = routes[hash] || loadHome; // Fallback auf Home-Seite
    document.getElementById('app').innerHTML = ''; // Löscht vorherigen Inhalt
    loadPage(); // Lädt aktuelle Seite
    console.log('Page loaded:', hash || 'home');
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router); // Lädt die Standardseite beim Start

