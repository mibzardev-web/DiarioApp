import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AsyncStorage from "@react-native-async-storage/async-storage";

//Iconos
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";

//Importaciones de React Native
import { Text, Image, TouchableOpacity, StyleSheet, Alert } from "react-native";

//Estados Globales
import useGlobalState from "./src/store/auth";
import useThemedColor from "./src/hooks/useThemeColor.js";

// Screens Home
import HomeScreen from "./src/pages/home/HomeScreen";
import DetallesConsumoScreen from "./src/pages/home/DetallesConsumo.js";

// Screens Pagos
import PagoRecargaScreen from "./src/pages/pagos/PagoRecargaScreen.js";
import PagoEsimScreen from "./src/pages/pagos/PagoEsimScreen.js";
import PagoSimScreen from "./src/pages/pagos/PagoSimScreen.js";
import AgregarTarjetaScreen from "./src/pages/pagos/AgregarTarjetaScreen.js";
import VerificarPagoScreen from "./src/pages/pagos/VerificarPagoScreen.js";
import SuccessScreen from "./src/pages/pagos/SuccessScreen.js";
import ErrorScreen from "./src/pages/pagos/ErrorScreen.js";

// Screens Login
import InicioScreen from "./src/pages/login/InicioScreen.js";
import LoginScreen from "./src/pages/login/LoginScreen.js";
import RegisterScreen from "./src/pages/login/RegisterScreen.js";
import LoadingScreen from "./src/pages/login/LoadingScreen.js";
import ResetPasswordScreen from "./src/pages/login/ResetPasswordScreen.js";

// Screens Cliente
import ClienteScreen from "./src/pages/cliente/ClienteScreen.js";
import CambiarNumeroScreen from "./src/pages/cliente/CambiarNumeroScreen.js";

// Screens Saldo
import SaldoScreen from "./src/pages/saldo/SaldoScreen.js";
import HomeSaldoScreen from "./src/pages/saldo/HomeSaldoScreen.js";

// Screens eSIM
import ImeiEsimScreen from "./src/pages/Esim/ImeiEsimScreen.js";
import CompraEsimScreen from "./src/pages/Esim/CompraEsimScreen.js";

// Screens Perfil
import HomePerfilScreen from "./src/pages/perfil/HomePerfilScreen.js";
import MisEsimScreen from "./src/pages/perfil/MisEsimScreen.js";
import FormasPagoScreen from "./src/pages/perfil/FormasPagoScreen.js";
import MisComprasScreen from "./src/pages/perfil/MisComprasScreen.js";
import FacturasScreen from "./src/pages/perfil/FacturasScreen.js";
import AyudaScreen from "./src/pages/perfil/AyudaScreen.js";

// Screens Familia
import AgregarFamiliaScreen from "./src/pages/familia/AgregarFamiliaScreen.js";

// Screens Portabilidad
import HomePortabilidadScreen from "./src/pages/portabilidad/HomePortabilidadScreen.js";
import DistribuidorSimScreen from "./src/pages/portabilidad/DistribuidorSimScreen.js";
import ComprarSimScreen from "./src/pages/portabilidad/ComprarSimScreen.js";

//Stacks
const Stack = createNativeStackNavigator();
const StackHome = createNativeStackNavigator();

//Button Tabs
const Tab = createBottomTabNavigator();
const linking = {
  prefixes: ["michuliphone://"],
  config: {
    screens: {
      Home: "",
      VerificarPagoScreen: "verificar-pago",
      ErrorScreen: "pago-error",
      SuccessScreen: "pago-exitoso",
    },
  },
};

function MyStackPrincipal() {
  const navigation = useNavigation();

  const { userData } = useGlobalState();

  return (
    <Stack.Navigator
      initialRouteName="LoadingScreen"
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerTintColor: "#FFF", // Color del texto del header
        headerStyle: {
          backgroundColor: "#001D3D", // Color de fondo del header
        },
      }}
    >
      <Stack.Screen
        name="LoadingScreen"
        component={LoadingScreen}
        options={{
          headerShown: false,
          title: "", // Título vacío
        }}
      />
      <Stack.Screen
        name="InicioScreen"
        component={InicioScreen}
        options={{
          headerShown: false,
          title: "", // Título vacío
        }}
      />
      <Stack.Screen
        name="LoginScreen"
        component={LoginScreen}
        options={{
          headerShown: false,
          title: "", // Título vacío
        }}
      />
      <Stack.Screen
        name="RegisterScreen"
        component={RegisterScreen}
        options={{
          headerShown: false,
          title: "", // Título vacío
        }}
      />
      <Stack.Screen
        name="ResetPasswordScreen"
        component={ResetPasswordScreen}
        options={{
          headerShown: false,
          title: "", // Título vacío
        }}
      />
      <Stack.Screen
        name="PagoRecargaScreen"
        component={PagoRecargaScreen}
        options={{
          headerShown: true,
          title: "Confirmar Datos",
          headerTintColor: "#FFF",
          headerTitleStyle: {
            fontFamily: "Poppins_500Medium",
            fontSize: 20,
          },
          headerTitleAlign: "center",
          headerLeft: () => (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                }
              }}
            >
              <MaterialIcons name="chevron-left" color="#FFF" size={20} />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="PagoEsimScreen"
        component={PagoEsimScreen}
        options={{
          headerShown: true,
          title: "Confirmar Datos",
          headerTintColor: "#FFF",
          headerTitleStyle: {
            fontFamily: "Poppins_500Medium",
            fontSize: 20,
          },
          headerTitleAlign: "center",
          headerLeft: () => (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                }
              }}
            >
              <MaterialIcons name="chevron-left" color="#FFF" size={20} />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="PagoSimScreen"
        component={PagoSimScreen}
        options={{
          headerShown: true,
          title: "Comprar SIM",
          headerTintColor: "#FFF",
          headerTitleStyle: {
            fontFamily: "Poppins_500Medium",
            fontSize: 20,
          },
          headerTitleAlign: "center",
          headerLeft: () => (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                }
              }}
            >
              <MaterialIcons name="chevron-left" color="#FFF" size={20} />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="AgregarTarjetaScreen"
        component={AgregarTarjetaScreen}
        options={{
          headerShown: true,
          title: "Agregar Tarjeta",
          headerTintColor: "#FFF",
          headerTitleStyle: {
            fontFamily: "Poppins_500Medium",
            fontSize: 20,
          },
          headerTitleAlign: "center",
          headerLeft: () => (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                }
              }}
            >
              <MaterialIcons name="chevron-left" color="#FFF" size={20} />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="AgregarFamiliaScreen"
        component={AgregarFamiliaScreen}
        options={{
          headerShown: false,
          title: "",
        }}
      />
      {userData?.id ? (
        <Stack.Screen
          name="CambiarNumeroScreen"
          component={CambiarNumeroScreen}
          options={{
            headerShown: true,
            title: "Cambiar Número",
            headerTintColor: "#FFF",
            headerTitleStyle: {
              fontFamily: "Poppins_500Medium",
              fontSize: 20,
            },
            headerTitleAlign: "center",
            headerLeft: () => (
              <TouchableOpacity
                style={[styles.backButton, { marginVertical: 25 }]}
                onPress={() => {
                  if (navigation.canGoBack()) {
                    navigation.goBack();
                  }
                }}
              >
                <MaterialIcons name="chevron-left" color="#FFF" size={20} />
              </TouchableOpacity>
            ),
          }}
        />
      ) : (
        <Stack.Screen
          name="CambiarNumeroScreen"
          component={CambiarNumeroScreen}
          options={{
            headerShown: false,
            title: "",
          }}
        />
      )}
      <Stack.Screen
        name="ClienteScreen"
        component={ClienteScreen}
        options={{
          headerShown: false,
          title: "", // Título vacío
        }}
      />

      <Stack.Screen
        name="VerificarPagoScreen"
        component={VerificarPagoScreen}
        options={{
          headerShown: false,
          title: "", // Título vacío
        }}
      />

      <Stack.Screen
        name="SuccessScreen"
        component={SuccessScreen}
        options={{
          headerShown: false,
          title: "", // Título vacío
        }}
      />
      <Stack.Screen
        name="ErrorScreen"
        component={ErrorScreen}
        options={{
          headerShown: false,
          title: "", // Título vacío
        }}
      />

      {/* Compra Esim Screens */}
      <Stack.Screen
        name="ImeiEsimScreen"
        component={ImeiEsimScreen}
        options={{
          headerShown: false,
          title: "", // Título vacío
        }}
      />
      <Stack.Screen
        name="CompraEsimScreen"
        component={CompraEsimScreen}
        options={{
          headerShown: true,
          title: "Comprar eSIM", // Título vacío
          headerTintColor: "#FFF", // Color del texto o íconos del header
          headerTitleStyle: {
            fontFamily: "Poppins_500Medium", // Fuente personalizada
            fontSize: 20, // Tamaño de fuente (opcional)
          },
          headerTitleAlign: "center", // 👈 Esto centra el texto
          headerLeft: () => (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                }
              }}
            >
              <MaterialIcons name="chevron-left" color="#FFF" size={20} />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="PortabilidadScreen"
        component={HomePortabilidadScreen}
        options={{
          headerShown: true,
          title: "Portabilidad", // Título vacío
          headerTintColor: "#FFF", // Color del texto o íconos del header
          headerTitleStyle: {
            fontFamily: "Poppins_500Medium", // Fuente personalizada
            fontSize: 20, // Tamaño de fuente (opcional)
          },
          headerTitleAlign: "center", // 👈 Esto centra el texto
          headerLeft: () => (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                }
              }}
            >
              <MaterialIcons name="chevron-left" color="#FFF" size={20} />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Saldo Screens */}
      <Stack.Screen
        name="SaldoScreen"
        component={SaldoScreen}
        options={{
          headerShown: false,
          title: "", // Título vacío
        }}
      />
      <Stack.Screen
        name="HomeSaldoScreen"
        component={HomeSaldoScreen}
        options={{
          headerShown: true,
          title: "Comprar saldo", // Título vacío
          headerTintColor: "#FFF", // Color del texto o íconos del header
          headerTitleStyle: {
            fontFamily: "Poppins_500Medium", // Fuente personalizada
            fontSize: 20, // Tamaño de fuente (opcional)
          },
          headerTitleAlign: "center", // 👈 Esto centra el texto
          headerLeft: () => (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                }
              }}
            >
              <MaterialIcons name="chevron-left" color="#FFF" size={20} />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Inicio de aplicacion */}
      <Stack.Screen
        name="Home"
        component={TabsNavigator}
        options={{
          headerShown: false,
          title: "", // Título vacío
        }}
      />
    </Stack.Navigator>
  );
}

function MyStackHome() {
  const navigation = useNavigation();

  return (
    <StackHome.Navigator
      initialRouteName="HomeScreen"
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerTintColor: "#FFF", // Color del texto del header
        headerStyle: {
          backgroundColor: "#001D3D", // Color de fondo del header
        },
      }}
    >
      <StackHome.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{
          headerShown: false,
          title: "", // Título vacío
          headerTintColor: "#FFF", // Color del texto o íconos del header
          headerTitleStyle: {
            fontFamily: "Poppins_500Medium", // Fuente personalizada
            fontSize: 20, // Tamaño de fuente (opcional)
          },
          headerTitleAlign: "center", // 👈 Esto centra el texto
        }}
      />
      <StackHome.Screen
        name="DetallesConsumoScreen"
        component={DetallesConsumoScreen}
        options={({ navigation: nav }) => ({
          headerShown: true,
          title: "Detalles de consumo", // Título vacío
          headerTintColor: "#FFF", // Color del texto o íconos del header
          headerTitleStyle: {
            fontFamily: "Poppins_500Medium", // Fuente personalizada
            fontSize: 20, // Tamaño de fuente (opcional)
          },
          headerTitleAlign: "center", // 👈 Esto centra el texto
          headerLeft: () => (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                if (nav.canGoBack()) {
                  nav.goBack();
                }
              }}
            >
              <MaterialIcons name="chevron-left" color="#FFF" size={20} />
            </TouchableOpacity>
          ),
        })}
      />
    </StackHome.Navigator>
  );
}

function MyStackSaldo() {
  const navigation = useNavigation();

  return (
    <StackHome.Navigator
      initialRouteName="HomeSaldoScreen"
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerTintColor: "#FFF", // Color del texto del header
        headerStyle: {
          backgroundColor: "#001D3D", // Color de fondo del header
        },
      }}
    >
      <StackHome.Screen
        name="HomeSaldoScreen"
        component={HomeSaldoScreen}
        options={{
          headerShown: true,
          title: "Comprar saldo", // Título vacío
          headerTintColor: "#FFF", // Color del texto o íconos del header
          headerTitleStyle: {
            fontFamily: "Poppins_500Medium", // Fuente personalizada
            fontSize: 20, // Tamaño de fuente (opcional)
          },
          headerTitleAlign: "center", // 👈 Esto centra el texto
          headerLeft: () => (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                }
              }}
            >
              <MaterialIcons name="chevron-left" color="#FFF" size={20} />
            </TouchableOpacity>
          ),
        }}
      />
    </StackHome.Navigator>
  );
}

function MyStackPortabilidad() {
  const navigation = useNavigation();

  return (
    <StackHome.Navigator
      initialRouteName="HomePortabilidadScreen"
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerTintColor: "#FFF", // Color del texto del header
        headerStyle: {
          backgroundColor: "#001D3D", // Color de fondo del header
        },
      }}
    >
      <StackHome.Screen
        name="HomePortabilidadScreen"
        component={HomePortabilidadScreen}
        options={{
          headerShown: true,
          title: "Portabilidad", // Título vacío
          headerTintColor: "#FFF", // Color del texto o íconos del header
          headerTitleStyle: {
            fontFamily: "Poppins_500Medium", // Fuente personalizada
            fontSize: 20, // Tamaño de fuente (opcional)
          },
          headerTitleAlign: "center", // 👈 Esto centra el texto
          headerLeft: () => (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                }
              }}
            >
              <MaterialIcons name="chevron-left" color="#FFF" size={20} />
            </TouchableOpacity>
          ),
        }}
      />
      <StackHome.Screen
        name="DistribuidorSimScreen"
        component={DistribuidorSimScreen}
        options={{
          headerShown: true,
          title: "Portabilidad", // Título vacío
          headerTintColor: "#FFF", // Color del texto o íconos del header
          headerTitleStyle: {
            fontFamily: "Poppins_500Medium", // Fuente personalizada
            fontSize: 20, // Tamaño de fuente (opcional)
          },
          headerTitleAlign: "center", // 👈 Esto centra el texto
        }}
      />
      <StackHome.Screen
        name="ComprarSimScreen"
        component={ComprarSimScreen}
        options={{
          headerShown: true,
          title: "Comprar SIM", // Título vacío
          headerTintColor: "#FFF", // Color del texto o íconos del header
          headerTitleStyle: {
            fontFamily: "Poppins_500Medium", // Fuente personalizada
            fontSize: 20, // Tamaño de fuente (opcional)
          },
          headerTitleAlign: "center", // 👈 Esto centra el texto
          headerLeft: () => (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                }
              }}
            >
              <MaterialIcons name="chevron-left" color="#FFF" size={20} />
            </TouchableOpacity>
          ),
        }}
      />
    </StackHome.Navigator>
  );
}

function MyStackPerfil() {
  const navigation = useNavigation();
  const { setUserData, setGlobalNumber, setIsAnonimo } = useGlobalState();

  const handleLogout = () => {
    Alert.alert("Cerrar sesión", "¿Estás seguro de que quieres salir?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Salir",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.multiRemove([
              "userEmail",
              "userPassword",
              "rememberMe",
              "biometricLogin",
              "userMsisdn",
            ]);

            setUserData(null);
            setGlobalNumber(null);
            setIsAnonimo(false);

            navigation.reset({
              index: 0,
              routes: [{ name: "InicioScreen" }],
            });
          } catch (error) {
            console.error("Error al cerrar sesión:", error);
          }
        },
      },
    ]);
  };

  return (
    <StackHome.Navigator
      initialRouteName="HomePerfilScreen"
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerTintColor: "#FFF", // Color del texto del header
        headerStyle: {
          backgroundColor: "#001D3D", // Color de fondo del header
        },
      }}
    >
      <StackHome.Screen
        name="HomePerfilScreen"
        component={HomePerfilScreen}
        options={{
          headerShown: true,
          title: "Mi perfil",
          headerTintColor: "#FFF",
          headerTitleStyle: {
            fontFamily: "Poppins_500Medium",
            fontSize: 20,
          },
          headerTitleAlign: "center",
          headerRight: () => (
            <TouchableOpacity
              style={[styles.backButton]}
              onPress={handleLogout}
            >
              <MaterialIcons name="logout" color="#ef4444" size={24} />
            </TouchableOpacity>
          ),
        }}
      />
      <StackHome.Screen
        name="FormasPagoScreen"
        component={FormasPagoScreen}
        options={({ navigation: nav }) => ({
          headerShown: true,
          title: "Formas de pago",
          headerTintColor: "#FFF",
          headerTitleStyle: {
            fontFamily: "Poppins_500Medium",
            fontSize: 20,
          },
          headerTitleAlign: "center",
          headerLeft: () => (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => nav.popToTop()}
            >
              <MaterialIcons name="chevron-left" color="#FFF" size={20} />
            </TouchableOpacity>
          ),
        })}
      />
      <StackHome.Screen
        name="MisComprasScreen"
        component={MisComprasScreen}
        options={({ navigation: nav }) => ({
          headerShown: true,
          title: "Mis compras",
          headerTintColor: "#FFF",
          headerTitleStyle: {
            fontFamily: "Poppins_500Medium",
            fontSize: 20,
          },
          headerTitleAlign: "center",
          headerLeft: () => (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => nav.popToTop()}
            >
              <MaterialIcons name="chevron-left" color="#FFF" size={20} />
            </TouchableOpacity>
          ),
        })}
      />
      <StackHome.Screen
        name="FacturasScreen"
        component={FacturasScreen}
        options={({ navigation: nav }) => ({
          headerShown: true,
          title: "Facturas",
          headerTintColor: "#FFF",
          headerTitleStyle: {
            fontFamily: "Poppins_500Medium",
            fontSize: 20,
          },
          headerTitleAlign: "center",
          headerLeft: () => (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => nav.popToTop()}
            >
              <MaterialIcons name="chevron-left" color="#FFF" size={20} />
            </TouchableOpacity>
          ),
        })}
      />
      <StackHome.Screen
        name="MisEsimScreen"
        component={MisEsimScreen}
        options={({ navigation: nav }) => ({
          headerShown: true,
          title: "Mis eSIM",
          headerTintColor: "#FFF",
          headerTitleStyle: {
            fontFamily: "Poppins_500Medium",
            fontSize: 20,
          },
          headerTitleAlign: "center",
          headerLeft: () => (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => nav.popToTop()}
            >
              <MaterialIcons name="chevron-left" color="#FFF" size={20} />
            </TouchableOpacity>
          ),
        })}
      />
      <StackHome.Screen
        name="AyudaScreen"
        component={AyudaScreen}
        options={({ navigation: nav }) => ({
          headerShown: true,
          title: "Ayuda",
          headerTintColor: "#FFF",
          headerTitleStyle: {
            fontFamily: "Poppins_500Medium",
            fontSize: 20,
          },
          headerTitleAlign: "center",
          headerLeft: () => (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => nav.popToTop()}
            >
              <MaterialIcons name="chevron-left" color="#FFF" size={20} />
            </TouchableOpacity>
          ),
        })}
      />
    </StackHome.Navigator>
  );
}

function TabsNavigator() {
  const { showTabBar } = useGlobalState();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#2253DF",
        tabBarInactiveTintColor: "#CBD5E1",
        tabBarStyle: {
          backgroundColor: "#FFF",
          display: showTabBar ? "flex" : "none",
          height: 60,
          borderTopWidth: 0,
          elevation: 5,
        },
      }}
    >
      <Tab.Screen
        name="Inicio"
        component={MyStackHome}
        options={{
          headerShown: false,
          tabBarLabel: ({ color }) => (
            <Text
              style={{ color, fontFamily: "Poppins_600SemiBold", fontSize: 13 }}
            >
              Home
            </Text>
          ),
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" color={color} size={30} />
          ),
        }}
      />
      <Tab.Screen
        name="Portabilidad"
        component={MyStackPortabilidad}
        options={{
          headerShown: false,
          tabBarLabel: ({ color }) => (
            <Text
              style={{ color, fontFamily: "Poppins_600SemiBold", fontSize: 13 }}
            >
              Portabilidad
            </Text>
          ),
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons
              name="account-balance-wallet"
              color={color}
              size={30}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Chulirecarga"
        component={MyStackSaldo}
        options={{
          headerShown: false,
          tabBarLabel: ({ color }) => (
            <Text
              style={{ color, fontFamily: "Poppins_600SemiBold", fontSize: 13 }}
            >
              Chulirecarga
            </Text>
          ),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="cellphone-arrow-down"
              color={color}
              size={30}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Pefil"
        component={MyStackPerfil}
        options={{
          headerShown: false,
          tabBarLabel: ({ color }) => (
            <Text
              style={{ color, fontFamily: "Poppins_600SemiBold", fontSize: 13 }}
            >
              Perfil
            </Text>
          ),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={30} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  backButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
});

export default function Navigation() {
  return (
    <NavigationContainer linking={linking}>
      <MyStackPrincipal />
    </NavigationContainer>
  );
}
