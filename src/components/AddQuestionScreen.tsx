import React, { useState } from 'react';
import { CategoryId, Difficulty, Question, ScreenType } from '../types/quiz';
import { QUIZ_CATEGORIES } from '../data/categories';
import { StorageService } from '../services/storageService';
import { soundService } from '../services/soundService';
import { 
  PlusCircle, 
  Trash2, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle, 
  Play, 
  HelpCircle,
  FileQuestion
} from 'lucide-react';

interface AddQuestionScreenProps {
  customQuestions: Question[];
  onQuestionAdded: (newQuestions: Question[]) => void;
  onQuestionDeleted: (id: string) => void;
  onNavigate: (screen: ScreenType) => void;
  onPlayCustomQuiz: () => void;
}

export const AddQuestionScreen: React.FC<AddQuestionScreenProps> = ({
  customQuestions,
  onQuestionAdded,
  onQuestionDeleted,
  onNavigate,
  onPlayCustomQuiz,
}) => {
  const [questionText, setQuestionText] = useState<string>('');
  const [category, setCategory] = useState<CategoryId>('custom');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [options, setOptions] = useState<[string, string, string, string]>(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState<number>(0);
  const [explanation, setExplanation] = useState<string>('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleOptionChange = (index: number, val: string) => {
    const updated = [...options] as [string, string, string, string];
    updated[index] = val;
    setOptions(updated);
    setErrorMessage(null);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedQ = questionText.trim();
    if (trimmedQ.length < 5) {
      setErrorMessage('Question text must be at least 5 characters long.');
      soundService.playIncorrect();
      return;
    }

    const trimmedOptions = options.map((o) => o.trim());
    for (let i = 0; i < 4; i++) {
      if (!trimmedOptions[i]) {
        setErrorMessage(`Option ${String.fromCharCode(65 + i)} cannot be empty.`);
        soundService.playIncorrect();
        return;
      }
    }

    // Check for duplicate options
    const uniqueOptions = new Set(trimmedOptions.map((o) => o.toLowerCase()));
    if (uniqueOptions.size < 4) {
      setErrorMessage('All 4 answer options must be unique.');
      soundService.playIncorrect();
      return;
    }

    const correctAnswer = trimmedOptions[correctIndex];
    const incorrectAnswers = trimmedOptions.filter((_, idx) => idx !== correctIndex);

    const categoryObj = QUIZ_CATEGORIES.find((c) => c.id === category);

    const newQuestion: Question = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      category,
      categoryName: categoryObj?.name || 'Custom Question',
      question: trimmedQ,
      correctAnswer,
      incorrectAnswers,
      allAnswers: [...trimmedOptions],
      difficulty,
      explanation: explanation.trim() || undefined,
      isCustom: true,
    };

    const updatedList = StorageService.saveCustomQuestion(newQuestion);
    onQuestionAdded(updatedList);
    soundService.playCorrect();

    // Reset form
    setQuestionText('');
    setOptions(['', '', '', '']);
    setCorrectIndex(0);
    setExplanation('');
    setSuccessMessage('Custom question successfully saved to this device!');

    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10 pb-16">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Create Custom Question
        </h1>
        <p className="text-sm text-slate-400">
          Craft multiple-choice trivia and save it locally on your device to quiz yourself or friends.
        </p>
      </div>

      {/* Main Creation Card */}
      <form
        onSubmit={handleSaveQuestion}
        className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl"
      >
        {/* Alerts */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Question Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-200">
            Question Text <span className="text-rose-400">*</span>
          </label>
          <textarea
            rows={3}
            value={questionText}
            onChange={(e) => {
              setQuestionText(e.target.value);
              setErrorMessage(null);
            }}
            placeholder="e.g. Which keyword in Dart is used to define a constant whose value is known at compile-time?"
            className="w-full px-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-white placeholder-slate-500 transition-all outline-none resize-none"
          />
        </div>

        {/* Category & Difficulty Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-200">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CategoryId)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-indigo-500 text-sm text-white transition-all outline-none"
            >
              {QUIZ_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-200">Difficulty</label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
              {(['easy', 'medium', 'hard'] as const).map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => setDifficulty(d)}
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
        </div>

        {/* 4 Answer Options */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-200">
              Answer Options (Tap radio button to select correct answer) <span className="text-rose-400">*</span>
            </label>
            <span className="text-[11px] text-emerald-400 font-medium">
              Option {String.fromCharCode(65 + correctIndex)} is marked Correct
            </span>
          </div>

          <div className="space-y-2.5">
            {options.map((option, idx) => {
              const letter = String.fromCharCode(65 + idx);
              const isCorrect = correctIndex === idx;

              return (
                <div
                  key={idx}
                  className={`flex items-center gap-3 p-2 pl-3.5 rounded-2xl border transition-all ${
                    isCorrect
                      ? 'bg-emerald-950/20 border-emerald-500/60 ring-1 ring-emerald-500/40'
                      : 'bg-slate-950/80 border-slate-800 focus-within:border-indigo-500'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      soundService.playClick();
                      setCorrectIndex(idx);
                    }}
                    title={`Mark option ${letter} as correct`}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                      isCorrect
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {letter}
                  </button>

                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Option ${letter} text...`}
                    className="w-full bg-transparent text-sm text-white placeholder-slate-500 outline-none pr-3"
                  />

                  {isCorrect && (
                    <span className="text-[11px] font-bold text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-800/60 shrink-0 mr-2">
                      Correct
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Optional Explanation */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span>Explanation / Trivia Insight (Optional)</span>
          </label>
          <input
            type="text"
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="e.g. In Dart, const creates a canonical compile-time constant."
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-indigo-500 text-sm text-white placeholder-slate-500 transition-all outline-none"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Save Question to Device</span>
          </button>
        </div>
      </form>

      {/* Existing Custom Questions Manager */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              My Saved Questions ({customQuestions.length})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Questions stored on this device’s local database
            </p>
          </div>

          {customQuestions.length > 0 && (
            <button
              onClick={() => {
                soundService.playClick();
                onPlayCustomQuiz();
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Play Custom Quiz</span>
            </button>
          )}
        </div>

        {customQuestions.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
            <FileQuestion className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400">
              You haven’t created any custom questions yet. Fill out the form above to add your first one!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {customQuestions.map((q) => (
              <div
                key={q.id}
                className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="font-semibold text-indigo-400">{q.categoryName}</span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">{q.difficulty}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-white leading-snug">{q.question}</h3>
                  </div>

                  <button
                    onClick={() => {
                      soundService.playClick();
                      onQuestionDeleted(q.id);
                    }}
                    title="Delete question"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-300">
                    <span className="font-bold">Correct:</span> {q.correctAnswer}
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-400 truncate">
                    <span className="font-bold">Other options:</span> {q.incorrectAnswers.join(', ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
