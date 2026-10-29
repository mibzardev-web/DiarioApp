export const DIAS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];
export const MESES = [
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
export const fechaFromDate = (d) =>
  `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;

export const fechaHoy = () => fechaFromDate(new Date());

// "28 oct 2026, 3:45 p. m."
export const formatDateTime = (iso) => {
  const d = new Date(iso);
  const h = d.getHours();
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${d.getDate()} ${MESES[d.getMonth()].slice(0, 3)} ${d.getFullYear()}, ${hour12}:${min} ${h < 12 ? "a. m." : "p. m."}`;
};

export const normalize = (text) =>
  String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

// "Lunes 28 de septiembre de 2026" -> Date (o null si el texto no tiene ese formato)
export const parseFecha = (fecha) => {
  const m = normalize(fecha).match(/(\d{1,2}) de ([a-z]+) de (\d{4})/);
  const month = m ? MESES.indexOf(m[2]) : -1;
  return month >= 0 ? new Date(Number(m[3]), month, Number(m[1])) : null;
};

// Fecha real de un diario: la escrita en el campo Fecha, o la de creación si no se entiende
export const diaryDate = (diary) => {
  const parsed = parseFecha(diary.fecha);
  if (parsed) return parsed;
  const created = new Date(diary.createdAt || Number(diary.id));
  return isNaN(created) ? new Date(0) : created;
};

// "2026-09-28", para comparar días sin importar la hora
export const dayKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// Busca por fecha en texto ("lunes", "septiembre", "28", "2026") o numérica
// ("28/09/2026", "28-9-2026", "28/09")
export const matchesDate = (fecha, query) => {
  const q = normalize(query.trim()).replace(/[-.]/g, "/");
  if (!q) return true;

  let haystack = normalize(fecha);
  const parsed = parseFecha(fecha);
  if (parsed) {
    const d = parsed.getDate();
    const month = parsed.getMonth() + 1;
    const y = parsed.getFullYear();
    haystack += ` ${String(d).padStart(2, "0")}/${String(month).padStart(2, "0")}/${y} ${d}/${month}/${y}`;
  }
  return haystack.includes(q);
};

const TEXT_FIELDS = [
  "fecha",
  "campoFormativo",
  "pda",
  "descripcion",
  "alumnos",
  "analisis",
  "autoevaluacion",
  "registros",
];

// Busca la consulta en la fecha y en el texto de cualquier campo del diario
export const matchesDiary = (diary, query) => {
  const q = normalize(query.trim());
  if (!q) return true;
  if (matchesDate(diary.fecha, query)) return true;
  return TEXT_FIELDS.some((k) => normalize(diary[k]).includes(q));
};

const SECTIONS = [
  ["alumnos", "Alumnos"],
  ["descripcion", "Descripción"],
  ["analisis", "Análisis"],
  ["autoevaluacion", "Autoevaluación"],
  ["registros", "Registros"],
];

const escapeRegex = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Las maestras escriben el primer nombre ("Luis"), así que se busca esa palabra completa
export const studentKey = (nombre) => normalize(nombre).trim().split(/\s+/)[0] || "";

// Fragmentos de un diario donde aparece el alumno: [{ section, text }]
export const studentMentions = (diary, nombre) => {
  const key = studentKey(nombre);
  if (!key) return [];
  const re = new RegExp(`(^|[^a-z0-9])${escapeRegex(key)}([^a-z0-9]|$)`);

  const out = [];
  for (const [field, section] of SECTIONS) {
    const text = diary[field] || "";
    for (const sentence of text.split(/[.;\n]+/)) {
      if (re.test(normalize(sentence))) {
        const clean = sentence.trim();
        out.push({
          section,
          text: clean.length > 180 ? `${clean.slice(0, 177)}...` : clean,
        });
      }
    }
  }
  return out;
};
