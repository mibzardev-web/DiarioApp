import { StyleSheet } from 'react-native';

export const globalStyles = StyleSheet.create({
  title: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 30,
  },
  subtitle: {
    fontFamily: "Poppins_500Medium",
    fontSize: 20,
  },
  normal: {
    fontFamily: "Poppins_400Regular",
    fontSize: 15,
  },
  normalBold: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
  },
  link: {
    fontFamily: "Poppins_400Regular",
    fontSize: 15,
    textDecorationLine: 'underline',
    color: "#2563EB"
  },
  description: {
    fontFamily: "Poppins_400Regular",
    fontSize: 15,
  },
  button: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
    color: "#FFFFFF",
  },
  buttonNormal: {
    fontFamily: "Poppins_400Regular",
  },


  buttonGlobalStyle: {
    backgroundColor: "#172554",
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10
  }
});

export default globalStyles;