// js/ui/modals.js
import { state, setCurrentAudio } from '../state.js';
import { supabaseClient } from '../api/supabase.js'; // Dodajemy import klienta Supabase

export function openModal(modal) {
    modal.classList.remove('pointer-events-none', 'opacity-0');
    modal.querySelector('.modal-content').classList.remove('scale-95');
}

export function closeModal(modal) {
    modal.classList.add('pointer-events-none', 'opacity-0');
    modal.querySelector('.modal-content').classList.add('scale-95');
}

export function initModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        const closeModalButtons = modal.querySelectorAll('.close-modal-btn');
        
        const closeAction = () => {
            // ❗️ NOWA, INTELIGENTNA LOGIKA ❗️
            // Sprawdzamy, czy zamykamy okno resetowania hasła ORAZ czy w adresie URL jest token odzyskiwania
            if (modal.id === 'update-password-modal' && window.location.hash.includes('type=recovery')) {
                console.log('Proces resetowania hasła porzucony. Wylogowywanie...');
                supabaseClient.auth.signOut();
                // Czyścimy adres URL, aby po odświeżeniu strony okno nie pojawiło się ponownie
                window.history.replaceState(null, '', window.location.pathname + window.location.search);
            }
            
            // Logika specyficzna dla okna opowiadania
            if (modal.id === 'story-viewer-modal' && state.currentAudio) {
                state.currentAudio.pause();
                setCurrentAudio(null);
            }

            closeModal(modal); // Używamy naszej standardowej funkcji do zamknięcia okna
        };

        // Listener do zamykania przez kliknięcie w tło
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                if (modal.dataset.closeOnOutside !== 'false') {
                    closeAction(); // Wywołujemy naszą nową, inteligentną akcję zamykania
                }
            }
        });

        // Listener do zamykania przez przycisk "×"
        closeModalButtons.forEach(btn => {
            btn.addEventListener('click', closeAction);
        });
    });
}