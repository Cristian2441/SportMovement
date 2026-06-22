import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { authApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { signInWithGoogle } from '@/services/googleAuth';
import { signInWithFacebook } from '@/services/facebookAuth';

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);
  const [errors, setErrors]     = useState<{ email?: string; password?: string }>({});

  const [serverError, setServerError] = useState('');

  // Convierte cualquier error (técnico o no) a mensaje legible para el usuario
  const sanitizeError = (msg: string): string => {
    const r = (msg ?? '').toLowerCase();
    if (r.includes('fetch failed') || r.includes('enotfound') || r.includes('network') || r.includes('conexión')) {
      return 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
    }
    if (r.includes('session_expired') || r.includes('sesión ha expirado') || r.includes('refresh token') || r.includes('token almacenado')) {
      return 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.';
    }
    if (r.includes('error interno') || r.includes('disponible')) {
      return 'El servidor no está disponible. Inténtalo más tarde.';
    }
    if (r.includes('credenciales') || r.includes('inválidas') || r.includes('invalid')) {
      return 'Correo o contraseña incorrectos. Verifica tus datos.';
    }
    // Si el mensaje ya es amigable (viene del backend sanitizado), usarlo;
    // si parece técnico, usar mensaje genérico.
    if (msg.length > 120 || msg.includes('Error:') || msg.includes('at ')) {
      return 'Ocurrió un error inesperado. Inténtalo de nuevo.';
    }
    return msg;
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim())  e.email    = 'El correo es requerido';
    if (!password)      e.password = 'La contraseña es requerida';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    setServerError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const response = await authApi.login(email.trim(), password);
      await login(response.token, response.user, response.refreshToken);
    } catch (err: any) {
      setServerError(sanitizeError(err.message ?? 'Credenciales inválidas. Verifica tu correo y contraseña.'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setServerError('');
    setGoogleLoading(true);
    try {
      const response = await signInWithGoogle();
      await login(response.token, response.user, response.refreshToken);
    } catch (err: any) {
      if (err.code !== 'SIGN_IN_CANCELLED' && err.message !== 'Sign in action cancelled') {
        setServerError(sanitizeError(err.message ?? 'No se pudo iniciar sesión con Google.'));
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setServerError('');
    setFacebookLoading(true);
    try {
      const response = await signInWithFacebook();
      await login(response.token, response.user, response.refreshToken);
    } catch (err: any) {
      if (err.code !== 'SIGN_IN_CANCELLED' && err.message !== 'Sign in action cancelled') {
        setServerError(sanitizeError(err.message ?? 'No se pudo iniciar sesión con Facebook.'));
      }
    } finally {
      setFacebookLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}
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

          <Text style={styles.label}>Correo Electrónico</Text>
          <View style={[styles.inputWrapper, (errors.email || serverError) && styles.inputError]}>
            <TextInput
              style={styles.input}
              placeholder="correo electrónico"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={email}
              onChangeText={t => { setEmail(t); setErrors(p => ({ ...p, email: '' })); setServerError(''); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

          <Text style={styles.label}>Contraseña</Text>
          <View style={[styles.inputWrapper, (errors.password || serverError) && styles.inputError]}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="contraseña"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={password}
              onChangeText={t => { setPassword(t); setErrors(p => ({ ...p, password: '' })); setServerError(''); }}
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

          {serverError ? (
            <View style={styles.serverErrorRow}>
              <MaterialCommunityIcons name="alert-circle-outline" size={14} color={BrandColors.pinkLight} style={{ marginRight: 5 }} />
              <Text style={styles.serverErrorText}>{serverError}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            onPress={() => router.push('/(auth)/recuperar')}
            activeOpacity={0.7}
            style={styles.forgotBtn}
          >
            <Text style={styles.forgotText}>¿te olvidaste de tu contraseña?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
            activeOpacity={0.85}
            onPress={handleLogin}
            disabled={loading || googleLoading}
          >
            {loading
              ? <ActivityIndicator color={BrandColors.white} />
              : <Text style={styles.primaryBtnText}>Iniciar Sesión</Text>
            }
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o continúa con</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialRow}>
            <TouchableOpacity 
              style={styles.socialBtn}
              activeOpacity={0.8}
              onPress={handleGoogleLogin}
              disabled={loading || googleLoading || facebookLoading}
            >
              {googleLoading ? (
                <ActivityIndicator color={BrandColors.white} size="small" />
              ) : (
                <MaterialCommunityIcons name="google" size={24} color={BrandColors.white} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialBtn}
              activeOpacity={0.8}
              onPress={handleFacebookLogin}
              disabled={loading || googleLoading || facebookLoading}
            >
              {facebookLoading ? (
                <ActivityIndicator color={BrandColors.white} size="small" />
              ) : (
                <MaterialCommunityIcons name="facebook" size={24} color={BrandColors.white} />
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/(auth)/registro')}
            activeOpacity={0.7}
            style={styles.switchBtn}
          >
            <Text style={styles.switchText}>Registrarse</Text>
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

  topBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, marginLeft: -80, marginTop: -10 },
  logoFull: { width: 230, height: 76 },

  centerIcon: { alignItems: 'center', marginVertical: 16 },
  logoIcon:   { width: 920, height: 220, opacity: 0.95 },

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

  serverErrorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginLeft: 2,
  },
  serverErrorText: {
    color: BrandColors.pinkLight,
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },

  forgotBtn: { alignSelf: 'flex-end', marginTop: 4, marginBottom: 20 },
  forgotText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    textDecorationLine: 'underline',
  },

  primaryBtn: {
    backgroundColor: BrandColors.purple,
    borderRadius: 10,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
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

  divider:     { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.25)' },
  dividerText: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginHorizontal: 10 },

  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: 24, marginBottom: 24 },
  socialBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialBtnText: { color: BrandColors.white, fontSize: 16, fontWeight: '600' },

  switchBtn:  { alignItems: 'center' },
  switchText: { color: BrandColors.white, fontSize: 15, fontWeight: '600', textDecorationLine: 'underline' },
});
