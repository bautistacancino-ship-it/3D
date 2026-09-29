# Reciclatón 3D — juego educativo de reciclaje (React Three Fiber)

Desafío contra reloj en un salón de clases 3D: el alumno encuentra residuos,
responde una pregunta sobre cada uno y los clasifica en el bote del color correcto.

## Arrancar

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # genera /dist listo para subir
```

## Enfoque

**Tour 3D transitable acotado** (no 360): la mecánica necesita objetos
seleccionables con profundidad y una cámara orbital, algo que una panorámica
equirectangular no puede ofrecer sin falsear la interacción.

## Arquitectura

```
src/
├── App.jsx               Orquestador: reducer + reloj → capa UI y capa 3D
├── game/                 LÓGICA PURA (sin React-DOM ni three.js)
│   ├── config.js         ← edita aquí: tiempo, puntajes, botes, residuos, preguntas
│   ├── gameReducer.js    Máquina de estados start → info → playing → over
│   └── useCountdown.js   Temporizador por deadline (no se desfasa en móviles)
├── ui/                   CAPA 2D (HTML/CSS)
│   ├── StartScreen.jsx · Infographic.jsx · HUD.jsx
│   ├── QuestionModal.jsx · BinPicker.jsx · ResultsScreen.jsx · LoadingOverlay.jsx
└── scene/                CAPA 3D (se carga en diferido con React.lazy)
    ├── Experience.jsx    <Canvas>, luces, OrbitControls acotado, CameraRig
    ├── Classroom.jsx     Salón procedural  ó  tu classroom.glb
    ├── TrashItem.jsx     Residuo interactivo (hotspot 3D)
    ├── ModelSlot.jsx     Carga .glb con fallback automático a placeholder
    └── Placeholders.jsx  Geometrías temporales
```

La escena 3D **no importa nada de `ui/`** y viceversa; se comunican sólo por props.

### Decisiones de juego (modificables en `config.js`)

| Opción | Valor por defecto | Por qué |
|---|---|---|
| `PAUSE_TIMER_ON_MODAL` | `false` | Mantiene la urgencia. Pon `true` para cursos pequeños o lectores lentos. |
| Respuesta incorrecta | El residuo queda en el salón y puede reintentarse | Aprender del error sin bloquear el avance. |
| `wrongBin` | `-5` (el puntaje nunca baja de 0) | Penaliza sin frustrar. Usa `0` para "no suma". |
| Salón limpio antes de tiempo | Fin anticipado + 1 pt por segundo restante | Premia la eficiencia. |

## Insertar tus modelos 3D

1. Copia tus archivos a `public/models/`.
2. En `src/game/config.js`, cambia `model: null` por `model: '/models/botella.glb'`.
3. Para el salón: en `src/scene/Classroom.jsx`, `CLASSROOM_MODEL = '/models/classroom.glb'`.

Si un archivo falta o está roto, se muestra el placeholder y un aviso en consola:
la partida nunca se cae en plena clase.

### Preparar los .glb en Blender (checklist de producción)

**Escala y origen**
- Unidades en metros (`Scene Properties ▸ Units ▸ Metric, Unit Scale 1.0`).
- Piso del salón en Z = 0 de Blender (se convierte en Y = 0 en three.js).
- Residuos: origen en la **base** del objeto, para que calcen sobre el pupitre.
- `Ctrl+A ▸ All Transforms` antes de exportar (escala 1, rotación 0).

**Bake de iluminación (salón)** — elimina el costo de luces y sombras en tiempo real:
1. Motor **Cycles**. Une muros/piso/muebles estáticos en pocos objetos.
2. Crea un segundo UV map (`UVMap_bake`) y `UV ▸ Smart UV Project` (margen 0.02).
3. En cada material, añade un nodo *Image Texture* nuevo (2048², o 4096² para el salón completo), selecciónalo (activo) sin conectarlo.
4. `Render Properties ▸ Bake ▸ Bake Type: Combined` (o *Diffuse* con Direct+Indirect, sin Color, si quieres conservar el color base aparte). Samples 256–512 + Denoise.
5. Guarda la imagen, conéctala al *Base Color* de un material nuevo y simple (o a *Emission* con Base Color negro para look 100 % horneado).
6. Con el salón horneado, en `Experience.jsx` **borra la `directionalLight` y el prop `shadows`**: ahorro enorme en móviles.

**Exportar** (`File ▸ Export ▸ glTF 2.0`):
- Format: **glTF Binary (.glb)** · Include: *Selected Objects* · Transform: *+Y Up* ✅
- Data ▸ Mesh: *Apply Modifiers* ✅ · Materials: *Export* · Images: *WebP* (Blender 3.6+)
- Compression: **Draco** ✅ (nivel 6) — o deja sin comprimir y usa gltfpack abajo.

**Optimizar después de exportar** (recomendado):
```bash
npx @gltf-transform/cli optimize classroom.glb classroom.opt.glb \
  --texture-compress webp --texture-size 2048 --compress meshopt
```
Objetivos: salón < 5 MB, cada residuo < 300 KB, < 100 draw calls en escena.
Revisa el resultado en https://gltf.report antes de subirlo.

## Despliegue

**Vercel**: importa el repo → framework *Vite* → listo. `vercel.json` ya cachea
`/models` y `/assets` por un año (cambia el nombre del .glb al actualizarlo,
p. ej. `classroom-v2.glb`, para invalidar la caché).

**Hostinger (hosting compartido)**: `npm run build` y sube el **contenido** de
`dist/` a `public_html/`. El `.htaccess` incluido (se copia a `dist/`) agrega
el MIME de `.glb`, caché y compresión. Si lo sirves en una subcarpeta, añade
`base: '/subcarpeta/'` en `vite.config.js`.

## Rendimiento y UX ya resueltos

- Carga diferida: three.js no bloquea la portada; se descarga mientras el alumno lee la infografía (sin pantalla negra al empezar).
- `useGLTF.preload`: todos los .glb se piden en paralelo al cargar la escena.
- DPR adaptativo (`PerformanceMonitor`): baja resolución si el FPS cae.
- Cámara acotada: sin paneo, sin atravesar el piso; se centra en el residuo elegido.
- Clic vs. arrastre diferenciados; hit-area ampliada para dedos.
- Anillos pulsantes indican qué es interactivo.
- Colores de botes acompañados de icono y texto (daltonismo); foco visible y Esc para cerrar.
- `prefers-reduced-motion` respetado.
