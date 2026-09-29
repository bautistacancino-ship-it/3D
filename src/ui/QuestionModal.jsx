import { useEffect, useRef } from 'react';

/**
 * Modal de pregunta. Dos momentos:
 *   1) answer === null → alternativas clicables
 *   2) answer !== null → se revela correcta/incorrecta + explicación
 * La explicación es la parte pedagógica: nunca se salta automáticamente.
 */
export default function QuestionModal({ item, answer, onAnswer, onContinue, onCancel }) {
  const { question } = item;
  const answered = answer !== null;
  const correct = answered && answer === question.correct;
  const continueRef = useRef(null);

  // Accesibilidad: al responder, el foco salta al botón de continuar
  useEffect(() => {
    if (answered) continueRef.current?.focus();
  }, [answered]);

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="q-title">
      <div className="modal">
        {!answered && (
          <button className="modal__close" onClick={onCancel} aria-label="Cerrar sin responder">✕</button>
        )}
        <p className="modal__eyebrow">Encontraste: {item.name}</p>
        <h2 id="q-title">{question.text}</h2>

        <div className="options">
          {question.options.map((opt, i) => {
            let cls = 'option';
            if (answered && i === question.correct) cls += ' option--correct';
            else if (answered && i === answer) cls += ' option--wrong';
            return (
              <button
                key={i}
                className={cls}
                disabled={answered}
                onClick={() => onAnswer(i)}
                autoFocus={i === 0}
              >
                <span className="option__key">{String.fromCharCode(65 + i)}</span>
                {opt}
              </button>
            );
          })}
        </div>

        {answered && (
          <div className={`feedback ${correct ? 'feedback--ok' : 'feedback--bad'}`}>
            <strong>{correct ? '¡Correcto! Puedes recoger el residuo.' : 'Incorrecto. El residuo se queda en el salón.'}</strong>
            <p>{question.explain}</p>
            <button ref={continueRef} className="btn btn--primary" onClick={onContinue}>
              {correct ? 'Recoger y clasificar →' : 'Seguir buscando'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
