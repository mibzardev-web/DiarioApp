import React, { useEffect, useState, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  Platform,
  Image,
  Linking,
  ActivityIndicator,
  BackHandler,
  AppState,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Navigation from "./Navigation";
import LockGate from "./src/components/LockGate";
import WelcomeScreen from "./src/Pages/WelcomeScreen";
import { useTheme, useThemeStore } from "./src/store/theme";
import { useProfileStore } from "./src/store/profile";
import { useFonts } from "expo-font";
import {
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_500Medium,
} from "@expo-google-fonts/poppins";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Updates from "expo-updates";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

// Marca que la app se reinició por una actualización (para mostrar el aviso al abrir)
const UPDATED_KEY = "@app_actualizada";

export default function App() {

  // Fuentes personalizadas cargadas
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const Palette = useTheme();
  const themeLoaded = useThemeStore((st) => st.loaded);
  const loadTheme = useThemeStore((st) => st.load);
  const profileLoaded = useProfileStore((st) => st.loaded);
  const profileName = useProfileStore((st) => st.name);
  const loadProfile = useProfileStore((st) => st.load);

  const [isLoading, setIsLoading] = useState(true);
  const [modalVisibleUpdates, setModalVisibleUpdates] = useState(false); // State for modal visibility
  const [updateStatus, setUpdateStatus] = useState("idle"); // idle | downloading | done | error
  const [justUpdated, setJustUpdated] = useState(false); // aviso al abrir tras una actualización

  useEffect(() => {
    loadTheme();
    loadProfile();
    onFetchUpdateAsync();
    showUpdatedNotice();
  }, []);

  // Si la app se reinició por una actualización, avisa que ya quedó lista
  async function showUpdatedNotice() {
    try {
      if ((await AsyncStorage.getItem(UPDATED_KEY)) !== "1") return;
      await AsyncStorage.removeItem(UPDATED_KEY);
      setJustUpdated(true);
      setTimeout(() => setJustUpdated(false), 4000);
    } catch (error) {
      console.error(`Error reading update notice: ${error}`);
    }
  }

  async function onFetchUpdateAsync() {
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        setModalVisibleUpdates(true); // Mostrar el modal para la actualización
      }
    } catch (error) {
      console.error(`Error fetching latest Expo update: ${error}`);
    }
  }


  const handleUpdate = async () => {
    setUpdateStatus("downloading");
    try {
      await Updates.fetchUpdateAsync(); // Descarga la actualización
      await AsyncStorage.setItem(UPDATED_KEY, "1"); // Para avisar al volver a abrir
      setUpdateStatus("done");
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Deja ver el mensaje
      await Updates.reloadAsync(); // Reinicia la app con la nueva versión
    } catch (error) {
      console.error("Error al actualizar la app:", error);
      await AsyncStorage.removeItem(UPDATED_KEY);
      setUpdateStatus("error");
    }
  };

  const handleExitApp = () => {
    BackHandler.exitApp(); // Solo funciona en Android
  };

  // Mostrar indicador de carga si las fuentes no están cargadas o si los datos están siendo procesados
  if (!fontsLoaded || !themeLoaded || !profileLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Palette.primary} />
      </View>
    );
  }


  return (
    <>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container} edges={["left", "right"]}>
          {modalVisibleUpdates ? (
            <>
              <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisibleUpdates}
                onRequestClose={() => {
                  // Do nothing to prevent modal from closing via back button
                  return;
                }}
              >
                <View style={styles.modalContainerUpdate}>
                  <View style={styles.modalViewUpdate}>
                    <View style={styles.bottomRowUpdate}>
                      <Image
                        source={require("./assets/icon.png")} // Adjust path to your app icon
                        style={styles.appIcon}
                      />
                      <View style={styles.appInfo}>
                        <Text style={styles.appNameUpdate}>Diario de Campo</Text>
                     
                        {updateStatus === "idle" && (
                          <View style={styles.versionContainer}>
                            <Text
                              style={[
                                styles.versionText,
                                { textAlign: "center" },
                              ]}
                            >
                              Existe una nueva version. ¿Deseas descargarla? En
                              caso de no hacerlo, no podras ingresar a la
                              aplicación de Diario de Campo.
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    {updateStatus === "downloading" && (
                      <View style={styles.updateStatus}>
                        <ActivityIndicator size="large" color={Palette.primary} />
                        <Text style={styles.updateStatusTitle}>
                          Descargando actualización...
                        </Text>
                        <Text style={styles.versionText}>
                          No cierres la app, esto toma unos segundos.
                        </Text>
                      </View>
                    )}

                    {updateStatus === "done" && (
                      <View style={styles.updateStatus}>
                        <MaterialCommunityIcons
                          name="check-circle"
                          size={48}
                          color="#66BB6A"
                        />
                        <Text style={styles.updateStatusTitle}>
                          ¡Listo, ya se actualizó!
                        </Text>
                        <Text style={styles.versionText}>
                          Reiniciando la app...
                        </Text>
                      </View>
                    )}

                    {updateStatus === "error" && (
                      <View style={styles.updateStatus}>
                        <MaterialCommunityIcons
                          name="alert-circle-outline"
                          size={48}
                          color="#EF5350"
                        />
                        <Text style={styles.updateStatusTitle}>
                          No se pudo actualizar
                        </Text>
                        <Text style={styles.versionText}>
                          Revisa tu internet e inténtalo de nuevo.
                        </Text>
                      </View>
                    )}

                    {(updateStatus === "idle" || updateStatus === "error") && (
                      <TouchableOpacity
                        style={[styles.buttonUpdatesCorrect, { backgroundColor: Palette.primary }]}
                        onPress={handleUpdate}
                      >
                        <MaterialCommunityIcons
                          name="refresh"
                          size={24}
                          color="#ccc"
                        />
                        <Text style={styles.buttonText}>
                          {updateStatus === "error" ? "Reintentar" : "Actualizar"}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </Modal>
            </>
          ) : (
            <LockGate>
              {profileName ? <Navigation /> : <WelcomeScreen />}
            </LockGate>
          )}
          {justUpdated && (
            <View
              style={[styles.updatedNotice, { backgroundColor: Palette.dark }]}
              pointerEvents="none"
            >
              <MaterialCommunityIcons name="check-circle" size={22} color="#A5D6A7" />
              <Text style={styles.updatedNoticeText}>
                ¡Listo! Diario de Campo ya se actualizó
              </Text>
            </View>
          )}
          <StatusBar
            barStyle="light-content"
            translucent={false}
            backgroundColor={Palette.dark}
            animated={true}
          />
        </SafeAreaView>
      </SafeAreaProvider>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#0D1117",
    padding: 20,
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
  },
  appIcon: {
    width: 80,
    height: 80,
    marginRight: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
  },
  appInfo: {
    justifyContent: "center",
  },
  appName: {
    fontSize: 20,
    fontFamily: "Poppins_600SemiBold",
    color: "#FFF",
    marginBottom: 5,
  },
  creatorName: {
    fontSize: 12,
    color: "#4493F8",
    marginBottom: 5,
    fontFamily: "Poppins_600SemiBold",
  },
  versionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  versionText: {
    marginLeft: 5,
    fontSize: 12,
    color: "#ccc",
    fontFamily: "Poppins_600SemiBold",
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 10,
    width: "90%",
    marginTop: 30,
  },
  buttonText: {
    color: "white",
    fontFamily: "Poppins_600SemiBold",
    textAlign: "center",
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 20,
    width: "100%",
  },
  buttonUpdatesCorrect: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007BFF", // Customize the button color
    padding: 10,
    borderRadius: 10,
    width: "100%",
    marginTop: 30,
    gap: 20,
    justifyContent: "center",
  },
  buttonUpdates: {
    padding: 10,
    borderRadius: 10,
    width: "90%",
    marginTop: 30,
    borderColor: "#ccc",
    borderWidth: 1,
  },
  buttonText: {
    color: "white",
    fontFamily: "Poppins_600SemiBold",
    textAlign: "center",
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start", // Align items to the start
    marginTop: 20, // Space above the bottom row
    width: "100%", // Full width of the modal
  },
  updateStatus: {
    alignItems: "center",
    gap: 8,
    marginTop: 24,
  },
  updateStatusTitle: {
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    color: "#FFF",
    textAlign: "center",
  },
  updatedNotice: {
    position: "absolute",
    top: 12,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    elevation: 8,
    zIndex: 100,
  },
  updatedNoticeText: {
    color: "#FFF",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
  },
  modalContainerUpdate: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)", // Fondo más oscuro para mejor contraste
  },
  modalViewUpdate: {
    backgroundColor: "#2C2F33", // Fondo más elegante
    borderColor: "#3D444D",
    borderWidth: 1,
    borderRadius: 15, // Bordes más redondeados
    padding: 20,
    alignItems: "center",
    width: "85%", // Ajusta el ancho del modal
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8, // Para sombras en Android
  },
  bottomRowUpdate: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start", // Align items to the start
    marginTop: 20, // Space above the bottom row
    width: "100%", // Full width of the modal
  },
  appNameUpdate: {
    fontSize: 20,
    fontFamily: "Poppins_600SemiBold",
    color: "#FFF",
    marginBottom: 5,
    textAlign: "center",
  },
  creatorNameUpdate: {
    fontSize: 12,
    color: "#4493F8",
    marginBottom: 5,
    fontFamily: "Poppins_600SemiBold",
    textAlign: "center",
  },
});
