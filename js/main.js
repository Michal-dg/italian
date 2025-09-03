// js/main.js

// Krok 1: Importujemy wszystkie potrzebne moduły i funkcje z całej aplikacji
import { setDb, setActiveDeckId, setGlobalFlashcardBg } from './state.js';
import { openDB, getAppData, getTransaction } from './database.js';
import { elements } from './ui/domElements.js';
import { initAuth, handlePasswordUpdate } from './ui/auth.js';
import { initModals, openModal } from './ui/modals.js';
import { initDecks, setActiveDeck } from './ui/decks.js';
import { initCards } from './ui/cards.js';
import { initStories } from './ui/stories.js';
import { initStats } from './ui/stats.js';
import { initReview } from './ui/review.js';
import { ensureSpeechReady } from './api/tts.js';
import { supabaseClient } from './api/supabase.js';
import { getToday } from './utils.js';


// Krok 2: Główna funkcja inicjalizująca aplikację
async function initializeApp() {
    // Nasłuchujemy zmian w stanie autentykacji (kluczowe dla resetu hasła)
    supabaseClient.auth.onAuthStateChange(async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
            const updatePasswordModal = document.getElementById('update-password-modal');
            const updatePasswordForm = document.getElementById('update-password-form');
            openModal(updatePasswordModal);
            // Dodajemy listener do formularza w nowym modalu
            updatePasswordForm.addEventListener('submit', handlePasswordUpdate);
        }
    });

    try {
        const db = await openDB();
        setDb(db);

        // Sprawdzanie, czy to pierwsze uruchomienie i inicjalizacja domyślnych danych
        const decksStore = getTransaction(db, 'decks');
        const decks = await new Promise(res => decksStore.getAll().onsuccess = e => res(e.target.result));
        let currentDeckId;

        if (decks.length === 0) {
            console.log("Pierwsze uruchomienie: Inicjalizacja domyślnej talii i słówek.");
            const transaction = db.transaction(['decks', 'words'], 'readwrite');
            const deckStoreTx = transaction.objectStore('decks');
            const wordStoreTx = transaction.objectStore('words');
            
            const addRequest = deckStoreTx.add({ name: 'Podstawowe słówka' });
            currentDeckId = await new Promise(res => addRequest.onsuccess = e => res(e.target.result));
            
            if (typeof initialWordList !== 'undefined') {
                initialWordList.forEach(word => {
                    const wordData = { ...word, deckId: currentDeckId, interval: 0, nextReview: getToday().toISOString(), easeFactor: 2.5, isLearning: false, learnedDate: null };
                    delete wordData.id;
                    wordStoreTx.add(wordData);
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
        
        // Inicjalizacja domyślnych opowiadań, jeśli baza jest pusta
        const storyStore = getTransaction(db, 'user_stories');
        const storyCount = await new Promise(res => storyStore.count().onsuccess = e => res(e.target.result));
        if (storyCount === 0 && typeof initialStoryList !== 'undefined' && initialStoryList.length > 0) {
            const storyTx = db.transaction('user_stories', 'readwrite');
            initialStoryList.forEach(story => storyTx.objectStore('user_stories').add(story));
        }

        // Ładowanie ustawień użytkownika
        const savedHeader = await getAppData(db, 'headerImage');
        if (savedHeader) elements.headerImage.src = savedHeader;

        const savedGlobalBg = await getAppData(db, 'globalFlashcardBg');
        if (savedGlobalBg) {
            setGlobalFlashcardBg(savedGlobalBg);
            elements.cardFrontBg.src = savedGlobalBg;
        }

        // Inicjalizacja wszystkich modułów UI
        initModals();
        initAuth();
        initCards();
        initDecks();
        initStories();
        initStats();
        initReview();

        // Przygotowanie syntezatora mowy i start sesji
        ensureSpeechReady(() => {
            elements.loadingState.classList.add('hidden');
            // Używamy funkcji z decks.js, aby poprawnie ustawić talię i wystartować sesję
            setActiveDeck(currentDeckId, true); 
        });

    } catch (error) {
        console.error("Nie udało się zainicjalizować aplikacji:", error);
        elements.loadingState.innerHTML = '<p class="text-red-500 font-bold">Wystąpił krytyczny błąd podczas ładowania aplikacji. Spróbuj odświeżyć stronę.</p>';
    }
}

// Krok 3: Uruchomienie aplikacji po załadowaniu strony
document.addEventListener('DOMContentLoaded', initializeApp);