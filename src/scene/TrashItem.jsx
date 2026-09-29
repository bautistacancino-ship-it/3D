/**
 * TrashItem.jsx — Residuo interactivo (el "hotspot" 3D del juego).
 *
 * UX resuelta aquí:
 *  - Descubribilidad: anillo pulsante en la base + leve flotación, para que el
 *    alumno distinga basura interactiva de la decoración del salón.
 *  - Hit-area generosa: una esfera invisible más grande que el objeto → fácil de
 *    tocar con el dedo en móvil (los objetos reales miden ~5 cm en pantalla).
 *  - Arrastre ≠ clic: si el puntero se movió >6 px (el usuario estaba girando la
 *    cámara), se ignora el clic.
 *  - Recogido: animación de encogerse y subir, luego se desmonta.
 */
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useCursor } from '@react-three/drei';
import ModelSlot from './ModelSlot.jsx';
import { PlaceholderShape } from './Placeholders.jsx';

const DRAG_THRESHOLD_PX = 6;

export default function TrashItem({ item, status, interactive, highlighted, onSelect }) {
  const group = useRef();
  const body = useRef();
  const ring = useRef();
  const [hovered, setHovered] = useState(false);
  const [gone, setGone] = useState(false);
  const collected = status === 'collected';

  useCursor(hovered && interactive && !collected);

  useFrame((state, dt) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;

    if (collected) {
      // Animación de salida: sube y se encoge (~0.4 s), luego se desmonta
      const s = Math.max(0, group.current.scale.x - dt * 2.5);
      group.current.scale.setScalar(s);
      group.current.position.y += dt * 1.2;
      if (s === 0 && !gone) setGone(true);
      return;
    }

    // Flotación + escala de hover/selección (lerp = suave e independiente de FPS)
    const target = highlighted ? 1.35 : hovered ? 1.2 : 1;
    const k = 1 - Math.exp(-dt * 12);
    const cur = group.current.scale.x;
    group.current.scale.setScalar(cur + (target - cur) * k);
    body.current.position.y = 0.03 + Math.sin(t * 2 + item.position[0]) * 0.015;
    body.current.rotation.y += dt * (hovered || highlighted ? 1.5 : 0.4);

    // Anillo "latido" en la base
    const p = (Math.sin(t * 3 + item.position[2]) + 1) / 2;
    ring.current.scale.setScalar(1 + p * 0.35);
    ring.current.material.opacity = 0.35 + (1 - p) * 0.45;
  });

  if (gone) return null;

  const handleClick = (e) => {
    e.stopPropagation();
    if (!interactive || collected) return;
    if (e.delta > DRAG_THRESHOLD_PX) return; // fue un arrastre de cámara
    onSelect(item.id);
  };

  return (
    <group ref={group} position={item.position}>
      {/* Área de impacto invisible, más grande que el objeto */}
      <mesh
        position={[0, 0.15, 0]}
        onClick={handleClick}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.28, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <group ref={body}>
        <ModelSlot url={item.model} fallback={<PlaceholderShape shape={item.shape} />} />
      </group>

      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <ringGeometry args={[0.16, 0.2, 40]} />
        <meshBasicMaterial color={highlighted ? '#ffd23f' : '#3ee07a'} transparent depthWrite={false} />
      </mesh>
    </group>
  );
}
