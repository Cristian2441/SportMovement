import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BrandColors } from "@/constants/theme";

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

function TabIcon({ name, color }: { name: IconName; color: string }) {
  return <MaterialCommunityIcons name={name} size={27} color={color} />;
}

const TAB_HEIGHT = Platform.OS === "ios" ? 86 : 68;

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "ios" ? 22 : insets.bottom + 8;
  const tabHeight =
    (Platform.OS === "ios" ? 86 : 68) +
    (Platform.OS === "android" ? insets.bottom : 0);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // Colores activo / inactivo
        tabBarActiveTintColor: BrandColors.white,
        tabBarInactiveTintColor: "rgba(255,255,255,0.60)",
        // Barra
        tabBarStyle: {
          backgroundColor: BrandColors.pink,
          borderTopWidth: 0,
          height: tabHeight,
          paddingBottom: bottomPadding,
          paddingTop: 8,
          // Sombra superior
          shadowColor: BrandColors.pinkDark,
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.35,
          shadowRadius: 10,
          elevation: 20,
        } as any,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          letterSpacing: 0.4,
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      }}
    >
      {/* Pestaña: Agenda */}
      <Tabs.Screen
        name="index"
        options={{
          title: "agenda",
          tabBarIcon: ({ color }) => (
            <TabIcon name="clipboard-list-outline" color={color} />
          ),
        }}
      />

      {/* Pestaña: Reservar */}
      <Tabs.Screen
        name="reservar"
        options={{
          title: "reservar",
          tabBarIcon: ({ color }) => <TabIcon name="dumbbell" color={color} />,
        }}
      />

      {/* Pestaña: Progreso */}
      <Tabs.Screen
        name="progreso"
        options={{
          title: "progreso",
          tabBarIcon: ({ color }) => (
            <TabIcon name="arm-flex-outline" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="tienda"
        options={{
          title: "tienda",
          tabBarIcon: ({ color }) => (
            <TabIcon name="cart-outline" color={color} />
          ),
        }}
      />

      {/* Ruta del Plan: Existe pero no se muestra en la barra inferior */}
      <Tabs.Screen name="plan" options={{ href: null }} />

      {/* Ocultar pestaña explore del boilerplate */}
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}

const _styles = StyleSheet.create({});
