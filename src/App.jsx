/**
 * App.jsx — Orquestador. Une el estado (reducer + reloj) con dos capas
 * totalmente independientes:
 *
 *   ┌──────────────────────────────────────────┐
 *   │  capa UI (HTML/CSS, z-index alto)        │  ← src/ui/*
 *   │  Start · Infografía · HUD · Modales · Fin │
 *   ├──────────────────────────────────────────┤
 *   │  capa 3D (<Canvas>, z-index 0)           │  ← src/scene/*
 *   └──────────────────────────────────────────┘
 *
 * La escena 3D NUNCA importa componentes de UI y viceversa: sólo se
 * comunican mediante props (`items`, `interactive`, `onSelect`).
 */
import { lazy, Suspense, useCallback, useEffect, useReducer } from 'react';
import { gameReducer, createInitialState } from './game/gameReducer.js';
import { useCountdown } from './game/useCountdown.js';
import { GAME_DURATION_S, PAUSE_TIMER_ON_MODAL, TRASH_ITEMS } from './game/config.js';

import StartScreen from './ui/StartScreen.jsx';
import Infographic from './ui/Infographic.jsx';
import HUD from './ui/HUD.jsx';
import QuestionModal from './ui/QuestionModal.jsx';
import BinPicker from './ui/BinPicker.jsx';
import ResultsScreen from './ui/ResultsScreen.jsx';
import LoadingOverlay from './ui/LoadingOverlay.jsx';

// Code-splitting: three.js (~600 KB) no bloquea la portada. Se empieza a
// descargar al pulsar "Iniciar" y termina mientras el alumno lee la infografía.
const Experience = lazy(() => import('./scene/Experience.jsx'));

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, undefined, () => createInitialState());
  const { phase, active, score, items, toasts, runId } = state;

  const playing = phase === 'playing';
  const modalOpen = playing && active !== null;

  const timer = useCountdown({
    durationS: GAME_DURATION_S,
    running: playing,
    paused: PAUSE_TIMER_ON_MODAL && modalOpen,
    onExpire: () => dispatch({ type: 'TIME_UP' }),
  });

  // Nota: si el alumno cambia de pestaña, el reloj sigue corriendo (como en un
  // examen). Al volver, el deadline muestra el tiempo real sin desfase.

  // Callbacks estables: el HUD re-renderiza cada 250 ms por el reloj; si el
  // callback cambiara de identidad, los timeouts de los toasts se reiniciarían.
  const dismissToast = useCallback((id) => dispatch({ type: 'DISMISS_TOAST', id }), []);
  const selectItem = useCallback((itemId) => dispatch({ type: 'SELECT_ITEM', itemId }), []);

  const restart = useCallback(() => {
    timer.reset();
    dispatch({ type: 'RESTART' });
  }, [timer.reset]);

  // Teclado: Esc cierra la pregunta si aún no se respondió
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && dispatch({ type: 'CANCEL' });
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const activeItem = active ? TRASH_ITEMS.find((i) => i.id === active.itemId) : null;
  const showScene = phase !== 'start'; // la escena se monta desde la infografía

  return (
    <div className="app">
      {/* ───────────── CAPA 3D ───────────── */}
      {showScene && (
        <div className={`scene-layer ${playing ? '' : 'scene-layer--dimmed'}`}>
          <Suspense fallback={<LoadingOverlay />}>
            <Experience
              key={runId}                         // remonta limpio en cada partida
              items={items}
              interactive={playing && !active}    // bloquea clics con modal o fin
              highlightId={active?.itemId}
              onSelect={selectItem}
            />
          </Suspense>
        </div>
      )}

      {/* ───────────── CAPA UI ───────────── */}
      {phase === 'start' && <StartScreen onStart={() => dispatch({ type: 'START' })} />}

      {phase === 'info' && <Infographic onBegin={() => dispatch({ type: 'BEGIN' })} />}

      {playing && (
        <HUD
          secondsLeft={timer.secondsLeft}
          progress={timer.progress}
          score={score}
          collected={Object.values(items).filter((s) => s === 'collected').length}
          total={TRASH_ITEMS.length}
          paused={PAUSE_TIMER_ON_MODAL && modalOpen}
          toasts={toasts}
          onToastDone={dismissToast}
        />
      )}

      {modalOpen && active.step === 'question' && (
        <QuestionModal
          item={activeItem}
          answer={active.answer}
          onAnswer={(option) => dispatch({ type: 'ANSWER', option })}
          onContinue={() => dispatch({ type: 'CONTINUE' })}
          onCancel={() => dispatch({ type: 'CANCEL' })}
        />
      )}

      {modalOpen && active.step === 'sort' && (
        <BinPicker
          item={activeItem}
          onPick={(binId) =>
            dispatch({ type: 'SORT', binId, secondsLeft: timer.getSecondsLeft() })
          }
        />
      )}

      {phase === 'over' && <ResultsScreen state={state} onRestart={restart} />}
    </div>
  );
}
