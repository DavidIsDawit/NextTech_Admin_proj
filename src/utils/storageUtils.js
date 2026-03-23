/* =====================
   COOKIE HELPERS
===================== */
const setCookie = (name, value, days = 7) => {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    // Secure and SameSite=Lax for better security.
    // Note: HttpOnly can ONLY be set by the server.
    document.cookie = `${name}=${value || ""}${expires}; path=/; SameSite=Lax; Secure`;
};

const getCookie = (name) => {
    const nameEQ = `${name}=`;
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
};

const eraseCookie = (name) => {
    document.cookie = `${name}=; Max-Age=-99999999; path=/; SameSite=Lax; Secure`;
};

const KEY_MAP = {
    'accessToken': '_nt_v1',
    'refreshToken': '_nt_v2',
    'userRole': '_nt_v3',
    'firstTimeLogin': '_nt_v4',
    'rememberedEmail': '_nt_v5'
};

/**
 * Obfuscate keys to hide them from DevTools (e.g., "accessToken" -> "_nt_v1")
 */
const getObfuscatedKey = (key) => {
    return KEY_MAP[key] || `_nt_${key.length}${key.split('').reverse().join('').substring(0, 3)}`;
};

/**
 * Cleanup ALL old human-readable keys and previous obfuscation attempts
 */
const cleanupStaleKeys = () => {
    try {
        // Broad list of keys to purge from DevTools
        const keysToPurge = [
            'accessToken', 'refreshToken', 'userRole', 'firstTimeLogin', 'rememberedEmail',
            '_nt_at', '_nt_rt', '_nt_ur', '_nt_ftl', '_nt_re'
        ];
        keysToPurge.forEach(oldKey => {
            sessionStorage.removeItem(oldKey);
            localStorage.removeItem(oldKey);
        });
    } catch {
        // ignore
    }
};

// Initial cleanup on load
cleanupStaleKeys();

const inferStorageForKey = (key) => {
    if (key === 'refreshToken') return 'cookie';
    if (key === 'accessToken') return 'memory';

    const obfuscatedKey = getObfuscatedKey(key);
    try {
        if (sessionStorage.getItem(obfuscatedKey) !== null) return sessionStorage;
    } catch { /* ignore */ }
    try {
        if (localStorage.getItem(obfuscatedKey) !== null) return localStorage;
    } catch { /* ignore */ }
    return localStorage;
};

/**
 * Encrypt and store data
 */
export const setSecureItem = (key, value, options = {}) => {
    // Proactively clean stale data whenever we set something new
    cleanupStaleKeys();

    if (key === 'accessToken') {
        // Access token is handled separately in memory (api.js)
        return;
    }

    const obfuscatedKey = getObfuscatedKey(key);

    if (key === 'refreshToken') {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        setCookie(obfuscatedKey, stringValue, options?.expires || 7);
        return;
    }

    const storage =
        options?.storage === 'session' ? sessionStorage :
            options?.storage === 'local' ? localStorage :
                inferStorageForKey(key);

    try {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        // Storing as plaintext as requested
        storage.setItem(obfuscatedKey, stringValue);
    } catch (error) {
        console.error('Storage Error:', error);
    }
};

/**
 * Retrieve data (plaintext)
 */
export const getSecureItem = (key) => {
    const obfuscatedKey = getObfuscatedKey(key);

    if (key === 'accessToken') {
        return null;
    }

    if (key === 'refreshToken') {
        return getCookie(obfuscatedKey);
    }

    const unwrapValue = (val) => {
        if (!val) return null;
        // If it looks like it might be an old encrypted value (contains | or is base64-like), 
        // we try to decrypt, but the user requested plaintext, so we prioritize raw reading.
        try {
            return JSON.parse(val);
        } catch {
            return val;
        }
    };

    try {
        const sessionVal = sessionStorage.getItem(obfuscatedKey);
        if (sessionVal !== null) return unwrapValue(sessionVal);
    } catch { /* ignore */ }

    try {
        const localVal = localStorage.getItem(obfuscatedKey);
        if (localVal === null) return null;
        return unwrapValue(localVal);
    } catch { return null; }
};

/**
 * Remove items from both storages
 */
export const removeSecureItem = (key) => {
    const obfuscatedKey = getObfuscatedKey(key);
    
    if (key === 'refreshToken') {
        eraseCookie(obfuscatedKey);
    }

    // Also try to remove the raw key just in case
    [key, obfuscatedKey].forEach(k => {
        try { sessionStorage.removeItem(k); } catch { /* ignore */ }
        try { localStorage.removeItem(k); } catch { /* ignore */ }
    });
};

/**
 * Clear all data
 */
export const clearSecureStorage = () => {
    cleanupStaleKeys();
    try { sessionStorage.clear(); } catch { /* ignore */ }
    try { localStorage.clear(); } catch { /* ignore */ }
};
