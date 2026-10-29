import * as SecureStore from "expo-secure-store";
import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PIN_KEY = "diario.pin";
const BIOMETRIC_KEY = "@seguridad_biometria";

export const PIN_LENGTH = 4;

// El PIN vive en el almacén seguro del teléfono (Keychain / Keystore)
export const hasPin = async () => !!(await SecureStore.getItemAsync(PIN_KEY));

export const setPin = (pin) => SecureStore.setItemAsync(PIN_KEY, pin);

export const checkPin = async (pin) =>
  pin === (await SecureStore.getItemAsync(PIN_KEY));

export const removePin = async () => {
  await SecureStore.deleteItemAsync(PIN_KEY);
  await AsyncStorage.removeItem(BIOMETRIC_KEY);
};

export const isBiometricEnabled = async () =>
  (await AsyncStorage.getItem(BIOMETRIC_KEY)) === "1";

export const setBiometricEnabled = (enabled) =>
  enabled
    ? AsyncStorage.setItem(BIOMETRIC_KEY, "1")
    : AsyncStorage.removeItem(BIOMETRIC_KEY);

// ¿El teléfono tiene huella/rostro y ya hay una registrada?
export const biometricAvailable = async () =>
  (await LocalAuthentication.hasHardwareAsync()) &&
  (await LocalAuthentication.isEnrolledAsync());

export const authenticateBiometric = async (promptMessage = "Desbloquear Diario de Campo") => {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage,
    cancelLabel: "Usar PIN",
    disableDeviceFallback: true,
  });
  return result.success;
};
