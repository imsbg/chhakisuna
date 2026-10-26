import React from 'react';
import { Clock, Trophy, Handshake, History, Sparkles, ArrowRight } from 'lucide-react';
import { RoundRecord, MoveRecord, formatDuration, formatCellPosition } from '../game/rules';
import { Translations } from '../utils/translations';

interface GameDataFooterProps {
  totalElapsedSeconds: number;
  currentRoundSeconds: number;
  currentRoundMoves: MoveRecord[];
  roundHistory: RoundRecord[];
  t: Translations;
  isDarkMode: boolean;
}

export const GameDataFooter: React.FC<GameDataFooterProps> = ({
  totalElapsedSeconds,
  currentRoundSeconds,
  currentRoundMoves,
  roundHistory,
  t,
  isDarkMode,
}) => {
  return (
    <section
      aria-label={t.gameDataTitle}
      className={`w-full mt-5 rounded-3xl border shadow-lg p-4 sm:p-6 transition-all ${
        isDarkMode
          ? 'bg-slate-900/80 border-slate-800 text-slate-100'
          : 'bg-white/90 border-slate-200 text-slate-900'
      }`}
    >
      {/* Header & Live Timers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/40">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-500 shrink-0">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold tracking-tight">
              {t.gameDataTitle}
            </h3>
            <p className="text-[11px] text-slate-400">
              {t.gameDataSubtitle}
            </p>
          </div>
        </div>

        {/* Live Timers Pill Bar */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${
              isDarkMode
                ? 'bg-slate-800/90 border-slate-700 text-indigo-400'
                : 'bg-indigo-50 border-indigo-200 text-indigo-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-[10px] text-slate-400 font-semibold">{t.totalPlayTime}:</span>
            <span className="font-mono text-xs sm:text-sm">{formatDuration(totalElapsedSeconds)}</span>
          </div>

          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${
              isDarkMode
                ? 'bg-slate-800/90 border-slate-700 text-emerald-400'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[10px] text-slate-400 font-semibold">{t.roundTime}:</span>
            <span className="font-mono text-xs sm:text-sm">{formatDuration(currentRoundSeconds)}</span>
          </div>
        </div>
      </div>

      {/* Live Current Round Move Sequence (if moves made in active round) */}
      {currentRoundMoves.length > 0 && (
        <div
          className={`mt-3 p-3 rounded-2xl border text-xs ${
            isDarkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-200/80'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold text-indigo-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              {t.moveSequenceLabel} ({currentRoundMoves.length})
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {currentRoundMoves.map((m, idx) => {
              const pos = formatCellPosition(m.cellIndex);
              const isLast = idx === currentRoundMoves.length - 1;
              return (
                <React.Fragment key={m.moveNumber}>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg font-mono text-[11px] font-semibold border ${
                      m.player === 'X'
                        ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    } ${isLast ? 'ring-1 ring-amber-400' : ''}`}
                  >
                    <span>#{m.moveNumber}</span>
                    <strong>{m.player}</strong>
                    <span className="opacity-75">
                      ({t.cellLabel} {m.cellIndex + 1} • {pos.label})
                    </span>
                  </span>
                  {!isLast && <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Rounds History List */}
      {roundHistory.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-400">
          {t.noRoundsYet}
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {roundHistory.map((item) => {
            const finalPos = item.finalMove ? formatCellPosition(item.finalMove.cellIndex) : null;
            return (
              <div
                key={item.round}
                className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-2.5 transition-all ${
                  isDarkMode
                    ? 'bg-slate-800/50 border-slate-700/80'
                    : 'bg-slate-50/90 border-slate-200'
                }`}
              >
                {/* Top Row: Round Badge, Winner, Duration + Mini 3x3 Board */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-lg bg-indigo-500/15 text-indigo-400 font-bold text-xs">
                        {t.round} {item.round}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-bold">
                        {item.winner === 'draw' ? (
                          <span className="text-amber-500 flex items-center gap-1">
                            <Handshake className="w-3.5 h-3.5" />
                            {t.ties}
                          </span>
                        ) : (
                          <span
                            className={`flex items-center gap-1 ${
                              item.winner === 'X' ? 'text-indigo-400' : 'text-rose-400'
                            }`}
                          >
                            <Trophy className="w-3.5 h-3.5 text-amber-500" />
                            {item.winnerName} ({item.winner})
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span>
                        {t.timeTakenLabel}:{' '}
                        <strong className="font-mono text-slate-200 dark:text-slate-200">
                          {formatDuration(item.durationSeconds)}
                        </strong>
                      </span>
                      <span>
                        {t.totalMovesLabel}: <strong>{item.moves.length}</strong>
                      </span>
                    </div>

                    {/* Final Move Highlight */}
                    {item.finalMove && finalPos && (
                      <div className="text-[11px] pt-0.5">
                        <span className="text-slate-400">{t.finalMoveLabel}: </span>
                        <span className="font-semibold text-amber-400">
                          {item.finalMove.playerName} ({item.finalMove.player}) → {t.cellLabel}{' '}
                          {item.finalMove.cellIndex + 1} ({finalPos.label}) @{' '}
                          {formatDuration(item.finalMove.elapsedSeconds)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Mini 3x3 Final Board Snapshot */}
                  <div className="grid grid-cols-3 gap-0.5 p-1 rounded-lg bg-slate-950/40 border border-slate-700/60 shrink-0">
                    {item.finalBoard.map((cell, cIdx) => {
                      const isWinCell = item.winLine?.includes(cIdx);
                      return (
                        <div
                          key={cIdx}
                          className={`w-4 h-4 rounded-[3px] flex items-center justify-center text-[9px] font-black ${
                            isWinCell
                              ? 'bg-amber-500/30 text-amber-300 ring-1 ring-amber-400'
                              : 'bg-slate-800/80'
                          } ${
                            cell === 'X'
                              ? 'text-indigo-400'
                              : cell === 'O'
                              ? 'text-rose-400'
                              : 'text-transparent'
                          }`}
                        >
                          {cell || '·'}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Move-by-Move Gameplay Trail */}
                <div className="pt-2 border-t border-slate-700/40 flex flex-wrap items-center gap-1">
                  {item.moves.map((mv, mIdx) => {
                    const isFinal = mIdx === item.moves.length - 1;
                    return (
                      <React.Fragment key={mv.moveNumber}>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                            isFinal
                              ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                              : mv.player === 'X'
                              ? 'bg-indigo-500/10 text-indigo-400'
                              : 'bg-rose-500/10 text-rose-400'
                          }`}
                        >
                          {mv.moveNumber}.{mv.player}({mv.cellIndex + 1})
                        </span>
                        {!isFinal && <span className="text-[9px] text-slate-500">→</span>}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
