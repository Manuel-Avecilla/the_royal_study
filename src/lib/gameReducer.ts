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

export type GamePhase = 
  | 'MENU' 
  | 'PREDICTING' 
  | 'PLAYING' 
  | 'WON' 
  | 'LOST' 
  | 'BIDDING' 
  | 'CHALLENGING' 
  | 'ROUND_OVER' 
  | 'MATCH_OVER';

export type GameMode = 'MENU' | 'SOLO' | 'LOCAL_MULTIPLAYER';

export interface GameState {
  gameMode: GameMode;
  phase: GamePhase;
  levelIndex: number;
  levelQueue: number[];            // Pending levels queue (shuffled indices)
  solvedCount: number;             // Total puzzles solved (Solo Mode)
  
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
  biddingPlayer: 1 | 2;            // Multiplayer: player who initiated the bid
  activePlayer: 1 | 2;             // Multiplayer: player currently making moves / winning bidder
  
  // Multiplayer scores
  scores: { p1: number; p2: number };
  
  // Game execution state
  movesCount: number;              // Physical moves made during PLAYING
  selectedSquare: number | null;   // Active selected square index
  validMoves: number[];            // Valid target squares highlighted
  
  // History stack for Undo
  history: BoardState[];
}

export type GameAction =
  | { type: 'LOAD_LEVEL'; levelIndex: number }
  | { type: 'SELECT_MODE'; mode: GameMode }
  | { type: 'ROTATE_TARGET' }
  | { type: 'TOGGLE_MIRROR_HORIZONTAL' }
  | { type: 'TOGGLE_MIRROR_VERTICAL' }
  | { type: 'SET_BASE_PREDICTION'; count: number }
  | { type: 'START_PLAYING' }
  | { type: 'SELECT_PIECE'; index: number | null }
  | { type: 'MOVE_PIECE'; toIndex: number }
  | { type: 'UNDO_MOVE' }
  | { type: 'RESTART_LEVEL' }
  | { type: 'NEXT_LEVEL' }
  // Multiplayer actions
  | { type: 'START_CHALLENGE'; prediction: number }
  | { type: 'SUBMIT_CHALLENGE'; prediction: number }
  | { type: 'PASS_CHALLENGE' }
  | { type: 'NEXT_ROUND' }
  | { type: 'RESET_MATCH' };

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
 */
export function getModifierCost(rotations: number, mirrorH: boolean, mirrorV: boolean): number {
  return rotations + (mirrorH ? 1 : 0) + (mirrorV ? 1 : 0);
}

/**
 * Initializes the game state at the main menu.
 */
export function getInitialState(levelIndex: number): GameState {
  const allIndices = Array.from({ length: levels.length }, (_, i) => i);
  const queue = shuffle(allIndices);
  
  const currentLvlIndex = queue[0];
  const remainingQueue = queue.slice(1);
  const targetLayout = levels[currentLvlIndex];

  return {
    gameMode: 'MENU',
    phase: 'MENU',
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
    biddingPlayer: 1,
    activePlayer: 1,
    scores: { p1: 0, p2: 0 },
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

    case 'SELECT_MODE': {
      const allIndices = Array.from({ length: levels.length }, (_, i) => i);
      const queue = shuffle(allIndices);
      const currentLvlIndex = queue[0];
      const remainingQueue = queue.slice(1);
      const targetLayout = levels[currentLvlIndex];

      if (action.mode === 'SOLO') {
        return {
          ...state,
          gameMode: 'SOLO',
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
      } else if (action.mode === 'LOCAL_MULTIPLAYER') {
        return {
          ...state,
          gameMode: 'LOCAL_MULTIPLAYER',
          phase: 'BIDDING',
          levelIndex: currentLvlIndex,
          levelQueue: remainingQueue,
          currentBoard: [...GLOBAL_INITIAL_BOARD],
          levelStartBoard: [...GLOBAL_INITIAL_BOARD],
          originalTargetBoard: [...targetLayout],
          targetBoard: [...targetLayout],
          rotations: 0,
          mirrorH: false,
          mirrorV: false,
          prediction: 3, // Decent default starting bid for two players
          biddingPlayer: 1,
          activePlayer: 1,
          scores: { p1: 0, p2: 0 },
          movesCount: 0,
          selectedSquare: null,
          validMoves: [],
          history: [],
        };
      } else {
        return getInitialState(0);
      }
    }

    case 'ROTATE_TARGET': {
      if (state.phase !== 'PREDICTING' && state.phase !== 'BIDDING') return state;
      const nextRotations = (state.rotations + 1) % 4;
      const transformedBoard = applyTransformations(
        state.originalTargetBoard,
        nextRotations,
        state.mirrorH,
        state.mirrorV
      );
      
      const newModifierCost = getModifierCost(nextRotations, state.mirrorH, state.mirrorV);
      const nextPrediction = Math.max(state.prediction, newModifierCost + 1);

      return {
        ...state,
        rotations: nextRotations,
        targetBoard: transformedBoard,
        prediction: nextPrediction,
      };
    }

    case 'TOGGLE_MIRROR_HORIZONTAL': {
      if (state.phase !== 'PREDICTING' && state.phase !== 'BIDDING') return state;
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
      if (state.phase !== 'PREDICTING' && state.phase !== 'BIDDING') return state;
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
      if (state.phase !== 'PREDICTING' && state.phase !== 'BIDDING') return state;
      const modifierCost = getModifierCost(state.rotations, state.mirrorH, state.mirrorV);
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
        levelStartBoard: [...state.currentBoard],
        movesCount: 0,
        selectedSquare: null,
        validMoves: [],
        history: [[...state.currentBoard]],
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

      // Cost calculation
      const modifierCost = getModifierCost(state.rotations, state.mirrorH, state.mirrorV);
      const totalCost = nextMovesCount + modifierCost;

      const matchesTarget = isBoardMatching(nextBoard, state.targetBoard);
      
      let nextPhase: GamePhase = 'PLAYING';
      let nextSolvedCount = state.solvedCount;
      let nextScores = { ...state.scores };

      if (state.gameMode === 'LOCAL_MULTIPLAYER') {
        const opponent = (3 - state.activePlayer) as 1 | 2;
        const activeKey = state.activePlayer === 1 ? 'p1' : 'p2';
        const opponentKey = opponent === 1 ? 'p1' : 'p2';

        if (matchesTarget) {
          if (totalCost <= prediction) {
            nextPhase = 'ROUND_OVER';
            nextScores[activeKey] += 1;
          } else {
            nextPhase = 'ROUND_OVER';
            nextScores[opponentKey] += 1;
          }
        } else if (totalCost >= prediction) {
          nextPhase = 'ROUND_OVER';
          nextScores[opponentKey] += 1;
        }

        // Check if anyone won the match (reaches 6 points)
        if (nextPhase === 'ROUND_OVER' && (nextScores.p1 >= 6 || nextScores.p2 >= 6)) {
          nextPhase = 'MATCH_OVER';
        }
      } else {
        // Solo mode
        if (matchesTarget) {
          if (totalCost <= prediction) {
            nextPhase = 'WON';
            nextSolvedCount = state.solvedCount + 1;
          } else {
            nextPhase = 'LOST';
          }
        } else if (totalCost >= prediction) {
          nextPhase = 'LOST';
        }
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
        scores: nextScores,
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
      const resetBoard = [...state.levelStartBoard];
      return {
        ...state,
        phase: state.gameMode === 'LOCAL_MULTIPLAYER' ? 'BIDDING' : 'PREDICTING',
        currentBoard: resetBoard,
        targetBoard: [...state.originalTargetBoard],
        rotations: 0,
        mirrorH: false,
        mirrorV: false,
        prediction: state.gameMode === 'LOCAL_MULTIPLAYER' ? 3 : 1,
        movesCount: 0,
        selectedSquare: null,
        validMoves: [],
        history: [],
      };
    }

    case 'NEXT_LEVEL': {
      // Transition to next randomized level target (Solo Mode)
      let nextQueue = [...state.levelQueue];
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

    // --- Local Multiplayer Specific Actions ---

    case 'START_CHALLENGE': {
      if (state.phase !== 'BIDDING') return state;
      const modifierCost = getModifierCost(state.rotations, state.mirrorH, state.mirrorV);
      const cleanPrediction = Math.max(modifierCost + 1, action.prediction);
      return {
        ...state,
        phase: 'CHALLENGING',
        prediction: cleanPrediction,
      };
    }

    case 'SUBMIT_CHALLENGE': {
      if (state.phase !== 'CHALLENGING') return state;
      const modifierCost = getModifierCost(state.rotations, state.mirrorH, state.mirrorV);
      const cleanPrediction = Math.max(modifierCost + 1, action.prediction);
      const opponent = (3 - state.activePlayer) as 1 | 2;
      return {
        ...state,
        phase: 'PLAYING',
        prediction: cleanPrediction,
        activePlayer: opponent,      // Opponent steals the turn
        levelStartBoard: [...state.currentBoard],
        movesCount: 0,
        selectedSquare: null,
        validMoves: [],
        history: [[...state.currentBoard]],
      };
    }

    case 'PASS_CHALLENGE': {
      if (state.phase !== 'CHALLENGING') return state;
      return {
        ...state,
        phase: 'PLAYING',
        activePlayer: state.biddingPlayer, // Bidding player gets to play
        levelStartBoard: [...state.currentBoard],
        movesCount: 0,
        selectedSquare: null,
        validMoves: [],
        history: [[...state.currentBoard]],
      };
    }

    case 'NEXT_ROUND': {
      if (state.phase !== 'ROUND_OVER') return state;
      let nextQueue = [...state.levelQueue];
      if (nextQueue.length === 0) {
        const allIndices = Array.from({ length: levels.length }, (_, i) => i);
        nextQueue = shuffle(allIndices);
      }

      const nextLevelIndex = nextQueue[0];
      const remainingQueue = nextQueue.slice(1);
      const nextTargetLayout = levels[nextLevelIndex];

      // Alternate the player who starts the bidding
      const nextBiddingPlayer = (3 - state.biddingPlayer) as 1 | 2;

      return {
        ...state,
        phase: 'BIDDING',
        levelIndex: nextLevelIndex,
        levelQueue: remainingQueue,
        levelStartBoard: [...state.currentBoard],
        originalTargetBoard: [...nextTargetLayout],
        targetBoard: [...nextTargetLayout],
        rotations: 0,
        mirrorH: false,
        mirrorV: false,
        prediction: 3,
        biddingPlayer: nextBiddingPlayer,
        activePlayer: nextBiddingPlayer,
        movesCount: 0,
        selectedSquare: null,
        validMoves: [],
        history: [],
      };
    }

    case 'RESET_MATCH': {
      const allIndices = Array.from({ length: levels.length }, (_, i) => i);
      const queue = shuffle(allIndices);
      const currentLvlIndex = queue[0];
      const remainingQueue = queue.slice(1);
      const targetLayout = levels[currentLvlIndex];

      return {
        ...state,
        gameMode: 'LOCAL_MULTIPLAYER',
        phase: 'BIDDING',
        levelIndex: currentLvlIndex,
        levelQueue: remainingQueue,
        currentBoard: [...GLOBAL_INITIAL_BOARD],
        levelStartBoard: [...GLOBAL_INITIAL_BOARD],
        originalTargetBoard: [...targetLayout],
        targetBoard: [...targetLayout],
        rotations: 0,
        mirrorH: false,
        mirrorV: false,
        prediction: 3,
        biddingPlayer: 1,
        activePlayer: 1,
        scores: { p1: 0, p2: 0 },
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
