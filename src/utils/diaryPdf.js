import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

const escapeHtml = (text = "") =>
  String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

// Convierte saltos de línea en párrafos y líneas que empiezan con "-" en viñetas
const formatText = (text = "") => {
  const lines = escapeHtml(text).split("\n");
  return lines
    .map((line) =>
      /^\s*[-•]\s+/.test(line)
        ? `<div class="bullet">• ${line.replace(/^\s*[-•]\s+/, "")}</div>`
        : `<p>${line}</p>`,
    )
    .join("");
};

export const buildDiaryHtml = (diary) => `
<html>
<head>
  <meta charset="utf-8" />
  <style>
    @page { margin: 24px; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #000; }
    table { width: 100%; border-collapse: collapse; }
    td, th { border: 1px solid #000; padding: 4px 6px; vertical-align: top; text-align: left; }
    p { margin: 0 0 6px 0; text-align: justify; }
    .bullet { margin: 0 0 2px 12px; }
    .title { background: #a9d18e; text-align: center; font-weight: bold; font-size: 14px; }
    .center { text-align: center; font-weight: bold; }
    .h-desc { background: #f8cbad; }
    .h-analisis { background: #f4a6f4; }
    .h-auto { background: #5bc0f8; }
    .h-reg { background: #f8a5a5; }
    .col-head { background: #f8cbad; }
    .empty { height: 28px; }
  </style>
</head>
<body>
  <table>
    <tr><th colspan="6" class="title">Diario de campo</th></tr>
    <tr class="col-head">
      <th colspan="2" class="center">FECHA</th>
      <th colspan="2" class="center">CAMPO FORMATIVO</th>
      <th colspan="2" class="center">PDA</th>
    </tr>
    <tr>
      <td colspan="2" style="text-align:center">${escapeHtml(diary.fecha)}</td>
      <td colspan="2">• ${escapeHtml(diary.campoFormativo)}</td>
      <td colspan="2">• ${escapeHtml(diary.pda)}</td>
    </tr>
    <tr>
      <th colspan="3" class="center h-desc">DESCRIPCIÓN DE LA MAÑANA DE TRABAJO</th>
      <th colspan="3" class="center h-desc">ALUMNOS</th>
    </tr>
    <tr>
      <td colspan="3">${formatText(diary.descripcion)}</td>
      <td colspan="3">${formatText(diary.alumnos)}</td>
    </tr>
    <tr><th colspan="6" class="center h-analisis">ANÁLISIS Y DESCRIPCIÓN DE LA MAÑANA DE TRABAJO</th></tr>
    <tr><td colspan="6">${formatText(diary.analisis)}</td></tr>
    <tr><th colspan="6" class="center h-auto">AUTOEVALUACIÓN</th></tr>
    <tr><td colspan="6">${formatText(diary.autoevaluacion)}</td></tr>
    <tr><th colspan="6" class="center h-reg">REGISTROS IMPORTANTES DEL DÍA</th></tr>
    <tr><td colspan="6" class="${diary.registros ? "" : "empty"}">${formatText(diary.registros)}</td></tr>
  </table>
</body>
</html>`;

// Página horizontal (A4 landscape en px a 72 PPI) como el diario original
export const exportDiaryPdf = async (diary) => {
  const { uri } = await Print.printToFileAsync({
    html: buildDiaryHtml(diary),
    width: 842,
    height: 595,
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
