import { 
  BoardState, 
  rotateBoard90, 
  mirrorBoardHorizontal, 
  mirrorBoardVertical, 
  getValidMoves,
  Square
} from './chessEngine';
import { Level, levels } from './levels';

export type GamePhase = 'PREDICTING' | 'PLAYING' | 'WON' | 'LOST';

export interface GameState {
  phase: GamePhase;
  levelIndex: number;
  
  // Boards
  currentBoard: BoardState;
  originalTargetBoard: BoardState; // Reference to original board from level data
  targetBoard: BoardState;         // Active board target with transformations applied
  
  // Target card modifiers
  rotations: number;               // Number of clockwise 90deg rotations (0, 1, 2, or 3)
  mirrorH: boolean;                // Is mirrored horizontally
  mirrorV: boolean;                // Is mirrored vertically
  
  // Prediction system
  basePrediction: number;          // Moves predicted for the unmodified level
  prediction: number;              // Total moves limit = basePrediction + cost of modifiers
  
  // Game execution state
  movesCount: number;              // Moves made so far in PLAYING phase
  selectedSquare: number | null;   // Selected piece index for click-to-move
  validMoves: number[];            // Valid target indices for the selected piece
  
  // History stack for Undo
  history: BoardState[];
}

export type GameAction =
  | { type: 'LOAD_LEVEL'; levelIndex: number }
  | { type: 'ROTATE_TARGET' }
  | { type: 'TOGGLE_MIRROR_HORIZONTAL' }
  | { type: 'TOGGLE_MIRROR_VERTICAL' }
  | { type: 'SET_BASE_PREDICTION'; count: number }
  | { type: 'START_PLAYING' }
  | { type: 'SELECT_PIECE'; index: number | null }
  | { type: 'MOVE_PIECE'; toIndex: number }
  | { type: 'UNDO_MOVE' }
  | { type: 'RESTART_LEVEL' }
  | { type: 'NEXT_LEVEL' };

/**
 * Compares two BoardStates by checking if the piece types match on all squares.
 * We ignore color differences for win conditions since all active pieces are allies.
 */
export function isBoardMatching(b1: BoardState, b2: BoardState): boolean {
  return b1.every((square, i) => {
    const targetSquare = b2[i];
    if (square === null && targetSquare === null) return true;
    if (square !== null && targetSquare !== null) {
      return square.type === targetSquare.type;
    }
    return false;
  });
}

/**
 * Helper to apply rotations and mirrors deterministically from the base board configuration.
 */
export function applyTransformations(
  board: BoardState,
  rotations: number,
  mirrorH: boolean,
  mirrorV: boolean
): BoardState {
  let temp = [...board];
  
  // 1. Apply active rotations
  for (let i = 0; i < rotations; i++) {
    temp = rotateBoard90(temp);
  }
  
  // 2. Apply horizontal flip
  if (mirrorH) {
    temp = mirrorBoardHorizontal(temp);
  }
  
  // 3. Apply vertical flip
  if (mirrorV) {
    temp = mirrorBoardVertical(temp);
  }
  
  return temp;
}

/**
 * Calculates the total prediction value based on base prediction and active modifiers.
 * Each rotation adds +1. Horizontal mirror adds +1. Vertical mirror adds +1.
 */
export function calculateTotalPrediction(
  base: number,
  rotations: number,
  mirrorH: boolean,
  mirrorV: boolean
): number {
  const modifierCost = rotations + (mirrorH ? 1 : 0) + (mirrorV ? 1 : 0);
  return base + modifierCost;
}

/**
 * Generates the default initial state for a given level index.
 */
export function getInitialState(levelIndex: number): GameState {
  const level = levels[levelIndex] || levels[0];
  return {
    phase: 'PREDICTING',
    levelIndex,
    currentBoard: [...level.initialBoard],
    originalTargetBoard: [...level.targetBoard],
    targetBoard: [...level.targetBoard],
    rotations: 0,
    mirrorH: false,
    mirrorV: false,
    basePrediction: level.minMoves,
    prediction: level.minMoves,
    movesCount: 0,
    selectedSquare: null,
    validMoves: [],
    history: [],
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'LOAD_LEVEL': {
      return getInitialState(action.levelIndex);
    }

    case 'ROTATE_TARGET': {
      if (state.phase !== 'PREDICTING') return state;
      const nextRotations = (state.rotations + 1) % 4;
      const transformedBoard = applyTransformations(
        state.originalTargetBoard,
        nextRotations,
        state.mirrorH,
        state.mirrorV
      );
      return {
        ...state,
        rotations: nextRotations,
        targetBoard: transformedBoard,
        prediction: calculateTotalPrediction(state.basePrediction, nextRotations, state.mirrorH, state.mirrorV),
      };
    }

    case 'TOGGLE_MIRROR_HORIZONTAL': {
      if (state.phase !== 'PREDICTING') return state;
      const nextMirrorH = !state.mirrorH;
      const transformedBoard = applyTransformations(
        state.originalTargetBoard,
        state.rotations,
        nextMirrorH,
        state.mirrorV
      );
      return {
        ...state,
        mirrorH: nextMirrorH,
        targetBoard: transformedBoard,
        prediction: calculateTotalPrediction(state.basePrediction, state.rotations, nextMirrorH, state.mirrorV),
      };
    }

    case 'TOGGLE_MIRROR_VERTICAL': {
      if (state.phase !== 'PREDICTING') return state;
      const nextMirrorV = !state.mirrorV;
      const transformedBoard = applyTransformations(
        state.originalTargetBoard,
        state.rotations,
        state.mirrorH,
        nextMirrorV
      );
      return {
        ...state,
        mirrorV: nextMirrorV,
        targetBoard: transformedBoard,
        prediction: calculateTotalPrediction(state.basePrediction, state.rotations, state.mirrorH, nextMirrorV),
      };
    }

    case 'SET_BASE_PREDICTION': {
      if (state.phase !== 'PREDICTING') return state;
      const nextBase = Math.max(1, action.count);
      return {
        ...state,
        basePrediction: nextBase,
        prediction: calculateTotalPrediction(nextBase, state.rotations, state.mirrorH, state.mirrorV),
      };
    }

    case 'START_PLAYING': {
      if (state.phase !== 'PREDICTING') return state;
      return {
        ...state,
        phase: 'PLAYING',
        movesCount: 0,
        selectedSquare: null,
        validMoves: [],
        history: [[...state.currentBoard]], // Store initial board in history
      };
    }

    case 'SELECT_PIECE': {
      if (state.phase !== 'PLAYING') return state;
      
      const { index } = action;
      // If clicking same selected piece, deselect it
      if (index === state.selectedSquare || index === null) {
        return {
          ...state,
          selectedSquare: null,
          validMoves: [],
        };
      }

      // Check if clicked cell contains a piece (we only move player pieces)
      const piece = state.currentBoard[index];
      if (!piece) {
        return {
          ...state,
          selectedSquare: null,
          validMoves: [],
        };
      }

      return {
        ...state,
        selectedSquare: index,
        validMoves: getValidMoves(index, state.currentBoard),
      };
    }

    case 'MOVE_PIECE': {
      if (state.phase !== 'PLAYING') return state;
      const { toIndex } = action;
      const { selectedSquare, validMoves, currentBoard, history, movesCount, prediction } = state;

      if (selectedSquare === null || !validMoves.includes(toIndex)) {
        return state;
      }

      // 1. Create next board configuration
      const nextBoard = [...currentBoard];
      nextBoard[toIndex] = nextBoard[selectedSquare];
      nextBoard[selectedSquare] = null;

      // 2. Increment moves count
      const nextMovesCount = movesCount + 1;

      // 3. Save snapshot to history stack
      const nextHistory = [...history, [...nextBoard]];

      // 4. Verify win or loss conditions
      const matchesTarget = isBoardMatching(nextBoard, state.targetBoard);
      let nextPhase: GamePhase = 'PLAYING';

      if (matchesTarget) {
        nextPhase = 'WON';
      } else if (nextMovesCount >= prediction) {
        nextPhase = 'LOST';
      }

      return {
        ...state,
        currentBoard: nextBoard,
        movesCount: nextMovesCount,
        selectedSquare: null,
        validMoves: [],
        history: nextHistory,
        phase: nextPhase,
      };
    }

    case 'UNDO_MOVE': {
      if (state.phase !== 'PLAYING' || state.history.length <= 1) return state;

      // The last element in history is the current board, so we need to pop it
      const nextHistory = [...state.history];
      nextHistory.pop(); // Remove current board
      const previousBoard = nextHistory[nextHistory.length - 1]; // Get previous board state

      return {
        ...state,
        currentBoard: [...previousBoard],
        movesCount: Math.max(0, state.movesCount - 1),
        selectedSquare: null,
        validMoves: [],
        history: nextHistory,
      };
    }

    case 'RESTART_LEVEL': {
      const level = levels[state.levelIndex] || levels[0];
      return {
        ...state,
        phase: 'PREDICTING',
        currentBoard: [...level.initialBoard],
        targetBoard: applyTransformations(
          state.originalTargetBoard,
          state.rotations,
          state.mirrorH,
          state.mirrorV
        ),
        movesCount: 0,
        selectedSquare: null,
        validMoves: [],
        history: [],
      };
    }

    case 'NEXT_LEVEL': {
      const nextLevelIndex = (state.levelIndex + 1) % levels.length;
      return getInitialState(nextLevelIndex);
    }

    default:
      return state;
  }
}
