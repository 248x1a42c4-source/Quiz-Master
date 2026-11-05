import React, { useState } from 'react';
import { CategoryId, Difficulty, QuizSettings, ScreenType } from '../types/quiz';
import { QUIZ_CATEGORIES } from '../data/categories';
import { 
  Compass, 
  Atom, 
  Cpu, 
  Trophy, 
  Landmark, 
  Code2, 
  Sparkles, 
  BookOpen, 
  Play, 
  SlidersHorizontal,
  PlusCircle,
  Check
} from 'lucide-react';
import { soundService } from '../services/soundService';

interface CategoriesScreenProps {
  customQuestionsCount: number;
  onStartQuiz: (settings: QuizSettings) => void;
  onNavigate: (screen: ScreenType) => void;
}

export const CategoriesScreen: React.FC<CategoriesScreenProps> = ({
  customQuestionsCount,
  onStartQuiz,
  onNavigate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('general');
  const [difficulty, setDifficulty] = useState<Difficulty>('any');
  const [questionCount, setQuestionCount] = useState<number>(10);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Compass': return <Compass className="w-5 h-5" />;
      case 'Atom': return <Atom className="w-5 h-5" />;
      case 'Cpu': return <Cpu className="w-5 h-5" />;
      case 'Trophy': return <Trophy className="w-5 h-5" />;
      case 'Landmark': return <Landmark className="w-5 h-5" />;
      case 'Code': return <Code2 className="w-5 h-5" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  const handleLaunch = () => {
    if (selectedCategory === 'custom' && customQuestionsCount === 0) {
      soundService.playIncorrect();
      onNavigate('add-question');
      return;
    }
    soundService.playClick();
    onStartQuiz({
      category: selectedCategory,
      difficulty,
      questionCount,
      timerSeconds: 20,
    });
  };

  const currentCategoryObj = QUIZ_CATEGORIES.find((c) => c.id === selectedCategory) || QUIZ_CATEGORIES[0];

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Select Quiz Category
        </h1>
        <p className="text-sm text-slate-400">
          Pick a subject, configure difficulty, and launch your test session.
        </p>
      </div>

      {/* Configuration Strip (Difficulty & Question Count) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400">
          <SlidersHorizontal className="w-4 h-4" />
          <span>Session Settings</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Difficulty Filter */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">Difficulty</label>
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-950/70 rounded-xl border border-slate-800">
              {(['any', 'easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    soundService.playClick();
                    setDifficulty(d);
                  }}
                  className={`py-1.5 text-xs font-medium rounded-lg capitalize transition-all ${
                    difficulty === d
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Question Count */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">Number of Questions</label>
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-950/70 rounded-xl border border-slate-800">
              {[5, 10, 15, 20].map((num) => (
                <button
                  key={num}
                  onClick={() => {
                    soundService.playClick();
                    setQuestionCount(num);
                  }}
                  className={`py-1.5 text-xs font-medium rounded-lg font-mono tabular-nums transition-all ${
                    questionCount === num
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {num} Qs
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {QUIZ_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = cat.id === 'custom' ? customQuestionsCount : cat.questionCountEstimate;

          return (
            <div
              key={cat.id}
              onClick={() => {
                soundService.playClick();
                setSelectedCategory(cat.id);
              }}
              className={`relative overflow-hidden rounded-2xl p-5 cursor-pointer transition-all border ${
                isSelected
                  ? 'bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-500'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}

              <div className="flex items-center gap-3 mb-3">
                <div className={`p-3 rounded-xl bg-gradient-to-tr ${cat.gradient} text-white shadow-md`}>
                  {getCategoryIcon(cat.iconName)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{cat.name}</h3>
                  <div className="text-xs font-mono tabular-nums text-slate-400">
                    {count} {cat.id === 'custom' ? 'saved questions' : 'questions available'}
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {cat.description}
              </p>

              {cat.id === 'custom' && customQuestionsCount === 0 && (
                <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-amber-400 flex items-center gap-1.5">
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>No custom questions created yet</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating Action Strip */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-900/80 via-purple-900/80 to-slate-900 border border-indigo-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-0.5">
          <div className="text-xs font-semibold text-indigo-300">Selected Track</div>
          <div className="text-base font-bold text-white flex items-center gap-2">
            <span>{currentCategoryObj.name}</span>
            <span className="text-xs font-normal text-slate-300">
              · {questionCount} Questions · {difficulty.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {selectedCategory === 'custom' && (
            <button
              onClick={() => {
                soundService.playClick();
                onNavigate('add-question');
              }}
              className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all whitespace-nowrap"
            >
              + Create Question
            </button>
          )}

          <button
            onClick={handleLaunch}
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Launch Quiz</span>
          </button>
        </div>
      </div>
    </div>
  );
};
