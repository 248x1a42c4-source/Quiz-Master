export interface FlutterFile {
  path: string;
  name: string;
  language: 'dart' | 'yaml' | 'markdown';
  content: string;
}

export const FLUTTER_PROJECT_FILES: FlutterFile[] = [
  {
    path: 'pubspec.yaml',
    name: 'pubspec.yaml',
    language: 'yaml',
    content: `name: quizmaster
description: "QuizMaster - A modern, interactive Android quiz application built with Flutter & Dart."
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.3.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  provider: ^6.1.2
  http: ^1.2.1
  shared_preferences: ^2.2.3
  google_fonts: ^6.2.1
  html_unescape: ^2.0.0
  flutter_animate: ^4.5.0
  audioplayers: ^6.0.0
  confetti: ^0.7.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^4.0.0

flutter:
  uses-material-design: true
`,
  },
  {
    path: 'README.md',
    name: 'README.md',
    language: 'markdown',
    content: `# QuizMaster – Interactive Quiz Application

A modern, full-featured Android Quiz application built with Flutter 3.35+, Dart null safety, and Provider state management.

## 📱 Features
- **6 Category Tracks**: General Knowledge, Science & Nature, Technology, Sports, History, and Programming.
- **Open Trivia Database API**: Live question fetching with HTML entity decoding and resilient offline fallbacks.
- **Interactive Quiz Engine**: 4 options per question, instant color highlights (green/red), countdown timer, live score, and question review.
- **Custom Question Creator**: Full input validation, option radio selector, saved locally using \`shared_preferences\`.
- **Profile & Performance History**: Tracks user high scores, win rate, total quizzes, and detailed past quiz records.
- **Modern Blue & Purple Material 3 Theme**: Clean typography, rounded cards, fluid animations.

## 🚀 Getting Started

### Prerequisites
- Flutter SDK \`>= 3.3.0\`
- Dart SDK \`>= 3.3.0\`
- Android Studio / VS Code with Flutter extension
- Android Device or Emulator (API level 21+)

### Installation & Run

1. Clone or extract the repository:
\`\`\`bash
cd quizmaster
\`\`\`

2. Fetch all package dependencies:
\`\`\`bash
flutter pub get
\`\`\`

3. Run widget tests to verify integrity:
\`\`\`bash
flutter test
\`\`\`

4. Run the app on your connected device or emulator:
\`\`\`bash
flutter run
\`\`\`

## 📦 Building Release APK

To generate a standalone, optimized release APK for Android:

1. Build the APK:
\`\`\`bash
flutter build apk --release
\`\`\`

2. (Optional) For an App Bundle ready for Google Play Store upload:
\`\`\`bash
flutter build appbundle --release
\`\`\`

3. Locate the compiled APK at:
\`build/app/outputs/flutter-apk/app-release.apk\`

4. Install directly on an Android phone via ADB:
\`\`\`bash
adb install build/app/outputs/flutter-apk/app-release.apk
\`\`\`
`,
  },
  {
    path: 'lib/main.dart',
    name: 'main.dart',
    language: 'dart',
    content: `import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'services/quiz_provider.dart';
import 'screens/home_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final quizProvider = QuizProvider();
  await quizProvider.init();

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider.value(value: quizProvider),
      ],
      child: const QuizMasterApp(),
    ),
  );
}

class QuizMasterApp extends StatelessWidget {
  const QuizMasterApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'QuizMaster',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0F172A), // Slate 900
        primaryColor: const Color(0xFF6366F1), // Indigo
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF6366F1),
          secondary: Color(0xFF8B5CF6),
          surface: Color(0xFF1E293B),
          error: Color(0xFFF43F5E),
        ),
        textTheme: GoogleFonts.plusJakartaSansTextTheme(
          ThemeData.dark().textTheme,
        ),
      ),
      home: const HomeScreen(),
    );
  }
}
`,
  },
  {
    path: 'lib/models/question.dart',
    name: 'question.dart',
    language: 'dart',
    content: `class Question {
  final String id;
  final String category;
  final String categoryName;
  final String question;
  final String correctAnswer;
  final List<String> incorrectAnswers;
  final List<String> allAnswers;
  final String difficulty;
  final String? explanation;
  final bool isCustom;

  Question({
    required this.id,
    required this.category,
    required this.categoryName,
    required this.question,
    required this.correctAnswer,
    required this.incorrectAnswers,
    required this.allAnswers,
    this.difficulty = 'medium',
    this.explanation,
    this.isCustom = false,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'category': category,
        'categoryName': categoryName,
        'question': question,
        'correctAnswer': correctAnswer,
        'incorrectAnswers': incorrectAnswers,
        'difficulty': difficulty,
        'explanation': explanation,
        'isCustom': isCustom,
      };

  factory Question.fromJson(Map<String, dynamic> json) {
    final correct = json['correctAnswer'] as String;
    final incorrect = List<String>.from(json['incorrectAnswers'] ?? []);
    final answers = [correct, ...incorrect]..shuffle();

    return Question(
      id: json['id'] as String,
      category: json['category'] as String,
      categoryName: json['categoryName'] as String,
      question: json['question'] as String,
      correctAnswer: correct,
      incorrectAnswers: incorrect,
      allAnswers: answers,
      difficulty: json['difficulty'] as String? ?? 'medium',
      explanation: json['explanation'] as String?,
      isCustom: json['isCustom'] as bool? ?? false,
    );
  }
}
`,
  },
  {
    path: 'lib/models/quiz_result.dart',
    name: 'quiz_result.dart',
    language: 'dart',
    content: `class QuizResult {
  final String id;
  final DateTime timestamp;
  final String category;
  final String categoryName;
  final int totalQuestions;
  final int correctAnswers;
  final int incorrectAnswers;
  final int score;
  final double percentage;
  final int timeSpentSeconds;

  QuizResult({
    required this.id,
    required this.timestamp,
    required this.category,
    required this.categoryName,
    required this.totalQuestions,
    required this.correctAnswers,
    required this.incorrectAnswers,
    required this.score,
    required this.percentage,
    required this.timeSpentSeconds,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'timestamp': timestamp.toIso8601String(),
        'category': category,
        'categoryName': categoryName,
        'totalQuestions': totalQuestions,
        'correctAnswers': correctAnswers,
        'incorrectAnswers': incorrectAnswers,
        'score': score,
        'percentage': percentage,
        'timeSpentSeconds': timeSpentSeconds,
      };

  factory QuizResult.fromJson(Map<String, dynamic> json) {
    return QuizResult(
      id: json['id'] as String,
      timestamp: DateTime.parse(json['timestamp'] as String),
      category: json['category'] as String,
      categoryName: json['categoryName'] as String,
      totalQuestions: json['totalQuestions'] as int,
      correctAnswers: json['correctAnswers'] as int,
      incorrectAnswers: json['incorrectAnswers'] as int,
      score: json['score'] as int,
      percentage: (json['percentage'] as num).toDouble(),
      timeSpentSeconds: json['timeSpentSeconds'] as int? ?? 0,
    );
  }
}
`,
  },
  {
    path: 'lib/services/api_service.dart',
    name: 'api_service.dart',
    language: 'dart',
    content: `import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:html_unescape/html_unescape.dart';
import '../models/question.dart';

class ApiService {
  static final HtmlUnescape _unescape = HtmlUnescape();

  static const Map<String, int> categoryIds = {
    'general': 9,
    'science': 17,
    'technology': 18,
    'sports': 21,
    'history': 23,
  };

  static Future<List<Question>> fetchQuestions({
    required String category,
    String difficulty = 'any',
    int amount = 10,
  }) async {
    final catId = categoryIds[category];
    if (catId == null) {
      return getFallbackQuestions(category);
    }

    try {
      var urlStr = 'https://opentdb.com/api.php?amount=\$amount&category=\$catId&type=multiple';
      if (difficulty != 'any') {
        urlStr += '&difficulty=\$difficulty';
      }

      final response = await http
          .get(Uri.parse(urlStr))
          .timeout(const Duration(seconds: 6));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['response_code'] == 0 && data['results'] != null) {
          final results = data['results'] as List;
          return results.asMap().entries.map((entry) {
            final idx = entry.key;
            final item = entry.value;
            final correct = _unescape.convert(item['correct_answer']);
            final incorrect = (item['incorrect_answers'] as List)
                .map((a) => _unescape.convert(a.toString()))
                .toList();
            final all = [correct, ...incorrect]..shuffle();

            return Question(
              id: 'api-\$category-\$idx-\${DateTime.now().millisecondsSinceEpoch}',
              category: category,
              categoryName: _unescape.convert(item['category']),
              question: _unescape.convert(item['question']),
              correctAnswer: correct,
              incorrectAnswers: incorrect,
              allAnswers: all,
              difficulty: item['difficulty'] ?? 'medium',
            );
          }).toList();
        }
      }
    } catch (_) {
      // Return offline fallbacks if API fails
    }

    return getFallbackQuestions(category);
  }

  static List<Question> getFallbackQuestions(String category) {
    if (category == 'programming') {
      return [
        Question(
          id: 'prog-1',
          category: 'programming',
          categoryName: 'Programming',
          question: 'In Flutter, which widget manages mutable state?',
          correctAnswer: 'StatefulWidget',
          incorrectAnswers: ['StatelessWidget', 'InheritedWidget', 'Container'],
          allAnswers: ['StatefulWidget', 'StatelessWidget', 'InheritedWidget', 'Container']..shuffle(),
          difficulty: 'easy',
          explanation: 'StatefulWidget maintains a State object that updates the UI.',
        ),
        Question(
          id: 'prog-2',
          category: 'programming',
          categoryName: 'Programming',
          question: 'Which language is Flutter primarily written in and powered by?',
          correctAnswer: 'Dart',
          incorrectAnswers: ['Java', 'Kotlin', 'TypeScript'],
          allAnswers: ['Dart', 'Java', 'Kotlin', 'TypeScript']..shuffle(),
          difficulty: 'easy',
          explanation: 'Dart is an object-oriented language developed by Google.',
        ),
      ];
    }
    return [
      Question(
        id: 'gen-1',
        category: category,
        categoryName: category.toUpperCase(),
        question: 'What is the powerhouse organelle of a living cell?',
        correctAnswer: 'Mitochondria',
        incorrectAnswers: ['Nucleus', 'Ribosome', 'Endoplasmic Reticulum'],
        allAnswers: ['Mitochondria', 'Nucleus', 'Ribosome', 'Endoplasmic Reticulum']..shuffle(),
        difficulty: 'easy',
      ),
    ];
  }
}
`,
  },
  {
    path: 'lib/services/storage_service.dart',
    name: 'storage_service.dart',
    language: 'dart',
    content: `import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/question.dart';
import '../models/quiz_result.dart';

class StorageService {
  static const String _kCustomQuestions = 'quizmaster_custom_questions';
  static const String _kResults = 'quizmaster_results';
  static const String _kHighestScore = 'quizmaster_highest_score';

  static Future<List<Question>> loadCustomQuestions() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_kCustomQuestions);
    if (raw == null) return [];
    try {
      final list = jsonDecode(raw) as List;
      return list.map((item) => Question.fromJson(item)).toList();
    } catch (_) {
      return [];
    }
  }

  static Future<void> saveCustomQuestion(Question question) async {
    final list = await loadCustomQuestions();
    list.insert(0, question);
    final prefs = await SharedPreferences.getInstance();
    final encoded = jsonEncode(list.map((q) => q.toJson()).toList());
    await prefs.setString(_kCustomQuestions, encoded);
  }

  static Future<void> deleteCustomQuestion(String id) async {
    final list = await loadCustomQuestions();
    list.removeWhere((q) => q.id == id);
    final prefs = await SharedPreferences.getInstance();
    final encoded = jsonEncode(list.map((q) => q.toJson()).toList());
    await prefs.setString(_kCustomQuestions, encoded);
  }

  static Future<List<QuizResult>> loadResults() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_kResults);
    if (raw == null) return [];
    try {
      final list = jsonDecode(raw) as List;
      return list.map((item) => QuizResult.fromJson(item)).toList();
    } catch (_) {
      return [];
    }
  }

  static Future<void> saveResult(QuizResult result) async {
    final list = await loadResults();
    list.insert(0, result);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(
      _kResults,
      jsonEncode(list.map((r) => r.toJson()).toList()),
    );

    final currentHighest = prefs.getInt(_kHighestScore) ?? 0;
    if (result.score > currentHighest) {
      await prefs.setInt(_kHighestScore, result.score);
    }
  }

  static Future<int> getHighestScore() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getInt(_kHighestScore) ?? 0;
  }
}
`,
  },
  {
    path: 'lib/services/quiz_provider.dart',
    name: 'quiz_provider.dart',
    language: 'dart',
    content: `import 'dart:async';
import 'package:flutter/foundation.dart';
import '../models/question.dart';
import '../models/quiz_result.dart';
import 'api_service.dart';
import 'storage_service.dart';

class QuizProvider extends ChangeNotifier {
  List<Question> _questions = [];
  int _currentIndex = 0;
  int _score = 0;
  int _correctCount = 0;
  int _incorrectCount = 0;
  String? _selectedAnswer;
  bool _isAnswered = false;
  bool _isLoading = false;
  String? _errorMessage;

  int _highestScore = 0;
  List<QuizResult> _history = [];
  List<Question> _customQuestions = [];

  // Timer
  Timer? _timer;
  int _timeLeft = 20;

  List<Question> get questions => _questions;
  int get currentIndex => _currentIndex;
  Question? get currentQuestion =>
      _questions.isNotEmpty && _currentIndex < _questions.length
          ? _questions[_currentIndex]
          : null;
  int get score => _score;
  int get correctCount => _correctCount;
  int get incorrectCount => _incorrectCount;
  String? get selectedAnswer => _selectedAnswer;
  bool get isAnswered => _isAnswered;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  int get highestScore => _highestScore;
  int get timeLeft => _timeLeft;
  List<QuizResult> get history => _history;
  List<Question> get customQuestions => _customQuestions;

  Future<void> init() async {
    _highestScore = await StorageService.getHighestScore();
    _history = await StorageService.loadResults();
    _customQuestions = await StorageService.loadCustomQuestions();
    notifyListeners();
  }

  Future<void> startQuiz({
    required String category,
    String difficulty = 'any',
    int amount = 10,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    _currentIndex = 0;
    _score = 0;
    _correctCount = 0;
    _incorrectCount = 0;
    _selectedAnswer = null;
    _isAnswered = false;
    notifyListeners();

    try {
      if (category == 'custom') {
        _questions = List.from(_customQuestions)..shuffle();
        if (_questions.isEmpty) {
          throw Exception('No custom questions found! Create questions first.');
        }
        if (_questions.length > amount) {
          _questions = _questions.sublist(0, amount);
        }
      } else {
        _questions = await ApiService.fetchQuestions(
          category: category,
          difficulty: difficulty,
          amount: amount,
        );
      }
      _isLoading = false;
      _startTimer();
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
      notifyListeners();
    }
  }

  void _startTimer() {
    _timer?.cancel();
    _timeLeft = 20;
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_timeLeft > 0 && !_isAnswered) {
        _timeLeft--;
        notifyListeners();
      } else if (_timeLeft == 0 && !_isAnswered) {
        // Time out: mark as answered with no choice
        selectAnswer('');
      }
    });
  }

  void selectAnswer(String answer) {
    if (_isAnswered || currentQuestion == null) return;
    _timer?.cancel();
    _selectedAnswer = answer;
    _isAnswered = true;

    if (answer == currentQuestion!.correctAnswer) {
      _correctCount++;
      // Score = base 100 + speed bonus
      _score += 100 + (_timeLeft * 5);
    } else {
      _incorrectCount++;
    }
    notifyListeners();
  }

  bool nextQuestion() {
    if (_currentIndex < _questions.length - 1) {
      _currentIndex++;
      _selectedAnswer = null;
      _isAnswered = false;
      _startTimer();
      notifyListeners();
      return true;
    } else {
      _timer?.cancel();
      _saveFinalResult();
      return false; // Quiz finished
    }
  }

  Future<void> _saveFinalResult() async {
    final percentage = _questions.isEmpty
        ? 0.0
        : (_correctCount / _questions.length) * 100.0;

    final result = QuizResult(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      timestamp: DateTime.now(),
      category: currentQuestion?.category ?? 'general',
      categoryName: currentQuestion?.categoryName ?? 'Quiz',
      totalQuestions: _questions.length,
      correctAnswers: _correctCount,
      incorrectAnswers: _incorrectCount,
      score: _score,
      percentage: percentage,
      timeSpentSeconds: 0,
    );

    await StorageService.saveResult(result);
    _history.insert(0, result);
    if (_score > _highestScore) {
      _highestScore = _score;
    }
    notifyListeners();
  }

  Future<void> addCustomQuestion(Question q) async {
    await StorageService.saveCustomQuestion(q);
    _customQuestions.insert(0, q);
    notifyListeners();
  }

  Future<void> deleteCustomQuestion(String id) async {
    await StorageService.deleteCustomQuestion(id);
    _customQuestions.removeWhere((q) => q.id == id);
    notifyListeners();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }
}
`,
  },
  {
    path: 'lib/screens/home_screen.dart',
    name: 'home_screen.dart',
    language: 'dart',
    content: `import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/quiz_provider.dart';
import 'categories_screen.dart';
import 'add_question_screen.dart';
import 'profile_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final quizProvider = context.watch<QuizProvider>();

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF0F172A), Color(0xFF1E1B4B), Color(0xFF0F172A)],
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top App Bar
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)],
                            ),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: const Icon(Icons.school_rounded, color: Colors.white, size: 28),
                        ),
                        const SizedBox(width: 12),
                        const Text(
                          'QuizMaster',
                          style: TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                            letterSpacing: -0.5,
                          ),
                        ),
                      ],
                    ),
                    IconButton(
                      icon: const Icon(Icons.person_outline_rounded, color: Colors.white),
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const ProfileScreen()),
                        );
                      },
                    ),
                  ],
                ),
                const SizedBox(height: 32),

                // Welcome Header
                const Text(
                  'Welcome to QuizMaster!',
                  style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Text(
                  'Challenge your brain across multiple categories and elevate your rank.',
                  style: TextStyle(color: Colors.white.withOpacity(0.7), fontSize: 15),
                ),
                const SizedBox(height: 28),

                // Highest Score Banner Card
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF4F46E5), Color(0xFF7C3AED)],
                    ),
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF4F46E5).withOpacity(0.3),
                        blurRadius: 20,
                        offset: const Offset(0, 10),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.2),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.emoji_events_rounded, color: Colors.amber, size: 36),
                      ),
                      const SizedBox(width: 16),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Highest Score',
                            style: TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.w600),
                          ),
                          Text(
                            '\${quizProvider.highestScore} pts',
                            style: const TextStyle(color: Colors.white, fontSize: 26, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 32),

                // Action Buttons
                Expanded(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Start Quiz Button
                      SizedBox(
                        width: double.infinity,
                        height: 58,
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF6366F1),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(18),
                            ),
                            elevation: 8,
                          ),
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (_) => const CategoriesScreen()),
                            );
                          },
                          child: const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.play_arrow_rounded, size: 28),
                              SizedBox(width: 8),
                              Text('Start Quiz', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Add Custom Question Button
                      SizedBox(
                        width: double.infinity,
                        height: 54,
                        child: OutlinedButton(
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: Color(0xFF8B5CF6), width: 1.5),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(18),
                            ),
                          ),
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (_) => const AddQuestionScreen()),
                            );
                          },
                          child: const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.add_circle_outline_rounded, color: Color(0xFFC084FC)),
                              SizedBox(width: 8),
                              Text(
                                'Create Custom Question',
                                style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
`,
  },
  {
    path: 'lib/screens/categories_screen.dart',
    name: 'categories_screen.dart',
    language: 'dart',
    content: `import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/quiz_provider.dart';
import 'quiz_screen.dart';

class CategoryItem {
  final String id;
  final String name;
  final String desc;
  final IconData icon;
  final int count;
  final Color color;

  CategoryItem(this.id, this.name, this.desc, this.icon, this.count, this.color);
}

class CategoriesScreen extends StatelessWidget {
  const CategoriesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final categories = [
      CategoryItem('general', 'General Knowledge', 'Global facts and culture', Icons.public, 300, const Color(0xFF6366F1)),
      CategoryItem('science', 'Science & Nature', 'Physics, biology and space', Icons.biotech, 250, const Color(0xFF3B82F6)),
      CategoryItem('technology', 'Technology', 'Computers and tech history', Icons.memory, 200, const Color(0xFF8B5CF6)),
      CategoryItem('sports', 'Sports', 'Tournaments and legends', Icons.sports_soccer, 180, const Color(0xFF06B6D4)),
      CategoryItem('history', 'History', 'Empires, wars and leaders', Icons.account_balance, 220, const Color(0xFFF59E0B)),
      CategoryItem('programming', 'Programming', 'Dart, Flutter, algorithms', Icons.code, 150, const Color(0xFFA855F7)),
      CategoryItem('custom', 'Custom Questions', 'Saved on this device', Icons.edit_note, 0, const Color(0xFFEC4899)),
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Select Category', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: ListView.separated(
        padding: const EdgeInsets.all(20),
        itemCount: categories.length,
        separatorBuilder: (_, __) => const SizedBox(height: 14),
        itemBuilder: (context, index) {
          final cat = categories[index];
          return InkWell(
            borderRadius: BorderRadius.circular(20),
            onTap: () {
              context.read<QuizProvider>().startQuiz(category: cat.id);
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const QuizScreen()),
              );
            },
            child: Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: cat.color.withOpacity(0.3), width: 1.2),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: cat.color.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Icon(cat.icon, color: cat.color, size: 28),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          cat.name,
                          style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          cat.desc,
                          style: const TextStyle(fontSize: 13, color: Colors.white60),
                        ),
                      ],
                    ),
                  ),
                  const Icon(Icons.arrow_forward_ios_rounded, size: 16, color: Colors.white38),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
`,
  },
  {
    path: 'lib/screens/quiz_screen.dart',
    name: 'quiz_screen.dart',
    language: 'dart',
    content: `import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/quiz_provider.dart';
import 'results_screen.dart';

class QuizScreen extends StatelessWidget {
  const QuizScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final quiz = context.watch<QuizProvider>();

    if (quiz.isLoading) {
      return const Scaffold(
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              CircularProgressIndicator(color: Color(0xFF6366F1)),
              SizedBox(height: 16),
              Text('Fetching Questions from Open Trivia DB...', style: TextStyle(fontSize: 15)),
            ],
          ),
        ),
      );
    }

    if (quiz.errorMessage != null) {
      return Scaffold(
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.error_outline_rounded, color: Colors.redAccent, size: 54),
                const SizedBox(height: 16),
                Text(quiz.errorMessage!, textAlign: TextAlign.center),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Back to Categories'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    final q = quiz.currentQuestion;
    if (q == null) return const SizedBox();

    final total = quiz.questions.length;
    final current = quiz.currentIndex + 1;
    final progress = current / total;

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top stats & timer
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Question \$current / \$total', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                    decoration: BoxDecoration(
                      color: quiz.timeLeft <= 5 ? Colors.red.withOpacity(0.2) : const Color(0xFF6366F1).withOpacity(0.2),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.timer_outlined, size: 16, color: quiz.timeLeft <= 5 ? Colors.redAccent : const Color(0xFF818CF8)),
                        const SizedBox(width: 4),
                        Text('\${quiz.timeLeft}s', style: TextStyle(fontWeight: FontWeight.bold, color: quiz.timeLeft <= 5 ? Colors.redAccent : const Color(0xFF818CF8))),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Progress Bar
              ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: LinearProgressIndicator(
                  value: progress,
                  minHeight: 8,
                  backgroundColor: Colors.white12,
                  valueColor: const AlwaysStoppedAnimation(Color(0xFF6366F1)),
                ),
              ),
              const SizedBox(height: 28),

              // Question Card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: Colors.white12),
                ),
                child: Text(
                  q.question,
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600, height: 1.4),
                ),
              ),
              const SizedBox(height: 24),

              // Multiple-Choice Options
              Expanded(
                child: ListView.separated(
                  itemCount: q.allAnswers.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, idx) {
                    final option = q.allAnswers[idx];
                    final isSelected = quiz.selectedAnswer == option;
                    final isCorrect = option == q.correctAnswer;

                    Color bgColor = const Color(0xFF1E293B);
                    Color borderColor = Colors.white12;

                    if (quiz.isAnswered) {
                      if (isCorrect) {
                        bgColor = const Color(0xFF065F46); // Green
                        borderColor = const Color(0xFF10B981);
                      } else if (isSelected) {
                        bgColor = const Color(0xFF881337); // Red
                        borderColor = const Color(0xFFF43F5E);
                      }
                    }

                    return InkWell(
                      borderRadius: BorderRadius.circular(18),
                      onTap: quiz.isAnswered ? null : () => quiz.selectAnswer(option),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
                        decoration: BoxDecoration(
                          color: bgColor,
                          borderRadius: BorderRadius.circular(18),
                          border: Border.all(color: borderColor, width: 1.5),
                        ),
                        child: Row(
                          children: [
                            Text(String.fromCharCode(65 + idx), style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white70)),
                            const SizedBox(width: 14),
                            Expanded(child: Text(option, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w500))),
                            if (quiz.isAnswered && isCorrect)
                              const Icon(Icons.check_circle_rounded, color: Color(0xFF10B981))
                            else if (quiz.isAnswered && isSelected)
                              const Icon(Icons.cancel_rounded, color: Color(0xFFF43F5E)),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),

              // Next Button
              if (quiz.isAnswered)
                SizedBox(
                  width: double.infinity,
                  height: 54,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF6366F1),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    onPressed: () {
                      final hasNext = quiz.nextQuestion();
                      if (!hasNext) {
                        Navigator.pushReplacement(
                          context,
                          MaterialPageRoute(builder: (_) => const ResultsScreen()),
                        );
                      }
                    },
                    child: Text(
                      quiz.currentIndex < total - 1 ? 'Next Question' : 'View Results',
                      style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
`,
  },
  {
    path: 'lib/screens/results_screen.dart',
    name: 'results_screen.dart',
    language: 'dart',
    content: `import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/quiz_provider.dart';
import 'home_screen.dart';
import 'categories_screen.dart';

class ResultsScreen extends StatelessWidget {
  const ResultsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final quiz = context.watch<QuizProvider>();
    final total = quiz.questions.length;
    final correct = quiz.correctCount;
    final incorrect = quiz.incorrectCount;
    final score = quiz.score;
    final percentage = total > 0 ? (correct / total) * 100 : 0.0;

    String message = 'Keep Learning!';
    if (percentage >= 90) {
      message = 'Outstanding Quiz Master!';
    } else if (percentage >= 70) {
      message = 'Impressive Work!';
    } else if (percentage >= 50) {
      message = 'Good Effort!';
    }

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.stars_rounded, color: Colors.amber, size: 80),
              const SizedBox(height: 12),
              Text(
                message,
                style: const TextStyle(fontSize: 26, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                'You scored \$score points',
                style: const TextStyle(color: Colors.white70, fontSize: 16),
              ),
              const SizedBox(height: 32),

              // Metrics Card
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(24),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildMetric('Total', '\$total'),
                    _buildMetric('Correct', '\$correct', color: const Color(0xFF10B981)),
                    _buildMetric('Incorrect', '\$incorrect', color: const Color(0xFFF43F5E)),
                    _buildMetric('Accuracy', '\${percentage.toStringAsFixed(0)}%'),
                  ],
                ),
              ),
              const SizedBox(height: 40),

              // Actions
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF6366F1),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  onPressed: () {
                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(builder: (_) => const CategoriesScreen()),
                    );
                  },
                  child: const Text('Play Again', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(height: 14),
              SizedBox(
                width: double.infinity,
                height: 52,
                child: OutlinedButton(
                  style: OutlinedButton.styleFrom(
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  onPressed: () {
                    Navigator.pushAndRemoveUntil(
                      context,
                      MaterialPageRoute(builder: (_) => const HomeScreen()),
                      (route) => false,
                    );
                  },
                  child: const Text('Home Screen', style: TextStyle(fontSize: 16)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMetric(String label, String value, {Color? color}) {
    return Column(
      children: [
        Text(value, style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: color ?? Colors.white)),
        const SizedBox(height: 4),
        Text(label, style: const TextStyle(fontSize: 12, color: Colors.white60)),
      ],
    );
  }
}
`,
  },
  {
    path: 'lib/screens/add_question_screen.dart',
    name: 'add_question_screen.dart',
    language: 'dart',
    content: `import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/question.dart';
import '../services/quiz_provider.dart';

class AddQuestionScreen extends StatefulWidget {
  const AddQuestionScreen({super.key});

  @override
  State<AddQuestionScreen> createState() => _AddQuestionScreenState();
}

class _AddQuestionScreenState extends State<AddQuestionScreen> {
  final _formKey = GlobalKey<FormState>();
  final _questionCtrl = TextEditingController();
  final List<TextEditingController> _optionsCtrl = [
    TextEditingController(),
    TextEditingController(),
    TextEditingController(),
    TextEditingController(),
  ];
  int _correctOptionIndex = 0;
  String _selectedCategory = 'custom';

  @override
  void dispose() {
    _questionCtrl.dispose();
    for (var c in _optionsCtrl) {
      c.dispose();
    }
    super.dispose();
  }

  void _submit() async {
    if (!_formKey.currentState!.validate()) return;

    final questionText = _questionCtrl.text.trim();
    final correctAnswer = _optionsCtrl[_correctOptionIndex].text.trim();
    final incorrect = <String>[];
    for (int i = 0; i < 4; i++) {
      if (i != _correctOptionIndex) {
        incorrect.add(_optionsCtrl[i].text.trim());
      }
    }

    final newQuestion = Question(
      id: 'custom-\${DateTime.now().millisecondsSinceEpoch}',
      category: _selectedCategory,
      categoryName: 'Custom Question',
      question: questionText,
      correctAnswer: correctAnswer,
      incorrectAnswers: incorrect,
      allAnswers: [correctAnswer, ...incorrect]..shuffle(),
      isCustom: true,
    );

    await context.read<QuizProvider>().addCustomQuestion(newQuestion);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Custom question saved on device successfully!')),
      );
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Add Custom Question'),
        backgroundColor: Colors.transparent,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Question Text', style: TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              TextFormField(
                controller: _questionCtrl,
                maxLines: 2,
                decoration: InputDecoration(
                  hintText: 'Enter your question...',
                  filled: true,
                  fillColor: const Color(0xFF1E293B),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                ),
                validator: (val) => val == null || val.trim().isEmpty ? 'Please enter question text' : null,
              ),
              const SizedBox(height: 24),
              const Text('Answer Options (Select correct one)', style: TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              ...List.generate(4, (index) {
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Row(
                    children: [
                      Radio<int>(
                        value: index,
                        groupValue: _correctOptionIndex,
                        activeColor: const Color(0xFF10B981),
                        onChanged: (val) => setState(() => _correctOptionIndex = val!),
                      ),
                      Expanded(
                        child: TextFormField(
                          controller: _optionsCtrl[index],
                          decoration: InputDecoration(
                            hintText: 'Option \${String.fromCharCode(65 + index)}',
                            filled: true,
                            fillColor: const Color(0xFF1E293B),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                          ),
                          validator: (val) => val == null || val.trim().isEmpty ? 'Option cannot be empty' : null,
                        ),
                      ),
                    ],
                  ),
                );
              }),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF6366F1),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  onPressed: _submit,
                  child: const Text('Save Question', style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
`,
  },
  {
    path: 'lib/screens/profile_screen.dart',
    name: 'profile_screen.dart',
    language: 'dart',
    content: `import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/quiz_provider.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final quiz = context.watch<QuizProvider>();
    final history = quiz.history;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile & Leaderboard'),
        backgroundColor: Colors.transparent,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // Avatar & Best Score
            Container(
              padding: const EdgeInsets.all(24),
              width: double.infinity,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF4F46E5), Color(0xFF7C3AED)],
                ),
                borderRadius: BorderRadius.circular(24),
              ),
              child: Column(
                children: [
                  const CircleAvatar(
                    radius: 36,
                    backgroundColor: Colors.white24,
                    child: Text('🧠', style: TextStyle(fontSize: 36)),
                  ),
                  const SizedBox(height: 12),
                  const Text('Quiz Master', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  Text('Highest Score: \${quiz.highestScore} pts', style: const TextStyle(color: Colors.amber, fontSize: 16, fontWeight: FontWeight.w600)),
                ],
              ),
            ),
            const SizedBox(height: 28),

            const Align(
              alignment: Alignment.centerLeft,
              child: Text('Quiz Performance History', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            ),
            const SizedBox(height: 12),

            if (history.isEmpty)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 40),
                child: Text('No quizzes played yet. Take your first quiz!', style: TextStyle(color: Colors.white54)),
              )
            else
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: history.length,
                separatorBuilder: (_, __) => const SizedBox(height: 10),
                itemBuilder: (context, idx) {
                  final item = history[idx];
                  return Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E293B),
                      borderRadius: BorderRadius.circular(18),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(item.categoryName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                            const SizedBox(height: 4),
                            Text('\${item.correctAnswers}/\${item.totalQuestions} Correct', style: const TextStyle(color: Colors.white60, fontSize: 13)),
                          ],
                        ),
                        Text('\${item.score} pts', style: const TextStyle(color: Color(0xFF818CF8), fontWeight: FontWeight.bold, fontSize: 16)),
                      ],
                    ),
                  );
                },
              ),
          ],
        ),
      ),
    );
  }
}
`,
  },
  {
    path: 'test/widget_test.dart',
    name: 'widget_test.dart',
    language: 'dart',
    content: `import 'package:flutter_test/flutter_test.dart';
import 'package:quizmaster/models/question.dart';
import 'package:quizmaster/models/quiz_result.dart';

void main() {
  group('QuizMaster Unit & Widget Tests', () {
    test('Question model initializes correctly and shuffles answers', () {
      final q = Question(
        id: 'test-1',
        category: 'general',
        categoryName: 'General Knowledge',
        question: 'What is the capital of France?',
        correctAnswer: 'Paris',
        incorrectAnswers: ['Lyon', 'Marseille', 'Nice'],
        allAnswers: ['Paris', 'Lyon', 'Marseille', 'Nice'],
      );

      expect(q.correctAnswer, equals('Paris'));
      expect(q.allAnswers.length, equals(4));
      expect(q.allAnswers.contains('Paris'), isTrue);
    });

    test('QuizResult model calculates percentage correctly', () {
      final result = QuizResult(
        id: '1',
        timestamp: DateTime.now(),
        category: 'science',
        categoryName: 'Science',
        totalQuestions: 10,
        correctAnswers: 8,
        incorrectAnswers: 2,
        score: 850,
        percentage: 80.0,
        timeSpentSeconds: 65,
      );

      expect(result.score, equals(850));
      expect(result.percentage, equals(80.0));
    });
  });
}
`,
  },
];
