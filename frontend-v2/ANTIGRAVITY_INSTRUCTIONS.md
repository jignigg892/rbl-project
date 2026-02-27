# Anonymous Codebase Setup & Build Instructions

## Context
This codebase (`loan-app-mobile`) is a React application bundled with Vite and configured for Android deployment via Capacitor. It has been thoroughly sanitized for anonymous transfer. All Git history, environment variables, build caches, hardcoded paths, and EXIF metadata have been stripped.

## Operational Security (OpSec) Directives for Antigravity

Your primary directive is to maintain absolute anonymity. Do not execute any commands or write any configurations that could link this codebase back to the original developer's identity or machine (`extcsid`, MacOS).

### 1. Initial Setup
1. Unzip this directory.
2. **DO NOT** use any existing GitHub accounts or SSH keys present on this RDP.
3. Establish a Burner Identity before doing anything with Git:
   ```bash
   git config --global user.name "AnonymousDevX"
   git config --global user.email "anonymousdevx@proton.me"
   ```
4. Initialize the pristine repository:
   ```bash
   git init
   git add .
   git commit -m "Initial anonymous commit"
   ```

### 2. Building and Running the App locally

Because the `node_modules` and build directories were intentionally purged for anonymity, you must rebuild the app from scratch.

**(A) Install Dependencies:**
```bash
npm install
```

**(B) Local Web Development:**
To run the React app in a browser for rapid UI development:
```bash
npm run dev
```

**(C) Building for Production (Web):**
Compile the optimized HTML/JS/CSS bundle into the `dist` directory:
```bash
npm run build
```

**(D) Android Native Compilation (Capacitor):**
The Android project folder (`android/`) is intact minus the build caches. After running `npm run build` to generate the `dist` folder:

1. Sync the web assets to the native Android project:
   ```bash
   npx cap sync android
   ```
2. Open the project in Android Studio to build the APK, or run it on a connected emulator:
   ```bash
   npx cap open android
   # OR
   npx cap run android
   ```

### 3. Environment Variables & Secrets
1. Generate **fresh** API keys for any services this app uses.
2. **DO NOT** reuse any API keys, database URLs, or test tokens that were used in the original environment. Create a new `.env` file at the root.

### 4. Ongoing Development
1. Always commit and push using the established burner identity.
2. If pushing to GitHub, use HTTPS with a Personal Access Token (PAT) generated from a burner account. **DO NOT** use SSH keys.
3. Avoid hardcoding any paths that reveal the RDP's system username or directory structure.
