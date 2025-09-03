// js/ui/auth.js
import { supabaseClient } from '../api/supabase.js';
import { elements } from './domElements.js';
import { openModal, closeModal } from './modals.js';
import { resetSessionUI } from './cards.js';
import { setActiveDeckId, setWords, setQueues, setCurrentCard } from '../state.js';

// Pobieramy wszystkie potrzebne elementy z modala
const resendConfirmBtn = document.getElementById('resend-confirm-btn');
const forgotPasswordLink = document.getElementById('forgot-password-link');
const resetPasswordForm = document.getElementById('reset-password-form');
const backToLoginLink = document.getElementById('back-to-login-link');
const authModalTitle = document.getElementById('auth-modal-title');


function updateAuthUI(user) {
    if (user) {
        // Użytkownik zalogowany
        elements.authForm.classList.add('hidden');
        elements.authSuccessMessage.classList.add('hidden');
        elements.userInfo.classList.remove('hidden');
        elements.userEmailDisplay.textContent = user.email;
        console.log("Użytkownik zalogowany:", user.email);
    } else {
        // Użytkownik wylogowany
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

async function handlePasswordResetRequest(e) {
    e.preventDefault();
    const email = document.getElementById('reset-email').value;
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
    });

    resetPasswordForm.classList.add('hidden');
    elements.authSuccessMessage.classList.remove('hidden');
    
    if (error) {
        elements.authSuccessMessage.innerHTML = `<p class="text-red-600">Błąd: ${error.message}</p>`;
    } else {
        elements.authSuccessMessage.innerHTML = '<p>Jeśli konto z tym adresem e-mail istnieje, wysłaliśmy na nie instrukcje resetowania hasła.</p>';
    }
}

// ❗️ OTO BRAKUJĄCA FUNKCJA, TERAZ POPRAWNIE DODANA I WYEKSPORTOWANA ❗️
export async function handlePasswordUpdate(e) {
    e.preventDefault();
    const updatePasswordModal = document.getElementById('update-password-modal');
    const updatePasswordForm = document.getElementById('update-password-form');
    const updatePasswordMessage = document.getElementById('update-password-message');
    const newPassword = document.getElementById('new-password').value;

    if (newPassword.length < 6) {
        updatePasswordMessage.textContent = 'Hasło musi mieć co najmniej 6 znaków.';
        updatePasswordMessage.className = 'text-sm text-red-500';
        updatePasswordMessage.classList.remove('hidden');
        return;
    }

    const { error } = await supabaseClient.auth.updateUser({ password: newPassword });

    updatePasswordForm.classList.add('hidden');
    updatePasswordMessage.classList.remove('hidden');

    if (error) {
        updatePasswordMessage.textContent = `Błąd: ${error.message}`;
        updatePasswordMessage.className = 'text-sm text-red-500';
    } else {
        updatePasswordMessage.innerHTML = 'Hasło zostało pomyślnie zmienione! Możesz teraz zamknąć to okno i zalogować się ponownie.';
        updatePasswordMessage.className = 'text-sm text-green-600';
    }
}

export function initAuth() {
    elements.showAuthBtn.addEventListener('click', async () => {
        resetPasswordForm.classList.add('hidden');
        elements.authSuccessMessage.classList.add('hidden');
        elements.userInfo.classList.add('hidden');
        elements.authForm.classList.remove('hidden');
        authModalTitle.textContent = 'Zaloguj się lub zarejestruj';
        resendConfirmBtn.classList.add('hidden');
        elements.authErrorMessage.classList.add('hidden');

        const { data: { user } } = await supabaseClient.auth.getUser();
        updateAuthUI(user);
        openModal(elements.authModal);
    });
    
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        elements.authForm.classList.add('hidden');
        resetPasswordForm.classList.remove('hidden');
        authModalTitle.textContent = 'Zresetuj hasło';
    });

    backToLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        resetPasswordForm.classList.add('hidden');
        elements.authForm.classList.remove('hidden');
        authModalTitle.textContent = 'Zaloguj się lub zarejestruj';
    });

    elements.loginBtn.addEventListener('click', handleLogin);
    elements.registerBtn.addEventListener('click', handleRegister);
    elements.logoutBtn.addEventListener('click', handleLogout);
    resendConfirmBtn.addEventListener('click', handleResendConfirmation);
    resetPasswordForm.addEventListener('submit', handlePasswordResetRequest);

    supabaseClient.auth.onAuthStateChange((event, session) => {
        updateAuthUI(session ? session.user : null);
    });
}