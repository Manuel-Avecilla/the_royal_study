import React from 'react';
import { Home } from 'lucide-react';

interface GameHeaderProps {
  isMultiplayer: boolean;
  isMounted: boolean;
  activePlayer: 1 | 2;
  scores: { p1: number; p2: number };
  solvedCount: number;
  onGoToMenu: () => void;
}

export default function GameHeader({
  isMultiplayer,
  isMounted,
  activePlayer,
  scores,
  solvedCount,
  onGoToMenu,
}: GameHeaderProps) {
  return (
    <div className="w-full max-w-2xl md:max-w-4xl lg:max-w-5xl flex justify-between items-center mb-1.5 md:mb-10 border-b border-parchment-dark/30 pb-1 md:pb-4">
      {/* Solitaire vs Multiplayer Label */}
      <div className="flex items-center gap-2 md:gap-3.5">
        <button
          onClick={onGoToMenu}
          className="p-1.5 md:p-2.5 rounded-lg border border-parchment-dark text-royal hover:bg-parchment transition-colors"
          title="Volver al Menú Principal"
        >
          <Home className="w-4 h-4 md:w-5 md:h-5" />
        </button>
        <span className="text-xs md:text-sm lg:text-base font-sans font-bold text-royal uppercase tracking-wider">
          {isMultiplayer ? 'Modo 2 Jugadores' : 'Modo Solitario'}
        </span>
      </div>

      {/* Solo Level indicator or Scoreboard */}
      {isMounted ? (
        isMultiplayer ? (
          <div className="flex items-center gap-3 md:gap-5 text-xs md:text-sm lg:text-base font-sans font-bold">
            <span className={activePlayer === 1 ? 'text-royal underline decoration-gold decoration-2 underline-offset-4' : 'text-accent-slate/60'}>
              J1: {scores.p1}
            </span>
            <span className="text-accent-slate/40">•</span>
            <span className={activePlayer === 2 ? 'text-royal underline decoration-gold decoration-2 underline-offset-4' : 'text-accent-slate/60'}>
              J2: {scores.p2}
            </span>
            <span className="text-[9px] md:text-[11px] lg:text-xs px-1.5 py-0.5 md:px-2.5 md:py-1 bg-royal text-white rounded">Meta: 6</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-xs lg:text-sm font-sans font-semibold text-accent-slate/60 uppercase tracking-wider">
            <span>Puzzle #{solvedCount + 1}</span>
            <span>•</span>
            <span className="text-gold-dark">Resueltos: {solvedCount}</span>
          </div>
        )
      ) : (
        <div className="w-24 h-5 bg-parchment-dark/15 animate-pulse rounded" />
      )}
    </div>
  );
}
