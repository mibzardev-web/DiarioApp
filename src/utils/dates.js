const DIAS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];
const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

// "Miércoles 28 de octubre de 2026"
export const fechaHoy = () => {
  const d = new Date();
  return `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
};

// "28 oct 2026, 3:45 p. m."
export const formatDateTime = (iso) => {
  const d = new Date(iso);
  const h = d.getHours();
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${d.getDate()} ${MESES[d.getMonth()].slice(0, 3)} ${d.getFullYear()}, ${hour12}:${min} ${h < 12 ? "a. m." : "p. m."}`;
};

const normalize = (text) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

// Busca por fecha en texto ("lunes", "septiembre", "28", "2026") o numérica
// ("28/09/2026", "28-9-2026", "28/09")
export const matchesDate = (fecha, query) => {
  const q = normalize(query.trim()).replace(/[-.]/g, "/");
  if (!q) return true;

  let haystack = normalize(fecha || "");
  const m = haystack.match(/(\d{1,2}) de ([a-z]+) de (\d{4})/);
  const month = m ? MESES.indexOf(m[2]) + 1 : 0;
  if (month) {
    const d = Number(m[1]);
    const mm = String(month).padStart(2, "0");
    haystack += ` ${String(d).padStart(2, "0")}/${mm}/${m[3]} ${d}/${month}/${m[3]}`;
  }
  return haystack.includes(q);
};
