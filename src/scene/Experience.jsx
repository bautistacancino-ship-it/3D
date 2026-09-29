/**
 * Experience.jsx — Punto de entrada de la capa 3D (se carga con React.lazy).
 * Recibe TODO por props; no conoce el reducer ni la UI.
 *
 * Decisiones de rendimiento/UX:
 *  - dpr adaptativo: arranca en [1, 1.75] y baja a 1 si el FPS cae (PerformanceMonitor).
 *    Un móvil con pantalla 3x renderizando a dpr 3 procesa 9x píxeles: es la causa
 *    nº 1 de tirones en tours 3D.
 *  - OrbitControls acotado: sin paneo, sin atravesar el piso ni salir del salón →
 *    el alumno nunca se "pierde" ni queda mirando al vacío.
 *  - CameraRig: al seleccionar un residuo, la cámara centra suavemente su objetivo
 *    en él (refuerza qué objeto se está evaluando).
 *  - autoRotate mientras NO se juega (infografía / resultados) = fondo vivo.
 */
import { useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerformanceMonitor, AdaptiveEvents } from '@react-three/drei';
import { Vector3 } from 'three';
import Classroom, { CLASSROOM_MODEL, ROOM } from './Classroom.jsx';
import TrashItem from './TrashItem.jsx';
import { preloadModels } from './ModelSlot.jsx';
import { TRASH_ITEMS } from '../game/config.js';

// Pide todos los .glb en paralelo apenas se descarga este chunk
preloadModels([CLASSROOM_MODEL, ...TRASH_ITEMS.map((i) => i.model)]);

const HOME_TARGET = new Vector3(0, 0.8, -0.3);

function CameraRig({ highlightId }) {
  const controls = useThree((s) => s.controls);
  const goal = new Vector3();
  useFrame((_, dt) => {
    if (!controls) return;
    const item = highlightId && TRASH_ITEMS.find((i) => i.id === highlightId);
    if (item) goal.set(...item.position);
    else goal.copy(HOME_TARGET);
    // lerp exponencial: suave y consistente a 30 o 120 FPS
    controls.target.lerp(goal, 1 - Math.exp(-dt * (item ? 4 : 1.5)));
    controls.update();
  });
  return null;
}

export default function Experience({ items, interactive, highlightId, onSelect }) {
  const [dpr, setDpr] = useState(1.5);

  return (
    <Canvas
      shadows
      dpr={dpr}
      camera={{ position: [0, 3.2, 5.6], fov: 55, near: 0.1, far: 50 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      // Evita que el gesto de scroll de la página compita con el zoom en móviles
      style={{ touchAction: 'none' }}
    >
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.75)} />
      <AdaptiveEvents /> {/* reduce raycasts mientras la cámara se mueve */}

      <color attach="background" args={['#cfe3d6']} />
      <fog attach="fog" args={['#cfe3d6', 12, 24]} />

      {/* Iluminación base. Con un .glb con iluminación horneada (bake) puedes
          borrar la luz direccional y las sombras: el bake ya las trae. */}
      <hemisphereLight args={['#ffffff', '#b59b7a', 0.9]} />
      <directionalLight
        position={[4, 6, 3]}
        intensity={1.3}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-bias={-0.0005}
      />

      <Classroom />

      {TRASH_ITEMS.map((item) => (
        <TrashItem
          key={item.id}
          item={item}
          status={items[item.id]}
          interactive={interactive}
          highlighted={highlightId === item.id}
          onSelect={onSelect}
        />
      ))}

      <OrbitControls
        makeDefault
        enabled={interactive}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={1.2}
        maxDistance={Math.min(ROOM.w, ROOM.d) * 0.85}
        minPolarAngle={0.25}
        maxPolarAngle={Math.PI / 2 - 0.08}   // nunca bajo el piso
        autoRotate={!interactive && !highlightId}
        autoRotateSpeed={0.35}
      />
      <CameraRig highlightId={highlightId} />
    </Canvas>
  );
}
