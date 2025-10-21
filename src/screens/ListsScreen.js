import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { Dimensions, FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Chip from '../components/Chip';
import { ListCheckIcon } from '../components/Icons';
import ScreensDefault, { TabBarVisibilityContext } from '../components/ScreensDefault';
import { DataContext } from '../contexts/DataContext';

export default function ListsScreen() {
  const router = useRouter();
  const { shoppingLists, updateLists, currentUser } = useContext(DataContext);
  const { reportScrollY } = useContext(TabBarVisibilityContext);
  const insets = useSafeAreaInsets();

  const [statusFilter, setStatusFilter] = useState('active'); // 'active' | 'done' | 'all'
  const { width } = Dimensions.get('window');
  const numColumns = width >= 1100 ? 3 : width >= 720 ? 2 : 1;

  const styles = useMemo(() => makeStyles(), []);
  const listContentStyle = useMemo(() => {
    const base = [styles.listContent, numColumns > 1 && styles.listGrid];
    const bottomPad = Math.max(80, (insets?.bottom || 0) + 56 + 24); // TabBar(56) + extra
    return [...base, { paddingBottom: bottomPad }];
  }, [styles, numColumns, insets]);

  const formatDate = useCallback((iso) => {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString();
    } catch (_e) {
      return String(iso).slice(0, 10);
    }
  }, []);

  const getCounts = useCallback((list) => {
    const items = Array.isArray(list?.items) ? list.items : [];
    let total = items.length;
    let completed = 0;
    for (const it of items) if (it.isPurchased || it.done || it.completed || it.checked) completed += 1;
    return { total, completed };
  }, []);

  const getPriority = useCallback(
    (list) => {
      const { total, completed } = getCounts(list);
      const pending = Math.max(0, total - completed);
      if (pending >= 10) return 'high';
      if (pending === 0 && total > 0) return 'low';
      return 'medium';
    },
    [getCounts],
  );

  const sortedLists = useMemo(() => {
    const arr = (shoppingLists || []).slice();
    // Partition by completion
    const withCounts = arr.map((l) => {
      const { total, completed } = getCounts(l);
      const pending = Math.max(0, total - completed);
      return { l, total, completed, pending };
    });
    const active = withCounts.filter((x) => !(x.total > 0 && x.completed === x.total));
    const done = withCounts.filter((x) => x.total > 0 && x.completed === x.total);
    // Sort active by pending desc, then createdAt desc
    active.sort((a, b) => (b.pending - a.pending) || (new Date(b.l.createdAt || 0) - new Date(a.l.createdAt || 0)));
    // Sort done by createdAt desc
    done.sort((a, b) => new Date(b.l.createdAt || 0) - new Date(a.l.createdAt || 0));
    const merged = statusFilter === 'active' ? active : statusFilter === 'done' ? done : [...active, ...done];
    return merged.map((x) => x.l);
  }, [shoppingLists, getCounts, statusFilter]);

  // Date helpers (pt-BR short)
  const formatShort = useCallback((iso) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    } catch {
      return String(iso).slice(0, 10);
    }
  }, []);

  const renderCard = useCallback(
    ({ item, index }) => {
      const { total, completed } = getCounts(item);
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
      const isCompleted = total > 0 && completed === total;
      const pending = Math.max(0, total - completed);
      const barColor = isCompleted ? '#16A34A' : pending >= 5 ? '#F59E0B' : '#3B82F6';
      // Last purchase date (max purchasedAt among items) or createdAt as context
      let lastPurchase = null;
      (item.items || []).forEach((it) => {
        if (it.purchasedAt) {
          const t = new Date(it.purchasedAt).getTime();
          if (!Number.isNaN(t)) lastPurchase = Math.max(lastPurchase || 0, t);
        }
      });
      const contextLine = lastPurchase
        ? `Última compra: ${formatShort(new Date(lastPurchase).toISOString())}`
        : `Criada em ${formatShort(item.createdAt)}`;
      const highlight = statusFilter === 'active' && !isCompleted && index === 0; // destaque primeira ativa
      return (
        <TouchableOpacity
          activeOpacity={0.92}
          onPress={() => router.push({ pathname: '/list-detail', params: { id: item.id } })}
          style={[styles.card, numColumns > 1 && styles.cardGrid, highlight && styles.cardHighlight]}
        >
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.name || 'Sem nome'}
            </Text>
          </View>
          <Text style={styles.subline}>
            {isCompleted ? `${completed} itens concluídos` : `${pending} itens pendentes`}
          </Text>
          {!isCompleted && (
            <View style={styles.progressTrack}>
              <View style={[styles.progressBar, { width: `${pct}%`, backgroundColor: barColor }]} />
            </View>
          )}
          <Text style={styles.captionLine}>{contextLine}</Text>
          <View style={styles.bottomRow}>
            <Text
              style={[styles.statusText, isCompleted ? styles.statusDone : styles.statusPending]}
            >
              {isCompleted ? '✓ Concluída' : 'Em andamento'}
            </Text>
            <TouchableOpacity
              onPress={() => router.push({ pathname: '/list-detail', params: { id: item.id } })}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.85}
            >
              <Text style={styles.link}>Ver detalhes →</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      );
    },
    [getCounts, numColumns, router, formatShort, statusFilter],
  );

  return (
    <ScreensDefault
      active="LISTS"
      leftTab="DASHBOARD"
      rightTab="FAMILY"
      scroll={false}
      contentStyle={styles.content}
  primaryActionPlacement="tabbar"
    >
      {/* Gradient background to align with previous screens */}
      <LinearGradient
        colors={['#EFF6FF', '#E0E7FF']}
        style={[StyleSheet.absoluteFillObject, { zIndex: -1 }]}
      />
      <FlatList
        data={sortedLists}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        numColumns={numColumns}
        contentContainerStyle={listContentStyle}
        ListHeaderComponent={
          <View style={styles.headerPanel}>
            <View style={{ alignItems: 'center', marginBottom: 8 }}>
              <View style={styles.badgeWrap}>
                <ListCheckIcon color="#7C3AED" />
              </View>
              <Text style={styles.pageTitle}>Minhas Listas</Text>
              <Text style={styles.pageSubtitle}>Organize suas compras</Text>
            </View>
            {/* Removed inline 'Nova Lista' button in favor of floating FAB */}
            <View style={styles.filtersRow}>
              <Chip label="Ativas" active={statusFilter === 'active'} onPress={() => setStatusFilter('active')} />
              <Chip label="Concluídas" active={statusFilter === 'done'} onPress={() => setStatusFilter('done')} />
              <Chip label="Todas" active={statusFilter === 'all'} onPress={() => setStatusFilter('all')} />
            </View>
          </View>
        }
        onScroll={(e) => reportScrollY?.(e?.nativeEvent?.contentOffset?.y || 0)}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        bounces={Platform.OS === 'ios'}
        overScrollMode={Platform.OS === 'android' ? 'always' : undefined}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ padding: 24, alignItems: 'center' }}>
            <Text style={{ color: '#6B7280' }}>Nenhuma lista ainda. Toque em + para criar.</Text>
          </View>
        }
      />
      {/* Primary action now lives in the TabBar as a centered plus button (global modal) */}
    </ScreensDefault>
  );
}

const makeStyles = () =>
  StyleSheet.create({
    content: { alignItems: 'center', paddingBottom: 16 },
    listContent: { paddingVertical: 8, paddingBottom: 32 },
    listGrid: { paddingHorizontal: 8 },
    headerPanel: {
      backgroundColor: '#fff',
      borderRadius: 20,
      padding: 16,
      marginTop: 4,
      marginBottom: 10,
      width: '96%',
      maxWidth: 1100,
      shadowColor: '#0B0B0B',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
      alignSelf: 'center',
    },
    filtersRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 8 },
    badgeWrap: {
      width: 52,
      height: 52,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F3E8FF',
      borderWidth: 3,
      borderColor: '#F5D0FE',
      marginBottom: 8,
    },
    pageTitle: { fontSize: 24, fontWeight: '800', color: '#1F2937' },
    pageSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 4 },
    card: {
      backgroundColor: '#fff',
      borderRadius: 18,
      paddingHorizontal: 16,
      paddingVertical: 20,
      borderWidth: 1,
      borderColor: '#E5E7EB',
      width: '96%',
      maxWidth: 1100,
      alignSelf: 'center',
      marginVertical: 12,
      minHeight: 160,
      shadowColor: '#0B0B0B',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    cardHighlight: {
      borderColor: '#BFDBFE',
      shadowOpacity: 0.09,
      shadowRadius: 10,
      elevation: 3,
    },
    cardGrid: {
      flex: 1,
      marginHorizontal: 8,
      width: 'auto',
    },
    cardHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827', flex: 1, paddingRight: 8 },
    subline: { color: '#6B7280', fontSize: 12, marginTop: 8 },
    progressTrack: { backgroundColor: '#E5E7EB', height: 8, borderRadius: 4, overflow: 'hidden', marginTop: 8 },
    progressBar: { height: 8, borderRadius: 4 },
    captionLine: { color: '#9CA3AF', fontSize: 11, marginTop: 6 },
    bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
    statusText: { fontSize: 12, fontWeight: '600' },
    statusDone: { color: '#16A34A' },
    statusPending: { color: '#6B7280' },
    link: { color: '#2563EB', fontSize: 12, fontWeight: '700' },
    fab: {
      position: 'absolute',
      right: 20,
      bottom: 24,
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: '#4f46e5',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#0B0B0B',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 7,
    },
    
  });