/**
 * Classroom.jsx — Entorno del salón.
 *
 * CLASSROOM_MODEL = null → salón procedural (placeholder) con pupitres, pizarra,
 * ventanas y los botes de reciclaje decorativos.
 * CLASSROOM_MODEL = '/models/classroom.glb' → se usa tu modelo horneado (bake)
 * de Blender. Mantén la escala en metros y el piso en y = 0 para que las
 * posiciones de los residuos en config.js sigan siendo válidas.
 */
import { useMemo } from 'react';
import ModelSlot from './ModelSlot.jsx';
import { BINS } from '../game/config.js';

export const CLASSROOM_MODEL = null; // ej: '/models/classroom.glb'

// Dimensiones del salón (metros)
export const ROOM = { w: 10, d: 8, h: 3.2 };

// Pupitres: incluye los que sostienen residuos (y ≈ 0.78 en config.js)
const DESKS = [
  [-2.4, -0.6], [1.2, 0.8], [2.8, -1.4], [0.3, -1.8],
  [-2.4, 1.2], [-0.9, -0.2], [2.8, 0.6], [-1.2, -1.9], [-0.6, 1.0],
];

function Desk({ x, z }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.0, 0.05, 0.6]} />
        <meshStandardMaterial color="#c8935a" roughness={0.7} />
      </mesh>
      {[[-0.45, -0.25], [0.45, -0.25], [-0.45, 0.25], [0.45, 0.25]].map(([lx, lz], i) => (
        <mesh key={i} position={[lx, 0.37, lz]} castShadow>
          <boxGeometry args={[0.04, 0.74, 0.04]} />
          <meshStandardMaterial color="#555c66" metalness={0.5} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

/** Botes decorativos con el mismo código de color de la infografía:
 *  refuerzan visualmente la asociación color ↔ material. */
function RecyclingStation() {
  const spacing = 0.75;
  const x0 = -((BINS.length - 1) * spacing) / 2;
  return (
    <group position={[2.2, 0, -ROOM.d / 2 + 0.45]}>
      {BINS.map((bin, i) => (
        <group key={bin.id} position={[x0 + i * spacing, 0, 0]}>
          <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.24, 0.2, 0.84, 20]} />
            <meshStandardMaterial color={bin.color} roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.87, 0]}>
            <cylinderGeometry args={[0.26, 0.26, 0.05, 20]} />
            <meshStandardMaterial color={bin.color} roughness={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function ProceduralRoom() {
  const { w, d, h } = ROOM;
  const desks = useMemo(() => DESKS.map(([x, z]) => <Desk key={`${x}${z}`} x={x} z={z} />), []);
  return (
    <group>
      {/* Piso */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color="#d9cbb3" roughness={0.9} />
      </mesh>
      {/* Muro del fondo con pizarra */}
      <mesh position={[0, h / 2, -d / 2]} receiveShadow>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial color="#e9efe6" />
      </mesh>
      <mesh position={[-1.8, 1.6, -d / 2 + 0.02]}>
        <planeGeometry args={[3.6, 1.3]} />
        <meshStandardMaterial color="#244d3a" roughness={0.95} />
      </mesh>
      {/* Muros laterales (lado derecho con "ventanas" emisivas = luz natural falsa) */}
      <mesh position={[-w / 2, h / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[d, h]} />
        <meshStandardMaterial color="#e3eadf" />
      </mesh>
      <mesh position={[w / 2, h / 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[d, h]} />
        <meshStandardMaterial color="#e3eadf" />
      </mesh>
      {[-2.2, 0, 2.2].map((z) => (
        <mesh key={z} position={[w / 2 - 0.01, 1.8, z]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[1.4, 1.1]} />
          <meshStandardMaterial color="#cfe9ff" emissive="#bfe2ff" emissiveIntensity={0.9} />
        </mesh>
      ))}
      {/* Escritorio del profesor */}
      <mesh position={[-2.6, 0.4, -d / 2 + 1.2]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.8, 0.8]} />
        <meshStandardMaterial color="#8a5a34" />
      </mesh>
      {desks}
      <RecyclingStation />
    </group>
  );
}

export default function Classroom() {
  return <ModelSlot url={CLASSROOM_MODEL} fallback={<ProceduralRoom />} />;
}
