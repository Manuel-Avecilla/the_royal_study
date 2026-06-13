import { useReducer, useState, useEffect } from 'react';
import { gameReducer, getInitialState, getModifierCost } from '../lib/gameReducer';
import { GameMode, GameState, GamePhase } from '../types';
import { MULTIPLAYER_TIMER_SECONDS } from '../constants/game';

export function useGameSession() {
  const [state, dispatch] = useReducer(gameReducer, 0, getInitialState);
  const [isMounted, setIsMounted] = useState(false);
  const modifierCost = getModifierCost(state.rotations, state.mirrorH, state.mirrorV);
  
  // Local multiplayer countdown timer
  const [timeLeft, setTimeLeft] = useState(MULTIPLAYER_TIMER_SECONDS);
  // Challenger bid state
  const [challengeBid, setChallengeBid] = useState(3);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync challenge bid value when prediction decreases or enters challenge phase
  useEffect(() => {
    if (state.phase === 'CHALLENGING') {
      setChallengeBid(Math.max(1, state.prediction - 1));
    }
  }, [state.prediction, state.phase]);

  // Handle local multiplayer CHALLENGING countdown
  useEffect(() => {
    if (state.phase !== 'CHALLENGING') {
      setTimeLeft(MULTIPLAYER_TIMER_SECONDS);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          dispatch({ type: 'PASS_CHALLENGE' });
          return MULTIPLAYER_TIMER_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.phase]);

  // Handler wrappers
  const handleSelectMode = (mode: GameMode) => {
    dispatch({ type: 'SELECT_MODE', mode });
  };

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

  const handleStartChallenge = (prediction: number) => {
    dispatch({ type: 'START_CHALLENGE', prediction });
  };

  const handleSubmitChallenge = (prediction: number) => {
    dispatch({ type: 'SUBMIT_CHALLENGE', prediction });
  };

  const handlePassChallenge = () => {
    dispatch({ type: 'PASS_CHALLENGE' });
  };

  const handleNextRound = () => {
    dispatch({ type: 'NEXT_ROUND' });
  };

  const handleResetMatch = () => {
    dispatch({ type: 'RESET_MATCH' });
  };

  return {
    state,
    dispatch,
    isMounted,
    modifierCost,
    timeLeft,
    challengeBid,
    setChallengeBid,
    handlers: {
      handleSelectMode,
      handleSetBasePrediction,
      handleStartPlaying,
      handleSelectSquare,
      handleMovePiece,
      handleUndo,
      handleRestart,
      handleNextLevel,
      handleGoToMenu,
      handleStartChallenge,
      handleSubmitChallenge,
      handlePassChallenge,
      handleNextRound,
      handleResetMatch,
    },
  };
}
