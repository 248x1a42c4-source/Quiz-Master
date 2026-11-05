export type Difficulty = 'easy' | 'medium' | 'hard' | 'any';

export type CategoryId = 
  | 'general'
  | 'science'
  | 'technology'
  | 'sports'
  | 'history'
  | 'programming'
  | 'custom';

export interface CategoryInfo {
  id: CategoryId;
  name: string;
  description: string;
  iconName: string;
  apiCategoryId?: number; // Open Trivia DB ID
  gradient: string;
  color: string;
  accentBorder: string;
  questionCountEstimate: number;
}

export interface Question {
  id: string;
  category: CategoryId;
  categoryName: string;
  question: string;
  correctAnswer: string;
  incorrectAnswers: string[];
  allAnswers?: string[]; // shuffled
  difficulty: 'easy' | 'medium' | 'hard';
  explanation?: string;
  isCustom?: boolean;
}

export interface QuizResult {
  id: string;
  timestamp: number;
  category: CategoryId;
  categoryName: string;
  difficulty: Difficulty;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  score: number;
  percentage: number;
  timeSpentSeconds: number;
  questionDetails: {
    question: string;
    userAnswer: string | null;
    correctAnswer: string;
    isCorrect: boolean;
    allAnswers: string[];
  }[];
}

export interface UserProfile {
  name: string;
  avatar: string;
  highestScore: number;
  totalQuizzesPlayed: number;
  totalCorrect: number;
  totalQuestionsAnswered: number;
  xp: number;
  currentStreak: number;
  bestStreak: number;
}

export interface QuizSettings {
  category: CategoryId;
  difficulty: Difficulty;
  questionCount: number;
  timerSeconds: number; // default 20s
}

export type ScreenType = 
  | 'home'
  | 'categories'
  | 'quiz'
  | 'results'
  | 'add-question'
  | 'profile';
