import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PIN_KEY = "diario.pin";
const BIOMETRIC_KEY = "@seguridad_biometria";
const METHOD_KEY = "@seguridad_metodo";

export const PIN_LENGTH = 4;

// Métodos de bloqueo:
//  - "none":      sin bloqueo
//  - "pin":       PIN de 4 dígitos propio de la app (con huella/rostro opcional como atajo)
//  - "biometric": huella o rostro registrados en el teléfono
//  - "device":    PIN, patrón o contraseña con que se desbloquea el teléfono
export const getMethod = async () => {
  const saved = await AsyncStorage.getItem(METHOD_KEY);
  if (saved) return saved;
  // Compatibilidad: quien ya tenía un PIN antes de que existieran los métodos
  return (await hasPin()) ? "pin" : "none";
};

export const setMethod = (method) => AsyncStorage.setItem(METHOD_KEY, method);

// ---------- PIN de la app ----------
// Vive en el almacén seguro del teléfono (Keychain / Keystore)
export const hasPin = async () => !!(await SecureStore.getItemAsync(PIN_KEY));

export const setPin = (pin) => SecureStore.setItemAsync(PIN_KEY, pin);

export const checkPin = async (pin) =>
  pin === (await SecureStore.getItemAsync(PIN_KEY));

export const removePin = async () => {
  await SecureStore.deleteItemAsync(PIN_KEY);
  await AsyncStorage.removeItem(BIOMETRIC_KEY);
};

// Huella/rostro como atajo dentro del método "pin"
export const isBiometricEnabled = async () =>
  (await AsyncStorage.getItem(BIOMETRIC_KEY)) === "1";

export const setBiometricEnabled = (enabled) =>
  enabled
    ? AsyncStorage.setItem(BIOMETRIC_KEY, "1")
    : AsyncStorage.removeItem(BIOMETRIC_KEY);

// ---------- Lo que tiene el teléfono ----------
const { AuthenticationType, SecurityLevel } = LocalAuthentication;

// "Huella", "Face ID", etc. según lo que soporte el teléfono
const biometricName = (types) => {
  const finger = types.includes(AuthenticationType.FINGERPRINT);
  const face = types.includes(AuthenticationType.FACIAL_RECOGNITION);
  if (finger && face) return "Huella o rostro";
  if (face) return Platform.OS === "ios" ? "Face ID" : "Reconocimiento facial";
  if (finger) return Platform.OS === "ios" ? "Touch ID" : "Huella digital";
  return "Huella o rostro";
};

// ¿Qué puede usar este teléfono? Revisa el hardware y lo que el usuario ya registró.
export const getCapabilities = async () => {
  try {
    const [hardware, enrolled, level, types] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
      LocalAuthentication.getEnrolledLevelAsync(),
      LocalAuthentication.supportedAuthenticationTypesAsync(),
    ]);
    return {
      // huella o rostro ya registrados
      biometric: (hardware && enrolled) || level >= SecurityLevel.BIOMETRIC_WEAK,
      biometricLabel: biometricName(types),
      biometricHardware: hardware, // tiene lector aunque no haya registrado nada
      // el teléfono tiene PIN, patrón o contraseña para desbloquearse
      device: level >= SecurityLevel.SECRET,
    };
  } catch (e) {
    return { biometric: false, biometricLabel: "Huella o rostro", biometricHardware: false, device: false };
  }
};

// ---------- Autenticación ----------
// method "biometric": solo huella/rostro. method "device": huella/rostro y, si no, el
// PIN, patrón o contraseña del teléfono.
export const authenticateWith = async (
  method,
  promptMessage = "Desbloquear Diario de Campo",
) => {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      cancelLabel: "Cancelar",
      fallbackLabel: "Usar código del teléfono",
      disableDeviceFallback: method === "biometric",
    });
    return result.success;
  } catch (e) {
    return false;
  }
};
