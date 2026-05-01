/**
 * Tienda — Placeholder screen
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BrandColors } from '@/constants/theme';

export default function TiendaScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tienda</Text>
      <Text style={styles.subtitle}>Próximamente…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: BrandColors.purple,
  },
  subtitle: {
    fontSize: 15,
    color: BrandColors.mediumGray,
  },
});
