import 'dart:convert';
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
      var urlStr = 'https://opentdb.com/api.php?amount=$amount&category=$catId&type=multiple';
      if (difficulty != 'any') {
        urlStr += '&difficulty=$difficulty';
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
              id: 'api-$category-$idx-${DateTime.now().millisecondsSinceEpoch}',
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
