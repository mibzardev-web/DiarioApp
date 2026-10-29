/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

// Paletas pastel de la app (el PDF conserva los colores del diario original).
// Se elige en Ajustes; los componentes la leen con useTheme().
export const PALETTES = {
  lavanda: {
    label: "Lavanda",
    primary: "#8E6CCB", // botones, tab activo
    dark: "#4A3A7A", // headers y tarjeta principal
    background: "#F6F2FD", // fondo de pantallas
    tint: "#EADFFB", // fondos de iconos
    border: "#D9CCF2",
    text: "#4B4468",
    subText: "#7D7499",
    muted: "#A79FC2",
    selected: "#B79CE8",
    danger: "#D9577F",
    dangerBg: "#FDECF2",
  },
  rosa: {
    label: "Rosa",
    primary: "#D9719C",
    dark: "#7A3A58",
    background: "#FDF2F7",
    tint: "#FBDDEA",
    border: "#F3C9DB",
    text: "#6B3F55",
    subText: "#9A6B82",
    muted: "#C9A3B6",
    selected: "#EBA3C0",
    danger: "#C2410C",
    dangerBg: "#FFF1E8",
  },
  menta: {
    label: "Menta",
    primary: "#4FA88A",
    dark: "#25594A",
    background: "#F0FAF6",
    tint: "#D6F2E7",
    border: "#BFE6D6",
    text: "#2F5247",
    subText: "#5E8478",
    muted: "#93B8AB",
    selected: "#8AD3B9",
    danger: "#D9577F",
    dangerBg: "#FDECF2",
  },
  cielo: {
    label: "Cielo",
    primary: "#5B8FD9",
    dark: "#2F4A7A",
    background: "#F1F6FD",
    tint: "#DCE8FA",
    border: "#C5D8F2",
    text: "#34496B",
    subText: "#667F9F",
    muted: "#9DB2CF",
    selected: "#9DBDEB",
    danger: "#D9577F",
    dangerBg: "#FDECF2",
  },
  durazno: {
    label: "Durazno",
    primary: "#E08A5C",
    dark: "#7A4326",
    background: "#FEF5EF",
    tint: "#FBE2D2",
    border: "#F3CFB8",
    text: "#6B4630",
    subText: "#9A7560",
    muted: "#C9A996",
    selected: "#F0B592",
    danger: "#C2185B",
    dangerBg: "#FDE8F1",
  },
};

export const DEFAULT_PALETTE = "lavanda";
export const Palette = PALETTES[DEFAULT_PALETTE];

export const Colors = {
  light: {
    text: '#45556C',
    subText: "#CCC",
    background: '#FFFF',
    iconColor: "#475569",
    linkText: "#007BFF",
    buttonText: "#FFF",
  },
  dark: {
    text: '#45556C',
    subText: "#CCC",
    background: '#0B1013',
    iconColor: "#FFF",
    linkText: "#007BFF",
    buttonText: "#FFF",
  },
};