// js/main.js

// === KROK 1: IMPORTY ===
// Importujemy wszystkie potrzebne moduły i funkcje z całej aplikacji.
// Upewnij się, że wszystkie te pliki istnieją w odpowiednich folderach.
import { setDb, setDecks, setWords, setActiveDeckId, setGlobalFlashcardBg } from './state.js';
import { openDB, getAppData } from './database.js';
import { elements } from './ui/domElements.js';
import { initAuth, updateAuthUI, handlePasswordUpdate } from './ui/auth.js';
import { initModals, openModal } from './ui/modals.js';
import { initDecks, renderDecksList, setActiveDeck } from './ui/decks.js';
import { initCards } from './ui/cards.js';
import { initStories } from './ui/stories.js';
import { initStats } from './ui/stats.js';
import { initReview } from './ui/review.js';
import { ensureSpeechReady } from './api/tts.js';
import { supabaseClient } from './api/supabase.js';

// === KROK 2: GŁÓWNA LOGIKA APLIKACJI ===

/**
 * Pobiera dane zalogowanego użytkownika (talie, słówka) z Supabase
 * i ładuje je do stanu aplikacji w pamięci.
 * @param {object | null} user - Obiekt użytkownika z Supabase lub null.
 */
async function fetchAndLoadUserData(user) {
    if (!user) {
        setDecks([]);
        setWords([]);
        await setActiveDeck(null, true); // Ustawiamy pustą sesję
        await renderDecksList();
        return;
    }

    console.log("Pobieranie danych dla użytkownika z chmury...");
    const { data: decks, error } = await supabaseClient
        .from('decks')
        .select('*, words(*)') // Pobieramy talie i od razu wszystkie słówka w nich zawarte
        .eq('user_id', user.id);

    if (error) {
        console.error("Błąd podczas pobierania danych z Supabase:", error);
        alert('Nie udało się pobrać Twoich danych. Sprawdź połączenie z internetem.');
        return;
    }

    // Ładujemy dane do naszego stanu w pamięci
    setDecks(decks || []);
    const allWords = decks ? decks.flatMap(deck => deck.words || []) : [];
    setWords(allWords);

    console.log(`Pobrano ${decks.length} talii i ${allWords.length} słówek.`);
    
    // Ustawiamy pierwszą talię jako aktywną, jeśli jakaś istnieje
    if (decks && decks.length > 0) {
        await setActiveDeck(decks[0].id, true);
    } else {
        await setActiveDeck(null, true);
    }

    // Odświeżamy widok listy talii
    await renderDecksList();
}


/**
 * Główna funkcja inicjalizująca całą aplikację.
 */
async function initializeApp() {
    // Inicjalizacja lokalnej bazy IndexedDB dla ustawień globalnych
    const db = await openDB();
    setDb(db);

    // === GŁÓWNY "DYRYGENT" APLIKACJI ===
    // Jeden, centralny nasłuchiwacz, który reaguje na wszystkie zmiany stanu autentykacji
    supabaseClient.auth.onAuthStateChange(async (event, session) => {
        const user = session ? session.user : null;
        
        // 1. Zawsze aktualizujemy interfejs powiązany z autentykacją
        updateAuthUI(user);

        // 2. Jeśli użytkownik się zalogował lub sesja została odświeżona, pobieramy jego dane
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
            await fetchAndLoadUserData(user);
        }
        
        // 3. Jeśli użytkownik się wylogował, czyścimy dane
        if (event === 'SIGNED_OUT') {
            await fetchAndLoadUserData(null);
        }
        
        // 4. Specjalna obsługa powrotu z linku do resetowania hasła
        if (event === 'PASSWORD_RECOVERY') {
            const updatePasswordModal = document.getElementById('update-password-modal');
            const updatePasswordForm = document.getElementById('update-password-form');
            openModal(updatePasswordModal);
            updatePasswordForm.addEventListener('submit', handlePasswordUpdate);
        }
    });

    try {
        // Ładowanie ustawień globalnych (niezależnych od użytkownika) z IndexedDB
        const savedHeader = await getAppData(db, 'headerImage');
        if (savedHeader && elements.headerImage) elements.headerImage.src = savedHeader;
        
        const savedGlobalBg = await getAppData(db, 'globalFlashcardBg');
        if (savedGlobalBg) {
            setGlobalFlashcardBg(savedGlobalBg);
            if (elements.cardFrontBg) elements.cardFrontBg.src = savedGlobalBg;
        }

        // Inicjalizacja wszystkich modułów UI (dodanie listenerów do przycisków itp.)
        initModals();
        initAuth();
        initCards();
        initDecks();
        initStories();
        initStats();
        initReview();

        // Przygotowanie syntezatora mowy
        ensureSpeechReady(() => {
            if(elements.loadingState) elements.loadingState.classList.add('hidden');
        });

    } catch (error) {
        console.error("Nie udało się zainicjalizować aplikacji:", error);
        if(elements.loadingState) {
            elements.loadingState.innerHTML = '<p class="text-red-500 font-bold">Wystąpił krytyczny błąd. Odśwież stronę.</p>';
        }
    }
}

// === KROK 3: URUCHOMIENIE APLIKACJI ===
document.addEventListener('DOMContentLoaded', initializeApp);