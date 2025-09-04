// js/api/supabase.js

// Importujemy funkcję createClient BEZPOŚREDNIO z CDN, a nie z obiektu window.
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Importujemy nasze klucze z pliku konfiguracyjnego
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config.js';

// Dodajemy proste sprawdzenie, czy klucze zostały poprawnie wklejone w config.js
if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_ANON_KEY === 'TWOJ_KLUCZ_ANON_SUPABASE') {
    alert("BŁĄD: Klucze Supabase nie są poprawnie skonfigurowane w pliku js/config.js!");
    console.error("BŁĄD: Klucze Supabase nie są poprawnie skonfigurowane w pliku js/config.js!");
}

// Tworzymy i eksportujemy klienta Supabase
export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);