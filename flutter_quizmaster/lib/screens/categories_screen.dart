import 'package:flutter/material.dart';
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
