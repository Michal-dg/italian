// js/ui/domElements.js

// Eksportujemy jeden obiekt `elements`, który zawiera odwołania do wszystkich potrzebnych elementów DOM.
export const elements = {
    // Stany aplikacji
    loadingState: document.getElementById('loading-state'),
    summaryState: document.getElementById('summary-state'),
    learningState: document.getElementById('learning-state'),
    testState: document.getElementById('test-state'),
    testSummaryState: document.getElementById('test-summary-state'),

    // Główne elementy UI
    headerImage: document.getElementById('header-image'),
    uploadHeaderBtn: document.getElementById('upload-header-btn'),
    activeDeckName: document.getElementById('active-deck-name'),
    resetProgressBtn: document.getElementById('reset-progress'),

    // Liczniki
    newCount: document.getElementById('new-count'),
    reviewCount: document.getElementById('review-count'),
    learnedCount: document.getElementById('learned-count'),

    // Elementy fiszki
    flashcard: document.getElementById('flashcard'),
    cardRank: document.getElementById('card-rank'),
    cardItalian: document.getElementById('card-italian'),
    cardPolish: document.getElementById('card-polish'),
    cardExampleIt: document.getElementById('card-example-it'),
    cardExamplePl: document.getElementById('card-example-pl'),
    cardImage: document.getElementById('card-image'),
    cardFrontBg: document.getElementById('card-front-bg'),
    showAnswerBtn: document.getElementById('show-answer-btn'),
    difficultyButtons: document.getElementById('difficulty-buttons'),
    speakBtnFront: document.getElementById('speak-btn-front'),
    speakBtnBack: document.getElementById('speak-btn-back'),
    addImageBtn: document.getElementById('add-image-btn'),
    uploadGlobalBgBtn: document.getElementById('upload-global-bg-btn'),

    // Przyciski nawigacji
    showDecksBtn: document.getElementById('show-decks-btn'),
    showLearnedWordsBtn: document.getElementById('show-learned-words-btn'),
    showStatsBtn: document.getElementById('show-stats-btn'),
    showStoriesBtn: document.getElementById('show-stories-btn'),
    showReviewBtn: document.getElementById('show-review-btn'),
    showAuthBtn: document.getElementById('show-auth-btn'),

    // Okna modalne
    decksModal: document.getElementById('decks-modal'),
    learnedWordsModal: document.getElementById('learned-words-modal'),
    statsModal: document.getElementById('stats-modal'),
    storiesModal: document.getElementById('stories-modal'),
    storyViewerModal: document.getElementById('story-viewer-modal'),
    addWordModal: document.getElementById('add-word-modal'),
    reviewModal: document.getElementById('review-modal'),
    authModal: document.getElementById('auth-modal'),
    
    // Elementy modala talii
    decksList: document.getElementById('decks-list'),
    addDeckForm: document.getElementById('add-deck-form'),
    deckDetailsView: document.getElementById('deck-details-view'),
    deckDetailsName: document.getElementById('deck-details-name'),
    deckDetailsWords: document.getElementById('deck-details-words'),
    openAddWordModalBtn: document.getElementById('open-add-word-modal-btn'),

    // Elementy modala dodawania słów
    addWordForm: document.getElementById('add-word-form'),
    addWordDeckName: document.getElementById('add-word-deck-name'),
    
    // Elementy modala nauczonych słów
    learnedWordsList: document.getElementById('learned-words-list'),
    learnedWordsCount: document.getElementById('learned-words-count'),

    // Elementy modala statystyk
    statsChartCanvas: document.getElementById('stats-chart'),

    // Elementy modala opowiadań
    storiesList: document.getElementById('stories-list'),
    addStoryBtn: document.getElementById('add-story-btn'),
    storyViewerTitle: document.getElementById('story-viewer-title'),
    storyViewerContent: document.getElementById('story-viewer-content'),
    listenFullStoryBtn: document.getElementById('listen-full-story-btn'),
    uploadStoryBgBtn: document.getElementById('upload-story-bg-btn'),
    storyViewerBgContainer: document.getElementById('story-viewer-bg-container'),
    speedSlider: document.getElementById('speed-slider'),

    // Elementy autentykacji
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

    // Inputy do ładowania plików
    imageUploadInput: document.getElementById('image-upload-input'),
    headerUploadInput: document.getElementById('header-upload-input'),
    storyUploadInput: document.getElementById('story-upload-input'),
    globalBgUploadInput: document.getElementById('global-bg-upload-input'),
    storyBgUploadInput: document.getElementById('story-bg-upload-input'),
};