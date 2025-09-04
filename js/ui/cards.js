// js/ui/cards.js
import { state, setQueues, setCurrentCard } from '../state.js';
import { elements } from './domElements.js';
import { getToday, addDays } from '../utils.js';
import { speak } from '../api/tts.js';
import { updateWordProgress } from '../api/supabase.js';
import { NEW_WORDS_PER_DAY } from '../config.js';

function buildQueues() {
    const today = getToday();
    const wordsInDeck = state.words.filter(w => w.deck_id === state.activeDeckId);
    
    const unlearned = wordsInDeck.filter(w => !w.interval || w.interval === 0);
    const dueForReview = wordsInDeck.filter(w => w.interval > 0 && new Date(w.nextReview) <= today);
    
    setQueues(unlearned.slice(0, NEW_WORDS_PER_DAY), dueForReview.sort(() => Math.random() - 0.5));
}

function updateCounts() {
    const newCurrent = state.currentCard?.type === 'new' ? 1 : 0;
    const reviewCurrent = state.currentCard?.type === 'review' ? 1 : 0;
    elements.newCount.textContent = state.newQueue.length + newCurrent;
    elements.reviewCount.textContent = state.reviewQueue.length + reviewCurrent;
    elements.learnedCount.textContent = state.words.filter(w => w.learnedDate).length;
}

function updateCardUI() {
    if (!state.currentCard) return;
    elements.flashcard.classList.remove('is-flipped');
    elements.difficultyButtons.classList.add('hidden');
    elements.showAnswerBtn.classList.remove('hidden');
    elements.cardItalian.textContent = state.currentCard.italian;
    elements.cardPolish.textContent = state.currentCard.polish;
    elements.cardExampleIt.textContent = state.currentCard.example_it;
    elements.cardExamplePl.textContent = state.currentCard.example_pl;
    speak(state.currentCard.italian);
}

function showSummary() {
    elements.learningState.classList.add('hidden');
    elements.summaryState.classList.remove('hidden');
}

export function nextCard() {
    setTimeout(() => {
        let next = null;
        if (state.reviewQueue.length > 0) {
            next = state.reviewQueue.shift();
            next.type = 'review';
        } else if (state.newQueue.length > 0) {
            next = state.newQueue.shift();
            next.type = 'new';
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

    if (difficulty == 1) { // Trudne
        card.interval = 0;
        state.reviewQueue.unshift(card); // Wraca na początek kolejki
    } else { // Łatwe
        card.isLearning = false;
        card.interval = Math.max(1, (card.interval || 0) * 2.5);
        if (!card.learnedDate) card.learnedDate = getToday().toISOString();
    }
    card.nextReview = addDays(getToday(), Math.round(card.interval)).toISOString();

    await updateWordProgress(card);
    nextCard();
}

export function startSession() {
    if (!state.activeDeckId) {
        elements.summaryState.classList.remove('hidden');
        elements.learningState.classList.add('hidden');
        return;
    }
    elements.summaryState.classList.add('hidden');
    elements.learningState.classList.remove('hidden');
    buildQueues();
    nextCard();
}

export function initCards() {
    elements.showAnswerBtn.addEventListener('click', () => {
        elements.flashcard.classList.add('is-flipped');
        elements.showAnswerBtn.classList.add('hidden');
        elements.difficultyButtons.classList.remove('hidden');
    });
    elements.difficultyButtons.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (button) processAnswer(button.dataset.difficulty);
    });
    elements.speakBtnFront.addEventListener('click', () => state.currentCard && speak(state.currentCard.italian));
}