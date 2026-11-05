import React, { useEffect, useState } from 'react';
import { QuizResult, ScreenType } from '../types/quiz';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  RotateCcw, 
  Home, 
  CheckCircle2, 
  XCircle, 
  Award, 
  Clock, 
  Target, 
  ChevronDown, 
  ChevronUp,
  Share2,
  Check
} from 'lucide-react';
import { soundService } from '../services/soundService';

interface ResultsScreenProps {
  result: QuizResult;
  onRestart: () => void;
  onGoHome: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  result,
  onRestart,
  onGoHome,
}) => {
  const [showReview, setShowReview] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const percentage = Math.round(result.percentage);

  // Performance message determination
  let title = 'Quiz Completed!';
  let message = 'Keep practicing to expand your knowledge base.';
  let badgeColor = 'text-indigo-400 bg-indigo-950/60 border-indigo-700/60';

  if (percentage >= 90) {
    title = 'Outstanding Genius!';
    message = 'Flawless performance! You truly mastered this category.';
    badgeColor = 'text-amber-300 bg-amber-950/60 border-amber-600/60';
  } else if (percentage >= 70) {
    title = 'Impressive Work!';
    message = 'Great score! Your grasp of the subject is very solid.';
    badgeColor = 'text-emerald-300 bg-emerald-950/60 border-emerald-600/60';
  } else if (percentage >= 50) {
    title = 'Good Effort!';
    message = 'You are on the right path. Review your answers to level up.';
    badgeColor = 'text-sky-300 bg-sky-950/60 border-sky-600/60';
  }

  // Trigger sound & confetti on high score
  useEffect(() => {
    if (percentage >= 70) {
      soundService.playVictory();
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366F1', '#8B5CF6', '#EC4899', '#38BDF8', '#F59E0B'],
        });
      } catch {
        // ignore
      }
    }
  }, [percentage]);

  const handleShare = () => {
    const text = `I just scored ${result.score} pts (${percentage}%) on QuizMaster in ${result.categoryName}! Can you beat my score?`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-16">
      {/* Celebration Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-indigo-950/80 via-slate-900 to-slate-900 border border-indigo-700/40 p-8 text-center shadow-2xl">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-indigo-600 p-0.5 mx-auto mb-4 shadow-xl shadow-indigo-600/20">
          <div className="w-full h-full bg-slate-900 rounded-[22px] flex items-center justify-center">
            <Trophy className="w-10 h-10 text-amber-400" />
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold mb-3 tracking-wide uppercase font-mono">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>{result.categoryName}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {title}
        </h1>
        <p className="text-sm text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
          {message}
        </p>

        {/* Big Score & Accuracy Meter */}
        <div className="mt-8 p-6 rounded-2xl bg-slate-950/60 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="space-y-1">
            <div className="text-xs text-slate-400">Total Score</div>
            <div className="text-2xl font-bold font-mono text-indigo-400 tabular-nums">
              {result.score}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-slate-400">Accuracy</div>
            <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
              {percentage}%
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-slate-400">Correct</div>
            <div className="text-2xl font-bold font-mono text-white tabular-nums">
              {result.correctAnswers} / {result.totalQuestions}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-slate-400">Time Spent</div>
            <div className="text-2xl font-bold font-mono text-sky-400 tabular-nums">
              {result.timeSpentSeconds}s
            </div>
          </div>
        </div>

        {/* Share Result Button */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={handleShare}
            className="text-xs font-semibold text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Score summary copied!' : 'Share Your Score'}</span>
          </button>
        </div>
      </div>

      {/* Review Answers Toggle Button */}
      <div className="space-y-4">
        <button
          onClick={() => setShowReview(!showReview)}
          className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center justify-between text-sm font-semibold text-slate-200 hover:text-white transition-all"
        >
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-400" />
            <span>Review All {result.totalQuestions} Questions</span>
          </div>
          {showReview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {/* Expandable Review Section */}
        {showReview && (
          <div className="space-y-3 pt-1">
            {result.questionDetails.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5 text-xs text-left"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="font-semibold text-slate-200">
                    {idx + 1}. {item.question}
                  </span>
                  {item.isCorrect ? (
                    <span className="flex items-center gap-1 text-emerald-400 font-bold shrink-0">
                      <CheckCircle2 className="w-4 h-4" /> Correct
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-rose-400 font-bold shrink-0">
                      <XCircle className="w-4 h-4" /> Incorrect
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-800/60">
                  <div className="text-slate-400">
                    Your choice:{' '}
                    <span className={item.isCorrect ? 'text-emerald-300 font-medium' : 'text-rose-300 font-medium'}>
                      {item.userAnswer || 'No answer (Timed out)'}
                    </span>
                  </div>
                  <div className="text-slate-400">
                    Correct answer:{' '}
                    <span className="text-emerald-300 font-medium">
                      {item.correctAnswer}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons: Restart & Home */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <button
          onClick={() => {
            soundService.playClick();
            onRestart();
          }}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Restart Quiz</span>
        </button>

        <button
          onClick={() => {
            soundService.playClick();
            onGoHome();
          }}
          className="w-full py-3.5 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Return Home</span>
        </button>
      </div>
    </div>
  );
};
