# TATHASTU NUMEROLOGY — Native Android Project & APK/AAB Build Guide

- **App Name:** `TATHASTU NUMEROLOGY`
- **Android Application ID:** `com.tathastulight.numerology`
- **App Creator & Master Admin:** Healer Ddeepak Jain (`healer.ddeepak.jain@gmail.com`)
- **Helpline / WhatsApp:** `+91 8899444444`

## Option 1: Build Native Android APK / Play Store AAB Directly in Android Studio (Zero Extra Dependencies)

This repository already contains a complete, self-contained Android Studio project in the `android/` directory powered by `androidx.webkit.WebViewAssetLoader` (serves your bundled React/Vite app offline-first over `https://appassets.androidplatform.net/` with native Android PrintManager, PDF WhatsApp sharing via `FileProvider`, UPI intent handling, and Back-button navigation).

1. **Install dependencies & bundle the web app into Android assets:**
   ```bash
   npm install
   npm run android:sync
   ```
   This compiles `dist/` and copies all compiled web files and TATHASTU launcher icons into `android/app/src/main/assets/` and `android/app/src/main/res/mipmap-*`.

2. **Open in Android Studio:**
   - Launch **Android Studio (Ladybug / Koala or newer)**.
   - Click **File → Open** and select the `android/` folder.
   - Wait for Gradle Sync to finish (JDK 17, `compileSdk 35`, `minSdk 24`).

3. **Build APK (Direct Phone Install) or Signed AAB (Google Play Store):**
   - For direct testing/installation: **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
   - For Google Play Store: **Build → Generate Signed App Bundle / APK → Android App Bundle (.aab)**.

---

## Option 2: Wrap with Capacitor CLI (Alternative)

A ready-to-use `capacitor.config.ts` is included in the project root:

```bash
npm install @capacitor/core @capacitor/android
npm install -D @capacitor/cli
npm run build
npx cap sync android
npx cap open android
```

---

## Option 3: Instant Android Home Screen Install (PWA)

Because `public/manifest.json` and `vite-plugin-pwa` are configured with `name: "TATHASTU NUMEROLOGY"` and `display: "standalone"`, any Android user can also open the published web URL in Chrome and tap **Install App** / **Add to Home screen** for immediate full-screen app installation without waiting for Play Store review.
