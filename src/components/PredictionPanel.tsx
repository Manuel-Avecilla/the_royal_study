import React from 'react';
import { Play, Plus, Minus, RotateCw, Move, Flag } from 'lucide-react';
import { Button } from './ui/Button';
import { StatBlock } from './ui/StatBlock';

interface PredictionPanelProps {
  prediction: number;
  rotations: number;
  mirrorH: boolean;
  mirrorV: boolean;
  onSetBasePrediction: (count: number) => void;
  onStartPlaying: () => void;
}

export default function PredictionPanel({
  prediction,
  rotations,
  mirrorH,
  mirrorV,
  onSetBasePrediction,
  onStartPlaying,
}: PredictionPanelProps) {
  const modifierCost = rotations + (mirrorH ? 1 : 0) + (mirrorV ? 1 : 0);
  const totalLimit = prediction + modifierCost;

  return (
    <div className="flex flex-col items-center w-full max-w-[320px] md:max-w-[300px] lg:max-w-[320px] text-center mt-0.5 md:mt-1">
      {/* Title & Info */}
      <h3 className="font-sans text-[11px] md:text-sm lg:text-base font-bold text-royal mb-0.5">
        Predicción
      </h3>
      <p className="hidden md:block font-sans text-xs lg:text-sm text-accent-slate/60 mb-3 md:mb-4 leading-relaxed">
        Estima el límite de movimientos.
      </p>

      {/* 3 Bloques UI: Grid en móvil, Flex vertical en escritorio */}
      <div className="grid grid-cols-3 gap-1.5 md:flex md:flex-col md:gap-3 w-full mb-2.5 md:mb-5">
        
        {/* BLOQUE ROJO: Penalizaciones de Carta (Solo lectura) */}
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

        {/* BLOQUE AZUL: Movimientos de Piezas (Interactivo) */}
        <StatBlock
          variant="info"
          icon={<Move className="w-3 h-3 md:w-4 md:h-4" />}
          label={
            <>
              <span className="hidden md:inline">Movimientos en tablero</span>
              <span className="md:hidden font-extrabold uppercase tracking-wide text-[7px]">Tablero</span>
            </>
          }
        >
          <div className="flex items-center justify-center gap-1 md:gap-5 mt-1 md:mt-2.5 w-full">
            <Button
              onClick={() => onSetBasePrediction(prediction - 1)}
              disabled={prediction <= 1}
              variant="none"
              size="none"
              className="flex items-center justify-center w-9 h-9 md:w-12 md:h-12 rounded-full border border-blue-200 text-blue-700 bg-white hover:bg-blue-100 disabled:opacity-30 disabled:hover:bg-white transition-all active:scale-95 shadow-sm"
              title="Reducir movimientos"
              aria-label="Reducir movimientos"
            >
              <Minus className="w-3.5 h-3.5 md:w-5 md:h-5" />
            </Button>
            <span className="font-mono text-sm md:text-3xl font-extrabold text-blue-955 min-w-[14px] md:min-w-[28px] text-center select-none leading-none">
              {prediction}
            </span>
            <Button
              onClick={() => onSetBasePrediction(prediction + 1)}
              variant="none"
              size="none"
              className="flex items-center justify-center w-9 h-9 md:w-12 md:h-12 rounded-full border border-blue-200 text-blue-700 bg-white hover:bg-blue-100 transition-all active:scale-95 shadow-sm"
              title="Aumentar movimientos"
              aria-label="Aumentar movimientos"
            >
              <Plus className="w-3.5 h-3.5 md:w-5 md:h-5" />
            </Button>
          </div>
        </StatBlock>

        {/* BLOQUE NARANJA/AMARILLO: Total (Solo lectura) */}
        <StatBlock
          variant="warning"
          icon={<Flag className="w-3 h-3 md:w-4 md:h-4" />}
          label={
            <>
              <span className="hidden md:inline">Límite Total</span>
              <span className="md:hidden font-extrabold uppercase tracking-wide text-[7px]">Total</span>
            </>
          }
          value={totalLimit}
        />

      </div>

      {/* Start Game Action */}
      <Button
        onClick={onStartPlaying}
        variant="primary"
        size="sm"
        className="gap-1 md:gap-2.5 w-full py-1.5 md:py-2.5 font-semibold active:scale-98"
      >
        <Play className="w-2 md:w-3 h-2 md:h-3 fill-current" />
        <span>Comenzar ({totalLimit})</span>
      </Button>
    </div>
  );
}

