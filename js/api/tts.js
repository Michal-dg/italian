// js/api/tts.js
import { state, setCurrentAudio, setSpeechReady } from '../state.js';

// ❗️ NOWOŚĆ: Prosta funkcja do wykrywania urządzeń mobilnych
function isMobileDevice() {
    // Sprawdza, czy w nazwie przeglądarki znajdują się typowe dla telefonów słowa
    return /Mobi|Android/i.test(navigator.userAgent);
}

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
    tryLoadVoices();
    setTimeout(tryLoadVoices, 250);
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

    try {
        // Krok 1: Zawsze próbujemy połączyć się z naszym API (funkcją Netlify)
        const response = await fetch('/.netlify/functions/get-speech', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, lang, rate })
        });

        if (!response.ok) {
            // Jeśli serwer zwrócił błąd (np. 4xx, 5xx), rzucamy błąd, aby przejść do `catch`
            throw new Error(`Błąd serwera: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.audioContent) {
            // Sukces: odtwarzamy dźwięk z API
            const audio = new Audio("data:audio/mp3;base64," + data.audioContent);
            setCurrentAudio(audio);
            audio.play().catch(e => console.error("Błąd odtwarzania audio:", e));
            audio.onended = () => {
                if (onEndCallback) onEndCallback();
                setCurrentAudio(null);
            };
        } else {
            throw new Error('Brak zawartości audio w odpowiedzi z serwera.');
        }

    } catch (error) {
        console.error('Błąd podczas łączenia z funkcją serwerową:', error);

        // ❗️ ZMIANA: Sprawdzamy, czy użyć zapasowego syntezatora
        if (isMobileDevice()) {
            // Na telefonie NIE używamy zapasowego głosu.
            console.warn('Urządzenie mobilne wykryte. Pomijanie zapasowego syntezatora mowy.');
            if (onEndCallback) onEndCallback(); // Zapewniamy, że aplikacja będzie kontynuować działanie
        } else {
            // Na komputerze (dla dewelopmentu) wciąż możemy używać zapasowego głosu.
            console.log('Używam zapasowego syntezatora mowy (Web Speech API).');
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;
            utterance.rate = rate;
            if (state.italianVoices.length > 0) {
                utterance.voice = state.italianVoices[0];
            }
            utterance.onend = onEndCallback;
            state.synth.speak(utterance);
        }
    }
}