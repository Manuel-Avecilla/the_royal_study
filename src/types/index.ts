export type PieceType = 'K' | 'Q' | 'R' | 'B' | 'N'; // King, Queen, Rook, Bishop, Knight
export type PieceColor = 'w' | 'b'; // White or Black

export interface Piece {
  type: PieceType;
  color: PieceColor;
}

export type Square = Piece | null;

/**
 * BoardState represents a 3x3 board as a 1D array of 9 elements.
 * Index mapping:
 * 0 1 2
 * 3 4 5
 * 6 7 8
 */
export type BoardState = Square[];

export interface Coords {
  row: number;
  col: number;
}

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
