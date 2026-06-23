# Android Device Testing

Use the manual GitLab CI `android_apk` job when you want an installable Android build without Expo Go.

## Setup

Add these CI/CD variables in GitLab before the first build:

- `EXPO_PUBLIC_CONVEX_URL`
- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `EXPO_PUBLIC_CLERK_GOOGLE_WEB_CLIENT_ID`
- `EXPO_PUBLIC_CLERK_GOOGLE_ANDROID_CLIENT_ID`

The Google client ID secrets are only required for Google sign-in testing. The Convex URL should be set for normal app data.

## Build In GitLab

1. Push the branch you want to test to GitLab.
2. Open GitLab CI/CD pipelines for the project.
3. Run a pipeline for the branch you want to test.
4. Start the manual `android_apk` job.
5. Download the APK artifact from the finished job.
6. Extract the ZIP and install `app-release.apk` on the Android phone.

## Build In GitHub

1. Push the branch you want to test to GitHub.
2. Open GitHub Actions.
3. Run `Build Android APK` manually for that branch.
4. Download the `ddiscover-android-apk` artifact from the finished workflow run.
5. Extract the ZIP and install `app-release.apk` on the Android phone.

This APK is standalone: it does not need Expo Go or a running Metro server. It is signed with the generated debug signing setup and is intended for internal phone testing, not Play Store submission.

## Install Notes

- Android may ask you to allow APK installs from the browser or file manager app.
- If Android reports `App not installed`, uninstall an older DDiscover build first and then install the downloaded APK again.
- Environment variables are embedded at build time, so rerun the CI job after changing CI/CD variables.

Official Expo references:

- EAS can also build APKs with an Android preview profile: <https://docs.expo.dev/build-reference/apk/>
- EAS builds can be triggered from CI if the project later moves to Expo-hosted signing and build infrastructure: <https://docs.expo.dev/build/building-on-ci/>
