// js/ui/cards.js
import { state, setQueues, setCurrentCard } from '../state.js';
import { elements } from './domElements.js';
import { getToday, addDays } from '../utils.js';
import { speak } from '../api/tts.js';
import { supabaseClient } from '../api/supabase.js';

let currentSessionWords = [];

function updateLearnedCount() {
    const count = state.words.filter(w => w.learned_date).length;
    elements.learnedCount.textContent = count;
}

function buildQueues() {
    const today = getToday();
    currentSessionWords = state.words.filter(w => w.deck_id === state.activeDeckId);
    
    const unlearnedWords = currentSessionWords.filter(w => !w.is_learning && (!w.interval || w.interval === 0));
    const dueForReview = currentSessionWords.filter(w => w.interval > 0 && new Date(w.next_review) <= today);
    
    const newQ = unlearnedWords.slice(0, 5);
    const reviewQ = dueForReview.sort(() => Math.random() - 0.5);
    
    setQueues(newQ, reviewQ);
}

function updateCounts() {
    let newCurrent = state.currentCard && state.currentCard.type === 'new' ? 1 : 0;
    let reviewCurrent = state.currentCard && state.currentCard.type === 'review' ? 1 : 0;
    elements.newCount.textContent = state.newQueue.length + newCurrent;
    elements.reviewCount.textContent = state.reviewQueue.length + reviewCurrent;
}

function updateCardUI() {
    if (state.globalFlashcardBg) {
        elements.cardFrontBg.src = state.globalFlashcardBg;
    }
    elements.cardRank.textContent = `#${state.currentCard.id}`;
    elements.cardItalian.textContent = state.currentCard.italian;
    elements.cardPolish.textContent = state.currentCard.polish;
    elements.cardExampleIt.textContent = state.currentCard.example_it;
    elements.cardExamplePl.textContent = state.currentCard.example_pl;
    elements.cardImage.src = state.currentCard.image || "";
    elements.cardImage.style.display = state.currentCard.image ? 'block' : 'none';
    
    setTimeout(() => speak(state.currentCard.italian, 'it-IT', 1.0), 200);
}

function showSummary() {
    elements.learningState.classList.add('hidden');
    elements.summaryState.classList.remove('hidden');
}

export function nextCard() {
    elements.flashcard.classList.remove('is-flipped');
    elements.difficultyButtons.classList.add('hidden');
    elements.showAnswerBtn.classList.remove('hidden');

    setTimeout(() => {
        let next = null;
        if (state.reviewQueue.length > 0) {
            next = state.reviewQueue.shift();
            next.type = 'review';
        } else if (state.newQueue.length > 0) {
            next = state.newQueue.shift();
            next.type = 'new';
            next.is_learning = true;
        }
        
        setCurrentCard(next);
        
        if (state.currentCard) {
            updateCardUI();
            updateCounts();
        } else {
            showSummary();
        }
    }, 300);
}

async function processAnswer(difficulty) {
    if (!state.currentCard) return;

    const card = state.currentCard;
    let updateData = {};

    if (difficulty === 1) { // Trudne
        card.interval = 0;
        state.reviewQueue.unshift(card);
        updateData = { interval: 0, is_learning: true };
    } else { // Łatwe
        card.is_learning = false;
        card.interval = Math.max(1, (card.interval || 0) * (card.ease_factor || 2.5));
        if (!card.learned_date) {
            card.learned_date = getToday().toISOString();
        }
        card.ease_factor = (card.ease_factor || 2.5) + 0.1;
        
        updateData = {
            is_learning: false,
            interval: card.interval,
            ease_factor: card.ease_factor,
            learned_date: card.learned_date,
            next_review: addDays(getToday(), Math.round(card.interval)).toISOString()
        };
    }
    
    // Asynchronicznie wysyłamy aktualizację do Supabase
    const { error } = await supabaseClient
        .from('words')
        .update(updateData)
        .eq('id', card.id);

    if (error) {
        console.error("Błąd podczas zapisywania postępu:", error);
        alert("Nie udało się zapisać postępu. Sprawdź połączenie z internetem.");
    } else {
        console.log(`Zaktualizowano postęp dla słówka ID: ${card.id}`);
        // Aktualizujemy też dane w naszym lokalnym stanie, aby UI był spójny
        const wordInState = state.words.find(w => w.id === card.id);
        if (wordInState) Object.assign(wordInState, updateData);
        updateLearnedCount();
    }

    nextCard();
}

export async function startSession() {
    elements.learningState.classList.remove('hidden');
    elements.summaryState.classList.add('hidden');
    elements.testState.classList.add('hidden');

    if (!state.activeDeckId) {
        elements.learningState.classList.add('hidden');
        elements.loadingState.innerHTML = '<p class="text-center text-slate-500 p-8">Wybierz lub stwórz talię, aby rozpocząć naukę.</p>';
        elements.loadingState.classList.remove('hidden');
        return;
    }
    elements.loadingState.classList.add('hidden');
    
    updateLearnedCount();
    buildQueues();

    if (state.reviewQueue.length === 0 && state.newQueue.length === 0) {
        showSummary();
    } else {
        nextCard();
        updateCounts();
    }
}

// OTO KOMPLETNA FUNKCJA initCards
export function initCards() {
    elements.showAnswerBtn.addEventListener('click', () => {
        elements.flashcard.classList.add('is-flipped');
        elements.showAnswerBtn.classList.add('hidden');
        elements.difficultyButtons.classList.remove('hidden');
        if (state.currentCard) setTimeout(() => speak(state.currentCard.example_it, 'it-IT', 1.0), 400);
    });

    elements.difficultyButtons.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (button && button.dataset.difficulty) {
            processAnswer(parseInt(button.dataset.difficulty, 10));
        }
    });

    elements.speakBtnFront.addEventListener('click', (e) => {
        e.stopPropagation();
        if (state.currentCard) speak(state.currentCard.italian, 'it-IT', 1.0);
    });

    elements.speakBtnBack.addEventListener('click', (e) => {
        e.stopPropagation();
        if (state.currentCard) speak(state.currentCard.example_it, 'it-IT', 1.0);
    });

    // UWAGA: Logika dodawania obrazków będzie wymagała dalszej pracy (przesyłanie do Supabase Storage).
    // Na razie zostawiamy listener, ale bez pełnej funkcjonalności synchronizacji.
    elements.addImageBtn.addEventListener('click', () => {
        if (state.currentCard) {
            alert("Funkcja dodawania obrazków w chmurze jest w budowie!");
            // elements.imageUploadInput.click();
        }
    });
    
    elements.startNewSessionEarlyBtn.addEventListener('click', startSession);
}