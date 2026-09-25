// Expands already approved portfolio summaries; no private paths or invented metrics.
export const caseStudies = {
  'matooo3/hockey-env': {
    de: [
      ['Aufgabe', 'Einen Agenten für eine vorgegebene Hockey-Umgebung trainieren, der gegen andere Teams antreten kann.'],
      ['Mein Beitrag im Team', 'Soft Actor-Critic, Training gegen einen Pool verschiedener Gegner und Benchmarks zum Vergleich der Modelle.'],
      ['Technischer Ansatz', 'Die Spielstrategie wird durch Reinforcement Learning gelernt; verschiedene Trainingsgegner ermöglichen den Vergleich unter unterschiedlichen Bedingungen.'],
      ['Ergebnis', 'Der trainierte Agent nahm an der abschließenden Competition gegen die Agenten anderer Teams teil.']
    ],
    en: [
      ['Challenge', 'Train an agent for an existing hockey environment to compete against other teams.'],
      ['My contribution to the team', 'Soft Actor-Critic, training against a pool of opponents and benchmarks to compare models.'],
      ['Technical approach', 'The agent learns its strategy through reinforcement learning; different training opponents allow comparisons under different conditions.'],
      ['Outcome', 'The trained agent participated in the final competition against agents from other teams.']
    ]
  },
  'eifelnex/Hands-On-3D-Vision': {
    de: [
      ['Aufgabe', 'Aus mehreren kalibrierten Kamerabildern eine 3D-Szene rekonstruieren und neue Blickwinkel darstellen.'],
      ['Teamprojekt', 'Wir entwickelten eine Pipeline, die Bildmerkmale mehrerer Kameras zusammenführt und eine 3D-Darstellung vorhersagt.'],
      ['Technischer Ansatz', 'Ein neuronales Modell erzeugt eine Darstellung mit 3D Gaussian Splatting. Modelltraining und Rendering gehören zur selben Pipeline.'],
      ['Ergebnis', 'Rekonstruierte Szenen lassen sich aus neuen Ansichten rendern. Die Rekonstruktionsqualität wurde im Projekt bewertet.']
    ],
    en: [
      ['Challenge', 'Reconstruct a 3D scene from multiple calibrated camera images and render new viewpoints.'],
      ['Team project', 'We developed a pipeline that combines features from multiple cameras to predict a 3D representation.'],
      ['Technical approach', 'A neural model produces a representation using 3D Gaussian Splatting. Model training and rendering are part of the same pipeline.'],
      ['Outcome', 'Reconstructed scenes can be rendered from new viewpoints. Reconstruction quality was evaluated in the project.']
    ]
  },
  'matooo3/zero-shot-cxr-vlm': {
    de: [
      ['Aufgabe', 'Untersuchen, wie Vision-Language-Modelle mehrere Befunde auf Thorax-Röntgenbildern ohne aufgabenspezifisches Training erkennen.'],
      ['Forschungsprojekt', 'Wir verglichen BioMedCLIP und MedCLIP sowie unterschiedliche Prompt-Strategien auf mehreren Datensätzen.'],
      ['Technischer Ansatz', 'Positive und negative Prompts, LLM-generierte Beschreibungen und kombinierte Strategien werden über Bild-Text-Ähnlichkeiten ausgewertet.'],
      ['Erkenntnis', 'Der Nutzen einer Prompt-Strategie hängt stark von Modell und Datensatz ab. Die Darstellung beschreibt einen Forschungsvergleich, kein klinisches Produkt.']
    ],
    en: [
      ['Challenge', 'Explore how vision-language models identify multiple findings in chest X-rays without task-specific training.'],
      ['Research project', 'We compared BioMedCLIP and MedCLIP and different prompting strategies across multiple datasets.'],
      ['Technical approach', 'Positive and negative prompts, LLM-generated descriptions and composed strategies are evaluated through image-text similarity.'],
      ['Finding', 'The benefit of a prompting strategy strongly depends on the model and dataset. This is a research comparison, not a clinical product.']
    ]
  }
};
