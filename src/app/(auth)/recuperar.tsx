import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandColors } from '@/constants/theme';
import { authApi } from '@/services/api';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

export default function RecuperarScreen() {
  const router   = useRouter();
  const insets   = useSafeAreaInsets();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [email, setEmail]       = useState('');
  const [emailError, setEmailError] = useState('');

  const [code, setCode]         = useState('');
  const [codeError, setCodeError] = useState('');

  const [newPass, setNewPass]         = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showNew, setShowNew]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passError, setPassError]     = useState('');
  const [confirmError, setConfirmError] = useState('');

  const [loading, setLoading]     = useState(false);

  const handleSendEmail = async () => {
    if (!email.trim()) {
      setEmailError('El correo es requerido');
      return;
    }
    setEmailError('');
    setLoading(true);
    try {
      await authApi.forgotPassword(email.trim());
      setStep(2);
    } catch (err: any) {
      setEmailError(err.message ?? 'No encontramos una cuenta con ese correo');
    } finally {
      setLoading(false);
    }
  };


  const handleVerifyCode = async () => {
    const trimmed = code.trim();
    if (!trimmed) {
      setCodeError('Ingresa el código de 6 dígitos');
      return;
    }
    if (trimmed.length < 6) {
      setCodeError('El código debe tener 6 dígitos');
      return;
    }
    setCodeError('');
    setLoading(true);
    try {
      await authApi.verifyResetCode(email.trim(), trimmed);
      setStep(3);
    } catch (err: any) {
      setCodeError(err.message ?? 'Código incorrecto o expirado. Revisa tu correo.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    let hasError = false;
    if (!newPass) {
      setPassError('La contraseña es requerida');
      hasError = true;
    } else if (!PASSWORD_REGEX.test(newPass)) {
      setPassError('Mínimo 8 caracteres, mayúscula, minúscula, número y símbolo');
      hasError = true;
    } else {
      setPassError('');
    }
    if (newPass !== confirmPass) {
      setConfirmError('Las contraseñas no coinciden');
      hasError = true;
    } else {
      setConfirmError('');
    }
    if (hasError) return;

    setLoading(true);
    try {
      await authApi.resetPasswordConfirm(email.trim(), code.trim(), newPass);
      router.replace('/(auth)/login');
    } catch (err: any) {
      setPassError(err.message ?? 'Ocurrió un error. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const stepTitles = ['Recuperar contraseña', 'Ingresa el código', 'Nueva contraseña'];
  const stepDescriptions = [
    'Te enviaremos un código de 6 dígitos al correo registrado en tu cuenta.',
    `Ingresa el código de 6 dígitos que enviamos a ${email}.`,
    'Elige una contraseña segura para tu cuenta.',
  ];

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

        <View style={styles.stepsRow}>
          {[1, 2, 3].map(n => (
            <View key={n} style={styles.stepItemRow}>
              <View style={[styles.stepDot, step >= n && styles.stepDotActive]}>
                {step > n
                  ? <MaterialCommunityIcons name="check" size={12} color="#FFF" />
                  : <Text style={styles.stepDotText}>{n}</Text>
                }
              </View>
              {n < 3 && <View style={[styles.stepLine, step > n && styles.stepLineActive]} />}
            </View>
          ))}
        </View>

        <Text style={styles.stepTitle}>{stepTitles[step - 1]}</Text>
        <Text style={styles.description}>{stepDescriptions[step - 1]}</Text>

        <View style={styles.form}>

          {step === 1 && (
            <>
              <Text style={styles.label}>Correo Electrónico</Text>
              <View style={[styles.inputWrapper, emailError && styles.inputError]}>
                <TextInput
                  style={styles.input}
                  placeholder="ejemplo@email.com"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={email}
                  onChangeText={t => { setEmail(t); setEmailError(''); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
              {emailError ? (
                <View style={styles.inlineErrorRow}>
                  <MaterialCommunityIcons name="alert-circle-outline" size={13} color={BrandColors.pinkLight} style={{ marginRight: 4 }} />
                  <Text style={styles.errorText}>{emailError}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
                activeOpacity={0.85}
                onPress={handleSendEmail}
                disabled={loading}
              >
                {loading
                  ? <ActivityIndicator color={BrandColors.white} />
                  : <Text style={styles.primaryBtnText}>Enviar código</Text>
                }
              </TouchableOpacity>
            </>
          )}

         
          {step === 2 && (
            <>
              <Text style={styles.label}>Código de verificación</Text>
              <View style={[styles.inputWrapper, styles.codeInputWrapper, codeError && styles.inputError]}>
                <TextInput
                  style={[styles.input, styles.codeInput]}
                  placeholder="• • • • • •"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={code}
                  onChangeText={t => { setCode(t.replace(/[^0-9]/g, '')); setCodeError(''); }}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                />
              </View>
              {codeError ? (
                <View style={styles.inlineErrorRow}>
                  <MaterialCommunityIcons name="alert-circle-outline" size={13} color={BrandColors.pinkLight} style={{ marginRight: 4 }} />
                  <Text style={styles.errorText}>{codeError}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
                activeOpacity={0.85}
                onPress={handleVerifyCode}
                disabled={loading}
              >
                {loading
                  ? <ActivityIndicator color={BrandColors.white} />
                  : <Text style={styles.primaryBtnText}>Verificar código</Text>
                }
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => { setStep(1); setCode(''); setCodeError(''); }}
                activeOpacity={0.7}
                style={styles.linkBtn}
              >
                <Text style={styles.linkText}>¿No llegó el código? Reenviar correo</Text>
              </TouchableOpacity>
            </>
          )}

          
          {step === 3 && (
            <>
              <Text style={styles.label}>Nueva contraseña</Text>
              <View style={[styles.inputWrapper, passError && styles.inputError]}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="nueva contraseña"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={newPass}
                  onChangeText={t => { setNewPass(t); setPassError(''); }}
                  secureTextEntry={!showNew}
                  autoCapitalize="none"
                  autoFocus
                />
                <Pressable onPress={() => setShowNew(!showNew)} style={styles.eyeBtn}>
                  <MaterialCommunityIcons
                    name={showNew ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="rgba(255,255,255,0.7)"
                  />
                </Pressable>
              </View>
              {passError ? (
                <View style={styles.inlineErrorRow}>
                  <MaterialCommunityIcons name="alert-circle-outline" size={13} color={BrandColors.pinkLight} style={{ marginRight: 4 }} />
                  <Text style={styles.errorText}>{passError}</Text>
                </View>
              ) : null}

              <Text style={[styles.label, { marginTop: 8 }]}>Confirmar contraseña</Text>
              <View style={[styles.inputWrapper, confirmError && styles.inputError]}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="confirmar contraseña"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={confirmPass}
                  onChangeText={t => { setConfirmPass(t); setConfirmError(''); }}
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
              {confirmError ? (
                <View style={styles.inlineErrorRow}>
                  <MaterialCommunityIcons name="alert-circle-outline" size={13} color={BrandColors.pinkLight} style={{ marginRight: 4 }} />
                  <Text style={styles.errorText}>{confirmError}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
                activeOpacity={0.85}
                onPress={handleResetPassword}
                disabled={loading}
              >
                {loading
                  ? <ActivityIndicator color={BrandColors.white} />
                  : <Text style={styles.primaryBtnText}>Cambiar contraseña</Text>
                }
              </TouchableOpacity>
            </>
          )}

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
  root:   { flex: 1, backgroundColor: 'transparent' },
  scroll: { flexGrow: 1, paddingHorizontal: 32 },

  topBar:   { flexDirection: 'row', alignItems: 'center', marginBottom: 4, marginLeft: -80, marginTop: -10 },
  logoFull: { width: 230, height: 76 },

  centerIcon: { alignItems: 'center', marginVertical: 14 },
  logoIcon:   { width: 920, height: 220, opacity: 0.95 },

 
  stepsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  stepItemRow: { flexDirection: 'row', alignItems: 'center' },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  stepDotActive: {
    backgroundColor: BrandColors.purple,
    borderColor: BrandColors.purple,
  },
  stepDotText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '700',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 4,
  },
  stepLineActive: {
    backgroundColor: BrandColors.purple,
  },

  stepTitle: {
    color: BrandColors.white,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  description: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
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

 
  codeInputWrapper: {
    justifyContent: 'center',
  },
  codeInput: {
    textAlign: 'center',
    fontSize: 28,
    letterSpacing: 12,
    fontWeight: '700',
    height: 64,
  },

  inlineErrorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    marginLeft: 2,
  },
  errorText: {
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
    marginBottom: 12,
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

  linkBtn: { alignItems: 'center', marginBottom: 8 },
  linkText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    textDecorationLine: 'underline',
  },

  backBtn:  { alignItems: 'center', paddingVertical: 8, marginTop: 4 },
  backText: { color: BrandColors.white, fontSize: 16, fontWeight: '600' },


});
