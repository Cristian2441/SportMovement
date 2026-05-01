/**
 * ImageSlider
 * Muestra las fotos del gym en bucle cada 4 segundos.
 * Desplazamiento horizontal fluido y natural, optimizado para móvil (Expo Go).
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  View,
} from 'react-native';
import { BrandColors } from '@/constants/theme';

// ── Assets ───────────────────────────────────────────────────────────────────
const ORIGINAL_SLIDES = [
  require('@/assets/images/slide1.webp'),
  require('@/assets/images/slide2.png'),
];

// Añadimos un clon del primer slide al final para crear el efecto de "bucle infinito"
const SLIDES = [...ORIGINAL_SLIDES, ORIGINAL_SLIDES[0]];

const INTERVAL_MS = 4000;
const { width: W } = Dimensions.get('window');

// ── Tipos ─────────────────────────────────────────────────────────────────────
interface Props {
  height?: number;
}

// ── Componente ────────────────────────────────────────────────────────────────
export default function ImageSlider({ height = 440 }: Props) {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    let resetTimer: ReturnType<typeof setTimeout>;

    timer = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        
        // 1. Desplazamos animadamente al siguiente slide
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });

        // 2. Si llegamos al slide clonado (el último)
        if (nextIndex === SLIDES.length - 1) {
          // Esperamos a que termine la animación de desplazamiento (aprox 400ms)
          resetTimer = setTimeout(() => {
            // Y saltamos instantáneamente (sin animación) al slide 0 real
            flatListRef.current?.scrollToIndex({
              index: 0,
              animated: false,
            });
          }, 450);
          
          return 0; // Para los "puntos" (dots), ya mostramos el índice 0
        }

        return nextIndex;
      });
    }, INTERVAL_MS);

    return () => {
      clearInterval(timer);
      clearTimeout(resetTimer);
    };
  }, []);

  return (
    <View style={[styles.container, { height }]}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(_, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false} // Deshabilitamos scroll manual para no interrumpir el bucle
        bounces={false}
        renderItem={({ item }) => (
          <View style={{ width: W, height }}>
            <Image source={item} style={styles.image} resizeMode="cover" />
          </View>
        )}
      />

      {/* Overlay púrpura semi-transparente para mejorar contraste y brand */}
      <View style={styles.overlay} pointerEvents="none" />

      {/* Puntos indicadores */}
      <View style={styles.dots} pointerEvents="none">
        {ORIGINAL_SLIDES.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === currentIndex && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: BrandColors.purpleDark,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: BrandColors.purpleOverlay,
  },
  dots: {
    position: 'absolute',
    bottom: 58, // Para que queden encima de la mancha blanca
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    zIndex: 10,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.40)',
  },
  dotActive: {
    backgroundColor: BrandColors.white,
    width: 22,
  },
});
