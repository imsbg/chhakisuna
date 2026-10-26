import test from 'node:test';
import assert from 'node:assert/strict';
import {
  checkWinner,
  checkDraw,
  generateRoomCode,
  isValidRoomCode,
  applyMove,
  createEmptyBoard,
  getBestBotMove,
} from './rules.ts';

test('generateRoomCode produces valid SBXXXX format', () => {
  for (let i = 0; i < 20; i++) {
    const code = generateRoomCode();
    assert.equal(code.startsWith('SB'), true, `Code ${code} should start with SB`);
    assert.equal(code.length, 6, `Code ${code} should be 6 characters long`);
    assert.equal(isValidRoomCode(code), true, `Code ${code} should be valid`);
  }
});

test('isValidRoomCode validates properly', () => {
  assert.equal(isValidRoomCode('SB4921'), true);
  assert.equal(isValidRoomCode('sb4921'), true); // case insensitive check
  assert.equal(isValidRoomCode('SBABCD'), true);
  assert.equal(isValidRoomCode('SB123'), false); // too short
  assert.equal(isValidRoomCode('SB12345'), false); // too long
  assert.equal(isValidRoomCode('XX1234'), false); // wrong prefix
  assert.equal(isValidRoomCode(''), false);
});

test('checkWinner detects row, column and diagonal wins', () => {
  // Row 0 win
  const rowBoard = ['X', 'X', 'X', null, 'O', null, 'O', null, null];
  const rowWin = checkWinner(rowBoard);
  assert.ok(rowWin);
  assert.equal(rowWin.winner, 'X');
  assert.deepEqual(rowWin.line, [0, 1, 2]);

  // Col 1 win
  const colBoard = ['X', 'O', null, 'X', 'O', null, null, 'O', 'X'];
  const colWin = checkWinner(colBoard);
  assert.ok(colWin);
  assert.equal(colWin.winner, 'O');
  assert.deepEqual(colWin.line, [1, 4, 7]);

  // Diagonal main win
  const diagBoard = ['X', 'O', null, null, 'X', 'O', null, null, 'X'];
  const diagWin = checkWinner(diagBoard);
  assert.ok(diagWin);
  assert.equal(diagWin.winner, 'X');
  assert.deepEqual(diagWin.line, [0, 4, 8]);
});

test('checkDraw detects full board without winner', () => {
  const drawBoard = [
    'X', 'O', 'X',
    'X', 'O', 'O',
    'O', 'X', 'X'
  ];
  assert.equal(checkWinner(drawBoard), null);
  assert.equal(checkDraw(drawBoard, null), true);

  const incompleteBoard = [
    'X', 'O', 'X',
    'X', null, 'O',
    'O', 'X', 'X'
  ];
  assert.equal(checkDraw(incompleteBoard, null), false);
});

test('applyMove handles alternating turns and validates moves', () => {
  let board = createEmptyBoard();
  let status: 'playing' | 'won' | 'draw' = 'playing';
  let turn: 'X' | 'O' = 'X';

  // Move 1 by X
  const m1 = applyMove(board, 0, 'X', turn, status);
  assert.ok(m1);
  board = m1.nextBoard;
  turn = m1.nextTurn;
  assert.equal(board[0], 'X');
  assert.equal(turn, 'O');

  // Move 2: invalid player trying to move
  const invalidPlayer = applyMove(board, 1, 'X', turn, status);
  assert.equal(invalidPlayer, null);

  // Move 2: invalid occupied cell
  const invalidCell = applyMove(board, 0, 'O', turn, status);
  assert.equal(invalidCell, null);

  // Move 2: valid by O
  const m2 = applyMove(board, 4, 'O', turn, status);
  assert.ok(m2);
  board = m2.nextBoard;
  turn = m2.nextTurn;
  assert.equal(board[4], 'O');
  assert.equal(turn, 'X');
});

test('getBestBotMove takes winning move or blocks opponent', () => {
  // Scenario 1: Bot ('O') can win directly at index 2
  const winningBoard = [
    'O', 'O', null,
    'X', 'X', null,
    null, null, null
  ];
  const winMove = { ...winningBoard };
  assert.equal(checkWinner(winningBoard), null);
  // Bot should prioritize winning at index 2
  assert.equal(getBestBotMove(winningBoard, 'O'), 2);

  // Scenario 2: Opponent ('X') has two in row 1 ([3, 4]), Bot ('O') must block at index 5
  const blockBoard = [
    'O', null, null,
    'X', 'X', null,
    null, null, null
  ];
  assert.equal(getBestBotMove(blockBoard, 'O'), 5);

  // Scenario 3: Fork defense - Opponent ('X') took opposite corners (0 and 8), Bot ('O') has center (4)
  // Bot must play an edge (1, 3, 5, or 7) to force human to defend, avoiding giving human a double fork!
  const forkBoard = [
    'X', null, null,
    null, 'O', null,
    null, null, 'X'
  ];
  const botDefenseMove = getBestBotMove(forkBoard, 'O');
  assert.ok([1, 3, 5, 7].includes(botDefenseMove), `Bot should pick an edge (1,3,5,7) to counter corner fork, got ${botDefenseMove}`);
});

import { detectLanguageFromUrl, getPathWithLang, buildUrlWithLang } from '../utils/urlLang.ts';

test('detectLanguageFromUrl and getPathWithLang handle /en and /odia URLs accurately', () => {
  assert.equal(detectLanguageFromUrl('/en'), 'en');
  assert.equal(detectLanguageFromUrl('/en/'), 'en');
  assert.equal(detectLanguageFromUrl('/odia'), 'or');
  assert.equal(detectLanguageFromUrl('/odia/'), 'or');
  assert.equal(detectLanguageFromUrl('/webrtc-tictactoe/en'), 'en');
  assert.equal(detectLanguageFromUrl('/webrtc-tictactoe/odia'), 'or');
  assert.equal(detectLanguageFromUrl('/'), null);

  assert.equal(getPathWithLang('/', 'or'), '/odia');
  assert.equal(getPathWithLang('/', 'en'), '/en');
  assert.equal(getPathWithLang('/odia', 'en'), '/en');
  assert.equal(getPathWithLang('/en', 'or'), '/odia');
  assert.equal(getPathWithLang('/webrtc-tictactoe/', 'or'), '/webrtc-tictactoe/odia');
  assert.equal(getPathWithLang('/webrtc-tictactoe/odia', 'en'), '/webrtc-tictactoe/en');

  assert.equal(buildUrlWithLang('/odia', '?room=SB7A9K', '', 'en'), '/en?room=SB7A9K');
  assert.equal(buildUrlWithLang('/en', '?room=SB7A9K', '', 'or'), '/odia?room=SB7A9K');
});


