'use client';

import React, { useReducer, useState, useEffect } from 'react';
import { gameReducer, getInitialState, getModifierCost } from '../lib/gameReducer';
import { levels } from '../lib/levels';
import GameBoard from '../components/GameBoard';
import ObjectiveCard from '../components/ObjectiveCard';
import PredictionPanel from '../components/PredictionPanel';
import GameOverlay from '../components/GameOverlay';
import StartScreen from '../components/StartScreen';
import { Undo, RotateCcw, Shield, Hourglass, Trophy, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GamePage() {
  const [state, dispatch] = useReducer(gameReducer, 0, getInitialState);
  const [isMounted, setIsMounted] = useState(false);
  const modifierCost = getModifierCost(state.rotations, state.mirrorH, state.mirrorV);
  
  // Local multiplayer countdown timer
  const [timeLeft, setTimeLeft] = useState(15);
  // Challenger bid state
  const [challengeBid, setChallengeBid] = useState(3);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync challenge bid value when prediction decreases or enters challenge phase
  useEffect(() => {
    if (state.phase === 'CHALLENGING') {
      setChallengeBid(Math.max(modifierCost + 1, state.prediction - 1));
    }
  }, [state.prediction, state.phase, modifierCost]);

  // Handle local multiplayer CHALLENGING countdown
  useEffect(() => {
    if (state.phase !== 'CHALLENGING') {
      setTimeLeft(15);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          dispatch({ type: 'PASS_CHALLENGE' });
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.phase]);

  if (!isMounted) {
    return <div className="min-h-screen bg-parchment-light" />;
  }

  // Render Start screen if in menu mode
  if (state.gameMode === 'MENU') {
    return (
      <StartScreen 
        onSelectMode={(mode) => dispatch({ type: 'SELECT_MODE', mode })} 
      />
    );
  }

  const isPredicting = state.phase === 'PREDICTING';
  const isMultiplayer = state.gameMode === 'LOCAL_MULTIPLAYER';

  // Solo mode handlers
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

  const handleGoToMenu = () => {
    dispatch({ type: 'SELECT_MODE', mode: 'MENU' });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-8 lg:p-12 bg-parchment-light relative">
      
      {/* Top Controls Bar */}
      <div className="w-full max-w-2xl md:max-w-4xl lg:max-w-5xl flex justify-between items-center mb-6 md:mb-10 border-b border-parchment-dark/30 pb-3 md:pb-4">
        {/* Solitaire vs Multiplayer Label */}
        <div className="flex items-center gap-2 md:gap-3.5">
          <button
            onClick={handleGoToMenu}
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
        {isMultiplayer ? (
          <div className="flex items-center gap-3 md:gap-5 text-xs md:text-sm lg:text-base font-sans font-bold">
            <span className={state.activePlayer === 1 ? 'text-royal underline decoration-gold decoration-2 underline-offset-4' : 'text-accent-slate/60'}>
              J1: {state.scores.p1}
            </span>
            <span className="text-accent-slate/40">•</span>
            <span className={state.activePlayer === 2 ? 'text-royal underline decoration-gold decoration-2 underline-offset-4' : 'text-accent-slate/60'}>
              J2: {state.scores.p2}
            </span>
            <span className="text-[9px] md:text-[11px] lg:text-xs px-1.5 py-0.5 md:px-2.5 md:py-1 bg-royal text-white rounded">Meta: 6</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-xs lg:text-sm font-sans font-semibold text-accent-slate/60 uppercase tracking-wider">
            <span>Puzzle #{state.solvedCount + 1}</span>
            <span>•</span>
            <span className="text-gold-dark">Resueltos: {state.solvedCount}</span>
          </div>
        )}
      </div>

      {/* Main Grid: Responsive Columns */}
      <section className="flex flex-col md:flex-row items-center md:items-start justify-center gap-8 md:gap-16 lg:gap-24 w-full max-w-2xl md:max-w-4xl lg:max-w-5xl flex-grow my-auto">
        
        {/* Left column: Target & Prediction/Status Controls */}
        <div className="flex flex-col items-center gap-5 md:gap-7 lg:gap-9 w-full max-w-[180px] sm:max-w-[200px] md:max-w-[240px] lg:max-w-[280px]">
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

          {/* Render Mode specific Bidding/Challenge panels or standard Solo panels */}
          {isMultiplayer ? (
            /* MULTIPLAYER CONTROLS */
            <div className="w-full flex flex-col items-center text-center mt-1 md:mt-2.5">
              {state.phase === 'BIDDING' && (
                <div className="flex flex-col items-center w-full">
                  <h4 className="text-xs md:text-sm lg:text-base font-bold text-royal mb-0.5 md:mb-1">Apuesta</h4>
                  <p className="text-[9px] md:text-[11px] lg:text-xs text-accent-slate/60 mb-3 md:mb-4">
                    Jugador {state.biddingPlayer}, define tu predicción.
                  </p>
                  
                  {/* Predict Adjuster */}
                  <div className="flex items-center gap-3 md:gap-4.5 mb-3.5 md:mb-5">
                    <button
                      onClick={() => handleSetBasePrediction(state.prediction - 1)}
                      disabled={state.prediction <= modifierCost + 1}
                      className="flex items-center justify-center w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 rounded-full border border-parchment-dark text-royal bg-transparent disabled:opacity-30 hover:bg-parchment transition-all"
                    >
                      -
                    </button>
                    <span className="font-sans text-xl md:text-2xl lg:text-3xl font-extrabold text-royal">{state.prediction}</span>
                    <button
                      onClick={() => handleSetBasePrediction(state.prediction + 1)}
                      className="flex items-center justify-center w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 rounded-full border border-parchment-dark text-royal bg-transparent hover:bg-parchment transition-all"
                    >
                      +
                    </button>
                  </div>

                  {/* Cost Info */}
                  {modifierCost > 0 && (
                    <div className="text-[9px] md:text-[11px] lg:text-xs text-accent-slate/70 mb-3 md:mb-3.5 font-medium leading-relaxed">
                      Penalización: {modifierCost} movs. • Mínimo: {modifierCost + 1}
                    </div>
                  )}
                  
                  <button
                    onClick={() => dispatch({ type: 'START_CHALLENGE', prediction: state.prediction })}
                    className="py-1 px-4 md:py-2 md:px-6 bg-royal text-white font-sans font-semibold text-[10px] md:text-xs lg:text-sm rounded-full hover:bg-royal-dark transition-colors w-full shadow-sm active:scale-98"
                  >
                    Fijar Apuesta
                  </button>
                </div>
              )}

              {state.phase === 'CHALLENGING' && (
                <div className="flex flex-col items-center w-full">
                  <div className="flex items-center gap-1 text-[10px] md:text-xs lg:text-sm font-bold text-accent-rose mb-1 md:mb-1.5">
                    <Hourglass className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin" />
                    <span>Desafío: {timeLeft}s</span>
                  </div>
                  <p className="text-[9px] md:text-[11px] lg:text-xs text-accent-slate/75 mb-3 md:mb-4 leading-relaxed">
                    Jugador {3 - state.biddingPlayer}, ¿puedes resolverlo en MENOS de {state.prediction} movimientos?
                  </p>

                  {/* Challenge Adjuster */}
                  <div className="flex items-center gap-3 md:gap-4.5 mb-3.5 md:mb-5">
                    <button
                      onClick={() => setChallengeBid(prev => Math.max(modifierCost + 1, prev - 1))}
                      disabled={challengeBid <= modifierCost + 1}
                      className="flex items-center justify-center w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 rounded-full border border-parchment-dark text-royal bg-transparent disabled:opacity-30 hover:bg-parchment transition-all"
                    >
                      -
                    </button>
                    <span className="font-sans text-xl md:text-2xl lg:text-3xl font-extrabold text-royal">{challengeBid}</span>
                    <button
                      onClick={() => setChallengeBid(prev => Math.min(state.prediction - 1, prev + 1))}
                      disabled={challengeBid >= state.prediction - 1}
                      className="flex items-center justify-center w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 rounded-full border border-parchment-dark text-royal bg-transparent disabled:opacity-30 hover:bg-parchment transition-all"
                    >
                      +
                    </button>
                  </div>

                  {/* Cost Info */}
                  {modifierCost > 0 && (
                    <div className="text-[9px] md:text-[11px] lg:text-xs text-accent-slate/70 mb-3 md:mb-3.5 font-medium leading-relaxed">
                      Penalización: {modifierCost} movs. • Mínimo: {modifierCost + 1}
                    </div>
                  )}

                  <div className="flex gap-1.5 md:gap-2.5 w-full">
                    <button
                      onClick={() => dispatch({ type: 'SUBMIT_CHALLENGE', prediction: challengeBid })}
                      disabled={challengeBid >= state.prediction || challengeBid < modifierCost + 1}
                      className="flex-1 py-1.5 md:py-2.5 bg-royal text-white font-sans font-semibold text-[10px] md:text-xs lg:text-sm rounded-full disabled:opacity-40 shadow-sm transition-colors active:scale-98"
                    >
                      Desafiar
                    </button>
                    <button
                      onClick={() => dispatch({ type: 'PASS_CHALLENGE' })}
                      className="flex-1 py-1.5 md:py-2.5 border border-parchment-dark text-royal bg-transparent hover:bg-parchment font-sans font-semibold text-[10px] md:text-xs lg:text-sm rounded-full transition-colors active:scale-98"
                    >
                      Pasar
                    </button>
                  </div>
                </div>
              )}

              {state.phase === 'PLAYING' && (
                /* Multiplayer Play execution panel */
                <div className="flex flex-col items-center w-full">
                  <div className="text-[9px] md:text-[11px] lg:text-xs uppercase font-bold text-accent-slate/50 tracking-wider mb-0.5 md:mb-1">
                    Turno Jugador {state.activePlayer}
                  </div>
                  <div className="text-base md:text-lg lg:text-xl font-extrabold text-royal leading-none mb-1.5 md:mb-2">
                    Consumidos: <span className="text-gold-dark">{state.movesCount + modifierCost}</span> de {state.prediction}
                  </div>
                  <div className="text-[9px] md:text-[11px] lg:text-xs text-accent-slate/60 font-medium mb-3.5 md:mb-5">
                    {state.movesCount} en tablero • {modifierCost} por carta
                  </div>
                  
                  <div className="flex gap-1 md:gap-2.5 w-full">
                    <button
                      onClick={handleUndo}
                      disabled={state.history.length <= 1}
                      className="flex items-center justify-center gap-1 flex-1 py-1.5 md:py-2.5 border border-parchment-dark text-royal bg-transparent disabled:opacity-30 rounded-lg text-[10px] md:text-xs lg:text-sm font-bold hover:bg-parchment transition-colors active:scale-98"
                    >
                      <Undo className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
                      <span>Deshacer</span>
                    </button>
                    <button
                      onClick={handleRestart}
                      className="flex items-center justify-center gap-1 flex-1 py-1.5 md:py-2.5 border border-parchment-dark text-royal bg-transparent rounded-lg text-[10px] md:text-xs lg:text-sm font-bold hover:bg-parchment transition-colors active:scale-98"
                    >
                      <RotateCcw className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
                      <span>Reiniciar</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* SOLO CONTROLS */
            isPredicting ? (
              <PredictionPanel
                prediction={state.prediction}
                rotations={state.rotations}
                mirrorH={state.mirrorH}
                mirrorV={state.mirrorV}
                onSetBasePrediction={handleSetBasePrediction}
                onStartPlaying={handleStartPlaying}
              />
            ) : (
              <div className="flex flex-col items-center w-full text-center mt-2.5 md:mt-4">
                <div className="text-[10px] md:text-xs lg:text-sm uppercase font-bold text-accent-slate/50 tracking-wider mb-1 md:mb-1.5">
                  Progreso
                </div>
                <div className="text-lg md:text-xl lg:text-2xl font-extrabold text-royal leading-none mb-1.5 md:mb-2">
                  Consumidos: <span className="text-gold-dark">{state.movesCount + modifierCost}</span> de {state.prediction}
                </div>
                <div className="text-[10px] md:text-xs lg:text-sm text-accent-slate/60 font-medium mb-4 md:mb-5">
                  {state.movesCount} en tablero • {modifierCost} por modificar carta
                </div>
                
                <div className="flex gap-1.5 md:gap-2.5 w-full">
                  <button
                    onClick={handleUndo}
                    disabled={state.history.length <= 1}
                    className="flex items-center justify-center gap-1 flex-1 py-1.5 px-2.5 md:py-2.5 md:px-4 border border-parchment-dark text-royal bg-transparent hover:bg-parchment disabled:opacity-30 rounded-lg text-[11px] md:text-xs lg:text-sm font-bold transition-colors active:scale-98"
                  >
                    <Undo className="w-3 h-3 md:w-4 md:h-4" />
                    <span>Deshacer</span>
                  </button>
                  
                  <button
                    onClick={handleRestart}
                    className="flex items-center justify-center gap-1 flex-1 py-1.5 px-2.5 md:py-2.5 md:px-4 border border-parchment-dark text-royal bg-transparent hover:bg-parchment rounded-lg text-[11px] md:text-xs lg:text-sm font-bold transition-colors active:scale-98"
                  >
                    <RotateCcw className="w-3 h-3 md:w-4 md:h-4" />
                    <span>Reiniciar</span>
                  </button>
                </div>
              </div>
            )
          )}
        </div>

        {/* Right column: Interactive Board */}
        <div className="flex flex-col items-center gap-3.5 md:gap-5 lg:gap-7 w-full max-w-[260px] sm:max-w-[320px] md:max-w-[400px] lg:max-w-[480px]">
          <GameBoard
            board={state.currentBoard}
            phase={state.phase}
            selectedSquare={state.selectedSquare}
            validMoves={state.validMoves}
            onSelectSquare={handleSelectSquare}
            onMovePiece={handleMovePiece}
          />
          
          <div className="text-[10px] md:text-xs lg:text-sm text-center text-accent-slate/50 font-medium italic select-none mt-2 md:mt-3">
            {state.phase === 'BIDDING' || state.phase === 'CHALLENGING'
              ? 'Analiza las piezas en silencio.'
              : `Turno de ejecución: piezas blancas.`}
          </div>
        </div>

      </section>

      {/* MULTIPLAYER OVERLAY MODALS */}
      <AnimatePresence>
        {isMultiplayer && (state.phase === 'ROUND_OVER' || state.phase === 'MATCH_OVER') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-royal-dark/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="bg-white border border-parchment-dark p-6 md:p-8 rounded-2xl w-full max-w-[280px] md:max-w-[340px] lg:max-w-[380px] text-center relative overflow-hidden"
            >
              {/* Top Accent Strip */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gold" />

              {state.phase === 'ROUND_OVER' && (
                <>
                  <div className="flex justify-center mb-4 mt-2">
                    <div className="flex items-center justify-center w-11 h-11 md:w-14 md:h-14 rounded-full bg-gold/10 text-gold border border-gold/20">
                      <Trophy className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                  </div>

                  <h2 className="font-sans text-base md:text-lg lg:text-xl font-bold text-royal mb-1.5">
                    Fin de la Ronda
                  </h2>

                  <p className="font-sans text-[11px] md:text-xs lg:text-sm text-accent-slate/85 mb-4 md:mb-5 leading-relaxed">
                    Marcador Actual: <br />
                    <strong className="text-royal font-extrabold">J1 ({state.scores.p1}) — J2 ({state.scores.p2})</strong>
                  </p>

                  <button
                    onClick={() => dispatch({ type: 'NEXT_ROUND' })}
                    className="flex items-center justify-center gap-1.5 md:gap-2.5 py-2.5 px-6 md:text-sm lg:text-base bg-gold text-white font-sans font-bold text-xs rounded-full hover:bg-gold-dark transition-colors w-full shadow-sm active:scale-98"
                  >
                    <span>Siguiente Ronda</span>
                    <Hourglass className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </button>
                </>
              )}

              {state.phase === 'MATCH_OVER' && (
                <>
                  <div className="flex justify-center mb-4 mt-2">
                    <div className="flex items-center justify-center w-11 h-11 md:w-14 md:h-14 rounded-full bg-gold/10 text-gold border border-gold/20 animate-bounce">
                      <Trophy className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                  </div>

                  <h2 className="font-sans text-base md:text-lg lg:text-xl font-bold text-royal mb-1.5">
                    ¡Tenemos un Ganador!
                  </h2>

                  <p className="font-sans text-[11px] md:text-xs lg:text-sm text-accent-slate/85 mb-5 md:mb-6 leading-relaxed">
                    El jugador <strong className="text-royal font-extrabold">{state.scores.p1 >= 6 ? 'Jugador 1' : 'Jugador 2'}</strong> ha ganado la partida al llegar a 6 puntos.
                    <br />
                    <span className="block text-[10px] md:text-xs lg:text-sm text-accent-slate/60 mt-1">
                      Marcador Final: {state.scores.p1} — {state.scores.p2}
                    </span>
                  </p>

                  <div className="flex flex-col gap-1.5">
                    <button
                      onClick={() => dispatch({ type: 'RESET_MATCH' })}
                      className="flex items-center justify-center gap-1.5 md:gap-2.5 py-2.5 px-6 md:text-sm lg:text-base bg-gold text-white font-sans font-bold text-xs rounded-full hover:bg-gold-dark transition-colors w-full shadow-sm active:scale-98"
                    >
                      <span>Volver a Jugar</span>
                    </button>
                    <button
                      onClick={handleGoToMenu}
                      className="py-2.5 border border-parchment-dark text-royal bg-transparent font-sans font-semibold text-[11px] md:text-xs lg:text-sm rounded-full hover:bg-parchment-light transition-colors active:scale-98"
                    >
                      Salir al Menú
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SOLO OVERLAY MODALS */}
      {!isMultiplayer && (
        <GameOverlay
          phase={state.phase}
          movesCount={state.movesCount}
          modifierCost={modifierCost}
          prediction={state.prediction}
          isLastLevel={false}
          onRestart={handleRestart}
          onNextLevel={handleNextLevel}
        />
      )}
    </main>
  );
}
