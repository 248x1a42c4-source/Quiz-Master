import 'dart:async';
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
        // Time out
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
      return false;
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
