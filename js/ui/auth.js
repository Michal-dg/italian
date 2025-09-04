// js/ui/auth.js
import { supabaseClient } from '../api/supabase.js';
import { elements } from './domElements.js';
import { openModal, closeModal } from './modals.js';
import { setActiveDeckId, setWords, setQueues, setCurrentCard, setDecks } from '../state.js';

function updateAuthUI(user) {
    if (user) {
        elements.userInfo.classList.remove('hidden');
        elements.userEmailDisplay.textContent = user.email;
        elements.authIconUser.classList.add('hidden');
        elements.authIconLogout.classList.remove('hidden');
    } else {
        elements.userInfo.classList.add('hidden');
        elements.authIconUser.classList.remove('hidden');
        elements.authIconLogout.classList.add('hidden');
        
        // Reset stanu aplikacji po wylogowaniu
        setDecks([]);
        setWords([]);
        setActiveDeckId(null);
        setQueues([], []);
        setCurrentCard(null);

        elements.learningState.classList.add('hidden');
        elements.summaryState.classList.remove('hidden');
        elements.activeDeckName.textContent = '';
    }
}

// ... (reszta funkcji: handleLogin, handleRegister, handleLogout, etc. może być skopiowana z Twojego pliku `auth.js`)
// Poniżej uproszczona wersja initAuth dla spójności
export function initAuth() {
    elements.showAuthBtn.addEventListener('click', () => {
        const user = supabaseClient.auth.getUser();
        updateAuthUI(user);
        openModal(elements.authModal);
    });
    
    elements.loginBtn.addEventListener('click', async () => {
        const email = elements.authForm.email.value;
        const password = elements.authForm.password.value;
        const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) {
            elements.authErrorMessage.textContent = 'Nieprawidłowy e-mail lub hasło.';
            elements.authErrorMessage.classList.remove('hidden');
        } else {
            closeModal(elements.authModal);
        }
    });

    elements.registerBtn.addEventListener('click', async () => {
        // ... logika rejestracji ...
    });

    elements.logoutBtn.addEventListener('click', async () => {
        await supabaseClient.auth.signOut();
        closeModal(elements.authModal);
    });

    // Główny listener zmian autentykacji
    supabaseClient.auth.onAuthStateChange((event, session) => {
        updateAuthUI(session?.user);
    });
}