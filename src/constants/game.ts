import { GLOBAL_INITIAL_BOARD as LIB_GLOBAL_INITIAL_BOARD } from '../lib/levels';

export const MULTIPLAYER_TIMER_SECONDS = 15;
export const MULTIPLAYER_WINNING_SCORE = 6;
export const GLOBAL_INITIAL_BOARD = LIB_GLOBAL_INITIAL_BOARD;

// Sound assets paths
export const SOUNDS = {
  MOVE: '/assets/chess-piece-move.wav',
  WIN: '/assets/win.wav',
  LOSE: '/assets/lose.wav',
} as const;
