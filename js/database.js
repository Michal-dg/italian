// js/database.js
import { DB_NAME, DB_VERSION } from './config.js';

function idbRequest(request) {
    return new Promise((resolve, reject) => {
        if (!request) return reject("Request is undefined");
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('decks')) {
                const deckStore = db.createObjectStore('decks', { keyPath: 'id', autoIncrement: true });
                deckStore.createIndex('name', 'name', { unique: true });
            }
            if (!db.objectStoreNames.contains('words')) {
                const wordStore = db.createObjectStore('words', { keyPath: 'id', autoIncrement: true });
                wordStore.createIndex('deckId', 'deckId', { unique: false });
            }
            if (!db.objectStoreNames.contains('app_data')) {
                 db.createObjectStore('app_data', { keyPath: 'key' });
            }
            if (!db.objectStoreNames.contains('user_stories')) {
                 db.createObjectStore('user_stories', { keyPath: 'id', autoIncrement: true });
            }
        };
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject('IndexedDB error: ' + event.target.error);
    });
}

export function getTransaction(db, storeName, mode = 'readonly') {
    return db.transaction(storeName, mode).objectStore(storeName);
}

export async function getAppData(db, key) {
    const store = getTransaction(db, 'app_data');
    const result = await idbRequest(store.get(key));
    return result ? result.value : undefined;
}

export async function setAppData(db, key, value) {
    const store = getTransaction(db, 'app_data', 'readwrite');
    await idbRequest(store.put({ key, value }));
}

export async function getAllWordsByDeckId(db, deckId) {
    if (!deckId) return [];
    const wordStore = getTransaction(db, 'words');
    const index = wordStore.index('deckId');
    return await idbRequest(index.getAll(deckId));
}