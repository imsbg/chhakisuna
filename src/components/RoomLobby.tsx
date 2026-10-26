import React, { useState, useEffect } from 'react';
import {
  Play,
  Users,
  Eye,
  Sparkles,
  Zap,
  Bot,
  Smartphone,
  UserCheck,
  Gamepad2,
  X,
  Radio,
  Swords,
} from 'lucide-react';
import { Translations } from '../utils/translations';
import { generateRoomCode, isValidRoomCode, normalizeRoomCode } from '../game/rules';
import { sounds } from '../utils/sound';
import { liveMatchRegistry, LiveMatchSummary } from '../network/liveLobby';

interface RoomLobbyProps {
  initialRoomCode?: string;
  playerName: string;
  onUpdatePlayerName: (name: string) => void;
  onCreateRoom: (code: string, isPublicLive: boolean) => void;
  onJoinRoom: (code: string, role: 'guest' | 'spectator') => void;
  onStartSolo: (mode: 'pass' | 'bot', player2Name?: string) => void;
  t: Translations;
  isDarkMode: boolean;
}

export const RoomLobby: React.FC<RoomLobbyProps> = ({
  initialRoomCode = '',
  playerName,
  onUpdatePlayerName,
  onCreateRoom,
  onJoinRoom,
  onStartSolo,
  t,
  isDarkMode,
}) => {
  const [inputCode, setInputCode] = useState(initialRoomCode.toUpperCase());
  const [errorMsg, setErrorMsg] = useState('');
  const [isPublicLive, setIsPublicLive] = useState<boolean>(true);
  const [liveMatches, setLiveMatches] = useState<LiveMatchSummary[]>([]);
  const [isTwoPlayerModalOpen, setIsTwoPlayerModalOpen] = useState(false);
  const [player2Name, setPlayer2Name] = useState(() => {
    try {
      return localStorage.getItem('sb_ttt_player2_name') || 'Player 2';
    } catch {
      return 'Player 2';
    }
  });

  useEffect(() => {
    if (initialRoomCode) {
      setInputCode(initialRoomCode.toUpperCase());
    }
  }, [initialRoomCode]);

  useEffect(() => {
    const unsubscribe = liveMatchRegistry.subscribe((matches) => {
      setLiveMatches(matches);
    });
    const timer = setInterval(() => {
      setLiveMatches(liveMatchRegistry.getLiveMatches());
    }, 2000);
    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, []);

  const handleCreateNewRoom = () => {
    sounds.playClick();
    const newCode = generateRoomCode();
    onCreateRoom(newCode, isPublicLive);
  };

  const handleJoin = (role: 'guest' | 'spectator') => {
    sounds.playClick();
    const clean = normalizeRoomCode(inputCode);
    if (!isValidRoomCode(clean)) {
      setErrorMsg(t.invalidCode);
      return;
    }
    setErrorMsg('');
    onJoinRoom(clean, role);
  };

  const handleConfirmTwoPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playClick();
    const cleanP2 = player2Name.trim() || 'Player 2';
    try {
      localStorage.setItem('sb_ttt_player2_name', cleanP2);
    } catch {}
    setIsTwoPlayerModalOpen(false);
    onStartSolo('pass', cleanP2);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-5 animate-fade-in">
      {/* Two-sided Desktop Layout: Grid on md/lg, stacked on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">
        {/* Left Side: Brand Hero, Name, and Solo Mode */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
          <div
            className={`p-5 sm:p-7 rounded-3xl border shadow-xl space-y-4 transition-all duration-300 relative overflow-hidden h-full flex flex-col justify-between ${
              isDarkMode
                ? 'bg-slate-900/80 border-slate-800 shadow-indigo-950/30'
                : 'bg-white/85 border-slate-200/90 shadow-slate-200/70'
            } backdrop-blur-xl`}
          >
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 text-xs font-semibold mb-3">
                <Zap className="w-3.5 h-3.5" />
                <span>{t.heroBadge}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                {t.appTitle}
              </h2>
              <p
                className={`text-xs sm:text-sm mt-1 leading-relaxed ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                {t.appSubtitle}
              </p>
            </div>

            {/* Name Input */}
            <div className="pt-1">
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                {t.yourName}
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => onUpdatePlayerName(e.target.value)}
                placeholder={t.namePlaceholder}
                maxLength={20}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold outline-none transition-all ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                }`}
              />
            </div>

            {/* Solo / Offline Single Device Mode Section */}
            <div className="pt-2 border-t border-slate-800/50 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                <Gamepad2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>{t.playSolo}</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setIsTwoPlayerModalOpen(true);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all hover:scale-[1.02] active:scale-95 ${
                    isDarkMode
                      ? 'bg-slate-800/80 border-slate-700 hover:border-indigo-500 hover:bg-slate-800'
                      : 'bg-slate-50 border-slate-200 hover:border-indigo-500 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Smartphone className="w-4 h-4 text-indigo-500" />
                    <span className="font-bold text-xs">{t.passAndPlay}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    {t.passAndPlayDesc}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    onStartSolo('bot');
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all hover:scale-[1.02] active:scale-95 ${
                    isDarkMode
                      ? 'bg-slate-800/80 border-slate-700 hover:border-rose-500 hover:bg-slate-800'
                      : 'bg-slate-50 border-slate-200 hover:border-rose-500 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Bot className="w-4 h-4 text-rose-500" />
                    <span className="font-bold text-xs">{t.vsComputer}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    {t.vsComputerDesc}
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Online WebRTC Multiplayer (Create & Join) */}
        <div className="lg:col-span-6 flex flex-col justify-between gap-4">
          {/* Create Room Box */}
          <div
            className={`p-5 sm:p-6 rounded-3xl border shadow-lg space-y-3 transition-all ${
              isDarkMode
                ? 'bg-slate-900/70 border-slate-800'
                : 'bg-white/80 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg">{t.createRoom}</h3>
                <p className="text-xs text-slate-400">{t.createRoomDesc}</p>
              </div>
            </div>

            {/* Creator Toggle: Make Room Public / Show in Live Matches */}
            <label
              className={`flex items-start gap-2.5 p-2.5 rounded-2xl border cursor-pointer transition-colors ${
                isPublicLive
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : isDarkMode
                  ? 'bg-slate-800/50 border-slate-700/70'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <input
                type="checkbox"
                checked={isPublicLive}
                onChange={(e) => {
                  sounds.playClick();
                  setIsPublicLive(e.target.checked);
                }}
                className="mt-0.5 h-4 w-4 rounded accent-emerald-500"
              />
              <div className="text-left">
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <Radio
                    className={`w-3.5 h-3.5 ${
                      isPublicLive ? 'text-emerald-500 animate-pulse' : 'text-slate-400'
                    }`}
                  />
                  {t.makeRoomLiveLabel}
                </span>
                <span className="text-[10px] text-slate-400 block leading-snug mt-0.5">
                  {t.makeRoomLiveDesc}
                </span>
              </div>
            </label>

            <button
              type="button"
              onClick={handleCreateNewRoom}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-md shadow-indigo-600/30 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{t.createRoom}</span>
            </button>
          </div>

          {/* Join Room Box */}
          <div
            className={`p-5 sm:p-6 rounded-3xl border shadow-lg space-y-3 transition-all ${
              isDarkMode
                ? 'bg-slate-900/70 border-slate-800'
                : 'bg-white/80 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg">{t.joinRoom}</h3>
                <p className="text-xs text-slate-400">{t.joinRoomDesc}</p>
              </div>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => {
                  setInputCode(e.target.value.toUpperCase());
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder={t.codePlaceholder}
                maxLength={6}
                className={`w-full px-4 py-2.5 rounded-xl border text-center font-mono font-bold tracking-widest text-base outline-none uppercase transition-all ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-white focus:border-rose-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-rose-500'
                }`}
              />

              {errorMsg && (
                <p className="text-rose-500 text-xs font-semibold text-center animate-shake">
                  {errorMsg}
                </p>
              )}

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleJoin('guest')}
                  className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs shadow-md shadow-rose-600/25 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>{t.joinRoom}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleJoin('spectator')}
                  className="py-2.5 px-3 rounded-xl border border-amber-500/30 hover:bg-amber-500/10 text-amber-500 font-bold text-xs active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{t.spectator}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SEE LIVE MATCHES SECTION (Backed by Phone Cache + BroadcastChannel + WebRTC P2P Hub) */}
      <div
        className={`p-5 sm:p-6 rounded-3xl border shadow-lg transition-all ${
          isDarkMode
            ? 'bg-slate-900/75 border-slate-800'
            : 'bg-white/85 border-slate-200'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-500">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base tracking-tight flex items-center gap-2">
                <span>{t.liveMatchesTitle}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400">
                  {liveMatches.length}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">{t.liveMatchesSubtitle}</p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold self-start sm:self-auto">
            <Eye className="w-3 h-3" />
            <span>{t.phoneCacheBadge}</span>
          </div>
        </div>

        {liveMatches.length === 0 ? (
          <div className="py-5 text-center text-xs text-slate-400">
            {t.noLiveMatches}
          </div>
        ) : (
          <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {liveMatches.map((match) => {
              const isSlotOpen = !match.guestName;
              return (
                <div
                  key={match.roomCode}
                  className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-3 transition-all ${
                    isDarkMode
                      ? 'bg-slate-800/70 border-slate-700 hover:border-indigo-500/60'
                      : 'bg-slate-50 border-slate-200 hover:border-indigo-500/60'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-sm px-2.5 py-0.5 rounded-lg bg-indigo-500/15 text-indigo-400 tracking-wider">
                        {match.roomCode}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isSlotOpen
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-amber-500/15 text-amber-400'
                        }`}
                      >
                        {isSlotOpen ? t.openForPlayer : t.matchInProgress}
                      </span>
                    </div>

                    <div className="text-xs font-bold truncate pt-0.5">
                      <span className="text-indigo-400">X: {match.hostName}</span>
                      <span className="mx-1.5 text-slate-500">vs</span>
                      <span className="text-rose-400">
                        O: {match.guestName || t.openForPlayer}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                      <span className="flex items-center gap-1">
                        <Swords className="w-3 h-3 text-indigo-400" />
                        {t.round} {match.round} • {match.scores.X} - {match.scores.O}
                      </span>
                      {match.spectatorCount > 0 && (
                        <span className="flex items-center gap-1 text-amber-400">
                          <Eye className="w-3 h-3" />
                          {match.spectatorCount}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        onJoinRoom(match.roomCode, 'spectator');
                      }}
                      className="w-full py-2.5 px-3 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="truncate">{t.joinAsSpectator}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2-Player Pass & Play Setup Modal (Prompts for Player 2 Name) */}
      {isTwoPlayerModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="two-player-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in"
        >
          <form
            onSubmit={handleConfirmTwoPlayer}
            className={`w-full max-w-md rounded-3xl border shadow-2xl p-6 space-y-4 transition-all ${
              isDarkMode
                ? 'bg-slate-900 border-slate-800 text-slate-100'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-500">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="two-player-modal-title" className="text-lg font-extrabold tracking-tight">
                    {t.passAndPlay}
                  </h3>
                  <p className="text-xs text-slate-400">{t.appTitle}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTwoPlayerModalOpen(false)}
                aria-label={t.close}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <label className="text-xs font-semibold text-indigo-400 flex items-center gap-1.5 mb-1">
                  <UserCheck className="w-3.5 h-3.5" />
                  {t.player1Name}
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => onUpdatePlayerName(e.target.value)}
                  placeholder={t.namePlaceholder}
                  maxLength={20}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold outline-none transition-all ${
                    isDarkMode
                      ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-rose-400 flex items-center gap-1.5 mb-1">
                  <Users className="w-3.5 h-3.5" />
                  {t.player2Name}
                </label>
                <input
                  type="text"
                  value={player2Name}
                  onChange={(e) => setPlayer2Name(e.target.value)}
                  placeholder={t.player2Placeholder}
                  maxLength={20}
                  autoFocus
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold outline-none transition-all ${
                    isDarkMode
                      ? 'bg-slate-800 border-slate-700 text-white focus:border-rose-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-rose-500'
                  }`}
                />
              </div>
            </div>

            <div className="pt-2 flex gap-2.5">
              <button
                type="button"
                onClick={() => setIsTwoPlayerModalOpen(false)}
                className={`flex-1 py-3 px-4 rounded-2xl border font-bold text-xs transition-all ${
                  isDarkMode
                    ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {t.close}
              </button>
              <button
                type="submit"
                className="flex-[2] py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-rose-500 hover:from-indigo-500 hover:to-rose-400 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{t.startTwoPlayerGame}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
