import React, { useState, useEffect, useRef } from 'react';
import { Question, QuizResult, QuizSettings, ScreenType } from '../types/quiz';
import { OpenTdbService } from '../services/openTdbService';
import { soundService } from '../services/soundService';
import { QUIZ_CATEGORIES } from '../data/categories';
import { 
  Timer, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Flame, 
  RotateCcw, 
  AlertCircle, 
  HelpCircle,
  Trophy,
  Loader2,
  Sparkles
} from 'lucide-react';

interface QuizScreenProps {
  settings: QuizSettings;
  onFinishQuiz: (result: QuizResult) => void;
  onExit: () => void;
}

export const QuizScreen: React.FC<QuizScreenProps> = ({
  settings,
  onFinishQuiz,
  onExit,
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'api' | 'fallback' | 'custom'>('api');

  // Question interaction state
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [incorrectCount, setIncorrectCount] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);

  // Timer
  const [timeLeft, setTimeLeft] = useState<number>(settings.timerSeconds || 20);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Performance log for review
  const questionDetailsRef = useRef<{
    question: string;
    userAnswer: string | null;
    correctAnswer: string;
    isCorrect: boolean;
    allAnswers: string[];
  }[]>([]);

  // Load questions on mount
  useEffect(() => {
    loadQuestions();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const loadQuestions = async () => {
    setIsLoading(true);
    setError(null);
    setCurrentIndex(0);
    setScore(0);
    setCorrectCount(0);
    setIncorrectCount(0);
    setStreak(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    questionDetailsRef.current = [];
    startTimeRef.current = Date.now();

    const catObj = QUIZ_CATEGORIES.find((c) => c.id === settings.category);

    try {
      const res = await OpenTdbService.fetchQuestions(
        settings.category,
        catObj?.apiCategoryId,
        settings.difficulty,
        settings.questionCount
      );

      if (!res.questions || res.questions.length === 0) {
        throw new Error('No questions available for this selection. Try different settings or create custom questions.');
      }

      setQuestions(res.questions);
      setDataSource(res.source);
      setIsLoading(false);
      resetTimer();
    } catch (err: unknown) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : 'Failed to fetch questions. Please check your connection.');
    }
  };

  // Timer management
  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(settings.timerSeconds || 20);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeOut();
          return 0;
        }
        if (prev <= 4) {
          soundService.playTick();
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeOut = () => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedAnswer(''); // no choice
    soundService.playIncorrect();

    const currentQ = questions[currentIndex];
    if (currentQ) {
      setIncorrectCount((c) => c + 1);
      setStreak(0);
      questionDetailsRef.current.push({
        question: currentQ.question,
        userAnswer: 'Timed Out',
        correctAnswer: currentQ.correctAnswer,
        isCorrect: false,
        allAnswers: currentQ.allAnswers || [currentQ.correctAnswer, ...currentQ.incorrectAnswers],
      });
    }
  };

  const handleSelectOption = (option: string) => {
    if (isAnswered || !currentQ) return;
    if (timerRef.current) clearInterval(timerRef.current);

    setSelectedAnswer(option);
    setIsAnswered(true);

    const isCorrect = option === currentQ.correctAnswer;

    if (isCorrect) {
      soundService.playCorrect();
      const currentStreakVal = streak + 1;
      setStreak(currentStreakVal);
      setCorrectCount((c) => c + 1);

      // Score formula: Base 100 + speed bonus (timeLeft * 5) + streak multiplier
      const speedBonus = timeLeft * 5;
      const streakMultiplier = currentStreakVal > 1 ? Math.min(currentStreakVal * 15, 60) : 0;
      const earned = 100 + speedBonus + streakMultiplier;
      setScore((s) => s + earned);
    } else {
      soundService.playIncorrect();
      setStreak(0);
      setIncorrectCount((c) => c + 1);
    }

    questionDetailsRef.current.push({
      question: currentQ.question,
      userAnswer: option,
      correctAnswer: currentQ.correctAnswer,
      isCorrect,
      allAnswers: currentQ.allAnswers || [currentQ.correctAnswer, ...currentQ.incorrectAnswers],
    });
  };

  const handleNextQuestion = () => {
    soundService.playClick();
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      resetTimer();
    } else {
      // Quiz complete!
      finishSession();
    }
  };

  const finishSession = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const totalTimeSpent = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    const total = questions.length;
    const percentage = total > 0 ? (correctCount / total) * 100 : 0;

    const result: QuizResult = {
      id: `result-${Date.now()}`,
      timestamp: Date.now(),
      category: settings.category,
      categoryName: QUIZ_CATEGORIES.find((c) => c.id === settings.category)?.name || 'General',
      difficulty: settings.difficulty,
      totalQuestions: total,
      correctAnswers: correctCount,
      incorrectAnswers: incorrectCount,
      score,
      percentage,
      timeSpentSeconds: totalTimeSpent,
      questionDetails: questionDetailsRef.current,
    };

    onFinishQuiz(result);
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-indigo-600/20 border-t-indigo-500 animate-spin" />
          <Sparkles className="w-6 h-6 text-indigo-400 absolute inset-0 m-auto" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white">Preparing Your Questions</h2>
          <p className="text-xs text-slate-400 max-w-sm">
            Fetching verified trivia and shuffling multiple-choice answers...
          </p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || questions.length === 0) {
    return (
      <div className="py-16 max-w-md mx-auto text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Quiz Unavailable</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {error || 'No questions found for the selected track.'}
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={onExit}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Back to Categories
          </button>
          <button
            onClick={loadQuestions}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const totalQuestions = questions.length;
  const progressPercent = ((currentIndex + 1) / totalQuestions) * 100;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  // Timer color
  const isTimeCritical = timeLeft <= 5;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Top Header Strip: Question counter, Streak, Live Score & Timer */}
      <div className="flex items-center justify-between gap-3">
        {/* Question Counter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase">
            Question
          </span>
          <span className="text-sm font-bold font-mono text-white tabular-nums">
            {currentIndex + 1}
            <span className="text-slate-500 font-normal"> / {totalQuestions}</span>
          </span>
        </div>

        {/* Center: Streak Indicator */}
        {streak > 1 && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold animate-pulse">
            <Flame className="w-3.5 h-3.5 fill-amber-400" />
            <span>{streak}x Streak!</span>
          </div>
        )}

        {/* Right: Score and Timer */}
        <div className="flex items-center gap-3">
          {/* Live Score */}
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-300 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="tabular-nums text-white">{score}</span>
            <span className="text-slate-500 text-[10px]">pts</span>
          </div>

          {/* Timer Countdown */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono text-xs font-bold tabular-nums transition-colors ${
              isTimeCritical
                ? 'bg-rose-500/20 border-rose-500/60 text-rose-300 animate-bounce'
                : 'bg-indigo-950/60 border-indigo-700/50 text-indigo-300'
            }`}
          >
            <Timer className={`w-3.5 h-3.5 ${isTimeCritical ? 'text-rose-400' : 'text-indigo-400'}`} />
            <span>{timeLeft}s</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-slate-800/80 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
          <div className="flex items-center gap-2">
            <span className="font-medium text-indigo-300">{currentQ.categoryName}</span>
            <span aria-hidden="true">·</span>
            <span className="capitalize">{currentQ.difficulty}</span>
          </div>
          {dataSource === 'fallback' && (
            <span className="text-[11px] text-slate-500">Offline Bank</span>
          )}
        </div>

        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white leading-relaxed">
          {currentQ.question}
        </h2>
      </div>

      {/* Options List */}
      <div className="grid grid-cols-1 gap-3">
        {currentQ.allAnswers?.map((option, idx) => {
          const letter = String.fromCharCode(65 + idx); // A, B, C, D
          const isSelected = selectedAnswer === option;
          const isCorrectAnswer = option === currentQ.correctAnswer;

          let style = 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 text-slate-200';
          let letterBadge = 'bg-slate-800 text-slate-400';

          if (isAnswered) {
            if (isCorrectAnswer) {
              style = 'bg-emerald-950/50 border-emerald-500/80 text-emerald-200 ring-1 ring-emerald-500/60 shadow-lg shadow-emerald-950/40';
              letterBadge = 'bg-emerald-600 text-white';
            } else if (isSelected) {
              style = 'bg-rose-950/50 border-rose-500/80 text-rose-200 ring-1 ring-rose-500/60 shadow-lg shadow-rose-950/40';
              letterBadge = 'bg-rose-600 text-white';
            } else {
              style = 'bg-slate-900/40 border-slate-800/40 text-slate-500 opacity-60';
              letterBadge = 'bg-slate-800/50 text-slate-600';
            }
          }

          return (
            <button
              key={`${option}-${idx}`}
              disabled={isAnswered}
              onClick={() => handleSelectOption(option)}
              className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all flex items-center justify-between gap-4 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${style}`}
            >
              <div className="flex items-center gap-3.5">
                <span
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${letterBadge}`}
                >
                  {letter}
                </span>
                <span className="text-sm sm:text-base font-semibold leading-snug">
                  {option}
                </span>
              </div>

              {/* Status Icons */}
              {isAnswered && (
                <div className="shrink-0">
                  {isCorrectAnswer && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-950/60" />
                  )}
                  {isSelected && !isCorrectAnswer && (
                    <XCircle className="w-5 h-5 text-rose-400 fill-rose-950/60" />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation Banner (Appears after answer is selected) */}
      {isAnswered && (
        <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 space-y-2 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-indigo-300">
            <HelpCircle className="w-4 h-4 text-indigo-400" />
            <span>Trivia Insight</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            {currentQ.explanation ||
              `The correct answer is "${currentQ.correctAnswer}". Keep going strong to build your mastery.`}
          </p>
        </div>
      )}

      {/* Next Question / Finish Action Strip */}
      {isAnswered && (
        <div className="pt-2 flex items-center justify-between gap-4">
          <button
            onClick={onExit}
            className="px-4 py-3 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Leave Quiz
          </button>

          <button
            onClick={handleNextQuestion}
            className="px-7 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center gap-2 active:scale-95 transition-all"
          >
            <span>{isLastQuestion ? 'View Results' : 'Next Question'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
