import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
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

export default function RegistroScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [nombre, setNombre] = useState('');
  const [rut, setRut] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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

        <View style={styles.form}>

          <Text style={styles.label}>Nombre Completo</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="nombre completo"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={nombre}
              onChangeText={setNombre}
              autoCapitalize="words"
            />
          </View>

          <Text style={styles.label}>Rut</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="12.345.678-9"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={rut}
              onChangeText={setRut}
              autoCapitalize="none"
              keyboardType="default"
            />
          </View>

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

          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="contraseña"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
              autoCapitalize="none"
            />
            <Pressable onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
              <MaterialCommunityIcons
                name={showPass ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="rgba(255,255,255,0.7)"
              />
            </Pressable>
          </View>

          <Text style={styles.label}>Confirmar Contraseña</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="confirmar contraseña"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry={!showConfirm}
              autoCapitalize="none"
            />
            <Pressable onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
              <MaterialCommunityIcons
                name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="rgba(255,255,255,0.7)"
              />
            </Pressable>
          </View>

          <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>Registrarse</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.7}
            style={styles.switchBtn}
          >
            <Text style={styles.switchText}>¿Ya tienes una cuenta?</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o continúa con</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialRow}>
            <View style={styles.socialBtn}>
              <Text style={styles.socialIcon}>f</Text>
            </View>
            <View style={styles.socialBtn}>
              <Text style={styles.socialIcon}>G</Text>
            </View>
          </View>
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

  centerIcon: { alignItems: 'center', marginVertical: 14 },
  logoIcon: { width: 920, height: 220, opacity: 0.95 },

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
    marginBottom: 14,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    height: 48,
    color: BrandColors.white,
    fontSize: 15,
  },
  eyeBtn: { padding: 4 },

  primaryBtn: {
    backgroundColor: BrandColors.purple,
    borderRadius: 10,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
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

  switchBtn: { alignItems: 'center', marginBottom: 20 },
  switchText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },

  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.25)' },
  dividerText: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginHorizontal: 10 },

  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginBottom: 8 },
  socialBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIcon: { color: BrandColors.white, fontSize: 22, fontWeight: '700' },
});
