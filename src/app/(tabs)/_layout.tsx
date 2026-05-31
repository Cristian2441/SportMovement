import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BrandColors } from "@/constants/theme";

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

function TabIcon({ name, color }: { name: IconName; color: string }) {
  return <MaterialCommunityIcons name={name} size={27} color={color} />;
}

// Ícono central QR estilo FAB elevado
function QrTabIcon({ focused }: { focused: boolean }) {
  return (
    <View style={styles.qrFab}>
      <MaterialCommunityIcons
        name="qrcode-scan"
        size={30}
        color={focused ? BrandColors.white : BrandColors.white}
      />
    </View>
  );
}

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
        tabBarActiveTintColor: BrandColors.white,
        tabBarInactiveTintColor: "rgba(255,255,255,0.60)",
        tabBarStyle: {
          backgroundColor: BrandColors.pink,
          borderTopWidth: 0,
          height: tabHeight,
          paddingBottom: bottomPadding,
          paddingTop: 8,
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

      {/* Pestaña central: Mi QR — botón FAB destacado */}
      <Tabs.Screen
        name="qr"
        options={{
          title: "mi QR",
          tabBarIcon: ({ focused }) => <QrTabIcon focused={focused} />,
          tabBarItemStyle: {
            // Eleva el ítem central visualmente
            marginBottom: Platform.OS === "ios" ? 10 : 6,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "700",
            letterSpacing: 0.4,
            marginTop: 6,
            color: BrandColors.white,
          },
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

      {/* Rutas ocultas de la barra inferior */}
      <Tabs.Screen name="plan" options={{ href: null }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  qrFab: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#1a1a1a",
    alignItems: "center",
    justifyContent: "center",
    // Sombra rosa llamativa
    shadowColor: BrandColors.pink,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.55,
    shadowRadius: 12,
    elevation: 14,
    // Borde sutil blanco
    borderWidth: 2.5,
    borderColor: "rgba(255,255,255,0.22)",
    // Lo elevamos por encima de la barra
    marginBottom: Platform.OS === "ios" ? 12 : 8,
  },
});
