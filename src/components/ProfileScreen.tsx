import React, { useState } from 'react';
import { QuizResult, UserProfile } from '../types/quiz';
import { StorageService } from '../services/storageService';
import { soundService } from '../services/soundService';
import { 
  Trophy, 
  Flame, 
  Zap, 
  Target, 
  History, 
  RotateCcw, 
  Award, 
  CheckCircle2, 
  Clock, 
  Edit2, 
  Check,
  Calendar,
  Sparkles
} from 'lucide-react';

interface ProfileScreenProps {
  profile: UserProfile;
  history: QuizResult[];
  onProfileUpdated: (updated: UserProfile) => void;
  onHistoryCleared: () => void;
}

const AVATARS = ['🧠', '⚡', '🚀', '🏆', '🎯', '🦁', '🦉', '💎'];

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  profile,
  history,
  onProfileUpdated,
  onHistoryCleared,
}) => {
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [nameInput, setNameInput] = useState<string>(profile.name);

  const handleSaveName = () => {
    const trimmed = nameInput.trim() || 'Quiz Explorer';
    const updated = { ...profile, name: trimmed };
    StorageService.saveUserProfile(updated);
    onProfileUpdated(updated);
    setIsEditingName(false);
    soundService.playClick();
  };

  const handleSelectAvatar = (avatar: string) => {
    soundService.playClick();
    const updated = { ...profile, avatar };
    StorageService.saveUserProfile(updated);
    onProfileUpdated(updated);
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to reset your quiz history and score stats?')) {
      soundService.playClick();
      StorageService.clearHistory();
      onHistoryCleared();
    }
  };

  const accuracyPercent = profile.totalQuestionsAnswered > 0
    ? Math.round((profile.totalCorrect / profile.totalQuestionsAnswered) * 100)
    : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Profile Header Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-900 border border-indigo-700/50 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {/* Avatar selector */}
          <div className="space-y-2 flex flex-col items-center">
            <div className="w-20 h-20 rounded-3xl bg-indigo-600/30 border-2 border-indigo-500/50 flex items-center justify-center text-4xl shadow-inner">
              {profile.avatar}
            </div>
            <div className="flex items-center gap-1.5 pt-1">
              {AVATARS.slice(0, 5).map((av) => (
                <button
                  key={av}
                  onClick={() => handleSelectAvatar(av)}
                  className={`w-7 h-7 rounded-lg text-xs flex items-center justify-center transition-all ${
                    profile.avatar === av
                      ? 'bg-indigo-600 ring-2 ring-indigo-400 scale-110'
                      : 'bg-slate-800/80 hover:bg-slate-700/80'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* User Info & Edit */}
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="px-3 py-1 rounded-xl bg-slate-950 border border-indigo-500 text-white font-bold text-lg outline-none"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-1.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold text-white">{profile.name}</h1>
                  <button
                    onClick={() => {
                      setNameInput(profile.name);
                      setIsEditingName(true);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-white"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-400">
              QuizMaster Contender · Android & Web Knowledge Ranking
            </p>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>High Score</span>
                </div>
                <div className="text-lg font-bold font-mono text-white tabular-nums mt-0.5">
                  {profile.highestScore}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Win Rate</span>
                </div>
                <div className="text-lg font-bold font-mono text-emerald-400 tabular-nums mt-0.5">
                  {accuracyPercent}%
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-purple-400" />
                  <span>Total XP</span>
                </div>
                <div className="text-lg font-bold font-mono text-purple-300 tabular-nums mt-0.5">
                  {profile.xp}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Best Streak</span>
                </div>
                <div className="text-lg font-bold font-mono text-amber-400 tabular-nums mt-0.5">
                  {profile.bestStreak}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quiz Performance History Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-400" />
              <span>Quiz Performance History</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Review your previous scores and completed trivia tracks
            </p>
          </div>

          {history.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset History</span>
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="p-10 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
            <Trophy className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-semibold text-white">No Quiz History Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Jump into any category from the categories menu to start building your score records!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => {
              const formattedDate = new Date(item.timestamp).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              const isHigh = item.score === profile.highestScore && profile.highestScore > 0;

              return (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{item.categoryName}</span>
                      {isHigh && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          Personal Best
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{formattedDate}</span>
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">{item.difficulty}</span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span className="font-mono tabular-nums">{item.timeSpentSeconds}s</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="text-right">
                      <div className="text-base font-bold font-mono text-indigo-400 tabular-nums">
                        {item.score} <span className="text-xs text-slate-400 font-normal">pts</span>
                      </div>
                      <div className="text-xs text-emerald-400 font-semibold font-mono tabular-nums">
                        {item.correctAnswers}/{item.totalQuestions} ({Math.round(item.percentage)}%)
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
