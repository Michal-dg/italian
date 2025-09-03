// js/ui/review.js
import { state } from '../state.js';
import { elements } from './domElements.js';
import { getTransaction } from '../database.js';
import { openModal, closeModal } from './modals.js';
import { formatDate } from '../utils.js';
import { startSession } from './cards.js';

// --- Logika Testu ---

function startTest() {
    elements.learningState.classList.add('hidden');
    elements.summaryState.classList.add('hidden');
    elements.testState.classList.remove('hidden');
    elements.testSummaryState.classList.add('hidden');
    
    state.currentTestQuestionIndex = 0;
    state.testScore = 0;
    state.testWords.sort(() => Math.random() - 0.5);
    
    displayTestQuestion();
}

function displayTestQuestion() {
    if (state.currentTestQuestionIndex >= state.testWords.length) {
        showTestSummary();
        return;
    }

    document.getElementById('test-current-question').textContent = state.currentTestQuestionIndex + 1;
    document.getElementById('test-total-questions').textContent = state.testWords.length;
    document.getElementById('test-next-btn').classList.add('hidden');

    const currentWord = state.testWords[state.currentTestQuestionIndex];
    elements.testState.querySelector('#test-question').textContent = currentWord.italian;

    const answersEl = elements.testState.querySelector('#test-answers');
    answersEl.innerHTML = '';
    
    const otherWords = state.words.filter(w => w.id !== currentWord.id);
    let options = [currentWord];
    while (options.length < 4 && otherWords.length > 0) {
        const randomIndex = Math.floor(Math.random() * otherWords.length);
        options.push(otherWords.splice(randomIndex, 1)[0]);
    }
    options.sort(() => Math.random() - 0.5);

    options.forEach(option => {
        const button = document.createElement('button');
        button.className = "p-3 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors";
        button.textContent = option.polish;
        button.onclick = () => checkTestAnswer(option.id === currentWord.id, button, options.map(o => o.id === currentWord.id));
        answersEl.appendChild(button);
    });
}

function checkTestAnswer(isCorrect, clickedButton) {
    const buttons = elements.testState.querySelectorAll('#test-answers button');
    const correctWord = state.testWords[state.currentTestQuestionIndex];

    buttons.forEach(btn => {
        btn.disabled = true;
        if (btn.textContent === correctWord.polish) {
            btn.classList.add('!bg-green-200');
        }
    });

    if (isCorrect) {
        state.testScore++;
        clickedButton.classList.add('!bg-green-500', 'text-white');
    } else {
        clickedButton.classList.add('!bg-red-500', 'text-white');
    }
    document.getElementById('test-next-btn').classList.remove('hidden');
}

function showTestSummary() {
    elements.testState.classList.add('hidden');
    elements.testSummaryState.classList.remove('hidden');
    document.getElementById('test-score').textContent = state.testScore;
    document.getElementById('test-summary-total').textContent = state.testWords.length;
}


// --- Inicjalizacja Modułu Powtórek ---

async function handleReviewAction(e) {
    const btn = e.target;
    const isTest = btn.classList.contains('review-btn-test');
    const type = btn.dataset.type;
    const count = parseInt(btn.dataset.count, 10);

    const store = getTransaction(state.db, 'words');
    const allLearnedWords = (await new Promise(res => store.getAll().onsuccess = e => res(e.target.result)))
        .filter(w => w.learnedDate);
    
    let wordsToReview = [];
    if (type === 'last') {
        wordsToReview = allLearnedWords.sort((a, b) => new Date(b.learnedDate) - new Date(a.learnedDate)).slice(0, count);
    } else if (type === 'today') {
        const todayStr = formatDate(new Date());
        wordsToReview = allLearnedWords.filter(w => formatDate(new Date(w.learnedDate)) === todayStr);
    }
    
    if (isTest) {
        if (wordsToReview.length < 4) {
            alert("Potrzebujesz co najmniej 4 nauczonych słówek, aby rozpocząć test.");
            return;
        }
        state.testWords = wordsToReview;
        closeModal(elements.reviewModal);
        startTest();
    } else {
        if (wordsToReview.length === 0) {
            alert('Nie masz wystarczającej liczby słówek do powtórki.');
            return;
        }
        closeModal(elements.reviewModal);
        await startSession(wordsToReview);
    }
}


export function initReview() {
    elements.showReviewBtn.addEventListener('click', () => openModal(elements.reviewModal));
    
    elements.reviewModal.querySelectorAll('.review-btn-learn, .review-btn-test').forEach(btn => {
        btn.addEventListener('click', handleReviewAction);
    });

    document.getElementById('test-next-btn').addEventListener('click', () => {
        state.currentTestQuestionIndex++;
        displayTestQuestion();
    });

    document.getElementById('back-to-main-menu-btn').addEventListener('click', () => {
        elements.testSummaryState.classList.add('hidden');
        startSession();
    });
}