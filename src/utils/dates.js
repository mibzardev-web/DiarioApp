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
