// --- BAZA DANYCH SŁÓWEK ---
let slowka = [
    { hiszpanski: 'Hola', polski: 'Cześć', poziom: 1, dataNastepnejPowtorki: new Date() },
    { hiszpanski: 'Gracias', polski: 'Dziękuję', poziom: 1, dataNastepnejPowtorki: new Date() },
    { hiszpanski: 'Adiós', polski: 'Żegnaj', poziom: 1, dataNastepnejPowtorki: new Date() },
    { hiszpanski: 'Por favor', polski: 'Proszę', poziom: 1, dataNastepnejPowtorki: new Date() },
    { hiszpanski: 'Sí', polski: 'Tak', poziom: 1, dataNastepnejPowtorki: new Date() },
    { hiszpanski: 'No', polski: 'Nie', poziom: 1, dataNastepnejPowtorki: new Date() },
    { hiszpanski: 'Agua', polski: 'Woda', poziom: 1, dataNastepnejPowtorki: new Date() },
    { hiszpanski: 'Comida', polski: 'Jedzenie', poziom: 1, dataNastepnejPowtorki: new Date() },
];

// --- POPRAWKA Z POPRZEDNIEJ ROZMOWY ---
// Ta część kodu uruchamia się tylko wtedy, gdy nie ma zapisanych postępów.
function inicjalizujDomyslneSlowka() {
    slowka.forEach(s => s.dataNastepnejPowtorki.setHours(0, 0, 0, 0));
}

let aktualneSlowko = null;

// --- REFERENCJE DO ELEMENTÓW HTML ---
const slowkoHiszpanskieEl = document.getElementById('slowko-hiszpanskie');
const odpowiedzUzytkownikaEl = document.getElementById('odpowiedz-uzytkownika');
const sprawdzBtn = document.getElementById('sprawdz-btn');
const wymowaBtn = document.getElementById('wymowa-btn');
const wynikEl = document.getElementById('wynik');


// --- NOWE FUNKCJE: ZAPIS I WCZYTYWANIE POSTĘPÓW ---

/**
 * Zapisuje aktualną listę słówek wraz z postępami w pamięci przeglądarki.
 */
function zapiszPostepy() {
    localStorage.setItem('postepNaukiHiszpanskiego', JSON.stringify(slowka));
}

/**
 * Wczytuje postępy z pamięci przeglądarki, jeśli istnieją.
 */
function wczytajPostepy() {
    const zapisanePostepy = localStorage.getItem('postepNaukiHiszpanskiego');
    if (zapisanePostepy) {
        slowka = JSON.parse(zapisanePostepy);
        // Ważne: JSON nie przechowuje dat jako obiekty Date, tylko jako tekst.
        // Musimy je ponownie przekonwertować na prawdziwe daty.
        slowka.forEach(s => {
            s.dataNastepnejPowtorki = new Date(s.dataNastepnejPowtorki);
        });
    } else {
        // Jeśli nie ma zapisanych postępów (pierwsze uruchomienie), inicjalizujemy domyślną listę.
        inicjalizujDomyslneSlowka();
    }
}


// --- GŁÓWNA LOGIKA APLIKACJI (ZMIANY ZAZNACZONE) ---

function wyswietlNoweSlowko() {
    const dzisiaj = new Date();
    dzisiaj.setHours(0, 0, 0, 0); 

    const doNauki = slowka.filter(s => new Date(s.dataNastepnejPowtorki) <= dzisiaj);

    if (doNauki.length > 0) {
        aktualneSlowko = doNauki[Math.floor(Math.random() * doNauki.length)];
        slowkoHiszpanskieEl.textContent = aktualneSlowko.hiszpanski;
        wynikEl.textContent = '';
        odpowiedzUzytkownikaEl.value = '';
        odpowiedzUzytkownikaEl.focus();
    } else {
        slowkoHiszpanskieEl.textContent = 'Gratulacje!';
        odpowiedzUzytkownikaEl.style.display = 'none';
        sprawdzBtn.style.display = 'none';
        wynikEl.textContent = 'Na dzisiaj wszystko powtórzone!';
    }
}

function sprawdzOdpowiedz() {
    if (!aktualneSlowko) return;

    const odpowiedz = odpowiedzUzytkownikaEl.value.trim().toLowerCase();
    const poprawnaOdpowiedz = aktualneSlowko.polski.toLowerCase();

    const data = new Date();
    if (odpowiedz === poprawnaOdpowiedz) {
        aktualneSlowko.poziom++;
        wynikEl.textContent = 'Poprawnie!';
        wynikEl.className = 'poprawnie';
        data.setDate(data.getDate() + Math.pow(aktualneSlowko.poziom, 2));
    } else {
        aktualneSlowko.poziom = 1;
        wynikEl.textContent = `Błąd. Poprawna odpowiedź: ${aktualneSlowko.polski}`;
        wynikEl.className = 'niepoprawnie';
        data.setDate(data.getDate() + 1);
    }
    aktualneSlowko.dataNastepnejPowtorki = data;

    // --- DODANA LINIA ---
    // Po każdej odpowiedzi zapisujemy postępy!
    zapiszPostepy();

    setTimeout(wyswietlNoweSlowko, 1500);
}

function mow() {
    if (!aktualneSlowko || !('speechSynthesis' in window)) {
        alert('Twoja przeglądarka nie wspiera syntezatora mowy.');
        return;
    }
    const utterance = new SpeechSynthesisUtterance(aktualneSlowko.hiszpanski);
    utterance.lang = 'es-ES';
    window.speechSynthesis.speak(utterance);
}

// --- NASŁUCHIWANIE NA ZDARZENIA ---
sprawdzBtn.addEventListener('click', sprawdzOdpowiedz);
wymowaBtn.addEventListener('click', mow);
odpowiedzUzytkownikaEl.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        sprawdzOdpowiedz();
    }
});

// --- INICJALIZACJA APLIKACJI (ZMIENIONY BLOK) ---

// Najpierw próbujemy wczytać postępy z pamięci
wczytajPostepy();
// Dopiero potem wyświetlamy pierwsze słówko (albo ekran gratulacyjny)
wyswietlNoweSlowko();