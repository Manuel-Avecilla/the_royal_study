import { BoardState } from '../types';
import rawLevels from './levels.json';

/**
 * Parses a row-separated chess board string into a BoardState.
 * Removes whitespace and row slashes.
 * Example: "K . . / . Q . / R B N" -> ["K", null, null, null, "Q", null, "R", "B", "N"]
 */
export function parseBoard(str: string, color: 'w' | 'b'): BoardState {
  const chars = str.replace(/[\s/]+/g, '').split('');
  if (chars.length !== 9) {
    throw new Error(`Invalid board string length: ${chars.length}. Must be exactly 9 squares.`);
  }
  return chars.map(char => {
    if (char === '.') return null;
    if (!['K', 'Q', 'R', 'B', 'N'].includes(char)) {
      throw new Error(`Invalid piece type character: ${char}`);
    }
    return { type: char as any, color };
  });
}

/**
 * Default global starting board layout (valid under Bishop parity and Knight center restrictions).
 * Pieces: R(0), N(2), K(4), B(6), Q(7).
 */
export const GLOBAL_INITIAL_BOARD: BoardState = parseBoard("R . N / . K . / B Q .", "w");

export const levels: BoardState[] = rawLevels.map((boardString) => parseBoard(boardString, 'w'));
