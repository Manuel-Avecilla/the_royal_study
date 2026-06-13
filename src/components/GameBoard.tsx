import React from 'react';
import { BoardState, PieceType, PieceColor } from '../lib/chessEngine';
import { getPieceSvgPath } from './ObjectiveCard';
import { useAudio } from '../hooks/useAudio';

interface GameBoardProps {
  board: BoardState;
  phase: string;
  selectedSquare: number | null;
  validMoves: number[];
  onSelectSquare: (index: number | null) => void;
  onMovePiece: (toIndex: number) => void;
}

export default function GameBoard({
  board,
  phase,
  selectedSquare,
  validMoves,
  onSelectSquare,
  onMovePiece,
}: GameBoardProps) {
  const { play } = useAudio('/assets/chess-piece-move.wav');
  const isPlaying = phase === 'PLAYING';

  const handleSquareClick = (index: number) => {
    if (!isPlaying) return;

    const square = board[index];

    // 1. Move selected piece to valid target
    if (validMoves.includes(index)) {
      onMovePiece(index);
      play();
      return;
    }

    // 2. Select white pieces (allies)
    if (square && square.color === 'w') {
      onSelectSquare(index);
    } else {
      onSelectSquare(null);
    }
  };

  return (
    <div className="w-full max-w-[260px] sm:max-w-[320px] md:max-w-[400px] lg:max-w-[480px] aspect-square rounded-xl overflow-hidden border border-parchment-dark shadow-sm">
      <div className="grid grid-cols-3 w-full h-full">
        {board.map((square, index) => {
          const row = Math.floor(index / 3);
          const col = index % 3;
          const isLight = (row + col) % 2 === 0;
          const isSelected = selectedSquare === index;
          const isValidDest = validMoves.includes(index);

          return (
            <div
              key={index}
              onClick={() => handleSquareClick(index)}
              className={`relative flex items-center justify-center select-none aspect-square transition-all duration-100 ${
                isPlaying ? 'cursor-pointer' : 'cursor-default'
              } ${isSelected ? 'ring-2 ring-gold ring-inset bg-gold/10' : ''}`}
              style={{
                backgroundColor: isLight ? '#fdfcfb' : '#e6e1d8',
              }}
            >
              {/* Highlight Valid Move Targets */}
              {isValidDest && (
                <div className="absolute inset-0 flex items-center justify-center bg-accent-emerald/5 z-20">
                  <div className="w-3.5 h-3.5 rounded-full bg-accent-emerald/75 border border-white shadow-sm" />
                </div>
              )}

              {/* Render Chess Piece */}
              {square && (
                <img
                  src={getPieceSvgPath(square.type, square.color)}
                  alt={`${square.color === 'w' ? 'White' : 'Black'} ${square.type}`}
                  className={`w-full h-full p-2.5 object-contain z-10 transition-all ${
                    isSelected ? 'filter drop-shadow-[0_4px_8px_rgba(214,158,46,0.35)] scale-102' : ''
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
