import 'package:flutter/material.dart';
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
  final String _selectedCategory = 'custom';

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
      id: 'custom-${DateTime.now().millisecondsSinceEpoch}',
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
                            hintText: 'Option ${String.fromCharCode(65 + index)}',
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
