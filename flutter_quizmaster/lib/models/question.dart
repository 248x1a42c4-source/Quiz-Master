class Question {
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
