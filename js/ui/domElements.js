// js/ui/domElements.js
// Ten plik zbiera wszystkie odwołania do elementów HTML w jednym miejscu.
export const elements = {
    // Główne kontenery
    loadingState: document.getElementById('loading-state'),
    summaryState: document.getElementById('summary-state'),
    learningState: document.getElementById('learning-state'),
    testState: document.getElementById('test-state'),
    testSummaryState: document.getElementById('test-summary-state'),

    // Nagłówek i Nawigacja
    headerImage: document.getElementById('header-image'),
    uploadHeaderBtn: document.getElementById('upload-header-btn'),
    headerUploadInput: document.getElementById('header-upload-input'),
    activeDeckName: document.getElementById('active-deck-name'),
    
    // Liczniki
    newCount: document.getElementById('new-count'),
    reviewCount: document.getElementById('review-count'),
    learnedCount: document.getElementById('learned-count'),

    // Fiszka
    flashcard: document.getElementById('flashcard'),
    cardItalian: document.getElementById('card-italian'),
    cardPolish: document.getElementById('card-polish'),
    cardExampleIt: document.getElementById('card-example-it'),
    cardExamplePl: document.getElementById('card-example-pl'),
    cardImage: document.getElementById('card-image'),
    cardFrontBg: document.getElementById('card-front-bg'),
    cardRank: document.getElementById('card-rank'),

    // Przyciski Fiszki
    showAnswerBtn: document.getElementById('show-answer-btn'),
    difficultyButtons: document.getElementById('difficulty-buttons'),
    speakBtnFront: document.getElementById('speak-btn-front'),
    speakBtnBack: document.getElementById('speak-btn-back'),
    addImageBtn: document.getElementById('add-image-btn'),
    uploadGlobalBgBtn: document.getElementById('upload-global-bg-btn'),
    imageUploadInput: document.getElementById('image-upload-input'),
    globalBgUploadInput: document.getElementById('global-bg-upload-input'),

    // Modal Autoryzacji
    authModal: document.getElementById('auth-modal'),
    showAuthBtn: document.getElementById('show-auth-btn'),
    authForm: document.getElementById('auth-form'),
    loginBtn: document.getElementById('login-btn'),
    registerBtn: document.getElementById('register-btn'),
    logoutBtn: document.getElementById('logout-btn'),
    authErrorMessage: document.getElementById('auth-error-message'),
    authSuccessMessage: document.getElementById('auth-success-message'),
    userInfo: document.getElementById('user-info'),
    userEmailDisplay: document.getElementById('user-email-display'),
    authIconUser: document.getElementById('auth-icon-user'),
    authIconLogout: document.getElementById('auth-icon-logout'),

    // Modal Talii
    decksModal: document.getElementById('decks-modal'),
    showDecksBtn: document.getElementById('show-decks-btn'),
    decksList: document.getElementById('decks-list'),
    addDeckForm: document.getElementById('add-deck-form'),
};