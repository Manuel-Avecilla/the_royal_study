import { 
  rotateBoard90, 
  mirrorBoardHorizontal, 
  mirrorBoardVertical, 
  getValidMoves,
  solvePuzzle
} from './chessEngine';
import { levels } from './levels';
import { GLOBAL_INITIAL_BOARD } from '../constants/game';
import { BoardState, Square, GamePhase, GameMode, GameState, GameAction } from '../types';

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

function selectMode(state: GameState, mode: GameMode): GameState {
  const allIndices = Array.from({ length: levels.length }, (_, i) => i);
  const queue = shuffle(allIndices);
  const currentLvlIndex = queue[0];
  const remainingQueue = queue.slice(1);
  const targetLayout = levels[currentLvlIndex];

  if (mode === 'SOLO') {
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
  } else if (mode === 'LOCAL_MULTIPLAYER') {
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

function rotateTarget(state: GameState): GameState {
  if (state.phase !== 'PREDICTING' && state.phase !== 'BIDDING') return state;
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
  };
}

function toggleMirrorHorizontal(state: GameState): GameState {
  if (state.phase !== 'PREDICTING' && state.phase !== 'BIDDING') return state;
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
  };
}

function toggleMirrorVertical(state: GameState): GameState {
  if (state.phase !== 'PREDICTING' && state.phase !== 'BIDDING') return state;
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
  };
}

function setBasePrediction(state: GameState, count: number): GameState {
  if (state.phase !== 'PREDICTING' && state.phase !== 'BIDDING') return state;
  const nextPrediction = Math.max(1, count);
  return {
    ...state,
    prediction: nextPrediction,
  };
}

function startPlaying(state: GameState): GameState {
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

function selectPiece(state: GameState, index: number | null): GameState {
  if (state.phase !== 'PLAYING') return state;

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

function movePiece(state: GameState, toIndex: number): GameState {
  if (state.phase !== 'PLAYING') return state;
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

  const limitTotal = prediction + modifierCost;

  if (state.gameMode === 'LOCAL_MULTIPLAYER') {
    const opponent = (3 - state.activePlayer) as 1 | 2;
    const activeKey = state.activePlayer === 1 ? 'p1' : 'p2';
    const opponentKey = opponent === 1 ? 'p1' : 'p2';

    if (matchesTarget) {
      if (totalCost <= limitTotal) {
        nextPhase = 'ROUND_OVER';
        nextScores[activeKey] += 1;
      } else {
        nextPhase = 'ROUND_OVER';
        nextScores[opponentKey] += 1;
      }
    } else if (totalCost >= limitTotal) {
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
      if (totalCost <= limitTotal) {
        nextPhase = 'WON';
        nextSolvedCount = state.solvedCount + 1;
      } else {
        nextPhase = 'LOST';
      }
    } else if (totalCost >= limitTotal) {
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

function undoMove(state: GameState): GameState {
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

function restartLevel(state: GameState): GameState {
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

function nextLevel(state: GameState): GameState {
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

function startChallenge(state: GameState, prediction: number): GameState {
  if (state.phase !== 'BIDDING') return state;
  const cleanPrediction = Math.max(1, prediction);
  return {
    ...state,
    phase: 'CHALLENGING',
    prediction: cleanPrediction,
  };
}

function submitChallenge(state: GameState, prediction: number): GameState {
  if (state.phase !== 'CHALLENGING') return state;
  const cleanPrediction = Math.max(1, prediction);
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

function passChallenge(state: GameState): GameState {
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

function nextRound(state: GameState): GameState {
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

function resetMatch(state: GameState): GameState {
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

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'LOAD_LEVEL':
      return getInitialState(action.levelIndex);
    case 'SELECT_MODE':
      return selectMode(state, action.mode);
    case 'ROTATE_TARGET':
      return rotateTarget(state);
    case 'TOGGLE_MIRROR_HORIZONTAL':
      return toggleMirrorHorizontal(state);
    case 'TOGGLE_MIRROR_VERTICAL':
      return toggleMirrorVertical(state);
    case 'SET_BASE_PREDICTION':
      return setBasePrediction(state, action.count);
    case 'START_PLAYING':
      return startPlaying(state);
    case 'SELECT_PIECE':
      return selectPiece(state, action.index);
    case 'MOVE_PIECE':
      return movePiece(state, action.toIndex);
    case 'UNDO_MOVE':
      return undoMove(state);
    case 'RESTART_LEVEL':
      return restartLevel(state);
    case 'NEXT_LEVEL':
      return nextLevel(state);
    case 'START_CHALLENGE':
      return startChallenge(state, action.prediction);
    case 'SUBMIT_CHALLENGE':
      return submitChallenge(state, action.prediction);
    case 'PASS_CHALLENGE':
      return passChallenge(state);
    case 'NEXT_ROUND':
      return nextRound(state);
    case 'RESET_MATCH':
      return resetMatch(state);
    default:
      return state;
  }
}
