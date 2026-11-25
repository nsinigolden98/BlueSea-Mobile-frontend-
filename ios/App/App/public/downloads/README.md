# BlueSea Mobile download assets

The download page is served at:

`https://blueseamobile.com/download`

Android APKs are stored in `android/versions/`. The release manifest is:

`/downloads/android/latest.json`

The APK link is read from the manifest by `src/pages/download/Download.tsx`.

Vite copies files in `public/` to the deployment root. Do not put private keys, keystores, passwords or secrets in this public directory.
