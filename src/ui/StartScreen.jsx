import { GAME_DURATION_S, TRASH_ITEMS } from '../game/config.js';

/** Portada. Ligera a propósito: no importa nada de three.js. */
export default function StartScreen({ onStart }) {
  return (
    <section className="screen screen--start" aria-labelledby="title">
      <div className="card card--hero">
        <span className="badge">Desafío educativo</span>
        <h1 id="title">Reciclatón 3D</h1>
        <p className="lead">
          ¡El salón quedó hecho un desastre! Tienes <strong>{GAME_DURATION_S} segundos</strong> para
          encontrar {TRASH_ITEMS.length} residuos, responder una pregunta sobre cada uno y
          depositarlo en el bote del color correcto.
        </p>
        <ul className="rules">
          <li>🔍 Explora el salón girando y haciendo zoom.</li>
          <li>❓ Toca un residuo y responde bien para recogerlo.</li>
          <li>🗑️ Elige su bote: cada acierto suma puntos.</li>
        </ul>
        <button className="btn btn--primary btn--lg" onClick={onStart} autoFocus>
          Iniciar experiencia
        </button>
      </div>
    </section>
  );
}
