import React, { useState } from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';

import { BrandColors } from '@/constants/theme';
import SideMenu from '@/components/SideMenu';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

// Mock data based on the screenshot
const ALUMNOS = [
  { id: '1', name: 'alumno 1', progress: 10 },
  { id: '2', name: 'alumno 2', progress: 30 },
  { id: '3', name: 'alumno 3', progress: 40 },
  { id: '4', name: 'alumno 4', progress: 50 },
  { id: '5', name: 'alumno 5', progress: 20 },
  { id: '6', name: 'alumno 6', progress: 60 },
  { id: '7', name: 'alumno 7', progress: 70 },
  { id: '8', name: 'alumno 8', progress: 80 },
  { id: '9', name: 'alumno 9', progress: 10 },
  { id: '10', name: 'alumno 10', progress: 100 },
];

const CIRCLE_SIZE = 58;
const STROKE_WIDTH = 6;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Circular Progress Component
function ProgressCircle({ progress }: { progress: number }) {
  const strokeDashoffset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;

  return (
    <View style={styles.progressContainer}>
      <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
        {/* Background Circle */}
        <Circle
          stroke="#E5E5EA"
          fill="none"
          cx={CIRCLE_SIZE / 2}
          cy={CIRCLE_SIZE / 2}
          r={RADIUS}
          strokeWidth={STROKE_WIDTH}
        />
        {/* Progress Circle */}
        <Circle
          stroke="#A3A3A3" // Un gris oscuro/medio según la imagen
          fill="none"
          cx={CIRCLE_SIZE / 2}
          cy={CIRCLE_SIZE / 2}
          r={RADIUS}
          strokeWidth={STROKE_WIDTH}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${CIRCLE_SIZE / 2}, ${CIRCLE_SIZE / 2}`}
        />
      </Svg>
      <View style={styles.progressTextContainer}>
        <Text style={styles.progressText}>{progress}%</Text>
      </View>
    </View>
  );
}

export default function EntrenadorPersonasScreen() {
  const [menuOpen, setMenuOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const topPad = Platform.OS === 'web' ? 16 : insets.top + 8;

  const handleNavigate = (route: string) => {
    router.push(route as any);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Sección Header con Imagen ─────────────────────────────────────────── */}
        <View style={styles.heroSection}>
          {/* Imagen de fondo del entrenador */}
          <Image
            source={require('@/assets/images/splash.png')} // Usamos un placeholder temporal, en app real sería la foto del entrenador
            style={[styles.heroImage, { tintColor: BrandColors.purple }]} // Overlay morado
            resizeMode="cover"
          />
          {/* Opcional: un degradado oscuro para que la foto se vea más morada y oscura */}
          <View style={styles.heroOverlay} />

          {/* Top Bar (Hamburguesa y Logo) */}
          <View style={[styles.topBar, { paddingTop: topPad }]}>
            {/* Botón hamburguesa flotante estilo pill */}
            <TouchableOpacity
              style={styles.hamburgerPill}
              onPress={() => setMenuOpen(true)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="menu" size={28} color={BrandColors.black} />
            </TouchableOpacity>

            {/* Logo */}
            <Image
              source={require('@/assets/images/logo-full.png')}
              style={styles.logo}
              resizeMode="contain"
              tintColor={BrandColors.white}
            />
          </View>

          {/* Borde irregular (efecto papel rasgado o brush en la base del hero) */}
          <View style={styles.brushEdgeContainer} pointerEvents="none">
            <Image
              source={require('@/assets/images/splash.png')} // Asumiendo que splash.png tiene una forma irregular
              style={styles.brushEdgeImage}
              resizeMode="cover"
              tintColor={BrandColors.white} // Pintado de blanco para fundirse con el fondo inferior
            />
          </View>
        </View>

        {/* ── Sección de Alumnos (Fondo Blanco) ────────────────────────────────── */}
        <View style={styles.contentSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollContent}
          >
            <View style={styles.grid}>
              {ALUMNOS.map((alumno) => (
                <View key={alumno.id} style={styles.alumnoCard}>
                  <ProgressCircle progress={alumno.progress} />
                  <Text style={styles.alumnoName}>{alumno.name.split(' ')[0]}</Text>
                  <Text style={styles.alumnoName}>{alumno.name.split(' ')[1]}</Text>
                </View>
              ))}
            </View>

            {/* Flecha indicadora de scroll */}
            {ALUMNOS.length > 5 && (
              <View style={styles.arrowContainer}>
                <MaterialCommunityIcons name="chevron-right" size={40} color={BrandColors.black} />
              </View>
            )}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Drawer Menu */}
      <SideMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
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

  // ─── Hero / Top Section ──────────────────────────────────────────────────
  heroSection: {
    width: '100%',
    height: 480, // Altura grande para que la foto ocupe más de media pantalla
    position: 'relative',
    backgroundColor: BrandColors.purpleDark,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    opacity: 0.8, // Para que se fusione un poco con el fondo oscuro
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(75, 31, 168, 0.3)', // Tinte púrpura adicional
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
    zIndex: 20,
  },
  hamburgerPill: {
    backgroundColor: BrandColors.white,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  logo: {
    width: 140,
    height: 45,
    marginRight: 16,
  },
  brushEdgeContainer: {
    position: 'absolute',
    bottom: -20,
    left: 0,
    right: 0,
    height: 100, // Altura del efecto de borde
    zIndex: 10,
  },
  brushEdgeImage: {
    width: '100%',
    height: '100%',
    transform: [{ scaleY: -1 }], // Invertir si es necesario para el efecto
  },

  // ─── Content Section (Alumnos Grid) ────────────────────────────────────────
  contentSection: {
    flex: 1,
    backgroundColor: BrandColors.white,
    paddingTop: 30,
    paddingBottom: 40,
  },
  horizontalScrollContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'column',
    flexWrap: 'wrap',
    height: 230, // Altura para forzar exactamente 2 filas
    rowGap: 24,
    columnGap: 16,
    justifyContent: 'flex-start',
  },
  alumnoCard: {
    width: width / 5.2, // ~5 columnas visibles en la pantalla a la vez
    alignItems: 'center',
  },
  alumnoName: {
    fontSize: 12,
    fontWeight: '700',
    color: BrandColors.black,
    marginTop: 2,
    textAlign: 'center',
  },
  arrowContainer: {
    justifyContent: 'center',
    marginLeft: 10,
    height: 230,
  },

  // ─── Progress Circle ───────────────────────────────────────────────────────
  progressContainer: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  progressTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: 13,
    fontWeight: '800',
    color: BrandColors.black,
  },
});
