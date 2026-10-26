import React from 'react';
import { Eye, Trophy, Users, Swords } from 'lucide-react';
import { GameState, UserRole } from '../network/webrtc';
import { Translations } from '../utils/translations';

interface ScoreBoardProps {
  state: GameState;
  myRole: UserRole;
  myMark: 'X' | 'O' | null;
  t: Translations;
  isDarkMode: boolean;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  state,
  myRole,
  myMark,
  t,
  isDarkMode,
}) => {
  const isXTurn = state.status === 'playing' && state.currentTurn === 'X';
  const isOTurn = state.status === 'playing' && state.currentTurn === 'O';

  const playerXName = state.players.X?.name || t.playerX;
  const playerOName = state.players.O?.name || (state.players.O ? t.playerO : t.waitingForOpponent);

  return (
    <div className="w-full max-w-xl mx-auto space-y-3">
      {/* Top status bar: Round & Spectator counter */}
      <div className="flex items-center justify-between text-xs font-semibold px-2">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
          <Swords className="w-3.5 h-3.5" />
          <span>{t.round} {state.round}</span>
        </div>

        {state.spectators.length > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse">
            <Eye className="w-3.5 h-3.5" />
            <span>
              {state.spectators.length} {t.spectators} {t.spectatorWatching}
            </span>
          </div>
        )}
      </div>

      {/* 3-Column Score Grid */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {/* Player X Card */}
        <div
          className={`relative p-3 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center text-center ${
            isXTurn
              ? 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/20 scale-[1.02]'
              : isDarkMode
              ? 'bg-slate-900/60 border-slate-800 text-slate-300'
              : 'bg-white/80 border-slate-200 text-slate-700'
          }`}
        >
          {isXTurn && (
            <span className="absolute -top-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white shadow-sm uppercase tracking-wider animate-bounce">
              Turn
            </span>
          )}
          <div className="flex items-center gap-1 text-xs font-bold text-indigo-500 max-w-full truncate mb-0.5">
            <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] shrink-0">
              X
            </span>
            <span className="truncate">{playerXName}</span>
            {myMark === 'X' && (
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400 shrink-0">
                {t.you}
              </span>
            )}
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400">
            {state.scores.X}
          </span>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">
            {t.wins}
          </span>
        </div>

        {/* Ties / Draws Card */}
        <div
          className={`p-3 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center text-center ${
            isDarkMode
              ? 'bg-slate-900/40 border-slate-800 text-slate-400'
              : 'bg-white/60 border-slate-200 text-slate-500'
          }`}
        >
          <div className="flex items-center gap-1 text-xs font-semibold mb-0.5 text-slate-400">
            <Trophy className="w-3.5 h-3.5" />
            <span>{t.ties}</span>
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {state.scores.ties}
          </span>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">
            Draws
          </span>
        </div>

        {/* Player O Card */}
        <div
          className={`relative p-3 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center text-center ${
            isOTurn
              ? 'ring-2 ring-rose-500 border-rose-500 bg-rose-500/10 shadow-lg shadow-rose-500/20 scale-[1.02]'
              : isDarkMode
              ? 'bg-slate-900/60 border-slate-800 text-slate-300'
              : 'bg-white/80 border-slate-200 text-slate-700'
          }`}
        >
          {isOTurn && (
            <span className="absolute -top-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white shadow-sm uppercase tracking-wider animate-bounce">
              Turn
            </span>
          )}
          <div className="flex items-center gap-1 text-xs font-bold text-rose-500 max-w-full truncate mb-0.5">
            <span className="w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] shrink-0">
              O
            </span>
            <span className="truncate">{playerOName}</span>
            {myMark === 'O' && (
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 shrink-0">
                {t.you}
              </span>
            )}
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-rose-600 dark:text-rose-400">
            {state.scores.O}
          </span>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">
            {t.wins}
          </span>
        </div>
      </div>
    </div>
  );
};
