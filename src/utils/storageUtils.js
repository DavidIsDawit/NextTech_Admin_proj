import CryptoJS from 'crypto-js';

// Simple obfuscation key - in a real app, this would be managed securely,
// but for frontend-only obfuscation/hiding from DevTools, this satisfies the requirement.
const SECRET_KEY = 'next-tech-secret-storage-key';

/**
 * Encrypt and store data in localStorage
 * @param {string} key 
 * @param {any} value 
 */
export const setSecureItem = (key, value) => {
    try {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        const encrypted = CryptoJS.AES.encrypt(stringValue, SECRET_KEY).toString();
        localStorage.setItem(key, encrypted);
    } catch (error) {
        console.error('Error setting secure item:', error);
        // Fallback to plain storage if encryption fails (optional)
        localStorage.setItem(key, JSON.stringify(value));
    }
};

/**
 * Retrieve and decrypt data from localStorage
 * @param {string} key 
 * @returns {any} Original value or null
 */
export const getSecureItem = (key) => {
    try {
        const encrypted = localStorage.getItem(key);
        if (!encrypted) return null;

        const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
        const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
        
        if (!decryptedString) return encrypted; // Or handle as error

        try {
            return JSON.parse(decryptedString);
        } catch {
            return decryptedString;
        }
    } catch (error) {
        // console.error('Error getting secure item:', error);
        return localStorage.getItem(key); // Fallback
    }
};

/**
 * Remove item from localStorage
 * @param {string} key 
 */
export const removeSecureItem = (key) => {
    localStorage.removeItem(key);
};

/**
 * Clear all localStorage
 */
export const clearSecureStorage = () => {
    localStorage.clear();
};
