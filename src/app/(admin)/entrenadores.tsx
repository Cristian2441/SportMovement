import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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
import { empleadoApi, personaApi } from '@/services/api';
import SideMenu from '@/components/SideMenu';

// ─── Types ───────────────────────────────────────────────────────────────────

interface EntrenadorItem {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  estado: string;
  especialidad: string | null;
  clientesCount: number;
}

interface ClienteItem {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  estado: string;
  plan: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getEstadoColor(estado: string): string {
  switch (estado.toLowerCase()) {
    case 'activo':    return '#2ECC8A';
    case 'vacaciones': return '#F5A623';
    default:          return '#AAAAAA';
  }
}

function getEstadoBg(estado: string): string {
  switch (estado.toLowerCase()) {
    case 'activo':    return '#EDFAF4';
    case 'vacaciones': return '#FFF8ED';
    default:          return '#F5F5F7';
  }
}

function getInitials(nombre: string): string {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

const AVATAR_COLORS = [
  '#C8B8F5', '#F5C8D0', '#B8E8D0', '#B8D8F5', '#F5E8B8',
];
function getAvatarColor(id: string): string {
  const idx = id.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

// ─── Entrenador Detail Modal ──────────────────────────────────────────────────

function EntrenadorModal({
  entrenador,
  onClose,
}: {
  entrenador: EntrenadorItem | null;
  onClose: () => void;
}) {
  if (!entrenador) return null;

  const estadoColor = getEstadoColor(entrenador.estado);
  const estadoBg   = getEstadoBg(entrenador.estado);
  const avatarBg   = getAvatarColor(entrenador.id);
  const initials   = getInitials(entrenador.nombre);

  const handleEliminar = () => {
    Alert.alert(
      'Eliminar entrenador',
      `¿Estás seguro de que deseas eliminar a ${entrenador.nombre}? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await empleadoApi.eliminar(entrenador.id);
              onClose();
            } catch (err: any) {
              Alert.alert('Error', err.message ?? 'No se pudo eliminar el entrenador.');
            }
          },
        },
      ]
    );
  };

  const ACTIONS = [
    {
      icon: 'account-multiple-outline' as const,
      iconBg: '#EEE8FF',
      iconColor: BrandColors.purple,
      title: 'Ver sus clientes',
      subtitle: `${entrenador.clientesCount} clientes asignados`,
      onPress: () => {},
      danger: false,
    },
    {
      icon: 'account-plus-outline' as const,
      iconBg: '#FFE8F0',
      iconColor: BrandColors.pink,
      title: 'Asignar / quitar clientes',
      subtitle: 'Gestionar asignaciones',
      onPress: () => {},
      danger: false,
    },
    {
      icon: 'pencil-outline' as const,
      iconBg: '#FFF8ED',
      iconColor: '#F5A623',
      title: 'Editar entrenador',
      subtitle: 'Modificar datos del perfil',
      onPress: () => {},
      danger: false,
    },
    {
      icon: 'trash-can-outline' as const,
      iconBg: '#FFEEEE',
      iconColor: '#E74C3C',
      title: 'Eliminar entrenador',
      subtitle: 'Esta acción no se puede deshacer',
      onPress: handleEliminar,
      danger: true,
    },
  ];

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={det.backdrop} onPress={onClose}>
        <Pressable style={det.sheet} onPress={() => {}}>
          {/* Close button */}
          <TouchableOpacity style={det.closeBtn} onPress={onClose} hitSlop={12}>
            <MaterialCommunityIcons name="close" size={20} color={BrandColors.mediumGray} />
          </TouchableOpacity>

          {/* Avatar + name */}
          <View style={det.header}>
            <View style={[det.avatar, { backgroundColor: avatarBg }]}>
              <Text style={det.avatarText}>{initials}</Text>
            </View>
            <View style={det.headerInfo}>
              <Text style={det.headerName}>{entrenador.nombre}</Text>
              <View style={det.headerRow}>
                <Text style={det.headerSpec}>
                  {entrenador.especialidad || 'Sin especialidad'}
                </Text>
                <View style={[det.estadoBadge, { backgroundColor: estadoBg }]}>
                  <Text style={[det.estadoText, { color: estadoColor }]}>
                    {entrenador.estado.charAt(0).toUpperCase() + entrenador.estado.slice(1)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Contact info */}
          <View style={det.contactRow}>
            {entrenador.telefono ? (
              <View style={det.contactItem}>
                <MaterialCommunityIcons name="phone-outline" size={15} color={BrandColors.mediumGray} />
                <Text style={det.contactText}>{entrenador.telefono}</Text>
              </View>
            ) : null}
            <View style={det.contactItem}>
              <MaterialCommunityIcons name="email-outline" size={15} color={BrandColors.mediumGray} />
              <Text style={det.contactText} numberOfLines={1}>{entrenador.email}</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={det.divider} />

          {/* Actions */}
          {ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.title}
              style={[det.actionRow, action.danger && det.actionRowDanger, { backgroundColor: action.iconBg }]}
              activeOpacity={0.75}
              onPress={action.onPress}
            >
              <View style={det.actionInfo}>
                <Text style={[det.actionTitle, { color: action.iconColor }]}>
                  {action.title}
                </Text>
                <Text style={det.actionSubtitle}>{action.subtitle}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Cliente Detail Modal ─────────────────────────────────────────────────────

function ClienteModal({
  cliente,
  onClose,
}: {
  cliente: ClienteItem | null;
  onClose: () => void;
}) {
  if (!cliente) return null;

  const estadoColor = getEstadoColor(cliente.estado);
  const estadoBg   = getEstadoBg(cliente.estado);
  const avatarBg   = getAvatarColor(cliente.id);

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={det.backdrop} onPress={onClose}>
        <Pressable style={det.sheet} onPress={() => {}}>
          {/* Close button */}
          <TouchableOpacity style={det.closeBtn} onPress={onClose} hitSlop={12}>
            <MaterialCommunityIcons name="close" size={20} color={BrandColors.mediumGray} />
          </TouchableOpacity>

          {/* Avatar + name */}
          <View style={det.header}>
            <View style={[det.avatar, { backgroundColor: '#F3E8FF' }]}>
              <MaterialCommunityIcons name="account-outline" size={32} color={BrandColors.purple} />
            </View>
            <View style={det.headerInfo}>
              <Text style={det.headerName}>{cliente.nombre}</Text>
              <View style={det.headerRow}>
                <View style={[det.estadoBadge, { backgroundColor: estadoBg }]}>
                  <Text style={[det.estadoText, { color: estadoColor }]}>
                    {cliente.estado.charAt(0).toUpperCase() + cliente.estado.slice(1)}
                  </Text>
                </View>
                <View style={[det.estadoBadge, { backgroundColor: '#F5F5F7' }]}>
                  <Text style={[det.estadoText, { color: BrandColors.mediumGray }]}>
                    {cliente.plan}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Vencimiento */}
          <View style={det.boxContainer}>
            <Text style={det.boxTitle}>VENCIMIENTO DEL PLAN</Text>
            {/* The user requested no text or icons here, just the bounding box */}
            <View style={{ height: 20 }} /> 
          </View>

          {/* Próximo entrenamiento */}
          <View style={det.boxContainer}>
            <Text style={det.boxTitle}>PRÓXIMO ENTRENAMIENTO</Text>
            {/* Empty as requested */}
            <View style={{ height: 20 }} />
          </View>

          {/* Entrenador Asignado */}
          <View style={[det.actionRow, { backgroundColor: '#FFE8F0' }]}>
            <View style={det.actionInfo}>
              <Text style={det.actionSubtitleModalTop}>ENTRENADOR ASIGNADO</Text>
              <Text style={[det.actionTitle, { color: BrandColors.pink }]}>Sin entrenador</Text>
            </View>
          </View>

          {/* Contact info box */}
          <View style={[det.boxContainer, { paddingVertical: 18 }]}>
            <Text style={[det.contactTextBasic, { marginBottom: 4 }]}>{cliente.email}</Text>
            {cliente.telefono ? (
              <Text style={det.contactTextBasic}>{cliente.telefono}</Text>
            ) : <Text style={det.contactTextBasic}>Sin teléfono</Text>}
          </View>

          {/* Recomendación */}
          <View style={[det.boxContainer, { marginBottom: 0 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={det.boxTitle}>RECOMENDACIÓN DEL CLIENTE</Text>
              <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} activeOpacity={0.7}>
                <MaterialCommunityIcons name="plus-box-outline" size={16} color={BrandColors.purple} />
                <Text style={{ color: BrandColors.purple, fontSize: 13, fontWeight: '700', marginLeft: 4 }}>Agregar</Text>
              </TouchableOpacity>
            </View>
            <Text style={{ color: BrandColors.mediumGray, fontSize: 14 }}>Sin recomendaciones aún</Text>
          </View>

        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function AdminEntrenadoresScreen() {
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [busqueda,    setBusqueda]    = useState('');
  const [activeTab,   setActiveTab]   = useState<'entrenadores' | 'clientes'>('entrenadores');
  
  const [entrenadores, setEntrenadores] = useState<EntrenadorItem[]>([]);
  const [cargandoEntrenadores, setCargandoEntrenadores] = useState(true);
  const [selectedEntrenador, setSelectedEntrenador] = useState<EntrenadorItem | null>(null);

  const [clientes, setClientes] = useState<ClienteItem[]>([]);
  const [cargandoClientes, setCargandoClientes] = useState(true);
  const [selectedCliente, setSelectedCliente] = useState<ClienteItem | null>(null);

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === 'web' ? 16 : insets.top + 8;

  const handleNavigate = (route: string) => router.push(route as any);

  const cargarEntrenadores = useCallback(async () => {
    try {
      setCargandoEntrenadores(true);
      const resp = await empleadoApi.listar();
      const filtrados = resp.empleados
        .filter((e) => e.cargo.toLowerCase() === 'entrenador')
        .map((e) => ({
          id:            e.id,
          nombre:        e.personas.nombre_completo,
          email:         e.personas.email,
          telefono:      e.personas.fono,
          estado:        e.estado,
          especialidad:  e.especialidades,
          clientesCount: 0,
        }));
      setEntrenadores(filtrados);
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'No se pudo cargar la lista de entrenadores.');
    } finally {
      setCargandoEntrenadores(false);
    }
  }, []);

  const cargarClientes = useCallback(async () => {
    try {
      setCargandoClientes(true);
      const resp = await personaApi.listarPorRol('alumno');
      const filtrados = resp.map((r: any) => ({
        id:            r.personas.id,
        nombre:        r.personas.nombre_completo,
        email:         r.personas.email,
        telefono:      r.personas.fono || null,
        estado:        'activo', // por defecto
        plan:          'Basico', // por defecto
      }));
      setClientes(filtrados);
    } catch (err: any) {
      if (err.message && err.message.includes('No se encontraron')) {
        setClientes([]);
      } else {
        Alert.alert('Error', err.message ?? 'No se pudo cargar la lista de clientes.');
      }
    } finally {
      setCargandoClientes(false);
    }
  }, []);

  useEffect(() => {
    cargarEntrenadores();
    cargarClientes();
  }, [cargarEntrenadores, cargarClientes]);

  const filtradosEntrenadores = entrenadores.filter((e) =>
    e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (e.especialidad ?? '').toLowerCase().includes(busqueda.toLowerCase())
  );

  const filtradosClientes = clientes.filter((e) =>
    e.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero ── */}
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
            <Text style={styles.heroTitle}>{activeTab === 'entrenadores' ? 'Entrenadores' : 'Clientes'}</Text>
            <Text style={styles.heroSubtitle}>
              {entrenadores.length} entrenador{entrenadores.length !== 1 ? 'es' : ''} · {clientes.length} cliente{clientes.length !== 1 ? 's' : ''}
            </Text>
          </View>

          <View style={styles.brushEdgeContainer} pointerEvents="none">
            <Image
              source={require('@/assets/images/splash.png')}
              style={styles.brushEdgeImage}
              resizeMode="cover"
              tintColor={BrandColors.white}
            />
          </View>
        </View>

        {/* ── Content ── */}
        <View style={styles.contentSection}>
          {/* Search */}
          <View style={styles.searchContainer}>
            <MaterialCommunityIcons name="magnify" size={20} color={BrandColors.mediumGray} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={activeTab === 'entrenadores' ? "Buscar entrenador..." : "Buscar cliente..."}
              placeholderTextColor={BrandColors.mediumGray}
              value={busqueda}
              onChangeText={setBusqueda}
              accessibilityLabel="Buscar"
            />
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'entrenadores' && styles.tabActive]}
              activeOpacity={0.8}
              onPress={() => setActiveTab('entrenadores')}
            >
              <MaterialCommunityIcons
                name="dumbbell"
                size={20}
                color={activeTab === 'entrenadores' ? BrandColors.black : BrandColors.mediumGray}
              />
              <Text style={activeTab === 'entrenadores' ? styles.tabTextActive : styles.tabText}>
                Entrenadores
              </Text>
              <View style={activeTab === 'entrenadores' ? styles.badgeActive : styles.badge}>
                <Text style={activeTab === 'entrenadores' ? styles.badgeTextActive : styles.badgeText}>
                  {entrenadores.length}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'clientes' && styles.tabActive]}
              activeOpacity={0.8}
              onPress={() => setActiveTab('clientes')}
            >
              <MaterialCommunityIcons
                name="account-group-outline"
                size={22}
                color={activeTab === 'clientes' ? BrandColors.black : BrandColors.mediumGray}
              />
              <Text style={activeTab === 'clientes' ? styles.tabTextActive : styles.tabText}>
                Clientes
              </Text>
              <View style={activeTab === 'clientes' ? styles.badgeActive : styles.badge}>
                <Text style={activeTab === 'clientes' ? styles.badgeTextActive : styles.badgeText}>
                  {clientes.length}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>
            {activeTab === 'entrenadores' ? 'LISTA DE ENTRENADORES' : 'LISTA DE CLIENTES'}
          </Text>

          {/* ── Entrenadores tab ── */}
          {activeTab === 'entrenadores' ? (
            cargandoEntrenadores ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={BrandColors.purple} />
              </View>
            ) : filtradosEntrenadores.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="account-off-outline" size={52} color={BrandColors.lightGray} />
                <Text style={styles.emptyTitle}>Sin entrenadores</Text>
                <Text style={styles.emptySubtitle}>
                  Aún no hay entrenadores registrados en el sistema.
                </Text>
              </View>
            ) : (
              filtradosEntrenadores.map((e) => (
                <TouchableOpacity
                  key={e.id}
                  style={styles.card}
                  activeOpacity={0.8}
                  onPress={() => setSelectedEntrenador(e)}
                >
                  <View style={[styles.cardAvatar, { backgroundColor: getAvatarColor(e.id) }]}>
                    <Text style={det.avatarText}>{getInitials(e.nombre)}</Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardName}>{e.nombre}</Text>
                    <View style={styles.cardMeta}>
                      <View style={[styles.estadoBadge, { backgroundColor: getEstadoBg(e.estado) }]}>
                        <Text style={[styles.estadoText, { color: getEstadoColor(e.estado) }]}>
                          {e.estado.charAt(0).toUpperCase() + e.estado.slice(1)}
                        </Text>
                      </View>
                      {e.especialidad ? (
                        <Text style={styles.cardSpec}>{e.especialidad}</Text>
                      ) : null}
                    </View>
                  </View>
                  <View style={styles.cardRight}>
                    <MaterialCommunityIcons name="account-multiple-outline" size={18} color={BrandColors.mediumGray} />
                    <Text style={styles.cardClientes}>{e.clientesCount}</Text>
                    <MaterialCommunityIcons name="chevron-right" size={20} color={BrandColors.lightGray} />
                  </View>
                </TouchableOpacity>
              ))
            )
          ) : (
            /* ── Clientes tab ── */
            cargandoClientes ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={BrandColors.purple} />
              </View>
            ) : filtradosClientes.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="account-off-outline" size={52} color={BrandColors.lightGray} />
                <Text style={styles.emptyTitle}>Sin clientes</Text>
                <Text style={styles.emptySubtitle}>
                  Aún no hay clientes registrados en el sistema.
                </Text>
              </View>
            ) : (
              filtradosClientes.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={styles.card}
                  activeOpacity={0.8}
                  onPress={() => setSelectedCliente(c)}
                >
                  <View style={[styles.cardAvatar, { backgroundColor: getAvatarColor(c.id) }]}>
                    <MaterialCommunityIcons name="account-outline" size={28} color={BrandColors.purple} />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardName}>{c.nombre}</Text>
                    <View style={styles.cardMeta}>
                      <View style={[styles.estadoBadge, { backgroundColor: getEstadoBg(c.estado) }]}>
                        <Text style={[styles.estadoText, { color: getEstadoColor(c.estado) }]}>
                          {c.estado.charAt(0).toUpperCase() + c.estado.slice(1)}
                        </Text>
                      </View>
                      <View style={[styles.estadoBadge, { backgroundColor: '#F5F5F7' }]}>
                        <Text style={[styles.estadoText, { color: BrandColors.mediumGray }]}>
                          {c.plan}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.cardRight}>
                    <MaterialCommunityIcons name="chevron-right" size={20} color={BrandColors.lightGray} />
                  </View>
                </TouchableOpacity>
              ))
            )
          )}
        </View>
      </ScrollView>

      <SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} onNavigate={handleNavigate} />

      {/* Entrenador Detail modal */}
      <EntrenadorModal
        entrenador={selectedEntrenador}
        onClose={() => {
          setSelectedEntrenador(null);
          cargarEntrenadores();
        }}
      />

      {/* Cliente Detail modal */}
      <ClienteModal
        cliente={selectedCliente}
        onClose={() => {
          setSelectedCliente(null);
          cargarClientes();
        }}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root:          { flex: 1, backgroundColor: BrandColors.white },
  scroll:        { flex: 1 },
  scrollContent: { flexGrow: 1 },

  heroSection: {
    width: '100%', height: 260, position: 'relative',
    backgroundColor: BrandColors.purpleDark, overflow: 'hidden',
  },
  heroBg:      { width: '100%', height: '100%', position: 'absolute', opacity: 0.7 },
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
  logo:               { width: 140, height: 90, marginRight: -10 },
  heroTitleContainer: { position: 'absolute', bottom: 64, left: 24, zIndex: 15 },
  heroTitle:          { fontSize: 30, fontWeight: '800', color: BrandColors.white, letterSpacing: 0.5 },
  heroSubtitle:       { fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.75)', marginTop: 2 },

  brushEdgeContainer: { position: 'absolute', bottom: -20, left: 0, right: 0, height: 80, zIndex: 10 },
  brushEdgeImage:     { width: '100%', height: '100%' },

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

  tabsContainer: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  tabButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: BrandColors.offWhite, borderRadius: 20, paddingVertical: 12, gap: 8,
  },
  tabActive: {
    backgroundColor: BrandColors.white,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    borderWidth: 1, borderColor: BrandColors.white,
  },
  tabText:         { fontSize: 15, fontWeight: '600', color: BrandColors.mediumGray },
  tabTextActive:   { fontSize: 15, fontWeight: '700', color: BrandColors.black },
  badge:           { backgroundColor: BrandColors.lightGray, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  badgeActive:     { backgroundColor: '#F3E8FF', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  badgeText:       { fontSize: 12, fontWeight: '700', color: BrandColors.mediumGray },
  badgeTextActive: { fontSize: 12, fontWeight: '700', color: BrandColors.purple },

  sectionTitle: { fontSize: 12, fontWeight: '800', color: BrandColors.mediumGray, letterSpacing: 1, marginBottom: 14 },

  loadingContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, paddingHorizontal: 24 },
  emptyTitle:     { fontSize: 16, fontWeight: '700', color: BrandColors.darkGray, marginTop: 14, marginBottom: 6, textAlign: 'center' },
  emptySubtitle:  { fontSize: 13, color: BrandColors.mediumGray, textAlign: 'center', lineHeight: 19 },

  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: BrandColors.white,
    borderRadius: 16, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
    borderWidth: 1, borderColor: BrandColors.lightGray,
  },
  cardAvatar: {
    width: 52, height: 52, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  cardInfo:    { flex: 1 },
  cardName:    { fontSize: 15, fontWeight: '700', color: BrandColors.black, marginBottom: 6 },
  cardMeta:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  estadoBadge: { paddingHorizontal: 10, paddingVertical: 2, borderRadius: 20 },
  estadoText:  { fontSize: 12, fontWeight: '700' },
  cardSpec:    { fontSize: 12, color: BrandColors.mediumGray, fontWeight: '500' },
  cardRight:   { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardClientes:{ fontSize: 14, fontWeight: '600', color: BrandColors.mediumGray },
});

// ─── Detail Modal Styles ──────────────────────────────────────────────────────

const det = StyleSheet.create({
  backdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: BrandColors.white, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 22, paddingTop: 24, paddingBottom: 36,
    shadowColor: '#000', shadowOffset: { width: 0, height: -6 }, shadowOpacity: 0.12, shadowRadius: 20, elevation: 20,
  },
  closeBtn: {
    position: 'absolute', top: 20, right: 22,
    backgroundColor: BrandColors.offWhite, borderRadius: 20, padding: 6,
  },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, paddingRight: 36 },
  avatar: {
    width: 64, height: 64, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  avatarText: { fontSize: 22, fontWeight: '800', color: BrandColors.purple },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 20, fontWeight: '800', color: BrandColors.black, marginBottom: 4 },
  headerRow:  { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  headerSpec: { fontSize: 14, color: BrandColors.mediumGray, fontWeight: '500' },

  estadoBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  estadoText:  { fontSize: 12, fontWeight: '700' },

  // Contact
  contactRow: { flexDirection: 'row', gap: 20, marginBottom: 18, flexWrap: 'wrap' },
  contactItem:{ flexDirection: 'row', alignItems: 'center', gap: 6 },
  contactText:{ fontSize: 13, color: BrandColors.mediumGray },
  contactTextBasic:{ fontSize: 14, color: BrandColors.mediumGray },

  divider: { height: 1, backgroundColor: BrandColors.lightGray, marginBottom: 16 },

  // Actions
  actionRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: BrandColors.white, borderRadius: 16, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: BrandColors.lightGray,
  },
  actionRowDanger: {
    backgroundColor: '#FFF5F5', borderColor: '#FFD5D5',
  },
  actionIcon: {
    width: 44, height: 44, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  actionInfo:         { flex: 1 },
  actionTitle:        { fontSize: 15, fontWeight: '700', color: BrandColors.black, marginBottom: 2 },
  actionTitleDanger:  { color: '#E74C3C' },
  actionSubtitle:     { fontSize: 12, color: BrandColors.mediumGray },
  actionSubtitleModalTop: { fontSize: 12, fontWeight: '800', color: BrandColors.mediumGray, letterSpacing: 0.5, marginBottom: 4 },

  // Box containers for Clients
  boxContainer: {
    backgroundColor: BrandColors.white, borderRadius: 16, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: BrandColors.lightGray,
  },
  boxTitle: { fontSize: 12, fontWeight: '800', color: BrandColors.mediumGray, letterSpacing: 0.5 },
});
