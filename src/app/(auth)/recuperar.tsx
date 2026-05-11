import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandColors } from '@/constants/theme';

export default function RecuperarScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Image
            source={require('@/assets/images/logo-full.png')}
            style={styles.logoFull}
            resizeMode="contain"
            tintColor={BrandColors.white}
          />
        </View>

        <View style={styles.centerIcon}>
          <Image
            source={require('@/assets/images/logo-icon.png')}
            style={styles.logoIcon}
            resizeMode="contain"
            tintColor={BrandColors.white}
          />
        </View>
        <Text style={styles.description}>
          Se enviará un correo electrónico con un código de 6 dígitos los cuales deberás ingresar para recuperar tu cuenta
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>Correo Electrónico</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="correo electrónico"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>Enviar código</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={styles.backBtn}
          >
            <Text style={styles.backText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const INPUT_BG = 'rgba(150,180,150,0.35)';

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },
  scroll: { flexGrow: 1, paddingHorizontal: 32 },

  topBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, marginLeft: -80, marginTop: -10 },
  logoFull: { width: 230, height: 76 },

  centerIcon: { alignItems: 'center', marginVertical: 16 },
  logoIcon: { width: 920, height: 220, opacity: 0.95 },

  description: {
    color: BrandColors.white,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    opacity: 0.9,
  },

  form: { width: '100%' },

  label: {
    color: BrandColors.white,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: INPUT_BG,
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    height: 48,
    color: BrandColors.white,
    fontSize: 15,
  },

  primaryBtn: {
    backgroundColor: BrandColors.purple,
    borderRadius: 10,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: BrandColors.purple,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryBtnText: {
    color: BrandColors.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
  },

  backBtn: { alignItems: 'center', paddingVertical: 8 },
  backText: {
    color: BrandColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
