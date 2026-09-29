import { BINS, SCORING } from '../game/config.js';

/**
 * Infografía previa. Se renderiza SOBRE la escena 3D (que ya está cargando
 * detrás, atenuada): cuando el alumno termina de leer, el salón está listo
 * y no hay pantalla negra al empezar.
 */
export default function Infographic({ onBegin }) {
  return (
    <section className="screen screen--info" aria-labelledby="info-title">
      <div className="card card--wide">
        <h2 id="info-title">Antes de empezar: ¿dónde va cada cosa?</h2>

        <div className="bins-grid">
          {BINS.map((bin) => (
            <article key={bin.id} className="bin-card" style={{ '--bin': bin.color }}>
              <div className="bin-card__swatch" aria-hidden="true">{bin.icon}</div>
              <h3>{bin.label}</h3>
              <p>{bin.examples}</p>
            </article>
          ))}
        </div>

        <div className="scoring">
          <span>✅ Pregunta correcta <b>+{SCORING.correctAnswer}</b></span>
          <span>🗑️ Bote correcto <b>+{SCORING.correctBin}</b></span>
          <span>❌ Bote equivocado <b>{SCORING.wrongBin}</b></span>
          <span>⏱️ Salón limpio antes de tiempo: <b>bonus</b></span>
        </div>

        <button className="btn btn--primary btn--lg" onClick={onBegin} autoFocus>
          Entendido · ¡Empezar a reciclar!
        </button>
      </div>
    </section>
  );
}
