import React from 'react';
import { Play, Plus, Minus } from 'lucide-react';

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
  const minAllowed = modifierCost + 1;

  return (
    <div className="flex flex-col items-center w-full max-w-[220px] md:max-w-[260px] lg:max-w-[300px] text-center mt-1">
      {/* Title & Info */}
      <h3 className="font-sans text-xs md:text-sm lg:text-base font-bold text-royal mb-0.5 md:mb-1">
        Predicción
      </h3>
      <p className="font-sans text-[10px] md:text-xs lg:text-sm text-accent-slate/60 mb-3 md:mb-4 leading-relaxed">
        Estima el límite de movimientos.
      </p>

      {/* Adjuster */}
      <div className="flex items-center gap-3.5 md:gap-5 mb-3.5 md:mb-4">
        <button
          onClick={() => onSetBasePrediction(prediction - 1)}
          disabled={prediction <= minAllowed}
          className="flex items-center justify-center w-7 h-7 md:w-9 md:h-9 lg:w-11 lg:h-11 rounded-full border border-parchment-dark text-royal bg-transparent hover:bg-parchment disabled:opacity-30 transition-colors"
          title="Reducir predicción"
        >
          <Minus className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5" />
        </button>

        <div className="flex flex-col items-center min-w-[30px] md:min-w-[40px]">
          <span className="font-sans text-2xl md:text-3xl lg:text-4xl font-extrabold text-royal leading-none">
            {prediction}
          </span>
        </div>

        <button
          onClick={() => onSetBasePrediction(prediction + 1)}
          className="flex items-center justify-center w-7 h-7 md:w-9 md:h-9 lg:w-11 lg:h-11 rounded-full border border-parchment-dark text-royal bg-transparent hover:bg-parchment transition-colors"
          title="Aumentar predicción"
        >
          <Plus className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5" />
        </button>
      </div>

      {/* Cost Info */}
      {modifierCost > 0 && (
        <div className="text-[9px] md:text-[11px] lg:text-xs text-accent-slate/70 mb-3.5 md:mb-4 font-medium leading-relaxed">
          Penalización: {modifierCost} movs. <br />
          Límite mínimo: {minAllowed}
        </div>
      )}

      {/* Start Game Action */}
      <button
        onClick={onStartPlaying}
        className="flex items-center justify-center gap-1.5 md:gap-2.5 py-1.5 px-4 md:py-2.5 md:px-6 bg-royal text-white font-sans font-semibold text-[11px] md:text-xs lg:text-sm rounded-full hover:bg-royal-dark transition-colors shadow-sm active:scale-98"
      >
        <Play className="w-2.5 h-2.5 md:w-3 md:h-3 fill-current" />
        <span>Comenzar ({prediction})</span>
      </button>
    </div>
  );
}
