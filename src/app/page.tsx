'use client';

import React from 'react';
import { useGameSession } from '../hooks/useGameSession';
import GameBoard from '../components/GameBoard';
import ObjectiveCard from '../components/ObjectiveCard';
import PredictionPanel from '../components/PredictionPanel';
import GameOverlay from '../components/GameOverlay';
import StartScreen from '../components/StartScreen';
import GameHeader from '../components/game/GameHeader';
import MultiplayerBiddingPanel from '../components/game/MultiplayerBiddingPanel';
import MultiplayerChallengePanel from '../components/game/MultiplayerChallengePanel';
import MultiplayerPlayingPanel from '../components/game/MultiplayerPlayingPanel';
import SoloPlayingPanel from '../components/game/SoloPlayingPanel';
import MultiplayerOverlay from '../components/game/MultiplayerOverlay';

export default function GamePage() {
  const {
    state,
    dispatch,
    isMounted,
    modifierCost,
    timeLeft,
    challengeBid,
    setChallengeBid,
    handlers,
  } = useGameSession();

  // Render Start screen if in menu mode (this runs immediately on server/hydration)
  if (state.gameMode === 'MENU') {
    return (
      <StartScreen 
        onSelectMode={handlers.handleSelectMode} 
      />
    );
  }

  const isPredicting = state.phase === 'PREDICTING';
  const isMultiplayer = state.gameMode === 'LOCAL_MULTIPLAYER';

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-2.5 md:p-8 lg:p-12 bg-parchment-light relative">
      
      {/* Top Controls Bar */}
      <GameHeader
        isMultiplayer={isMultiplayer}
        isMounted={isMounted}
        activePlayer={state.activePlayer}
        scores={state.scores}
        solvedCount={state.solvedCount}
        onGoToMenu={handlers.handleGoToMenu}
      />

      {/* Main Grid: Responsive Columns */}
      <section className="flex flex-col md:flex-row items-center md:items-start justify-center gap-2 md:gap-16 lg:gap-24 w-full max-w-2xl md:max-w-4xl lg:max-w-5xl flex-grow my-auto">
        
        {/* Left column: Target & Prediction/Status Controls */}
        <div className="flex flex-col items-center gap-1.5 md:gap-7 lg:gap-9 w-full max-w-[300px] md:max-w-[300px] lg:max-w-[320px]">
          {isMounted ? (
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
          ) : (
            <div className="w-full aspect-square bg-parchment-dark/10 animate-pulse rounded-lg flex flex-col items-center justify-center border border-parchment-dark/30">
              <span className="text-[10px] font-sans font-semibold text-accent-slate/40 uppercase tracking-widest">Objetivo</span>
            </div>
          )}

          {/* Render Mode specific Bidding/Challenge panels or standard Solo panels */}
          {isMounted ? (
            isMultiplayer ? (
              <div className="w-full flex flex-col items-center text-center mt-1 md:mt-2">
                {state.phase === 'BIDDING' && (
                  <MultiplayerBiddingPanel
                    biddingPlayer={state.biddingPlayer}
                    prediction={state.prediction}
                    modifierCost={modifierCost}
                    onSetBasePrediction={handlers.handleSetBasePrediction}
                    onStartChallenge={handlers.handleStartChallenge}
                  />
                )}

                {state.phase === 'CHALLENGING' && (
                  <MultiplayerChallengePanel
                    biddingPlayer={state.biddingPlayer}
                    prediction={state.prediction}
                    modifierCost={modifierCost}
                    timeLeft={timeLeft}
                    challengeBid={challengeBid}
                    setChallengeBid={setChallengeBid}
                    onSubmitChallenge={handlers.handleSubmitChallenge}
                    onPassChallenge={handlers.handlePassChallenge}
                  />
                )}

                {state.phase === 'PLAYING' && (
                  <MultiplayerPlayingPanel
                    activePlayer={state.activePlayer}
                    movesCount={state.movesCount}
                    prediction={state.prediction}
                    modifierCost={modifierCost}
                    historyLength={state.history.length}
                    onUndo={handlers.handleUndo}
                    onRestart={handlers.handleRestart}
                  />
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
                  onSetBasePrediction={handlers.handleSetBasePrediction}
                  onStartPlaying={handlers.handleStartPlaying}
                />
              ) : (
                <SoloPlayingPanel
                  movesCount={state.movesCount}
                  prediction={state.prediction}
                  modifierCost={modifierCost}
                  historyLength={state.history.length}
                  onUndo={handlers.handleUndo}
                  onRestart={handlers.handleRestart}
                />
              )
            )
          ) : (
            <div className="w-full h-24 bg-parchment-dark/10 animate-pulse rounded-lg" />
          )}
        </div>

        {/* Right column: Interactive Board */}
        <div className="flex flex-col items-center gap-1.5 md:gap-5 lg:gap-7 w-full max-w-[260px] sm:max-w-[320px] md:max-w-[400px] lg:max-w-[480px]">
          {isMounted ? (
            <GameBoard
              board={state.currentBoard}
              phase={state.phase}
              selectedSquare={state.selectedSquare}
              validMoves={state.validMoves}
              onSelectSquare={handlers.handleSelectSquare}
              onMovePiece={handlers.handleMovePiece}
            />
          ) : (
            <div className="w-full aspect-square bg-parchment-dark/15 animate-pulse rounded-xl border border-parchment-dark/30" />
          )}
          
          <div className="text-[10px] md:text-xs lg:text-sm text-center text-accent-slate/50 font-medium italic select-none mt-1 md:mt-3">
            {isMounted ? (
              state.phase === 'BIDDING' || state.phase === 'CHALLENGING'
                ? 'Analiza las piezas en silencio.'
                : `Turno de ejecución: piezas blancas.`
            ) : (
              'Cargando tablero real...'
            )}
          </div>
        </div>

      </section>

      {/* MULTIPLAYER OVERLAY MODALS */}
      <MultiplayerOverlay
        isMounted={isMounted}
        isMultiplayer={isMultiplayer}
        phase={state.phase}
        scores={state.scores}
        onNextRound={handlers.handleNextRound}
        onResetMatch={handlers.handleResetMatch}
        onGoToMenu={handlers.handleGoToMenu}
      />

      {/* SOLO OVERLAY MODALS */}
      {isMounted && !isMultiplayer && (
        <GameOverlay
          phase={state.phase}
          movesCount={state.movesCount}
          modifierCost={modifierCost}
          prediction={state.prediction}
          isLastLevel={false}
          onRestart={handlers.handleRestart}
          onNextLevel={handlers.handleNextLevel}
        />
      )}
    </main>
  );
}
