import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ImageSlider from "@/components/ImageSlider";
import PlanCard from "@/components/PlanCard";
import SideMenu from "@/components/SideMenu";
import { BrandColors } from "@/constants/theme";

export default function HomeScreen() {
  const [menuOpen, setMenuOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const openMenu = useCallback(() => setMenuOpen(true), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const handleNavigate = useCallback(
    (route: string) => {
      router.push(route as any);
    },
    [router],
  );

  const topPad = Platform.OS === "web" ? 16 : insets.top + 8;

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Sección hero ─────────────────────────────────────────── */}
        <View style={styles.heroSection}>
          <ImageSlider height={440} />

          {/* Barra superior superpuesta: hamburguesa ← → logo */}
          <View style={[styles.topBar, { paddingTop: topPad }]}>
            {/* Botón hamburguesa */}
            <TouchableOpacity
              style={styles.hamburgerBtn}
              onPress={openMenu}
              activeOpacity={0.78}
              accessibilityLabel="Abrir menú"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View style={styles.hamburger}>
                {[0, 1, 2].map((i) => (
                  <View key={i} style={styles.hamburgerLine} />
                ))}
              </View>
            </TouchableOpacity>

            {/* Logo blanco */}
            <Image
              source={require("@/assets/images/logo-full.png")}
              style={styles.logoTopBar}
              resizeMode="contain"
              tintColor={BrandColors.white}
            />
          </View>

          {/* ── Efecto splash pintura tirada en la base del hero ─────────────────── */}
          <View style={styles.splashContainer} pointerEvents="none">
            <Image
              source={require("@/assets/images/splash.png")}
              style={styles.splashImage}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* ── Sección de contenido blanco ──────────────────────────── */}
        <View style={styles.contentSection}>
          <PlanCard
            title="PLAN"
            subtitle="Ver mi plan activo"
            onPress={() => handleNavigate("/plan")}
          />
        </View>
      </ScrollView>

      {/* ── Drawer lateral (maneja su propio montaje para la animación de cierre) ──────── */}
      <SideMenu
        visible={menuOpen}
        onClose={closeMenu}
        onNavigate={handleNavigate}
      />
    </View>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BrandColors.white,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // ─── Hero ──────────────────────────────────────────────────────────────────
  heroSection: {
    position: "relative",
  },

  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 14,
    paddingRight: 4, // Apegado a la esquina derecha
    paddingBottom: 8,
    zIndex: 20,
  },

  hamburgerBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: BrandColors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  hamburger: {
    width: 21,
    height: 17,
    justifyContent: "space-between",
  },
  hamburgerLine: {
    width: "100%",
    height: 2.5,
    backgroundColor: BrandColors.black,
    borderRadius: 2,
  },

  logoTopBar: {
    width: 140,
    height: 48,
    transform: [{ scale: 1.4 }, { translateX: 15 }], // Más grande y movido más a la derecha
  },

  // ─── Efecto splash / salpicadura de pintura ───────────────────────────────────────────
  splashContainer: {
    position: "absolute",
    bottom: -30, // Mucho más abajo para enterrar la línea recta en la sección blanca
    left: 0,
    right: 0,
    height: 160, // Más alto para que se expanda mejor
    zIndex: 10,
  },
  splashImage: {
    width: "100%",
    height: "100%",
    // Si la imagen de pintura no es blanca, o si necesita ajustarse al blanco de la tarjeta:
    tintColor: BrandColors.white,
  },

  // ─── Contenido ─────────────────────────────────────────────────────────────
  contentSection: {
    flex: 1,
    backgroundColor: BrandColors.white,
    paddingTop: 44,
    paddingBottom: 24,
    paddingHorizontal: 22,
    minHeight: 240,
  },
});
