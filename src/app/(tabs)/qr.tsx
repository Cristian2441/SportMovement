import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandColors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { personaApi, QrData } from '@/services/api';

// ── Constantes ─────────────────────────────────────────────────────────────────
const QR_SIZE = 220;

export default function QrScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [qrData, setQrData] = useState<QrData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // ── Carga del QR desde el backend ────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await personaApi.getMiQr();
        setQrData(data);
      } catch (e: any) {
        setError(e.message ?? 'No se pudo cargar el QR');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Animación de entrada ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!loading && qrData) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          damping: 14,
          stiffness: 120,
          useNativeDriver: true,
        }),
      ]).start();

      // Pulso sutil infinito
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.04,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1800,
            useNativeDriver: true,
          }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    }
  }, [loading, qrData]);

  const handleRetry = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.85);
      const data = await personaApi.getMiQr();
      setQrData(data);
    } catch (e: any) {
      setError(e.message ?? 'No se pudo cargar el QR');
    } finally {
      setLoading(false);
    }
  }, [fadeAnim, scaleAnim]);

  const topPad = Platform.OS === 'web' ? 24 : insets.top + 12;

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingTop: topPad }]}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <Image
            source={require('@/assets/images/logo-full.png')}
            style={styles.logo}
            resizeMode="contain"
            tintColor={BrandColors.white}
          />
          <Text style={styles.headerSubtitle}>Pase de acceso</Text>
        </View>

        {/* ── Tarjeta QR ─────────────────────────────────────────────────────── */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <MaterialCommunityIcons name="qrcode-scan" size={64} color="rgba(255,255,255,0.3)" />
            <Text style={styles.loadingText}>Cargando tu QR…</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons name="alert-circle-outline" size={56} color={BrandColors.pink} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={handleRetry} activeOpacity={0.75}>
              <Text style={styles.retryBtnText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Animated.View
            style={[
              styles.cardWrapper,
              { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
            ]}
          >
            {/* Halo de brillo animado */}
            <Animated.View
              style={[styles.glowRing, { transform: [{ scale: pulseAnim }] }]}
            />

            {/* Tarjeta principal */}
            <View style={styles.card}>
              {/* Badge Sport Movement */}
              <View style={styles.badge}>
                <MaterialCommunityIcons name="lightning-bolt" size={14} color={BrandColors.white} />
                <Text style={styles.badgeText}>SPORT MOVEMENT</Text>
              </View>

              {/* QR */}
              <View style={styles.qrContainer}>
                <QRCode
                  value={qrData!.persona_id}
                  size={QR_SIZE}
                  color={BrandColors.black}
                  backgroundColor="white"
                  enableLinearGradient={false}
                />
              </View>

              {/* Nombre */}
              <Text style={styles.userName} numberOfLines={2}>
                {qrData!.nombre_completo}
              </Text>

              {/* ID corto */}
              <Text style={styles.userId}>
                ID: {qrData!.persona_id.slice(0, 8).toUpperCase()}
              </Text>

              {/* Decorador inferior */}
              <View style={styles.cardFooter}>
                <View style={styles.footerDot} />
                <Text style={styles.footerLabel}>Pase único e intransferible</Text>
                <View style={styles.footerDot} />
              </View>
            </View>
          </Animated.View>
        )}

        {/* ── Info footer ────────────────────────────────────────────────────── */}
        {!loading && !error && (
          <View style={styles.infoBox}>
            <MaterialCommunityIcons name="shield-check-outline" size={20} color="rgba(255,255,255,0.6)" />
            <Text style={styles.infoText}>
              Este QR es permanente y siempre será el mismo.{'\n'}Preséntalo en recepción para ingresar al gym.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0D0D0F',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
    alignItems: 'center',
  },

  // ─── Header ─────────────────────────────────────────────────────────────────
  header: {
    alignItems: 'center',
    paddingBottom: 28,
    gap: 4,
  },
  logo: {
    width: 160,
    height: 52,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    fontWeight: '500',
  },

  // ─── Loading / Error ─────────────────────────────────────────────────────────
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingTop: 80,
  },
  loadingText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 0.5,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 22,
  },
  retryBtn: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
    backgroundColor: BrandColors.pink,
    borderRadius: 24,
  },
  retryBtnText: {
    color: BrandColors.white,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // ─── Tarjeta QR ──────────────────────────────────────────────────────────────
  cardWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  glowRing: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: `${BrandColors.pink}44`,
    shadowColor: BrandColors.pink,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 28,
  },
  card: {
    width: 290,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: BrandColors.pink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 20,
    gap: 12,
  },

  // Badge
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: BrandColors.pink,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  badgeText: {
    color: BrandColors.white,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
  },

  // QR
  qrContainer: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },

  // Nombre e ID
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0D0D0F',
    textAlign: 'center',
    letterSpacing: 0.2,
    lineHeight: 24,
  },
  userId: {
    fontSize: 11,
    color: 'rgba(0,0,0,0.38)',
    letterSpacing: 1.8,
    fontWeight: '500',
  },

  // Footer de la tarjeta
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  footerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: BrandColors.pink,
    opacity: 0.6,
  },
  footerLabel: {
    fontSize: 10,
    color: 'rgba(0,0,0,0.4)',
    letterSpacing: 0.8,
    fontWeight: '500',
  },

  // ─── Info Box ────────────────────────────────────────────────────────────────
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 32,
    marginHorizontal: 32,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 19,
  },
});
