import React from 'react';
import { CategoryId, ScreenType, UserProfile } from '../types/quiz';
import { QUIZ_CATEGORIES } from '../data/categories';
import { 
  Trophy, 
  Flame, 
  Play, 
  PlusCircle, 
  Sparkles, 
  Compass, 
  Atom, 
  Cpu, 
  Code2, 
  Landmark, 
  ArrowRight,
  Target,
  Zap,
  BookOpen
} from 'lucide-react';
import { soundService } from '../services/soundService';

interface HomeScreenProps {
  profile: UserProfile;
  customQuestionsCount: number;
  onNavigate: (screen: ScreenType) => void;
  onSelectCategory: (categoryId: CategoryId) => void;
  onOpenFlutterModal: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  profile,
  customQuestionsCount,
  onNavigate,
  onSelectCategory,
  onOpenFlutterModal,
}) => {
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

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Welcome & Highest Score Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900/90 via-purple-950/80 to-slate-900 border border-indigo-700/40 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
              <span className="text-xl">{profile.avatar || '🧠'}</span>
              <span>Hello, {profile.name}!</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1 text-amber-400">
                <Flame className="w-3.5 h-3.5 fill-amber-400" />
                <span>{profile.currentStreak} Quiz Streak</span>
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Test Your Knowledge, <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                Elevate Your Rank.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Explore thousands of curated questions across 6 major domains or challenge yourself with custom community questions.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  soundService.playClick();
                  onNavigate('categories');
                }}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/40 transition-all flex items-center gap-2 active:scale-95"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start Quiz Now</span>
              </button>

              <button
                onClick={() => {
                  soundService.playClick();
                  onNavigate('add-question');
                }}
                className="px-5 py-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-200 hover:text-white font-medium text-sm transition-all flex items-center gap-2 active:scale-95"
              >
                <PlusCircle className="w-4 h-4 text-purple-400" />
                <span>Create Question</span>
              </button>
            </div>
          </div>

          {/* Highest Score & XP Card */}
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 min-w-[260px] md:w-72">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-indigo-500/30 backdrop-blur-md">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>High Score</span>
              </div>
              <div className="text-2xl font-bold font-mono text-white tabular-nums">
                {profile.highestScore}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Personal Best</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-purple-500/30 backdrop-blur-md">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <Zap className="w-4 h-4 text-purple-400" />
                <span>Experience</span>
              </div>
              <div className="text-2xl font-bold font-mono text-white tabular-nums">
                {profile.xp}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Total XP Earned</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <Target className="w-4 h-4 text-emerald-400" />
                <span>Accuracy</span>
              </div>
              <div className="text-2xl font-bold font-mono text-white tabular-nums">
                {profile.totalQuestionsAnswered > 0
                  ? Math.round((profile.totalCorrect / profile.totalQuestionsAnswered) * 100)
                  : 0}
                %
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {profile.totalCorrect}/{profile.totalQuestionsAnswered} correct
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <BookOpen className="w-4 h-4 text-sky-400" />
                <span>Quizzes</span>
              </div>
              <div className="text-2xl font-bold font-mono text-white tabular-nums">
                {profile.totalQuizzesPlayed}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Sessions played</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid Preview */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Quiz Categories</h2>
            <p className="text-xs text-slate-400 mt-0.5">Select a category to jump straight into the challenge</p>
          </div>
          <button
            onClick={() => {
              soundService.playClick();
              onNavigate('categories');
            }}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {QUIZ_CATEGORIES.map((category) => {
            const count = category.id === 'custom' ? customQuestionsCount : category.questionCountEstimate;
            return (
              <button
                key={category.id}
                onClick={() => {
                  soundService.playClick();
                  onSelectCategory(category.id);
                }}
                className={`group relative overflow-hidden rounded-2xl p-5 text-left bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className={`p-3 rounded-xl bg-gradient-to-tr ${category.gradient} text-white shadow-md`}>
                    {getCategoryIcon(category.iconName)}
                  </div>
                  <span className="text-xs font-mono tabular-nums text-slate-400">
                    {count} {category.id === 'custom' ? 'saved' : 'questions'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {category.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {category.description}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">
                  <span>Start Track</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Mobile/Flutter Export Highlight Banner */}
      <section className="rounded-2xl p-5 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
            <Code2 className="w-4 h-4 text-indigo-400" />
            <span>Complete Flutter & Android Code Included</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Full Dart 3.35+ source code, Provider architecture, Open Trivia DB API service, widget tests, and APK release instructions.
          </p>
        </div>
        <button
          onClick={() => {
            soundService.playClick();
            onOpenFlutterModal();
          }}
          className="px-4 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 hover:text-white text-xs font-semibold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 self-start sm:self-center"
        >
          <Code2 className="w-4 h-4" />
          <span>View Flutter Source Code</span>
        </button>
      </section>
    </div>
  );
};
