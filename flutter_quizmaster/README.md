# QuizMaster – Interactive Android Quiz Application

A modern, full-featured Android Quiz application built with Flutter 3.35+, Dart null safety, Provider state management, and Open Trivia DB API integration.

## 📱 Features
- **6 Category Tracks**: General Knowledge, Science & Nature, Technology, Sports, History, Programming, and Custom Questions.
- **Open Trivia Database API**: Live question fetching with HTML entity decoding and resilient offline fallbacks.
- **Interactive Quiz Engine**: 4 options per question, instant color highlights (green/red), countdown timer, live score, and question review.
- **Custom Question Creator**: Full input validation, option radio selector, saved locally using `shared_preferences`.
- **Profile & Performance History**: Tracks user high scores, win rate, total quizzes, and detailed past quiz records.
- **Modern Blue & Purple Material 3 Theme**: Clean typography, rounded cards, fluid animations.

## 🚀 Getting Started

### Prerequisites
- Flutter SDK `>= 3.3.0`
- Dart SDK `>= 3.3.0`
- Android Studio / VS Code with Flutter extension
- Android Device or Emulator (API level 21+)

### Installation & Run

1. Clone or navigate to the project directory:
```bash
cd flutter_quizmaster
```

2. Fetch all package dependencies:
```bash
flutter pub get
```

3. Run widget tests to verify integrity:
```bash
flutter test
```

4. Run the app on your connected device or emulator:
```bash
flutter run
```

## 📦 Building Release APK

To generate a standalone, optimized release APK for Android:

1. Build the APK:
```bash
flutter build apk --release
```

2. (Optional) For an App Bundle ready for Google Play Store upload:
```bash
flutter build appbundle --release
```

3. Locate the compiled APK at:
`build/app/outputs/flutter-apk/app-release.apk`

4. Install directly on an Android phone via ADB:
```bash
adb install build/app/outputs/flutter-apk/app-release.apk
```
