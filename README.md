# LMC Mobile App

React Native Expo application for Giant Fitness LMC.

## 🛠 Setup

1. Install dependencies:

```bash
npm install
```

## 🌳 Branch Strategy

```
feature/* → develop → staging → release → main
```

-   `main`: Production code only. Represents what's in the App/Play Store.
-   `release`: Release candidates for TestFlight and Play Store beta testing.
-   `staging`: Integration testing of multiple features together.
-   `develop`: Main development branch where features are merged.
-   `feature/*`: Individual feature branches (e.g., `feature/user-auth`).

## 🚀 Development Workflow

### 1. Starting a New Feature

```bash
# Start from latest develop
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/your-feature-name
```

### 2. Feature Testing

Feature testing happens in two phases:

#### Phase 1: Development Build Testing

First, create a development build if you haven't already:

```bash
eas build --profile development --platform ios
eas build --profile development --platform android
```

Then run locally for quick iterations:

```bash
# For iOS
npx expo run:ios --device

# For Android
npx expo run:android
```

-   Tests directly on your device
-   Hot reload supported
-   Good for rapid development
-   Required for AWS Amplify integration
-   Fastest way to test changes

#### Phase 2: Feature Build

When feature is stable in development:

```bash
# Build for iOS
eas build --profile feature --platform ios

# Build for Android
eas build --profile feature --platform android
```

-   iOS builds via TestFlight
-   Android builds via APK
-   Tests in production-like environment
-   Share with other developers/testers

### 3. Staging Testing

After feature is merged to develop:

```bash
# Switch to staging
git checkout staging
git merge develop

# Initial builds for physical devices
eas build --profile staging --platform ios
eas build --profile staging --platform android

# Push changes
git push origin staging
```

#### Staging OTA Updates

For minor changes after initial staging build:

```bash
# Update staging channel
eas update --branch staging --message "Description of changes"
```

-   Use OTA updates for:
    -   UI tweaks
    -   Bug fixes
    -   Content updates
    -   Non-native code changes
-   Requires new build if:
    -   Native dependencies change
    -   Native code changes
    -   Expo SDK updates
    -   AWS Amplify configuration changes

### 4. Release Candidate

When ready for external testing:

```bash
# Switch to release
git checkout release
git merge staging

# Initial RC builds
eas build --profile release --platform all
eas submit --profile release --platform ios    # Goes to TestFlight
eas submit --profile release --platform android # Goes to Play Store Internal Testing
```

#### Release OTA Updates

For bug fixes during beta testing:

```bash
eas update --branch release --message "Beta bug fixes"
```

-   Use OTA updates for:
    -   Critical bug fixes
    -   UI/content updates
    -   Performance improvements
-   New build required if:
    -   Native code changes needed
    -   Security fixes require native updates
    -   Changes to app capabilities
    -   AWS Amplify changes

### 5. Production Release

After release testing is complete:

```bash
# Switch to main
git checkout main
git merge release

# Initial production builds
eas build --profile production --platform all
eas submit --profile production --platform all
```

#### Production OTA Updates

For critical production updates:

```bash
eas update --branch production --message "Critical fix description"
```

-   Use OTA updates ONLY for:
    -   Critical bug fixes
    -   Minor UI updates
    -   Content changes
    -   Performance optimizations
-   Always do new builds for:
    -   Feature additions
    -   Native code changes
    -   Security updates
    -   Expo SDK updates
    -   AWS Amplify updates
    -   App store requirement changes

## 📱 Build Profiles

The app uses different build profiles for different stages:

-   `development`: Local development
    -   Direct device testing via `expo run:ios/android`
    -   Hot reload enabled
    -   Development environment configuration
-   `feature`: Internal testing of individual features
    -   iOS: Internal distribution via TestFlight
    -   Android: APK build
-   `staging`: Testing multiple features together
    -   iOS: Internal distribution via TestFlight
    -   Android: APK build
    -   Supports OTA updates for quick iterations
-   `release`: External beta testing
    -   iOS: TestFlight (broader distribution)
    -   Android: Play Store Internal Testing
    -   OTA updates for beta fixes
-   `production`: App Store and Play Store releases
    -   OTA updates for critical fixes only

## 🔄 Version Control

-   App versioning is handled automatically via `autoIncrement` in production builds
-   Runtime version matches app version
-   Each channel (development, feature, staging, release, production) manages its own updates
