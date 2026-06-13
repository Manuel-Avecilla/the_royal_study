/**
 * The Royal Study - Chess Engine
 * Pure logic and math for 3x3 chess puzzles.
 */

// --- Types ---

import { PieceType, PieceColor, Piece, Square, BoardState, Coords } from '../types';

// --- Coordinate Conversions ---

/**
 * Converts a 1D index (0 to 8) to 2D coordinates {row, col}.
 * @throws Error if the index is out of bounds [0..8].
 */
export function indexToCoords(index: number): Coords {
  if (index < 0 || index > 8) {
    throw new Error(`Invalid board index: ${index}. Must be between 0 and 8.`);
  }
  return {
    row: Math.floor(index / 3),
    col: index % 3,
  };
}

/**
 * Converts 2D coordinates {row, col} to a 1D index (0 to 8).
 * Returns -1 if the coordinates are out of bounds.
 */
export function coordsToIndex(row: number, col: number): number {
  if (row < 0 || row > 2 || col < 0 || col > 2) {
    return -1;
  }
  return row * 3 + col;
}

/**
 * Helper to check if a coordinate is within the 3x3 board bounds.
 */
export function isValidCoord(row: number, col: number): boolean {
  return row >= 0 && row < 3 && col >= 0 && col < 3;
}

// --- Path Blocking & Collisions ---

/**
 * Evaluates whether the path between fromIndex and toIndex is clear of other pieces.
 * Applies to sliding pieces (Rook, Bishop, Queen).
 * Assumes the move itself is straight or diagonal.
 */
export function isPathClear(fromIndex: number, toIndex: number, board: BoardState): boolean {
  const start = indexToCoords(fromIndex);
  const end = indexToCoords(toIndex);

  const dRow = end.row - start.row;
  const dCol = end.col - start.col;

  // If destination is adjacent or the same, there are no intermediate squares to block.
  if (Math.abs(dRow) <= 1 && Math.abs(dCol) <= 1) {
    return true;
  }

  const stepRow = Math.sign(dRow);
  const stepCol = Math.sign(dCol);

  let currRow = start.row + stepRow;
  let currCol = start.col + stepCol;

  // Traverse intermediate squares up to, but not including, the destination.
  while (currRow !== end.row || currCol !== end.col) {
    const idx = coordsToIndex(currRow, currCol);
    if (board[idx] !== null) {
      return false; // Path is blocked by an ally piece.
    }
    currRow += stepRow;
    currCol += stepCol;
  }

  return true;
}

// --- Valid Move Generation ---

/**
 * Calculates all valid move target indices (0-8) for a piece at fromIndex.
 * 
 * Rules:
 * 1. Piece cannot capture allies (all pieces on the board are allies).
 *    Therefore, destination must be an empty square (null).
 * 2. Standard chess move boundaries apply.
 * 3. Rook, Bishop, and Queen movements are blocked by intermediate pieces.
 * 4. Knight (Caballo) ignores intermediate pieces.
 */
export function getValidMoves(fromIndex: number, board: BoardState): number[] {
  const piece = board[fromIndex];
  if (!piece) {
    return [];
  }

  const start = indexToCoords(fromIndex);
  const validMoves: number[] = [];

  for (let toIndex = 0; toIndex < 9; toIndex++) {
    // Cannot move to the exact same square.
    if (toIndex === fromIndex) {
      continue;
    }

    // Destination must be empty (capturing allies is forbidden).
    if (board[toIndex] !== null) {
      continue;
    }

    const end = indexToCoords(toIndex);
    const dRow = end.row - start.row;
    const dCol = end.col - start.col;
    const absDRow = Math.abs(dRow);
    const absDCol = Math.abs(dCol);

    let isMovePatternValid = false;
    let needsPathCheck = false;

    switch (piece.type) {
      case 'K': // King (Rey)
        // Moves exactly 1 square in any direction.
        isMovePatternValid = absDRow <= 1 && absDCol <= 1;
        break;

      case 'N': // Knight (Caballo)
        // Moves in L-shape (2 in one axis, 1 in the other). Jumps over pieces.
        isMovePatternValid = (absDRow === 1 && absDCol === 2) || (absDRow === 2 && absDCol === 1);
        break;

      case 'R': // Rook (Torre)
        // Moves horizontally or vertically.
        isMovePatternValid = dRow === 0 || dCol === 0;
        needsPathCheck = true;
        break;

      case 'B': // Bishop (Alfil)
        // Moves diagonally.
        isMovePatternValid = absDRow === absDCol;
        needsPathCheck = true;
        break;

      case 'Q': // Queen (Dama)
        // Moves horizontally, vertically, or diagonally.
        isMovePatternValid = (dRow === 0 || dCol === 0) || (absDRow === absDCol);
        needsPathCheck = true;
        break;
    }

    if (isMovePatternValid) {
      if (needsPathCheck) {
        if (isPathClear(fromIndex, toIndex, board)) {
          validMoves.push(toIndex);
        }
      } else {
        validMoves.push(toIndex);
      }
    }
  }

  return validMoves;
}

// --- Target Card Transformations ---

/**
 * Rotates a 3x3 board representation 90 degrees clockwise.
 * Coordinate mapping: (row, col) -> (col, 2 - row)
 */
export function rotateBoard90(board: BoardState): BoardState {
  const newBoard: BoardState = new Array(9).fill(null);
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const oldIndex = r * 3 + c;
      const newIndex = c * 3 + (2 - r);
      newBoard[newIndex] = board[oldIndex];
    }
  }
  return newBoard;
}

/**
 * Mirrors a 3x3 board representation horizontally.
 * Column mapping: col -> 2 - col
 */
export function mirrorBoardHorizontal(board: BoardState): BoardState {
  const newBoard: BoardState = new Array(9).fill(null);
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const oldIndex = r * 3 + c;
      const newIndex = r * 3 + (2 - c);
      newBoard[newIndex] = board[oldIndex];
    }
  }
  return newBoard;
}

/**
 * Mirrors a 3x3 board representation vertically.
 * Row mapping: row -> 2 - row
 */
export function mirrorBoardVertical(board: BoardState): BoardState {
  const newBoard: BoardState = new Array(9).fill(null);
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const oldIndex = r * 3 + c;
      const newIndex = (2 - r) * 3 + c;
      newBoard[newIndex] = board[oldIndex];
    }
  }
  return newBoard;
}

/**
 * Finds the minimum number of moves to transition from startBoard to targetBoard.
 * If unreachable, returns a sensible default (e.g., 6).
 */
export function solvePuzzle(startBoard: BoardState, targetBoard: BoardState): number {
  function serializeBoard(b: BoardState): string {
    return b.map(s => s ? s.type : '.').join('');
  }

  function isMatching(b1: BoardState, b2: BoardState): boolean {
    return b1.every((square, i) => {
      const targetSquare = b2[i];
      if (square === null && targetSquare === null) return true;
      if (square !== null && targetSquare !== null) {
        return square.type === targetSquare.type;
      }
      return false;
    });
  }

  const startKey = serializeBoard(startBoard);
  const targetKey = serializeBoard(targetBoard);

  if (startKey === targetKey) return 0;

  const queue: { board: BoardState; depth: number }[] = [];
  const visited = new Set<string>();

  queue.push({ board: startBoard, depth: 0 });
  visited.add(startKey);

  let iterations = 0;
  // Limit iterations to prevent any infinite loops (safety ceiling)
  while (queue.length > 0 && iterations < 10000) {
    iterations++;
    const current = queue.shift()!;

    if (isMatching(current.board, targetBoard)) {
      return current.depth;
    }

    // Generate neighbors
    for (let fromIdx = 0; fromIdx < 9; fromIdx++) {
      const piece = current.board[fromIdx];
      if (!piece) continue;

      const validDestinations = getValidMoves(fromIdx, current.board);
      for (const toIdx of validDestinations) {
        const nextBoard = [...current.board];
        nextBoard[toIdx] = nextBoard[fromIdx];
        nextBoard[fromIdx] = null;

        const nextKey = serializeBoard(nextBoard);
        if (!visited.has(nextKey)) {
          visited.add(nextKey);
          queue.push({ board: nextBoard, depth: current.depth + 1 });
        }
      }
    }
  }

  return 6; // Fallback if unreachable
}
