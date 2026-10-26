import React from 'react';
import { BoardState, WinInfo } from '../game/rules';
import { sounds } from '../utils/sound';

interface GameBoardProps {
  board: BoardState;
  winInfo: WinInfo | null;
  currentTurn: 'X' | 'O';
  myMark: 'X' | 'O' | null;
  isMyTurn: boolean;
  canMove: boolean;
  onCellClick: (index: number) => void;
  isDarkMode: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  board,
  winInfo,
  currentTurn,
  myMark,
  isMyTurn,
  canMove,
  onCellClick,
  isDarkMode,
}) => {
  const handleCellClick = (index: number) => {
    if (!canMove || board[index] !== null) return;
    sounds.playMove(currentTurn);
    onCellClick(index);
  };

  // Winning Line SVG coordinates
  const getWinningLineCoordinates = () => {
    if (!winInfo) return null;
    switch (winInfo.direction) {
      case 'row-0':
        return { x1: '8%', y1: '16.6%', x2: '92%', y2: '16.6%' };
      case 'row-1':
        return { x1: '8%', y1: '50%', x2: '92%', y2: '50%' };
      case 'row-2':
        return { x1: '8%', y1: '83.3%', x2: '92%', y2: '83.3%' };
      case 'col-0':
        return { x1: '16.6%', y1: '8%', x2: '16.6%', y2: '92%' };
      case 'col-1':
        return { x1: '50%', y1: '8%', x2: '50%', y2: '92%' };
      case 'col-2':
        return { x1: '83.3%', y1: '8%', x2: '83.3%', y2: '92%' };
      case 'diag-main':
        return { x1: '12%', y1: '12%', x2: '88%', y2: '88%' };
      case 'diag-anti':
        return { x1: '88%', y1: '12%', x2: '12%', y2: '88%' };
      default:
        return null;
    }
  };

  const lineCoords = getWinningLineCoordinates();

  return (
    <div className="relative w-full max-w-[380px] sm:max-w-[420px] aspect-square mx-auto select-none">
      {/* Outer ambient decorative frame */}
      <div 
        className={`w-full h-full p-3 sm:p-4 rounded-3xl border shadow-2xl transition-colors duration-300 grid grid-cols-3 grid-rows-3 gap-2.5 sm:gap-3 relative ${
          isDarkMode
            ? 'bg-slate-900/80 border-slate-800 shadow-indigo-950/40 backdrop-blur-xl'
            : 'bg-white/80 border-slate-200/90 shadow-slate-300/60 backdrop-blur-xl'
        }`}
      >
        {board.map((cellValue, index) => {
          const isWinningCell = winInfo?.line.includes(index);
          const isInteractive = canMove && cellValue === null;

          return (
            <button
              key={index}
              onClick={() => handleCellClick(index)}
              disabled={!isInteractive}
              aria-label={`Board cell ${index + 1}, ${cellValue ? cellValue : 'empty'}`}
              className={`relative rounded-2xl flex items-center justify-center transition-all duration-200 group overflow-hidden border ${
                isWinningCell
                  ? 'bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 border-indigo-400 ring-2 ring-indigo-400/50 shadow-lg scale-[1.02]'
                  : isDarkMode
                  ? 'bg-slate-800/60 border-slate-700/60 hover:border-slate-600 hover:bg-slate-800'
                  : 'bg-slate-50/80 border-slate-200 hover:border-slate-300 hover:bg-slate-100/90'
              } ${
                isInteractive
                  ? 'cursor-pointer active:scale-95 shadow-sm'
                  : 'cursor-default'
              }`}
            >
              {/* Value X */}
              {cellValue === 'X' && (
                <svg
                  viewBox="0 0 64 64"
                  className="w-12 h-12 sm:w-16 sm:h-16 stroke-indigo-500 animate-pop-in drop-shadow-[0_4px_12px_rgba(99,102,241,0.4)]"
                  fill="none"
                  strokeWidth="8"
                  strokeLinecap="round"
                >
                  <line x1="14" y1="14" x2="50" y2="50" />
                  <line x1="50" y1="14" x2="14" y2="50" />
                </svg>
              )}

              {/* Value O */}
              {cellValue === 'O' && (
                <svg
                  viewBox="0 0 64 64"
                  className="w-12 h-12 sm:w-16 sm:h-16 stroke-rose-500 animate-pop-in drop-shadow-[0_4px_12px_rgba(244,63,94,0.4)]"
                  fill="none"
                  strokeWidth="7"
                >
                  <circle cx="32" cy="32" r="21" />
                </svg>
              )}

              {/* Hover Ghost Mark when user hovers during their turn */}
              {isInteractive && !cellValue && myMark && (
                <div className="opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none transform scale-90 group-hover:scale-100">
                  {myMark === 'X' ? (
                    <svg viewBox="0 0 64 64" className="w-10 h-10 sm:w-12 sm:h-12 stroke-indigo-500" fill="none" strokeWidth="6" strokeLinecap="round">
                      <line x1="16" y1="16" x2="48" y2="48" />
                      <line x1="48" y1="16" x2="16" y2="48" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 64 64" className="w-10 h-10 sm:w-12 sm:h-12 stroke-rose-500" fill="none" strokeWidth="6">
                      <circle cx="32" cy="32" r="18" />
                    </svg>
                  )}
                </div>
              )}
            </button>
          );
        })}

        {/* SVG Strike-through line */}
        {lineCoords && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            <line
              x1={lineCoords.x1}
              y1={lineCoords.y1}
              x2={lineCoords.x2}
              y2={lineCoords.y2}
              stroke="url(#winGradient)"
              strokeWidth="6"
              strokeLinecap="round"
              className="drop-shadow-[0_0_12px_rgba(129,140,248,0.9)] animate-pop-in"
            />
            <defs>
              <linearGradient id="winGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="50%" stopColor="#EC4899" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
            </defs>
          </svg>
        )}
      </div>
    </div>
  );
};
