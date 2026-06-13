import React from 'react';
import { BoardState, PieceType, PieceColor } from '../types';
import { RotateCw, FlipHorizontal, FlipVertical } from 'lucide-react';

interface ObjectiveCardProps {
  board: BoardState;
  phase: string;
  rotations: number;
  mirrorH: boolean;
  mirrorV: boolean;
  onRotate: () => void;
  onToggleMirrorH: () => void;
  onToggleMirrorV: () => void;
}

/**
 * Maps a chess piece configuration to its corresponding static SVG filename.
 */
export function getPieceSvgPath(type: PieceType, color: PieceColor): string {
  const nameMap: Record<PieceType, string> = {
    'K': 'king',
    'Q': 'queen',
    'R': 'rook',
    'B': 'bishop',
    'N': 'knight'
  };
  return `/assets/SVG with shadow/${color}_${nameMap[type]}_svg_withShadow.svg`;
}

export default function ObjectiveCard({
  board,
  phase,
  rotations,
  mirrorH,
  mirrorV,
  onRotate,
  onToggleMirrorH,
  onToggleMirrorV,
}: ObjectiveCardProps) {
  const isPredicting = phase === 'PREDICTING' || phase === 'BIDDING';

  return (
    <div className="flex flex-col items-center w-full max-w-[180px] sm:max-w-[200px] md:max-w-[240px] lg:max-w-[280px]">
      <h3 className="text-[10px] uppercase tracking-widest text-accent-slate/60 mb-1 md:mb-2 font-semibold">
        Objetivo
      </h3>
      
      {/* 3x3 Small Responsive Board */}
      <div className="grid grid-cols-3 gap-0.5 bg-parchment-dark/30 p-0.5 rounded-lg w-full aspect-square mb-1.5 md:mb-3">
        {board.map((square, index) => {
          const row = Math.floor(index / 3);
          const col = index % 3;
          const isLight = (row + col) % 2 === 0;

          return (
            <div
              key={index}
              className="relative flex items-center justify-center rounded overflow-hidden aspect-square"
              style={{
                backgroundColor: isLight ? '#fdfcfb' : '#e6e1d8',
              }}
            >
              {square && (
                <img
                  src={getPieceSvgPath(square.type, 'b')} // Target pieces in black/dark
                  alt={`${square.color === 'w' ? 'White' : 'Black'} ${square.type}`}
                  className="w-full h-full p-2 object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.12)]"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Modifiers (Only shown in PREDICTING phase) */}
      {isPredicting ? (
        <div className="w-full grid grid-cols-3 gap-1">
          <button
            onClick={onRotate}
            className={`flex items-center justify-center p-1.5 rounded border border-parchment-dark transition-all text-accent-slate/80 hover:bg-parchment ${
              rotations > 0 ? 'bg-parchment-dark border-accent-slate/30 text-royal' : 'bg-transparent'
            }`}
            title="Rotar 90°"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onToggleMirrorH}
            className={`flex items-center justify-center p-1.5 rounded border border-parchment-dark transition-all text-accent-slate/80 hover:bg-parchment ${
              mirrorH ? 'bg-parchment-dark border-accent-slate/30 text-royal' : 'bg-transparent'
            }`}
            title="Espejo Horizontal"
          >
            <FlipHorizontal className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onToggleMirrorV}
            className={`flex items-center justify-center p-1.5 rounded border border-parchment-dark transition-all text-accent-slate/80 hover:bg-parchment ${
              mirrorV ? 'bg-parchment-dark border-accent-slate/30 text-royal' : 'bg-transparent'
            }`}
            title="Espejo Vertical"
          >
            <FlipVertical className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
