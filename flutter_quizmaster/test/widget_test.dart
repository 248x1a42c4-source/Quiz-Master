import 'package:flutter_test/flutter_test.dart';
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
