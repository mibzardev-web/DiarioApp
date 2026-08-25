import { Text } from "react-native";
import useThemedColor from "../../hooks/useThemeColor";
import globalStyles from "../../styles/globalStyles";

const ThemedText = ({
  children,
  center,
  marginBottom,
  style,
  type,
  fontSize,
  color,
}) => {
  //Estilos de colores
  //'text'
  //subText
  //linkText
  //buttonText

  const textColor = "#000";

  return (
    <Text
      style={[
        {
          textAlign: center ? "center" : "left",
          marginBottom,
          fontSize: fontSize,
          color: textColor,
        },
        type === "title" && globalStyles.title,
        type === "subtitle" && globalStyles.subtitle,
        type === "normal" && globalStyles.normal,
        type === "normalBold" && globalStyles.normalBold,
        type === "link" && globalStyles.link,
        type === "button" && globalStyles.button,
        type === "buttonNormal" && globalStyles.buttonNormal,
        style,
      ]}
    >
      {children}
    </Text>
  );
};

export default ThemedText;
