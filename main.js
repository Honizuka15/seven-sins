// Point d'entrée : polices embarquées (fonctionne hors connexion), styles, application, installation web
import '@fontsource/cinzel/500.css';
import '@fontsource/cinzel/700.css';
import '@fontsource/cinzel/900.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import './style.css';
import './app.js';
import { Capacitor } from '@capacitor/core';

// Version web : service worker pour l'installation sur l'écran d'accueil et l'usage hors connexion
if (!Capacitor.isNativePlatform() && 'serviceWorker' in navigator && location.protocol === 'https:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
