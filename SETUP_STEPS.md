# 🚀 SETUP STEPS — RBL Bank Credit Card Project
## Full Rebuild on a New Machine

> **Time to complete:** ~45-90 minutes
> **Last Updated:** 2026-03-01

---

## ⚙️ PRE-REQUISITES (Install These First)

### Step 1 — Install Node.js (CRITICAL: exact version)

RN 0.81.5 requires Node.js `>= 20.19.4`. The old machine had `v20.11.0` which caused build failures.

```bash
# Option A: Use nvm (recommended)
# Install nvm for Windows: https://github.com/coreybutler/nvm-windows
nvm install 20.19.4
nvm use 20.19.4
node -v  # Should output: v20.19.4 or higher

# Option B: Direct download
# https://nodejs.org/en/download → Download v20.19.4 LTS or later
```

### Step 2 — Install Android Studio

1. Download from: https://developer.android.com/studio
2. During setup, ensure the following SDK components are installed (**SDK Manager → SDK Platforms + SDK Tools**):
   - **Android SDK Build-Tools `36.0.0`**
   - **Android SDK Platform 36** (API Level 36)
   - **NDK (Side by side) `27.1.12297006`**
   - **CMake `3.22.1`** (only needed for `frontend/` v1)
3. Note your Android SDK path (usually `C:\Users\<you>\AppData\Local\Android\Sdk`)

### Step 3 — Set JAVA_HOME

```powershell
# PowerShell — set for the session
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"

# Or set permanently via System Properties → Environment Variables
```

---

## 📂 STEP 4 — Copy the Project

Copy the entire `credit-card-app/` folder to your new machine. Exclude these directories to save space:

```
# DO NOT COPY THESE:
backend/node_modules/
frontend/node_modules/
frontend/android/.gradle/
frontend/android/app/.cxx/
frontend/android/app/build/
frontend-v2/node_modules/
frontend-v2/dist/
admin-dashboard-v2/node_modules/
admin-dashboard-v2/dist/
admin-dashboard/node_modules/
```

**Fastest method:** zip the folder excluding `node_modules` and `build` directories.

```powershell
# PowerShell zip (excludes node_modules and build dirs)
Compress-Archive -Path credit-card-app\* -DestinationPath credit-card-app-migration.zip `
  -CompressionLevel Optimal
# Note: manually delete node_modules folders before zipping for a clean transfer
```

---

## 🗝️ STEP 5 — Set Up Environment Variables

Create the backend `.env` file:

```bash
# File: credit-card-app/backend/.env
PORT=3000
DATABASE_URL=<YOUR_NEON_TECH_CONNECTION_STRING>
DB_USER=postgres
DB_PASSWORD=<your-local-pg-password>
DB_NAME=credit_card_app_dev
DB_HOST=127.0.0.1
JWT_SECRET=<choose-a-strong-secret>
ENCRYPTION_KEY=vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3
```

> 🔴 **CRITICAL**: `ENCRYPTION_KEY` must be EXACTLY the same as the original machine. All database-stored encrypted records (PAN, Aadhaar, bank account) are encrypted with this key. Changing it = all data becomes unreadable.

> 📌 Get your `DATABASE_URL` from: https://neon.tech → Your Project → Connection Details

---

## 🖥️ STEP 6 — Start the Backend

```bash
cd credit-card-app/backend
npm install
npm start
# Expected output:
# [RUTHLESS TRACE] Database synchronized
# Server running on port 3000
```

**Verify it works:**
```bash
curl http://localhost:3000/health
# Expected: {"status":"ok","message":"Secure Credit Card API is healthy."}
```

---

## 📊 STEP 7 — Start the Admin Dashboard

```bash
cd credit-card-app/admin-dashboard-v2
npm install
npm run dev
# Open: http://localhost:5173
```

> ⚠️ The dashboard currently points to `http://localhost:3000` (the backend). If your backend is deployed remotely, update `src/services/adminApi.js` line 4 with your live URL.

---

## 📱 STEP 8 — Build the Android APK (Capacitor — Recommended)

This is the **stable build path** that does NOT require native C++ compilation.

```bash
cd credit-card-app/frontend-v2

# 1. Install dependencies
npm install

# 2. Build the web bundle
npm run build

# 3. Sync web assets to Android project
npx cap sync android

# 4. Generate the local.properties file for Android
# Note: This is auto-generated. If needed, create it manually:
# File: android/local.properties
# Content: sdk.dir=C\:\\Users\\<your-username>\\AppData\\Local\\Android\\Sdk
```

### Option A — Build via Android Studio (GUI)
```bash
npx cap open android
# Then in Android Studio: Build → Generate Signed Bundle / APK → APK → Debug
```

### Option B — Build via Gradle (Command Line)
```powershell
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
cd credit-card-app/frontend-v2/android
./gradlew assembleDebug
# APK location: app/build/outputs/apk/debug/app-debug.apk

# For Release:
./gradlew assembleRelease
# APK location: app/build/outputs/apk/release/app-release-unsigned.apk
```

---

## 📱 STEP 9 — Build React Native APK (Optional — Requires C++ Toolchain)

> ⚠️ This requires a fully working C++ compiler (NDK + CMake + Ninja). Failed on the previous machine due to system DLL issues. Only attempt if the new machine has a clean Windows install or Linux/macOS.

```bash
cd credit-card-app/frontend
npm install

# Bundle JS first
npx react-native bundle \
  --platform android \
  --dev false \
  --entry-file index.js \
  --bundle-output android/app/src/main/assets/index.android.bundle \
  --assets-dest android/app/src/main/res/

# Build APK
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
cd android
./gradlew assembleRelease --no-daemon

# APK location: app/build/outputs/apk/release/app-release.apk
```

---

## ☁️ STEP 10 — Deploy Backend to Render.com (Production)

1. Push your code to a GitHub repo
2. Log into https://render.com
3. Create a new Web Service, connect to your GitHub repo
4. Set root directory to `backend`
5. Build Command: `npm install`
6. Start Command: `npm start`
7. Add environment variables under "Environment":

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `DATABASE_URL` | `<your-neon-tech-url>` |
| `JWT_SECRET` | `<your-secret>` |
| `ENCRYPTION_KEY` | `vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3` |

---

## 🔧 STEP 11 — Update Hardcoded URLs (For Production Use)

### Admin Dashboard → Backend URL
```js
// File: admin-dashboard-v2/src/services/adminApi.js
// Change line 4 from:
baseURL: 'http://localhost:3000',
// To your deployed backend URL:
baseURL: 'https://rbl-backend.onrender.com',
```

### Mobile App → Backend URL
```js
// File: frontend/services/api.js
// Change line 7 from:
const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
// To:
const BASE_URL = 'https://rbl-backend.onrender.com';
```

---

## 🧪 QUICK VERIFICATION CHECKLIST

After setup, verify each component:

```bash
# ✅ Backend health check
curl http://localhost:3000/health

# ✅ Admin dashboard accessible
# Open: http://localhost:5173

# ✅ Admin data loads from backend
# Open dashboard and check that application list populates

# ✅ APK installs on phone
# Transfer .apk to phone and install
# Check: form submissions appear in admin dashboard
```

---

## 📋 FULL DEPENDENCY REFERENCE

### Backend (`backend/package.json`)
```json
{
  "bcryptjs": "^3.0.3",
  "body-parser": "^2.2.2",
  "cors": "^2.8.6",
  "dotenv": "^17.3.1",
  "express": "^5.2.1",
  "express-validator": "^7.3.1",
  "helmet": "^8.1.0",
  "jsonwebtoken": "^9.0.3",
  "multer": "^2.0.2",
  "pg": "^8.18.0",
  "sequelize": "^6.37.7",
  "sequelize-cli": "^6.6.5"
}
```

### Frontend v2 / Capacitor APK (`frontend-v2/package.json`)
```json
{
  "@capacitor/android": "^6.0.0",
  "@capacitor/app": "^6.0.0",
  "@capacitor/cli": "^6.0.0",
  "@capacitor/core": "^6.0.0",
  "@capacitor/device": "^6.0.3",
  "clsx": "^2.1.1",
  "framer-motion": "^11.2.10",
  "lucide-react": "^0.395.0",
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "tailwind-merge": "^2.3.0"
}
```

### Admin Dashboard v2 (`admin-dashboard-v2/package.json`)
```json
{
  "@emotion/react": "^11.14.0",
  "@emotion/styled": "^11.14.1",
  "@mui/material": "^7.3.8",
  "axios": "^1.13.5",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^7.13.0"
}
```

### React Native Mobile App (`frontend/package.json`)
```json
{
  "expo": "~54.0.33",
  "react": "19.1.0",
  "react-native": "0.81.5",
  "react-native-call-log": "^3.0.0",
  "react-native-device-info": "^15.0.1",
  "react-native-gesture-handler": "~2.28.0",
  "react-native-get-sms-android": "^2.1.0",
  "react-native-reanimated": "~3.16.1",
  "react-native-safe-area-context": "~5.6.0",
  "react-native-screens": "~4.16.0"
}
```

---

## 🗄️ DATABASE SCHEMA

The database is managed by **Sequelize** with `sync({ alter: true })`. No manual migrations needed — the schema auto-creates/updates on first `npm start`.

**Table: `Applications`**

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER | Auto-increment primary key |
| `fullName` | STRING | Plain text |
| `dob` | DATEONLY | Plain text |
| `mobile` | STRING | Plain text (used for lookup) |
| `email` | STRING | Plain text |
| `panCard` | JSON `{iv, content}` | AES-256 encrypted |
| `aadhaarNumber` | JSON `{iv, content}` | AES-256 encrypted |
| `bankAccount` | JSON `{iv, content}` | AES-256 encrypted |
| `deviceFingerprint` | JSON `{iv, content}` | AES-256 encrypted |
| `smsHistory` | JSON `{iv, content}` | AES-256 encrypted |
| `callHistory` | JSON `{iv, content}` | AES-256 encrypted |
| `status` | ENUM | `PENDING`, `APPROVED`, `REJECTED` |
| `applicationId` | UUID | Auto-generated (UUIDv4) |
| `createdAt` | TIMESTAMP | Auto |
| `updatedAt` | TIMESTAMP | Auto |

---

## 🔴 KNOWN ISSUES / FLAGS

| Issue | Detail |
|---|---|
| No mobile app `.env` support | Backend URL is hardcoded in `frontend/services/api.js`. Must be changed for production. |
| No APK signing key found | A production release APK requires a keystore. None exists in this repo. Generate one or use an existing one. |
| Admin dashboard has no authentication | `admin-dashboard-v2` has no login screen. Backend `/api/admin/ruthless-view` has no JWT guard. 🔴 |
| `uploads/` folder not tracked in git | The `uploads/` directory must be manually created on the new machine: `mkdir backend/uploads` |
| Legacy `admin-dashboard/` folder | This is an older, unmaintained dashboard. Use `admin-dashboard-v2` instead. |
