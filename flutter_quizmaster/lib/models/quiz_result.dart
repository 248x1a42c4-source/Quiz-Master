class QuizResult {
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
