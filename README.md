# 👑 The Royal Study

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](https://opensource.org/licenses/MIT)

**The Royal Study** es un sofisticado e interactivo puzzle de lógica espacial inspirado en las reglas de movimiento del ajedrez tradicional. Diseñado con una estética ultraminimalista y de alta gama, el juego desafía a los jugadores a reorganizar piezas reales en un tablero restringido de 3x3 para alcanzar configuraciones objetivo. 

Disponible para jugar en solitario o en modo multijugador local (2 jugadores) en el mismo dispositivo.

---

## 🤖 Desarrollo Impulsado por IA (Vibe Coding)

Este proyecto ha sido desarrollado al **100%** utilizando metodologías avanzadas de **Vibe Coding** (desarrollo asistido e iterado exclusivamente mediante prompts e IA).

- **Iteraciones:** Completado en **20 prompts** de desarrollo e iteración de UI/UX.
- **Herramientas:** Programado a través del entorno autónomo **Antigravity CLI** utilizando el modelo fundacional **Gemini 3.5 Flask (High)** de Google.
- **Agentes y Skills:** Se empleó un sistema de guías cognitivas y optimizaciones estructuradas (`.agents/skills/`) para garantizar los más altos estándares de diseño y desarrollo web:
  - `frontend-design`: Directrices de estética visual minimalista y paletas cromáticas premium.
  - `vercel-react-best-practices`: Optimización de rendimiento de React y Next.js.
  - `web-design-guidelines`: Aseguramiento de accesibilidad, responsividad (Mobile-First) y consistencia tipográfica.

---

## 🛠️ Stack Tecnológico

El proyecto está construido sobre tecnologías Frontend modernas y eficientes para garantizar un rendimiento óptimo y al mismo tiempo un diseño ligero:

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router & Server-Side Rendering optimizado).
- **Biblioteca UI:** [React](https://react.dev/) (Hooks personalizados, estados inmutables y reducers robustos).
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/) (Tipado estricto y seguro).
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/) (Diseño adaptativo, responsive en móviles y PC sin scrolls innecesarios).
- **Animaciones:** [Framer Motion](https://www.framer.com/motion/) (Transiciones fluidas de modales y overlays interactivos).
- **Iconografía:** [Lucide React](https://lucide.dev/) (Iconos minimalistas de trazo fino).

---

## 🎮 Modos de Juego

### 🧑‍💻 Modo Solitario (Solo)
- **Flujo Continuo:** El estado del tablero se conserva de una ronda a otra, lo que significa que el punto final de tu victoria anterior se convierte en el inicio del siguiente puzzle.
- **Fase de Predicción:** Antes de iniciar a mover las piezas, calcula mentalmente el camino más corto. Selecciona tu límite de movimientos previstos.
- **Rotación y Espejo:** Puedes rotar o reflejar la carta objetivo para obtener mejores ángulos de solución. Sin embargo, estas alteraciones **conllevan un coste de movimientos** que restará margen a tu límite.

### 👥 Modo 2 Jugadores (Local)
- **Fase de Apuestas (Bidding):** Los jugadores observan la carta objetivo. Uno de ellos lanza una predicción de movimientos mínimos necesarios.
- **Desafío a Contra Reloj (Hourglass Challenge):** Corre un temporizador de 15 segundos. El oponente tiene la oportunidad de arrebatar el turno si introduce una predicción menor (que a su vez respete el costo mínimo de alteración de la carta). Si lo hace, toma el control del tablero; si pasa o se agota el tiempo, el jugador original debe ejecutar su jugada.
- **Sistema de Puntuación:**
  - Si el jugador activo resuelve el tablero respetando el límite acordado, **gana 1 punto**.
  - Si excede la predicción o falla, **el oponente gana 1 punto**.
  - El primer jugador en alcanzar **6 puntos** se corona campeón.

---

## 🚀 Ejecución Local

Sigue estos sencillos pasos para clonar y ejecutar el juego de forma local en tu máquina:

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/the-royal-study.git
   cd the-royal-study/the_royal_study
   ```

2. **Instalar dependencias:**
   Este proyecto utiliza `pnpm` como gestor de paquetes. Si no lo tienes instalado, puedes obtenerlo globalmente con `npm install -g pnpm`.
   ```bash
   pnpm install
   ```

3. **Ejecutar el servidor de desarrollo:**
   ```bash
   pnpm dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver el juego en funcionamiento.

4. **Compilar para producción:**
   Si deseas construir el bundle de producción optimizado:
   ```bash
   pnpm build
   pnpm start
   ```

---

## 📄 Licencia y Código Abierto

Este proyecto es de código abierto y está disponible bajo los términos de la **[Licencia MIT](LICENSE)**. Puedes modificarlo, distribuirlo y utilizarlo de forma libre y gratuita para tus propios fines comerciales o de aprendizaje.