import { getLevelConfig } from "../data/words";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const randInt = (n) => Math.floor(Math.random() * n);

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const tryPlace = (grid, size, letters, directions) => {
  for (let attempt = 0; attempt < 300; attempt++) {
    const [dr, dc] = directions[randInt(directions.length)];
    const r0 = randInt(size);
    const c0 = randInt(size);
    const rEnd = r0 + dr * (letters.length - 1);
    const cEnd = c0 + dc * (letters.length - 1);
    if (rEnd < 0 || rEnd >= size || cEnd < 0 || cEnd >= size) continue;

    const cells = [];
    let ok = true;
    for (let i = 0; i < letters.length; i++) {
      const r = r0 + dr * i;
      const c = c0 + dc * i;
      if (grid[r][c] !== null && grid[r][c] !== letters[i]) {
        ok = false;
        break;
      }
      cells.push({ r, c });
    }
    if (ok) {
      cells.forEach(({ r, c }, i) => (grid[r][c] = letters[i]));
      return cells;
    }
  }
  return null;
};

// Un intento de armar la sopa; devuelve null si alguna palabra no cupo
const buildPuzzle = ({ size, directions, words }, count, needDiagonal, rounds) => {
  const diagonals = directions.filter(([dr, dc]) => dr !== 0 && dc !== 0);

  for (let round = 0; round < rounds; round++) {
    const grid = Array.from({ length: size }, () => Array(size).fill(null));
    // Las más largas primero para que quepan mejor
    const chosen = shuffle(words)
      .slice(0, count)
      .sort((a, b) => b.replace(/ /g, "").length - a.replace(/ /g, "").length);

    // Las palabras más cortas van en diagonal y se colocan primero, cuando el
    // tablero aún está vacío y caben mejor
    const nDiag = Math.min(diagonals.length ? needDiagonal : 0, chosen.length);
    const diagonalWords = chosen.slice(chosen.length - nDiag);
    const ordered = [...diagonalWords, ...chosen.slice(0, chosen.length - nDiag)];

    const placed = [];
    for (const display of ordered) {
      const letters = display.replace(/ /g, "");
      const cells = tryPlace(
        grid,
        size,
        letters,
        diagonalWords.includes(display) ? diagonals : directions,
      );
      if (!cells) break;
      placed.push({ display, letters, cells });
    }

    if (placed.length === ordered.length) {
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (grid[r][c] === null) grid[r][c] = ALPHABET[randInt(ALPHABET.length)];
        }
      }
      return { size, grid, words: shuffle(placed) };
    }
  }
  return null;
};

// Arma una sopa nueva con palabras al azar del nivel y en posiciones al azar.
// Siempre lleva diagonales (2 en los niveles de frases); si no se logra, relaja
// los requisitos poco a poco para que el juego nunca se quede sin sopa.
export const generatePuzzle = (level) => {
  const config = getLevelConfig(level);
  const wantDiagonal = level >= 5 ? 2 : 1;

  for (let count = config.count; count >= 1; count--) {
    for (const needDiagonal of [wantDiagonal, 1, 0]) {
      const puzzle = buildPuzzle(config, count, needDiagonal, 40);
      if (puzzle) return puzzle;
    }
  }
  throw new Error("No se pudo generar la sopa de letras");
};

// Celdas en línea recta (horizontal, vertical o diagonal) entre dos casillas
export const getLine = (a, b) => {
  const dr = b.r - a.r;
  const dc = b.c - a.c;
  if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return null;

  const len = Math.max(Math.abs(dr), Math.abs(dc)) + 1;
  const stepR = Math.sign(dr);
  const stepC = Math.sign(dc);
  return Array.from({ length: len }, (_, i) => ({
    r: a.r + stepR * i,
    c: a.c + stepC * i,
  }));
};
