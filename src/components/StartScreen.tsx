import React from 'react';
import { Play, Users, Github, Linkedin, HelpCircle } from 'lucide-react';
import { GameMode } from '../lib/gameReducer';

interface StartScreenProps {
  onSelectMode: (mode: GameMode) => void;
}

export default function StartScreen({ onSelectMode }: StartScreenProps) {
  return (
    <div className="flex flex-col items-center justify-between min-h-[100dvh] p-6 md:p-10 lg:p-12 bg-parchment-light w-full max-w-lg md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto text-center">
      
      {/* Center content container */}
      <div className="w-full flex-grow flex flex-col items-center justify-center gap-6 md:gap-8 lg:gap-10 my-auto">
        
        {/* Title Block */}
        <div>
          <h1 className="font-sans text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-royal">
            The Royal Study
          </h1>
          <p className="font-sans text-xs md:text-sm lg:text-base text-accent-slate/80 font-medium tracking-wide uppercase mt-2 md:mt-3">
            Un puzzle de ajedrez y lógica espacial
          </p>
        </div>

        {/* Game Rules / Description Card */}
        <div className="bg-white border border-parchment-dark p-6 md:p-8 rounded-2xl shadow-sm text-left w-full text-xs md:text-sm lg:text-base text-accent-slate leading-relaxed">
          <h2 className="font-sans text-sm md:text-base lg:text-lg font-bold text-royal mb-2 md:mb-3 flex items-center gap-1.5 md:gap-2">
            <HelpCircle className="w-4 h-4 md:w-5 md:h-5 text-gold-dark" />
            ¿Cómo jugar?
          </h2>
          <p className="mb-2 md:mb-3">
            El objetivo es reorganizar 5 piezas de ajedrez en un tablero de 3x3 para que coincidan con la <strong>Carta Objetivo</strong>.
          </p>
          <p className="mb-2 md:mb-3">
            Las piezas se mueven bajo las reglas clásicas del ajedrez, pero <strong>no hay capturas</strong> y las piezas aliadas bloquean el paso (excepto el Caballo, que salta).
          </p>
          <p>
            <strong>Fase de Predicción:</strong> Antes de mover, calcula mentalmente y define tu límite de movimientos. Alterar la carta objetivo (rotaciones o espejos) te dará la perspectiva adecuada, pero te <strong>penalizará consumiendo movimientos</strong> de tu límite.
          </p>
        </div>

        {/* Buttons Grid */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3.5 md:gap-6 w-full">
          {/* Solo Mode Button */}
          <button
            onClick={() => onSelectMode('SOLO')}
            className="flex items-center justify-center gap-2.5 py-3.5 px-6 md:py-4 md:px-8 w-full sm:w-auto sm:min-w-[220px] bg-royal text-white font-sans font-bold text-sm md:text-base lg:text-lg rounded-full hover:bg-royal-dark transition-all shadow-md hover:shadow-lg active:scale-98"
          >
            <Play className="w-4 h-4 md:w-5 md:h-5 fill-current" />
            <span>Modo Solitario</span>
          </button>

          {/* Local Multiplayer Mode Button */}
          <button
            onClick={() => onSelectMode('LOCAL_MULTIPLAYER')}
            className="flex items-center justify-center gap-2.5 py-3.5 px-6 md:py-4 md:px-8 w-full sm:w-auto sm:min-w-[220px] border border-parchment-dark text-royal bg-white font-sans font-bold text-sm md:text-base lg:text-lg rounded-full hover:bg-parchment-light transition-all shadow-sm hover:shadow active:scale-98"
          >
            <Users className="w-4 h-4 md:w-5 md:h-5" />
            <span>2 Jugadores (Local)</span>
          </button>
        </div>
      </div>

      {/* Footer / Social Links */}
      <footer className="w-full flex items-center justify-center gap-6 md:gap-8 text-accent-slate/50 mt-8 md:mt-10 pt-4 border-t border-parchment-dark/30">
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-royal transition-colors"
          title="GitHub"
        >
          <Github className="w-5 h-5 md:w-6 md:h-6" />
        </a>
        <a
          href="https://linkedin.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-royal transition-colors"
          title="LinkedIn"
        >
          <Linkedin className="w-5 h-5 md:w-6 md:h-6" />
        </a>
      </footer>

    </div>
  );
}
