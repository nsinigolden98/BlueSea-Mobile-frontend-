# Android APK releases

Place each signed release APK in this directory.

Example:
- `bluesea-mobile-1.0.0.apk`
- `bluesea-mobile-1.0.1.apk`

The current release is selected by `public/downloads/android/latest.json`.
When releasing a new version:
1. Add the new APK here.
2. Update the top-level version, versionCode, releaseDate, file, fileSize, minimumAndroidVersion, releaseNotes and sha256 in `latest.json`.
3. Add the previous release to the `releases` array if you want it available in the Previous versions list.
4. Deploy the frontend.

Do not commit your Android signing keystore, passwords, API secrets or private signing files.
