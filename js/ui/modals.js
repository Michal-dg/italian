// js/ui/modals.js
import { state, setCurrentAudio } from '../state.js';

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
            // Zatrzymaj odtwarzanie opowiadania przy zamykaniu okna
            if (modal.id === 'story-viewer-modal' && state.currentAudio) {
                state.currentAudio.pause();
                setCurrentAudio(null);
            }
            closeModal(modal);
        };

        // Zamykanie po kliknięciu tła
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeAction();
            }
        });

        // Zamykanie po kliknięciu przycisku X
        closeModalButtons.forEach(btn => {
            btn.addEventListener('click', closeAction);
        });
    });
}