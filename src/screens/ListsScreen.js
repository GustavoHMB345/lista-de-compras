import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { Animated, FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// AddListModal removed from this screen; creation is handled by TabBar primary action
// Button removed along with header CTA
import Chip from '../components/Chip';
import { ListCheckIcon } from '../components/Icons';
import ScreensDefault from '../components/ScreensDefault';
import { DataContext } from '../contexts/DataContext';

export default function ListsScreen() {
  const router = useRouter();
  const { shoppingLists, updateLists } = useContext(DataContext);
  const insets = useSafeAreaInsets();

  const [statusFilter, setStatusFilter] = useState('active'); // 'active' | 'done' | 'all'
  // Modal removed; rely on TabBar centered plus for creation
  // Força organização vertical (uma coluna) em qualquer largura
  const numColumns = 1;

  const styles = useMemo(() => makeStyles(), []);
  const desiredBottomGap = 5; // px; limite de respiro no final do scroll
  const baselineBottom = Math.max(20, (insets?.bottom || 0) + 16);
  // Neutraliza o padding inferior do container da casca, para que o respiro fique dentro do conteúdo da FlatList
  const overlayBottomSpacer = useMemo(
    () => -baselineBottom,
    [baselineBottom],
  );
  // Centralização: single column centraliza cards; grid centraliza a linha e aplica espaçamento consistente
  const columnWrapperStyle = useMemo(
    () => (numColumns > 1 ? { maxWidth: 1200, alignSelf: 'center', columnGap: 12, rowGap: 12 } : undefined),
    [numColumns],
  );
  const listContentStyle = useMemo(() => {
    const base = [
      styles.listContent,
      numColumns > 1 && styles.listGrid,
      numColumns === 1 ? { alignItems: 'center' } : null,
    ].filter(Boolean);
    // Aplique o espaçamento final na própria FlatList para que faça parte do conteúdo rolável
    // Garantir gap visível de 5px entre o último card e o topo da TabBar:
    // paddingBottom = alturaTabBar(56) + safe-area-bottom + desiredGap
    const TAB_HEIGHT = 76;
    const bottomPad = TAB_HEIGHT + (insets?.bottom || 0) + desiredBottomGap;
    return [...base, { paddingBottom: bottomPad }];
  }, [styles, numColumns, insets?.bottom, desiredBottomGap]);

  const inferPriority = useCallback((pending) => {
    if (pending >= 10) return { key: 'high', label: 'Alta', bg: '#FEE2E2', text: '#B91C1C', border: '#FECACA' };
    if (pending >= 5) return { key: 'medium', label: 'Média', bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' };
    return { key: 'low', label: 'Baixa', bg: '#DCFCE7', text: '#166534', border: '#BBF7D0' };
  }, []);

  const formatShort = useCallback((iso) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    } catch {
      return String(iso).slice(0, 10);
    }
  }, []);

  const getCounts = useCallback((list) => {
    const items = list?.items || [];
    const total = items.length;
    const completed = items.filter((it) => it.isPurchased).length;
    return { total, completed };
  }, []);

  const sortedLists = useMemo(() => {
    let arr = shoppingLists || [];
    if (statusFilter === 'active') {
      arr = arr.filter((l) => {
        const { total, completed } = getCounts(l);
        return !(total > 0 && completed === total);
      });
    } else if (statusFilter === 'done') {
      arr = arr.filter((l) => {
        const { total, completed } = getCounts(l);
        return total > 0 && completed === total;
      });
    }
    return arr;
  }, [shoppingLists, statusFilter, getCounts]);

  const renderCard = useCallback(
    ({ item, index }) => {
      const { total, completed } = getCounts(item);
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
      const isCompleted = total > 0 && completed === total;
      const pending = Math.max(0, total - completed);
      const barColor = isCompleted ? '#16A34A' : pending >= 5 ? '#F59E0B' : '#3B82F6';
  const priority = inferPriority(pending);
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
      const highlight = statusFilter === 'active' && !isCompleted && index === 0;

      const renderLeftActions = (progress, dragX) => {
        const scale = dragX.interpolate({ inputRange: [0, 80], outputRange: [0.6, 1], extrapolate: 'clamp' });
        const opacity = progress.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] });
        return (
          <Animated.View style={[styles.swipeActionLeft, { transform: [{ scale }], opacity }]}> 
            <Text style={styles.swipeActionText}>{isCompleted ? 'Reabrir' : 'Concluir'}</Text>
          </Animated.View>
        );
      };
      const renderRightActions = (progress, dragX) => {
        const scale = dragX.interpolate({ inputRange: [-80, 0], outputRange: [1, 0.6], extrapolate: 'clamp' });
        const opacity = progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0.3] });
        return (
          <Animated.View style={[styles.swipeActionRight, { transform: [{ scale }], opacity }]}> 
            <Text style={styles.swipeActionText}>Excluir</Text>
          </Animated.View>
        );
      };

      return (
        <Swipeable
          renderLeftActions={renderLeftActions}
          renderRightActions={renderRightActions}
          leftThreshold={28}
          rightThreshold={28}
          friction={1.2}
          overshootFriction={6}
          onSwipeableOpen={(dir) => {
            if (dir === 'left') {
              const now = new Date().toISOString();
              const targetDone = !isCompleted;
              updateLists(
                shoppingLists.map((l) =>
                  l.id === item.id
                    ? {
                        ...l,
                        items: (l.items || []).map((it) => ({
                          ...it,
                          isPurchased: targetDone ? true : false,
                          purchasedAt: targetDone ? (it.purchasedAt || now) : undefined,
                        })),
                      }
                    : l,
                ),
              );
            }
            if (dir === 'right') {
              updateLists(shoppingLists.filter((l) => l.id !== item.id));
            }
          }}
        >
          <TouchableOpacity
            activeOpacity={0.92}
            onPress={() => router.push({ pathname: '/list-detail', params: { id: item.id } })}
            style={[styles.card, numColumns > 1 && styles.cardGrid, highlight && styles.cardHighlight]}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {item.name || 'Sem nome'}
                </Text>
              </View>
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
              <View style={styles.bottomLeftRow}>
                <Text style={[styles.statusText, isCompleted ? styles.statusDone : styles.statusPending]}>
                  {isCompleted ? '✓ Concluída' : 'Em andamento'}
                </Text>
                <View style={[styles.priorityPill, { backgroundColor: priority.bg, borderColor: priority.border }]}>
                  <Text style={[styles.priorityPillText, { color: priority.text }]}>{priority.label}</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => router.push({ pathname: '/list-detail', params: { id: item.id } })}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.85}
              >
                <Text style={styles.link}>Ver detalhes →</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Swipeable>
      );
    },
    [getCounts, numColumns, router, formatShort, statusFilter, updateLists, shoppingLists],
  );

  return (
    <ScreensDefault
      active="LISTS"
      leftTab="DASHBOARD"
      rightTab="FAMILY"
      scroll={false}
      contentStyle={styles.content}
      overlayBottomSpacer={overlayBottomSpacer}
      primaryActionPlacement="tabbar"
    >
      <LinearGradient colors={["#EFF6FF", "#E0E7FF"]} style={[StyleSheet.absoluteFillObject, { zIndex: -1 }]} />
      <FlatList
        data={sortedLists}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        numColumns={numColumns}
        style={{ flex: 1 }}
        columnWrapperStyle={columnWrapperStyle}
        nestedScrollEnabled
        scrollEnabled
        contentContainerStyle={listContentStyle}
        ListHeaderComponent={
          <View style={styles.headerPanel}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <View style={styles.badgeWrap}>
                  <ListCheckIcon color="#7C3AED" />
                </View>
                <Text style={styles.pageTitle}>Minhas Listas</Text>
                <Text style={styles.pageSubtitle}>Todas as suas listas de compras</Text>
              </View>
            </View>
            <View style={styles.filtersRow}>
              <Chip label="Ativas" active={statusFilter === 'active'} onPress={() => setStatusFilter('active')} />
              <Chip label="Concluídas" active={statusFilter === 'done'} onPress={() => setStatusFilter('done')} />
              <Chip label="Todas" active={statusFilter === 'all'} onPress={() => setStatusFilter('all')} />
            </View>
          </View>
        }
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
  content: {},
    listContent: { paddingVertical: 8 },
    listGrid: { paddingHorizontal: 8 },
    headerPanel: {
      backgroundColor: '#fff',
      borderRadius: 20,
      padding: 16,
      marginTop: 4,
      marginBottom: 10,
      width: '100%',
      maxWidth: 1200,
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
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 20,
      borderWidth: 1,
      borderColor: '#E5E7EB',
      width: '100%',
      maxWidth: 1200,
      alignSelf: 'center',
      marginVertical: 10,
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
    swipeActionLeft: {
      width: 88,
      marginVertical: 10,
      marginLeft: 8,
      borderRadius: 16,
      backgroundColor: '#2563EB',
      alignItems: 'center',
      justifyContent: 'center',
    },
    swipeActionRight: {
      width: 88,
      marginVertical: 10,
      marginRight: 8,
      borderRadius: 16,
      backgroundColor: '#EF4444',
      alignItems: 'center',
      justifyContent: 'center',
    },
    swipeActionText: { color: '#fff', fontWeight: '700', fontSize: 13 },
    cardGrid: {
      flex: 1,
      marginHorizontal: 8,
      width: 'auto',
    },
    cardHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827', flex: 1, paddingRight: 8 },
  priorityPill: { borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  priorityPillText: { fontSize: 11, fontWeight: '700' },
    subline: { color: '#6B7280', fontSize: 12, marginTop: 8 },
    progressTrack: { backgroundColor: '#E5E7EB', height: 8, borderRadius: 4, overflow: 'hidden', marginTop: 8 },
    progressBar: { height: 8, borderRadius: 4 },
    captionLine: { color: '#9CA3AF', fontSize: 11, marginTop: 6 },
    bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  bottomLeftRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
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