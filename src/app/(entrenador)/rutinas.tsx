import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BrandColors } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RutinasScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Rutinas</Text>
      <Text style={styles.subtitle}>Gestión de rutinas (Próximamente)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: BrandColors.purpleDark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: BrandColors.mediumGray,
  },
});
