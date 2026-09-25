import { projects } from './projects.mjs';
import { caseStudies } from './case-studies.mjs';

// German is the editorial source. Both complete HTML pages are generated at
// build time, so language selection and all content also work without JS.
export const projectTranslations = {
  'MyLifeGraph/MyLifeGraph': { description: 'A personal companion for planning, habits and focus. Daily check-ins meet a clear view of everyday life.', detail: 'A mobile-first coaching app built with Flutter, FastAPI and Supabase. Guest mode makes it possible to explore without an account; planning and guidance are based on explicit user input.' },
  'matooo3/Pencil2Pixel': { description: 'From a first sketch to an AI-generated image. A drawing canvas meets prompts, visual styles and creative experiments.', detail: 'Draw in the browser, add a prompt and generate images through a Python backend. The project includes brushes, an eraser, undo/redo and adjustable generation parameters.' },
  'matooo3/NutriPilot': { description: 'Personal weekly meal plans, matching shopping lists and upcoming meals at a glance. Also known as V&M Fuel.', detail: 'A nutrition project built around personal preferences, weekly planning and shopping lists. The original V&M Fuel project website remains available in the archive.' },
  'matooo3/yapp-ai': { description: 'Speak instead of typing: native voice input for Windows and Android, with separate meeting recording and transcription.', detail: 'A native application in development, featuring a microphone overlay, dictation history and configurable speech providers. Device validation is still part of ongoing development.' },
  'BeMaMaJa-Search-Engine/BeMaMaJa-Search-Engine': { description: 'A search engine for websites about Tübingen: crawling, indexing and ranking in a collaborative university project.', detail: 'Created in the Modern Search Engines course. A pipeline turns websites into a searchable index and presents results through a Streamlit interface.' },
  'matooo3/RepCounter': { description: 'Count repetitions, track workout time and stay focused on your set. One of my first web and Android projects.' },
  "matooo3/zero-shot-cxr-vlm": {"name": "Zero-Shot Chest X-Ray", "description": "Which findings can vision-language models identify without task-specific training? Comparing BioMedCLIP and MedCLIP with different prompting strategies on chest X-rays.", "detail": "A research project on zero-shot multi-label classification with BioMedCLIP and MedCLIP across CheXpert, NIH ChestX-ray14 and PadChest. We compared positive and negative prompts, LLM-generated descriptions and composed strategies. Evaluation shows that the benefit of a prompt strategy strongly depends on the model and dataset."},
  "matooo3/codex-ui": {"description": "A dedicated interface for agentic development: projects, chats and multiple coding agents in one place.", "detail": "A personal web app for orchestrating coding agents, managing projects and chats, and voice input. The visual preview is an illustrative demo with sample content."},
  'matooo3/card-manager': { description: 'Keep images of fitness, bank and QR cards in custom categories, ready to access on your phone. Stored locally in your browser.' },
  'matooo3/Gem-calculator-coc-': { description: 'Compare magic items: which purchase saves the most time per gem spent?' },
  "zaryar/AquaDefender": {"description": "Survive waves of pirates on an island, collect loot and upgrade your equipment. The goal: build a ship and escape."},
  "matooo3/hockey-env": {"name": "Hockey RL Agents", "description": "Developing and training reinforcement learning agents to face other agents in a provided hockey environment. The project concluded with a competition between teams.", "detail": "My contribution to the team: a Soft Actor-Critic (SAC) agent, training against a pool of different opponents and benchmarks to compare models. The trained agent competed against other teams’ agents in the final competition."},
  "eifelnex/Hands-On-3D-Vision": {"name": "3D Reconstruction with Gaussian Splatting", "description": "A team project reconstructing 3D scenes from multiple calibrated camera images. A neural model produces a 3D Gaussian representation that can be rendered from new viewpoints.", "detail": "For the project, we developed a pipeline that fuses image features from multiple cameras to predict a metric 3D representation of objects and their surroundings. The work covered model training, novel-view rendering and evaluation of reconstruction quality."},
  'matooo3/matooo3.github.io': { name: 'This Portfolio', description: 'My projects, interests and progress in one place. The original website lives on in the archive.' },
  'Eieruhr': { name: 'Egg Timer', description: 'A simple five-minute timer. A small experiment from the first version of my portfolio.' },
  'Connect App': { description: 'Open RepCounter, Gem Calculator, Card Manager and Egg Timer from one shared interface.' },
  'Routing Template': { description: 'A small example of modular routing with home, about and settings pages.' },
  'Campfire Startpage': { description: 'An early start-page concept with a campfire video from my original repository.' },
};

const translations = new Map(Object.entries({
  "PROJEKTGALERIE": "PROJECT GALLERY",
  "Galerie öffnen": "Open gallery",
  "Projektgalerie": "Project gallery",
  "Alle Ideen. Ein Überblick.": "Every idea. One view.",
  "Apps, Forschung und kleine Experimente — alle Projekte als visuelle Sammlung.": "Apps, research and small experiments — every project in one visual collection.",
  "Zur Startseite": "Back to home",
  "Zur Projektliste": "View project list",
  "Mehr zum Projekt": "More about this project",
  "Kleine Karten. Große Ordnung.": "Your cards. In one place.",
  "Ideen sammeln.": "Collect ideas.",
  "Favoriten": "Favourites",
  "Mehr Zeit pro Gem.": "More time per gem.",
  "Zeitersparnis": "Time saved",
  "Vergleichen. Besser entscheiden.": "Compare. Choose wisely.",
  "Ideen bekommen ein Zuhause.": "A home for your ideas.",
  "wird Wirklichkeit.": "become reality.",
  "Fünf Minuten. Ganz einfach.": "Five minutes. Just that.",
  "Zeit für eine Pause.": "Time for a break.",
  "Ein Klick. Ein neuer Weg.": "One click. A new path.",
  "Ein ruhiger Start.": "A calmer start.",
  "Card Manager: Beispielansicht für lokal gespeicherte Fitness-, Bank- und QR-Karten": "Card Manager: sample fitness, bank and QR cards stored on the device",
  "Fitnesskarte": "Fitness card",
  "Meine Projekte ↗": "My projects ↗",
  "Auf diesem Gerät gespeichert": "Saved on this device",
  "Gem Calculator: Vergleich von Zeitersparnis und Gem-Einsatz": "Gem Calculator: comparing time saved per gem spent",
  "Portfolio: Miniatur einer persönlichen Projektwebsite": "Portfolio: miniature personal project website",
  "Eieruhr: Illustration eines Fünf-Minuten-Timers": "Egg Timer: an illustration of a five-minute timer",
  "Routing Template: Illustration der Navigation zwischen drei Seiten": "Routing Template: navigation between three pages",
  "Campfire Startpage: Illustration eines Lagerfeuers bei Nacht": "Campfire Startpage: a campfire at night",
  "Projektgalerie — Matze": "Project gallery — Matze",

  "Deine Woche. Gut versorgt.": "Your week. Well nourished.",
  "Wochenplan": "Weekly plan",
  "Mo": "Mon",
  "Di": "Tue",
  "Mi": "Wed",
  "Do": "Thu",
  "Fr": "Fri",
  "Sa": "Sat",
  "So": "Sun",
  "MITTAGESSEN": "LUNCH",
  "Bunte Gemüse-Bowl": "Colourful veggie bowl",
  "Frisch geplant. Einfach gekocht.": "Freshly planned. Simply cooked.",
  "Abendessen": "Dinner",
  "Einkaufsliste": "Shopping list",
  "Gemüse": "Vegetables",
  "Reis": "Rice",
  "Gesagt. Geschrieben.": "Speak it. Keep it.",
  "TRANSKRIPTION": "TRANSCRIPTION",
  "Eine neue Idee festhalten.": "Capture a new idea.",
  "Den Gedanken zu Ende sprechen.": "Give the thought room to grow.",
  "NutriPilot: gestaltete Demo mit Wochenplan, Mahlzeiten und Einkaufsliste": "NutriPilot: illustrative demo with weekly meal planning and a shopping list",
  "Yapp AI: gestaltete Demo mit Mikrofon, Audiowellen und transkribiertem Text": "Yapp AI: illustrative demo with a microphone, audio waveform and transcribed text",

  "Mehr anzeigen": "Show more",
  "Weniger anzeigen": "Show less",
  "8 weitere Projekte": "8 more projects",
  "Spiel ansehen": "View game",
  "Projekte. Agenten. Fortschritt.": "Projects. Agents. Progress.",
  "Eine Idee wird zur App.": "An idea becomes an app.",
  "Baue eine hilfreiche App.": "Build a useful app.",
  "Projekt verstehen": "Understand the project",
  "Änderungen umsetzen": "Implement changes",
  "Ergebnis prüfen": "Review the result",
  "Demo mit Beispieldaten": "Demo with sample content",
  "Deine Stadt. Durchsuchbar.": "Your city. Searchable.",
  "Originale Projektoberfläche": "Original project interface",
  "Ein Satz. Voller Fokus.": "One set. Full focus.",
  "Originale App · lokal im Browser": "Original app · in your browser",
  "Bild trifft Sprache.": "Image meets language.",
  "Bild": "Image",
  "Text-Prompts": "Text prompts",
  "Gemeinsamer Merkmalsraum": "Shared embedding space",
  "Mehrere Befunde": "Multiple findings",
  "Forschung · Modell- und Prompt-Vergleich": "Research · model and prompt comparison",
  "Lernen. Spielen. Antreten.": "Learn. Play. Compete.",
  "Agent gegen Agent": "Agent vs. agent",
  "Training → Benchmark → Competition": "Training → Benchmark → Competition",
  "Viele Ansichten. Eine Szene.": "Many views. One scene.",
  "Kameras → 3D-Gaussians → neue Ansichten": "Cameras → 3D Gaussians → new views",
  "Konzeptvisualisierung": "Concept illustration",
  "Eine Insel. Ein Ausweg.": "One island. One way out.",
  "Sammeln · Bauen · Entkommen": "Collect · Build · Escape",
  "Deine Tools. Ein Zuhause.": "Your tools. One home.",
  "Vier kleine Apps, verbunden.": "Four small apps, connected.",
  "Codex UI: gestaltete Demo mit Projektnavigation und beispielhaftem Agentenablauf": "Codex UI: illustrative demo with project navigation and a sample agent workflow",
  "Originale Oberfläche der Tübingen Search Engine": "Original Tübingen Search Engine interface",
  "RepCounter: ursprüngliche App zum Zählen von Wiederholungen": "RepCounter: original repetition counter app",
  "Schema des Vergleichs von Bild- und Textmerkmalen": "Diagram comparing image and text features",
  "Illustration zweier Agenten auf einem Hockey-Spielfeld": "Illustration of two agents on a hockey rink",
  "Abstrakte Punktwolke als Illustration einer 3D-Rekonstruktion": "Abstract point cloud illustrating 3D reconstruction",
  "AquaDefender: originale Projektgrafik": "AquaDefender: original project artwork",
  "Connect: ursprüngliche App-Übersicht": "Connect: original app overview",

  'Matze — Software, KI & gute Ideen.': 'Matze — Software, AI & good ideas.',
  'Ich bin Matze. Ich entwickle Apps, erkunde künstliche Intelligenz und mache aus Neugier eigene Projekte. Entdecke mein Portfolio und die ursprüngliche Website im Archiv.': 'I’m Matze. I build apps, explore artificial intelligence and turn curiosity into projects. Explore my portfolio and the original website in the archive.',
  'Apps, KI-Experimente und Projekte aus echter Neugier. Das Portfolio von Matze.': 'Apps, AI experiments and projects driven by curiosity. A portfolio by Matze.',
  'de_DE': 'en_GB',
  'Zum Inhalt springen': 'Skip to content',
  'Matze – Startseite': 'Matze – Home',
  'Hauptnavigation': 'Main navigation',
  'Projekte': 'Projects', 'Über mich': 'About', 'Kontakt': 'Contact',
  'Archiv': 'Archive', 'Dunkles Design aktivieren': 'Switch to dark mode', 'Menü öffnen': 'Open menu',
  'NEUGIER ALS ANTRIEB': 'DRIVEN BY CURIOSITY', 'Tübingen, Deutschland': 'Tübingen, Germany',
  'Hi, ich bin Matze.': 'Hi, I’m Matze.', 'Aus Ideen': 'Turning ideas', 'wird': 'into', 'Wirklichkeit.': 'reality.',
  'Ich entwickle Apps, erkunde künstliche Intelligenz und baue Dinge, die meinen Alltag besser machen.': 'I build apps, explore artificial intelligence and create things that make everyday life better.',
  'Meine Projekte': 'Explore my projects',
  'Orangefarbene, verschlungene Skulptur als Sinnbild für Ideen, die sich verbinden': 'An intertwined orange sculpture representing ideas coming together',
  'NEUGIER VERBINDET.': 'CURIOSITY CONNECTS.', 'Informatik im Kopf.': 'Computer science on my mind.', 'Bewegung im Alltag.': 'Movement in everyday life.',
  'AUSGEWÄHLTE ARBEITEN': 'SELECTED WORK', 'Gebaut aus Neugier': 'Built from curiosity',
  'Vom ersten kleinen Tool bis zur KI-App.': 'From a first small tool to an AI app.', 'Ein Einblick in das, woran ich arbeite.': 'A glimpse of what I’m working on.',
  'KI & Forschung': 'AI & Research', 'Studium': 'Learning',
  'MyLifeGraph: Vorschau des hellen Designsystems mit Planungselementen und Statusanzeigen': 'MyLifeGraph: a preview of the light design system with planning elements and status indicators',
  'Flutter · Persönliche Tagesplanung': 'Flutter · Personal daily planning',
  'Pencil2Pixel: Ein aus einer Skizze generiertes pinkes Flugzeug in einer Wolkenlandschaft': 'Pencil2Pixel: a pink aircraft in the clouds, generated from a sketch',
  'Die ursprüngliche handgezeichnete Flugzeugskizze': 'The original hand-drawn aircraft sketch',
  'Alles beginnt mit einer Skizze.': 'It starts with a sketch.', 'Skizze → Bild': 'Sketch → Image', 'Skizze + Prompt → Bild': 'Sketch + Prompt → Image',
  'Weniger planen.': 'Less planning.', 'Bewusster essen.': 'More mindful meals.', '& Einkaufslisten': '& shopping lists',
  'Ein Gedanke.': 'A thought.', 'Einfach gesagt.': 'Simply spoken.', 'Sprache wird Text': 'Speech becomes text',
  'Projekt öffnen': 'Open project', 'Projektwebsite': 'Project website', 'App öffnen': 'Open app',
  'Rechner öffnen': 'Open calculator', 'Timer öffnen': 'Open timer', 'Demo öffnen': 'Open demo', 'Entwurf öffnen': 'Open concept',
  'Alte Version öffnen': 'Open original version', 'Android-Download': 'Android download', 'Privater Code': 'Private source', 'Privat': 'Private',
  'Alle Projekte entdecken': 'Explore all projects', 'DER MENSCH DAHINTER': 'THE PERSON BEHIND THE CODE',
  'Mehr als': 'More than', 'nur Code': 'just code',
  'Mich interessiert, wie Dinge funktionieren. Und wie man sie ein bisschen besser machen kann.': 'I’m curious about how things work. And how to make them a little better.',
  'Ich studiere Informatik in Tübingen. In meinen Projekten treffen Softwareentwicklung, künstliche Intelligenz und praktische Ideen aufeinander – vom Trainingstool bis zum persönlichen Alltagsbegleiter.': 'I study computer science in Tübingen. My projects bring together software development, artificial intelligence and practical ideas — from workout tools to personal everyday companions.',
  'Abseits des Bildschirms gehören Calisthenics, Fitness und Ernährung zu meinem Alltag. Mein Hintergrund im Rettungsdienst bringt eine weitere Perspektive mit: Technik ist dann spannend, wenn sie Menschen hilft.': 'Away from the screen, calisthenics, fitness and nutrition are part of my everyday life. My background as a paramedic adds another perspective: technology matters when it helps people.',
  'Verstehen & bauen': 'Understand & build', 'Ideen ausprobieren und durch eigene Projekte lernen.': 'Try out ideas and learn by building projects.',
  'Dranbleiben': 'Keep going', 'Im Training genauso wie an der nächsten Herausforderung.': 'In training and when tackling the next challenge.',
  'MEIN WERKZEUGKASTEN': 'MY TOOLKIT', 'Was ich mitbringe': 'What I bring',
  'Technologien, mit denen ich in meinen': 'Technologies I work with in my', 'eigenen und gemeinsamen Projekten arbeite.': 'personal and collaborative projects.',
  'Web & Apps': 'Web & Apps', 'Von der Browser-Idee zur mobilen Anwendung.': 'From a browser-based idea to a mobile application.',
  'KI & Daten': 'AI & Data', 'Modelle verstehen, ausprobieren und in Projekte bringen.': 'Understand models, experiment and put them to work in projects.',
  'Backend & Tools': 'Backend & Tools', 'Das Fundament hinter funktionierender Software.': 'The foundation behind working software.',
  'Konzeption und Steuerung autonomer Entwicklungsabläufe und integrierter Apps mit Codex, Grok Build, Claude Code (App und CLI) und Antigravity (App und CLI). Schwerpunkte sind Kontextmanagement, strukturierte Agent-Anweisungen, MCP, Plugins und die Integration von KI-Funktionen über APIs.': 'Designing and orchestrating autonomous development workflows and integrated apps with Codex, Grok Build, Claude Code (app and CLI) and Antigravity (app and CLI). Strong focus on context management, structured agent instructions, MCP, plugins and API-based AI integration.',
  'Open-Source-LLMs und Speech-to-Text-Modelle auswählen, erproben und in eigene Anwendungen integrieren.': 'Selecting, exploring and integrating open-source LLMs and speech-to-text models into applications.',
  'Open-Source-LLMs': 'Open-source LLMs', 'Speech-to-Text-Modelle': 'Speech-to-text models',
  'Linux, Server & Netzwerke': 'Linux, Servers & Networks',
  'Linux- und Server-Umgebungen einrichten, virtuelle Maschinen verwalten und Dienste vernetzen. Praktische Erfahrung mit Debian, Ubuntu und Proxmox sowie Grundlagen in Subnetzen, Firewall-Regeln und VPNs.': 'Setting up Linux servers, managing virtual machines and connecting services. Practical experience with Debian, Ubuntu and Proxmox, alongside foundations in subnets, firewall rules and VPNs.',
  'Virtuelle Maschinen': 'Virtual machines', 'Subnetze': 'Subnets',
  'API- & KI-Integration': 'API & AI integration',
  'Dunkler Modus aktiv. Zum hellen Modus wechseln': 'Dark mode active. Switch to light mode',
  'Autonome Workflows': 'Autonomous workflows', 'Kontextmanagement': 'Context management',
  'PROJEKTVERZEICHNIS': 'PROJECT DIRECTORY', 'Die ganze Sammlung': 'The collection',
  'Apps, Experimente und erste Schritte.': 'Apps, experiments and first steps.', 'Jedes Projekt ist ein Stück Lernkurve.': 'Every project is part of the learning curve.',
  'Projekte nach Kategorie filtern': 'Filter projects by category', 'Alle': 'All',
  'Projekte durchsuchen': 'Search projects', 'Projekt oder Technologie': 'Project or technology', 'PROJEKT / NAME': 'PROJECT / NAME',
  'Hier ist noch Platz für eine neue Idee.': 'Room for a new idea.', 'Für diese Suche wurde kein Projekt gefunden.': 'No projects match your search.', 'Alle Projekte anzeigen': 'Show all projects',
  'DIE ERSTE VERSION BLEIBT.': 'THE FIRST VERSION LIVES ON.', 'Jede Entwicklung hat einen Anfang.': 'Every journey has a beginning.',
  'Meine ursprüngliche Website, alle kleinen Apps und die komplette alte Sammlung.': 'My original website, the small apps and the complete original collection.',
  'Archiv · Alte Version': 'Archive · Original version', 'LASS UNS REDEN': 'LET’S TALK',
  'Von einer Idee zum nächsten Projekt.': 'From an idea to the next project.', 'Gute Ideen beginnen': 'Good ideas start', 'mit einem': 'with a', 'Hallo.': 'hello.',
  'E-Mail-Adresse kopieren': 'Copy email address', 'Zurück nach oben': 'Back to top', 'Mit Neugier gebaut. ©': 'Built with curiosity. ©', 'Nach oben': 'Back to top',
  'Mini-Projekt': 'Mini project',
}));

for (const study of Object.values(caseStudies)) {
  study.de.forEach((pair, i) => pair.forEach((text, j) => translations.set(text, study.en[i][j])));
}
for (const [de, en] of Object.entries({
  'Projekt im Fokus': 'Project in focus',
  'Dein Tag. Mit mehr Klarheit.': 'Your day. With more clarity.',
  'Heute im Fokus': 'Today’s focus', 'Geplante Schritte': 'Planned steps',
  'Zeit für Bewegung': 'Time to move', 'Konzentriert arbeiten': 'Focused work', 'Den Tag reflektieren': 'Reflect on the day',
  'Konzeptansicht · Beispieldaten': 'Concept view · Sample data',
  'MyLifeGraph: Konzeptillustration einer Tagesplanung mit Beispieldaten': 'MyLifeGraph: concept illustration of daily planning with sample data'
})) translations.set(de, en);
for (const project of projects) {
  const english = projectTranslations[project.repo || project.name];
  if (!english) throw new Error(`Missing English project: ${project.name}`);
  for (const field of ['name', 'description', 'detail']) {
    if (project[field] && english[field]) translations.set(project[field], english[field]);
    if (field !== 'name' && project[field] && !english[field]) throw new Error(`Missing English ${field}: ${project.name}`);
  }
}

const decode = value => value.replace(/&(amp|quot|#39|lt|gt);/g, (_, name) => ({ amp: '&', quot: '"', '#39': "'", lt: '<', gt: '>' })[name]);
const escape = value => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

function translate(value) {
  const text = decode(value.trim());
  let result = translations.get(text);
  if (result === undefined) {
    const section = text.match(/^(\d{2} \/ )(.+)$/);
    const detail = text.match(/^(Mehr über|Details zu) (.+)$/);
    const count = text.match(/^(\d+) Projekte$/);
    if (section) result = section[1] + (translations.get(section[2]) || section[2]);
    else if (detail) result = (detail[1] === 'Mehr über' ? 'More about ' : 'Details about ') + (translations.get(detail[2]) || detail[2]);
    else if (count) result = `${count[1]} projects`;
  }
  return result === undefined ? value : value.replace(value.trim(), escape(result));
}

export function englishHtml(html) {
  return html.replace(/<[^>]+>|[^<]+/g, token => token.startsWith('<')
    ? token.replace(/\b(alt|title|aria-label|placeholder|content)="([^"]*)"/g, (_, key, value) => `${key}="${translate(value)}"`)
    : translate(token)).replace('<html lang="de"', '<html lang="en"');
}

const flag = lang => lang === 'de'
  ? '<svg class="language-flag" viewBox="0 0 30 20" aria-hidden="true"><path fill="#151515" d="M0 0h30v7H0z"/><path fill="#d62828" d="M0 7h30v6H0z"/><path fill="#ffce32" d="M0 13h30v7H0z"/></svg>'
  : '<svg class="language-flag" viewBox="0 0 30 20" aria-hidden="true"><path fill="#17356d" d="M0 0h30v20H0z"/><path stroke="#fff" stroke-width="5" d="m0 0 30 20M30 0 0 20"/><path stroke="#cf2838" stroke-width="2" d="m0 0 30 20M30 0 0 20"/><path stroke="#fff" stroke-width="7" d="M15 0v20M0 10h30"/><path stroke="#cf2838" stroke-width="4" d="M15 0v20M0 10h30"/></svg>';

export function languageSwitcher(lang) {
  const label = lang === 'en' ? 'Select language. Current language: English' : 'Sprache wählen. Aktuelle Sprache: Deutsch';
  return `<details class="language-switcher"><summary aria-label="${label}" title="${label}">${flag(lang)}<span>${lang.toUpperCase()}</span></summary><div class="language-options"><a href="/" lang="en" hreflang="en"${lang === 'en' ? ' aria-current="page"' : ''}>${flag('en')} English</a><a href="/de/" lang="de" hreflang="de"${lang === 'de' ? ' aria-current="page"' : ''}>${flag('de')} Deutsch</a></div></details>`;
}
