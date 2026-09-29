import { FEEDBACK, MAX_SCORE, TRASH_ITEMS } from '../game/config.js';

export default function ResultsScreen({ state, onRestart }) {
  const { score, stats, endReason, timeBonus, items } = state;
  const ratio = (score - timeBonus) / MAX_SCORE;
  const fb = FEEDBACK.find((f) => ratio >= f.min);
  const collected = Object.values(items).filter((s) => s === 'collected').length;

  return (
    <section className="screen screen--over" aria-labelledby="over-title">
      <div className="card card--hero">
        <span className="badge">{endReason === 'clear' ? '¡Salón limpio!' : '¡Se acabó el tiempo!'}</span>
        <h2 id="over-title">{fb.title}</h2>
        <p className="big-score"><span>{score}</span> puntos</p>
        <p className="lead">{fb.text}</p>

        <dl className="stats">
          <div><dt>Residuos recogidos</dt><dd>{collected} / {TRASH_ITEMS.length}</dd></div>
          <div><dt>Preguntas correctas</dt><dd>{stats.correctAnswers}</dd></div>
          <div><dt>Preguntas falladas</dt><dd>{stats.wrongAnswers}</dd></div>
          <div><dt>Botes correctos</dt><dd>{stats.correctBins}</dd></div>
          <div><dt>Botes equivocados</dt><dd>{stats.wrongBins}</dd></div>
          {timeBonus > 0 && <div><dt>Bonus de tiempo</dt><dd>+{timeBonus}</dd></div>}
        </dl>

        <button className="btn btn--primary btn--lg" onClick={onRestart} autoFocus>
          Volver a jugar
        </button>
      </div>
    </section>
  );
}
