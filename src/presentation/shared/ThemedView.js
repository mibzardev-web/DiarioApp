import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useThemedColor from "../../hooks/useThemeColor";

const ThemedView = ({
  style,
  margin = false,
  children,
  safe = false,
  flex = false,
  row = false,
  justifyContent = "none",
  center,
}) => {
  const safeArea = useSafeAreaInsets();

  return (
    <View
      style={[
        {
          flex: flex ? 1 : 0,
          paddingTop: safe ? safeArea.top : 0,
          marginHorizontal: margin ? 20 : 0,
          flexDirection: row ? "row" : "none",
          justifyContent: justifyContent,
          alingnItems: center ? "center" : "none",
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

export default ThemedView;
