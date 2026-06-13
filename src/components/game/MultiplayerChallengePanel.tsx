import React from 'react';
import { Hourglass, RotateCw, Move, Flag, Plus, Minus } from 'lucide-react';

interface MultiplayerChallengePanelProps {
  biddingPlayer: 1 | 2;
  prediction: number;
  modifierCost: number;
  timeLeft: number;
  challengeBid: number;
  setChallengeBid: React.Dispatch<React.SetStateAction<number>>;
  onSubmitChallenge: (prediction: number) => void;
  onPassChallenge: () => void;
}

export default function MultiplayerChallengePanel({
  biddingPlayer,
  prediction,
  modifierCost,
  timeLeft,
  challengeBid,
  setChallengeBid,
  onSubmitChallenge,
  onPassChallenge,
}: MultiplayerChallengePanelProps) {
  return (
    <div className="flex flex-col items-center w-full max-w-[320px] md:max-w-[300px] lg:max-w-[320px]">
      <div className="flex items-center gap-1 text-[10px] md:text-xs lg:text-sm font-bold text-accent-rose mb-1">
        <Hourglass className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin" />
        <span>Desafío: {timeLeft}s</span>
      </div>
      <p className="hidden md:block text-[9px] md:text-[11px] lg:text-xs text-accent-slate/75 mb-3 md:mb-4 leading-relaxed">
        Jugador {3 - biddingPlayer}, ¿puedes resolverlo en MENOS de {prediction} movimientos?
      </p>

      {/* 3 Bloques UI para Challenging */}
      <div className="grid grid-cols-3 gap-1.5 md:flex md:flex-col md:gap-3 w-full mb-2.5 md:mb-5">
        
        {/* BLOQUE ROJO: Penalizaciones de Carta */}
        <div className="flex flex-col items-center justify-center p-1.5 md:p-5 md:flex-row md:justify-between rounded-xl md:rounded-2xl bg-red-50/50 border border-red-100 text-red-700 w-full transition-all">
          <div className="flex flex-col md:flex-row items-center gap-0.5 md:gap-2.5">
            <div className="p-0.5 md:p-1.5 rounded-md md:rounded-lg bg-red-100/50 text-red-600">
              <RotateCw className="w-3 h-3 md:w-4 md:h-4" />
            </div>
            <span className="font-sans text-[7px] md:text-xs font-bold tracking-tight text-red-955 text-center md:text-left leading-none md:leading-tight">
              <span className="hidden md:inline">Rotaciones/Espejos</span>
              <span className="md:hidden font-extrabold uppercase tracking-wide text-[7px]">Carta</span>
            </span>
          </div>
          <span className="font-sans text-xs md:text-xl font-bold text-red-955 mt-0.5 md:mt-0 leading-none">{modifierCost}</span>
        </div>

        {/* BLOQUE AZUL: Movimientos de Piezas */}
        <div className="flex flex-col items-center justify-between p-1.5 md:p-5 rounded-xl md:rounded-2xl bg-blue-50/50 border border-blue-100 text-blue-700 w-full transition-all">
          <div className="flex flex-col md:flex-row items-center gap-0.5 md:gap-2.5 w-full text-center md:text-left">
            <div className="p-0.5 md:p-1.5 rounded-md md:rounded-lg bg-blue-100/50 text-blue-600">
              <Move className="w-3 h-3 md:w-4 md:h-4" />
            </div>
            <span className="font-sans text-[7px] md:text-xs font-bold tracking-tight text-blue-955 leading-none md:leading-tight">
              <span className="hidden md:inline">Tablero (Desafío)</span>
              <span className="md:hidden font-extrabold uppercase tracking-wide text-[7px]">Desafío</span>
            </span>
          </div>
          
          <div className="flex items-center justify-center gap-1 md:gap-5 mt-1 md:mt-2.5 w-full">
            <button
              onClick={() => setChallengeBid(prev => Math.max(1, prev - 1))}
              disabled={challengeBid <= 1}
              className="flex items-center justify-center w-9 h-9 md:w-12 md:h-12 rounded-full border border-blue-200 text-blue-700 bg-white hover:bg-blue-100 disabled:opacity-30 disabled:hover:bg-white transition-all active:scale-95 shadow-sm"
              title="Reducir movimientos"
            >
              <Minus className="w-3.5 h-3.5 md:w-5 md:h-5" />
            </button>
            <span className="font-mono text-sm md:text-3xl font-extrabold text-blue-955 min-w-[14px] md:min-w-[28px] text-center select-none leading-none">
              {challengeBid}
            </span>
            <button
              onClick={() => setChallengeBid(prev => Math.min(prediction - 1, prev + 1))}
              disabled={challengeBid >= prediction - 1}
              className="flex items-center justify-center w-9 h-9 md:w-12 md:h-12 rounded-full border border-blue-200 text-blue-700 bg-white hover:bg-blue-100 disabled:opacity-30 disabled:hover:bg-white transition-all active:scale-95 shadow-sm"
              title="Aumentar movimientos"
            >
              <Plus className="w-3.5 h-3.5 md:w-5 md:h-5" />
            </button>
          </div>
        </div>

        {/* BLOQUE NARANJA/AMARILLO: Total */}
        <div className="flex flex-col items-center justify-center p-1.5 md:p-5 md:flex-row md:justify-between rounded-xl md:rounded-2xl bg-amber-50/70 border border-amber-100 text-amber-800 w-full transition-all">
          <div className="flex flex-col md:flex-row items-center gap-0.5 md:gap-2.5">
            <div className="p-0.5 md:p-1.5 rounded-md md:rounded-lg bg-amber-100/60 text-amber-600">
              <Flag className="w-3 h-3 md:w-4 md:h-4" />
            </div>
            <span className="font-sans text-[7px] md:text-xs font-bold tracking-tight text-amber-955 text-center md:text-left leading-none md:leading-tight">
              <span className="hidden md:inline">Límite Total</span>
              <span className="md:hidden font-extrabold uppercase tracking-wide text-[7px]">Total</span>
            </span>
          </div>
          <span className="font-sans text-xs md:text-xl font-extrabold text-amber-955 mt-0.5 md:mt-0 leading-none">{challengeBid + modifierCost}</span>
        </div>

      </div>

      <div className="flex gap-1.5 md:gap-2.5 w-full">
        <button
          onClick={() => onSubmitChallenge(challengeBid)}
          disabled={challengeBid >= prediction || challengeBid < 1}
          className="flex-1 py-2 md:py-2.5 bg-royal text-white font-sans font-semibold text-[10px] md:text-xs lg:text-sm rounded-full disabled:opacity-40 shadow-sm transition-colors active:scale-98"
        >
          Desafiar
        </button>
        <button
          onClick={onPassChallenge}
          className="flex-1 py-2 md:py-2.5 border border-parchment-dark text-royal bg-transparent hover:bg-parchment font-sans font-semibold text-[10px] md:text-xs lg:text-sm rounded-full transition-colors active:scale-98"
        >
          Pasar
        </button>
      </div>
    </div>
  );
}
