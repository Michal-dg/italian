// js/ui/auth.js
import { supabaseClient } from '../api/supabase.js';
import { elements } from './domElements.js';
import { openModal, closeModal } from './modals.js';
import { resetSessionUI } from './cards.js';
import { setActiveDeckId, setWords, setQueues, setCurrentCard } from '../state.js';

function updateAuthUI(user) {
    if (user) {
        // Użytkownik zalogowany
        elements.authIconUser.classList.add('hidden');
        elements.authIconLogout.classList.remove('hidden');
        elements.authForm.classList.add('hidden');
        elements.authSuccessMessage.classList.add('hidden');
        elements.userInfo.classList.remove('hidden');
        elements.userEmailDisplay.textContent = user.email;
        console.log("Użytkownik zalogowany:", user.email);
    } else {
        // Użytkownik wylogowany
        elements.authIconUser.classList.remove('hidden');
        elements.authIconLogout.classList.add('hidden');
        elements.authForm.classList.remove('hidden');
        elements.authSuccessMessage.classList.add('hidden');
        elements.userInfo.classList.add('hidden');
        elements.authForm.reset();
        elements.decksList.innerHTML = '<p class="text-center text-slate-500 p-4">Zaloguj się, aby zobaczyć swoje talie.</p>';
        
        // Resetujemy stan w pamięci (w state.js)
        setActiveDeckId(null);
        setWords([]);
        setQueues([], []);
        setCurrentCard(null);

        // Resetujemy interfejs użytkownika do stanu początkowego
        resetSessionUI();

        console.log("Użytkownik wylogowany. Stan aplikacji zresetowany.");
    }
}

async function handleLogin(e) {
    e.preventDefault();
    elements.authErrorMessage.classList.add('hidden');
    const email = elements.authForm.email.value;
    const password = elements.authForm.password.value;
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
        elements.authErrorMessage.textContent = error.message;
        elements.authErrorMessage.classList.remove('hidden');
    } else {
        elements.authForm.reset();
        closeModal(elements.authModal);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    elements.authErrorMessage.classList.add('hidden');
    const email = elements.authForm.email.value;
    const password = elements.authForm.password.value;
    const { error } = await supabaseClient.auth.signUp({ email, password });
    if (error) {
        elements.authErrorMessage.textContent = error.message;
        elements.authErrorMessage.classList.remove('hidden');
    } else {
        elements.authForm.classList.add('hidden');
        elements.authSuccessMessage.classList.remove('hidden');
    }
}

async function handleLogout() {
    await supabaseClient.auth.signOut();
    closeModal(elements.authModal);
}

export function initAuth() {
    elements.showAuthBtn.addEventListener('click', () => {
        // Resetuje wygląd modala przed jego otwarciem
        elements.authForm.classList.remove('hidden');
        elements.authSuccessMessage.classList.add('hidden');
        elements.authErrorMessage.classList.add('hidden');
        elements.authForm.reset(); // Czyści wpisane dane

        openModal(elements.authModal);
    });

    elements.loginBtn.addEventListener('click', handleLogin);
    elements.registerBtn.addEventListener('click', handleRegister);
    elements.logoutBtn.addEventListener('click', handleLogout);

    supabaseClient.auth.onAuthStateChange((event, session) => {
        updateAuthUI(session ? session.user : null);
    });
}