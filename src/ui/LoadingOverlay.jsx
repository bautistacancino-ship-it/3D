/** Fallback mientras llega el chunk de three.js / los .glb. Sin dependencias 3D. */
export default function LoadingOverlay({ label = 'Preparando el salón…' }) {
  return (
    <div className="loading" role="progressbar" aria-busy="true" aria-label={label}>
      <div className="loading__spinner" />
      <span>{label}</span>
    </div>
  );
}
