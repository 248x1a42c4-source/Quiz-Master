/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CategoryId, Question, QuizResult, QuizSettings, ScreenType, UserProfile } from './types/quiz';
import { StorageService } from './services/storageService';
import { soundService } from './services/soundService';
import { Navbar } from './components/Navbar';
import { HomeScreen } from './components/HomeScreen';
import { CategoriesScreen } from './components/CategoriesScreen';
import { QuizScreen } from './components/QuizScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { AddQuestionScreen } from './components/AddQuestionScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { FlutterExportModal } from './components/FlutterExportModal';
import { DeviceFrame } from './components/DeviceFrame';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [profile, setProfile] = useState<UserProfile>(StorageService.getUserProfile());
  const [history, setHistory] = useState<QuizResult[]>(StorageService.getQuizHistory());
  const [customQuestions, setCustomQuestions] = useState<Question[]>(StorageService.getCustomQuestions());
  const [isMuted, setIsMuted] = useState<boolean>(soundService.getMuted());
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(false);
  const [isFlutterModalOpen, setIsFlutterModalOpen] = useState<boolean>(false);

  // Active quiz session settings & current completed result
  const [activeSettings, setActiveSettings] = useState<QuizSettings>({
    category: 'general',
    difficulty: 'any',
    questionCount: 10,
    timerSeconds: 20,
  });
  const [lastResult, setLastResult] = useState<QuizResult | null>(null);

  // Sync profile and questions on load
  useEffect(() => {
    setProfile(StorageService.getUserProfile());
    setHistory(StorageService.getQuizHistory());
    setCustomQuestions(StorageService.getCustomQuestions());
  }, []);

  const handleToggleMute = () => {
    const muted = soundService.toggleMute();
    setIsMuted(muted);
  };

  const handleTogglePhoneFrame = () => {
    soundService.playClick();
    setIsPhoneFrame((prev) => !prev);
  };

  const handleStartQuizWithSettings = (settings: QuizSettings) => {
    setActiveSettings(settings);
    setCurrentScreen('quiz');
  };

  const handleSelectCategoryFromHome = (categoryId: CategoryId) => {
    setActiveSettings((prev) => ({
      ...prev,
      category: categoryId,
    }));
    setCurrentScreen('categories');
  };

  const handleFinishQuiz = (result: QuizResult) => {
    const { history: updatedHistory, profile: updatedProfile } = StorageService.saveQuizResult(result);
    setHistory(updatedHistory);
    setProfile(updatedProfile);
    setLastResult(result);
    setCurrentScreen('results');
  };

  const handleRestartQuiz = () => {
    setCurrentScreen('quiz');
  };

  const handleQuestionAdded = (newQuestions: Question[]) => {
    setCustomQuestions(newQuestions);
  };

  const handleQuestionDeleted = (id: string) => {
    const updated = StorageService.deleteCustomQuestion(id);
    setCustomQuestions(updated);
  };

  const handlePlayCustomQuiz = () => {
    handleStartQuizWithSettings({
      category: 'custom',
      difficulty: 'any',
      questionCount: Math.min(10, Math.max(1, customQuestions.length)),
      timerSeconds: 20,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Bar adhering to Top Bar Contract */}
      <Navbar
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        isPhoneFrame={isPhoneFrame}
        onTogglePhoneFrame={handleTogglePhoneFrame}
        onOpenFlutterModal={() => setIsFlutterModalOpen(true)}
        highestScore={profile.highestScore}
      />

      {/* Main View Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        <DeviceFrame
          isPhoneFrame={isPhoneFrame}
          currentScreen={currentScreen}
          onNavigate={setCurrentScreen}
        >
          {currentScreen === 'home' && (
            <HomeScreen
              profile={profile}
              customQuestionsCount={customQuestions.length}
              onNavigate={setCurrentScreen}
              onSelectCategory={handleSelectCategoryFromHome}
              onOpenFlutterModal={() => setIsFlutterModalOpen(true)}
            />
          )}

          {currentScreen === 'categories' && (
            <CategoriesScreen
              customQuestionsCount={customQuestions.length}
              onStartQuiz={handleStartQuizWithSettings}
              onNavigate={setCurrentScreen}
            />
          )}

          {currentScreen === 'quiz' && (
            <QuizScreen
              settings={activeSettings}
              onFinishQuiz={handleFinishQuiz}
              onExit={() => setCurrentScreen('categories')}
            />
          )}

          {currentScreen === 'results' && lastResult && (
            <ResultsScreen
              result={lastResult}
              onRestart={handleRestartQuiz}
              onGoHome={() => setCurrentScreen('home')}
            />
          )}

          {currentScreen === 'add-question' && (
            <AddQuestionScreen
              customQuestions={customQuestions}
              onQuestionAdded={handleQuestionAdded}
              onQuestionDeleted={handleQuestionDeleted}
              onNavigate={setCurrentScreen}
              onPlayCustomQuiz={handlePlayCustomQuiz}
            />
          )}

          {currentScreen === 'profile' && (
            <ProfileScreen
              profile={profile}
              history={history}
              onProfileUpdated={setProfile}
              onHistoryCleared={() => {
                setHistory([]);
                setProfile(StorageService.getUserProfile());
              }}
            />
          )}
        </DeviceFrame>
      </main>

      {/* Flutter Source Code & APK Guide Modal */}
      <FlutterExportModal
        isOpen={isFlutterModalOpen}
        onClose={() => setIsFlutterModalOpen(false)}
      />

      {/* Clean, unobtrusive footer with version & attribution */}
      <footer className="mt-auto border-t border-slate-900 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>QuizMaster · Interactive Quiz Application for Android & Web</div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsFlutterModalOpen(true)}
              className="hover:text-indigo-400 transition-colors"
            >
              Flutter Source Code
            </button>
            <span aria-hidden="true">·</span>
            <span>Powered by Open Trivia DB</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
