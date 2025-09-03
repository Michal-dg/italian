// js/ui/cards.js
import { state, setQueues, setCurrentCard, setGlobalFlashcardBg, setWords } from '../state.js';
import { elements } from './domElements.js';
import { getToday, addDays } from '../utils.js';
import { getTransaction, setAppData, getAllWordsByDeckId } from '../database.js';
import { speak } from '../api/tts.js';
import { NEW_WORDS_PER_DAY } from '../config.js';

let currentSessionWords = [];

function updateLearnedCount() {
    const count = state.words.filter(w => w.learnedDate).length;
    elements.learnedCount.textContent = count;
}

function buildQueues(reviewWords = null) {
    let newQ, reviewQ;
    if (reviewWords) {
        newQ = [];
        reviewQ = [...reviewWords].sort(() => Math.random() - 0.5);
    } else {
        const today = getToday();
        const unlearnedWords = state.words.filter(w => !w.isLearning && (!w.interval || w.interval === 0));
        const dueForReview = state.words.filter(w => w.interval > 0 && new Date(w.nextReview) <= today);
        
        newQ = unlearnedWords.slice(0, NEW_WORDS_PER_DAY);
        reviewQ = dueForReview.sort(() => Math.random() - 0.5);
    }
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
    elements.testState.classList.add('hidden');
    elements.testSummaryState.classList.add('hidden');
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
            next.isLearning = true;
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
    if (difficulty === 1) { // Trudne
        card.interval = 0;
        state.reviewQueue.unshift(card); // Wraca na początek kolejki
    } else { // Łatwe
        card.isLearning = false;
        card.interval = Math.max(1, (card.interval || 0) * (card.easeFactor || 2.5));
        if (!card.learnedDate) {
            card.learnedDate = getToday().toISOString();
            updateLearnedCount();
        }
        card.easeFactor = (card.easeFactor || 2.5) + 0.1;
    }
    card.nextReview = addDays(getToday(), Math.round(card.interval)).toISOString();

    const wordStore = getTransaction(state.db, 'words', 'readwrite');
    wordStore.put(card);

    nextCard();
}

export async function startSession(reviewWords = null) {
    elements.learningState.classList.remove('hidden');
    elements.testState.classList.add('hidden');
    elements.testSummaryState.classList.add('hidden');
    elements.summaryState.classList.add('hidden');

    if (!state.activeDeckId) {
        elements.learningState.classList.add('hidden');
        elements.loadingState.innerHTML = '<p class="text-center text-slate-500 p-8">Wybierz lub stwórz talię, aby rozpocząć naukę.</p>';
        elements.loadingState.classList.remove('hidden');
        return;
    }
    elements.loadingState.classList.add('hidden');
    
    const wordsForSession = reviewWords || await getAllWordsByDeckId(state.db, state.activeDeckId);
    setWords(wordsForSession);
    updateLearnedCount();

    buildQueues(reviewWords);

    if (state.reviewQueue.length === 0 && state.newQueue.length === 0) {
        showSummary();
    } else {
        nextCard();
        updateCounts();
    }
}

async function handleImageUpload(event, isGlobal) {
    const file = event.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
        const imageDataUrl = e.target.result;
        if (isGlobal) {
            setGlobalFlashcardBg(imageDataUrl);
            await setAppData(state.db, 'globalFlashcardBg', imageDataUrl);
            if (state.currentCard) elements.cardFrontBg.src = imageDataUrl;
        } else if (state.currentCard) {
            elements.cardImage.src = imageDataUrl;
            elements.cardImage.style.display = 'block';
            state.currentCard.image = imageDataUrl;
            const store = getTransaction(state.db, 'words', 'readwrite');
            store.put(state.currentCard);
        }
    };
    reader.readAsDataURL(file);
    event.target.value = ''; // Reset input
}

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
    
    elements.addImageBtn.addEventListener('click', () => {
        if (state.currentCard) elements.imageUploadInput.click();
    });

    elements.uploadGlobalBgBtn.addEventListener('click', () => elements.globalBgUploadInput.click());

    elements.imageUploadInput.addEventListener('change', (e) => handleImageUpload(e, false));
    elements.globalBgUploadInput.addEventListener('change', (e) => handleImageUpload(e, true));

    elements.uploadHeaderBtn.addEventListener('click', () => elements.headerUploadInput.click());
    elements.headerUploadInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                elements.headerImage.src = e.target.result;
                await setAppData(state.db, 'headerImage', e.target.result);
            };
            reader.readAsDataURL(file);
        }
                event.target.value = '';
    });
} // <-- ❗️ UPEWNIJ SIĘ, ŻE TEN NAWIAS ZAMYKA FUNKCJĘ initCards


// ❗️ A TO JEST NOWA FUNKCJA, KTÓRA POWINNA BYĆ TUTAJ,
// CAŁKOWICIE POZA I POD FUNKCJĄ initCards
export function resetSessionUI() {
    // Ukryj wszystkie aktywne stany
    elements.learningState.classList.add('hidden');
    elements.summaryState.classList.add('hidden');
    elements.testState.classList.add('hidden');
    elements.testSummaryState.classList.add('hidden');

    // Wyzeruj liczniki w interfejsie
    elements.newCount.textContent = '0';
    elements.reviewCount.textContent = '0';
    elements.learnedCount.textContent = '0';
    elements.activeDeckName.textContent = 'Brak';

    // Pokaż komunikat powitalny/instrukcję
    elements.loadingState.innerHTML = '<p class="text-center text-slate-500 p-8">Zaloguj się i wybierz talię, aby rozpocząć naukę.</p>';
    elements.loadingState.classList.remove('hidden');
}
