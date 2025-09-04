// js/ui/main.js
import { setDecks, setWords, setActiveDeckId } from '../state.js';
import { supabaseClient, fetchUserData } from '../api/supabase.js';
import { elements } from './domElements.js';
import { initAuth } from './auth.js';
// import { initModals } from './modals.js'; // Załóżmy, że initModals też istnieje
import { initDecks, setActiveDeck } from './decks.js';
import { initCards } from './cards.js';

async function main() {
    elements.loadingState.classList.add('hidden');
    elements.summaryState.classList.remove('hidden');

    // Inicjalizacja wszystkich modułów UI
    initAuth();
    initDecks();
    initCards();
    // initModals();

    supabaseClient.auth.onAuthStateChange(async (event, session) => {
        if (session) {
            elements.summaryState.classList.add('hidden');
            elements.loadingState.classList.remove('hidden');

            const { decks, words } = await fetchUserData();
            setDecks(decks);
            setWords(words);

            elements.loadingState.classList.add('hidden');

            // Ustaw pierwszą talię jako aktywną lub pokaż ekran startowy
            const firstDeckId = decks.length > 0 ? decks[0].id : null;
            setActiveDeck(firstDeckId, true); // `true` zapobiega zamykaniu modala, którego nie ma
        }
        // Stan wylogowania jest obsługiwany w `updateAuthUI` w auth.js
    });
}

// Uruchomienie aplikacji
main();