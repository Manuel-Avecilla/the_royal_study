import React from 'react';
import { Undo, RotateCcw } from 'lucide-react';

interface MultiplayerPlayingPanelProps {
  activePlayer: 1 | 2;
  movesCount: number;
  prediction: number;
  modifierCost: number;
  historyLength: number;
  onUndo: () => void;
  onRestart: () => void;
}

export default function MultiplayerPlayingPanel({
  activePlayer,
  movesCount,
  prediction,
  modifierCost,
  historyLength,
  onUndo,
  onRestart,
}: MultiplayerPlayingPanelProps) {
  return (
    <div className="flex flex-col items-center w-full gap-1.5">
      <div className="text-[9px] md:text-[11px] lg:text-xs uppercase font-bold text-accent-slate/50 tracking-wider mb-0.5">
        Turno Jugador {activePlayer}
      </div>

      {/* Desglose de Progreso Multijugador */}
      <div className="grid grid-cols-3 gap-1.5 md:flex md:flex-col md:gap-1 w-full text-center mb-1">
        {/* Tablero (Azul) */}
        <div className="flex flex-col md:flex-row items-center justify-center md:justify-between text-[9px] md:text-xs font-semibold px-1.5 py-1 rounded-lg bg-blue-50/50 border border-blue-100/30 text-blue-700 leading-none">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span className="hidden md:inline">Tablero:</span>
            <span className="md:hidden font-extrabold uppercase tracking-wide text-[7px]">Tablero</span>
          </span>
          <span className="mt-0.5 md:mt-0 font-mono font-bold">{movesCount} / {prediction}</span>
        </div>
        
        {/* Carta (Rojo) */}
        <div className="flex flex-col md:flex-row items-center justify-center md:justify-between text-[9px] md:text-xs font-semibold px-1.5 py-1 rounded-lg bg-red-50/50 border border-red-100/30 text-red-700 leading-none">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span className="hidden md:inline">Carta:</span>
            <span className="md:hidden font-extrabold uppercase tracking-wide text-[7px]">Carta</span>
          </span>
          <span className="mt-0.5 md:mt-0 font-mono font-bold">{modifierCost}</span>
        </div>
        
        {/* Total (Naranja) */}
        <div className="flex flex-col md:flex-row items-center justify-center md:justify-between text-[9px] md:text-xs font-bold px-1.5 py-1 rounded-lg bg-amber-50/70 border border-amber-100/40 text-amber-800 leading-none">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="hidden md:inline">Total:</span>
            <span className="md:hidden font-extrabold uppercase tracking-wide text-[7px]">Total</span>
          </span>
          <span className="mt-0.5 md:mt-0 font-mono font-extrabold">{movesCount + modifierCost} / {prediction + modifierCost}</span>
        </div>
      </div>
      
      <div className="flex gap-1 md:gap-2.5 w-full">
        <button
          onClick={onUndo}
          disabled={historyLength <= 1}
          className="flex items-center justify-center gap-1 flex-1 py-1.5 md:py-2.5 border border-parchment-dark text-royal bg-transparent disabled:opacity-30 rounded-lg text-[10px] md:text-xs lg:text-sm font-bold hover:bg-parchment transition-colors active:scale-98"
        >
          <Undo className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
          <span>Deshacer</span>
        </button>
        <button
          onClick={onRestart}
          className="flex items-center justify-center gap-1 flex-1 py-1.5 md:py-2.5 border border-parchment-dark text-royal bg-transparent rounded-lg text-[10px] md:text-xs lg:text-sm font-bold hover:bg-parchment transition-colors active:scale-98"
        >
          <RotateCcw className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
          <span>Reiniciar</span>
        </button>
      </div>
    </div>
  );
}
