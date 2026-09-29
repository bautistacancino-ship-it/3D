import { BINS } from '../game/config.js';

/**
 * Selector de bote por color. Se muestran nombre + icono además del color
 * para que sea usable por alumnos con daltonismo (≈8 % de los varones).
 */
export default function BinPicker({ item, onPick }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="bin-title">
      <div className="modal">
        <p className="modal__eyebrow">Tienes en la mano: {item.name}</p>
        <h2 id="bin-title">¿En qué bote lo depositas?</h2>
        <div className="bin-picker">
          {BINS.map((bin, i) => (
            <button
              key={bin.id}
              className="bin-btn"
              style={{ '--bin': bin.color }}
              onClick={() => onPick(bin.id)}
              autoFocus={i === 0}
            >
              <span className="bin-btn__lid" aria-hidden="true" />
              <span className="bin-btn__body" aria-hidden="true">{bin.icon}</span>
              <span className="bin-btn__label">{bin.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
