document.addEventListener('DOMContentLoaded', () => {
    
    // --- INICJALIZACJA ---
    const SUPABASE_URL = 'https://elneujplpdoruvrvzvzd.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsbmV1anBscGRvcnV2cnZ6dnpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4MDQ3NjYsImV4cCI6MjA3MjM4MDc2Nn0.YIJYmt8KeiXH0iFS_Pk6ErIkyKZpPDsi29G83VItjCc';
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Klient Supabase został pomyślnie zainicjowany.');

    // --- SELEKTORY DOM ---
    const mainContent = document.getElementById('main-content');
    const welcomeView = document.getElementById('welcome-view');
    const decksListEl = document.getElementById('decks-list');
    const authModal = document.getElementById('auth-modal');
    const showAuthBtn = document.getElementById('show-auth-btn');
    const authForm = document.getElementById('auth-form');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const authErrorMessage = document.getElementById('auth-error-message');
    const authSuccessMessage = document.getElementById('auth-success-message');
    const userInfo = document.getElementById('user-info');
    const userEmailDisplay = document.getElementById('user-email-display');
    const authIconUser = document.getElementById('auth-icon-user');
    const authIconLogout = document.getElementById('auth-icon-logout');
    const showDecksBtn = document.getElementById('show-decks-btn');
    const decksModal = document.getElementById('decks-modal');
    const addDeckForm = document.getElementById('add-deck-form');

    // --- FUNKCJE POMOCNICZE ---
    function openModal(modal) {
        if (!modal) return;
        modal.classList.remove('pointer-events-none', 'opacity-0');
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) modalContent.classList.remove('scale-95');
    }
    function closeModal(modal) {
        if (!modal) return;
        modal.classList.add('pointer-events-none', 'opacity-0');
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) modalContent.classList.add('scale-95');
    }

    // --- FUNKCJE DANYCH (SUPABASE) ---
    async function fetchDecksForCurrentUser() {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (user) {
            const { data: decks, error } = await supabaseClient
                .from('decks')
                .select('*')
                .eq('user_id', user.id);
            if (error) {
                console.error('Błąd podczas pobierania talii:', error);
                return [];
            }
            return decks || [];
        }
        return [];
    }
    
    async function addDeckForCurrentUser(deckName) {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (user) {
            const { data, error } = await supabaseClient
                .from('decks')
                .insert([{ name: deckName, user_id: user.id }])
                .select();
            if (error) {
                console.error("Błąd podczas dodawania talii:", error);
                alert("Nie udało się dodać talii. Spróbuj ponownie.");
                return null;
            }
            return data[0];
        }
        return null;
    }

    // --- FUNKCJE RENDERUJĄCE ---
    function renderDecksList(decks) {
        decksListEl.innerHTML = '';
        if (!decks || decks.length === 0) {
            decksListEl.innerHTML = '<p class="text-center text-slate-500 p-4">Nie masz jeszcze żadnych talii. Stwórz nową.</p>';
            return;
        }
        for (const deck of decks) {
            const count = 0; // TODO: W przyszłości zliczać słówka dla danej talii
            const deckEl = document.createElement('div');
            deckEl.className = `flex justify-between items-center p-3 hover:bg-slate-100 rounded-lg cursor-pointer`;
            deckEl.innerHTML = `<div class="deck-name-container grow pr-2"><p class="font-bold">${deck.name} <span class="font-normal text-slate-500 text-sm">(${count} parole)</span></p></div><div><button title="Edytuj">✏️</button><button title="Zobacz słówka">👁️</button><button title="Usuń">&times;</button></div>`;
            decksListEl.appendChild(deckEl);
        }
    }
    
    // --- LOGIKA I EVENT LISTENERY ---
    showAuthBtn.addEventListener('click', () => {
        authForm.classList.remove('hidden');
        authSuccessMessage.classList.add('hidden');
        authErrorMessage.classList.add('hidden');
        authForm.reset();
        openModal(authModal);
    });
    
    showDecksBtn.addEventListener('click', async () => {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) {
            alert("Musisz być zalogowany, aby zobaczyć swoje talie.");
            openModal(authModal);
            return;
        }
        const decks = await fetchDecksForCurrentUser();
        renderDecksList(decks);
        openModal(decksModal);
    });

    document.querySelectorAll('.modal').forEach(modal => {
        const closeBtn = modal.querySelector('.close-modal-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => closeModal(modal));
        }
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });

    loginBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        authErrorMessage.classList.add('hidden');
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;
        const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) {
            authErrorMessage.textContent = error.message;
            authErrorMessage.classList.remove('hidden');
        } else {
            authForm.reset();
            closeModal(authModal);
        }
    });

    registerBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        authErrorMessage.classList.add('hidden');
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;
        const { error } = await supabaseClient.auth.signUp({ email, password });
        if (error) {
            authErrorMessage.textContent = error.message;
            authErrorMessage.classList.remove('hidden');
        } else {
            authForm.classList.add('hidden');
            authSuccessMessage.classList.remove('hidden');
        }
    });

    logoutBtn.addEventListener('click', async () => {
        await supabaseClient.auth.signOut();
        closeModal(authModal);
    });
    
    addDeckForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newDeckNameInput = document.getElementById('new-deck-name');
        const deckName = newDeckNameInput.value.trim();
        if (deckName) {
            const newDeck = await addDeckForCurrentUser(deckName);
            if (newDeck) {
                const currentDecks = await fetchDecksForCurrentUser();
                renderDecksList(currentDecks);
                newDeckNameInput.value = '';
            }
        }
    });

    supabaseClient.auth.onAuthStateChange(async (event, session) => {
    const welcomeView = document.getElementById('welcome-view');
    const learningView = document.getElementById('learning-state');

    if (session) { 
        // Użytkownik jest zalogowany
        authIconUser.classList.add('hidden');
        authIconLogout.classList.remove('hidden');
        userInfo.classList.remove('hidden');
        userEmailDisplay.textContent = session.user.email;
        
        if(welcomeView) welcomeView.classList.add('hidden');
        if(learningView) learningView.classList.remove('hidden');

        const decks = await fetchDecksForCurrentUser();
        // TODO: Dalsza logika, np. co zrobić, gdy nie ma talii
        
    } else { 
        // Użytkownik jest wylogowany
        authIconUser.classList.remove('hidden');
        authIconLogout.classList.add('hidden');
        userInfo.classList.add('hidden');

        if(welcomeView) welcomeView.classList.remove('hidden');
        if(learningView) learningView.classList.add('hidden');
    }
  });
});