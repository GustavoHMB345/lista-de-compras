import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AddListModal from '../components/AddListModal';
import Button from '../components/Button';
import Chip from '../components/Chip';
import { CategoryIcon, PlusIcon } from '../components/Icons';
import Screen from '../components/Screen';
import SwipeNavigator from '../components/SwipeNavigator';
import TabBar from '../components/TabBar';
import { DataContext } from '../contexts/DataContext';

const { width } = Dimensions.get('window');
const __fs = Math.min(1.2, Math.max(0.9, width / 390));
const MAX_CARD_WIDTH = Math.min(820, width * 0.98);
const TAB_BAR_OFFSET = 56; // altura aproximada da TabBar (somente conteúdo; insets aplicados pelo Screen)
const listsStyles = StyleSheet.create({
  bg: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    paddingVertical: 0,
    // Top padding agora é gerenciado pelo Screen via tabBarHeight + insets
  },
  container: {
    width: MAX_CARD_WIDTH,
    maxWidth: '98%',
    paddingVertical: 24,
  },
  headerWrap: { alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 28 * __fs, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  headerSubtitle: { fontSize: 15 * __fs, color: '#6B7280' },
  filtersCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 16,
  },
  formRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  formCol: { flexGrow: 1, flexBasis: 180 },
  label: { fontSize: 12 * __fs, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14 * __fs,
    color: '#111827',
  },
  clearBtn: {
    backgroundColor: '#6B7280',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignSelf: 'flex-end',
    minHeight: 44,
  },
  clearBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 * __fs },
  listsGrid: { marginTop: 8 },
  listCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    margin: 8,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  listTitle: { fontSize: 16 * __fs, fontWeight: '700', color: '#111827', flex: 1, paddingRight: 8 },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: { fontSize: 11 * __fs, fontWeight: '600' },
  dateRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  dateDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#9CA3AF', marginRight: 6 },
  dateText: { color: '#6B7280', fontSize: 12 * __fs },
  progressWrap: { marginBottom: 10 },
  progressMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressMetaLabel: { color: '#6B7280', fontSize: 12 * __fs },
  progressMetaValue: { color: '#2563EB', fontWeight: '600', fontSize: 12 * __fs },
  progressTrack: { backgroundColor: '#E5E7EB', height: 6, borderRadius: 3, overflow: 'hidden' },
  progressBar: { height: 6, borderRadius: 3 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerLeft: { flexDirection: 'row', alignItems: 'center' },
  footerLeftText: { color: '#6B7280', fontSize: 12 * __fs },
  statusText: { fontSize: 12 * __fs, fontWeight: '600' },
  noResultsWrap: { alignItems: 'center', paddingVertical: 32 },
  noResultsEmoji: { fontSize: 48 },
  noResultsTitle: { fontSize: 16 * __fs, fontWeight: '600', color: '#374151', marginTop: 8 },
  noResultsSubtitle: { color: '#6B7280', marginTop: 4, fontSize: 13 * __fs },
  // FAB removido (uso substituído pelo botão central da TabBar)
  chipsRow: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  chipFilterText: { fontSize: 12 * __fs, fontWeight: '600' },
  dateButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    justifyContent: 'center',
    minHeight: 44,
    alignSelf: 'flex-start',
  },
  dateButtonText: { fontSize: 14 * __fs, color: '#111827' },
  listHeaderLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  listHeaderLeftTextWrap: { marginLeft: 10, flex: 1 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
});

// Priority color tokens (inspired by Tailwind classes from the HTML reference)
const PRIORITY_COLORS = {
  high: { bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5', label: 'Alta' },
  medium: { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D', label: 'Média' },
  low: { bg: '#DCFCE7', text: '#166534', border: '#86EFAC', label: 'Baixa' },
};

function ListsScreen() {
  const { shoppingLists, currentUser, updateLists } = useContext(DataContext);
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();
  const progress = useState(new Animated.Value(0))[0];
  const insets = useSafeAreaInsets();
  const [kbVisible, setKbVisible] = useState(false);

  // Keyboard visibility to avoid overlaying FAB over inputs
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKbVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKbVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Filtra listas do usuário logado
  const userLists = shoppingLists.filter(
    (l) => !currentUser || l.familyId === currentUser.familyId,
  );

  // Filtros
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState(''); // AAAA-MM-DD
  const [statusFilter, setStatusFilter] = useState('all'); // all | active | completed
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateObj, setDateObj] = useState(null);

  // Load saved filters on mount
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('@lists_filters');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (typeof parsed.search === 'string') setSearch(parsed.search);
          if (typeof parsed.dateFilter === 'string') setDateFilter(parsed.dateFilter);
          if (parsed.dateFilter) setDateObj(new Date(parsed.dateFilter));
          if (['all', 'active', 'completed'].includes(parsed.statusFilter))
            setStatusFilter(parsed.statusFilter);
        }
      } catch {}
    })();
  }, []);

  // Persist filters on change
  useEffect(() => {
    const payload = { search, dateFilter, statusFilter };
    AsyncStorage.setItem('@lists_filters', JSON.stringify(payload)).catch(() => {});
  }, [search, dateFilter, statusFilter]);

  const clearFilters = () => {
    setSearch('');
    setDateFilter('');
    setStatusFilter('all');
    setDateObj(null);
  };

  const filteredLists = useMemo(() => {
    const s = search.trim().toLowerCase();
    const CATEGORY_ORDER = [
      'alimentos',
      'frutas',
      'vegetais',
      'carnes',
      'laticinios',
      'paes',
      'bebidas',
      'limpeza',
      'higiene',
      'moveis',
      'tecnologia',
      'vestuario',
      'outros',
    ];
    const orderMap = CATEGORY_ORDER.reduce((acc, c, i) => {
      acc[c] = i;
      return acc;
    }, {});
    return userLists
      .filter((l) => {
        const items = l.items || [];
        const total = items.length;
        const purchased = items.filter(
          (it) => it.isPurchased || it.done || it.completed || it.checked,
        ).length;
        const isCompleted = total > 0 && purchased === total;
        const matchesSearch =
          !s ||
          (l.name || '').toLowerCase().includes(s) ||
          (l.desc || l.description || '').toLowerCase().includes(s);
        const createdAt = l.createdAt ? String(l.createdAt).slice(0, 10) : '';
        const matchesDate = !dateFilter || createdAt === dateFilter;
        let matchesStatus = true;
        if (statusFilter === 'active') matchesStatus = !isCompleted;
        else if (statusFilter === 'completed') matchesStatus = isCompleted;
        return matchesSearch && matchesDate && matchesStatus;
      })
      .sort((a, b) => {
        const oa = orderMap[a.category] ?? 999;
        const ob = orderMap[b.category] ?? 999;
        if (oa !== ob) return oa - ob;
        // fallback: most recently updated (createdAt desc)
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [userLists, search, dateFilter, statusFilter]);

  // Helpers
  const formatDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const getCounts = React.useCallback((list) => {
    const total = (list.items || []).length;
    const completed = (list.items || []).filter(
      (it) => it.isPurchased || it.done || it.completed || it.checked,
    ).length;
    return { total, completed };
  }, []);

  const getPriority = React.useCallback(
    (list) => {
      const { total } = getCounts(list);
      if (total >= 8) return 'high';
      if (total >= 4) return 'medium';
      return 'low';
    },
    [getCounts],
  );

  // Navegação entre listas
  const handleNavigate = (screen) => {
    switch (screen) {
      case 'DASHBOARD':
        router.push('/dashboard');
        break;
      case 'LISTS':
        router.push('/lists');
        break;
      case 'FAMILY':
        router.push('/family');
        break;
      case 'PROFILE':
        router.push('/profile');
        break;
      default:
        break;
    }
  };

  const renderRightActions = useCallback(
    (list) => (
      <View style={{ flexDirection: 'row', height: '100%' }}>
        <Button
          title="Apagar"
          variant="danger"
          onPress={() => {
            const filtered = shoppingLists.filter((l) => l.id !== list.id);
            updateLists(filtered);
          }}
          style={{
            height: '100%',
            borderTopRightRadius: 14,
            borderBottomRightRadius: 14,
            paddingHorizontal: 16,
          }}
          accessibilityLabel="Apagar lista"
          testID={`listSwipeDelete-${list.id}`}
        />
      </View>
    ),
    [shoppingLists, updateLists],
  );

  const renderLeftActions = useCallback(
    (list) => (
      <View style={{ flexDirection: 'row', height: '100%' }}>
        <Button
          title="Concluir"
          variant="success"
          onPress={() => {
            // Toggle completed by marking all items purchased or clearing purchases
            const items = list.items || [];
            const total = items.length;
            const purchased = items.filter(
              (it) => it.isPurchased || it.done || it.completed || it.checked,
            ).length;
            const willComplete = !(total > 0 && purchased === total);
            const now = new Date().toISOString();
            const updated = shoppingLists.map((l) =>
              l.id === list.id
                ? {
                    ...l,
                    items: (l.items || []).map((it) =>
                      willComplete
                        ? { ...it, isPurchased: true, purchasedAt: it.purchasedAt || now }
                        : { ...it, isPurchased: false },
                    ),
                  }
                : l,
            );
            updateLists(updated);
          }}
          style={{
            height: '100%',
            borderTopLeftRadius: 14,
            borderBottomLeftRadius: 14,
            paddingHorizontal: 16,
          }}
          accessibilityLabel="Concluir lista"
          testID={`listSwipeComplete-${list.id}`}
        />
      </View>
    ),
    [shoppingLists, updateLists],
  );

  // Memoized item renderer component to reduce closures & improve perf.
  const ListCard = useCallback(
    ({ item }) => {
      const { total, completed } = getCounts(item);
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
      const isCompleted = total > 0 && completed === total;
      const priority = getPriority(item);
      const pc = PRIORITY_COLORS[priority] || PRIORITY_COLORS.medium;
      const barColor = isCompleted ? '#22C55E' : '#3B82F6';
      return (
        <Swipeable
          renderRightActions={() => renderRightActions(item)}
          renderLeftActions={() => renderLeftActions(item)}
          friction={2}
          rightThreshold={32}
          leftThreshold={32}
        >
          <TouchableOpacity
            style={listsStyles.listCard}
            onPress={() => router.push({ pathname: '/list-detail', params: { id: item.id } })}
            activeOpacity={0.92}
          >
            <View style={listsStyles.listHeaderRow}>
              <View style={listsStyles.listHeaderLeft}>
                <CategoryIcon type={item.category || 'outros'} size={42} neutral />
                <View style={listsStyles.listHeaderLeftTextWrap}>
                  <Text style={listsStyles.listTitle} numberOfLines={2}>
                    {item.name || 'Sem nome'}
                  </Text>
                </View>
              </View>
              <View style={[listsStyles.chip, { backgroundColor: pc.bg, borderColor: pc.border }]}>
                <Text style={[listsStyles.chipText, { color: pc.text }]}>{pc.label}</Text>
              </View>
            </View>
            <View style={listsStyles.dateRow}>
              <View style={listsStyles.dateDot} />
              <Text style={listsStyles.dateText}>{formatDate(item.createdAt)}</Text>
            </View>
            <View style={listsStyles.progressWrap}>
              <View style={listsStyles.progressMeta}>
                <Text style={listsStyles.progressMetaLabel}>Progresso</Text>
                <Text style={[listsStyles.progressMetaValue, { color: barColor }]}>
                  {completed}/{total} itens
                </Text>
              </View>
              <View style={listsStyles.progressTrack}>
                <View
                  style={[listsStyles.progressBar, { width: `${pct}%`, backgroundColor: barColor }]}
                />
              </View>
            </View>
            <View style={listsStyles.footerRow}>
              <View style={listsStyles.footerLeft}>
                <Text style={listsStyles.footerLeftText}>{total} itens</Text>
              </View>
              <Text
                style={[listsStyles.statusText, { color: isCompleted ? '#16A34A' : '#2563EB' }]}
              >
                {isCompleted ? '✓ Concluída' : 'Em andamento'}
              </Text>
            </View>
          </TouchableOpacity>
        </Swipeable>
      );
    },
    [renderLeftActions, renderRightActions, router, getCounts, getPriority],
  );

  return (
    <Screen tabBarHeight={TAB_BAR_OFFSET} contentStyle={{ paddingHorizontal: 0 }} scroll={false}>
      <SafeAreaView
        edges={['top']}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          backgroundColor: '#f0f5ff',
        }}
        pointerEvents="box-none"
      >
        <TabBar
          active={'LISTS'}
          onNavigate={handleNavigate}
          onAddList={() => setModalVisible(true)}
          tint="light"
        />
      </SafeAreaView>
      <SwipeNavigator
        onSwipeLeft={() => handleNavigate('DASHBOARD')}
        onSwipeRight={() => handleNavigate('FAMILY')}
        progress={progress}
      >
        <LinearGradient colors={['#EFF6FF', '#E0E7FF']} style={listsStyles.bg}>
          <View
            style={[
              listsStyles.container,
              kbVisible && { paddingBottom: Math.max(24, (insets?.bottom || 0) + 260) },
            ]}
          >
            <View style={listsStyles.headerWrap}>
              <Text style={listsStyles.headerTitle}>🛒 Minhas Listas</Text>
              <Text style={listsStyles.headerSubtitle}>
                Organize suas compras de forma inteligente
              </Text>
            </View>

            <View style={listsStyles.filtersCard}>
              <View style={listsStyles.formRow}>
                <View style={[listsStyles.formCol, { flex: 1 }]}>
                  <Text style={listsStyles.label}>🔍 Pesquisar lista</Text>
                  <TextInput
                    style={listsStyles.input}
                    placeholder="Digite o nome da lista..."
                    value={search}
                    onChangeText={setSearch}
                    placeholderTextColor="#9CA3AF"
                    selectionColor="#2563EB"
                  />
                </View>
                <View style={[listsStyles.formCol, { maxWidth: 240 }]}>
                  <Text style={listsStyles.label}>📅 Filtrar por data</Text>
                  {Platform.OS === 'web' ? (
                    <TextInput
                      style={listsStyles.input}
                      placeholder="AAAA-MM-DD"
                      value={dateFilter}
                      onChangeText={setDateFilter}
                      placeholderTextColor="#9CA3AF"
                      selectionColor="#2563EB"
                    />
                  ) : (
                    <Button
                      variant="light"
                      title={dateFilter ? `${dateFilter}` : 'Escolher data'}
                      onPress={() => setShowDatePicker(true)}
                      style={[listsStyles.dateButton, { alignSelf: 'flex-start' }]}
                      textStyle={listsStyles.dateButtonText}
                      testID="datePickerButton"
                      accessibilityLabel="Escolher data"
                    />
                  )}
                </View>
                <View style={[listsStyles.formCol, { maxWidth: 140, alignSelf: 'flex-end' }]}>
                  <Button variant="gray" title="Limpar" onPress={clearFilters} />
                </View>
              </View>
              <View style={listsStyles.chipsRow}>
                {[
                  { key: 'all', label: 'Todas' },
                  { key: 'active', label: 'Ativas' },
                  { key: 'completed', label: 'Concluídas' },
                ].map(({ key, label }) => (
                  <Chip
                    key={key}
                    label={label}
                    active={statusFilter === key}
                    onPress={() => setStatusFilter(key)}
                  />
                ))}
              </View>
              {showDatePicker && Platform.OS !== 'web' && (
                <DateTimePicker
                  value={dateObj || new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                  onChange={(event, selectedDate) => {
                    if (Platform.OS === 'android') setShowDatePicker(false);
                    if (!selectedDate) return;
                    setDateObj(selectedDate);
                    const y = selectedDate.getFullYear();
                    const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
                    const d = String(selectedDate.getDate()).padStart(2, '0');
                    setDateFilter(`${y}-${m}-${d}`);
                  }}
                  maximumDate={new Date()}
                />
              )}
            </View>

            {filteredLists.length === 0 ? (
              <View style={listsStyles.noResultsWrap}>
                <Text style={listsStyles.noResultsEmoji}>🔍</Text>
                <Text style={listsStyles.noResultsTitle}>Nenhuma lista encontrada</Text>
                <Text style={listsStyles.noResultsSubtitle}>
                  Tente ajustar os filtros de pesquisa
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredLists}
                keyExtractor={(item) => item.id}
                numColumns={width >= 720 ? 3 : width >= 520 ? 2 : 1}
                contentContainerStyle={listsStyles.listsGrid}
                renderItem={({ item }) => <ListCard item={item} />}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                automaticallyAdjustKeyboardInsets
              />
            )}
          </View>
        </LinearGradient>
      </SwipeNavigator>

      {/* Floating Action Button: criar nova lista */}
      {!kbVisible && (
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          activeOpacity={0.85}
          style={[listsStyles.fab, { bottom: Math.max(24, (insets?.bottom || 0) + 16) }]}
          accessibilityRole="button"
          accessibilityLabel="Criar nova lista"
          testID="fabAddList"
        >
          <LinearGradient
            colors={['#4F46E5', '#2563EB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            pointerEvents="none"
            style={[StyleSheet.absoluteFillObject, { zIndex: 0 }]}
          />
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFillObject,
              { zIndex: 1, alignItems: 'center', justifyContent: 'center' },
            ]}
          >
            <PlusIcon color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      )}

      {currentUser && (
        <AddListModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onCreate={(newList) => {
            updateLists([
              ...shoppingLists,
              {
                ...newList,
                id: `list_${Date.now()}`,
                familyId: currentUser?.familyId,
                createdAt: new Date().toISOString(),
                status: 'active',
                members: currentUser ? [currentUser.id] : [],
              },
            ]);
            setModalVisible(false);
          }}
        />
      )}
      {/* TabBar movida para o topo */}
    </Screen>
  );
}

export default ListsScreen;
