import React, { useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { BrandColors } from '@/constants/theme';
import SideMenu from '@/components/SideMenu';

// ─── Datos estáticos (todo en 0 hasta conectar backend) ───────────────────────

const META_MENSUAL = 8_000_000;
const INGRESOS_MES = 0;

const PLANES = [
  { nombre: 'Básico',   precio: 20_000, actuales: 0, max: 89, color: '#AAAAAA', bg: '#F5F5F7' },
  { nombre: 'Premium',  precio: 30_000, actuales: 0, max: 89, color: BrandColors.purple, bg: '#EEE8FF' },
  { nombre: 'VIP',      precio: 40_000, actuales: 0, max: 89, color: BrandColors.pink, bg: '#FFE8F0' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPeso(n: number): string {
  return '$' + n.toLocaleString('es-CL');
}

function porcentaje(actual: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(100, Math.round((actual / total) * 100));
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function SectionHeader({
  title,
  onAdd,
  addLabel = 'Agregar',
}: {
  title: string;
  onAdd?: () => void;
  addLabel?: string;
}) {
  return (
    <View style={s.sectionHeader}>
      <Text style={s.sectionTitle}>{title}</Text>
      {onAdd && (
        <TouchableOpacity style={s.addBtn} onPress={onAdd} activeOpacity={0.75}>
          <Text style={s.addBtnText}>{addLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function EmptyCard({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={s.emptyCard}>
      <MaterialCommunityIcons name={icon as any} size={36} color={BrandColors.lightGray} />
      <Text style={s.emptyCardText}>{text}</Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function AdminEstadisticasScreen() {
  const [menuOpen, setMenuOpen] = useState(false);
  const insets  = useSafeAreaInsets();
  const router  = useRouter();
  const topPad  = Platform.OS === 'web' ? 16 : insets.top + 8;

  const handleNavigate = (route: string) => router.push(route as any);

  const pct      = porcentaje(INGRESOS_MES, META_MENSUAL);
  const faltan   = META_MENSUAL - INGRESOS_MES;

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero ── */}
        <View style={s.heroSection}>
          <Image
            source={require('@/assets/images/splash.png')}
            style={s.heroBg}
            resizeMode="cover"
            tintColor={BrandColors.purple}
          />
          <View style={s.heroOverlay} />

          <View style={[s.topBar, { paddingTop: topPad }]}>
            <TouchableOpacity
              style={s.hamburgerPill}
              onPress={() => setMenuOpen(true)}
              activeOpacity={0.8}
              accessibilityLabel="Abrir menú"
            >
              <MaterialCommunityIcons name="menu" size={28} color={BrandColors.black} />
            </TouchableOpacity>
            <Image
              source={require('@/assets/images/logo-full.png')}
              style={s.logo}
              resizeMode="contain"
              tintColor={BrandColors.white}
            />
          </View>

          <View style={s.heroTitleContainer}>
            <Text style={s.heroTitle}>Estadísticas</Text>
            <Text style={s.heroSubtitle}>Resumen del gimnasio</Text>
          </View>

          {/* Botón exportar (placeholder) */}
          <TouchableOpacity
            style={s.exportBtn}
            activeOpacity={0.85}
            accessibilityLabel="Exportar Excel"
          >
            <Text style={s.exportBtnText}>Exportar Excel</Text>
          </TouchableOpacity>

          <View style={s.brushEdgeContainer} pointerEvents="none">
            <Image
              source={require('@/assets/images/splash.png')}
              style={s.brushEdgeImage}
              resizeMode="cover"
              tintColor={BrandColors.white}
            />
          </View>
        </View>

        {/* ── Content ── */}
        <View style={s.contentSection}>

          {/* ── Ingresos del mes ── */}
          <View style={s.card}>
            <View style={s.ingresosHeader}>
              <Text style={s.ingresosLabel}>INGRESOS DEL MES</Text>
            </View>
            <View style={s.ingresosRow}>
              <Text style={s.ingresosValor}>{formatPeso(INGRESOS_MES)}</Text>
              <Text style={s.ingresosMeta}> / {formatPeso(META_MENSUAL)}</Text>
            </View>

            {/* Barra de progreso */}
            <View style={s.progressBg}>
              <View style={[s.progressFill, { width: `${pct}%` }]} />
            </View>
            <View style={s.ingresosFooter}>
              <Text style={s.ingresosPct}>{pct}% de la meta</Text>
              <Text style={s.ingresosResto}>Faltan {formatPeso(faltan)}</Text>
            </View>
          </View>

          {/* ── Rentabilidad por plan ── */}
          <SectionHeader title="Rentabilidad por Plan" />
          <View style={s.card}>
            {PLANES.map((plan, i) => {
              const pctPlan = porcentaje(plan.actuales, plan.max);
              const faltan  = plan.max - plan.actuales;
              return (
                <View key={plan.nombre} style={[s.planRow, i < PLANES.length - 1 && s.planRowBorder]}>
                  <View style={[s.planDot, { backgroundColor: plan.color }]} />
                  <View style={s.planInfo}>
                    <View style={s.planNameRow}>
                      <Text style={s.planNombre}>{plan.nombre}</Text>
                      <Text style={s.planPrecio}>{formatPeso(plan.precio)}/mes</Text>
                    </View>
                    <View style={s.planBarBg}>
                      <View style={[s.planBarFill, { width: `${pctPlan}%`, backgroundColor: plan.color }]} />
                    </View>
                  </View>
                  <View style={s.planCountCol}>
                    <Text style={s.planCount}>
                      {plan.actuales}
                      <Text style={s.planMax}>/{plan.max}</Text>
                    </Text>
                    {faltan > 0 && (
                      <Text style={[s.planFaltan, { color: plan.color }]}>faltan {faltan}</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          {/* ── Distribución de Planes ── */}
          <SectionHeader title="Distribución de Planes" />
          <EmptyCard icon="chart-donut" text="Sin miembros activos aún" />

          {/* ── Alertas y Acciones Pendientes ── */}
          <SectionHeader
            title="Alertas y Acciones Pendientes"
            onAdd={() => {}}
            addLabel="Ver todo"
          />

          {/* Planes vencidos */}
          <View style={[s.alertCard, s.alertCardRed]}>
            <View style={s.alertHeader}>
              <Text style={[s.alertTitle, { color: '#E74C3C' }]}>PLANES VENCIDOS (0)</Text>
            </View>
            <Text style={s.alertEmpty}>Sin planes vencidos</Text>
          </View>

          {/* Vencen pronto */}
          <View style={[s.alertCard, s.alertCardYellow]}>
            <View style={s.alertHeader}>
              <Text style={[s.alertTitle, { color: '#F5A623' }]}>VENCEN EN 7 DÍAS (0)</Text>
            </View>
            <Text style={s.alertEmpty}>Sin vencimientos próximos</Text>
          </View>

          {/* Sin entrenador */}
          <View style={[s.alertCard, s.alertCardGray]}>
            <View style={s.alertHeader}>
              <Text style={[s.alertTitle, { color: BrandColors.mediumGray }]}>SIN ENTRENADOR (0)</Text>
            </View>
            <Text style={s.alertEmpty}>Todos los clientes tienen entrenador</Text>
          </View>

          {/* ── Miembros recientes ── */}
          <SectionHeader
            title="MIEMBROS RECIENTES"
            onAdd={() => {}}
            addLabel="Ver todo"
          />
          <EmptyCard icon="account-plus-outline" text="Agrega miembros para verlos aquí" />

          {/* ── Asistencia semanal ── */}
          <SectionHeader title="ASISTENCIA SEMANAL" />
          <EmptyCard icon="calendar-check-outline" text="Sin registros de asistencia aún" />

        </View>
      </ScrollView>

      <SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} onNavigate={handleNavigate} />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root:          { flex: 1, backgroundColor: BrandColors.white },
  scroll:        { flex: 1 },
  scrollContent: { flexGrow: 1 },

  // ── Hero ──
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

  exportBtn: {
    position: 'absolute', bottom: 64, right: 20,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: BrandColors.white, paddingVertical: 9, paddingHorizontal: 16,
    borderRadius: 24, zIndex: 15, gap: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 6,
  },
  exportBtnText: { color: '#2ECC8A', fontWeight: '700', fontSize: 14 },

  brushEdgeContainer: { position: 'absolute', bottom: -20, left: 0, right: 0, height: 80, zIndex: 10 },
  brushEdgeImage:     { width: '100%', height: '100%' },

  // ── Content ──
  contentSection: {
    flex: 1, backgroundColor: BrandColors.white,
    paddingTop: 24, paddingHorizontal: 18, paddingBottom: 40,
  },

  card: {
    backgroundColor: BrandColors.white, borderRadius: 18, padding: 18, marginBottom: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 3,
    borderWidth: 1, borderColor: BrandColors.lightGray,
  },

  // ── Ingresos ──
  ingresosHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  ingresosLabel:  { fontSize: 11, fontWeight: '800', color: '#2ECC8A', letterSpacing: 1 },
  ingresosRow:    { flexDirection: 'row', alignItems: 'baseline', marginBottom: 12 },
  ingresosValor:  { fontSize: 32, fontWeight: '800', color: '#2ECC8A' },
  ingresosMeta:   { fontSize: 16, fontWeight: '600', color: BrandColors.mediumGray },
  progressBg:     { height: 8, backgroundColor: BrandColors.lightGray, borderRadius: 8, marginBottom: 8 },
  progressFill:   { height: 8, backgroundColor: '#2ECC8A', borderRadius: 8 },
  ingresosFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  ingresosPct:    { fontSize: 12, fontWeight: '600', color: BrandColors.mediumGray },
  ingresosResto:  { fontSize: 12, fontWeight: '600', color: BrandColors.mediumGray },

  // ── Section headers ──
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: BrandColors.darkGray, letterSpacing: 0.5 },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#F3E8FF', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  addBtnText: { fontSize: 12, fontWeight: '700', color: BrandColors.purple },

  // ── Planes ──
  planRow:       { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  planRowBorder: { borderBottomWidth: 1, borderBottomColor: BrandColors.lightGray },
  planDot:       { width: 10, height: 10, borderRadius: 5 },
  planInfo:      { flex: 1 },
  planNameRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  planNombre:    { fontSize: 14, fontWeight: '700', color: BrandColors.black },
  planPrecio:    { fontSize: 12, color: BrandColors.mediumGray, fontWeight: '500' },
  planBarBg:     { height: 6, backgroundColor: BrandColors.lightGray, borderRadius: 6 },
  planBarFill:   { height: 6, borderRadius: 6 },
  planCountCol:  { alignItems: 'flex-end', minWidth: 56 },
  planCount:     { fontSize: 15, fontWeight: '800', color: BrandColors.black },
  planMax:       { fontSize: 13, fontWeight: '500', color: BrandColors.mediumGray },
  planFaltan:    { fontSize: 11, fontWeight: '700', marginTop: 2 },

  // ── Alerts ──
  alertCard: {
    borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1,
  },
  alertCardRed:    { backgroundColor: '#FFF5F5', borderColor: '#FFD5D5' },
  alertCardYellow: { backgroundColor: '#FFFBF0', borderColor: '#FFE8AA' },
  alertCardGray:   { backgroundColor: '#F9F9F9', borderColor: BrandColors.lightGray },
  alertHeader:     { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  alertTitle:      { fontSize: 11, fontWeight: '800', letterSpacing: 0.6 },
  alertEmpty:      { fontSize: 13, color: BrandColors.mediumGray, fontWeight: '500' },

  // ── Empty card ──
  emptyCard: {
    backgroundColor: BrandColors.offWhite, borderRadius: 14, padding: 28,
    alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 18,
    borderWidth: 1, borderColor: BrandColors.lightGray, borderStyle: 'dashed',
  },
  emptyCardText: { fontSize: 13, color: BrandColors.mediumGray, fontWeight: '500', textAlign: 'center' },
});
