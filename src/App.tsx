/**
 * Chhaki Suna (ଛକି ଶୂନ) – Free Tic Tac Toe Online Multiplayer & Solo Game
 * Author: Sandeep Biswal G
 * URL: http://imsbg.github.io/webrtc-tictactoe/
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  RotateCcw,
  Share2,
  Eye,
  Users,
  Sparkles,
  Copy,
  Handshake,
  Play,
  Bot,
  Smartphone,
  Swords,
  Check,
  LogOut,
  Radio,
  Clock,
} from 'lucide-react';

import { translations, Language } from './utils/translations';
import { detectLanguageFromUrl, getPathWithLang, buildUrlWithLang } from './utils/urlLang';
import { sounds } from './utils/sound';
import { GameBoard } from './components/GameBoard';
import { RoomHeader } from './components/RoomHeader';
import { RoomLobby } from './components/RoomLobby';
import { SettingsModal } from './components/SettingsModal';
import { PromoBanner } from './components/PromoBanner';
import { QrModal } from './components/QrModal';
import { JoinInviteModal } from './components/JoinInviteModal';
import { ReactionFloater, FloatingItem } from './components/ReactionFloater';
import { GameDataFooter } from './components/GameDataFooter';
import { WebRTCNetworkRoom, GameState, UserRole } from './network/webrtc';
import { liveMatchRegistry } from './network/liveLobby';
import {
  isValidRoomCode,
  createEmptyBoard,
  applyMove,
  getBestBotMove,
  formatDuration,
  MoveRecord,
  RoundRecord,
} from './game/rules';

export type GameMode = 'multiplayer' | 'solo-pass' | 'solo-bot';

export default function App() {
  // Localization & Theme Preferences (Default language: Odia 'or', synced with /odia and /en in URL)
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    try {
      const urlLang = detectLanguageFromUrl(window.location.pathname, window.location.search);
      if (urlLang) {
        localStorage.setItem('sb_ttt_lang', urlLang);
        return urlLang;
      }
      const stored = localStorage.getItem('sb_ttt_lang');
      return (stored === 'en' ? 'en' : 'or') as Language;
    } catch {
      return 'or';
    }
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('sb_ttt_theme');
      return stored ? stored === 'dark' : true;
    } catch {
      return true;
    }
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => sounds.isEnabled());

  const [playerName, setPlayerName] = useState<string>(() => {
    try {
      return localStorage.getItem('sb_ttt_player_name') || 'Player 1';
    } catch {
      return 'Player 1';
    }
  });

  // Game Mode State: null = Lobby, 'multiplayer', 'solo-pass', 'solo-bot'
  const [gameMode, setGameMode] = useState<GameMode | null>(null);

  // WebRTC Multiplayer State
  const [currentRoomCode, setCurrentRoomCode] = useState<string | null>(null);
  const [myRole, setMyRole] = useState<UserRole>('host');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected');

  // Shared Link Invite Modal State
  const [inviteRoomCode, setInviteRoomCode] = useState<string | null>(null);

  // Core Game State (shared across Multiplayer and Solo)
  const [gameState, setGameState] = useState<GameState>(() => {
    const now = Date.now();
    return {
      board: createEmptyBoard(),
      currentTurn: 'X',
      status: 'playing',
      winInfo: null,
      round: 1,
      scores: { X: 0, O: 0, ties: 0 },
      players: { X: null, O: null },
      spectators: [],
      rematchRequestedBy: null,
      matchStartTime: now,
      roundStartTime: now,
      currentRoundMoves: [],
      roundHistory: [],
      isPublicLive: true,
    };
  });

  // Live Timers (in seconds)
  const [totalElapsedSeconds, setTotalElapsedSeconds] = useState(0);
  const [currentRoundSeconds, setCurrentRoundSeconds] = useState(0);

  // Modals & Floating Reactions
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeReactions, setActiveReactions] = useState<FloatingItem[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);

  const networkRoomRef = useRef<WebRTCNetworkRoom | null>(null);
  const t = translations[currentLanguage];

  // Apply dark mode class to root HTML
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('sb_ttt_theme', isDarkMode ? 'dark' : 'light');
    } catch {}
  }, [isDarkMode]);

  // Live 1-second timer for total match time and current round time
  useEffect(() => {
    if (!gameMode) {
      setTotalElapsedSeconds(0);
      setCurrentRoundSeconds(0);
      return;
    }

    const updateClocks = () => {
      const now = Date.now();
      setTotalElapsedSeconds(Math.max(0, Math.floor((now - gameState.matchStartTime) / 1000)));
      if (gameState.status === 'playing') {
        setCurrentRoundSeconds(Math.max(0, Math.floor((now - gameState.roundStartTime) / 1000)));
      } else {
        // Freeze round clock at the completed round's duration
        const completedRound = gameState.roundHistory.find((r) => r.round === gameState.round);
        if (completedRound) {
          setCurrentRoundSeconds(completedRound.durationSeconds);
        }
      }
    };

    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, [gameMode, gameState.matchStartTime, gameState.roundStartTime, gameState.status, gameState.round, gameState.roundHistory]);

  // Keep URL path (/en or /odia) and HTML lang attribute in sync with currentLanguage
  useEffect(() => {
    document.documentElement.lang = currentLanguage;
    try {
      const targetPath = getPathWithLang(window.location.pathname, currentLanguage);
      if (window.location.pathname !== targetPath) {
        const nextUrl = buildUrlWithLang(
          window.location.pathname,
          window.location.search,
          window.location.hash,
          currentLanguage
        );
        window.history.replaceState({}, '', nextUrl);
      }
    } catch {}
  }, [currentLanguage]);

  // Listen for browser back/forward navigation between /en and /odia
  useEffect(() => {
    const handlePopState = () => {
      const urlLang = detectLanguageFromUrl(window.location.pathname, window.location.search);
      if (urlLang) {
        setCurrentLanguage(urlLang);
        try {
          localStorage.setItem('sb_ttt_lang', urlLang);
        } catch {}
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSelectLanguage = (lang: Language) => {
    setCurrentLanguage(lang);
    try {
      localStorage.setItem('sb_ttt_lang', lang);
      const nextUrl = buildUrlWithLang(
        window.location.pathname,
        window.location.search,
        window.location.hash,
        lang
      );
      if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== nextUrl) {
        window.history.pushState({}, '', nextUrl);
      }
    } catch {}
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.setEnabled(next);
  };

  const handleUpdatePlayerName = (name: string) => {
    setPlayerName(name);
    try {
      localStorage.setItem('sb_ttt_player_name', name);
    } catch {}
    if (networkRoomRef.current) {
      networkRoomRef.current.myName = name;
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Check URL query parameters for shared room links
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    const autostart = params.get('autostart');

    if (roomParam && isValidRoomCode(roomParam)) {
      setInviteRoomCode(roomParam.toUpperCase());
    } else if (autostart === '1') {
      createRoom('SB2026', true);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      networkRoomRef.current?.destroy();
    };
  }, []);

  // Win and Draw audio/confetti triggers
  useEffect(() => {
    if (gameState.status === 'won') {
      sounds.playWin();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.55 },
        colors: ['#6366F1', '#EC4899', '#38BDF8', '#F59E0B'],
      });
    } else if (gameState.status === 'draw') {
      sounds.playDraw();
    }
  }, [gameState.status, gameState.winInfo]);

  // Execute local board move (for Solo mode)
  const executeLocalMove = useCallback((index: number, player: 'X' | 'O') => {
    setGameState((prev) => {
      const result = applyMove(prev.board, index, player, prev.currentTurn, prev.status);
      if (!result) return prev;

      const now = Date.now();
      const elapsedSeconds = Math.max(0, Math.round((now - prev.roundStartTime) / 1000));
      const movePlayerName =
        player === 'X'
          ? prev.players.X?.name || 'Player 1'
          : prev.players.O?.name || 'Player 2';

      const moveRecord: MoveRecord = {
        moveNumber: prev.currentRoundMoves.length + 1,
        player,
        playerName: movePlayerName,
        cellIndex: index,
        elapsedSeconds,
      };

      const nextMoves = [...prev.currentRoundMoves, moveRecord];
      const nextScores = { ...prev.scores };
      let nextHistory = prev.roundHistory;

      if (result.newStatus === 'won' && result.winInfo) {
        if (result.winInfo.winner === 'X') nextScores.X += 1;
        else nextScores.O += 1;

        const winnerMark = result.winInfo.winner;
        const winnerName =
          winnerMark === 'X'
            ? prev.players.X?.name || 'Player 1'
            : prev.players.O?.name || 'Player 2';

        const roundRec: RoundRecord = {
          round: prev.round,
          winner: winnerMark,
          winnerName,
          durationSeconds: Math.max(1, elapsedSeconds),
          moves: nextMoves,
          finalMove: moveRecord,
          finalBoard: [...result.nextBoard],
          winLine: result.winInfo.line,
          completedAt: now,
        };
        if (!prev.roundHistory.some((r) => r.round === prev.round)) {
          nextHistory = [...prev.roundHistory, roundRec];
        }
      } else if (result.newStatus === 'draw') {
        nextScores.ties += 1;
        const roundRec: RoundRecord = {
          round: prev.round,
          winner: 'draw',
          winnerName: t.ties,
          durationSeconds: Math.max(1, elapsedSeconds),
          moves: nextMoves,
          finalMove: moveRecord,
          finalBoard: [...result.nextBoard],
          winLine: null,
          completedAt: now,
        };
        if (!prev.roundHistory.some((r) => r.round === prev.round)) {
          nextHistory = [...prev.roundHistory, roundRec];
        }
      }

      return {
        ...prev,
        board: result.nextBoard,
        currentTurn: result.nextTurn,
        status: result.newStatus,
        winInfo: result.winInfo,
        scores: nextScores,
        currentRoundMoves: nextMoves,
        roundHistory: nextHistory,
      };
    });
  }, [t.ties]);

  // Solo Bot automatic move handler
  useEffect(() => {
    if (gameMode === 'solo-bot' && gameState.status === 'playing' && gameState.currentTurn === 'O') {
      const timer = setTimeout(() => {
        const botMove = getBestBotMove(gameState.board, 'O');
        if (botMove !== -1) {
          executeLocalMove(botMove, 'O');
          sounds.playMove('O');
        }
      }, 320);
      return () => clearTimeout(timer);
    }
  }, [gameMode, gameState.status, gameState.currentTurn, gameState.board, executeLocalMove]);

  // Create Multiplayer Room (Host)
  const createRoom = useCallback((code: string, isPublicLive: boolean = true) => {
    networkRoomRef.current?.destroy();
    setGameMode('multiplayer');
    setCurrentRoomCode(code);
    setMyRole('host');

    const room = new WebRTCNetworkRoom(
      code,
      'host',
      playerName,
      {
        onStateChange: (newState) => setGameState({ ...newState }),
        onRoleChange: (newRole) => setMyRole(newRole),
        onConnectionStatusChange: (status) => setConnectionStatus(status),
        onReactionReceived: (emoji, sender) => triggerFloatingReaction(emoji, sender),
        onNotification: (msg) => showToast(msg),
      },
      isPublicLive
    );

    networkRoomRef.current = room;
    setGameState(room.getState());
  }, [playerName]);

  // Join Multiplayer Room (Guest or Spectator)
  const joinRoom = useCallback((code: string, role: 'guest' | 'spectator', customName?: string) => {
    networkRoomRef.current?.destroy();
    const finalName = (customName ?? playerName).trim() || (role === 'guest' ? 'Player O' : 'Spectator');
    if (customName) {
      handleUpdatePlayerName(finalName);
    }
    setGameMode('multiplayer');
    setCurrentRoomCode(code);
    setMyRole(role);

    const room = new WebRTCNetworkRoom(code, role, finalName, {
      onStateChange: (newState) => {
        setGameState({ ...newState });
      },
      onRoleChange: (newRole) => {
        setMyRole(newRole);
      },
      onConnectionStatusChange: (status) => setConnectionStatus(status),
      onReactionReceived: (emoji, sender) => triggerFloatingReaction(emoji, sender),
      onNotification: (msg) => showToast(msg),
    });

    networkRoomRef.current = room;
    setGameState(room.getState());
  }, [playerName]);

  // Start Solo Game (Single Device)
  const handleStartSolo = (mode: 'pass' | 'bot', customPlayer2Name?: string) => {
    networkRoomRef.current?.destroy();
    networkRoomRef.current = null;
    setCurrentRoomCode(null);
    setGameMode(mode === 'pass' ? 'solo-pass' : 'solo-bot');
    setMyRole('host');

    const p2DisplayName =
      mode === 'pass'
        ? customPlayer2Name?.trim() || 'Player 2'
        : t.computer;

    const now = Date.now();
    setGameState({
      board: createEmptyBoard(),
      currentTurn: 'X',
      status: 'playing',
      winInfo: null,
      round: 1,
      scores: { X: 0, O: 0, ties: 0 },
      players: {
        X: { name: playerName.trim() || 'Player 1', role: 'host', mark: 'X', id: 'p1' },
        O: { name: p2DisplayName, role: 'guest', mark: 'O', id: 'p2' },
      },
      spectators: [],
      rematchRequestedBy: null,
      matchStartTime: now,
      roundStartTime: now,
      currentRoundMoves: [],
      roundHistory: [],
      isPublicLive: false,
    });
  };

  // Leave active game & return to lobby
  const handleLeaveGame = () => {
    if (currentRoomCode && myRole === 'host') {
      liveMatchRegistry.removeRoom(currentRoomCode);
    }
    networkRoomRef.current?.destroy();
    networkRoomRef.current = null;
    setCurrentRoomCode(null);
    setGameMode(null);
    setConnectionStatus('disconnected');
    const cleanUrl = getPathWithLang(window.location.pathname, currentLanguage);
    window.history.replaceState({}, '', cleanUrl);
  };

  // Handle cell click
  const handleBoardClick = (index: number) => {
    if (gameMode === 'multiplayer') {
      const mark = myRole === 'host' ? 'X' : myRole === 'guest' ? 'O' : null;
      if (!mark) return;
      networkRoomRef.current?.makeMove(index, mark);
    } else if (gameMode === 'solo-pass') {
      executeLocalMove(index, gameState.currentTurn);
    } else if (gameMode === 'solo-bot') {
      if (gameState.currentTurn === 'X' && gameState.status === 'playing') {
        executeLocalMove(index, 'X');
      }
    }
  };

  // Rematch / Replay in Solo or Multiplayer (Strictly increments 1, 2, 3, 4, 5, 6 without skipping)
  const handleReplay = () => {
    if (gameState.status === 'playing') return;
    sounds.playRematch();
    if (gameMode === 'multiplayer') {
      const mark = myRole === 'host' ? 'X' : myRole === 'guest' ? 'O' : 'X';
      networkRoomRef.current?.requestRematch(mark);
    } else {
      setGameState((prev) => {
        if (prev.status === 'playing') return prev;
        const nextRound = prev.round + 1;
        return {
          ...prev,
          board: createEmptyBoard(),
          status: 'playing',
          winInfo: null,
          round: nextRound,
          roundStartTime: Date.now(),
          currentRoundMoves: [],
          currentTurn: nextRound % 2 === 1 ? 'X' : 'O',
        };
      });
    }
  };

  const handleAcceptRematch = () => {
    if (gameState.status === 'playing') return;
    sounds.playRematch();
    networkRoomRef.current?.acceptRematch();
  };

  // Copy share invite link
  const handleCopyLink = () => {
    if (!currentRoomCode) return;
    const langPath = getPathWithLang(window.location.pathname, currentLanguage);
    const url = `${window.location.origin}${langPath}?room=${currentRoomCode}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      sounds.playClick();
      showToast(t.linkCopied);
      setTimeout(() => setCopiedLink(false), 2200);
    });
  };

  // Floating cheering reactions
  const triggerFloatingReaction = (emoji: string, sender: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    const leftPercent = 20 + Math.random() * 60;
    setActiveReactions((prev) => [...prev, { id, emoji, sender, leftPercent }]);
    setTimeout(() => {
      setActiveReactions((prev) => prev.filter((item) => item.id !== id));
    }, 1800);
  };

  const handleSendReaction = (emoji: string) => {
    if (gameMode === 'multiplayer') {
      networkRoomRef.current?.sendReaction(emoji);
    } else {
      triggerFloatingReaction(emoji, playerName);
    }
  };

  // Permissions & turn logic
  const myMark: 'X' | 'O' | null =
    gameMode === 'solo-pass'
      ? gameState.currentTurn
      : gameMode === 'solo-bot'
      ? 'X'
      : myRole === 'host'
      ? 'X'
      : myRole === 'guest'
      ? 'O'
      : null;

  const isMyTurn =
    gameState.status === 'playing' &&
    (gameMode === 'solo-pass'
      ? true
      : gameMode === 'solo-bot'
      ? gameState.currentTurn === 'X'
      : myRole !== 'spectator' && gameState.currentTurn === myMark);

  const canMove = isMyTurn;

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-300 selection:bg-indigo-500 selection:text-white pb-24 sm:pb-20 ${
        isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Header */}
      <RoomHeader
        roomCode={currentRoomCode}
        connectionStatus={connectionStatus}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        currentLanguage={currentLanguage}
        onToggleLanguage={() => handleSelectLanguage(currentLanguage === 'en' ? 'or' : 'en')}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenQr={() => setIsQrOpen(true)}
        onLeaveRoom={gameMode !== null ? handleLeaveGame : undefined}
        t={t}
      />

      {/* Main Container */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 py-4 w-full max-w-6xl mx-auto">
        {!gameMode ? (
          /* Lobby: Choose Solo, Create/Join Room, or See Live Matches */
          <RoomLobby
            playerName={playerName}
            onUpdatePlayerName={handleUpdatePlayerName}
            onCreateRoom={createRoom}
            onJoinRoom={(code, role) => joinRoom(code, role)}
            onStartSolo={handleStartSolo}
            t={t}
            isDarkMode={isDarkMode}
          />
        ) : (
          /* Active Game View: Responsive Mobile-first & Two-sided Desktop Layout */
          <div className="w-full animate-fade-in">
            {/* Desktop: 2-Column Split View. Mobile: Details at Top (order-1), Board directly below (order-2) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-center">
              {/* BOARD COLUMN: Order 2 on Mobile (below details), Order 1 on Desktop (left side) */}
              <div className="order-2 lg:order-1 lg:col-span-6 flex flex-col items-center justify-center space-y-3.5">
                <GameBoard
                  board={gameState.board}
                  winInfo={gameState.winInfo}
                  currentTurn={gameState.currentTurn}
                  myMark={myMark}
                  isMyTurn={isMyTurn}
                  canMove={canMove}
                  onCellClick={handleBoardClick}
                  isDarkMode={isDarkMode}
                />

                <ReactionFloater
                  onSendReaction={handleSendReaction}
                  activeReactions={activeReactions}
                  t={t}
                  isDarkMode={isDarkMode}
                />
              </div>

              {/* DETAILS & MOVE COLUMN: Order 1 on Mobile (at top), Order 2 on Desktop (right side) */}
              <div className="order-1 lg:order-2 lg:col-span-6 space-y-3.5">
                {/* Top Info Banner: Room Code / Solo Badge */}
                <div
                  className={`p-3.5 sm:p-4 rounded-2xl border shadow-md flex items-center justify-between ${
                    isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                      {gameMode === 'multiplayer' ? (
                        <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
                      ) : gameMode === 'solo-bot' ? (
                        <Bot className="w-4 h-4 text-rose-500" />
                      ) : (
                        <Smartphone className="w-4 h-4 text-indigo-500" />
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        {gameMode === 'multiplayer' ? t.p2pRoomSubtitle : t.playSolo}
                      </span>
                      <h3 className="font-mono font-extrabold text-base tracking-wider text-indigo-500">
                        {gameMode === 'multiplayer'
                          ? currentRoomCode
                          : gameMode === 'solo-bot'
                          ? t.vsComputer
                          : t.passAndPlay}
                      </h3>
                    </div>
                  </div>

                  {/* Share controls if Multiplayer */}
                  {gameMode === 'multiplayer' && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        title={t.copyLink}
                        aria-label={t.copyLink}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                      >
                        {copiedLink ? (
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedLink ? t.copied : t.copyLink}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          setIsQrOpen(true);
                        }}
                        title={t.scanQr}
                        aria-label={t.scanQr}
                        className="p-2 rounded-xl border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Scoreboard & Live Clock Header */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold px-1 flex-wrap gap-2">
                    <span className="flex items-center gap-1 text-slate-300 font-bold">
                      <Swords className="w-3.5 h-3.5 text-indigo-500" />
                      {t.round} {gameState.round}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-400 font-mono text-[11px]">
                        <Clock className="w-3 h-3" />
                        {t.roundTime}: {formatDuration(currentRoundSeconds)}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 font-mono text-[11px]">
                        <Clock className="w-3 h-3" />
                        {t.totalPlayTime}: {formatDuration(totalElapsedSeconds)}
                      </span>
                    </div>

                    {gameState.spectators.length > 0 && (
                      <span className="flex items-center gap-1 text-amber-500">
                        <Eye className="w-3.5 h-3.5" />
                        {gameState.spectators.length} {t.spectators} {t.spectatorWatching}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    {/* Player X */}
                    <div
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        gameState.status === 'playing' && gameState.currentTurn === 'X'
                          ? 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-500/10 shadow-md'
                          : isDarkMode
                          ? 'bg-slate-900/60 border-slate-800'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="text-[11px] font-bold text-indigo-500 truncate mb-0.5">
                        X • {gameState.players.X?.name || playerName}
                      </div>
                      <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                        {gameState.scores.X}
                      </div>
                      <div className="text-[9px] uppercase tracking-wider text-slate-400">
                        {t.wins}
                      </div>
                    </div>

                    {/* Draws */}
                    <div
                      className={`p-3 rounded-2xl border text-center ${
                        isDarkMode
                          ? 'bg-slate-900/40 border-slate-800 text-slate-400'
                          : 'bg-white/60 border-slate-200 text-slate-500'
                      }`}
                    >
                      <div className="text-[11px] font-bold text-slate-400 truncate mb-0.5">
                        {t.ties}
                      </div>
                      <div className="text-2xl font-black">{gameState.scores.ties}</div>
                      <div className="text-[9px] uppercase tracking-wider text-slate-400">
                        {t.drawsLabel}
                      </div>
                    </div>

                    {/* Player O */}
                    <div
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        gameState.status === 'playing' && gameState.currentTurn === 'O'
                          ? 'ring-2 ring-rose-500 border-rose-500 bg-rose-500/10 shadow-md'
                          : isDarkMode
                          ? 'bg-slate-900/60 border-slate-800'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="text-[11px] font-bold text-rose-500 truncate mb-0.5">
                        O •{' '}
                        {gameState.players.O?.name ||
                          (gameMode === 'solo-bot'
                            ? t.computer
                            : gameMode === 'solo-pass'
                            ? 'Player 2'
                            : t.waitingForOpponent)}
                      </div>
                      <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
                        {gameState.scores.O}
                      </div>
                      <div className="text-[9px] uppercase tracking-wider text-slate-400">
                        {t.wins}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Waiting Banner or Turn Status */}
                {gameMode === 'multiplayer' && !gameState.players.O && myRole === 'host' ? (
                  <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-center space-y-2">
                    <p className="text-xs font-bold text-indigo-500 flex items-center justify-center gap-1.5 animate-pulse">
                      <Users className="w-4 h-4" />
                      <span>{t.waitingForOpponent}</span>
                    </p>
                    <p className="text-[11px] text-slate-400">{t.shareLinkPrompt}</p>
                  </div>
                ) : myRole === 'spectator' ? (
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center text-xs font-semibold text-amber-500 flex items-center justify-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>{t.spectatorModeNotice}</span>
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-slate-500/5 border border-slate-800 text-center text-xs font-bold">
                    <span className="text-slate-400">{t.spectatorTurnNotice} </span>
                    <span
                      className={
                        gameState.currentTurn === 'X' ? 'text-indigo-400' : 'text-rose-400'
                      }
                    >
                      {gameState.currentTurn === 'X'
                        ? gameState.players.X?.name || playerName
                        : gameState.players.O?.name ||
                          (gameMode === 'solo-bot' ? t.computer : 'Player 2')}
                    </span>
                  </div>
                )}

                {/* Game Result & Replay Box */}
                {gameState.status !== 'playing' && (
                  <div
                    className={`p-5 rounded-2xl border shadow-xl text-center space-y-3 animate-pop-in ${
                      isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                    }`}
                  >
                    {gameState.status === 'won' && gameState.winInfo ? (
                      <div className="space-y-1">
                        <Trophy className="w-8 h-8 text-amber-500 mx-auto animate-bounce" />
                        <h4 className="text-lg font-black tracking-tight">
                          {gameState.winInfo.winner === 'X'
                            ? gameState.players.X?.name || playerName
                            : gameState.players.O?.name ||
                              (gameMode === 'solo-bot' ? t.computer : 'Player 2')}{' '}
                          {t.gameOverWin}
                        </h4>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Handshake className="w-7 h-7 text-slate-400 mx-auto" />
                        <h4 className="text-lg font-bold tracking-tight">{t.gameOverDraw}</h4>
                      </div>
                    )}

                    {/* Replay Controls */}
                    {myRole !== 'spectator' ? (
                      <div>
                        {gameMode === 'multiplayer' &&
                        gameState.rematchRequestedBy &&
                        gameState.rematchRequestedBy !== myMark ? (
                          <button
                            type="button"
                            onClick={handleAcceptRematch}
                            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                          >
                            <Play className="w-4 h-4 fill-white" />
                            <span>{t.acceptRematch}</span>
                          </button>
                        ) : gameMode === 'multiplayer' &&
                          gameState.rematchRequestedBy === myMark ? (
                          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 text-xs font-semibold animate-pulse">
                            {t.rematchRequested}
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={handleReplay}
                            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                          >
                            <RotateCcw className="w-4 h-4" />
                            <span>{t.playAgain}</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">{t.waitingForReplay}</p>
                    )}
                  </div>
                )}

                {/* Back to Lobby Button */}
                <button
                  type="button"
                  onClick={handleLeaveGame}
                  className="w-full py-2.5 rounded-xl border border-slate-700/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t.leaveRoom}</span>
                </button>
              </div>
            </div>

            {/* Game Data & Round History Footer (Total Time, Round Time, Winners, Full Move Sequence & Final Move) */}
            <GameDataFooter
              totalElapsedSeconds={totalElapsedSeconds}
              currentRoundSeconds={currentRoundSeconds}
              currentRoundMoves={gameState.currentRoundMoves}
              roundHistory={gameState.roundHistory}
              t={t}
              isDarkMode={isDarkMode}
            />
          </div>
        )}
      </main>

      {/* Floating Sticky Sponsored App Card (Always ON, editable in PromoBanner.tsx) */}
      <PromoBanner t={t} isDarkMode={isDarkMode} />

      {/* Shared Link Invite Modal: Prompts Name & Role */}
      {inviteRoomCode && (
        <JoinInviteModal
          isOpen={true}
          roomCode={inviteRoomCode}
          defaultName={playerName}
          onJoin={(name, role) => {
            const code = inviteRoomCode;
            setInviteRoomCode(null);
            joinRoom(code, role, name);
          }}
          onCancel={() => {
            setInviteRoomCode(null);
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, '', cleanUrl);
          }}
          t={t}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Settings Modal (Theme, Sound, Odia/English Language) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        currentLanguage={currentLanguage}
        onSelectLanguage={handleSelectLanguage}
        playerName={playerName}
        onUpdatePlayerName={handleUpdatePlayerName}
        t={t}
      />

      {/* QR Code Modal */}
      {currentRoomCode && (
        <QrModal
          isOpen={isQrOpen}
          onClose={() => setIsQrOpen(false)}
          roomCode={currentRoomCode}
          isDarkMode={isDarkMode}
          t={t}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-4 sm:right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 text-white border border-slate-700 shadow-2xl text-xs font-semibold animate-pop-in">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
