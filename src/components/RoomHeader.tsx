import React, { useState, useEffect } from 'react';
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
  Globe,
  Menu,
  X,
  ShieldCheck,
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
  onOpenShareFriend?: () => void;
  onOpenTerms?: () => void;
  onLogoClick?: () => void;
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
  onOpenShareFriend,
  onOpenTerms,
  onLogoClick,
  onLeaveRoom,
  t,
}) => {
  const [copied, setCopied] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBrowserOnline, setIsBrowserOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine !== false : true
  );

  useEffect(() => {
    const handleOnline = () => setIsBrowserOnline(true);
    const handleOffline = () => setIsBrowserOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Determine Wi-Fi icon state: in room use WebRTC connectionStatus; outside room use browser online status
  const wifiState: 'connected' | 'connecting' | 'disconnected' = roomCode
    ? connectionStatus
    : isBrowserOnline
    ? 'connected'
    : 'disconnected';

  const wifiLabel =
    wifiState === 'connected'
      ? t.connected
      : wifiState === 'connecting'
      ? t.connecting
      : t.disconnected;

  const wifiColorClasses =
    wifiState === 'connected'
      ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
      : wifiState === 'connecting'
      ? 'bg-amber-500/15 text-amber-400 border-amber-500/30 animate-pulse'
      : 'bg-rose-500/15 text-rose-500 border-rose-500/30';

  const wifiDotColor =
    wifiState === 'connected'
      ? 'bg-emerald-500'
      : wifiState === 'connecting'
      ? 'bg-amber-400'
      : 'bg-rose-500';

  const handleCopyInviteLink = () => {
    if (!roomCode) return;
    const url = `${window.location.origin}${window.location.pathname}?room=${roomCode}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopied(true);
        sounds.playClick();
        setTimeout(() => setCopied(false), 2200);
      })
      .catch(() => {
        // fallback
      });
  };

  return (
    <header className="w-full relative z-30 border-b transition-colors duration-200">
      <div className="w-full flex items-center justify-between gap-2 py-2.5 sm:py-3 px-4 sm:px-6">
        {/* Left: Brand & Room Info */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={() => {
              if (onLogoClick) {
                sounds.playClick();
                onLogoClick();
              }
            }}
            className="flex items-center gap-2.5 text-left focus:outline-none group min-w-0"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0 group-hover:scale-105 transition-transform">
              <svg
                viewBox="0 0 32 32"
                className="w-6 h-6"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                {/* X mark on left */}
                <path
                  d="M5 10L13 18M13 10L5 18"
                  stroke="#38BDF8"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
                {/* O mark on right */}
                <circle
                  cx="22"
                  cy="18"
                  r="5.2"
                  stroke="#FB7185"
                  strokeWidth="3.2"
                />
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-extrabold leading-normal whitespace-nowrap pt-0.5">
                {t.appTitle}
              </h1>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium leading-normal truncate">
                {t.p2pRoomSubtitle}
              </p>
            </div>
          </button>

          {/* Room Code Pill if in room */}
          {roomCode && (
            <div className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border bg-indigo-500/10 border-indigo-500/20 text-indigo-500 text-xs font-mono font-bold tracking-wider shrink-0">
              <span>{roomCode}</span>
              <button
                type="button"
                onClick={handleCopyInviteLink}
                title={t.copyLink}
                aria-label="Copy room invite link"
                className="p-0.5 sm:p-1 hover:text-indigo-400 transition-colors"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onOpenQr();
                }}
                title={t.scanQr}
                aria-label="Show QR code"
                className="p-0.5 sm:p-1 hover:text-indigo-400 transition-colors"
              >
                <QrCode className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* MOBILE RIGHT CONTROLS: Wi-Fi Icon (Green/Yellow/Red) + 3-Line Hamburger Menu */}
        <div className="flex sm:hidden items-center gap-2 shrink-0">
          <div
            role="status"
            aria-label={`${t.webrtcStatus}: ${wifiLabel}`}
            title={`${t.webrtcStatus}: ${wifiLabel}`}
            className={`relative flex items-center justify-center p-2 rounded-xl border ${wifiColorClasses}`}
          >
            {wifiState === 'disconnected' ? (
              <WifiOff className="w-4 h-4" />
            ) : (
              <Wifi className="w-4 h-4" />
            )}
            <span
              className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ring-2 ring-slate-950 ${wifiDotColor}`}
            />
          </div>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setIsMobileMenuOpen((prev) => !prev);
            }}
            aria-label={t.menuLabel}
            aria-expanded={isMobileMenuOpen}
            title={t.menuLabel}
            className={`p-2 rounded-xl border transition-colors ${
              isDarkMode
                ? 'border-slate-800 bg-slate-900/90 text-slate-200 hover:bg-slate-800'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* DESKTOP RIGHT CONTROLS */}
        <div className="hidden sm:flex items-center gap-1.5 sm:gap-2">
          {/* Connection status badge (Green, Yellow, Red) */}
          <div
            role="status"
            title={`${t.webrtcStatus}: ${wifiLabel}`}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${wifiColorClasses}`}
          >
            {wifiState === 'disconnected' ? (
              <WifiOff className="w-3.5 h-3.5" />
            ) : (
              <Wifi className="w-3.5 h-3.5" />
            )}
            <span className="hidden md:inline">{wifiLabel}</span>
          </div>

          {/* Share with a Friend button */}
          {onOpenShareFriend && (
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onOpenShareFriend();
              }}
              aria-label={t.shareWithFriend}
              title={t.shareWithFriend}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-colors ${
                isDarkMode
                  ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20'
                  : 'border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.shareWithFriend}</span>
            </button>
          )}

          {/* Language switch button */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onToggleLanguage();
            }}
            aria-label={currentLanguage === 'or' ? 'Switch to English' : 'Switch to Odia'}
            title={currentLanguage === 'or' ? 'Switch to English' : 'Switch to Odia (ଓଡ଼ିଆ)'}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
              isDarkMode
                ? 'border-slate-800 text-slate-300 hover:bg-slate-800'
                : 'border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-indigo-500" />
            <span>{currentLanguage === 'or' ? 'EN' : 'ଓଡ଼ିଆ'}</span>
          </button>

          {/* Sound toggle button */}
          <button
            type="button"
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
            type="button"
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
            type="button"
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
          {onLeaveRoom && (
            <button
              type="button"
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
      </div>

      {/* MOBILE THREE-LINE DROPDOWN MENU */}
      {isMobileMenuOpen && (
        <div
          role="menu"
          aria-label={t.menuLabel}
          className={`sm:hidden border-t px-4 py-3 space-y-2 shadow-2xl animate-fade-in ${
            isDarkMode
              ? 'bg-slate-900/95 border-slate-800 text-slate-100'
              : 'bg-white/95 border-slate-200 text-slate-900'
          } backdrop-blur-xl`}
        >
          {/* Connection Status Summary Row */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl border border-slate-800/40 bg-slate-500/5 text-xs">
            <span className="text-slate-400 font-semibold">{t.webrtcStatus}:</span>
            <span className={`inline-flex items-center gap-1.5 font-bold ${
              wifiState === 'connected'
                ? 'text-emerald-500'
                : wifiState === 'connecting'
                ? 'text-amber-400'
                : 'text-rose-500'
            }`}>
              <span className={`w-2 h-2 rounded-full ${wifiDotColor}`} />
              {wifiLabel}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Language Switch */}
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                sounds.playClick();
                onToggleLanguage();
                setIsMobileMenuOpen(false);
              }}
              className={`flex items-center gap-2 p-2.5 rounded-xl border text-[11px] font-bold transition-colors ${
                isDarkMode
                  ? 'border-slate-800 bg-slate-800/60 text-slate-200 hover:bg-slate-800'
                  : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100'
              }`}
            >
              <Globe className="w-4 h-4 text-indigo-500 shrink-0" />
              <span className="truncate">
                {currentLanguage === 'or' ? 'Switch to English' : 'ଓଡ଼ିଆ ଭାଷା'}
              </span>
            </button>

            {/* Share with a Friend */}
            {onOpenShareFriend && (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  sounds.playClick();
                  setIsMobileMenuOpen(false);
                  onOpenShareFriend();
                }}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-[11px] font-bold transition-colors ${
                  isDarkMode
                    ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20'
                    : 'border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                }`}
              >
                <Share2 className="w-4 h-4 shrink-0" />
                <span className="truncate">{t.shareWithFriend}</span>
              </button>
            )}

            {/* Sound Toggle */}
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onToggleSound();
                sounds.playClick();
                setIsMobileMenuOpen(false);
              }}
              className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-colors ${
                soundEnabled
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                  : isDarkMode
                  ? 'border-slate-800 bg-slate-800/60 text-slate-400'
                  : 'border-slate-200 bg-slate-50 text-slate-600'
              }`}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : (
                <VolumeX className="w-4 h-4 text-rose-500 shrink-0" />
              )}
              <span className="truncate">{soundEnabled ? t.soundOn : t.soundOff}</span>
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onToggleTheme();
                sounds.playClick();
                setIsMobileMenuOpen(false);
              }}
              className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-colors ${
                isDarkMode
                  ? 'border-slate-800 bg-slate-800/60 text-amber-400'
                  : 'border-slate-200 bg-slate-50 text-indigo-600'
              }`}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 shrink-0" />
              ) : (
                <Moon className="w-4 h-4 shrink-0" />
              )}
              <span className="truncate">{isDarkMode ? t.lightMode : t.darkMode}</span>
            </button>

            {/* Settings */}
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                sounds.playClick();
                setIsMobileMenuOpen(false);
                onOpenSettings();
              }}
              className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-colors ${
                isDarkMode
                  ? 'border-slate-800 bg-slate-800/60 text-slate-200'
                  : 'border-slate-200 bg-slate-50 text-slate-700'
              }`}
            >
              <Settings className="w-4 h-4 text-indigo-500 shrink-0" />
              <span className="truncate">{t.settings}</span>
            </button>

            {/* Terms & Conditions */}
            {onOpenTerms && (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  sounds.playClick();
                  setIsMobileMenuOpen(false);
                  onOpenTerms();
                }}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-colors ${
                  isDarkMode
                    ? 'border-slate-800 bg-slate-800/60 text-slate-200'
                    : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="truncate">{t.termsAndPrivacy}</span>
              </button>
            )}
          </div>

          {/* Leave Room Button inside Mobile Menu when in an active match */}
          {onLeaveRoom && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                sounds.playClick();
                setIsMobileMenuOpen(false);
                onLeaveRoom();
              }}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>{t.leaveRoom}</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};

