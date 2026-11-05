import 'dart:convert';
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
