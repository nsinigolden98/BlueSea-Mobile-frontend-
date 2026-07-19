# Fix ProGuard Configuration Error

The build is failing because it references `proguard-android.txt`, which is no longer supported in modern Android Gradle Plugin versions. The error message suggests switching to `proguard-android-optimize.txt`.

## Proposed Changes

### Build Configuration

#### [MODIFY] [app/build.gradle](file:///C:/Users/nsini/Documents/BlueSea-Mobile-frontend-/android/app/build.gradle)
- Update line 22 to ensure it uses `proguard-android-optimize.txt`. Even if it appears correct, rewriting it will ensure there are no hidden characters or discrepancies.

## Verification Plan

### Automated Tests
- Run Gradle Sync to ensure the project evaluates correctly.
