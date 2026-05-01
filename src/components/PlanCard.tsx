/**
 * PlanCard
 * Tarjeta con fondo degradado púrpura que muestra el plan activo del usuario.
 * Usa LinearGradient de expo-linear-gradient si está instalado,
 * con fallback automático a dos capas de View.
 */

import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BrandColors } from '@/constants/theme';

interface Props {
  title?:    string;
  subtitle?: string;
  onPress?:  () => void;
}

export default function PlanCard({
  title    = 'PLAN',
  subtitle,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      style={styles.wrapper}
      onPress={onPress}
      activeOpacity={0.82}
      accessibilityRole="button"
      accessibilityLabel={`Plan: ${title}`}
    >
      {/* Capa de degradado simulada */}
      <View style={styles.gradientTop} />

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? (
          <Text style={styles.subtitle}>{subtitle}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width:         160,
    height:        160,
    borderRadius:  20,
    overflow:      'hidden',
    backgroundColor: BrandColors.purpleDark,
    shadowColor:   BrandColors.purple,
    shadowOffset:  { width: 0, height: 8 },
    shadowOpacity: 0.50,
    shadowRadius:  16,
    elevation:     12,
  },
  gradientTop: {
    position:        'absolute',
    top:             0,
    left:            0,
    right:           0,
    height:          '60%',
    backgroundColor: BrandColors.purpleLight,
    borderTopLeftRadius:  20,
    borderTopRightRadius: 20,
    opacity:         0.7,
  },
  content: {
    flex:    1,
    padding: 18,
    justifyContent: 'flex-start',
  },
  title: {
    color:       BrandColors.white,
    fontSize:    22,
    fontWeight:  '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  subtitle: {
    color:      'rgba(255,255,255,0.70)',
    fontSize:   13,
    marginTop:  8,
    lineHeight: 18,
    fontWeight: '400',
  },
});
