import { Question, QuizResult, UserProfile } from '../types/quiz';

const KEYS = {
  CUSTOM_QUESTIONS: 'quizmaster_custom_questions',
  QUIZ_HISTORY: 'quizmaster_history',
  USER_PROFILE: 'quizmaster_profile',
  ACTIVE_SETTINGS: 'quizmaster_settings',
};

const DEFAULT_PROFILE: UserProfile = {
  name: 'Quiz Explorer',
  avatar: '🧠',
  highestScore: 0,
  totalQuizzesPlayed: 0,
  totalCorrect: 0,
  totalQuestionsAnswered: 0,
  xp: 0,
  currentStreak: 0,
  bestStreak: 0,
};

const INITIAL_CUSTOM_QUESTIONS: Question[] = [
  {
    id: 'custom-demo-1',
    category: 'custom',
    categoryName: 'My Custom Questions',
    question: 'What is the primary role of a StatefulWidget in a Flutter application?',
    correctAnswer: 'Manages state that changes dynamically during widget lifecycle',
    incorrectAnswers: [
      'Renders immutable visual elements only',
      'Provides direct access to Android SQLite native code',
      'Manages cloud server deployment',
    ],
    difficulty: 'medium',
    explanation: 'StatefulWidget maintains state objects that can trigger visual UI updates.',
    isCustom: true,
  },
  {
    id: 'custom-demo-2',
    category: 'custom',
    categoryName: 'My Custom Questions',
    question: 'Which method must be called to notify Flutter framework that internal state has changed?',
    correctAnswer: 'setState(() { })',
    incorrectAnswers: ['notifyListeners()', 'rebuild()', 'updateState()'],
    difficulty: 'easy',
    explanation: 'Calling setState schedules a rebuild of the dirty State subtree.',
    isCustom: true,
  },
];

export class StorageService {
  public static getCustomQuestions(): Question[] {
    try {
      const data = localStorage.getItem(KEYS.CUSTOM_QUESTIONS);
      if (!data) {
        // Pre-seed demo custom questions
        localStorage.setItem(KEYS.CUSTOM_QUESTIONS, JSON.stringify(INITIAL_CUSTOM_QUESTIONS));
        return INITIAL_CUSTOM_QUESTIONS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_CUSTOM_QUESTIONS;
    }
  }

  public static saveCustomQuestion(question: Question): Question[] {
    const list = this.getCustomQuestions();
    const updated = [question, ...list];
    try {
      localStorage.setItem(KEYS.CUSTOM_QUESTIONS, JSON.stringify(updated));
    } catch {
      // ignore
    }
    return updated;
  }

  public static deleteCustomQuestion(id: string): Question[] {
    const list = this.getCustomQuestions().filter((q) => q.id !== id);
    try {
      localStorage.setItem(KEYS.CUSTOM_QUESTIONS, JSON.stringify(list));
    } catch {
      // ignore
    }
    return list;
  }

  public static getQuizHistory(): QuizResult[] {
    try {
      const data = localStorage.getItem(KEYS.QUIZ_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public static saveQuizResult(result: QuizResult): { history: QuizResult[]; profile: UserProfile } {
    const history = [result, ...this.getQuizHistory()];
    try {
      localStorage.setItem(KEYS.QUIZ_HISTORY, JSON.stringify(history));
    } catch {
      // ignore
    }

    const currentProfile = this.getUserProfile();
    const newHighest = Math.max(currentProfile.highestScore, result.score);
    const newTotalQuizzes = currentProfile.totalQuizzesPlayed + 1;
    const newTotalCorrect = currentProfile.totalCorrect + result.correctAnswers;
    const newTotalAnswered = currentProfile.totalQuestionsAnswered + result.totalQuestions;
    const gainedXp = result.score * 10 + result.correctAnswers * 50;
    const newXp = currentProfile.xp + gainedXp;

    // Streak logic: if accuracy >= 70%, streak +1, else resets to 0
    let streak = currentProfile.currentStreak;
    if (result.percentage >= 70) {
      streak += 1;
    } else {
      streak = 0;
    }
    const bestStreak = Math.max(currentProfile.bestStreak, streak);

    const updatedProfile: UserProfile = {
      ...currentProfile,
      highestScore: newHighest,
      totalQuizzesPlayed: newTotalQuizzes,
      totalCorrect: newTotalCorrect,
      totalQuestionsAnswered: newTotalAnswered,
      xp: newXp,
      currentStreak: streak,
      bestStreak: bestStreak,
    };

    this.saveUserProfile(updatedProfile);

    return { history, profile: updatedProfile };
  }

  public static getUserProfile(): UserProfile {
    try {
      const data = localStorage.getItem(KEYS.USER_PROFILE);
      return data ? { ...DEFAULT_PROFILE, ...JSON.parse(data) } : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  }

  public static saveUserProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
    } catch {
      // ignore
    }
  }

  public static clearHistory(): void {
    try {
      localStorage.removeItem(KEYS.QUIZ_HISTORY);
      const current = this.getUserProfile();
      this.saveUserProfile({
        ...current,
        totalQuizzesPlayed: 0,
        totalCorrect: 0,
        totalQuestionsAnswered: 0,
        highestScore: 0,
        xp: 0,
        currentStreak: 0,
      });
    } catch {
      // ignore
    }
  }
}
