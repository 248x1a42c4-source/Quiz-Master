import React, { useState } from 'react';
import { FLUTTER_PROJECT_FILES, FlutterFile } from '../data/flutterSourceCode';
import JSZip from 'jszip';
import { 
  X, 
  Code2, 
  Download, 
  Copy, 
  Check, 
  FileCode, 
  Folder, 
  Terminal, 
  Layers, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { soundService } from '../services/soundService';

interface FlutterExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FlutterExportModal: React.FC<FlutterExportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedFile, setSelectedFile] = useState<FlutterFile>(FLUTTER_PROJECT_FILES[2]); // lib/main.dart
  const [copied, setCopied] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'code' | 'apk-guide'>('code');

  if (!isOpen) return null;

  const handleCopy = () => {
    soundService.playClick();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(selectedFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadZip = async () => {
    soundService.playClick();
    setIsZipping(true);

    try {
      const zip = new JSZip();
      const rootFolder = zip.folder('quizmaster_flutter');

      // Add each file to its exact relative path
      FLUTTER_PROJECT_FILES.forEach((f) => {
        rootFolder?.file(f.path, f.content);
      });

      // Generate zip blob
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'QuizMaster_Flutter_Android_App.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate ZIP:', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-5xl h-[88vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Flutter 3.35+ & Dart Project Source</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                  Android Ready
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Complete Provider state management, models, services, screens, and APK build files
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Download Zip Button */}
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isZipping ? 'Creating ZIP...' : 'Download Project (.ZIP)'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Toggle Bar */}
        <div className="px-6 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'code' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Project File Explorer</span>
            </button>
            <button
              onClick={() => setActiveTab('apk-guide')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'apk-guide' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Release APK Build Guide</span>
            </button>
          </div>

          {activeTab === 'code' && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs text-indigo-300 hover:text-white transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard!' : `Copy ${selectedFile.name}`}</span>
            </button>
          )}
        </div>

        {/* Body Content */}
        {activeTab === 'code' ? (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar: File List */}
            <div className="w-full md:w-64 border-r border-slate-800 bg-slate-950/40 p-3 overflow-y-auto shrink-0 space-y-1">
              <div className="text-[11px] font-bold text-slate-500 uppercase px-2 py-1 tracking-wider">
                Flutter Project Files ({FLUTTER_PROJECT_FILES.length})
              </div>
              {FLUTTER_PROJECT_FILES.map((file) => {
                const isSelected = selectedFile.path === file.path;
                return (
                  <button
                    key={file.path}
                    onClick={() => {
                      soundService.playClick();
                      setSelectedFile(file);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors flex items-center gap-2 font-mono ${
                      isSelected
                        ? 'bg-indigo-600/30 text-indigo-300 font-semibold border border-indigo-500/40'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                    <span className="truncate">{file.path}</span>
                  </button>
                );
              })}
            </div>

            {/* Code Viewer */}
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-950/80">
              <div className="px-4 py-2 border-b border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-between">
                <span>{selectedFile.path}</span>
                <span className="text-[10px] uppercase text-indigo-400">{selectedFile.language}</span>
              </div>
              <div className="flex-1 p-4 overflow-auto font-mono text-xs text-slate-200 leading-relaxed whitespace-pre selection:bg-indigo-600 selection:text-white">
                {selectedFile.content}
              </div>
            </div>
          </div>
        ) : (
          /* APK Build Instructions Guide */
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-sm text-slate-300">
            <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-700/50 space-y-2">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <span>Complete Android APK & Google Play Build Instructions</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Follow these exact steps to compile the complete QuizMaster application into an Android Release APK or Android App Bundle (AAB).
              </p>
            </div>

            {/* Step 1 */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">1</span>
                <span>Unzip & Install Dependencies</span>
              </h4>
              <p className="text-xs text-slate-400">
                Extract the downloaded zip archive or navigate to the project directory, then fetch all packages:
              </p>
              <div className="p-3 rounded-xl bg-slate-950 font-mono text-xs text-indigo-300 border border-slate-800">
                cd quizmaster_flutter<br />
                flutter pub get
              </div>
            </div>

            {/* Step 2 */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">2</span>
                <span>Run Widget & Unit Tests</span>
              </h4>
              <p className="text-xs text-slate-400">
                Verify question models, answer shuffling, and scoring logic:
              </p>
              <div className="p-3 rounded-xl bg-slate-950 font-mono text-xs text-indigo-300 border border-slate-800">
                flutter test
              </div>
            </div>

            {/* Step 3 */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">3</span>
                <span>Build Release APK</span>
              </h4>
              <p className="text-xs text-slate-400">
                Compile the production release APK with tree-shaking and bytecode optimization:
              </p>
              <div className="p-3 rounded-xl bg-slate-950 font-mono text-xs text-emerald-300 border border-slate-800">
                flutter build apk --release
              </div>
              <p className="text-xs text-slate-400 pt-1">
                The output APK will be placed at:<br />
                <code className="text-indigo-400 font-mono">build/app/outputs/flutter-apk/app-release.apk</code>
              </p>
            </div>

            {/* Step 4 */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">4</span>
                <span>Install Directly on Android Device</span>
              </h4>
              <p className="text-xs text-slate-400">
                Connect your Android phone via USB with USB Debugging enabled, then execute:
              </p>
              <div className="p-3 rounded-xl bg-slate-950 font-mono text-xs text-indigo-300 border border-slate-800">
                adb install build/app/outputs/flutter-apk/app-release.apk
              </div>
            </div>

            {/* Step 5 */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">5</span>
                <span>Google Play Store (App Bundle)</span>
              </h4>
              <p className="text-xs text-slate-400">
                For Google Play Console submission, generate an Android App Bundle (.aab):
              </p>
              <div className="p-3 rounded-xl bg-slate-950 font-mono text-xs text-indigo-300 border border-slate-800">
                flutter build appbundle --release
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
