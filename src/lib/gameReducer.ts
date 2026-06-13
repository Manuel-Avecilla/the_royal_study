import { 
  BoardState, 
  rotateBoard90, 
  mirrorBoardHorizontal, 
  mirrorBoardVertical, 
  getValidMoves,
  solvePuzzle,
  Square
} from './chessEngine';
import { levels, GLOBAL_INITIAL_BOARD } from './levels';

export type GamePhase = 'PREDICTING' | 'PLAYING' | 'WON' | 'LOST';

export interface GameState {
  phase: GamePhase;
  levelIndex: number;
  levelQueue: number[];            // Pending levels queue (shuffled indices)
  solvedCount: number;             // Total puzzles solved
  
  // Boards
  currentBoard: BoardState;        // Active board layout
  levelStartBoard: BoardState;     // Snapshot of board at level start for retying
  originalTargetBoard: BoardState; // Target board configuration before modifiers
  targetBoard: BoardState;         // Active target board with modifiers applied
  
  // Target card modifiers
  rotations: number;               // 0, 1, 2, or 3
  mirrorH: boolean;
  mirrorV: boolean;
  
  // Prediction values
  prediction: number;              // Committed move cost limit selected by the user
  
  // Game execution state
  movesCount: number;              // Physical moves made during PLAYING
  selectedSquare: number | null;   // Active selected square index
  validMoves: number[];            // Valid target squares highlighted
  
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
 * Fisher-Yates Shuffle algorithm to randomize level orders.
 */
export function shuffle(array: number[]): number[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Compares two BoardStates by piece types.
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
 * Applies active rotations and mirrors deterministically from original board.
 */
export function applyTransformations(
  board: BoardState,
  rotations: number,
  mirrorH: boolean,
  mirrorV: boolean
): BoardState {
  let temp = [...board];
  for (let i = 0; i < rotations; i++) {
    temp = rotateBoard90(temp);
  }
  if (mirrorH) {
    temp = mirrorBoardHorizontal(temp);
  }
  if (mirrorV) {
    temp = mirrorBoardVertical(temp);
  }
  return temp;
}

/**
 * Calculates modifier cost.
 * Rotations add 1 each. Horizontal mirror adds 1. Vertical mirror adds 1.
 */
export function getModifierCost(rotations: number, mirrorH: boolean, mirrorV: boolean): number {
  return rotations + (mirrorH ? 1 : 0) + (mirrorV ? 1 : 0);
}

/**
 * Initializes the game state. Shuffles level queue and sets currentBoard to GLOBAL_INITIAL_BOARD.
 */
export function getInitialState(levelIndex: number): GameState {
  const allIndices = Array.from({ length: levels.length }, (_, i) => i);
  const queue = shuffle(allIndices);
  
  const currentLvlIndex = queue[0];
  const remainingQueue = queue.slice(1);
  const targetLayout = levels[currentLvlIndex];

  return {
    phase: 'PREDICTING',
    levelIndex: currentLvlIndex,
    levelQueue: remainingQueue,
    solvedCount: 0,
    currentBoard: [...GLOBAL_INITIAL_BOARD],
    levelStartBoard: [...GLOBAL_INITIAL_BOARD],
    originalTargetBoard: [...targetLayout],
    targetBoard: [...targetLayout],
    rotations: 0,
    mirrorH: false,
    mirrorV: false,
    prediction: 1,
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
      
      const newModifierCost = getModifierCost(nextRotations, state.mirrorH, state.mirrorV);
      // Prediction cannot be lower than modifierCost + 1
      const nextPrediction = Math.max(state.prediction, newModifierCost + 1);

      return {
        ...state,
        rotations: nextRotations,
        targetBoard: transformedBoard,
        prediction: nextPrediction,
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

      const newModifierCost = getModifierCost(state.rotations, nextMirrorH, state.mirrorV);
      const nextPrediction = Math.max(state.prediction, newModifierCost + 1);

      return {
        ...state,
        mirrorH: nextMirrorH,
        targetBoard: transformedBoard,
        prediction: nextPrediction,
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

      const newModifierCost = getModifierCost(state.rotations, state.mirrorH, nextMirrorV);
      const nextPrediction = Math.max(state.prediction, newModifierCost + 1);

      return {
        ...state,
        mirrorV: nextMirrorV,
        targetBoard: transformedBoard,
        prediction: nextPrediction,
      };
    }

    case 'SET_BASE_PREDICTION': {
      if (state.phase !== 'PREDICTING') return state;
      const modifierCost = getModifierCost(state.rotations, state.mirrorH, state.mirrorV);
      // Force minimum limit: prediction >= modifierCost + 1
      const nextPrediction = Math.max(modifierCost + 1, action.count);
      return {
        ...state,
        prediction: nextPrediction,
      };
    }

    case 'START_PLAYING': {
      if (state.phase !== 'PREDICTING') return state;
      return {
        ...state,
        phase: 'PLAYING',
        levelStartBoard: [...state.currentBoard], // Lock starting state
        movesCount: 0,
        selectedSquare: null,
        validMoves: [],
        history: [[...state.currentBoard]], // Initialize history stack
      };
    }

    case 'SELECT_PIECE': {
      if (state.phase !== 'PLAYING') return state;
      const { index } = action;

      if (index === state.selectedSquare || index === null) {
        return { ...state, selectedSquare: null, validMoves: [] };
      }

      const piece = state.currentBoard[index];
      if (!piece) {
        return { ...state, selectedSquare: null, validMoves: [] };
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

      const nextBoard = [...currentBoard];
      nextBoard[toIndex] = nextBoard[selectedSquare];
      nextBoard[selectedSquare] = null;

      const nextMovesCount = movesCount + 1;
      const nextHistory = [...history, [...nextBoard]];

      // Math penalty: cost = physical moves + modifications
      const modifierCost = getModifierCost(state.rotations, state.mirrorH, state.mirrorV);
      const totalCost = nextMovesCount + modifierCost;

      const matchesTarget = isBoardMatching(nextBoard, state.targetBoard);
      let nextPhase: GamePhase = 'PLAYING';
      let nextSolvedCount = state.solvedCount;

      if (matchesTarget) {
        // Must be within prediction limit to win
        if (totalCost <= prediction) {
          nextPhase = 'WON';
          nextSolvedCount = state.solvedCount + 1;
        } else {
          nextPhase = 'LOST';
        }
      } else if (totalCost >= prediction) {
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
        solvedCount: nextSolvedCount,
      };
    }

    case 'UNDO_MOVE': {
      if (state.phase !== 'PLAYING' || state.history.length <= 1) return state;

      const nextHistory = [...state.history];
      nextHistory.pop(); 
      const previousBoard = nextHistory[nextHistory.length - 1];

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
      // Revert board configuration to the start of this level
      const resetBoard = [...state.levelStartBoard];
      
      return {
        ...state,
        phase: 'PREDICTING',
        currentBoard: resetBoard,
        targetBoard: [...state.originalTargetBoard],
        rotations: 0,
        mirrorH: false,
        mirrorV: false,
        prediction: 1,
        movesCount: 0,
        selectedSquare: null,
        validMoves: [],
        history: [],
      };
    }

    case 'NEXT_LEVEL': {
      // Transition to next randomized level target
      let nextQueue = [...state.levelQueue];
      
      // If queue is empty, reshuffle all levels
      if (nextQueue.length === 0) {
        const allIndices = Array.from({ length: levels.length }, (_, i) => i);
        nextQueue = shuffle(allIndices);
      }

      const nextLevelIndex = nextQueue[0];
      const remainingQueue = nextQueue.slice(1);
      const nextTargetLayout = levels[nextLevelIndex];

      return {
        ...state,
        phase: 'PREDICTING',
        levelIndex: nextLevelIndex,
        levelQueue: remainingQueue,
        // Board layout carries over dynamically, levelStartBoard matches current state
        levelStartBoard: [...state.currentBoard],
        originalTargetBoard: [...nextTargetLayout],
        targetBoard: [...nextTargetLayout],
        rotations: 0,
        mirrorH: false,
        mirrorV: false,
        prediction: 1,
        movesCount: 0,
        selectedSquare: null,
        validMoves: [],
        history: [],
      };
    }

    default:
      return state;
  }
}
