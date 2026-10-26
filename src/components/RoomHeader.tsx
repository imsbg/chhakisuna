import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  QrCode, 
  Share2, 
  Volume2, 
  VolumeX, 
  Sun, 
  Moon, 
  Settings, 
  Wifi, 
  WifiOff, 
  LogOut,
  Globe
} from 'lucide-react';
import { Translations, Language } from '../utils/translations';
import { sounds } from '../utils/sound';

interface RoomHeaderProps {
  roomCode: string | null;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
  isDarkMode: boolean;
  onToggleTheme: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  currentLanguage: Language;
  onToggleLanguage: () => void;
  onOpenSettings: () => void;
  onOpenQr: () => void;
  onLeaveRoom?: () => void;
  t: Translations;
}

export const RoomHeader: React.FC<RoomHeaderProps> = ({
  roomCode,
  connectionStatus,
  isDarkMode,
  onToggleTheme,
  soundEnabled,
  onToggleSound,
  currentLanguage,
  onToggleLanguage,
  onOpenSettings,
  onOpenQr,
  onLeaveRoom,
  t,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyInviteLink = () => {
    if (!roomCode) return;
    const url = `${window.location.origin}${window.location.pathname}?room=${roomCode}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      sounds.playClick();
      setTimeout(() => setCopied(false), 2200);
    }).catch(() => {
      // fallback
    });
  };

  return (
    <header className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 py-3 px-4 sm:px-6 border-b transition-colors duration-200">
      {/* Brand & Room Info */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <span className="font-black text-sm tracking-tighter">SB</span>
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight leading-none">
              {t.appTitle}
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">
              {t.p2pRoomSubtitle}
            </p>
          </div>
        </div>

        {/* Room Code Pill if in room */}
        {roomCode && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-indigo-500/10 border-indigo-500/20 text-indigo-500 text-xs font-mono font-bold tracking-wider">
            <span>{roomCode}</span>
            <button
              onClick={handleCopyInviteLink}
              title={t.copyLink}
              aria-label="Copy room invite link"
              className="p-1 hover:text-indigo-400 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                onOpenQr();
              }}
              title={t.scanQr}
              aria-label="Show QR code"
              className="p-1 hover:text-indigo-400 transition-colors"
            >
              <QrCode className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Connection status badge */}
        {roomCode && (
          <div
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
              connectionStatus === 'connected'
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                : connectionStatus === 'connecting'
                ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse'
                : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
            }`}
          >
            {connectionStatus === 'connected' ? (
              <Wifi className="w-3 h-3" />
            ) : (
              <WifiOff className="w-3 h-3" />
            )}
            <span className="hidden md:inline">
              {connectionStatus === 'connected'
                ? t.connected
                : connectionStatus === 'connecting'
                ? t.connecting
                : t.disconnected}
            </span>
          </div>
        )}

        {/* Language switch button */}
        <button
          onClick={() => {
            sounds.playClick();
            onToggleLanguage();
          }}
          aria-label="Toggle Language"
          title={`Language: ${currentLanguage === 'en' ? 'English' : 'ଓଡ଼ିଆ'}`}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
            isDarkMode
              ? 'border-slate-800 text-slate-300 hover:bg-slate-800'
              : 'border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-indigo-500" />
          <span>{currentLanguage === 'en' ? 'EN' : 'ଓଡ଼ିଆ'}</span>
        </button>

        {/* Sound toggle button */}
        <button
          onClick={() => {
            onToggleSound();
            sounds.playClick();
          }}
          aria-label={soundEnabled ? t.soundOff : t.soundOn}
          title={soundEnabled ? t.soundOff : t.soundOn}
          className={`p-2 rounded-xl border transition-colors ${
            soundEnabled
              ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5'
              : 'text-slate-400 border-slate-700/50'
          }`}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Theme toggle button */}
        <button
          onClick={() => {
            onToggleTheme();
            sounds.playClick();
          }}
          aria-label={isDarkMode ? t.lightMode : t.darkMode}
          title={isDarkMode ? t.lightMode : t.darkMode}
          className={`p-2 rounded-xl border transition-colors ${
            isDarkMode
              ? 'border-slate-800 text-amber-400 hover:bg-slate-800'
              : 'border-slate-200 text-indigo-600 hover:bg-slate-100'
          }`}
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Settings button */}
        <button
          onClick={() => {
            sounds.playClick();
            onOpenSettings();
          }}
          aria-label={t.settings}
          title={t.settings}
          className={`p-2 rounded-xl border transition-colors ${
            isDarkMode
              ? 'border-slate-800 text-slate-300 hover:bg-slate-800'
              : 'border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Leave room button */}
        {roomCode && onLeaveRoom && (
          <button
            onClick={() => {
              sounds.playClick();
              onLeaveRoom();
            }}
            aria-label={t.leaveRoom}
            title={t.leaveRoom}
            className="p-2 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 transition-colors ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
