// js/api/supabase.js
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config.js';

// Używamy globalnego obiektu 'supabase' zadeklarowanego w index.html
const { createClient } = window.supabase;

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);