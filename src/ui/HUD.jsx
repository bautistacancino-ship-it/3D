import { useEffect } from 'react';
import { WARNING_THRESHOLD_S } from '../game/config.js';

/**
 * HUD — capa 2D fija durante la partida.
 * `pointer-events: none` en el contenedor (ver CSS) para que NO robe
 * los gestos de OrbitControls en móviles; sólo sus hijos puntuales lo reactivan.
 */
export default function HUD({ secondsLeft, progress, score, collected, total, paused, toasts, onToastDone }) {
  const urgent = secondsLeft <= WARNING_THRESHOLD_S;
  const mm = String(Math.floor(secondsLeft / 60)).padStart(1, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  return (
    <header className="hud" role="status">
      <div className={`hud__timer ${urgent ? 'hud__timer--urgent' : ''}`}>
        <span className="hud__label">Tiempo {paused && '· en pausa'}</span>
        <span className="hud__value" aria-live={urgent ? 'assertive' : 'off'}>
          {mm}:{ss}
        </span>
        <div className="hud__bar" aria-hidden="true">
          <div className="hud__bar-fill" style={{ transform: `scaleX(${progress})` }} />
        </div>
      </div>

      <div className="hud__progress">
        <span className="hud__label">Residuos</span>
        <span className="hud__value">{collected}/{total}</span>
      </div>

      <div className="hud__score">
        <span className="hud__label">Puntos</span>
        <span className="hud__value" key={score /* re-dispara animación "pop" */}>{score}</span>
        <div className="toasts">
          {toasts.map((t) => (
            <Toast key={t.id} toast={t} onDone={onToastDone} />
          ))}
        </div>
      </div>

      <p className="hud__hint">Arrastra para girar · pellizca o rueda para acercar · toca un residuo</p>
    </header>
  );
}

function Toast({ toast, onDone }) {
  useEffect(() => {
    const id = setTimeout(() => onDone(toast.id), 1400);
    return () => clearTimeout(id);
  }, [toast.id, onDone]);
  const positive = toast.delta >= 0;
  return (
    <div className={`toast ${positive ? 'toast--ok' : 'toast--bad'}`}>
      <b>{positive ? '+' : ''}{toast.delta}</b> {toast.label}
    </div>
  );
}
