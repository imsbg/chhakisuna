/**
 * Pure Game Rules and Logic for Tic Tac Toe & Room Management
 */

export type CellValue = 'X' | 'O' | null;
export type BoardState = CellValue[];
export type GameStatus = 'playing' | 'won' | 'draw';

export interface WinInfo {
  winner: 'X' | 'O';
  line: [number, number, number];
  direction: 'row-0' | 'row-1' | 'row-2' | 'col-0' | 'col-1' | 'col-2' | 'diag-main' | 'diag-anti';
}

export const WINNING_COMBINATIONS: Array<{
  line: [number, number, number];
  direction: WinInfo['direction'];
}> = [
  // Rows
  { line: [0, 1, 2], direction: 'row-0' },
  { line: [3, 4, 5], direction: 'row-1' },
  { line: [6, 7, 8], direction: 'row-2' },
  // Columns
  { line: [0, 3, 6], direction: 'col-0' },
  { line: [1, 4, 7], direction: 'col-1' },
  { line: [2, 5, 8], direction: 'col-2' },
  // Diagonals
  { line: [0, 4, 8], direction: 'diag-main' },
  { line: [2, 4, 6], direction: 'diag-anti' },
];

/**
 * Checks if there's a winner on the 3x3 board
 */
export function checkWinner(board: BoardState): WinInfo | null {
  for (const combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo.line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return {
        winner: board[a] as 'X' | 'O',
        line: combo.line,
        direction: combo.direction,
      };
    }
  }
  return null;
}

/**
 * Checks if the game is a draw
 */
export function checkDraw(board: BoardState, winner: WinInfo | null): boolean {
  if (winner) return false;
  return board.every((cell) => cell !== null);
}

/**
 * Generates an SBXXXX room code (e.g. SB7A9K)
 * Format: SB prefix followed by 4 uppercase alphanumeric characters
 */
export function generateRoomCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // exclude 0, 1, I, O to avoid visual confusion
  let suffix = '';
  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    suffix += chars[randomIndex];
  }
  return `SB${suffix}`;
}

/**
 * Validates room code format (SBXXXX - case insensitive)
 */
export function isValidRoomCode(code: string): boolean {
  if (!code) return false;
  const clean = code.trim().toUpperCase();
  return /^SB[A-Z0-9]{4}$/.test(clean);
}

/**
 * Normalizes room code to uppercase SBXXXX
 */
export function normalizeRoomCode(code: string): string {
  return code.trim().toUpperCase();
}

/**
 * Creates an empty 3x3 board
 */
export function createEmptyBoard(): BoardState {
  return Array(9).fill(null);
}

/**
 * Applies a move to the board if valid
 */
export function applyMove(
  board: BoardState,
  index: number,
  player: 'X' | 'O',
  currentTurn: 'X' | 'O',
  status: GameStatus
): { nextBoard: BoardState; nextTurn: 'X' | 'O'; winInfo: WinInfo | null; newStatus: GameStatus } | null {
  if (index < 0 || index >= 9) return null;
  if (board[index] !== null) return null;
  if (status !== 'playing') return null;
  if (player !== currentTurn) return null;

  const nextBoard = [...board];
  nextBoard[index] = player;

  const winInfo = checkWinner(nextBoard);
  if (winInfo) {
    return {
      nextBoard,
      nextTurn: currentTurn,
      winInfo,
      newStatus: 'won',
    };
  }

  const isDraw = checkDraw(nextBoard, null);
  if (isDraw) {
    return {
      nextBoard,
      nextTurn: currentTurn,
      winInfo: null,
      newStatus: 'draw',
    };
  }

  return {
    nextBoard,
    nextTurn: currentTurn === 'X' ? 'O' : 'X',
    winInfo: null,
    newStatus: 'playing',
  };
}

/**
 * Recursive Minimax Evaluation for Unbeatable AI
 * Guarantees optimal move: Bot will win if human makes an error, or force a draw.
 */
function minimax(
  board: BoardState,
  depth: number,
  isMaximizing: boolean,
  botPlayer: 'X' | 'O',
  humanPlayer: 'X' | 'O'
): number {
  const winInfo = checkWinner(board);
  if (winInfo) {
    return winInfo.winner === botPlayer ? 10 - depth : depth - 10;
  }

  if (checkDraw(board, null)) {
    return 0;
  }

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = botPlayer;
        const evaluation = minimax(board, depth + 1, false, botPlayer, humanPlayer);
        board[i] = null;
        if (evaluation > maxEval) maxEval = evaluation;
      }
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = humanPlayer;
        const evaluation = minimax(board, depth + 1, true, botPlayer, humanPlayer);
        board[i] = null;
        if (evaluation < minEval) minEval = evaluation;
      }
    }
    return minEval;
  }
}

export interface MoveRecord {
  moveNumber: number;
  player: 'X' | 'O';
  playerName: string;
  cellIndex: number;
  elapsedSeconds: number;
}

export interface RoundRecord {
  round: number;
  winner: 'X' | 'O' | 'draw';
  winnerName: string;
  durationSeconds: number;
  moves: MoveRecord[];
  finalMove: MoveRecord | null;
  finalBoard: BoardState;
  winLine: [number, number, number] | null;
  completedAt: number;
}

/**
 * Formats seconds into MM:SS
 */
export function formatDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Formats a 0..8 board cell index into human-readable Row/Col (1-indexed)
 */
export function formatCellPosition(cellIndex: number): { row: number; col: number; label: string } {
  const row = Math.floor(cellIndex / 3) + 1;
  const col = (cellIndex % 3) + 1;
  return { row, col, label: `R${row}C${col}` };
}

/**
 * Calculates unbeatable move for Bot / AI using Minimax
 */
export function getBestBotMove(board: BoardState, botPlayer: 'X' | 'O'): number {
  const humanPlayer: 'X' | 'O' = botPlayer === 'X' ? 'O' : 'X';
  const availableMoves: number[] = [];
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) availableMoves.push(i);
  }

  if (availableMoves.length === 0) return -1;

  // Opening move optimization: if center is open, take it; else corner
  if (availableMoves.length === 9) {
    return 4; // center
  }
  if (availableMoves.length === 8 && board[4] === null) {
    return 4;
  }

  let bestMove = availableMoves[0];
  let bestScore = -Infinity;

  const tempBoard = [...board];
  for (const move of availableMoves) {
    tempBoard[move] = botPlayer;
    const score = minimax(tempBoard, 0, false, botPlayer, humanPlayer);
    tempBoard[move] = null;

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}
