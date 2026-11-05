import 'package:flutter/material.dart';
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
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Question $current / $total', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
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
                        Text('${quiz.timeLeft}s', style: TextStyle(fontWeight: FontWeight.bold, color: quiz.timeLeft <= 5 ? Colors.redAccent : const Color(0xFF818CF8))),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
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
                        bgColor = const Color(0xFF065F46);
                        borderColor = const Color(0xFF10B981);
                      } else if (isSelected) {
                        bgColor = const Color(0xFF881337);
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
