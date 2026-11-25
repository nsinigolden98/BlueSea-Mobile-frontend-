# BlueSea Mobile Download Centre

A single-page React + TypeScript download centre for the existing BlueSea Mobile frontend.

## Files

- `src/pages/download/Download.tsx` — the complete download page.
- `public/downloads/android/latest.json` — release manifest used by the page.
- `public/downloads/android/versions/` — put signed Android APK releases here.
- `ROUTING-INSTRUCTIONS.md` — add `/download` to your existing public routes without replacing `App.tsx`.

## Public URLs after deployment

- Page: `https://blueseamobile.com/download`
- Manifest: `https://blueseamobile.com/downloads/android/latest.json`
- APK: the URL in the manifest `file` property.

## Before publishing

1. Copy the `src` and `public` folders into the existing frontend repository, merging folders rather than replacing them.
2. Put the signed APK in `public/downloads/android/versions/`.
3. Edit `public/downloads/android/latest.json` with the real version, version code, date, file name, file size, minimum Android version, release notes and SHA-256.
4. Add the route as described in `ROUTING-INSTRUCTIONS.md`.
5. Run the project's normal typecheck/build and test the deployed APK URL on an Android device.

## Releasing a new version

Keep each release APK under `public/downloads/android/versions/`. Change the top-level manifest fields to point at the new APK. Add older releases to the `releases` array to show them in the Previous versions panel. This preserves old-version downloads while the main button always downloads the current release.

## Notes

- The page uses React and Tailwind utility classes already expected by the BlueSea frontend; no new package is required.
- The page uses native inline SVG icons, so it does not depend on an icon package.
- The mock app preview is illustrative. Replace it with a real, approved BlueSea dashboard screenshot if desired.
- The App Store, Windows and macOS cards are informational only until those builds and official distribution links exist.
- Do not commit a signing keystore or its passwords to GitHub.
- Keep the APK signed with the same Android application identity/signing certificate used for existing installations, and increment `versionCode` for every release.
