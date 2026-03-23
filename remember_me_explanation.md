# How "Remember Me" Works: Simple Explanation

Since you meant **"Remember Me"** (the checkbox on your login page), here is a simple explanation of what it does and how I implemented it in your code.

## 1. What does it actually do?
The "Remember Me" feature decides how long the website should "remember" that you are logged in:
- **If checked:** The website remembers you even if you close your browser or restart your computer. It also remembers your email address so you don't have to type it again next time.
- **If unchecked:** The website removes the remembered email after you close the tab. Whether you stay logged in depends on how the backend configures the refresh cookie (this is server-controlled).

## 2. How is it done? (The Technical Secret)
I used two different browser storage "folders" to handle this:

### The "Long-Term" Folder (`localStorage`)
If you check "Remember Me", the app stores non-sensitive UI details in `localStorage` (like `rememberedEmail`) so you don't have to retype your email.

For security, the actual auth token (`accessToken`) stays session-only in the frontend. The long-term login persistence comes from the server-managed refresh cookie (`httpOnly`).
- **Persistence:** This folder is permanent. Information stays there until you manually log out or clear your browser data.
- **Convenience:** When you open the login page again, the app looks in this folder and says, *"Oh, I know this email!"* and fills it in for you automatically.

### The "Short-Term" Folder (`sessionStorage`)
If you **don't** check the box, the app keeps the short-lived UI/session details in `sessionStorage` so they are cleared when the tab is closed.
- **Speed:** This folder is temporary. As soon as you close the tab, the browser "shreds" everything inside it.
- **Security:** This ensures that if someone else opens the browser later, they won't be logged into your account.

## 3. Where is the code?
If you want to see where this happens, look at these files:
1.  `src/api/userApi.js`: forwards `rememberMe` to the backend and stores `accessToken` session-only; it stores `firstTimeLogin` (and similar flags) in `localStorage` only when you opt in.
2.  `src/ui/LoginUI/Login.jsx`: handles the checkbox UI and persists/removes the remembered email (`rememberedEmail`).
3.  `src/utils/storageUtils.js`: reads/writes/deletes secure values across both `localStorage` and `sessionStorage`.

## Summary in simple words:
> "In the frontend, `Remember me` mainly affects safe UI persistence (like `rememberedEmail`). Refresh-cookie lifetime is controlled by the backend, and the frontend always keeps `accessToken` session-only."

> Note: For a truly professional security model, refresh tokens should be managed by the server in `httpOnly` cookies (so JavaScript cannot read them). This project still relies on client-side storage for auth values.
