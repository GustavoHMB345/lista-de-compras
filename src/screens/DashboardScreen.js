import { useRootNavigationState, useRouter } from 'expo-router';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreensDefault from '../components/ScreensDefault';
import { useTheme } from '../components/theme';
import { DataContext } from '../contexts/DataContext';

const { width } = Dimensions.get('window');
const __fs = Math.min(1.2, Math.max(0.9, width / 390));
const MAX_WIDTH = Math.min(820, width * 0.98);

export default function DashboardScreen() {
  const { shoppingLists, currentUser, loading, uiPrefs } = useContext(DataContext);
  const { tokens: t, scheme } = useTheme();
  const router = useRouter();
  const progress = useState(new Animated.Value(0))[0];
  const rootNavigation = useRootNavigationState();
  const [period, setPeriod] = useState('weekly'); // weekly | monthly | yearly
  const [monthRange] = useState(6);
  const [scope, setScope] = useState('user'); // 'user' | 'family'
  const [measuredCardH, setMeasuredCardH] = useState(null);

  useEffect(() => {
    if (!loading && !currentUser && rootNavigation?.key) {
      router.replace('/welcome');
    }
  }, [loading, currentUser, rootNavigation?.key, router]);

  const allItems = useMemo(
    () => (shoppingLists || []).flatMap((l) => l.items || []),
    [shoppingLists],
  );
  // Completed lists: all items purchased
  const completedLists = useMemo(
    () =>
      (shoppingLists || []).filter((l) => {
        const items = l.items || [];
        return (
          items.length > 0 &&
          items.every((it) => it.isPurchased || it.done || it.completed || it.checked)
        );
      }),
    [shoppingLists],
  );

  // Filtra listas conforme escopo
  const scopedCompleted = useMemo(() => {
    if (!currentUser) return [];
    if (scope === 'user') {
      return completedLists.filter((l) =>
        (l.items || []).some((it) => it.isPurchased && it.addedBy === currentUser.id),
      );
    }
    // família
    return completedLists.filter((l) => l.familyId === currentUser.familyId);
  }, [completedLists, scope, currentUser]);

  // Geração de série temporal baseada na experiência real (purchasedAt ou createdAt quando arquivada)
  // Cache simples em memória para séries (evita recomputar em grandes bases)
  const seriesCacheRef = useRef({});

  const lineData = useMemo(() => {
    if (!currentUser) return [];
    // Cria chave de cache baseada em escopo, período e shape básico das listas
    const cacheKey = (() => {
      const ids = scopedCompleted.map((l) => `${l.id}:${(l.items || []).length}`).join('|');
      return `${scope}::${period}::${monthRange}::${currentUser.id}::${ids}`;
    })();

    if (seriesCacheRef.current[cacheKey]) {
      return seriesCacheRef.current[cacheKey];
    }
    const now = new Date();
    const points = [];
    // Agrega por bucket conforme período
    if (period === 'weekly') {
      // Últimas 8 semanas (mais granular que o gráfico de barras anterior)
      const weeks = Array.from({ length: 8 }, (_, i) => ({ i, total: 0 }));
      scopedCompleted.forEach((l) => {
        (l.items || []).forEach((it) => {
          if (!it.isPurchased) return;
          if (scope === 'user' && it.addedBy !== currentUser.id) return;
          const ts = new Date(it.purchasedAt || l.createdAt || it.createdAt || 0);
          const diffDays = Math.floor((now - ts) / (1000 * 60 * 60 * 24));
          const weekIdxFromNow = Math.floor(diffDays / 7); // 0 = esta semana
          const bucket = 7 - weekIdxFromNow; // invert to chronological left->right
          if (bucket >= 0 && bucket < 8) {
            weeks[bucket].total += Number(it.price) || 0;
          }
        });
      });
      weeks.forEach((w, idx) => {
        const label = `S${idx + 1}`;
        points.push({ value: Number(w.total.toFixed(2)), label });
      });
    } else if (period === 'monthly') {
      // Últimos monthRange meses
      const months = Array.from({ length: monthRange }, (_, i) => ({ i, total: 0 }));
      scopedCompleted.forEach((l) => {
        (l.items || []).forEach((it) => {
          if (!it.isPurchased) return;
          if (scope === 'user' && it.addedBy !== currentUser.id) return;
          const ts = new Date(it.purchasedAt || l.createdAt || it.createdAt || 0);
          const diffMonths =
            (now.getFullYear() - ts.getFullYear()) * 12 + (now.getMonth() - ts.getMonth());
          const bucket = monthRange - 1 - diffMonths;
          if (bucket >= 0 && bucket < monthRange) {
            months[bucket].total += Number(it.price) || 0;
          }
        });
      });
      const monthNames = [
        'Jan',
        'Fev',
        'Mar',
        'Abr',
        'Mai',
        'Jun',
        'Jul',
        'Ago',
        'Set',
        'Out',
        'Nov',
        'Dez',
      ];
      months.forEach((m, idx) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (monthRange - 1 - idx));
        points.push({ value: Number(m.total.toFixed(2)), label: monthNames[date.getMonth()] });
      });
    } else {
      // yearly: últimos 3 anos
      const yearsCount = 3;
      const baseYear = now.getFullYear() - (yearsCount - 1);
      const years = Array.from({ length: yearsCount }, (_, i) => ({
        year: baseYear + i,
        total: 0,
      }));
      scopedCompleted.forEach((l) => {
        (l.items || []).forEach((it) => {
          if (!it.isPurchased) return;
          if (scope === 'user' && it.addedBy !== currentUser.id) return;
          const ts = new Date(it.purchasedAt || l.createdAt || it.createdAt || 0);
          const idx = ts.getFullYear() - baseYear;
          if (idx >= 0 && idx < yearsCount) {
            years[idx].total += Number(it.price) || 0;
          }
        });
      });
      years.forEach((y) =>
        points.push({ value: Number(y.total.toFixed(2)), label: String(y.year) }),
      );
    }
    seriesCacheRef.current[cacheKey] = points;
    // Limpa cache muito grande (limite simples de 25 entradas)
    const keys = Object.keys(seriesCacheRef.current);
    if (keys.length > 25) {
      // Remove as mais antigas (heurística simples: primeira metade)
      keys.slice(0, Math.floor(keys.length / 2)).forEach((k) => {
        delete seriesCacheRef.current[k];
      });
    }
    return points;
  }, [scopedCompleted, period, monthRange, scope, currentUser]);

  const hasLineData = lineData.some((p) => p.value > 0);

  const stats = useMemo(() => {
    const priced = allItems.filter((it) => typeof it.price === 'number' && !isNaN(it.price));
    const totalSpent = priced.reduce((s, it) => s + (it.price || 0), 0);
    const avgPrice = priced.length ? totalSpent / priced.length : 0;
    const totalItems = allItems.length;
    const priceVariation = 0;
    return { totalSpent, avgPrice, totalItems, priceVariation };
  }, [allItems]);

  const expensiveItems = useMemo(() => {
    const grouped = new Map();
    allItems.forEach((it) => {
      const key = (it.name || 'Item').toLowerCase();
      const entry = grouped.get(key) || { name: it.name || 'Item', prices: [] };
      if (typeof it.price === 'number') entry.prices.push(it.price);
      grouped.set(key, entry);
    });
    return Array.from(grouped.values())
      .map((e) => ({
        name: e.name,
        avg: e.prices.length ? e.prices.reduce((a, b) => a + b, 0) / e.prices.length : 0,
        min: e.prices.length ? Math.min(...e.prices) : 0,
        max: e.prices.length ? Math.max(...e.prices) : 0,
        count: e.prices.length,
      }))
      .filter((e) => e.count > 0)
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 5);
  }, [allItems]);

  const handleNavigate = (screen) => {
    switch (screen) {
      case 'DASHBOARD':
        router.replace('/dashboard');
        break;
      case 'LISTS':
        router.replace('/lists');
        break;
      case 'FAMILY':
        router.replace('/family');
        break;
      case 'PROFILE':
        router.replace('/profile');
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <View style={[styles.root, { justifyContent: 'center', alignItems: 'center', backgroundColor: t.background }]}>
        <Text style={{ color: t.text, fontSize: 18 }}>Carregando...</Text>
      </View>
    );
  }
  if (!currentUser) {
    return (
      <SafeAreaView style={[styles.root, { justifyContent: 'center', alignItems: 'center', backgroundColor: t.background }]}>
        <Text style={{ color: t.text, fontSize: 16 }}>Carregando...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: t.background }]} edges={['top']}>
      <ScreensDefault
        active="DASHBOARD"
        leftTab="FAMILY"
        rightTab={undefined}
        enableSwipeOverlay={false}
        contentStyle={styles.scroll}
  overlayBottomSpacer={0}
        scrollEndFromCardHeight={
          measuredCardH
            ? { cardHeight: measuredCardH, factor: 0.5, gap: 12, min: 24, max: 52 }
            : { cardHeight: 220, factor: 0.5, gap: 12, min: 24, max: 52 }
        }
      >
          {/* Header + Stats */}
          <View
            style={[styles.card, { width: MAX_WIDTH, backgroundColor: t.card }]}
            onLayout={!measuredCardH ? (e) => setMeasuredCardH(Math.round(e.nativeEvent.layout.height)) : undefined}
          >
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <Text style={styles.emoji}>📊</Text>
              <Text style={[styles.title, { color: t.text }]}>Dashboard</Text>
              <Text style={[styles.subtitle, { color: t.muted }]}>Análise de preços e tendências de mercado</Text>
            </View>
            <View style={styles.statsGrid}>
              <View style={[styles.statBox, { backgroundColor: scheme === 'dark' ? 'rgba(59,130,246,0.12)' : '#EFF6FF' }]}>
                <Text style={[styles.statValue, { color: '#2563EB' }]}>
                  R$ {stats.totalSpent.toFixed(2)}
                </Text>
                <Text style={[styles.statLabel, { color: t.muted }]}>Gasto Total</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: scheme === 'dark' ? 'rgba(16,185,129,0.12)' : '#ECFDF5' }]}>
                <Text style={[styles.statValue, { color: '#16A34A' }]}>
                  R$ {stats.avgPrice.toFixed(2)}
                </Text>
                <Text style={[styles.statLabel, { color: t.muted }]}>Preço Médio</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: scheme === 'dark' ? 'rgba(202,138,4,0.12)' : '#FEFCE8' }]}>
                <Text style={[styles.statValue, { color: '#CA8A04' }]}>{stats.totalItems}</Text>
                <Text style={[styles.statLabel, { color: t.muted }]}>Itens Cadastrados</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: scheme === 'dark' ? 'rgba(124,58,237,0.12)' : '#F5F3FF' }]}>
                <Text style={[styles.statValue, { color: '#7C3AED' }]}>
                  {stats.priceVariation >= 0 ? '+' : ''}
                  {stats.priceVariation.toFixed(0)}%
                </Text>
                <Text style={[styles.statLabel, { color: t.muted }]}>Variação de Preços</Text>
              </View>
            </View>
          </View>

          {/* Chart Card */}
          <View style={[styles.card, { width: MAX_WIDTH, backgroundColor: t.card }]}>
            <Text style={[styles.sectionTitle, { textAlign: 'center' }]}>
              📈 Evolução de Gastos
            </Text>
            <View style={styles.segmentRow}>
              {[
                { key: 'weekly', label: 'SEMANA' },
                { key: 'monthly', label: 'MÊS' },
                { key: 'yearly', label: 'ANO' },
              ].map((p) => {
                const active = period === p.key;
                return (
                  <TouchableOpacity
                    key={p.key}
                    onPress={() => setPeriod(p.key)}
                    activeOpacity={0.9}
                    style={[
                      styles.segmentBtn,
                      { backgroundColor: t.card, borderColor: t.border },
                      active && {
                        backgroundColor: scheme === 'dark' ? 'rgba(59,130,246,0.15)' : '#DBEAFE',
                        borderColor: scheme === 'dark' ? 'rgba(59,130,246,0.35)' : '#93C5FD',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        { color: t.text },
                        active && { color: scheme === 'dark' ? '#93C5FD' : '#1D4ED8' },
                      ]}
                    >
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={[styles.segmentRow, { marginTop: 4 }]}>
              {[
                { key: 'user', label: 'MEU USO' },
                { key: 'family', label: 'FAMÍLIA' },
              ].map((s) => {
                const active = scope === s.key;
                return (
                  <TouchableOpacity
                    key={s.key}
                    onPress={() => setScope(s.key)}
                    activeOpacity={0.9}
                    style={[
                      styles.segmentBtnSmall,
                      { backgroundColor: t.card, borderColor: t.border },
                      active && {
                        backgroundColor: scheme === 'dark' ? 'rgba(30,58,138,0.9)' : '#1E3A8A',
                        borderColor: scheme === 'dark' ? 'rgba(30,58,138,0.9)' : '#1E3A8A',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.segmentTextSmall,
                        { color: t.text },
                        active && { color: '#fff' },
                      ]}
                    >
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={[styles.chartBox, { backgroundColor: t.inputBg }]}>
              {hasLineData ? (
                <LineChart
                  data={lineData}
                  isAnimated
                  curved
                  areaChart
                  startFillColor="rgba(59,130,246,0.25)"
                  endFillColor="rgba(59,130,246,0.05)"
                  startOpacity={0.8}
                  endOpacity={0.05}
                  thickness={3}
                  color="#3B82F6"
                  yAxisLabel="R$ "
                  yAxisColor={t.border}
                  xAxisColor={t.border}
                  hideDataPoints={false}
                  dataPointsColor="#1D4ED8"
                  yAxisTextStyle={{ color: t.muted, fontSize: 10 * __fs }}
                  xAxisLabelTextStyle={{
                    color: t.muted,
                    fontSize: 10 * __fs,
                    transform: [{ translateY: 4 }],
                  }}
                  noOfSections={4}
                  spacing={Math.max(36, (MAX_WIDTH - 40) / Math.max(6, lineData.length + 1))}
                  initialSpacing={18}
                  focusEnabled
                  showStripOnFocus
                  pointerConfig={{
                    pointerStripUptoDataPoint: true,
                    pointerStripColor: 'rgba(59,130,246,0.35)',
                    pointerStripWidth: 2,
                    pointerColor: '#1D4ED8',
                    radius: 5,
                    pointerLabelWidth: 120,
                    pointerLabelHeight: 62,
                    activatePointersOnLongPress: true,
                    shiftPointerLabelX: 0,
                    pointerLabelComponent: (items) => {
                      const it = items?.[0];
                      if (!it) return null;
                      return (
                        <View
                          style={{
                            backgroundColor: t.card,
                            paddingVertical: 6,
                            paddingHorizontal: 10,
                            borderRadius: 10,
                            shadowColor: '#0B0B0B',
                            shadowOpacity: 0.25,
                            shadowOffset: { width: 0, height: 2 },
                          }}
                        >
                          <Text style={{ color: scheme === 'dark' ? '#93C5FD' : '#3B82F6', fontSize: 11, fontWeight: '600' }}>
                            {it.label}
                          </Text>
                          <Text
                            style={{ color: t.text, fontSize: 14, fontWeight: '700', marginTop: 2 }}
                          >
                            R$ {Number(it.value).toFixed(2)}
                          </Text>
                        </View>
                      );
                    },
                  }}
                />
              ) : (
                <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                  <Text style={{ fontSize: 42 }}>🛒</Text>
                  <Text style={{ color: t.muted, marginTop: 8, textAlign: 'center' }}>
                    Registre preços e conclua listas para ver a evolução.
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Expensive items */}
          <View style={[styles.card, { width: MAX_WIDTH, backgroundColor: scheme === 'dark' ? 'rgba(239,68,68,0.08)' : '#FFF1F2' }]}>
            <Text style={[styles.sectionTitle, { color: t.text }]}>🔥 Itens Mais Caros</Text>
            {expensiveItems.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 16 }}>
                <Text style={{ fontSize: 28 }}>💰</Text>
                <Text style={{ color: t.muted, marginTop: 6 }}>Sem dados de preços</Text>
              </View>
            ) : (
              <View style={{ gap: 8 }}>
                {expensiveItems.map((it) => (
                  <View key={it.name} style={[styles.expRow, { backgroundColor: t.card, borderColor: scheme === 'dark' ? 'rgba(239,68,68,0.35)' : '#FEE2E2' }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.expName, { color: t.text }]}>{it.name}</Text>
                      <Text style={[styles.expMeta, { color: t.muted }] }>
                        Faixa: R$ {it.min.toFixed(2)} - R$ {it.max.toFixed(2)}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={[styles.expValue, { color: '#DC2626' }]}>R$ {it.avg.toFixed(2)}</Text>
                      <Text style={[styles.expMeta, { color: t.muted }]}>Preço médio</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
      </ScreensDefault>
    </SafeAreaView>
  );
}

// legacy helpers removed during archived->completed migration

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f0f5ff' },
  scroll: { alignItems: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 16,
  shadowColor: '#0B0B0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginVertical: 10,
  },
  emoji: { fontSize: 48, marginBottom: 8 },
  title: { fontSize: 26 * __fs, fontWeight: 'bold', color: '#1F2937' },
  subtitle: { fontSize: 14 * __fs, color: '#6B7280', marginTop: 2, textAlign: 'center' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 },
  statBox: { flex: 1, minWidth: 150, padding: 14, borderRadius: 14, alignItems: 'center' },
  statValue: { fontSize: 20 * __fs, fontWeight: 'bold' },
  statLabel: { fontSize: 12 * __fs, color: '#4B5563' },
  sectionTitle: { fontSize: 16 * __fs, fontWeight: '600', color: '#111827', marginBottom: 10 },
  segmentRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 10 },
  segmentBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  segmentBtnActive: { backgroundColor: '#DBEAFE', borderColor: '#93C5FD' },
  segmentText: { fontSize: 12 * __fs, color: '#374151', fontWeight: '600' },
  segmentTextActive: { color: '#1D4ED8' },
  segmentBtnSmall: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  segmentBtnSmallActive: { backgroundColor: '#1E3A8A', borderColor: '#1E3A8A' },
  segmentTextSmall: { fontSize: 11 * __fs, color: '#374151', fontWeight: '600' },
  segmentTextSmallActive: { color: '#fff' },
  chartBox: { backgroundColor: '#F9FAFB', borderRadius: 14, padding: 12 },
  chartGrid: {
    position: 'absolute',
    left: 12,
    right: 12,
    top: 12,
    bottom: 36,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
    borderRadius: 10,
  },
  chartBarsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 140,
    paddingHorizontal: 6,
  },
  chartBar: {
    width: Math.max(6, (MAX_WIDTH - 48) / 14),
    backgroundColor: '#3B82F6',
    borderRadius: 6,
    opacity: 0.85,
  },
  chartXAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 6,
  },
  axisLabel: { fontSize: 10 * __fs, color: '#6B7280' },
  expRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  expName: { fontSize: 14 * __fs, fontWeight: '600', color: '#111827' },
  expMeta: { fontSize: 11 * __fs, color: '#6B7280' },
  expValue: { fontSize: 16 * __fs, fontWeight: '700', color: '#DC2626' },
});
