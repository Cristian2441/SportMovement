import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BrandColors } from '@/constants/theme';

const { width: W } = Dimensions.get('window');
const MENU_W = Math.min(W * 0.74, 320);

// ── Ítems de navegación ───────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: 'Inicio',          route: '/'               },
  { label: 'Perfil',          route: '/perfil'          },
  { label: 'Notificaciones',  route: '/notificaciones'  },
  { label: 'Contáctanos',     route: '/contacto'        },
  { label: 'Cerrar sesión',   route: '/logout'          },
] as const;

interface Props {
  visible: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
}

// ── Componente ────────────────────────────────────────────────────────────────
export default function SideMenu({ visible, onClose, onNavigate }: Props) {
  // Tracked separately so we can unmount AFTER the close animation finishes
  const [mounted, setMounted] = useState(visible);

  const slideX    = useRef(new Animated.Value(-MENU_W)).current;
  const backdropO = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      // Open: slide in + fade backdrop
      Animated.parallel([
        Animated.spring(slideX, {
          toValue: 0,
          damping: 20,
          stiffness: 160,
          useNativeDriver: true,
        }),
        Animated.timing(backdropO, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Close: slide out + fade backdrop, then unmount
      Animated.parallel([
        Animated.spring(slideX, {
          toValue: -MENU_W,
          damping: 20,
          stiffness: 160,
          useNativeDriver: true,
        }),
        Animated.timing(backdropO, {
          toValue: 0,
          duration: 240,
          useNativeDriver: true,
        }),
      ]).start(() => setMounted(false));
    }
  }, [visible, slideX, backdropO]);

  const handleNav = useCallback(
    (route: string) => {
      onNavigate(route);
      onClose();
    },
    [onNavigate, onClose],
  );

  if (!mounted) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Fondo oscuro */}
      <Animated.View
        style={[styles.backdrop, { opacity: backdropO }]}
        pointerEvents="auto"
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Panel principal */}
      <Animated.View
        style={[styles.panel, { width: MENU_W, transform: [{ translateX: slideX }] }]}
      >
        {/* Cabecera */}
        <View style={styles.header}>
          <Image
            source={require('@/assets/images/logo-full.png')}
            style={styles.logoFull}
            resizeMode="contain"
          />
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel="Cerrar menú"
          >
            <View style={styles.burgerWrap}>
              {[0, 1, 2].map((i) => (
                <View key={i} style={styles.burgerLine} />
              ))}
            </View>
          </TouchableOpacity>
        </View>

        {/* Ítems de navegación */}
        <View style={styles.navList}>
          {NAV_ITEMS.map(({ label, route }) => (
            <TouchableOpacity
              key={route}
              style={styles.navItem}
              onPress={() => handleNav(route)}
              activeOpacity={0.6}
            >
              <Text style={styles.navLabel}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer con logo icono */}
        <View style={styles.footer}>
          <Image
            source={require('@/assets/images/logo-icon.png')}
            style={styles.logoIcon}
            resizeMode="contain"
          />
        </View>
      </Animated.View>
    </View>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.42)',
  },
  panel: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: BrandColors.white,
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 18,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 58,
    paddingBottom: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BrandColors.lightGray,
  },
  logoFull: {
    width: 140,
    height: 48,
    transform: [{ scale: 1.6 }, { translateX: -10 }], // Escala visual gigante
  },
  burgerWrap: {
    width: 26,
    height: 20,
    justifyContent: 'space-between',
  },
  burgerLine: {
    width: '100%',
    height: 2.5,
    borderRadius: 2,
    backgroundColor: BrandColors.black,
  },

  // Nav items
  navList: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 20,
  },
  navItem: {
    paddingVertical: 17,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BrandColors.lightGray,
  },
  navLabel: {
    fontSize: 17,
    fontWeight: '500',
    color: BrandColors.black,
    letterSpacing: 0.1,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingBottom: 44,
    paddingTop: 16,
  },
  logoIcon: {
    width: 120,
    height: 120,
    opacity: 0.85,
    transform: [{ scale: 2.2 }], // Gigante en el espacio sobrante
  },
});
