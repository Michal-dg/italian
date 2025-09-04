// js/state.js
export const state = {
    // Dane z Supabase
    decks: [],
    words: [],
    
    // Stan sesji
    activeDeckId: null,
    currentCard: null,
    newQueue: [],
    reviewQueue: [],

    // Stan UI i urządzeń
    synth: window.speechSynthesis,
    italianVoices: [],
    speechReady: false,
    currentAudio: null,
};

// Funkcje do modyfikacji stanu (mutatory)
export function setActiveDeckId(id) { state.activeDeckId = id; }
export function setDecks(deckArray) { state.decks = deckArray; }
export function setWords(wordArray) { state.words = wordArray; }
export function setCurrentCard(card) { state.currentCard = card; }
export function setQueues(newQ, reviewQ) { state.newQueue = newQ; state.reviewQueue = reviewQ; }
export function setSpeechReady(isReady, voices) { state.speechReady = isReady; state.italianVoices = voices; }
export function setCurrentAudio(audio) { state.currentAudio = audio; }