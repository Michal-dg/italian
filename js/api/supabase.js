// js/api/supabase.js
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config.js';

// Używamy globalnego obiektu 'supabase' zadeklarowanego w index.html
const { createClient } = window.supabase;

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);// js/api/supabase.js
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config.js';
const { createClient } = window.supabase;
export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// -- Operacje na Danych --

export async function fetchUserData() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return { decks: [], words: [] };

    const { data: decks, error: decksError } = await supabaseClient.from('decks').select('*').eq('user_id', user.id);
    if (decksError) console.error('Błąd pobierania talii:', decksError);

    const { data: words, error: wordsError } = await supabaseClient.from('words').select('*').eq('user_id', user.id);
    if (wordsError) console.error('Błąd pobierania słówek:', wordsError);

    return { decks: decks || [], words: words || [] };
}

export async function addDeck(name) {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabaseClient.from('decks').insert([{ name, user_id: user.id }]).select();
    if (error) { console.error('Błąd dodawania talii:', error); return null; }
    return data[0];
}

export async function updateWordProgress(word) {
    const { id, italian, polish, example_it, example_pl, deck_id, user_id, ...progressData } = word;
    const { error } = await supabaseClient.from('words').update(progressData).eq('id', id);
    if (error) console.error("Błąd aktualizacji słówka:", error);
}