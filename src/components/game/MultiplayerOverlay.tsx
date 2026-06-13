import React from 'react';
import { Trophy, Hourglass } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GamePhase } from '../../types';
import { fadeVariants, modalVariants, modalTransition } from '../../lib/animations';

interface MultiplayerOverlayProps {
  isMounted: boolean;
  isMultiplayer: boolean;
  phase: GamePhase;
  scores: { p1: number; p2: number };
  onNextRound: () => void;
  onResetMatch: () => void;
  onGoToMenu: () => void;
}

export default function MultiplayerOverlay({
  isMounted,
  isMultiplayer,
  phase,
  scores,
  onNextRound,
  onResetMatch,
  onGoToMenu,
}: MultiplayerOverlayProps) {
  const isOverlayVisible = isMounted && isMultiplayer && (phase === 'ROUND_OVER' || phase === 'MATCH_OVER');

  return (
    <AnimatePresence>
      {isOverlayVisible && (
        <motion.div
          variants={fadeVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center bg-royal-dark/60 backdrop-blur-sm p-4"
        >
          <motion.div
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={modalTransition}
            className="bg-white border border-parchment-dark p-6 md:p-8 rounded-2xl w-full max-w-[280px] md:max-w-[340px] lg:max-w-[380px] text-center relative overflow-hidden"
          >
            {/* Top Accent Strip */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gold" />

            {phase === 'ROUND_OVER' && (
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
                  <strong className="text-royal font-extrabold">J1 ({scores.p1}) — J2 ({scores.p2})</strong>
                </p>

                <button
                  onClick={onNextRound}
                  className="flex items-center justify-center gap-1.5 md:gap-2.5 py-2.5 px-6 md:text-sm lg:text-base bg-gold text-white font-sans font-bold text-xs rounded-full hover:bg-gold-dark transition-colors w-full shadow-sm active:scale-98"
                >
                  <span>Siguiente Ronda</span>
                  <Hourglass className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </button>
              </>
            )}

            {phase === 'MATCH_OVER' && (
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
                  El jugador <strong className="text-royal font-extrabold">{scores.p1 >= 6 ? 'Jugador 1' : 'Jugador 2'}</strong> ha ganado la partida al llegar a 6 puntos.
                  <br />
                  <span className="block text-[10px] md:text-xs lg:text-sm text-accent-slate/60 mt-1">
                    Marcador Final: {scores.p1} — {scores.p2}
                  </span>
                </p>

                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={onResetMatch}
                    className="flex items-center justify-center gap-1.5 md:gap-2.5 py-2.5 px-6 md:text-sm lg:text-base bg-gold text-white font-sans font-bold text-xs rounded-full hover:bg-gold-dark transition-colors w-full shadow-sm active:scale-98"
                  >
                    <span>Volver a Jugar</span>
                  </button>
                  <button
                    onClick={onGoToMenu}
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
  );
}
