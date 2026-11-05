import React from 'react';
import { Wifi, Battery, Signal, Home, LayoutGrid, PlusCircle, User, Sparkles } from 'lucide-react';
import { ScreenType } from '../types/quiz';
import { soundService } from '../services/soundService';

interface DeviceFrameProps {
  isPhoneFrame: boolean;
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  children: React.ReactNode;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({
  isPhoneFrame,
  currentScreen,
  onNavigate,
  children,
}) => {
  if (!isPhoneFrame) {
    return <div className="w-full">{children}</div>;
  }

  return (
    <div className="py-6 sm:py-10 flex justify-center items-center">
      {/* Android Device Outer Chassis */}
      <div className="relative w-full max-w-[410px] h-[820px] rounded-[48px] bg-slate-950 p-3.5 shadow-2xl border-4 border-slate-700/80 ring-1 ring-slate-800 flex flex-col overflow-hidden">
        {/* Device Volume / Power Buttons Accent */}
        <div className="absolute -left-[7px] top-28 w-[3px] h-12 bg-slate-700 rounded-l-md" />
        <div className="absolute -left-[7px] top-44 w-[3px] h-12 bg-slate-700 rounded-l-md" />
        <div className="absolute -right-[7px] top-32 w-[3px] h-16 bg-slate-700 rounded-r-md" />

        {/* Android Screen Display */}
        <div className="relative flex-1 w-full bg-slate-950 rounded-[38px] flex flex-col overflow-hidden border border-slate-800/80">
          {/* Top Status Bar with Camera Punch Hole */}
          <div className="relative z-30 h-10 px-6 flex items-center justify-between text-xs font-mono font-medium text-slate-300 bg-slate-950/90 backdrop-blur-md shrink-0">
            {/* Clock */}
            <span className="text-[12px] font-semibold text-slate-200">09:41</span>

            {/* Front Camera Hole */}
            <div className="absolute left-1/2 -translate-x-1/2 top-2.5 w-4 h-4 rounded-full bg-black border border-slate-800 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-950/80" />
            </div>

            {/* Status Icons */}
            <div className="flex items-center gap-1.5 text-slate-300">
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-4 h-4 text-emerald-400" />
            </div>
          </div>

          {/* Main App Scrollable Viewport */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {children}
          </div>

          {/* Android Fixed Bottom Navigation Bar */}
          <div className="sticky bottom-0 z-30 h-16 px-4 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/80 flex items-center justify-around shrink-0">
            <button
              onClick={() => {
                soundService.playClick();
                onNavigate('home');
              }}
              className={`flex flex-col items-center gap-1 transition-colors ${
                currentScreen === 'home' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-[10px]">Home</span>
            </button>

            <button
              onClick={() => {
                soundService.playClick();
                onNavigate('categories');
              }}
              className={`flex flex-col items-center gap-1 transition-colors ${
                currentScreen === 'categories' || currentScreen === 'quiz' || currentScreen === 'results'
                  ? 'text-indigo-400 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-5 h-5" />
              <span className="text-[10px]">Categories</span>
            </button>

            <button
              onClick={() => {
                soundService.playClick();
                onNavigate('add-question');
              }}
              className={`flex flex-col items-center gap-1 transition-colors ${
                currentScreen === 'add-question' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <PlusCircle className="w-5 h-5" />
              <span className="text-[10px]">Create</span>
            </button>

            <button
              onClick={() => {
                soundService.playClick();
                onNavigate('profile');
              }}
              className={`flex flex-col items-center gap-1 transition-colors ${
                currentScreen === 'profile' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-[10px]">Profile</span>
            </button>
          </div>

          {/* Android Home Navigation Gesture Line */}
          <div className="h-4 bg-slate-950 flex items-center justify-center shrink-0">
            <div className="w-28 h-1 rounded-full bg-slate-600" />
          </div>
        </div>
      </div>
    </div>
  );
};
