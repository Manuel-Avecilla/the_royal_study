import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, AlertTriangle, RotateCcw, ArrowRight } from 'lucide-react';
import { GamePhase } from '../lib/gameReducer';
import { useAudio } from '../hooks/useAudio';

interface GameOverlayProps {
  phase: GamePhase;
  movesCount: number;
  modifierCost: number;
  prediction: number;
  isLastLevel: boolean;
  onRestart: () => void;
  onNextLevel: () => void;
}

export default function GameOverlay({
  phase,
  movesCount,
  modifierCost,
  prediction,
  isLastLevel,
  onRestart,
  onNextLevel,
}: GameOverlayProps) {
  const isVisible = phase === 'WON' || phase === 'LOST';
  const isWon = phase === 'WON';

  const { play: playWin } = useAudio('/assets/win.wav');
  const { play: playLose } = useAudio('/assets/lose.wav');

  useEffect(() => {
    if (phase === 'WON') {
      playWin();
    } else if (phase === 'LOST') {
      playLose();
    }
  }, [phase, playWin, playLose]);

  return (
    <AnimatePresence>
      {isVisible && (
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
            className="bg-white border border-parchment-dark p-6 rounded-2xl w-full max-w-[280px] text-center relative overflow-hidden"
          >
            {/* Top Accent Strip */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 ${isWon ? 'bg-gold' : 'bg-accent-rose'}`} />

            {/* Header Icon */}
            <div className="flex justify-center mb-4 mt-2">
              {isWon ? (
                <div className="flex items-center justify-center w-11 h-11 rounded-full bg-gold/10 text-gold border border-gold/20">
                  <Trophy className="w-5 h-5" />
                </div>
              ) : (
                <div className="flex items-center justify-center w-11 h-11 rounded-full bg-accent-rose/10 text-accent-rose border border-accent-rose/20">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              )}
            </div>

            {/* Title */}
            <h2 className="font-sans text-base md:text-lg lg:text-xl font-bold text-royal mb-1.5">
              {isWon ? '¡Victoria Real!' : 'Límite Superado'}
            </h2>
            
            {/* Description */}
            <p className="font-sans text-[11px] text-accent-slate/85 mb-5 leading-relaxed px-1">
              {isWon ? (
                <>
                  ¡Completado en <strong className="text-royal font-bold">{movesCount + modifierCost}</strong> movimientos! 
                  <span className="block text-[10px] text-accent-slate/60 mt-1 font-medium">
                    ({movesCount} piezas + {modifierCost} carta)
                  </span>
                </>
              ) : (
                <>
                  Has consumido tu límite de <strong className="text-royal font-bold">{prediction}</strong> movimientos. 
                  <span className="block text-[10px] text-accent-slate/60 mt-1 font-medium">
                    (Las penalizaciones de la carta también cuentan)
                  </span>
                </>
              )}
            </p>

            {/* Primary Action Button */}
            {isWon ? (
              <button
                onClick={onNextLevel}
                className="flex items-center justify-center gap-1.5 py-2 px-4 bg-gold text-white font-sans font-bold text-xs rounded-full hover:bg-gold-dark transition-colors w-full shadow-sm"
              >
                <span>{isLastLevel ? 'Reiniciar Juego' : 'Siguiente Nivel'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onRestart}
                className="flex items-center justify-center gap-1.5 py-2 px-4 bg-royal text-white font-sans font-bold text-xs rounded-full hover:bg-royal-dark transition-colors w-full shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reintentar Estudio</span>
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
