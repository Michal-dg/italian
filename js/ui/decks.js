// js/ui/decks.js
import { state, setActiveDeckId as setStateActiveDeckId } from '../state.js';
import { elements } from './domElements.js';
import { getTransaction } from '../database.js';
import { openModal, closeModal } from './modals.js';
import { startSession } from './cards.js';

async function renderDecksList() {
    const deckStore = getTransaction(state.db, 'decks');
    const decks = await new Promise(res => deckStore.getAll().onsuccess = e => res(e.target.result));

    elements.decksList.innerHTML = '';
    if (!decks || decks.length === 0) {
        elements.decksList.innerHTML = '<p class="text-center text-slate-500 p-4">Nie masz żadnych talii. Stwórz nową, aby zacząć.</p>';
        return;
    }

    const wordStore = getTransaction(state.db, 'words');
    const index = wordStore.index('deckId');

    for (const deck of decks) {
        const wordCount = await new Promise(res => index.count(deck.id).onsuccess = e => res(e.target.result));
        const deckEl = document.createElement('div');
        deckEl.className = `p-3 hover:bg-slate-100 rounded-lg cursor-pointer ${deck.id === state.activeDeckId ? 'bg-sky-100' : ''}`;
        deckEl.innerHTML = `
            <div class="flex justify-between items-center">
                <div class="deck-name-container grow pr-2">
                    <p class="font-bold">${deck.name} <span class="font-normal text-slate-500 text-sm">(${wordCount} słów)</span></p>
                </div>
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
            deleteDeck(deck);
        });

        elements.decksList.appendChild(deckEl);
    }
}

async function showDeckDetails(deck) {
    elements.deckDetailsView.classList.remove('hidden');
    elements.deckDetailsName.textContent = deck.name;
    const wordStore = getTransaction(state.db, 'words');
    const index = wordStore.index('deckId');
    const wordsInDeck = await new Promise(res => index.getAll(deck.id).onsuccess = e => res(e.target.result));
    
    elements.deckDetailsWords.innerHTML = wordsInDeck.length > 0
        ? wordsInDeck.map(w => `<div class="text-sm py-1">${w.italian} - ${w.polish}</div>`).join('')
        : '<p class="text-slate-500 text-sm">Brak słów w tej talii.</p>';
}


export async function setActiveDeck(deckId, preventModalClose = false) {
    setStateActiveDeckId(deckId);
    await import('../database.js').then(db => db.setAppData(state.db, 'activeDeckId', deckId));
    
    const deckStore = getTransaction(state.db, 'decks');
    const deck = await new Promise(res => deckStore.get(deckId).onsuccess = e => res(e.target.result));
    elements.activeDeckName.textContent = deck ? deck.name : 'Brak';
    
    if (!preventModalClose) {
        closeModal(elements.decksModal);
    }
    
    await startSession();
    if (!preventModalClose) {
       await renderDecksList(); // Re-render to show active state
    }
}

async function handleAddDeck(e) {
    e.preventDefault();
    const deckNameInput = document.getElementById('new-deck-name');
    const deckName = deckNameInput.value.trim();
    if (!deckName) return;

    try {
        const store = getTransaction(state.db, 'decks', 'readwrite');
        await new Promise((res, rej) => {
            const req = store.add({ name: deckName });
            req.onsuccess = res;
            req.onerror = rej;
        });
        await renderDecksList();
        deckNameInput.value = '';
    } catch (error) {
        if (error.name === 'ConstraintError') {
            alert('Talia o tej nazwie już istnieje.');
        } else {
            alert('Nie udało się dodać nowej talii.');
        }
    }
}

async function deleteDeck(deck) {
    if (!confirm(`Czy na pewno chcesz usunąć talię "${deck.name}" i wszystkie zawarte w niej słowa? Tej operacji не można cofnąć.`)) return;

    const wordTx = state.db.transaction('words', 'readwrite');
    const wordStore = wordTx.objectStore('words');
    const index = wordStore.index('deckId');
    const wordsToDeleteKeys = await new Promise(res => index.getAllKeys(deck.id).onsuccess = e => res(e.target.result));
    wordsToDeleteKeys.forEach(key => wordStore.delete(key));

    const deckStore = getTransaction(state.db, 'decks', 'readwrite');
    deckStore.delete(deck.id);

    if (state.activeDeckId === deck.id) {
        const allDecksStore = getTransaction(state.db, 'decks');
        const decks = await new Promise(res => allDecksStore.getAll().onsuccess = e => res(e.target.result));
        await setActiveDeck(decks.length > 0 ? decks[0].id : null);
    }
    await renderDecksList();
    elements.deckDetailsView.classList.add('hidden');
}

async function handleAddWords(e) {
    e.preventDefault();
    const bulkInput = document.getElementById('bulk-words-input');
    const text = bulkInput.value.trim();
    if (!text || !state.activeDeckId) return;

    const lines = text.split('\n').filter(line => line.trim() !== '');
    const newWords = [];
    for (const line of lines) {
        const parts = line.split(';').map(part => part.trim());
        if (parts.length !== 4) {
            alert(`Nieprawidłowy format w linii: "${line}". Oczekiwano 4 części oddzielonych średnikami.`);
            return;
        }
        const [italian, polish, example_it, example_pl] = parts;
        newWords.push({ deckId: state.activeDeckId, italian, polish, example_it, example_pl, interval: 0, nextReview: new Date().toISOString(), easeFactor: 2.5, isLearning: false, learnedDate: null, image: null });
    }

    if (newWords.length > 0) {
        const transaction = state.db.transaction('words', 'readwrite');
        const store = transaction.objectStore('words');
        newWords.forEach(word => store.add(word));
        
        await new Promise(res => transaction.oncomplete = res);
        bulkInput.value = '';
        closeModal(elements.addWordModal);
        await startSession();
        alert(`Dodano ${newWords.length} nowych słów!`);
    }
}

export function initDecks() {
    elements.showDecksBtn.addEventListener('click', async () => {
        elements.deckDetailsView.classList.add('hidden');
        await renderDecksList();
        openModal(elements.decksModal);
    });

    elements.addDeckForm.addEventListener('submit', handleAddDeck);
    elements.addWordForm.addEventListener('submit', handleAddWords);

    elements.openAddWordModalBtn.addEventListener('click', async () => {
        const store = getTransaction(state.db, 'decks');
        const selectedDeck = await new Promise(res => store.get(state.activeDeckId).onsuccess = e => res(e.target.result));
        if (selectedDeck) {
            elements.addWordDeckName.textContent = selectedDeck.name;
            closeModal(elements.decksModal);
            openModal(elements.addWordModal);
        } else {
            alert("Najpierw wybierz talię.");
        }
    });
}