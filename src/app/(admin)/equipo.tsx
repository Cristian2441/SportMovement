import React, { useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { BrandColors } from '@/constants/theme';
import { empleadoApi } from '@/services/api';
import SideMenu from '@/components/SideMenu';

interface StatCard {
  label: string;
  value: number;
  color: string;
  bgColor: string;
}

interface Turno {
  id: string;
  nombre: string;
  especialidad: string;
  asignado: string;
  emoji: string;
  bgEmoji: string;
  hace: string;
}

const INITIAL_STATS: StatCard[] = [
  { label: 'TOTAL',      value: 0, color: '#2ECC8A', bgColor: '#EDFAF4' },
  { label: 'ACTIVOS',    value: 0, color: '#2ECC8A', bgColor: '#EDFAF4' },
  { label: 'VACACIONES', value: 0, color: '#F5A623', bgColor: '#FFF8ED' },
  { label: 'INACTIVOS',  value: 0, color: '#AAAAAA', bgColor: '#F5F5F7' },
];

const PROXIMOS_TURNOS: Turno[] = [];

const ROL_OPTIONS    = ['Entrenador', 'Nutricionista', 'Recepcionista', 'Administrador'];
const ESTADO_OPTIONS = ['Activo', 'Inactivo', 'Vacaciones'];
const TURNO_OPTIONS  = ['Mañana', 'Tarde', 'Noche', 'Full'];


function parseFecha(raw: string): string | null {
  const clean = raw.replace(/[^0-9]/g, '');
  if (clean.length !== 8) return null;
  const dd = clean.slice(0, 2);
  const mm = clean.slice(2, 4);
  const yyyy = clean.slice(4, 8);
  const d = Number(dd), m = Number(mm), y = Number(yyyy);
  if (m < 1 || m > 12 || d < 1 || d > 31 || y < 1900) return null;
  return `${yyyy}-${mm}-${dd}`;
}


function formatFechaInput(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`;
}

function SelectField({
  label,
  value,
  options,
  onSelect,
  placeholder = 'Seleccionar',
}: {
  label: string;
  value: string;
  options: string[];
  onSelect: (v: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={modal.select}
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
      >
        <Text style={[modal.selectText, !value && { color: BrandColors.mediumGray }]}>
          {value || placeholder}
        </Text>
        <MaterialCommunityIcons name="chevron-down" size={18} color={BrandColors.mediumGray} />
      </TouchableOpacity>
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={modal.optionsBackdrop} onPress={() => setOpen(false)}>
          <Pressable style={modal.optionsCard} onPress={() => {}}>
            <View style={modal.optionsHeader}>
              <Text style={modal.optionsTitle}>{label || 'Seleccionar'}</Text>
              <TouchableOpacity onPress={() => setOpen(false)} hitSlop={12}>
                <MaterialCommunityIcons name="close" size={20} color={BrandColors.mediumGray} />
              </TouchableOpacity>
            </View>

            {options.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[
                  modal.optionItem,
                  opt === value && modal.optionItemActive,
                ]}
                onPress={() => { onSelect(opt); setOpen(false); }}
                activeOpacity={0.7}
              >
                <Text style={[
                  modal.optionText,
                  opt === value && modal.optionTextActive,
                ]}>
                  {opt}
                </Text>
                {opt === value && (
                  <MaterialCommunityIcons name="check" size={18} color={BrandColors.pink} />
                )}
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}


export default function AdminEquipoScreen() {
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [modalOpen,   setModalOpen]   = useState(false);
  const [busqueda,    setBusqueda]    = useState('');
  const [cargando,    setCargando]    = useState(false);
  const [successModal, setSuccessModal] = useState({ visible: false, nombre: '', email: '' });

 
  const [nombre,         setNombre]         = useState('');
  const [cargo,          setCargo]          = useState('');
  const [estado,         setEstado]         = useState('Activo');
  const [telefono,       setTelefono]       = useState('');
  const [turno,          setTurno]          = useState('');
  const [email,          setEmail]          = useState('');
  const [password,       setPassword]       = useState('');
  const [salario,        setSalario]        = useState('');
  const [fechaIngreso,   setFechaIngreso]   = useState('');
  const [especialidades, setEspecialidades] = useState('');

  const [stats, setStats] = useState<StatCard[]>(INITIAL_STATS);
  const [totalEmpleados, setTotalEmpleados] = useState(0);

  const cargarEstadisticas = useCallback(async () => {
    try {
      const resp = await empleadoApi.listar();
      const empleados = resp.empleados || [];
      
      const total = empleados.length;
      const activos = empleados.filter((e: any) => e.estado === 'activo').length;
      const vacaciones = empleados.filter((e: any) => e.estado === 'vacaciones').length;
      const inactivos = empleados.filter((e: any) => e.estado === 'inactivo').length;
      
      setTotalEmpleados(total);
      setStats([
        { label: 'TOTAL',      value: total, color: '#2ECC8A', bgColor: '#EDFAF4' },
        { label: 'ACTIVOS',    value: activos, color: '#2ECC8A', bgColor: '#EDFAF4' },
        { label: 'VACACIONES', value: vacaciones, color: '#F5A623', bgColor: '#FFF8ED' },
        { label: 'INACTIVOS',  value: inactivos, color: '#AAAAAA', bgColor: '#F5F5F7' },
      ]);
    } catch (err) {
      console.error("Error al cargar estadísticas", err);
    }
  }, []);

  React.useEffect(() => {
    cargarEstadisticas();
  }, [cargarEstadisticas]);

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === 'web' ? 16 : insets.top + 8;

  const handleNavigate = (route: string) => router.push(route as any);

  const resetForm = () => {
    setNombre(''); setCargo(''); setEstado('Activo');
    setTelefono(''); setTurno(''); setEmail('');
    setPassword(''); setSalario(''); setFechaIngreso(''); setEspecialidades('');
  };

  const handleCerrarModal = () => { setModalOpen(false); resetForm(); };

  const handleAgregarEmpleado = useCallback(async () => {
    if (!nombre.trim() || !email.trim() || !cargo || !password.trim()) {
      Alert.alert('Campos requeridos', 'Nombre completo, email, cargo y contraseña son obligatorios.');
      return;
    }
    if (password.trim().length < 6) {
      Alert.alert('Contraseña muy corta', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    let fechaISO: string | undefined = undefined;
    if (fechaIngreso.trim()) {
      const parsed = parseFecha(fechaIngreso.trim());
      if (!parsed) {
        Alert.alert('Fecha inválida', 'Ingresa la fecha en formato dd-mm-aaaa (ej: 15-06-2024).');
        return;
      }
      fechaISO = parsed;
    }

    try {
      setCargando(true);
      const resp = await empleadoApi.crear({
        nombre_completo: nombre.trim(),
        email:           email.trim(),
        password:        password.trim(),
        cargo,
        estado:          estado.toLowerCase(),
        telefono:        telefono.trim() || undefined,
        turno:           turno           || undefined,
        salario:         salario.trim()  || undefined,
        fecha_ingreso:   fechaISO,
        especialidades:  especialidades.trim() || undefined,
      });

      setModalOpen(false);
      resetForm();

      setSuccessModal({
        visible: true,
        nombre: resp.empleado.nombre_completo,
        email: resp.empleado.email,
      });

      // Recargar estadísticas después de agregar uno nuevo
      cargarEstadisticas();
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'No se pudo crear el empleado. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  }, [nombre, email, password, cargo, estado, telefono, turno, salario, fechaIngreso, especialidades]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <Image
            source={require('@/assets/images/splash.png')}
            style={styles.heroBg}
            resizeMode="cover"
            tintColor={BrandColors.purple}
          />
          <View style={styles.heroOverlay} />

          <View style={[styles.topBar, { paddingTop: topPad }]}>
            <TouchableOpacity
              style={styles.hamburgerPill}
              onPress={() => setMenuOpen(true)}
              activeOpacity={0.8}
              accessibilityLabel="Abrir menú"
            >
              <MaterialCommunityIcons name="menu" size={28} color={BrandColors.black} />
            </TouchableOpacity>
            <Image
              source={require('@/assets/images/logo-full.png')}
              style={styles.logo}
              resizeMode="contain"
              tintColor={BrandColors.white}
            />
          </View>

          <View style={styles.heroTitleContainer}>
            <Text style={styles.heroTitle}>Equipo</Text>
            <Text style={styles.heroSubtitle}>
              {totalEmpleados} empleado{totalEmpleados !== 1 ? 's' : ''}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.nuevoBtn}
            activeOpacity={0.85}
            onPress={() => setModalOpen(true)}
            accessibilityLabel="Agregar nuevo empleado"
          >
            <MaterialCommunityIcons name="plus" size={18} color={BrandColors.white} />
            <Text style={styles.nuevoBtnText}>Nuevo</Text>
          </TouchableOpacity>

          <View style={styles.brushEdgeContainer} pointerEvents="none">
            <Image
              source={require('@/assets/images/splash.png')}
              style={styles.brushEdgeImage}
              resizeMode="cover"
              tintColor={BrandColors.white}
            />
          </View>
        </View>

        <View style={styles.contentSection}>

          <View style={styles.searchContainer}>
            <MaterialCommunityIcons name="magnify" size={20} color={BrandColors.mediumGray} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar empleado..."
              placeholderTextColor={BrandColors.mediumGray}
              value={busqueda}
              onChangeText={setBusqueda}
              accessibilityLabel="Buscar empleado"
            />
          </View>
          <View style={styles.statsRow}>
            {stats.map((stat) => (
              <View key={stat.label} style={[styles.statCard, { backgroundColor: stat.bgColor }]}>
                <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>PRÓXIMOS TURNOS</Text>

          {PROXIMOS_TURNOS.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="calendar-blank-outline" size={52} color={BrandColors.lightGray} />
              <Text style={styles.emptyTitle}>Sin turnos programados</Text>
              <Text style={styles.emptySubtitle}>
                Agrega empleados para comenzar a gestionar los turnos del equipo.
              </Text>
            </View>
          ) : (
            PROXIMOS_TURNOS.map((turno) => (
              <TouchableOpacity key={turno.id} style={styles.turnoCard} activeOpacity={0.8}>
                <View style={[styles.turnoEmoji, { backgroundColor: turno.bgEmoji }]}>
                  <Text style={styles.turnoEmojiText}>{turno.emoji}</Text>
                </View>
                <View style={styles.turnoInfo}>
                  <Text style={styles.turnoNombre}>{turno.nombre}</Text>
                  <Text style={styles.turnoDetalle}>{turno.especialidad} · {turno.asignado}</Text>
                </View>
                <View style={styles.turnoTime}>
                  <MaterialCommunityIcons name="clock-outline" size={16} color={BrandColors.mediumGray} />
                  <Text style={styles.turnoTimeText}>{turno.hace}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
      <SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} onNavigate={handleNavigate} />
      <Modal
        visible={modalOpen}
        transparent
        animationType="fade"
        onRequestClose={handleCerrarModal}
      >
        <Pressable style={modal.backdrop} onPress={handleCerrarModal}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={modal.kvWrap}
          >
            <Pressable style={modal.card} onPress={() => {}}>
              <View style={modal.header}>
                <Text style={modal.title}>Nuevo Empleado</Text>
                <TouchableOpacity onPress={handleCerrarModal} hitSlop={12}>
                  <MaterialCommunityIcons name="close" size={22} color={BrandColors.mediumGray} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={modal.body}>

                <View style={modal.fieldWrap}>
                  <Text style={modal.fieldLabel}>NOMBRE COMPLETO <Text style={modal.required}>*</Text></Text>
                  <TextInput
                    style={modal.input}
                    placeholder="Juan Pérez"
                    placeholderTextColor={BrandColors.mediumGray}
                    value={nombre}
                    onChangeText={setNombre}
                  />
                </View>

                <View style={modal.row}>
                  <View style={[modal.fieldWrap, { flex: 1 }]}>
                    <Text style={modal.fieldLabel}>ROL <Text style={modal.required}>*</Text></Text>
                    <SelectField label="Cargo" value={cargo} options={ROL_OPTIONS} onSelect={setCargo} placeholder="Seleccionar" />
                  </View>
                  <View style={{ width: 12 }} />
                  <View style={[modal.fieldWrap, { flex: 1 }]}>
                    <Text style={modal.fieldLabel}>ESTADO</Text>
                    <SelectField label="Estado" value={estado} options={ESTADO_OPTIONS} onSelect={setEstado} placeholder="Seleccionar" />
                  </View>
                </View>

                <View style={modal.row}>
                  <View style={[modal.fieldWrap, { flex: 1 }]}>
                    <Text style={modal.fieldLabel}>TELÉFONO</Text>
                    <TextInput
                      style={modal.input}
                      placeholder="+54 11 1234-5678"
                      placeholderTextColor={BrandColors.mediumGray}
                      keyboardType="phone-pad"
                      value={telefono}
                      onChangeText={setTelefono}
                    />
                  </View>
                  <View style={{ width: 12 }} />
                  <View style={[modal.fieldWrap, { flex: 1 }]}>
                    <Text style={modal.fieldLabel}>TURNO</Text>
                    <SelectField label="Turno" value={turno} options={TURNO_OPTIONS} onSelect={setTurno} placeholder="Seleccionar" />
                  </View>
                </View>
                <View style={modal.fieldWrap}>
                  <Text style={modal.fieldLabel}>CORREO ELECTRÓNICO <Text style={modal.required}>*</Text></Text>
                  <TextInput
                    style={modal.input}
                    placeholder="juan@gym.com"
                    placeholderTextColor={BrandColors.mediumGray}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>

                <View style={modal.fieldWrap}>
                  <Text style={modal.fieldLabel}>CONTRASEÑA <Text style={modal.required}>*</Text></Text>
                  <TextInput
                    style={modal.input}
                    placeholder="Mínimo 6 caracteres"
                    placeholderTextColor={BrandColors.mediumGray}
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                  />
                </View>
                <View style={modal.row}>
                  <View style={[modal.fieldWrap, { flex: 1 }]}>
                    <Text style={modal.fieldLabel}>SALARIO MENSUAL</Text>
                    <TextInput
                      style={modal.input}
                      placeholder="50000"
                      placeholderTextColor={BrandColors.mediumGray}
                      keyboardType="numeric"
                      value={salario}
                      onChangeText={setSalario}
                    />
                  </View>
                  <View style={{ width: 12 }} />
                  <View style={[modal.fieldWrap, { flex: 1 }]}>
                    <Text style={modal.fieldLabel}>FECHA INGRESO</Text>
                    <TextInput
                      style={modal.input}
                      placeholder="dd-mm-aaaa"
                      placeholderTextColor={BrandColors.mediumGray}
                      keyboardType="numeric"
                      maxLength={10}
                      value={fechaIngreso}
                      onChangeText={(t) => setFechaIngreso(formatFechaInput(t))}
                    />
                  </View>
                </View>
                <View style={modal.fieldWrap}>
                  <Text style={modal.fieldLabel}>ESPECIALIDADES</Text>
                  <TextInput
                    style={modal.input}
                    placeholder="CrossFit, Yoga, Musculación..."
                    placeholderTextColor={BrandColors.mediumGray}
                    value={especialidades}
                    onChangeText={setEspecialidades}
                  />
                </View>
                <TouchableOpacity
                  style={[modal.submitBtn, cargando && modal.submitBtnDisabled]}
                  activeOpacity={0.85}
                  onPress={handleAgregarEmpleado}
                  disabled={cargando}
                  accessibilityLabel="Agregar empleado"
                >
                  {cargando ? (
                    <ActivityIndicator color={BrandColors.white} size="small" />
                  ) : (
                    <>
                      <MaterialCommunityIcons name="account-plus" size={18} color={BrandColors.white} />
                      <Text style={modal.submitText}>Agregar Empleado</Text>
                    </>
                  )}
                </TouchableOpacity>

              </ScrollView>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>

      <Modal
        visible={successModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setSuccessModal({ ...successModal, visible: false })}
      >
        <View style={successModalStyles.backdrop}>
          <View style={successModalStyles.card}>
            <View style={successModalStyles.iconContainer}>
              <MaterialCommunityIcons name="check-circle" size={72} color="#2ECC8A" />
            </View>
            <Text style={successModalStyles.title}>¡Empleado registrado!</Text>
            <Text style={successModalStyles.message}>
              <Text style={{ fontWeight: '700', color: BrandColors.black }}>{successModal.nombre}</Text> fue agregado al equipo correctamente.
            </Text>
            <View style={successModalStyles.infoBox}>
              <Text style={successModalStyles.infoText}><Text style={{ fontWeight: '600', color: BrandColors.black }}>Email:</Text> {successModal.email}</Text>
              <Text style={successModalStyles.infoText}>La contraseña fue configurada y enviada a su correo.</Text>
            </View>
            <TouchableOpacity
              style={successModalStyles.btn}
              onPress={() => setSuccessModal({ ...successModal, visible: false })}
              activeOpacity={0.8}
            >
              <Text style={successModalStyles.btnText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root:          { flex: 1, backgroundColor: BrandColors.white },
  scroll:        { flex: 1 },
  scrollContent: { flexGrow: 1 },

  heroSection: {
    width: '100%', height: 260, position: 'relative',
    backgroundColor: BrandColors.purpleDark, overflow: 'hidden',
  },
  heroBg: { width: '100%', height: '100%', position: 'absolute', opacity: 0.7 },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(75, 31, 168, 0.35)' },

  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: 20,
  },
  hamburgerPill: {
    backgroundColor: BrandColors.white, paddingVertical: 12, paddingHorizontal: 16,
    borderTopRightRadius: 30, borderBottomRightRadius: 30,
    shadowColor: '#000', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 5,
  },
  logo:            { width: 140, height: 90, marginRight: -10 },
  heroTitleContainer: { position: 'absolute', bottom: 64, left: 24, zIndex: 15 },
  heroTitle:       { fontSize: 30, fontWeight: '800', color: BrandColors.white, letterSpacing: 0.5 },
  heroSubtitle:    { fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.75)', marginTop: 2 },

  nuevoBtn: {
    position: 'absolute', bottom: 64, right: 20,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: BrandColors.pink, paddingVertical: 10, paddingHorizontal: 18,
    borderRadius: 24, zIndex: 15,
    shadowColor: BrandColors.pink, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.45, shadowRadius: 8, elevation: 8,
  },
  nuevoBtnText:    { color: BrandColors.white, fontWeight: '700', fontSize: 15, marginLeft: 4 },

  brushEdgeContainer: { position: 'absolute', bottom: -20, left: 0, right: 0, height: 80, zIndex: 10 },
  brushEdgeImage:  { width: '100%', height: '100%' },

  contentSection: {
    flex: 1, backgroundColor: BrandColors.white,
    paddingTop: 24, paddingHorizontal: 18, paddingBottom: 32,
  },

  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: BrandColors.offWhite, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    marginBottom: 20, borderWidth: 1, borderColor: BrandColors.lightGray,
  },
  searchIcon:  { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: BrandColors.black },

  statsRow:  { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginBottom: 28 },
  statCard:  { flex: 1, alignItems: 'center', paddingVertical: 16, borderRadius: 14, gap: 4 },
  statValue: { fontSize: 24, fontWeight: '800' },
  statLabel: { fontSize: 9, fontWeight: '700', color: BrandColors.mediumGray, letterSpacing: 0.4, textAlign: 'center' },

  sectionTitle: { fontSize: 12, fontWeight: '800', color: BrandColors.black, letterSpacing: 1, marginBottom: 14 },

  turnoCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: BrandColors.white,
    borderRadius: 16, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
    borderWidth: 1, borderColor: BrandColors.lightGray,
  },
  turnoEmoji:     { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  turnoEmojiText: { fontSize: 24 },
  turnoInfo:      { flex: 1 },
  turnoNombre:    { fontSize: 15, fontWeight: '700', color: BrandColors.black, marginBottom: 2 },
  turnoDetalle:   { fontSize: 13, color: BrandColors.mediumGray },
  turnoTime:      { alignItems: 'center', gap: 2 },
  turnoTimeText:  { fontSize: 11, color: BrandColors.mediumGray, fontWeight: '500' },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, paddingHorizontal: 24 },
  emptyTitle:     { fontSize: 16, fontWeight: '700', color: BrandColors.darkGray, marginTop: 14, marginBottom: 6, textAlign: 'center' },
  emptySubtitle:  { fontSize: 13, color: BrandColors.mediumGray, textAlign: 'center', lineHeight: 19 },
});

const modal = StyleSheet.create({
  backdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center', padding: 16,
  },
  kvWrap: { width: '100%', maxWidth: 560, alignItems: 'center' },

  card: {
    width: '100%', backgroundColor: BrandColors.white,
    borderRadius: 20, maxHeight: '90%',
    shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.18, shadowRadius: 24, elevation: 20,
  },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 22, paddingTop: 22, paddingBottom: 10,
    borderBottomWidth: 1, borderBottomColor: BrandColors.lightGray,
  },
  title: { fontSize: 18, fontWeight: '800', color: BrandColors.black },

  body: { paddingHorizontal: 22, paddingTop: 18, paddingBottom: 24 },

  row:       { flexDirection: 'row', alignItems: 'flex-start' },
  fieldWrap: { marginBottom: 14 },
  fieldLabel: {
    fontSize: 10, fontWeight: '700', color: BrandColors.mediumGray,
    letterSpacing: 0.6, marginBottom: 6, textTransform: 'uppercase',
  },
  required: { color: BrandColors.pink },

  input: {
    borderWidth: 1, borderColor: BrandColors.lightGray, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 12 : 9,
    fontSize: 14, color: BrandColors.black, backgroundColor: BrandColors.offWhite,
  },

  select: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: BrandColors.lightGray, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 12 : 9,
    backgroundColor: BrandColors.offWhite,
  },
  selectText: { fontSize: 14, color: BrandColors.black },

  // ── Options picker modal ─────────────────────────────────────────────────
  optionsBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  optionsCard: {
    width: '100%', maxWidth: 360,
    backgroundColor: BrandColors.white, borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, shadowRadius: 16, elevation: 12,
  },
  optionsHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: BrandColors.lightGray,
  },
  optionsTitle: { fontSize: 15, fontWeight: '700', color: BrandColors.black },
  optionItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: BrandColors.offWhite,
  },
  optionItemActive: { backgroundColor: '#FFF0F5' },
  optionText:       { fontSize: 15, color: BrandColors.black },
  optionTextActive: { color: BrandColors.pink, fontWeight: '700' },

  submitBtn: {
    marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#2ECC8A', borderRadius: 12,
    paddingVertical: 14, gap: 8,
  },
  submitBtnDisabled: { opacity: 0.65 },
  submitText: { fontSize: 15, fontWeight: '700', color: BrandColors.white },
});

const successModalStyles = StyleSheet.create({
  backdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  card: {
    width: '100%', maxWidth: 360, backgroundColor: BrandColors.white,
    borderRadius: 24, padding: 32, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.2, shadowRadius: 24, elevation: 20,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22, fontWeight: '800', color: BrandColors.black, marginBottom: 12, textAlign: 'center', letterSpacing: -0.5,
  },
  message: {
    fontSize: 15, color: BrandColors.darkGray, textAlign: 'center', marginBottom: 24, lineHeight: 22,
  },
  infoBox: {
    backgroundColor: BrandColors.offWhite, borderRadius: 14, padding: 18, width: '100%', marginBottom: 28,
    borderWidth: 1, borderColor: BrandColors.lightGray,
  },
  infoText: {
    fontSize: 14, color: BrandColors.mediumGray, marginBottom: 8, lineHeight: 20,
  },
  btn: {
    backgroundColor: BrandColors.purple, borderRadius: 16, paddingVertical: 16, width: '100%', alignItems: 'center',
    shadowColor: BrandColors.purple, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
  btnText: {
    fontSize: 16, fontWeight: '700', color: BrandColors.white, letterSpacing: 0.5,
  },
});
