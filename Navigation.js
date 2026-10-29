import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useMemo } from "react";

//Iconos
import { MaterialIcons } from "@expo/vector-icons";

//Importaciones de React Native
import { Text } from "react-native";

//Estados Globales
import useGlobalState from "./src/store/auth";
import { useTheme } from "./src/store/theme";

// Screens
import HomeScreen from "./src/Pages/HomeScreen.js";
import CreateDiaryScreen from "./src/Pages/CreateDiaryScreen.js";
import EditDiaryScreen from "./src/Pages/EditDiaryScreen.js";
import CalendarScreen from "./src/Pages/CalendarScreen.js";
import ExportRangeScreen from "./src/Pages/ExportRangeScreen.js";
import AlumnosScreen from "./src/Pages/AlumnosScreen.js";
import StudentDetailScreen from "./src/Pages/StudentDetailScreen.js";
import GameScreen from "./src/Pages/GameScreen.js";
import SettingsScreen from "./src/Pages/SettingsScreen.js";

//Stacks
const Stack = createNativeStackNavigator();

//Button Tabs
const Tab = createBottomTabNavigator();

// Opciones comunes de los headers (usan la paleta activa)
const useHeaderOptions = () => {
  const Palette = useTheme();
  return useMemo(
    () => ({
      headerShown: true,
      headerShadowVisible: false,
      headerTintColor: "#FFF", // Color del texto del header
      headerStyle: { backgroundColor: Palette.dark }, // Color de fondo del header
      contentStyle: { backgroundColor: Palette.background },
    }),
    [Palette],
  );
};

function HomeStack() {
  const headerOptions = useHeaderOptions();

  return (
    <Stack.Navigator initialRouteName="HomeScreen" screenOptions={headerOptions}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ title: "Inicio" }} />
      <Stack.Screen
        name="CreateDiaryScreen"
        component={CreateDiaryScreen}
        options={{ title: "Nuevo diario" }}
      />
      <Stack.Screen
        name="EditDiaryScreen"
        component={EditDiaryScreen}
        options={{ title: "Editar diario" }}
      />
      <Stack.Screen
        name="CalendarScreen"
        component={CalendarScreen}
        options={{ title: "Calendario" }}
      />
      <Stack.Screen
        name="ExportRangeScreen"
        component={ExportRangeScreen}
        options={{ title: "PDF por fechas" }}
      />
    </Stack.Navigator>
  );
}

function AlumnosStack() {
  const headerOptions = useHeaderOptions();

  return (
    <Stack.Navigator initialRouteName="AlumnosScreen" screenOptions={headerOptions}>
      <Stack.Screen name="AlumnosScreen" component={AlumnosScreen} options={{ title: "Alumnos" }} />
      <Stack.Screen
        name="StudentDetailScreen"
        component={StudentDetailScreen}
        options={{ title: "Historial del alumno" }}
      />
    </Stack.Navigator>
  );
}

const tabLabel = (text) => ({ color }) => (
  <Text style={{ color, fontFamily: "Poppins_600SemiBold", fontSize: 12 }}>
    {text}
  </Text>
);

const tabIcon = (name) => ({ color }) => (
  <MaterialIcons name={name} color={color} size={28} />
);

function TabsNavigator() {
  const { showTabBar } = useGlobalState();
  const Palette = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: Palette.primary,
        tabBarInactiveTintColor: Palette.muted,
        headerStyle: { backgroundColor: Palette.dark }, // Color de fondo del header
        headerTintColor: "#FFF", // Color del texto del header
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
        component={HomeStack}
        options={{
          headerShown: false,
          tabBarLabel: tabLabel("Home"),
          tabBarIcon: tabIcon("home"),
        }}
      />
      <Tab.Screen
        name="Alumnos"
        component={AlumnosStack}
        options={{
          headerShown: false,
          tabBarLabel: tabLabel("Alumnos"),
          tabBarIcon: tabIcon("groups"),
        }}
      />
      <Tab.Screen
        name="Juego"
        component={GameScreen}
        options={{
          headerShown: true,
          tabBarLabel: tabLabel("Juego"),
          tabBarIcon: tabIcon("sports-esports"),
        }}
      />
      <Tab.Screen
        name="Ajustes"
        component={SettingsScreen}
        options={{
          headerShown: true,
          tabBarLabel: tabLabel("Ajustes"),
          tabBarIcon: tabIcon("settings"),
        }}
      />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  const Palette = useTheme();
  const navTheme = useMemo(
    () => ({
      ...DefaultTheme,
      colors: { ...DefaultTheme.colors, background: Palette.background },
    }),
    [Palette],
  );

  return (
    <NavigationContainer theme={navTheme}>
      <TabsNavigator />
    </NavigationContainer>
  );
}
