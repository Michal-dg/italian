// js/ui/domElements.js
// Ostateczna, kompletna wersja.

export const elements = {
    // === GŁÓWNE KONTENERY I WIDOKI ===
    loadingState: document.getElementById('loading-state'),
    summaryState: document.getElementById('summary-state'),
    learningState: document.getElementById('learning-state'),
    testState: document.getElementById('test-state'),
    testSummaryState: document.getElementById('test-summary-state'),
    
    // === NAGŁÓWEK I NAWIGACJA ===
    headerImage: document.getElementById('header-image'),
    uploadHeaderBtn: document.getElementById('upload-header-btn'),
    activeDeckName: document.getElementById('active-deck-name'),
    showDecksBtn: document.getElementById('show-decks-btn'),
    showLearnedWordsBtn: document.getElementById('show-learned-words-btn'),
    showStatsBtn: document.getElementById('show-stats-btn'),
    showStoriesBtn: document.getElementById('show-stories-btn'),
    showReviewBtn: document.getElementById('show-review-btn'),
    showAuthBtn: document.getElementById('show-auth-btn'),

    // === FISZKA I PRZYCISKI WIDOKU NAUKI ===
    newCount: document.getElementById('new-count'),
    learnedCount: document.getElementById('learned-count'),
    reviewCount: document.getElementById('review-count'),
    flashcard: document.getElementById('flashcard'),
    cardRank: document.getElementById('card-rank'),
    cardItalian: document.getElementById('card-italian'),
    cardPolish: document.getElementById('card-polish'),
    cardExampleIt: document.getElementById('card-example-it'),
    cardExamplePl: document.getElementById('card-example-pl'),
    showAnswerBtn: document.getElementById('show-answer-btn'),
    difficultyButtons: document.getElementById('difficulty-buttons'),
    startNewSessionEarlyBtn: document.getElementById('start-new-session-early'),

    // === MODAL AUTENTYKACJI (AUTH) ===
    authModal: document.getElementById('auth-modal'),
    authModalTitle: document.getElementById('auth-modal-title'),
    authForm: document.getElementById('auth-form'),
    resetPasswordForm: document.getElementById('reset-password-form'),
    backToLoginLink: document.getElementById('back-to-login-link'),
    forgotPasswordLink: document.getElementById('forgot-password-link'),
    loginBtn: document.getElementById('login-btn'),
    registerBtn: document.getElementById('register-btn'),
    logoutBtn: document.getElementById('logout-btn'),
    resendConfirmBtn: document.getElementById('resend-confirm-btn'),
    userInfo: document.getElementById('user-info'),
    userEmailDisplay: document.getElementById('user-email-display'),
    authErrorMessage: document.getElementById('auth-error-message'),
    authSuccessMessage: document.getElementById('auth-success-message'),

    // === MODAL TALII (DECKS) ===
    decksList: document.getElementById('decks-list'),
    addDeckForm: document.getElementById('add-deck-form'),
};