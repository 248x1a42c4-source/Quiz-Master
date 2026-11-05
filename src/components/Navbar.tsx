import React from 'react';
import { ScreenType } from '../types/quiz';
import { Volume2, VolumeX, Smartphone, Monitor, Code2, PlusCircle, Trophy, Sparkles } from 'lucide-react';
import { soundService } from '../services/soundService';

interface NavbarProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isPhoneFrame: boolean;
  onTogglePhoneFrame: () => void;
  onOpenFlutterModal: () => void;
  highestScore: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  onNavigate,
  isMuted,
  onToggleMute,
  isPhoneFrame,
  onTogglePhoneFrame,
  onOpenFlutterModal,
  highestScore,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => {
            soundService.playClick();
            onNavigate('home');
          }}
          className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-lg p-1"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent whitespace-nowrap shrink-0">
            QuizMaster
          </span>
        </button>

        {/* Zone 2: Navigation Links (Clean single-line prose links) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => {
              soundService.playClick();
              onNavigate('home');
            }}
            className={`whitespace-nowrap shrink-0 hover:text-white transition-colors ${
              currentScreen === 'home' ? 'text-indigo-400 font-semibold' : ''
            }`}
          >
            Home
          </button>
          <button
            onClick={() => {
              soundService.playClick();
              onNavigate('categories');
            }}
            className={`whitespace-nowrap shrink-0 hover:text-white transition-colors ${
              currentScreen === 'categories' ? 'text-indigo-400 font-semibold' : ''
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => {
              soundService.playClick();
              onNavigate('add-question');
            }}
            className={`whitespace-nowrap shrink-0 hover:text-white transition-colors ${
              currentScreen === 'add-question' ? 'text-indigo-400 font-semibold' : ''
            }`}
          >
            Create Question
          </button>
          <button
            onClick={() => {
              soundService.playClick();
              onNavigate('profile');
            }}
            className={`whitespace-nowrap shrink-0 hover:text-white transition-colors ${
              currentScreen === 'profile' ? 'text-indigo-400 font-semibold' : ''
            }`}
          >
            Profile & History
          </button>
          <button
            onClick={() => {
              soundService.playClick();
              onOpenFlutterModal();
            }}
            className="flex items-center gap-1.5 text-indigo-300 hover:text-indigo-200 transition-colors whitespace-nowrap shrink-0 font-medium"
          >
            <Code2 className="w-4 h-4 text-indigo-400" />
            <span>Flutter Code</span>
          </button>
        </nav>

        {/* Zone 3: Actions & Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Audio Mute Toggle */}
          <button
            onClick={onToggleMute}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Android Simulator Frame Toggle */}
          <button
            onClick={onTogglePhoneFrame}
            title={isPhoneFrame ? 'Switch to Full Web View' : 'Switch to Android Frame'}
            aria-label={isPhoneFrame ? 'Switch to Full Web View' : 'Switch to Android Frame'}
            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            {isPhoneFrame ? <Monitor className="w-4 h-4 text-indigo-400" /> : <Smartphone className="w-4 h-4 text-indigo-400" />}
          </button>

          {/* High Score Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-indigo-950/60 border border-indigo-800/50 rounded-xl text-xs font-semibold text-indigo-300">
            <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-mono tabular-nums">{highestScore}</span>
            <span className="text-slate-400 font-normal">pts</span>
          </div>

          {/* Primary Action Button: Start Quiz */}
          <button
            onClick={() => {
              soundService.playClick();
              onNavigate('categories');
            }}
            className="px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:shadow-indigo-600/40 active:scale-[0.98] whitespace-nowrap shrink-0"
          >
            Start Quiz
          </button>
        </div>
      </div>
    </header>
  );
};
