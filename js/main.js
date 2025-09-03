// js/main.js
import { state, setDb, setActiveDeckId, setGlobalFlashcardBg } from './state.js';
import { openDB, getAppData, setAppData, getTransaction } from './database.js';
import { elements } from './ui/domElements.js';
import { initAuth } from './ui/auth.js';
import { initModals } from './ui/modals.js';
import { initDecks } from './ui/decks.js';
import { initCards, startSession } from './ui/cards.js';
import { initStories } from './ui/stories.js';
import { initStats } from './ui/stats.js';
import { initReview } from './ui/review.js';
import { ensureSpeechReady } from './api/tts.js';

async function initializeApp() {
    try {
        const db = await openDB();
        setDb(db);

        // Sprawdź, czy to pierwsze uruchomienie
        const decksStore = getTransaction(db, 'decks');
        const decks = await new Promise(res => decksStore.getAll().onsuccess = e => res(e.target.result));

        let currentDeckId;

        if (decks.length === 0) {
            console.log("Pierwsze uruchomienie. Inicjalizacja domyślnej talii i słówek.");
            const transaction = db.transaction(['decks', 'words'], 'readwrite');
            const deckStore = transaction.objectStore('decks');
            const wordStore = transaction.objectStore('words');

            const addRequest = deckStore.add({ name: 'Podstawowe słówka' });
            currentDeckId = await new Promise(res => addRequest.onsuccess = e => res(e.target.result));

            if (typeof initialWordList !== 'undefined') {
                initialWordList.forEach(word => {
                    const wordData = { ...word, deckId: currentDeckId, interval: 0, nextReview: new Date().toISOString(), easeFactor: 2.5, isLearning: false, learnedDate: null };
                    delete wordData.id;
                    wordStore.add(wordData);
                });
            }
             await new Promise(res => transaction.oncomplete = res);
        } else {
            currentDeckId = await getAppData(db, 'activeDeckId');
            const deckExists = decks.some(d => d.id === currentDeckId);
            if (!currentDeckId || !deckExists) {
                currentDeckId = decks[0].id;
            }
        }

        // Załaduj ustawienia użytkownika
        const savedHeader = await getAppData(db, 'headerImage');
        if (savedHeader) elements.headerImage.src = savedHeader;

        const savedGlobalBg = await getAppData(db, 'globalFlashcardBg');
        if (savedGlobalBg) {
            setGlobalFlashcardBg(savedGlobalBg);
            elements.cardFrontBg.src = savedGlobalBg;
        }

        // Inicjalizuj wszystkie moduły UI
        initModals();
        initAuth();
        initCards();
        initDecks();
        initStories();
        initStats();
        initReview();

        // Przygotuj syntezator mowy i wystartuj sesję
        ensureSpeechReady(() => {
            elements.loadingState.classList.add('hidden');
            setActiveDeckId(currentDeckId);
            // Wywołujemy startSession z modułu Decks, który zaktualizuje UI i rozpocznie naukę
            import('./ui/decks.js').then(module => {
                module.setActiveDeck(currentDeckId, true); // `true` by nie zamykać modala
            });
        });

    } catch (error) {
        console.error("Nie udało się zainicjalizować aplikacji:", error);
        elements.loadingState.innerHTML = '<p class="text-red-500 font-bold">Wystąpił krytyczny błąd podczas ładowania aplikacji. Spróbuj odświeżyć stronę.</p>';
    }
}

// Uruchamiamy aplikację po załadowaniu całej strony
document.addEventListener('DOMContentLoaded', initializeApp);