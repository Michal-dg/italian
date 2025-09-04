// service-worker.js

// Krok 1: Definiujemy nazwę i wersję naszej pamięci podręcznej (cache)
// ❗️ ZMIENIAJ TĘ WERSJĘ PRZY KAŻDYM NOWYM WDROŻENIU (v2, v3, itd.) ❗️
const CACHE_NAME = 'parola-chiave-cache-v1';

// Pliki, które stanowią rdzeń naszej aplikacji i muszą być dostępne offline
const URLS_TO_CACHE = [
    '/',
    '/index.html',
    // Możesz tu dodać ścieżki do głównych plików CSS i JS, jeśli chcesz
    // np. '/js/main.js', '/style.css'
];

// Krok 2: Instalacja Service Workera
// Ten kod uruchamia się tylko raz, gdy nowa wersja Service Workera jest instalowana.
self.addEventListener('install', (event) => {
    console.log('Service Worker: Instalacja nowej wersji...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Cache otwarty. Zapisywanie podstawowych plików.');
                return cache.addAll(URLS_TO_CACHE);
            })
    );
    self.skipWaiting(); // Zmusza nowego Service Workera do natychmiastowej aktywacji
});

// Krok 3: Aktywacja Service Workera
// Ten kod uruchamia się, gdy nowy Service Worker przejmuje kontrolę.
// Jego zadaniem jest usunięcie STARYCH wersji cache.
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Aktywacja.');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Jeśli nazwa cache'u nie pasuje do naszej nowej wersji, usuwamy go.
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Usuwanie starego cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});


// Krok 4: Przechwytywanie zapytań sieciowych (Fetch)
// To jest serce naszego Service Workera. Decyduje, czy podać plik z sieci, czy z cache.
self.addEventListener('fetch', (event) => {
    // Stosujemy strategię "Network Falling Back to Cache" (Najpierw sieć, potem cache)
    // To zapewnia, że użytkownik zawsze dostaje najnowszą wersję, jeśli jest online.
    event.respondWith(
        fetch(event.request)
            .catch(() => {
                // Jeśli połączenie sieciowe zawiedzie (użytkownik jest offline),
                // próbujemy znaleźć odpowiedź w naszej pamięci podręcznej.
                console.log('Service Worker: Brak sieci, szukanie w cache dla:', event.request.url);
                return caches.match(event.request);
            })
    );
});