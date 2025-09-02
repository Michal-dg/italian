// Plik: service-worker.js

// Nazwa naszej pamięci podręcznej (cache). Zmieniamy ją, gdy aktualizujemy pliki.
const CACHE_NAME = 'parola-chiave-cache-v1';

// Lista plików, które chcemy zapisać w pamięci podręcznej, aby aplikacja działała offline.
const urlsToCache = [
  '/', // Reprezentuje główny plik index.html
  'index.html',
  'slowka_baza_it.js',
  'stories_baza.js',
  'images/default-header.jpg',
  'images/default-card-bg.jpg',
  // WAŻNE: Jeśli w przyszłości dodasz pliki style.css lub app.js, również je tu dopisz!
];

// Zdarzenie 'install' - wywoływane, gdy Service Worker jest instalowany po raz pierwszy.
self.addEventListener('install', event => {
  // Czekamy, aż wszystkie pliki zostaną pobrane i zapisane w pamięci podręcznej.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Otwarto pamięć podręczną i dodano pliki podstawowe.');
        return cache.addAll(urlsToCache);
      })
  );
});

// Zdarzenie 'fetch' - wywoływane za każdym razem, gdy aplikacja próbuje pobrać jakiś zasób (plik, obrazek).
self.addEventListener('fetch', event => {
  event.respondWith(
    // Sprawdzamy, czy żądany zasób jest już w naszej pamięci podręcznej.
    caches.match(event.request)
      .then(response => {
        // Jeśli tak, zwracamy go natychmiast z pamięci podręcznej.
        if (response) {
          return response;
        }
        // Jeśli nie, próbujemy pobrać go normalnie z sieci.
        return fetch(event.request);
      })
  );
});