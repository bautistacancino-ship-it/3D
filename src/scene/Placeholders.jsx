/**
 * Placeholders.jsx — Geometría simple que representa cada residuo mientras
 * no tengas el .glb definitivo. Todas miden ~20–30 cm y apoyan su base en y=0
 * (el grupo padre las coloca sobre el pupitre o el piso).
 *
 * Tip: modela tus .glb con el ORIGEN en la base del objeto (Blender:
 * Object ▸ Set Origin ▸ Origin to 3D Cursor con el cursor en la base) para que
 * encajen en las mismas posiciones de config.js sin reajustar nada.
 */
const mat = (color, extra = {}) => <meshStandardMaterial color={color} roughness={0.5} {...extra} />;

export function PlaceholderShape({ shape }) {
  switch (shape) {
    case 'bottle':
      return (
        <group>
          <mesh position={[0, 0.12, 0]} castShadow>
            <cylinderGeometry args={[0.055, 0.055, 0.24, 16]} />
            {mat('#7fd3ff', { transparent: true, opacity: 0.8 })}
          </mesh>
          <mesh position={[0, 0.27, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.05, 0.07, 12]} />
            {mat('#7fd3ff', { transparent: true, opacity: 0.8 })}
          </mesh>
          <mesh position={[0, 0.315, 0]}>
            <cylinderGeometry args={[0.022, 0.022, 0.025, 12]} />
            {mat('#1e5fd6')}
          </mesh>
        </group>
      );
    case 'can':
      return (
        <mesh position={[0, 0.065, 0]} castShadow>
          <cylinderGeometry args={[0.033, 0.033, 0.13, 20]} />
          {mat('#d62b2b', { metalness: 0.7, roughness: 0.3 })}
        </mesh>
      );
    case 'jar':
      return (
        <group>
          <mesh position={[0, 0.08, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 0.16, 16]} />
            {mat('#9fe3b0', { transparent: true, opacity: 0.6, roughness: 0.1 })}
          </mesh>
          <mesh position={[0, 0.17, 0]}>
            <cylinderGeometry args={[0.052, 0.052, 0.025, 16]} />
            {mat('#c9a13b', { metalness: 0.6 })}
          </mesh>
        </group>
      );
    case 'box':
      return (
        <mesh position={[0, 0.012, 0]} rotation={[0, 0.4, 0]} castShadow>
          <boxGeometry args={[0.21, 0.024, 0.29]} />
          {mat('#f0e6c8')}
        </mesh>
      );
    case 'paper':
      return (
        <mesh position={[0, 0.045, 0]} castShadow>
          <icosahedronGeometry args={[0.05, 0]} /> {/* bola de papel "arrugada" */}
          {mat('#ffffff', { flatShading: true })}
        </mesh>
      );
    case 'sphere':
    default:
      return (
        <mesh position={[0, 0.035, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <capsuleGeometry args={[0.03, 0.14, 4, 12]} />
          {mat('#f4d03f')}
        </mesh>
      );
  }
}
