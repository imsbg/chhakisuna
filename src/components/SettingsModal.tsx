import React, { useState } from 'react';
import { 
  X, 
  Moon, 
  Sun, 
  Volume2, 
  VolumeX, 
  Languages, 
  User, 
  Check, 
  Sparkles,
  Sliders
} from 'lucide-react';
import { Translations, Language } from '../utils/translations';
import { sounds } from '../utils/sound';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  currentLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
  playerName: string;
  onUpdatePlayerName: (name: string) => void;
  t: Translations;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  onToggleTheme,
  soundEnabled,
  onToggleSound,
  currentLanguage,
  onSelectLanguage,
  playerName,
  onUpdatePlayerName,
  t,
}) => {
  const [nameInput, setNameInput] = useState(playerName);
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      onUpdatePlayerName(nameInput.trim());
      sounds.playClick();
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2000);
    }
  };

  return (
    <div 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="settings-heading"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div 
        className={`w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden transition-all duration-200 ${
          isDarkMode 
            ? 'bg-slate-900 border-slate-800 text-slate-100' 
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50/50'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 id="settings-heading" className="text-lg font-bold tracking-tight">
              {t.settings}
            </h3>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            aria-label={t.close}
            className={`p-2 rounded-xl transition-colors ${
              isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Profile Name */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-500" />
              {t.yourName}
            </label>
            <form onSubmit={handleSaveName} className="flex gap-2">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder={t.namePlaceholder}
                maxLength={20}
                className={`flex-1 px-4 py-2.5 rounded-xl border text-sm font-medium outline-none transition-all ${
                  isDarkMode
                    ? 'bg-slate-800/80 border-slate-700 text-white focus:border-indigo-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                }`}
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm active:scale-95 transition-all"
              >
                {t.saveChanges}
              </button>
            </form>
          </div>

          {/* Theme Toggle */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {t.appearance}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  if (isDarkMode) onToggleTheme();
                  sounds.playClick();
                }}
                className={`flex items-center justify-center gap-2.5 p-3 rounded-2xl border font-medium text-sm transition-all ${
                  !isDarkMode
                    ? 'bg-amber-500/10 border-amber-500 text-amber-600 ring-2 ring-amber-500/20 shadow-sm'
                    : 'border-slate-800 hover:bg-slate-800 text-slate-400'
                }`}
              >
                <Sun className="w-5 h-5 text-amber-500" />
                <span>{t.lightMode}</span>
              </button>

              <button
                onClick={() => {
                  if (!isDarkMode) onToggleTheme();
                  sounds.playClick();
                }}
                className={`flex items-center justify-center gap-2.5 p-3 rounded-2xl border font-medium text-sm transition-all ${
                  isDarkMode
                    ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400 ring-2 ring-indigo-500/20 shadow-sm'
                    : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                }`}
              >
                <Moon className="w-5 h-5 text-indigo-400" />
                <span>{t.darkMode}</span>
              </button>
            </div>
          </div>

          {/* Sound Effects Toggle */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                {soundEnabled ? (
                  <Volume2 className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-rose-500" />
                )}
                {t.soundEffects}
              </label>
              <button
                onClick={() => sounds.playWin()}
                className="text-xs text-indigo-500 hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                {t.testSound}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  if (!soundEnabled) onToggleSound();
                  sounds.playClick();
                }}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl border font-medium text-sm transition-all ${
                  soundEnabled
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20'
                    : isDarkMode ? 'border-slate-800 hover:bg-slate-800 text-slate-400' : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                }`}
              >
                <Volume2 className="w-4 h-4 text-emerald-500" />
                <span>{t.soundOn}</span>
              </button>
              <button
                onClick={() => {
                  if (soundEnabled) onToggleSound();
                  sounds.playClick();
                }}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl border font-medium text-sm transition-all ${
                  !soundEnabled
                    ? 'bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400 ring-2 ring-rose-500/20'
                    : isDarkMode ? 'border-slate-800 hover:bg-slate-800 text-slate-400' : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                }`}
              >
                <VolumeX className="w-4 h-4 text-rose-500" />
                <span>{t.soundOff}</span>
              </button>
            </div>
          </div>

          {/* Language Preferences */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-indigo-500" />
              {t.language}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  onSelectLanguage('en');
                  sounds.playClick();
                }}
                className={`flex items-center justify-between p-3.5 rounded-2xl border font-medium text-sm transition-all ${
                  currentLanguage === 'en'
                    ? 'bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/20'
                    : isDarkMode ? 'border-slate-800 hover:bg-slate-800 text-slate-400' : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                }`}
              >
                <span className="font-semibold">English</span>
                {currentLanguage === 'en' && <Check className="w-4 h-4 text-indigo-500" />}
              </button>

              <button
                onClick={() => {
                  onSelectLanguage('or');
                  sounds.playClick();
                }}
                className={`flex items-center justify-between p-3.5 rounded-2xl border font-medium text-sm transition-all ${
                  currentLanguage === 'or'
                    ? 'bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/20'
                    : isDarkMode ? 'border-slate-800 hover:bg-slate-800 text-slate-400' : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                }`}
              >
                <span className="font-semibold">{t.odia}</span>
                {currentLanguage === 'or' && <Check className="w-4 h-4 text-indigo-500" />}
              </button>
            </div>
          </div>

          {/* Feedback notice toast */}
          {savedNotice && (
            <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-semibold animate-pop-in">
              <Check className="w-4 h-4" />
              {t.saveChanges}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
