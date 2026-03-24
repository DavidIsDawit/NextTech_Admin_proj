import { getSecureItem } from "./storageUtils";

/**
 * Manages the "Remember Me" persistence flag in localStorage.
 * This flag tells the app whether to attempt session restoration (silent refresh) 
 * after a browser restart.
 */

const REMEMBER_ME_KEY = "nt_remember_me";

/**
 * Sets the "Remember Me" preference.
 * @param {boolean} enabled 
 */
export const setRememberMe = (enabled) => {
  if (enabled) {
    localStorage.setItem(REMEMBER_ME_KEY, "true");
  } else {
    localStorage.removeItem(REMEMBER_ME_KEY);
  }
};

/**
 * Checks if the user explicitly opted for a persistent session.
 * @returns {boolean}
 */
export const isRemembered = () => {
  return localStorage.getItem(REMEMBER_ME_KEY) === "true";
};

/**
 * Determines if the application should attempt to restore the session on boot.
 * Logic:
 * 1. Persistent: User checked "Remember Me" (flag in localStorage).
 * 2. Transitional: The page was just refreshed (user data exists in sessionStorage).
 * @returns {boolean}
 */
export const shouldRestoreSession = () => {
  const remembered = isRemembered();
  const hasSessionData = !!getSecureItem("userRole"); // storageUtils handles session vs local logic
  
  return remembered || hasSessionData;
};

/**
 * Clears the persistence flag (typically on logout).
 */
export const clearPersistence = () => {
  localStorage.removeItem(REMEMBER_ME_KEY);
};
