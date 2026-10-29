// Palabras y frases por nivel de la sopa de letras.
// - Escribe todo en MAYÚSCULAS y sin acentos ni Ñ.
// - Las frases pueden llevar espacios: en la sopa se colocan sin espacios
//   (por ejemplo "EL SOL" se busca como ELSOL) y en la lista se muestran con ellos.
// - Ninguna palabra puede tener más letras (sin espacios) que el `size` de su nivel.
// - Pasado el último nivel, el juego sigue con la configuración del último.

const DIRECCIONES_BASICAS = [
  [0, 1], // →
  [1, 0], // ↓
];
const CON_DIAGONAL = [...DIRECCIONES_BASICAS, [1, 1]]; // ↘
const TODAS = [
  ...CON_DIAGONAL,
  [0, -1], // ←
  [-1, 0], // ↑
  [-1, -1], // ↖
  [1, -1], // ↙
  [-1, 1], // ↗
];

export const LEVELS = [
  {
    // Nivel 1: palabras cortas, solo → y ↓
    size: 6,
    count: 4,
    directions: DIRECCIONES_BASICAS,
    words: [
      "SOL",
      "LUNA",
      "GATO",
      "PERRO",
      "CASA",
      "MESA",
      "PATO",
      "FLOR",
      "MAR",
      "PAN",
      "OSO",
      "LAPIZ",
    ],
  },
  {
    // Nivel 2: palabras de la escuela, se agrega la diagonal
    size: 7,
    count: 5,
    directions: CON_DIAGONAL,
    words: [
      "ESCUELA",
      "MAESTRO",
      "LIBRO",
      "COLORES",
      "AMIGOS",
      "RECREO",
      "LETRAS",
      "NUMEROS",
      "JUGUETE",
      "CRAYOLA",
      "TIJERAS",
    ],
  },
  {
    // Nivel 3: palabras más largas, ya pueden estar al revés
    size: 8,
    count: 6,
    directions: TODAS,
    words: [
      "PIZARRON",
      "CUADERNO",
      "MOCHILA",
      "DIBUJAR",
      "PINTURA",
      "APRENDER",
      "ESCRIBIR",
      "SALTAR",
      "CANTAR",
      "MUSICA",
      "LECTURA",
      "PALABRA",
    ],
  },
  {
    // Nivel 4: palabras largas
    size: 9,
    count: 6,
    directions: TODAS,
    words: [
      "ALFABETO",
      "SILABAS",
      "PEGAMENTO",
      "CUENTO",
      "ABRAZOS",
      "MARIPOSA",
      "ELEFANTE",
      "JIRAFA",
      "COCODRILO",
      "TORTUGA",
      "CABALLO",
      "HORMIGA",
    ],
  },
  {
    // Nivel 5: frases cortas (sin espacios dentro de la sopa)
    size: 10,
    count: 7,
    directions: TODAS,
    words: [
      "EL SOL",
      "LA LUNA",
      "MI CASA",
      "MI AMIGO",
      "MI MAESTRA",
      "BUEN DIA",
      "A JUGAR",
      "UN ABRAZO",
      "A LA RONDA",
      "MI NOMBRE",
    ],
  },
  {
    // Nivel 6 en adelante: frases largas
    size: 13,
    count: 8,
    directions: TODAS,
    words: [
      "ME GUSTA JUGAR",
      "BUENOS DIAS",
      "HOLA AMIGOS",
      "VAMOS AL PATIO",
      "EL ABECEDARIO",
      "LOS NUMEROS",
      "PINTAMOS HOY",
      "SALTO Y CORRO",
      "A LA RONDA",
      "MI NOMBRE",
    ],
  },
];

// Segundos disponibles = base + segundos por cada palabra del nivel
export const TIME_BASE = 60;
export const TIME_PER_WORD = 15;

// Puntos: cada palabra vale POINTS_PER_WORD × nivel; equivocarse resta WRONG_PENALTY
export const POINTS_PER_WORD = 100;
export const WRONG_PENALTY = 5;

export const getLevelConfig = (level) => {
  const base = LEVELS[Math.min(level, LEVELS.length) - 1];
  return { ...base, time: TIME_BASE + base.count * TIME_PER_WORD };
};
