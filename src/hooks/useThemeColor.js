/**
 * useThemedColor.js
 * A simple hook to pull colors from a light/dark palette defined in Colors.js
 *
 * Usage:
 *   import useThemedColor from './useThemedColor';
 *
 *   const textColor = useThemedColor("light", "text");
 *   const bgColor   = useThemedColor("dark",  "background");
 */

import { useColorScheme } from "react-native";
import { Colors } from "../constants/Colors";



/**
 * Returns a color value from the Colors palette based on the given theme and colorName.
 * If the theme or colorName doesn’t exist, will fall back to the light theme or warn.
 *
 * @param {"light"|"dark"} theme - The current theme key
 * @param {string} colorName - The color key (e.g. "primary", "background", "text")
 * @returns {string} - Hex color code
 */

const useThemedColor = (colorName) => {
  // Validate theme
  const theme = useColorScheme();

  let chosenTheme = theme;
  if (!Colors[chosenTheme]) {
    console.warn(`useThemedColor: Theme '${theme}' not found. Falling back to 'light'.`);
    chosenTheme = "light";
  }

  // Retrieve color
  const color = Colors[chosenTheme][colorName];
  if (!color) {
    console.warn(
      `useThemedColor: Color '${colorName}' not defined in theme '${chosenTheme}'. ` +
      ` Available colors: ${Object.keys(Colors[chosenTheme]).join(", ")}`
    );
    // fallback to transparent so it doesn't crash layout
    return "transparent";
  }

  return color;
};

export default useThemedColor;
