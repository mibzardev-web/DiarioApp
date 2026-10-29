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
import HomeScreen from "./src/Pages/HomeScreen.js";
import CreateDiaryScreen from "./src/Pages/CreateDiaryScreen.js";
import SettingScreen from "./src/Pages/SettingScreen.js";

//Stacks
const Stack = createNativeStackNavigator();

//Button Tabs
const Tab = createBottomTabNavigator();

function MyStackPrincipal() {
  const navigation = useNavigation();

  const { userData } = useGlobalState();

  return (
    <Stack.Navigator
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
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{
          headerShown: true,
          title: "Inicio", // Título vacío
        }}
      />
      <Stack.Screen
        name="CreateDiaryScreen"
        component={CreateDiaryScreen}
        options={{ title: "Nuevo diario" }}
      />
    </Stack.Navigator>
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
        component={MyStackPrincipal}
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
        name="Setting"
        component={SettingScreen}
        options={{
          headerShown: false,
          tabBarLabel: ({ color }) => (
            <Text
              style={{ color, fontFamily: "Poppins_600SemiBold", fontSize: 13 }}
            >
              Setting
            </Text>
          ),
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="settings" color={color} size={30} />
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
    <NavigationContainer>
      <TabsNavigator />
    </NavigationContainer>
  );
}
