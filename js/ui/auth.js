// js/ui/auth.js
import { supabaseClient } from '../api/supabase.js';
import { elements } from './domElements.js';
import { openModal, closeModal } from './modals.js';
import { resetSessionUI } from './cards.js';
import { setActiveDeckId, setWords, setQueues, setCurrentCard } from '../state.js';

// Pobieramy elementy, których nie ma w `domElements`, bo są specyficzne dla tego modala
const resendConfirmBtn = document.getElementById('resend-confirm-btn');
const forgotPasswordLink = document.getElementById('forgot-password-link');

function updateAuthUI(user) {
    if (user) {
        // Użytkownik zalogowany: UKRYJ formularz, POKAŻ info o userze
        elements.authForm.classList.add('hidden');
        elements.authSuccessMessage.classList.add('hidden');
        elements.userInfo.classList.remove('hidden');
        elements.userEmailDisplay.textContent = user.email;
        console.log("Użytkownik zalogowany:", user.email);
    } else {
        // Użytkownik wylogowany: POKAŻ formularz, UKRYJ info o userze
        elements.authForm.classList.remove('hidden');
        elements.authSuccessMessage.classList.add('hidden');
        elements.userInfo.classList.add('hidden');
        elements.authForm.reset();
        elements.decksList.innerHTML = '<p class="text-center text-slate-500 p-4">Zaloguj się, aby zobaczyć swoje talie.</p>';
        
        setActiveDeckId(null);
        setWords([]);
        setQueues([], []);
        setCurrentCard(null);
        resetSessionUI();
        console.log("Użytkownik wylogowany. Stan aplikacji zresetowany.");
    }
}

async function handleLogin(e) {
    e.preventDefault();
    elements.authErrorMessage.classList.add('hidden');
    resendConfirmBtn.classList.add('hidden');

    const email = elements.authForm.email.value;
    const password = elements.authForm.password.value;
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

    if (error) {
        if (error.message.includes('Email not confirmed')) {
            elements.authErrorMessage.textContent = 'Adres e-mail nie został jeszcze potwierdzony. Sprawdź swoją skrzynkę.';
            resendConfirmBtn.classList.remove('hidden');
        } else {
            elements.authErrorMessage.textContent = 'Nieprawidłowy e-mail lub hasło.';
        }
        elements.authErrorMessage.classList.remove('hidden');
    } else {
        elements.authForm.reset();
        closeModal(elements.authModal);
    }
}

async function handleResendConfirmation(e) {
    e.preventDefault();
    const email = elements.authForm.email.value;
    if (!email) {
        elements.authErrorMessage.textContent = 'Wpisz swój e-mail powyżej, aby ponownie wysłać link.';
        elements.authErrorMessage.classList.remove('hidden');
        return;
    }
    const { error } = await supabaseClient.auth.resend({ type: 'signup', email: email });
    if (error) {
        elements.authErrorMessage.textContent = `Błąd: ${error.message}`;
        elements.authErrorMessage.classList.remove('hidden');
    } else {
        resendConfirmBtn.classList.add('hidden');
        elements.authErrorMessage.classList.add('hidden');
        elements.authForm.classList.add('hidden');
        elements.authSuccessMessage.classList.remove('hidden');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    elements.authErrorMessage.classList.add('hidden');
    resendConfirmBtn.classList.add('hidden');
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
    elements.showAuthBtn.addEventListener('click', async () => { // ZMIANA: dodano 'async'
        const { data: { user } } = await supabaseClient.auth.getUser(); // ZMIANA: dodano 'await'
        updateAuthUI(user);
        openModal(elements.authModal);
    });

    elements.loginBtn.addEventListener('click', handleLogin);
    elements.registerBtn.addEventListener('click', handleRegister);
    elements.logoutBtn.addEventListener('click', handleLogout);
    resendConfirmBtn.addEventListener('click', handleResendConfirmation);
    
    // Na razie ukrywamy logikę resetowania hasła, aby nie komplikować
    // forgotPasswordLink.addEventListener('click', handlePasswordResetRequest); 
    
    supabaseClient.auth.onAuthStateChange((event, session) => {
        updateAuthUI(session ? session.user : null);
    });
}