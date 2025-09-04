// js/ui/decks.js
import { state, setDecks, setWords, setActiveDeckId as setStateActiveDeckId } from '../state.js';
import { elements } from './domElements.js';
import { openModal, closeModal } from './modals.js';
import { startSession } from './cards.js';
import { supabaseClient } from '../api/supabase.js';

export async function renderDecksList() {
    elements.decksList.innerHTML = '';
    const decks = state.decks || [];

    if (decks.length === 0) {
        elements.decksList.innerHTML = '<p class="text-center text-slate-500 p-4">Nie masz żadnych talii. Stwórz nową.</p>';
        return;
    }

    decks.forEach(deck => {
        const wordCount = deck.words ? deck.words.length : 0;
        const deckEl = document.createElement('div');
        deckEl.className = `p-3 hover:bg-slate-100 rounded-lg cursor-pointer ${deck.id === state.activeDeckId ? 'bg-sky-100' : ''}`;
        deckEl.innerHTML = `
            <div class="flex justify-between items-center">
                <div class="deck-name-container grow pr-2"><p class="font-bold">${deck.name} <span class="font-normal text-slate-500 text-sm">(${wordCount} słów)</span></p></div>
                <div class="flex-shrink-0">
                    <button data-action="details" title="Pokaż słówka" class="p-1 text-slate-500 hover:text-sky-600">👁️</button>
                    <button data-action="delete" title="Usuń talię" class="p-1 text-slate-500 hover:text-red-600">&times;</button>
                </div>
            </div>`;
        
        deckEl.querySelector('.deck-name-container').addEventListener('click', () => setActiveDeck(deck.id));
        deckEl.querySelector('[data-action="details"]').addEventListener('click', (e) => {
            e.stopPropagation();
            showDeckDetails(deck);
        });
        deckEl.querySelector('[data-action="delete"]').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteDeck(deck.id, deck.name);
        });
        elements.decksList.appendChild(deckEl);
    });
}

function showDeckDetails(deck) {
    elements.deckDetailsView.classList.remove('hidden');
    elements.deckDetailsName.textContent = deck.name;
    const wordsInDeck = state.words.filter(w => w.deck_id === deck.id);
    
    elements.deckDetailsWords.innerHTML = wordsInDeck.length > 0
        ? wordsInDeck.map(w => `<div class="text-sm py-1">${w.italian} - ${w.polish}</div>`).join('')
        : '<p class="text-slate-500 text-sm">Brak słów w tej talii.</p>';
}

export async function setActiveDeck(deckId, preventModalClose = false) {
    setStateActiveDeckId(deckId);
    
    const deck = state.decks.find(d => d.id === deckId);
    elements.activeDeckName.textContent = deck ? deck.name : 'Brak';
    
    if (!preventModalClose) closeModal(elements.decksModal);
    
    await startSession();
    if (!preventModalClose) await renderDecksList();
}

async function handleAddDeck(e) {
    e.preventDefault();
    const deckNameInput = document.getElementById('new-deck-name');
    const deckName = deckNameInput.value.trim();
    if (!deckName) return;

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return alert("Musisz być zalogowany, aby dodać talię.");

    const { data, error } = await supabaseClient
        .from('decks')
        .insert({ name: deckName, user_id: user.id })
        .select()
        .single();

    if (error) {
        console.error("Błąd podczas dodawania talii:", error);
        alert("Nie udało się dodać talii.");
    } else {
        console.log("Dodano nową talię:", data);
        setDecks([...state.decks, { ...data, words: [] }]);
        await renderDecksList();
        deckNameInput.value = '';
    }
}

// ❗️ NOWA, KOMPLETNA FUNKCJA DO DODAWANIA SŁÓWEK ❗️
async function handleAddWords(e) {
    e.preventDefault();
    const bulkInput = document.getElementById('bulk-words-input');
    const text = bulkInput.value.trim();
    const activeDeckId = state.activeDeckId;
    if (!text || !activeDeckId) return;

    const lines = text.split('\n').filter(line => line.trim() !== '');
    const newWordsData = lines.map(line => {
        const parts = line.split(';').map(part => part.trim());
        if (parts.length !== 4) return null;
        const [italian, polish, example_it, example_pl] = parts;
        return { deck_id: activeDeckId, italian, polish, example_it, example_pl };
    }).filter(Boolean); // Usuwa niepoprawne linie (null)

    if (newWordsData.length === 0) return alert("Nie znaleziono poprawnych słówek do dodania. Sprawdź format.");

    const { data: insertedWords, error } = await supabaseClient
        .from('words')
        .insert(newWordsData)
        .select();

    if (error) {
        console.error("Błąd podczas dodawania słówek:", error);
        alert("Nie udało się dodać słówek.");
    } else {
        console.log("Dodano nowe słówka:", insertedWords);
        // Aktualizujemy stan w pamięci, aby UI odświeżył się natychmiast
        const activeDeck = state.decks.find(d => d.id === activeDeckId);
        if (activeDeck) {
            activeDeck.words.push(...insertedWords);
        }
        setWords([...state.words, ...insertedWords]);

        bulkInput.value = '';
        closeModal(elements.addWordModal);
        await renderDecksList(); // Odświeża listę talii, by zaktualizować licznik słów
        alert(`Dodano ${insertedWords.length} nowych słów!`);
    }
}


async function deleteDeck(deckId, deckName) {
    if (!confirm(`Czy na pewno chcesz usunąć talię "${deckName}" i wszystkie jej słówka?`)) return;

    const { error } = await supabaseClient
        .from('decks')
        .delete()
        .eq('id', deckId);

    if (error) {
        console.error("Błąd podczas usuwania talii:", error);
        alert("Nie udało się usunąć talii.");
    } else {
        console.log("Usunięto talię o ID:", deckId);
        const newDecks = state.decks.filter(d => d.id !== deckId);
        const newWords = state.words.filter(w => w.deck_id !== deckId);
        setDecks(newDecks);
        setWords(newWords);
        
        await renderDecksList();

        if (state.activeDeckId === deckId) {
            const newActiveId = newDecks.length > 0 ? newDecks[0].id : null;
            await setActiveDeck(newActiveId);
        }
    }
}

// ❗️ ZAKTUALIZOWANA, KOMPLETNA WERSJA TEJ FUNKCJI ❗️
export function initDecks() {
    elements.showDecksBtn.addEventListener('click', async () => {
        elements.deckDetailsView.classList.add('hidden');
        await renderDecksList();
        openModal(elements.decksModal);
    });

    elements.addDeckForm.addEventListener('submit', handleAddDeck);
    
    elements.openAddWordModalBtn.addEventListener('click', () => {
        const selectedDeck = state.decks.find(d => d.id === state.activeDeckId);
        if (selectedDeck) {
            elements.addWordDeckName.textContent = selectedDeck.name;
            closeModal(elements.decksModal);
            openModal(elements.addWordModal);
        } else {
             alert("Najpierw wybierz lub stwórz talię.");
        }
    });

    elements.addWordForm.addEventListener('submit', handleAddWords);
}