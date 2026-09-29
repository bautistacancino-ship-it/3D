/**
 * gameReducer.js — Máquina de estados del juego (lógica pura, sin React ni 3D).
 * ---------------------------------------------------------------------------
 *
 *   ┌───────┐ START ┌──────┐ BEGIN ┌─────────┐ TIME_UP / ALL_CLEAR ┌──────┐
 *   │ start │──────▶│ info │──────▶│ playing │────────────────────▶│ over │
 *   └───────┘       └──────┘       └─────────┘                     └──┬───┘
 *        ▲                              │  sub-estado `active`:       │
 *        │                              │  null → question → sort     │
 *        └──────────── RESTART ─────────┴─────────────────────────────┘
 *
 * Al ser una función pura se puede testear sin navegador y garantiza que
 * no existan combinaciones imposibles (p. ej. abrir un modal con el juego
 * terminado): cada acción se ignora si llega en la fase equivocada.
 */
import { SCORING, TRASH_ITEMS } from './config.js';

let toastSeq = 0;

export function createInitialState(phase = 'start') {
  return {
    phase,                 // 'start' | 'info' | 'playing' | 'over'
    runId: Date.now(),     // cambia en cada partida → remonta la escena limpia
    score: 0,
    // estado por objeto: 'available' | 'collected'
    items: Object.fromEntries(TRASH_ITEMS.map((it) => [it.id, 'available'])),
    // interacción en curso con un objeto
    active: null,          // { itemId, step: 'question'|'sort', answer: number|null }
    stats: { correctAnswers: 0, wrongAnswers: 0, correctBins: 0, wrongBins: 0 },
    toasts: [],            // feedback flotante "+10", "-5" en el HUD
    endReason: null,       // 'time' | 'clear'
    timeBonus: 0,
  };
}

const addToast = (state, delta, label) => ({
  ...state,
  toasts: [...state.toasts.slice(-3), { id: ++toastSeq, delta, label }],
});

export function gameReducer(state, action) {
  switch (action.type) {
    // ── Flujo de pantallas ────────────────────────────────────────
    case 'START':
      return state.phase === 'start' ? { ...state, phase: 'info' } : state;

    case 'BEGIN': // cerrar infografía → arranca el reloj (lo gestiona App)
      return state.phase === 'info' ? { ...state, phase: 'playing' } : state;

    case 'RESTART': // "Volver a jugar": salta la portada, repite infografía breve
      return createInitialState(action.skipInfo ? 'playing' : 'info');

    case 'TIME_UP':
      if (state.phase !== 'playing') return state;
      return { ...state, phase: 'over', active: null, endReason: 'time' };

    // ── Interacción con objetos ───────────────────────────────────
    case 'SELECT_ITEM': {
      if (state.phase !== 'playing' || state.active) return state;
      if (state.items[action.itemId] !== 'available') return state;
      return { ...state, active: { itemId: action.itemId, step: 'question', answer: null } };
    }

    case 'ANSWER': {
      const { active } = state;
      if (state.phase !== 'playing' || active?.step !== 'question' || active.answer !== null) return state;
      const item = TRASH_ITEMS.find((i) => i.id === active.itemId);
      const ok = action.option === item.question.correct;
      const next = {
        ...state,
        score: state.score + (ok ? SCORING.correctAnswer : 0),
        active: { ...active, answer: action.option },
        stats: {
          ...state.stats,
          correctAnswers: state.stats.correctAnswers + (ok ? 1 : 0),
          wrongAnswers: state.stats.wrongAnswers + (ok ? 0 : 1),
        },
      };
      return ok ? addToast(next, SCORING.correctAnswer, '¡Respuesta correcta!') : next;
    }

    case 'CONTINUE': {
      // Tras ver la explicación: si acertó → elegir bote; si falló → el objeto
      // queda en el salón y puede reintentarse más tarde.
      const { active } = state;
      if (active?.step !== 'question' || active.answer === null) return state;
      const item = TRASH_ITEMS.find((i) => i.id === active.itemId);
      const ok = active.answer === item.question.correct;
      return { ...state, active: ok ? { ...active, step: 'sort' } : null };
    }

    case 'CANCEL': // cerrar modal sin responder (Esc / botón ✕)
      return state.active?.step === 'question' && state.active.answer === null
        ? { ...state, active: null }
        : state;

    case 'SORT': {
      const { active } = state;
      if (state.phase !== 'playing' || active?.step !== 'sort') return state;
      const item = TRASH_ITEMS.find((i) => i.id === active.itemId);
      const ok = action.binId === item.bin;
      const delta = ok ? SCORING.correctBin : SCORING.wrongBin;
      let next = {
        ...state,
        score: Math.max(0, state.score + delta), // nunca bajar de 0 (menos frustrante)
        active: null,
        items: { ...state.items, [item.id]: 'collected' },
        stats: {
          ...state.stats,
          correctBins: state.stats.correctBins + (ok ? 1 : 0),
          wrongBins: state.stats.wrongBins + (ok ? 0 : 1),
        },
      };
      next = addToast(next, delta, ok ? '¡Bote correcto!' : 'Bote equivocado');

      // ¿Salón limpio? → fin anticipado con bonus por segundos restantes
      const allClear = Object.values(next.items).every((s) => s === 'collected');
      if (allClear) {
        const bonus = Math.round((action.secondsLeft ?? 0) * SCORING.timeBonusPerSecond);
        next = { ...next, phase: 'over', endReason: 'clear', timeBonus: bonus, score: next.score + bonus };
      }
      return next;
    }

    case 'DISMISS_TOAST':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };

    default:
      return state;
  }
}
