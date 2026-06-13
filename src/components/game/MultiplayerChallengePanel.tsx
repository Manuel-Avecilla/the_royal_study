import React from 'react';
import { Hourglass, RotateCw, Move, Flag, Plus, Minus } from 'lucide-react';
import { Button } from '../ui/Button';
import { StatBlock } from '../ui/StatBlock';

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
        <StatBlock
          variant="danger"
          icon={<RotateCw className="w-3 h-3 md:w-4 md:h-4" />}
          label={
            <>
              <span className="hidden md:inline">Rotaciones/Espejos</span>
              <span className="md:hidden font-extrabold uppercase tracking-wide text-[7px]">Carta</span>
            </>
          }
          value={modifierCost}
        />

        {/* BLOQUE AZUL: Movimientos de Piezas */}
        <StatBlock
          variant="info"
          icon={<Move className="w-3 h-3 md:w-4 md:h-4" />}
          label={
            <>
              <span className="hidden md:inline">Tablero (Desafío)</span>
              <span className="md:hidden font-extrabold uppercase tracking-wide text-[7px]">Desafío</span>
            </>
          }
        >
          <div className="flex items-center justify-center gap-1 md:gap-5 mt-1 md:mt-2.5 w-full">
            <Button
              onClick={() => setChallengeBid(prev => Math.max(1, prev - 1))}
              disabled={challengeBid <= 1}
              variant="none"
              size="none"
              className="flex items-center justify-center w-9 h-9 md:w-12 md:h-12 rounded-full border border-blue-200 text-blue-700 bg-white hover:bg-blue-100 disabled:opacity-30 disabled:hover:bg-white transition-all active:scale-95 shadow-sm"
              title="Reducir movimientos"
              aria-label="Reducir movimientos"
            >
              <Minus className="w-3.5 h-3.5 md:w-5 md:h-5" />
            </Button>
            <span className="font-mono text-sm md:text-3xl font-extrabold text-blue-955 min-w-[14px] md:min-w-[28px] text-center select-none leading-none">
              {challengeBid}
            </span>
            <Button
              onClick={() => setChallengeBid(prev => Math.min(prediction - 1, prev + 1))}
              disabled={challengeBid >= prediction - 1}
              variant="none"
              size="none"
              className="flex items-center justify-center w-9 h-9 md:w-12 md:h-12 rounded-full border border-blue-200 text-blue-700 bg-white hover:bg-blue-100 disabled:opacity-30 disabled:hover:bg-white transition-all active:scale-95 shadow-sm"
              title="Aumentar movimientos"
              aria-label="Aumentar movimientos"
            >
              <Plus className="w-3.5 h-3.5 md:w-5 md:h-5" />
            </Button>
          </div>
        </StatBlock>

        {/* BLOQUE NARANJA/AMARILLO: Total */}
        <StatBlock
          variant="warning"
          icon={<Flag className="w-3 h-3 md:w-4 md:h-4" />}
          label={
            <>
              <span className="hidden md:inline">Límite Total</span>
              <span className="md:hidden font-extrabold uppercase tracking-wide text-[7px]">Total</span>
            </>
          }
          value={challengeBid + modifierCost}
        />

      </div>

      <div className="flex gap-1.5 md:gap-2.5 w-full">
        <Button
          onClick={() => onSubmitChallenge(challengeBid)}
          disabled={challengeBid >= prediction || challengeBid < 1}
          variant="primary"
          size="sm"
          className="flex-1 py-2 md:py-2.5 font-semibold"
        >
          Desafiar
        </Button>
        <Button
          onClick={onPassChallenge}
          variant="secondary"
          size="sm"
          className="flex-1 py-2 md:py-2.5 font-semibold"
        >
          Pasar
        </Button>
      </div>
    </div>
  );
}

