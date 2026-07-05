# React Native Deployment Workflow

## Base Workflow
This workflow covers the steps to prepare, build, sign, and deploy an Expo/React Native application to production (App Store & Play Store) using EAS (Expo Application Services).

---

## Deployment Flow

```
1. Pre-flight Checks → 2. Versioning → 3. EAS Build → 4. Test (TestFlight/Internal) → 5. EAS Submit
```

---

## Step 1: Pre-flight Checks

1. **Run TypeScript Checker:**
   ```bash
   tsc --noEmit
   ```
2. **Run Linter:**
   ```bash
   eslint .
   ```
3. **Check Expo Diagnostics:**
   ```bash
   npx expo doctor
   ```
   *Fix any dependency version mismatches reported by Expo Doctor.*

---

## Step 2: Versioning (app.json)

Expo uses `app.json` (or `app.config.js`) for versioning.

### Actions

1. **Update Global Version:**
   Update the `version` field (e.g., `"1.0.0"`). This is user-facing.
2. **Update iOS Build Number:**
   Update `ios.buildNumber` (must be a string, e.g., `"2"`).
3. **Update Android Version Code:**
   Update `android.versionCode` (must be an integer, e.g., `2`).

*Note: You MUST increment `buildNumber` and `versionCode` for every new upload to the stores, even if the user-facing `version` stays the same.*

---

## Step 3: EAS Build (Cloud Building)

EAS Build handles native compilation and signing certificates in the cloud.

### 1. Configure `eas.json`
Ensure your `eas.json` has a `production` profile.

```json
{
  "build": {
    "production": {
      "channel": "production"
    }
  }
}
```

### 2. Build for Android (AAB)
```bash
eas build --platform android --profile production
```
*EAS will prompt you to generate or upload an Android Keystore. Let EAS manage it.*

### 3. Build for iOS (IPA)
```bash
eas build --platform ios --profile production
```
*EAS will prompt you to log in to your Apple Developer account to generate Distribution Certificates and Provisioning Profiles.*

---

## Step 4: Test Release Build

Code obfuscation and production API endpoints can cause issues not seen in development.

1. **Install Android Build:** Download the APK (if built) from the EAS dashboard and install it on a physical Android device.
2. **Install iOS Build:** Download the IPA or install via TestFlight.
3. **Verify:**
   - Auth flows (Google/Apple Sign-in often require explicit release SHA-1 keys).
   - Network requests (ensure backend CORS/domains allow the production app).
   - Images load correctly.

---

## Step 5: EAS Submit

Once built, you can submit directly to the App Store Connect and Google Play Console via CLI.

```bash
# Submit the latest iOS build to TestFlight/App Store
eas submit -p ios

# Submit the latest Android build to Google Play Console
eas submit -p android
```

---

## Updates (Over-The-Air)

If you only changed JavaScript/TypeScript code (no native changes in `app.json` or new npm packages with native code), you can push an Over-The-Air (OTA) update via EAS Update, skipping the app stores entirely.

```bash
eas update --branch production --message "Fix login bug"
```

---

## Common Deployment Mistakes

| Mistake | Consequence | Fix |
| :--- | :--- | :--- |
| Forgetting to bump `versionCode` or `buildNumber` | Store rejects the upload | Always increment before running `eas build` |
| Wrong Google Sign-in SHA-1 | Google Login fails in production | Add the EAS production SHA-1 fingerprint to Firebase/Google Console |
| Hardcoding localhost APIs | App can't connect to backend | Use environment variables (`.env`) for production URLs |

---

## Quality Checklist

- [ ] `tsc` and `eslint` pass without errors.
- [ ] `npx expo doctor` reports no issues.
- [ ] `version`, `ios.buildNumber`, and `android.versionCode` are incremented in `app.json`.
- [ ] Production environment variables are configured in EAS secrets or `.env` files.
- [ ] Google/Apple Services (Firebase, Maps) are updated with production bundle IDs and SHA-1 keys.
- [ ] Release build was tested on a physical device before submitting to stores.
