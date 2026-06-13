'use client';

import React, { useReducer, useState, useEffect } from 'react';
import { gameReducer, getInitialState } from '../lib/gameReducer';
import GameBoard from '../components/GameBoard';
import ObjectiveCard from '../components/ObjectiveCard';
import PredictionPanel from '../components/PredictionPanel';
import GameOverlay from '../components/GameOverlay';
import { Undo, RotateCcw } from 'lucide-react';

export default function GamePage() {
  const [state, dispatch] = useReducer(gameReducer, 0, getInitialState);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="min-h-screen bg-parchment-light" />;
  }


  const handleSetBasePrediction = (count: number) => {
    dispatch({ type: 'SET_BASE_PREDICTION', count });
  };

  const handleStartPlaying = () => {
    dispatch({ type: 'START_PLAYING' });
  };

  const handleSelectSquare = (index: number | null) => {
    dispatch({ type: 'SELECT_PIECE', index });
  };

  const handleMovePiece = (toIndex: number) => {
    dispatch({ type: 'MOVE_PIECE', toIndex });
  };

  const handleUndo = () => {
    dispatch({ type: 'UNDO_MOVE' });
  };

  const handleRestart = () => {
    dispatch({ type: 'RESTART_LEVEL' });
  };

  const handleNextLevel = () => {
    dispatch({ type: 'NEXT_LEVEL' });
  };

  const isPredicting = state.phase === 'PREDICTING';
  const modifierCost = state.rotations + (state.mirrorH ? 1 : 0) + (state.mirrorV ? 1 : 0);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-12 bg-parchment-light">
      
      {/* Clean Ultraminimalist Header */}
      <header className="text-center mb-8 md:mb-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-royal">
          The Royal Study
        </h1>
        <div className="flex items-center justify-center gap-2 mt-1.5 text-[10px] font-sans font-semibold text-accent-slate/60 uppercase tracking-wider">
          <span>Puzzle #{state.solvedCount + 1}</span>
          <span>•</span>
          <span className="text-gold-dark">Resueltos: {state.solvedCount}</span>
        </div>
      </header>

      {/* Main Grid: Responsive Columns */}
      <section className="flex flex-col md:flex-row items-center md:items-start justify-center gap-8 md:gap-16 w-full max-w-2xl">
        
        {/* Left column: Target & Prediction/Status Controls */}
        <div className="flex flex-col items-center gap-5 w-full max-w-[180px] sm:max-w-[200px]">
          <ObjectiveCard
            board={state.targetBoard}
            phase={state.phase}
            rotations={state.rotations}
            mirrorH={state.mirrorH}
            mirrorV={state.mirrorV}
            onRotate={() => dispatch({ type: 'ROTATE_TARGET' })}
            onToggleMirrorH={() => dispatch({ type: 'TOGGLE_MIRROR_HORIZONTAL' })}
            onToggleMirrorV={() => dispatch({ type: 'TOGGLE_MIRROR_VERTICAL' })}
          />

          {isPredicting ? (
            <PredictionPanel
              prediction={state.prediction}
              rotations={state.rotations}
              mirrorH={state.mirrorH}
              mirrorV={state.mirrorV}
              onSetBasePrediction={handleSetBasePrediction}
              onStartPlaying={handleStartPlaying}
            />
          ) : (
            /* Execution Status Controls */
            <div className="flex flex-col items-center w-full text-center mt-2.5">
              <div className="text-[10px] uppercase font-bold text-accent-slate/50 tracking-wider mb-1">
                Progreso
              </div>
              <div className="text-lg font-extrabold text-royal leading-none mb-1.5">
                Consumidos: <span className="text-gold-dark">{state.movesCount + modifierCost}</span> de {state.prediction}
              </div>
              <div className="text-[10px] text-accent-slate/60 font-medium mb-4">
                {state.movesCount} en tablero • {modifierCost} por modificar carta
              </div>
              
              <div className="flex gap-1.5 w-full">
                {/* Undo Button */}
                <button
                  onClick={handleUndo}
                  disabled={state.history.length <= 1}
                  className="flex items-center justify-center gap-1 flex-1 py-1.5 px-2.5 border border-parchment-dark text-royal bg-transparent hover:bg-parchment disabled:opacity-30 rounded-lg text-[11px] font-bold transition-colors"
                  title="Deshacer"
                >
                  <Undo className="w-3 h-3" />
                  <span>Deshacer</span>
                </button>
                
                {/* Restart Button */}
                <button
                  onClick={handleRestart}
                  className="flex items-center justify-center gap-1 flex-1 py-1.5 px-2.5 border border-parchment-dark text-royal bg-transparent hover:bg-parchment rounded-lg text-[11px] font-bold transition-colors"
                  title="Reiniciar"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reiniciar</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right column: Interactive Board */}
        <div className="flex flex-col items-center gap-3.5 w-full max-w-[260px] sm:max-w-[320px]">
          <GameBoard
            board={state.currentBoard}
            phase={state.phase}
            selectedSquare={state.selectedSquare}
            validMoves={state.validMoves}
            onSelectSquare={handleSelectSquare}
            onMovePiece={handleMovePiece}
          />
          
          <div className="text-[10px] text-center text-accent-slate/50 font-medium italic select-none">
            {isPredicting ? 'Calcula la solución mentalmente.' : 'Click para mover las piezas blancas.'}
          </div>
        </div>

      </section>

      {/* Overlays */}
      <GameOverlay
        phase={state.phase}
        movesCount={state.movesCount}
        modifierCost={modifierCost}
        prediction={state.prediction}
        isLastLevel={false}
        onRestart={handleRestart}
        onNextLevel={handleNextLevel}
      />
    </main>
  );
}
