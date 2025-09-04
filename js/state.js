// js/state.js

// Obiekt przechowujący dynamiczny stan aplikacji w pamięci
export const state = {
    db: null, // Uchwyt do lokalnej bazy IndexedDB (dla ustawień globalnych)
    decks: [],      // Przechowuje talie zalogowanego użytkownika z Supabase
    words: [],      // Przechowuje wszystkie słówka zalogowanego użytkownika
    activeDeckId: null,
    currentCard: null,
    newQueue: [],
    reviewQueue: [],
    synth: window.speechSynthesis,
    italianVoices: [],
    speechReady: false,
    statsChart: null,
    globalFlashcardBg: null,
    currentAudio: null, // Ważne dla odtwarzacza audio
    testWords: [],
    currentTestQuestionIndex: 0,
    testScore: 0,
};

// Funkcje do modyfikacji stanu (tzw. mutatory)
export function setDb(dbInstance) {
    state.db = dbInstance;
}
export function setActiveDeckId(id) {
    state.activeDeckId = id;
}
export function setDecks(deckArray) {
    state.decks = deckArray;
}
export function setWords(wordArray) {
    state.words = wordArray;
}
export function setCurrentCard(card) {
    state.currentCard = card;
}
export function setQueues(newQ, reviewQ) {
    state.newQueue = newQ;
    state.reviewQueue = reviewQ;
}
export function setSpeechReady(isReady, voices) {
    state.speechReady = isReady;
    state.italianVoices = voices;
}
export function setStatsChart(chart) {
    state.statsChart = chart;
}
export function setGlobalFlashcardBg(bg) {
    state.globalFlashcardBg = bg;
}
export function setCurrentAudio(audio) {
    state.currentAudio = audio;
}