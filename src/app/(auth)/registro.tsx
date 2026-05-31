import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
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
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandColors } from '@/constants/theme';
import { authApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
const EMAIL_REGEX    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Validación de RUT chileno (opcional, solo si está lleno)
function validarRut(rut: string): boolean {
  const clean = rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();
  if (clean.length < 2) return false;
  const cuerpo = clean.slice(0, -1);
  const dv     = clean.slice(-1);
  let suma = 0;
  let mul  = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i]) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const dvEsperado = 11 - (suma % 11);
  const dvStr = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : String(dvEsperado);
  return dv === dvStr;
}

export default function RegistroScreen() {
  const { login } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [nombre, setNombre]       = useState('');
  const [rut, setRut]             = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [errors, setErrors]       = useState<Record<string, string>>({});

  // Error de servidor → texto inline debajo del botón
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const e: Record<string, string> = {};
    if (!nombre.trim())                        e.nombre   = 'El nombre es requerido';

    // Validación de RUT solo si fue ingresado
    if (rut.trim() && !validarRut(rut.trim())) e.rut      = 'El RUT ingresado no es válido';

    if (!email.trim())                         e.email    = 'El correo es requerido';
    else if (!EMAIL_REGEX.test(email.trim()))  e.email    = 'El correo debe tener un formato válido (ejemplo@dominio.com)';

    if (!password)                             e.password = 'La contraseña es requerida';
    else if (!PASSWORD_REGEX.test(password))
      e.password = 'Mínimo 8 caracteres, mayúscula, minúscula, número y símbolo';
    if (password !== confirm)                  e.confirm  = 'Las contraseñas no coinciden';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    setServerError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await authApi.register({
        nombre_completo: nombre.trim(),
        rut: rut.trim() || undefined,
        email: email.trim(),
        password,
      });
      router.replace('/(auth)/login');
    } catch (err: any) {
      setServerError(err.message ?? 'Ocurrió un error al crear la cuenta. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

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

          {/* Nombre */}
          <Text style={styles.label}>Nombre Completo</Text>
          <View style={[styles.inputWrapper, errors.nombre && styles.inputError]}>
            <TextInput
              style={styles.input}
              placeholder="nombre completo"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={nombre}
              onChangeText={t => { setNombre(t); setErrors(p => ({ ...p, nombre: '' })); }}
              autoCapitalize="words"
            />
          </View>
          {errors.nombre ? <Text style={styles.errorText}>{errors.nombre}</Text> : null}

          {/* RUT (opcional) */}
          <Text style={styles.label}>Rut <Text style={styles.optional}>(opcional)</Text></Text>
          <View style={[styles.inputWrapper, errors.rut && styles.inputError]}>
            <TextInput
              style={styles.input}
              placeholder="12.345.678-9"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={rut}
              onChangeText={t => { setRut(t); setErrors(p => ({ ...p, rut: '' })); }}
              autoCapitalize="characters"
              keyboardType="default"
            />
          </View>
          {errors.rut ? <Text style={styles.errorText}>{errors.rut}</Text> : null}

          {/* Email */}
          <Text style={styles.label}>Correo Electrónico</Text>
          <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
            <TextInput
              style={styles.input}
              placeholder="correo electrónico"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={email}
              onChangeText={t => { setEmail(t); setErrors(p => ({ ...p, email: '' })); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

          {/* Contraseña */}
          <Text style={styles.label}>Contraseña</Text>
          <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="contraseña"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={password}
              onChangeText={t => { setPassword(t); setErrors(p => ({ ...p, password: '' })); }}
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
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

          {/* Confirmar */}
          <Text style={styles.label}>Confirmar Contraseña</Text>
          <View style={[styles.inputWrapper, errors.confirm && styles.inputError]}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="confirmar contraseña"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={confirm}
              onChangeText={t => { setConfirm(t); setErrors(p => ({ ...p, confirm: '' })); }}
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
          {errors.confirm ? <Text style={styles.errorText}>{errors.confirm}</Text> : null}

          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
            activeOpacity={0.85}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={BrandColors.white} />
              : <Text style={styles.primaryBtnText}>Registrarse</Text>
            }
          </TouchableOpacity>

          {/* Error del servidor inline */}
          {serverError ? (
            <View style={styles.serverErrorRow}>
              <MaterialCommunityIcons name="alert-circle-outline" size={14} color={BrandColors.pinkLight} style={{ marginRight: 5 }} />
              <Text style={styles.serverErrorText}>{serverError}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.7}
            style={styles.switchBtn}
          >
            <Text style={styles.switchText}>¿Ya tienes una cuenta?</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>



    </KeyboardAvoidingView>
  );
}

const INPUT_BG = 'rgba(150,180,150,0.35)';

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: 'transparent' },
  scroll: { flexGrow: 1, paddingHorizontal: 32 },

  topBar:   { flexDirection: 'row', alignItems: 'center', marginBottom: 4, marginLeft: -80, marginTop: -10 },
  logoFull: { width: 230, height: 76 },

  centerIcon: { alignItems: 'center', marginVertical: 14 },
  logoIcon:   { width: 920, height: 220, opacity: 0.95 },

  form: { width: '100%' },

  label: {
    color: BrandColors.white,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  optional: { fontWeight: '400', opacity: 0.6 },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: INPUT_BG,
    borderRadius: 10,
    marginBottom: 4,
    paddingHorizontal: 14,
  },
  inputError: {
    borderWidth: 1,
    borderColor: BrandColors.pink,
  },
  input: {
    flex: 1,
    height: 48,
    color: BrandColors.white,
    fontSize: 15,
  },
  eyeBtn: { padding: 4 },

  errorText: {
    color: BrandColors.pinkLight,
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 2,
  },

  // Error de servidor inline
  serverErrorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    marginLeft: 2,
  },
  serverErrorText: {
    color: BrandColors.pinkLight,
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },

  primaryBtn: {
    backgroundColor: BrandColors.purple,
    borderRadius: 10,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 8,
    shadowColor: BrandColors.purple,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: {
    color: BrandColors.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
  },

  switchBtn:  { alignItems: 'center', marginBottom: 20, marginTop: 8 },
  switchText: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },


});
