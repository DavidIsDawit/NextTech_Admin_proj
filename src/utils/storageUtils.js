import CryptoJS from 'crypto-js';

const SECRET_KEY = import.meta.env.VITE_STORAGE_SECRET_KEY || 'next-tech-default-secret';

const encryptValue = (stringValue) => {
    return CryptoJS.AES.encrypt(stringValue, SECRET_KEY).toString();
};

const decryptValue = (encrypted) => {
    try {
        const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
        const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
        if (!decryptedString) return encrypted;

        try {
            return JSON.parse(decryptedString);
        } catch {
            return decryptedString;
        }
    } catch {
        return encrypted;
    }
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

    const obfuscatedKey = getObfuscatedKey(key);
    const storage =
        options?.storage === 'session' ? sessionStorage :
            options?.storage === 'local' ? localStorage :
                inferStorageForKey(key);

    try {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        // Prepend random noise to make the encrypted value look even more random
        const noise = Math.random().toString(36).substring(7);
        const encrypted = encryptValue(`${noise}|${stringValue}`);
        storage.setItem(obfuscatedKey, encrypted);
    } catch (error) {
        console.error('Secure Storage Error:', error);
    }
};

/**
 * Retrieve and decrypt data
 */
export const getSecureItem = (key) => {
    const obfuscatedKey = getObfuscatedKey(key);
    const decryptAndUnwrap = (val) => {
        const decrypted = decryptValue(val);
        if (typeof decrypted === 'string' && decrypted.includes('|')) {
            const actualValue = decrypted.split('|').slice(1).join('|');
            try { return JSON.parse(actualValue); } catch { return actualValue; }
        }
        return decrypted;
    };

    try {
        const sessionEncrypted = sessionStorage.getItem(obfuscatedKey);
        if (sessionEncrypted) return decryptAndUnwrap(sessionEncrypted);
    } catch { /* ignore */ }

    try {
        const localEncrypted = localStorage.getItem(obfuscatedKey);
        if (!localEncrypted) return null;
        return decryptAndUnwrap(localEncrypted);
    } catch { return null; }
};

/**
 * Remove items from both storages
 */
export const removeSecureItem = (key) => {
    const obfuscatedKey = getObfuscatedKey(key);
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
