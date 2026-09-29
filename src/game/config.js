/**
 * config.js — ÚNICA fuente de verdad del contenido del juego.
 * ---------------------------------------------------------------
 * Todo lo que un docente querría editar vive aquí: duración, puntajes,
 * materiales, botes, objetos del salón y preguntas. Ningún componente
 * tiene textos o reglas "hardcodeadas".
 */

// ── Reglas generales ──────────────────────────────────────────────
export const GAME_DURATION_S = 90;      // cuenta regresiva total
export const WARNING_THRESHOLD_S = 15;  // HUD se pone en modo "urgencia"

/**
 * ¿El reloj se detiene mientras hay un modal abierto?
 *  false → más urgencia (recomendado para 12+ años).
 *  true  → más amable para niños pequeños / lectores lentos.
 */
export const PAUSE_TIMER_ON_MODAL = false;

export const SCORING = {
  correctAnswer: 10,   // responder bien la pregunta
  correctBin: 15,      // clasificar en el bote correcto
  wrongBin: -5,        // clasificar mal (usa 0 si no quieres restar)
  timeBonusPerSecond: 1, // bonus si limpia TODO el salón antes de tiempo
};

// Umbrales de retroalimentación final (porcentaje del puntaje máximo)
export const FEEDBACK = [
  { min: 0.85, title: '¡Guardián del planeta! 🌍', text: 'Clasificaste casi todo a la perfección.' },
  { min: 0.55, title: '¡Gran trabajo! ♻️', text: 'Vas muy bien. Repasa los botes donde dudaste.' },
  { min: 0.25, title: 'Buen comienzo 🌱', text: 'Revisa la infografía y vuelve a intentarlo.' },
  { min: -Infinity, title: 'Sigue practicando 💪', text: 'Cada intento te acerca a reciclar como experto.' },
];

// ── Botes / materiales ────────────────────────────────────────────
// Código de colores de referencia (Chile, NCh 3322). Ajusta si tu
// institución usa otro estándar.
export const BINS = [
  { id: 'papel',    label: 'Papel y cartón', color: '#1f6fd1', icon: '📄', examples: 'Cuadernos, cajas, diarios' },
  { id: 'plastico', label: 'Plásticos',      color: '#f2c200', icon: '🧴', examples: 'Botellas PET, envases' },
  { id: 'vidrio',   label: 'Vidrio',         color: '#2e9e4f', icon: '🍾', examples: 'Botellas, frascos' },
  { id: 'organico', label: 'Orgánicos',      color: '#7a4a24', icon: '🍌', examples: 'Cáscaras, restos de fruta' },
  { id: 'metal',    label: 'Latas / metal',  color: '#8c8c8c', icon: '🥫', examples: 'Latas de bebida y conserva' },
];

export const binById = Object.fromEntries(BINS.map((b) => [b.id, b]));

// ── Objetos de basura en el salón ─────────────────────────────────
/**
 * model: ruta a un .glb en /public/models. Si es null o el archivo no
 *        existe, se dibuja un placeholder geométrico (ver ModelSlot.jsx).
 * shape: forma del placeholder ('bottle' | 'box' | 'can' | 'sphere' | 'jar' | 'paper').
 * position: [x, y, z] en metros; el piso está en y = 0.
 */
export const TRASH_ITEMS = [
  {
    id: 'botella-pet', name: 'Botella de plástico', bin: 'plastico',
    model: null /* '/models/botella.glb' */, shape: 'bottle', position: [-2.4, 0.78, -0.6],
    question: {
      text: '¿Qué conviene hacer con una botella PET antes de reciclarla?',
      options: ['Llenarla de tierra', 'Vaciarla y aplastarla', 'Quemarla', 'Romperla en pedazos'],
      correct: 1,
      explain: 'Vacía y aplastada ocupa menos espacio y no contamina otros materiales.',
    },
  },
  {
    id: 'cuaderno', name: 'Cuaderno viejo', bin: 'papel',
    model: null, shape: 'box', position: [1.2, 0.78, 0.8],
    question: {
      text: '¿Qué papel NO debería ir al contenedor de papel?',
      options: ['Hojas de cuaderno', 'Cajas de cartón', 'Servilletas usadas con grasa', 'Diarios'],
      correct: 2,
      explain: 'El papel sucio con grasa o comida arruina el lote de reciclaje.',
    },
  },
  {
    id: 'frasco', name: 'Frasco de vidrio', bin: 'vidrio',
    model: null, shape: 'jar', position: [2.8, 0.78, -1.4],
    question: {
      text: '¿Cuántas veces se puede reciclar el vidrio?',
      options: ['Solo una vez', 'Dos veces', 'Indefinidamente', 'Nunca'],
      correct: 2,
      explain: 'El vidrio se funde y reforma sin perder calidad, una y otra vez.',
    },
  },
  {
    id: 'cascara', name: 'Cáscara de plátano', bin: 'organico',
    model: null, shape: 'sphere', position: [-0.8, 0.05, 1.9],
    question: {
      text: '¿En qué se pueden convertir los residuos orgánicos?',
      options: ['Plástico nuevo', 'Compost para plantas', 'Vidrio', 'Nada útil'],
      correct: 1,
      explain: 'Al descomponerse forman compost, un abono natural.',
    },
  },
  {
    id: 'lata', name: 'Lata de bebida', bin: 'metal',
    model: null, shape: 'can', position: [0.3, 0.78, -1.8],
    question: {
      text: 'Reciclar una lata de aluminio ahorra, aprox., ¿cuánta energía vs. fabricarla nueva?',
      options: ['5 %', '25 %', '50 %', '95 %'],
      correct: 3,
      explain: 'El aluminio reciclado ahorra cerca del 95 % de la energía.',
    },
  },
  {
    id: 'hoja', name: 'Hoja arrugada', bin: 'papel',
    model: null, shape: 'paper', position: [3.2, 0.05, 1.6],
    question: {
      text: '¿Qué es mejor hacer ANTES de reciclar papel?',
      options: ['Usarlo por ambos lados', 'Mojarlo', 'Plastificarlo', 'Pintarlo'],
      correct: 0,
      explain: 'Reducir y reutilizar va antes que reciclar.',
    },
  },
];

/** Puntaje máximo teórico (sin bonus de tiempo) → para la retroalimentación. */
export const MAX_SCORE = TRASH_ITEMS.length * (SCORING.correctAnswer + SCORING.correctBin);
