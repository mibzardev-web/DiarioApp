import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Asset } from "expo-asset";

// Century Gothic (la del diario original) no existe en el teléfono, así que se
// incrusta Poppins, que es una geométrica muy parecida.
const FONT_FILES = [
  {
    weight: 400,
    module: require("@expo-google-fonts/poppins/400Regular/Poppins_400Regular.ttf"),
  },
  {
    weight: 700,
    module: require("@expo-google-fonts/poppins/700Bold/Poppins_700Bold.ttf"),
  },
];

let fontCssCache = null;

const toDataUri = async (module) => {
  const asset = Asset.fromModule(module);
  await asset.downloadAsync();
  const blob = await (await fetch(asset.localUri || asset.uri)).blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const getFontCss = async () => {
  if (fontCssCache !== null) return fontCssCache;
  try {
    const faces = await Promise.all(
      FONT_FILES.map(
        async ({ weight, module }) =>
          `@font-face { font-family: 'DiarioFont'; font-weight: ${weight}; src: url('${await toDataUri(module)}') format('truetype'); }`,
      ),
    );
    fontCssCache = faces.join("\n");
  } catch (e) {
    fontCssCache = ""; // sin fuente incrustada se usa la del sistema
  }
  return fontCssCache;
};

const escapeHtml = (text = "") =>
  String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

// Convierte saltos de línea en párrafos y líneas que empiezan con "-" en viñetas
const formatText = (text = "") =>
  escapeHtml(text)
    .split("\n")
    .map((line) =>
      /^\s*[-•]\s+/.test(line)
        ? `<div class="bullet">• ${line.replace(/^\s*[-•]\s+/, "")}</div>`
        : `<p>${line}</p>`,
    )
    .join("");

// Colores y tamaños tomados del diario de campo original
const buildDiaryTable = (diary) => `
  <table>
    <tr><th colspan="6" class="title">Diario de campo</th></tr>
    <tr>
      <th colspan="2" class="h-peach">FECHA</th>
      <th colspan="2" class="h-peach">CAMPO FORMATIVO</th>
      <th colspan="2" class="h-peach">PDA</th>
    </tr>
    <tr>
      <td colspan="2" class="center">${escapeHtml(diary.fecha)}</td>
      <td colspan="2">• ${escapeHtml(diary.campoFormativo)}</td>
      <td colspan="2">• ${escapeHtml(diary.pda)}</td>
    </tr>
    <tr>
      <th colspan="3" class="h-peach">DESCRIPCIÓN DE LA MAÑANA DE TRABAJO</th>
      <th colspan="3" class="h-peach">ALUMNOS</th>
    </tr>
    <tr>
      <td colspan="3">${formatText(diary.descripcion)}</td>
      <td colspan="3">${formatText(diary.alumnos)}</td>
    </tr>
    <tr><th colspan="6" class="h-analisis">ANÁLISIS Y DESCRIPCIÓN DE LA MAÑANA DE TRABAJO</th></tr>
    <tr><td colspan="6">${formatText(diary.analisis)}</td></tr>
    <tr><th colspan="6" class="h-auto">AUTOEVALUACIÓN</th></tr>
    <tr><td colspan="6">${formatText(diary.autoevaluacion)}</td></tr>
    <tr><th colspan="6" class="h-reg">REGISTROS IMPORTANTES DEL DÍA</th></tr>
    <tr><td colspan="6" class="${diary.registros ? "" : "empty"}">${formatText(diary.registros)}</td></tr>
  </table>
`;

const buildDocument = (bodyHtml, fontCss = "") => `
<html>
<head>
  <meta charset="utf-8" />
  <style>
    ${fontCss}
    @page { margin: 0; }
    body {
      margin: 0;
      font-family: 'DiarioFont', 'Century Gothic', 'Trebuchet MS', Arial, sans-serif;
      font-size: 7px;
      color: #000;
    }
    table { width: 100%; border-collapse: collapse; table-layout: fixed; }
    td, th { border: 1px solid #000; padding: 1px 3px; vertical-align: top; text-align: left; line-height: 1.25; }
    th { font-weight: 700; text-align: center; }
    p { margin: 0; text-align: justify; }
    .bullet { margin: 0 0 0 10px; text-align: justify; }
    .title { background: #A8D08D; font-size: 8.4px; }
    .h-peach { background: #F7CAAC; }
    .h-analisis { background: #F89EF6; }
    .h-auto { background: #66CCFF; }
    .h-reg { background: #FCAAA8; }
    .center { text-align: center; }
    .empty { height: 14px; }
  
    .page { padding: 38px 36px; page-break-after: always; }
    .page:last-child { page-break-after: auto; }
  </style>
</head>
<body>
  ${bodyHtml}
</body>
</html>`;

export const buildDiaryHtml = (diary, fontCss = "") =>
  buildDocument(`<div class="page">${buildDiaryTable(diary)}</div>`, fontCss);

// Varios diarios en un solo documento, uno por hoja
export const buildDiariesHtml = (diaries, fontCss = "") =>
  buildDocument(
    diaries.map((d) => `<div class="page">${buildDiaryTable(d)}</div>`).join(""),
    fontCss,
  );

// Carta horizontal (792x612), igual que el diario original
export const exportDiaryPdf = async (diary) => {
  const { uri } = await Print.printToFileAsync({
    html: buildDiaryHtml(diary, await getFontCss()),
    width: 792,
    height: 612,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      UTI: "com.adobe.pdf",
      dialogTitle: `Diario ${diary.fecha}`,
    });
  }
  return uri;
};

// Un solo PDF con varios diarios (una hoja por día)
export const exportDiariesPdf = async (diaries, title = "Diarios de campo") => {
  const { uri } = await Print.printToFileAsync({
    html: buildDiariesHtml(diaries, await getFontCss()),
    width: 792,
    height: 612,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      UTI: "com.adobe.pdf",
      dialogTitle: title,
    });
  }
  return uri;
};
