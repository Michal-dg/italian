// js/ui/stories.js
import { state, setCurrentAudio } from '../state.js';
import { elements } from './domElements.js';
import { getTransaction, setAppData } from '../database.js';
import { openModal } from './modals.js';
import { speak } from '../api/tts.js';

let storySentences = [];
let currentSentenceIndex = 0;
let isStoryPlaying = false;

function playNextSentence() {
    if (!isStoryPlaying || currentSentenceIndex >= storySentences.length) {
        isStoryPlaying = false;
        elements.listenFullStoryBtn.querySelector('.play-icon').classList.remove('hidden');
        elements.listenFullStoryBtn.querySelector('.stop-icon').classList.add('hidden');
        return;
    }
    const sentence = storySentences[currentSentenceIndex].trim();
    if (sentence) {
        speak(sentence, 'it-IT', state.storySpeechRate, () => {
            currentSentenceIndex++;
            playNextSentence();
        });
    } else {
        currentSentenceIndex++;
        playNextSentence();
    }
}


async function renderStoriesList() {
    const store = getTransaction(state.db, 'user_stories');
    const stories = await new Promise(res => store.getAll().onsuccess = e => res(e.target.result));
    
    elements.storiesList.innerHTML = '';
    if (stories.length === 0) {
        elements.storiesList.innerHTML = `<p class="text-center text-slate-500 p-8">Twoja biblioteka jest pusta. Dodaj opowiadanie z pliku .txt</p>`;
        return;
    }

    stories.forEach(story => {
        const storyEl = document.createElement('div');
        storyEl.className = 'flex justify-between items-center p-3 hover:bg-slate-100 rounded-lg cursor-pointer';
        storyEl.innerHTML = `<p class="truncate pr-4">${story.title}</p><button class="delete-story-btn text-slate-400 hover:text-red-500 transition-colors flex-shrink-0">&times;</button>`;
        
        storyEl.addEventListener('click', (e) => {
            if (!e.target.closest('.delete-story-btn')) {
                elements.storyViewerTitle.textContent = story.title;
                elements.storyViewerContent.textContent = story.content;
                openModal(elements.storyViewerModal);
            }
        });

        storyEl.querySelector('.delete-story-btn').addEventListener('click', async (e) => {
            e.stopPropagation();
            if (confirm(`Czy na pewno chcesz usunąć opowiadanie "${story.title}"?`)) {
                const deleteStore = getTransaction(state.db, 'user_stories', 'readwrite');
                await new Promise(res => deleteStore.delete(story.id).onsuccess = res);
                await renderStoriesList();
            }
        });
        elements.storiesList.appendChild(storyEl);
    });
}

export function initStories() {
    elements.showStoriesBtn.addEventListener('click', async () => {
        await renderStoriesList();
        openModal(elements.storiesModal);
    });
    
    elements.addStoryBtn.addEventListener('click', () => elements.storyUploadInput.click());

    elements.storyUploadInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file && file.name.endsWith('.txt')) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const store = getTransaction(state.db, 'user_stories', 'readwrite');
                await new Promise(res => store.add({ title: file.name, content: e.target.result }).onsuccess = res);
                await renderStoriesList();
            };
            reader.readAsText(file);
        }
        event.target.value = '';
    });

    elements.listenFullStoryBtn.addEventListener('click', () => {
        const playIcon = elements.listenFullStoryBtn.querySelector('.play-icon');
        const stopIcon = elements.listenFullStoryBtn.querySelector('.stop-icon');
        if (isStoryPlaying) {
            isStoryPlaying = false;
            if (state.currentAudio) state.currentAudio.pause();
            state.synth.cancel();
            playIcon.classList.remove('hidden');
            stopIcon.classList.add('hidden');
        } else {
            const text = elements.storyViewerContent.textContent;
            if (text) {
                isStoryPlaying = true;
                storySentences = text.match(/[^.!?]+[.!?]+/g) || [text];
                currentSentenceIndex = 0;
                playIcon.classList.add('hidden');
                stopIcon.classList.remove('hidden');
                playNextSentence();
            }
        }
    });
    
    elements.speedSlider.addEventListener('input', (e) => {
        state.storySpeechRate = parseFloat(e.target.value);
    });

    elements.speedSlider.addEventListener('change', (e) => {
        setAppData(state.db, 'speechRate', parseFloat(e.target.value));
    });

    elements.uploadStoryBgBtn.addEventListener('click', () => elements.storyBgUploadInput.click());
    elements.storyBgUploadInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const imageDataUrl = e.target.result;
                elements.storyViewerBgContainer.style.backgroundImage = `url('${imageDataUrl}')`;
                await setAppData(state.db, 'storyViewerBg', imageDataUrl);
            };
            reader.readAsDataURL(file);
        }
        event.target.value = '';
    });
}