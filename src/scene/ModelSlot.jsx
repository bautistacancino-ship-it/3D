/**
 * ModelSlot.jsx — "Enchufe" para tus assets .glb.
 * ------------------------------------------------
 *   <ModelSlot url="/models/botella.glb" fallback={<PlaceholderBottle/>} />
 *
 * - url null/undefined  → dibuja el fallback (placeholder geométrico).
 * - url válida          → carga el .glb con Draco/Meshopt si viene comprimido.
 * - url rota / 404      → ErrorBoundary vuelve al fallback y avisa en consola,
 *                          así un asset faltante NUNCA rompe la partida en clase.
 */
import { Component, Suspense } from 'react';
import { useGLTF, Clone } from '@react-three/drei';

// Decodificador Draco servido desde CDN de Google (cacheado por el navegador).
// Si prefieres self-host: copia node_modules/three/examples/jsm/libs/draco/ a /public/draco/.
const DRACO_URL = 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/';

function GltfModel({ url, scale = 1 }) {
  // useGLTF(url, draco, meshopt): meshopt=true habilita modelos pasados por gltfpack
  const { scene } = useGLTF(url, DRACO_URL, true);
  // <Clone> permite usar el mismo .glb en varios lugares sin que se "roben" los nodos
  return <Clone object={scene} scale={scale} castShadow receiveShadow />;
}

class AssetBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(err) {
    console.warn(`[ModelSlot] No se pudo cargar "${this.props.url}", uso placeholder.`, err);
  }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

export default function ModelSlot({ url, fallback, scale }) {
  if (!url) return fallback;
  return (
    <AssetBoundary url={url} fallback={fallback}>
      <Suspense fallback={fallback}>
        <GltfModel url={url} scale={scale} />
      </Suspense>
    </AssetBoundary>
  );
}

/** Pre-carga: llama esto al importar la escena para que los .glb se pidan
 *  en paralelo durante la infografía, no al aparecer cada objeto. */
export function preloadModels(urls) {
  urls.filter(Boolean).forEach((u) => useGLTF.preload(u, DRACO_URL, true));
}
