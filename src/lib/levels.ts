import { BoardState, Square } from './chessEngine';
import rawLevels from './levels.json';

export interface Level {
  id: number;
  name: string;
  difficulty: 'Fácil' | 'Medio' | 'Difícil';
  initialBoard: BoardState;
  targetBoard: BoardState;
  minMoves: number;
}

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

export const levels: Level[] = rawLevels.map((lvl) => ({
  id: lvl.id,
  name: lvl.name,
  difficulty: lvl.difficulty as 'Fácil' | 'Medio' | 'Difícil',
  initialBoard: parseBoard(lvl.initialBoard, 'w'),
  targetBoard: parseBoard(lvl.targetBoard, 'w'),
  minMoves: lvl.minMoves,
}));
