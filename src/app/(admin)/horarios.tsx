import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BrandColors } from '@/constants/theme';

export default function AdminHorariosScreen() {
  return (
    <View style={styles.root}>
      <Text style={styles.text}>Horarios</Text>
      <Text style={styles.sub}>Próximamente</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BrandColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: '800',
    color: BrandColors.black,
  },
  sub: {
    fontSize: 14,
    color: BrandColors.mediumGray,
    marginTop: 8,
  },
});
