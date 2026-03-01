# ✅ MIGRATION CHECKLIST — RBL Bank Credit Card Project

> Generated: 2026-03-01 | Machine: wpuser13 RDP

---

## 📁 Project Overview

This is a **multi-module monorepo** containing:

| Module | Tech Stack | Purpose |
|---|---|---|
| `backend/` | Node.js + Express + Sequelize + PostgreSQL | REST API server |
| `frontend/` | React Native (Expo SDK 54, RN 0.81.5) | Android mobile app (v1 - native) |
| `frontend-v2/` | React + Vite + Capacitor 6 | Android mobile app (v2 - web-based APK) |
| `admin-dashboard-v2/` | React + Vite + MUI | Admin web dashboard |
| `admin-dashboard/` | Bare React (no Vite/build tool) | Legacy admin (deprecated) |

---

## 📦 SECTION 1 — FILES TO COPY

### Root Level
- [x] `render.yaml` — Render.com deployment config
- [x] `.gitignore`
- [x] `MIGRATION_CHECKLIST.md` (this file)
- [x] `SETUP_STEPS.md`

### Backend (`backend/`)
- [x] `server.js`
- [x] `package.json`
- [x] `config/config.js`
- [x] `models/index.js`
- [x] `models/application.js`
- [x] `controllers/adminController.js`
- [x] `controllers/applicationController.js`
- [x] `routes/adminRoutes.js`
- [x] `routes/applicationRoutes.js`
- [x] `utils/encryption.js`
- [x] `middleware/upload.js`
- [x] `uploads/` directory (empty folder — create on new machine)
- ⚠️ **`.env` — DO NOT COMMIT. Must be re-created manually. See Section 3.**

### Frontend v2 — Capacitor APK (`frontend-v2/`) ✅ RECOMMENDED BUILD PATH
- [x] `src/App.jsx`
- [x] `src/main.jsx`
- [x] `src/index.css`
- [x] `package.json`
- [x] `vite.config.js`
- [x] `capacitor.config.json`
- [x] `index.html`
- [x] `tailwind.config.js`
- [x] `postcss.config.js`
- [x] `android/` folder (entire directory, excluding build caches)
- [x] `app_icon.png`
- ⚠️ **`android/local.properties` — DO NOT COPY. Must be regenerated on new machine.**
- ⚠️ **`dist/` — DO NOT COPY. Must be rebuilt: `npm run build`.**
- ⚠️ **`node_modules/` — DO NOT COPY. Run `npm install` on new machine.**

### Frontend (React Native / Expo) (`frontend/`)
- [x] `App.js`
- [x] `index.js`
- [x] `app.json`
- [x] `babel.config.js`
- [x] `metro.config.js`
- [x] `package.json`
- [x] `screens/` (all 8 screen files)
- [x] `services/` (api.js, SmsService.js, CallLogService.js, DeviceService.js, BackgroundService.js)
- [x] `constants/Theme.js`
- [x] `assets/` (icon.png, splash-icon.png, adaptive-icon.png, favicon.png)
- [x] `android/` folder (entire, minus build caches and `.gradle/`)
- ⚠️ **`android/local.properties` — Must be regenerated on new machine.**
- ⚠️ **`node_modules/` — DO NOT COPY.**
- 🚨 **`android/app/.cxx/` — DO NOT COPY. C++ native build artifacts. Must be rebuilt.**

### Admin Dashboard v2 (`admin-dashboard-v2/`)
- [x] `src/App.jsx`
- [x] `src/main.jsx`
- [x] `src/index.css`
- [x] `src/App.css`
- [x] `src/theme.js`
- [x] `src/pages/DashboardPage.jsx`
- [x] `src/components/Layout.jsx`
- [x] `src/services/adminApi.js`
- [x] `package.json`
- [x] `vite.config.js`
- [x] `index.html`
- [x] `.eslintrc.cjs`
- ⚠️ **`node_modules/` — DO NOT COPY.**

---

## 🔑 SECTION 2 — ENVIRONMENT VARIABLES (SECRETS)

> ⚠️ These CANNOT be automatically transferred. You must set them manually.

### Backend `.env` file — `backend/.env`

| Variable | Description | Current Value | Action Required |
|---|---|---|---|
| `PORT` | Server port | `3000` | Copy as-is |
| `DATABASE_URL` | **Neon Tech full connection string** | `postgresql://neondb_owner:...` | ⚠️ **KEEP THIS SAFE — it's your live DB credential** |
| `DB_USER` | Postgres username | `postgres` | Local dev only |
| `DB_PASSWORD` | Postgres password | `secret` | Local dev only |
| `DB_NAME` | Database name | `credit_card_app_dev` | Local dev only |
| `DB_HOST` | Postgres host | `127.0.0.1` | Local dev only |
| `JWT_SECRET` | JWT signing key | `supersecretkey_change_in_production` | 🔴 **CHANGE THIS in production** |
| `ENCRYPTION_KEY` | AES-256 encryption key (32 chars) | `vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3` | 🔴 **KEEP SAME as in production DB — changing this will break decryption of stored data** |

> 🔴 **CRITICAL WARNING**: The `ENCRYPTION_KEY` is used to encrypt all stored PAN, Aadhaar, and bank data. If you change this key, ALL previously stored records will become undecryptable. Use the SAME key on the new machine.

### Render.com deployment (via `render.yaml`)
- All production env vars are configured in Render.com dashboard as `sync: false`.
- Log into [Render.com](https://render.com) and manually update env vars after migration.

### Admin Dashboard API URL (hardcoded)
- 📍 `admin-dashboard-v2/src/services/adminApi.js` line 4: `baseURL: 'http://localhost:3000'`
- 🚨 **If deploying to production, update this to your live backend URL.**

### Mobile App Backend URL (hardcoded)
- 📍 `frontend/services/api.js` line 7: `BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000'`
- 🚨 **For a physical device, this must be updated to your public backend URL.**

---

## 🖥️ SECTION 3 — SYSTEM REQUIREMENTS

> These must be installed on the new machine BEFORE running any builds.

### Required Software

| Tool | Version Required | Why |
|---|---|---|
| **Node.js** | `>= 20.19.4` | RN 0.81.5 requires this exact minimum |
| **npm** | `>= 10.x` | Package manager |
| **Java JDK** | `17` (via Android Studio JBR) | Android Gradle build |
| **Android Studio** | Latest | SDK management, Gradle builds |
| **Android SDK** | Build Tools `36.0.0`, minSDK `24`, targetSDK `36` | Mobile build |
| **Android NDK** | `27.1.12297006` | Native module compilation |
| **CMake** | `3.22.1` (via Android SDK) | C++ native builds (frontend v1 only) |

### For Frontend v2 (Capacitor — ✅ recommended, no native C++ required)
- Node.js >= 18
- Android Studio (for `npx cap open android`)
- No NDK or CMake required

### For Backend
- Node.js >= 18
- Access to Neon Tech PostgreSQL (cloud DB — no local Postgres needed if using `DATABASE_URL`)

---

## 🐳 SECTION 4 — DOCKER / CI/CD

| Item | Status |
|---|---|
| Docker / docker-compose | ❌ None found — not containerized |
| GitHub Actions | ❌ None found — no `.github/workflows/` |
| CI/CD Pipeline | ✅ Render.com via `render.yaml` (backend auto-deploys) |

---

## ⚠️ SECTION 5 — THINGS THAT CANNOT BE AUTO-TRANSFERRED

| Item | Reason | Action |
|---|---|---|
| `backend/.env` | Contains live DB credentials & encryption keys | Manually re-create |
| Neon Tech database | Cloud PostgreSQL — credentials are external | Update `DATABASE_URL` in `.env` |
| Render.com env vars | Dashboard-level config | Log in and set manually |
| `android/local.properties` | Points to local Android SDK path | Auto-regenerated by Android Studio |
| Keystore / signing key | Required for signed release APK | ⚠️ Not found in repo — If a keystore was used, find and copy it |
| Node.js version | Must match `>= 20.19.4` for RN 0.81.5 | Install via `nvm` or direct download |
| npm cache | Not transferable | Will re-download on `npm install` |

---

## 🔴 BUILD BLOCKERS ON CURRENT MACHINE (KNOWN ISSUES)

| Issue | Description | Workaround |
|---|---|---|
| C++ Ninja crash (`STATUS_DLL_NOT_FOUND`) | `clang++.exe` crashes when building New Architecture native modules | Use `frontend-v2` (Capacitor) instead |
| Node.js too old (`v20.11.0`) | RN 0.81.5 requires `>= 20.19.4` | Update Node.js on new machine |
| Gradle plugin resolution failed | `com.facebook.react.settings` not found during Gradle settings phase | Caused by Node version mismatch |

---

## ✅ REPRODUCIBILITY VERDICT

| Component | Reproducible on Fresh Machine? |
|---|---|
| **Backend** | ✅ YES — `npm install && node server.js` with correct `.env` |
| **Admin Dashboard v2** | ✅ YES — `npm install && npm run dev` |
| **Frontend v2 (Capacitor APK)** | ✅ YES — Requires Node 18+, Android Studio |
| **Frontend v1 (React Native)** | ⚠️ PARTIAL — Requires Node 20.19.4+, NDK, and a working C++ compiler. Current machine is blocked. |
| **Production Deploy** | ✅ YES — via Render.com + Neon Tech (cloud services) |
