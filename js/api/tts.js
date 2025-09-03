// js/api/tts.js
import { state, setCurrentAudio, setSpeechReady } from '../state.js';

export function ensureSpeechReady(callback) {
    if (state.speechReady) {
        if (callback) callback();
        return;
    }
    let executed = false;
    const tryLoadVoices = () => {
        if (executed) return;
        const voices = state.synth.getVoices();
        if (voices.length > 0) {
            const italianVoices = voices.filter(voice => voice.lang.startsWith('it'));
            setSpeechReady(true, italianVoices);
            executed = true;
            if (callback) callback();
        }
    };

    if (state.synth.onvoiceschanged !== undefined) {
        state.synth.onvoiceschanged = tryLoadVoices;
    }
    tryLoadVoices(); // Initial attempt
    setTimeout(tryLoadVoices, 250); // Fallback
}


export async function speak(text, lang = 'it-IT', rate = 1.0, onEndCallback) {
    if (!text) {
        if (onEndCallback) onEndCallback();
        return;
    }

    if (state.currentAudio && !state.currentAudio.paused) {
        state.currentAudio.pause();
        setCurrentAudio(null);
    }
    if (state.synth.speaking) state.synth.cancel();

    // Wersja z użyciem funkcji Netlify (jeśli masz skonfigurowaną)
    // Jeśli nie, odkomentuj kod poniżej dla Web Speech API
    try {
        const response = await fetch('/.netlify/functions/get-speech', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, lang, rate })
        });

        const data = await response.json();
        
        if (response.ok && data.audioContent) {
            const audio = new Audio("data:audio/mp3;base64," + data.audioContent);
            setCurrentAudio(audio);
            audio.play();
            audio.onended = () => {
                if (onEndCallback) onEndCallback();
                setCurrentAudio(null);
            };
        } else {
            console.error('Błąd odpowiedzi z funkcji serwerowej:', data);
            if (onEndCallback) onEndCallback();
        }
    } catch (error) {
        console.error('Błąd podczas łączenia z funkcją serwerową, używam Web Speech API:', error);
        // Fallback do Web Speech API
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = rate;
        if (state.italianVoices.length > 0) {
            utterance.voice = state.italianVoices[0]; // Użyj pierwszego dostępnego głosu włoskiego
        }
        utterance.onend = onEndCallback;
        state.synth.speak(utterance);
    }
}