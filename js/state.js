// js/state.js

// Obiekt przechowujący dynamiczny stan aplikacji
export const state = {
    db: null,
    words: [],
    newQueue: [],
    reviewQueue: [],
    currentCard: null,
    synth: window.speechSynthesis,
    italianVoices: [],
    speechReady: false,
    statsChart: null,
    globalFlashcardBg: null,
    activeDeckId: null,
    storySpeechRate: 1.0,
    currentAudio: null,
    testWords: [],
    currentTestQuestionIndex: 0,
    testScore: 0,
};

// Funkcje do modyfikacji stanu (mutatory)
export function setDb(dbInstance) {
    state.db = dbInstance;
}
export function setActiveDeckId(id) {
    state.activeDeckId = id;
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
export function setCurrentAudio(audio) {
    state.currentAudio = audio;
}
export function setStatsChart(chart) {
    state.statsChart = chart;
}
export function setGlobalFlashcardBg(bg) {
    state.globalFlashcardBg = bg;
}