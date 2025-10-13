import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Keyboard,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Context & components
import AddListModal from '../components/AddListModal';
import Button from '../components/Button';
import Chip from '../components/Chip';
import { BackIcon, CategoryIcon } from '../components/Icons';
import AddItemCard from '../components/list/AddItemCard';
import HeaderActions from '../components/list/HeaderActions';
import ItemRow from '../components/list/ItemRow';
import Screen from '../components/Screen';
import SwipeNavigator from '../components/SwipeNavigator';
import TabBar from '../components/TabBar';
import { DataContext } from '../contexts/DataContext';
import { useAppTheme } from '../hooks/useAppTheme';
import { aggregatePriceHistory, filterByRange } from '../utils/prices';

// --- Fallback globals (in case __w / __fs not injected) ---
const { width: __DEVICE_WIDTH } = Dimensions.get('window');

// @ts-ignore
const __w = typeof globalThis !== 'undefined' && globalThis.__w ? globalThis.__w : __DEVICE_WIDTH;

// @ts-ignore
const __fs = typeof globalThis !== 'undefined' && globalThis.__fs ? globalThis.__fs : 1;

// Main screen component
function ListDetailScreen(props) {
  const insets = useSafeAreaInsets();
  const { palette } = useAppTheme();
  const styles = useMemo(() => makeDetailStyles(palette), [palette]);
  const router = useRouter();
  const params = useLocalSearchParams?.() || {};
  // Aceita 'id' (padrão) ou legado 'listId'
  const fallbackId = props?.route?.params?.id || props?.route?.params?.listId;
  const listId = params.id || params.listId || fallbackId;
  const { shoppingLists, updateLists, currentUser, families, loading, users } =
    useContext(DataContext);

  const list = shoppingLists.find((l) => l.id === listId);
  const family = families.find((f) => f.id === currentUser?.familyId);
  // family.members pode ser array de IDs; resolvemos para objetos de usuário
  const familyMembers = useMemo(() => {
    const memberIds = Array.isArray(family?.members) ? family.members : [];
    return memberIds.map((id) => (users || []).find((u) => u.id === id)).filter(Boolean);
  }, [family?.members, users]);

  // Header edit state
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [editedName, setEditedName] = useState(list?.name || '');
  const [editedDesc, setEditedDesc] = useState(list?.desc || list?.description || '');

  // Add item form state
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('1');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('all');

  // Filters
  const [query, setQuery] = useState('');
  const [showOnlyPending, setShowOnlyPending] = useState(false);
  const [showOnlyCompleted, setShowOnlyCompleted] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Price edit
  const [editingPriceId, setEditingPriceId] = useState(null);
  const [editingPriceText, setEditingPriceText] = useState('');

  // Price history selection & range filtering
  const [selectedPriceItem, setSelectedPriceItem] = useState('');
  const [historyRange] = useState('all'); // all | 7d | 30d | 6m
  // compareRange removed

  const [modalVisible, setModalVisible] = useState(false);
  const [recentlyDeleted, setRecentlyDeleted] = useState(null); // {item,listId,timeoutId}
  const undoTimer = useRef(null);

  const progress = useRef(0); // placeholder if SwipeNavigator expects ref
  const [tabHeight, setTabHeight] = useState(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Raise bottom overlays when keyboard is visible (Android/iOS)
  useEffect(() => {
    const onShow = (e) => setKeyboardHeight(e?.endCoordinates?.height || 0);
    const onHide = () => setKeyboardHeight(0);
    const s = Keyboard.addListener('keyboardDidShow', onShow);
    const h = Keyboard.addListener('keyboardDidHide', onHide);
    return () => {
      s.remove();
      h.remove();
    };
  }, []);

  const canEdit = true; // adjust auth logic if needed

  const items = useMemo(() => {
    if (!list) return [];
    return (list.items || [])
      .filter((it) => {
        if (query && !it.name.toLowerCase().includes(query.toLowerCase())) return false;
        if (showOnlyPending && it.isPurchased) return false;
        if (showOnlyCompleted && !it.isPurchased) return false;
        if (categoryFilter !== 'all' && it.category !== categoryFilter) return false;
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [list, query, showOnlyPending, showOnlyCompleted, categoryFilter]);

  const { total, purchasedCount, totalCount } = useMemo(() => {
    const arr = list?.items || [];
    let _total = 0;
    let _purchased = 0;
    for (const it of arr) {
      const price = Number(it.price) || 0;
      const qty = parseInt(it.quantity) || 1;
      if (it.isPurchased) _purchased += 1;
      _total += price * qty;
    }
    return { total: _total, purchasedCount: _purchased, totalCount: arr.length };
  }, [list?.items]);

  // Available item names (lowercase unique) based on current list and its snapshots
  const availablePriceItems = useMemo(() => {
    const set = new Set();
    const collect = (arr = []) => {
      arr.forEach((it) => {
        const n = String(it.name || '')
          .trim()
          .toLowerCase();
        if (n) set.add(n);
        if (Array.isArray(it.priceHistory))
          it.priceHistory.forEach(() => {
            if (n) set.add(n);
          });
      });
    };
    collect(list?.items || []);
    return Array.from(set).filter(Boolean).sort();
  }, [list?.items]);

  const effectiveSelectedItem = selectedPriceItem || availablePriceItems[0] || '';

  // Aggregate price history with snapshots (unit & total daily averages) + range filter
  const basePriceRows = useMemo(() => {
    if (!effectiveSelectedItem) return [];
    return aggregatePriceHistory(list?.items || [], effectiveSelectedItem);
  }, [list?.items, effectiveSelectedItem]);

  const priceData = useMemo(
    () => filterByRange(basePriceRows, historyRange),
    [basePriceRows, historyRange],
  );
  // compareData removed (unused after removing compareSummary)

  // compareSummary removed (unused)

  const priceTrend = useMemo(() => {
    if (priceData.length < 2) return null;
    const last = priceData[priceData.length - 1].value;
    const prev = priceData[priceData.length - 2].value;
    if (prev === 0) return null;
    const diff = last - prev;
    const pct = (diff / prev) * 100;
    return { diff, pct, up: diff > 0 };
  }, [priceData]);

  // Actions
  const handleShare = useCallback(() => {
    Share.share({ message: `Lista: ${list?.name} (Total R$ ${total.toFixed(2)})` });
  }, [list?.name, total]);
  const beginEditHeader = useCallback(() => setIsEditingHeader(true), []);
  const saveEditHeader = useCallback(() => {
    setIsEditingHeader(false);
    if (!list) return;
    const updatedLists = shoppingLists.map((l) =>
      l.id === list.id ? { ...l, name: editedName || l.name, desc: editedDesc } : l,
    );
    updateLists(updatedLists);
  }, [list, shoppingLists, editedName, editedDesc, updateLists]);
  const markAllPurchased = useCallback(() => {
    if (!list) return;
    const now = new Date().toISOString();
    const updatedLists = shoppingLists.map((l) =>
      l.id === list.id
        ? {
            ...l,
            items: (l.items || []).map((it) => ({ ...it, isPurchased: true, purchasedAt: now })),
          }
        : l,
    );
    updateLists(updatedLists);
  }, [list, shoppingLists, updateLists]);
  const clearCompleted = useCallback(() => {
    if (!list) return;
    const updatedLists = shoppingLists.map((l) =>
      l.id === list.id ? { ...l, items: (l.items || []).filter((it) => !it.isPurchased) } : l,
    );
    updateLists(updatedLists);
  }, [list, shoppingLists, updateLists]);
  // UPDATED: snapshot initial price if provided
  const handleAddItem = useCallback(() => {
    if (!list || !newItemName.trim()) return;
    const priceNum = Number(newItemPrice) || 0;
    const now = new Date().toISOString();
    const newIt = {
      id: `item_${Date.now()}`,
      name: newItemName.trim(),
      quantity: newItemQty || '1',
      price: priceNum,
      category: newItemCategory === 'all' ? 'outros' : newItemCategory,
      isPurchased: false,
      createdAt: now,
      priceHistory:
        priceNum > 0
          ? [
              {
                id: `ph_${Date.now()}`,
                ts: now,
                price: priceNum,
                quantity: parseInt(newItemQty) || 1,
              },
            ]
          : [],
    };
    const updatedLists = shoppingLists.map((l) =>
      l.id === list.id ? { ...l, items: [...(l.items || []), newIt] } : l,
    );
    updateLists(updatedLists);
    setNewItemName('');
    setNewItemQty('1');
    setNewItemPrice('');
  }, [list, newItemName, newItemPrice, newItemQty, newItemCategory, shoppingLists, updateLists]);
  const startEditPrice = useCallback((id, price) => {
    setEditingPriceId(id);
    setEditingPriceText(price ? String(price) : '');
  }, []);
  // UPDATED: add snapshot when price changes
  const saveEditPrice = useCallback(
    (id) => {
      if (!list) return;
      const newPrice = Number(editingPriceText) || 0;
      const now = new Date().toISOString();
      const updatedLists = shoppingLists.map((l) =>
        l.id === list.id
          ? {
              ...l,
              items: (l.items || []).map((it) => {
                if (it.id !== id) return it;
                const current = Number(it.price) || 0;
                if (current !== newPrice && newPrice > 0) {
                  const historyArr = Array.isArray(it.priceHistory) ? it.priceHistory : [];
                  return {
                    ...it,
                    price: newPrice,
                    priceHistory: [
                      ...historyArr,
                      {
                        id: `ph_${Date.now()}`,
                        ts: now,
                        price: newPrice,
                        quantity: parseInt(it.quantity) || 1,
                      },
                    ],
                  };
                }
                return { ...it, price: newPrice };
              }),
            }
          : l,
      );
      updateLists(updatedLists);
      setEditingPriceId(null);
      setEditingPriceText('');
    },
    [list, editingPriceText, shoppingLists, updateLists],
  );
  const incQty = useCallback(
    (id) => {
      if (!list) return;
      updateLists(
        shoppingLists.map((l) =>
          l.id === list.id
            ? {
                ...l,
                items: (l.items || []).map((it) =>
                  it.id === id ? { ...it, quantity: String((parseInt(it.quantity) || 1) + 1) } : it,
                ),
              }
            : l,
        ),
      );
    },
    [list, shoppingLists, updateLists],
  );

  const decQty = useCallback(
    (id) => {
      if (!list) return;
      updateLists(
        shoppingLists.map((l) =>
          l.id === list.id
            ? {
                ...l,
                items: (l.items || []).map((it) =>
                  it.id === id
                    ? { ...it, quantity: String(Math.max(1, (parseInt(it.quantity) || 1) - 1)) }
                    : it,
                ),
              }
            : l,
        ),
      );
    },
    [list, shoppingLists, updateLists],
  );

  const handleTogglePurchased = useCallback(
    (id) => {
      if (!list) return;
      const now = new Date().toISOString();
      updateLists(
        shoppingLists.map((l) =>
          l.id === list.id
            ? {
                ...l,
                items: (l.items || []).map((it) =>
                  it.id === id
                    ? {
                        ...it,
                        isPurchased: !it.isPurchased,
                        purchasedAt: !it.isPurchased ? now : it.purchasedAt,
                      }
                    : it,
                ),
              }
            : l,
        ),
      );
    },
    [list, shoppingLists, updateLists],
  );

  const handleDeleteItem = useCallback(
    (id) => {
      if (!list) return;
      const target = (list.items || []).find((it) => it.id === id);
      if (!target) return;
      const updated = shoppingLists.map((l) =>
        l.id === list.id ? { ...l, items: (l.items || []).filter((it) => it.id !== id) } : l,
      );
      updateLists(updated);
      if (undoTimer.current) clearTimeout(undoTimer.current);
      const timeoutId = setTimeout(() => {
        setRecentlyDeleted(null);
        undoTimer.current = null;
      }, 6000);
      undoTimer.current = timeoutId;
      setRecentlyDeleted({ item: target, listId: list.id, timeoutId });
    },
    [list, shoppingLists, updateLists],
  );

  const undoDelete = () => {
    if (!recentlyDeleted) return;
    const { item, listId, timeoutId } = recentlyDeleted;
    if (timeoutId) clearTimeout(timeoutId);
    updateLists(
      shoppingLists.map((l) =>
        l.id === listId
          ? { ...l, items: [...(l.items || []), item].sort((a, b) => a.name.localeCompare(b.name)) }
          : l,
      ),
    );
    setRecentlyDeleted(null);
  };
  const handleMemberToggle = (memberId) => {
    if (!list) return;
    const isOn = list.members.includes(memberId);
    const updated = shoppingLists.map((l) =>
      l.id === list.id
        ? {
            ...l,
            members: isOn ? l.members.filter((i) => i !== memberId) : [...l.members, memberId],
          }
        : l,
    );
    updateLists(updated);
  };
  const handleArchiveList = () => {
    if (!list) return;
    const now = new Date().toISOString();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateLists(
      shoppingLists.map((l) =>
        l.id === list.id
          ? {
              ...l,
              items: (l.items || []).map((it) => ({
                ...it,
                isPurchased: true,
                purchasedAt: it.purchasedAt || now,
              })),
            }
          : l,
      ),
    );
    // Navega imediatamente para a tela de listas
    router.replace('/lists');
  };
  const deleteList = () => {
    if (!list) return;
    Alert.alert('Excluir', 'Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          updateLists(shoppingLists.filter((l) => l.id !== list.id));
          router.push('/lists');
        },
      },
    ]);
  };
  const handleNavigate = (tab) => {
    if (tab === 'LISTS') router.push('/lists');
    if (tab === 'PROFILE') router.push('/profile');
    if (tab === 'DASHBOARD') router.push('/dashboard');
  };

  // Conteúdo quando lista não encontrada ou ainda carregando
  const renderEmptyOrLoading = () => (
    <View style={[styles.centered, { paddingTop: 12, backgroundColor: palette.bg }]}>
      {loading ? (
        <>
          <ActivityIndicator size="large" color={palette.primary} />
          <Text style={[styles.emptyText, { color: palette.mutedText, marginTop: 12 }]}>
            Carregando dados...
          </Text>
        </>
      ) : (
        <>
          <Text style={[styles.emptyText, { color: palette.mutedText }]}>
            Lista não encontrada.
          </Text>
          <Text
            style={[styles.emptyText, { color: palette.mutedText, marginTop: 8, fontSize: 12 }]}
          >
            Debug id: {String(listId || '—')}
          </Text>
          <Text
            style={[styles.emptyText, { color: palette.mutedText, marginTop: 4, fontSize: 12 }]}
          >
            Listas: {shoppingLists.length}
          </Text>
        </>
      )}
    </View>
  );

  // Espaçamento extra superior (colunas removidas: sempre vertical)
  const contentExtraTop = __w < 420 ? 12 : __w < 760 ? 24 : 40;

  // Savings indicator including explicit snapshots; diff = ultimo snapshot - preço atual (positivo => economia)
  const itemSavingsMap = useMemo(() => {
    const map = {};
    (list?.items || []).forEach((it) => {
      // normalize name (unused key removed to silence lint)
      const snapshots = [];
      // snapshots only from this list's item history
      if (Array.isArray(it.priceHistory))
        it.priceHistory.forEach((ph) => snapshots.push({ ts: ph.ts, price: Number(ph.price) }));
      snapshots.sort((a, b) => new Date(a.ts) - new Date(b.ts));
      const last = snapshots[snapshots.length - 1];
      const current = Number(it.price) || 0;
      if (last && current > 0) {
        const diff = last.price - current;
        if (Math.abs(diff) > 0.009) {
          const pct = last.price !== 0 ? (diff / last.price) * 100 : 0;
          map[it.id] = { diff, last: last.price, pct };
        }
      }
    });
    return map;
  }, [list?.items]);

  return (
    <Screen scroll={false} tabBarHeight={tabHeight || 56} contentStyle={{ paddingHorizontal: 0 }}>
      <View style={styles.tabHolder} onLayout={(e) => setTabHeight(e.nativeEvent.layout.height)}>
        <TabBar
          active={'LISTS'}
          onNavigate={handleNavigate}
          onAddList={() => setModalVisible(true)}
        />
      </View>
      {/* Top-left Back Button (fixed below TabBar) */}
      <View
        pointerEvents="box-none"
        style={{ position: 'absolute', left: 0, right: 0, top: 0, zIndex: 65 }}
      >
        <TouchableOpacity
          accessibilityLabel="Voltar"
          accessibilityRole="button"
          onPress={() => {
            if (typeof router?.canGoBack === 'function' && router.canGoBack()) router.back();
            else router.push('/lists');
          }}
          activeOpacity={0.8}
          style={[
            styles.backButton,
            {
              top: (tabHeight || 56) + 8,
              left: Math.max(12, (insets?.left || 0) + 12),
            },
          ]}
        >
          <BackIcon />
        </TouchableOpacity>
      </View>
      <SwipeNavigator
        onSwipeLeft={() => handleNavigate('PROFILE')}
        onSwipeRight={() => handleNavigate('LISTS')}
        progress={progress}
        allowSwipeLeft={false}
        allowSwipeRight
      >
        {!list ? (
          renderEmptyOrLoading()
        ) : (
          <FlatList
            style={[styles.container, { backgroundColor: palette.bg }]}
            contentContainerStyle={[
              styles.scrollContent,
              {
                // Screen already adds top padding for tabBarHeight + insets.
                // Keep only extra top spacing for header area here.
                paddingTop: contentExtraTop,
                // Add bottom padding so focused rows/inputs stay above the keyboard
                paddingBottom: Math.max(
                  32,
                  (insets?.bottom || 0) + (keyboardHeight ? keyboardHeight + 24 : 32),
                ),
              },
            ]}
            data={items}
            keyExtractor={(item) => item.id}
            numColumns={1}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            automaticallyAdjustKeyboardInsets
            ListHeaderComponent={
              <>
                <View style={[styles.card, { backgroundColor: palette.card }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <CategoryIcon type={list.category || 'outros'} size={44} neutral />
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      {isEditingHeader ? (
                        <>
                          <TextInput
                            value={editedName}
                            onChangeText={setEditedName}
                            style={[
                              styles.headerInput,
                              styles.headerNameInput,
                              {
                                backgroundColor: palette.card,
                                borderColor: palette.border,
                                color: palette.text,
                              },
                            ]}
                            placeholder="Nome da lista"
                            placeholderTextColor={palette.mutedText}
                            selectionColor={palette.primary}
                          />
                          <TextInput
                            value={editedDesc}
                            onChangeText={setEditedDesc}
                            style={[
                              styles.headerInput,
                              styles.headerDescInput,
                              {
                                backgroundColor: palette.card,
                                borderColor: palette.border,
                                color: palette.text,
                              },
                            ]}
                            placeholder="Descrição (opcional)"
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                            placeholderTextColor={palette.mutedText}
                            selectionColor={palette.primary}
                          />
                        </>
                      ) : (
                        <>
                          <Text style={[styles.cardTitle, { color: palette.text }]}>
                            {list.name}
                          </Text>
                          {!!(list.desc || list.description) && (
                            <Text style={{ color: palette.mutedText }}>
                              {list.desc || list.description}
                            </Text>
                          )}
                        </>
                      )}
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ color: palette.text, fontWeight: 'bold' }}>
                        R$ {total.toFixed(2)}
                      </Text>
                      <Text style={{ color: palette.mutedText, fontSize: 12 }}>
                        {purchasedCount}/{totalCount} comprados
                      </Text>
                    </View>
                  </View>
                  <View style={styles.progressBarWrap}>
                    <View style={[styles.progressBarBg, { backgroundColor: palette.border }]}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            width: `${totalCount ? (purchasedCount / totalCount) * 100 : 0}%`,
                            backgroundColor: palette.primary,
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.progressText, { color: palette.mutedText }]}>
                      Progresso
                    </Text>
                  </View>
                  <HeaderActions
                    styles={styles}
                    isEditing={isEditingHeader}
                    onShare={handleShare}
                    onSave={saveEditHeader}
                    onEdit={beginEditHeader}
                    onMarkAll={markAllPurchased}
                    onClearCompleted={clearCompleted}
                  />
                </View>
                {canEdit && (
                  <AddItemCard
                    styles={styles}
                    newItemName={newItemName}
                    setNewItemName={setNewItemName}
                    newItemQty={newItemQty}
                    setNewItemQty={setNewItemQty}
                    newItemPrice={newItemPrice}
                    setNewItemPrice={setNewItemPrice}
                    newItemCategory={newItemCategory}
                    setNewItemCategory={setNewItemCategory}
                    itemCategories={itemCategories}
                    onAdd={handleAddItem}
                  />
                )}
                <View style={[styles.card, { backgroundColor: palette.card, paddingBottom: 8 }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          flex: 1,
                          marginRight: 8,
                          backgroundColor: palette.card,
                          borderColor: palette.border,
                          color: palette.text,
                        },
                      ]}
                      placeholder="Buscar item..."
                      value={query}
                      onChangeText={setQuery}
                      placeholderTextColor={palette.mutedText}
                      selectionColor={palette.primary}
                    />
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <Chip
                        label="Todos"
                        active={!showOnlyPending && !showOnlyCompleted}
                        onPress={() => {
                          setShowOnlyPending(false);
                          setShowOnlyCompleted(false);
                        }}
                      />
                      <Chip
                        label="Pendentes"
                        active={showOnlyPending}
                        onPress={() => {
                          setShowOnlyPending(true);
                          setShowOnlyCompleted(false);
                        }}
                      />
                      <Chip
                        label="Concluídos"
                        active={showOnlyCompleted}
                        onPress={() => {
                          setShowOnlyPending(false);
                          setShowOnlyCompleted(true);
                        }}
                      />
                    </View>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingVertical: 8 }}
                  >
                    <Chip
                      label="Todas"
                      emoji="📋"
                      active={categoryFilter === 'all'}
                      onPress={() => setCategoryFilter('all')}
                    />
                    {Object.entries(itemCategories).map(([key, cfg]) => (
                      <Chip
                        key={key}
                        label={cfg.name}
                        emoji={cfg.emoji}
                        active={categoryFilter === key}
                        onPress={() => setCategoryFilter(key)}
                      />
                    ))}
                  </ScrollView>
                </View>
                <Text style={[styles.sectionTitle, { color: palette.text }]}>Itens da Lista</Text>
              </>
            }
            renderItem={({ item }) => (
              <ItemRow
                item={item}
                styles={styles}
                canEdit={canEdit}
                onEditPrice={startEditPrice}
                onDelete={handleDeleteItem}
                onToggle={handleTogglePurchased}
                editingPriceId={editingPriceId}
                editingPriceText={editingPriceText}
                setEditingPriceText={setEditingPriceText}
                saveEditPrice={saveEditPrice}
                incQty={incQty}
                decQty={decQty}
                categoryName={itemCategories[item.category]?.name || 'Outros'}
                savingInfo={itemSavingsMap[item.id]}
              />
            )}
            ListFooterComponent={
              <>
                <View style={[styles.card, { backgroundColor: palette.card }]}>
                  <Text style={[styles.cardTitle, { color: palette.text }]}>
                    Histórico de Preços
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      gap: 8,
                      marginBottom: 8,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: palette.text, fontWeight: '600' }}>
                      {
                        {
                          all: 'Tudo',
                          '7d': 'Últimos 7 dias',
                          '30d': 'Últimos 30 dias',
                          '6m': 'Últimos 6 meses',
                        }[historyRange]
                      }
                    </Text>
                  </View>
                  {!!priceTrend && (
                    <Text
                      style={{
                        color: priceTrend.up ? palette.danger : palette.success,
                        fontWeight: '600',
                        marginBottom: 6,
                      }}
                    >
                      {priceTrend.up ? '▲' : '▼'} {Math.abs(priceTrend.diff).toFixed(2)} (
                      {priceTrend.pct.toFixed(1)}%) vs ponto anterior
                    </Text>
                  )}
                  {availablePriceItems.length > 0 ? (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ paddingVertical: 4 }}
                    >
                      {availablePriceItems.map((name) => (
                        <Chip
                          key={name}
                          label={name}
                          active={effectiveSelectedItem === name}
                          onPress={() => setSelectedPriceItem(name)}
                        />
                      ))}
                    </ScrollView>
                  ) : (
                    <Text style={[styles.emptyText, { color: palette.mutedText }]}>
                      Nenhum item com preço registrado.
                    </Text>
                  )}
                  {priceData.length > 0 ? (
                    <>
                      <LineChart
                        data={priceData}
                        isAnimated
                        curved={priceData.length > 1}
                        areaChart
                        startFillColor="rgba(59,130,246,0.25)"
                        endFillColor="rgba(59,130,246,0.05)"
                        startOpacity={0.9}
                        endOpacity={0.05}
                        hideDataPoints={false}
                        dataPointsColor={palette.primary}
                        yAxisTextStyle={{ color: palette.text, fontSize: 10 * __fs }}
                        xAxisLabelTextStyle={{
                          color: palette.mutedText,
                          fontSize: 10 * __fs,
                          transform: [{ translateY: 4 }],
                        }}
                        noOfSections={4}
                        spacing={Math.max(
                          42,
                          (MAX_CARD_WIDTH - 80) / Math.max(6, priceData.length + 1),
                        )}
                        initialSpacing={24}
                        focusEnabled
                        showStripOnFocus={priceData.length > 1}
                        pointerConfig={{
                          pointerStripUptoDataPoint: true,
                          pointerStripColor: 'rgba(59,130,246,0.35)',
                          pointerStripWidth: 2,
                          pointerColor: palette.primary,
                          radius: 5,
                          pointerLabelWidth: 150,
                          pointerLabelHeight: 88,
                          activatePointersOnLongPress: true,
                          pointerLabelComponent: (items) => {
                            const it = items?.[0];
                            if (!it) return null;
                            return (
                              <View
                                style={{
                                  backgroundColor: palette.tooltipBg,
                                  paddingVertical: 6,
                                  paddingHorizontal: 10,
                                  borderRadius: 10,
                                }}
                              >
                                <Text style={{ color: '#93C5FD', fontSize: 11, fontWeight: '600' }}>
                                  {it.label}
                                </Text>
                                <Text
                                  style={{
                                    color: palette.text,
                                    fontSize: 13,
                                    fontWeight: '700',
                                    marginTop: 2,
                                  }}
                                >
                                  Unit: R$ {Number(it.unitAvg ?? it.value).toFixed(2)}
                                </Text>
                                <Text
                                  style={{
                                    color: '#FCD34D',
                                    fontSize: 12,
                                    fontWeight: '600',
                                    marginTop: 2,
                                  }}
                                >
                                  Total: R$ {Number(it.totalAvg ?? 0).toFixed(2)}
                                </Text>
                              </View>
                            );
                          },
                        }}
                      />
                      {priceData.length === 1 && (
                        <Text
                          style={[styles.emptyText, { color: palette.mutedText, marginTop: 8 }]}
                        >
                          Adicione outra alteração de preço para ver tendência.
                        </Text>
                      )}
                    </>
                  ) : (
                    <Text style={[styles.emptyText, { color: palette.mutedText }]}>
                      Nenhum registro de preço ainda.
                    </Text>
                  )}
                  {priceData.length > 0 && (
                    <View style={{ marginTop: 10 }}>
                      {priceData.map((p, idx) => (
                        <View key={idx} style={{ paddingVertical: 6 }}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{ color: palette.mutedText }}>
                              {new Date(p.date).toLocaleDateString()}
                            </Text>
                            <Text style={{ color: palette.primary, fontWeight: '700' }}>
                              Unit R$ {p.unitAvg.toFixed(2)}
                            </Text>
                          </View>
                          <Text
                            style={{
                              color: palette.warning,
                              fontSize: 12,
                              fontWeight: '600',
                              textAlign: 'right',
                            }}
                          >
                            Total médio R$ {p.totalAvg.toFixed(2)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
                <View style={[styles.card, { backgroundColor: palette.card }]}>
                  <Text style={[styles.cardTitle, { color: palette.text }]}>Membros na Lista</Text>
                  <View style={styles.membersRow}>
                    {familyMembers.length === 0 && (
                      <Text style={[styles.emptyText, { color: palette.mutedText }]}>
                        Nenhum membro encontrado.
                      </Text>
                    )}
                    {familyMembers.map((member) => {
                      const initial = (member?.displayName || member?.email || '?')
                        .slice(0, 1)
                        .toUpperCase();
                      const inList =
                        Array.isArray(list.members) && list.members.includes(member.id);
                      return (
                        <View key={member.id} style={styles.memberAvatarBox}>
                          <View style={[styles.memberAvatar, { backgroundColor: palette.primary }]}>
                            <Text style={styles.memberAvatarText}>{initial}</Text>
                          </View>
                          <Text style={[styles.memberName, { color: palette.text }]}>
                            {member.displayName || member.email}
                          </Text>
                          <Button
                            title={inList ? 'Remover' : 'Adicionar'}
                            variant="light"
                            onPress={() => handleMemberToggle(member.id)}
                            style={{
                              paddingVertical: 6,
                              paddingHorizontal: 10,
                              borderRadius: 10,
                              minHeight: 32,
                              alignSelf: 'center',
                              backgroundColor: 'transparent',
                              borderWidth: 1,
                              borderColor: inList ? palette.danger : palette.success,
                            }}
                            textStyle={{
                              fontSize: 12 * __fs,
                              color: inList ? palette.danger : palette.success,
                              fontWeight: '600',
                            }}
                            testID={`memberToggle-${member.id}`}
                            accessibilityLabel={`${inList ? 'Remover' : 'Adicionar'} membro ${
                              member.displayName || member.email
                            }`}
                          />
                        </View>
                      );
                    })}
                  </View>
                </View>
                <Button variant="dark" title="Concluir Lista" onPress={handleArchiveList} />
                <View style={{ height: 8 }} />
                <Button variant="danger" title="Excluir Lista" onPress={deleteList} />
              </>
            }
            showsVerticalScrollIndicator={false}
            bounces
            overScrollMode="always"
          />
        )}
      </SwipeNavigator>
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
        }}
      />
      {recentlyDeleted && (
        <View
          style={[
            styles.snackbar,
            {
              backgroundColor: palette.snackbarBg,
              bottom: Math.max(
                24,
                (insets?.bottom || 0) + 12,
                // If keyboard is visible, push snackbar above it
                keyboardHeight ? keyboardHeight + 12 : 0,
              ),
            },
          ]}
          pointerEvents="box-none"
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Text style={styles.snackbarText}>Item removido</Text>
            <Button
              variant="light"
              title="DESFAZER"
              onPress={undoDelete}
              style={{
                backgroundColor: 'transparent',
                borderWidth: 0,
                paddingVertical: 6,
                paddingHorizontal: 8,
                minHeight: 0,
              }}
              textStyle={{ color: palette.primary, fontSize: 14 * __fs, fontWeight: '700' }}
              testID="snackbarUndo"
              accessibilityLabel="Desfazer remoção"
            />
          </View>
          <Button
            variant="light"
            title="×"
            onPress={() => setRecentlyDeleted(null)}
            style={{
              backgroundColor: 'transparent',
              borderWidth: 0,
              paddingLeft: 12,
              paddingVertical: 6,
              minHeight: 0,
            }}
            textStyle={{ color: '#fff', fontSize: 16 * __fs, fontWeight: '700' }}
            testID="snackbarClose"
            accessibilityLabel="Fechar alerta"
          />
        </View>
      )}
    </Screen>
  );
}
export default ListDetailScreen;

const MAX_CARD_WIDTH = Math.min(900, __w * 0.98);
// eslint: removed unused __compact/CONTENT_EXTRA_TOP

// Item categories (emoji + names) inspired by the Tailwind reference
const itemCategories = {
  frutas: { name: 'Frutas', emoji: '🍎' },
  vegetais: { name: 'Vegetais', emoji: '🥕' },
  carnes: { name: 'Carnes', emoji: '🥩' },
  laticinios: { name: 'Laticínios', emoji: '🥛' },
  paes: { name: 'Pães', emoji: '🍞' },
  bebidas: { name: 'Bebidas', emoji: '🥤' },
  limpeza: { name: 'Limpeza', emoji: '🧽' },
  higiene: { name: 'Higiene', emoji: '🧴' },
  outros: { name: 'Outros', emoji: '📦' },
};

const makeDetailStyles = (palette) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: palette.bg },
    tabHolder: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 60 },
    backButton: {
      position: 'absolute',
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.card,
      borderWidth: 1,
      borderColor: palette.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
      elevation: 2,
    },
    container: { flex: 1, backgroundColor: palette.bg },
    // Usa constante de espaçamento configurável
    scrollContent: { alignItems: 'center', paddingBottom: 32, paddingHorizontal: 8 },
    card: {
      backgroundColor: palette.card,
      borderRadius: 20,
      padding: 16,
      marginBottom: 18,
      width: '96%',
      maxWidth: MAX_CARD_WIDTH,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 6,
    },
    cardTitle: {
      fontSize: 20 * __fs,
      fontWeight: 'bold',
      color: palette.text,
      marginBottom: 10,
    },
    headerInput: {
      backgroundColor: palette.card,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      color: palette.text,
      borderWidth: 1,
      borderColor: palette.border,
    },
    headerNameInput: { fontSize: 18 * __fs, fontWeight: '700' },
    headerDescInput: { marginTop: 8, minHeight: 72 },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      gap: 10,
    },
    input: {
      backgroundColor: palette.card,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: palette.border,
      fontSize: 15 * __fs,
      color: palette.text,
    },
    addButton: {
      backgroundColor: palette.primary,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
      alignSelf: 'flex-start',
      minHeight: 44,
      paddingHorizontal: 14,
    },
    addButtonText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    sectionTitle: {
      width: '96%',
      maxWidth: MAX_CARD_WIDTH,
      fontSize: 18 * __fs,
      fontWeight: 'bold',
      color: palette.text,
      marginBottom: 10,
    },
    progressBarWrap: {
      marginTop: 12,
    },
    progressBarBg: {
      width: '100%',
      height: 10,
      backgroundColor: palette.border,
      borderRadius: 999,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: palette.primary,
    },
    progressText: {
      color: palette.mutedText,
      marginTop: 6,
    },
    actionsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 12,
    },
    actionChip: {
      borderWidth: 1,
      borderColor: palette.border,
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 12,
      backgroundColor: palette.card,
      minHeight: 44,
      alignSelf: 'flex-start',
    },
    actionChipText: {
      color: palette.text,
      fontWeight: '600',
    },
    itemCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: palette.card,
      borderRadius: 16,
      padding: 14,
      width: '96%',
      maxWidth: MAX_CARD_WIDTH,
      marginBottom: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
    },
    swipeActionLeft: {
      width: 88,
      marginVertical: 5,
      marginLeft: 8,
      borderRadius: 16,
      backgroundColor: palette.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    swipeActionRight: {
      width: 88,
      marginVertical: 5,
      marginRight: 8,
      borderRadius: 16,
      backgroundColor: palette.danger,
      alignItems: 'center',
      justifyContent: 'center',
    },
    swipeActionText: { color: '#fff', fontWeight: '700', fontSize: 13 },
    checkWrap: {
      marginRight: 10,
    },
    checkCircle: {
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 2,
      borderColor: palette.border,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.card,
    },
    checkCircleOn: {
      backgroundColor: palette.success,
      borderColor: palette.success,
    },
    itemCardPurchased: {
      opacity: 0.6,
    },
    itemName: {
      fontSize: 16 * __fs,
      fontWeight: 'bold',
      color: palette.text,
    },
    itemNamePurchased: {
      textDecorationLine: 'line-through',
      color: palette.mutedText,
    },
    itemSubText: {
      color: palette.mutedText,
      marginTop: 2,
      fontSize: 14 * __fs,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 6,
    },
    qtyBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: palette.altSurface,
      borderRadius: 10,
      overflow: 'hidden',
    },
    qtyBtn: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      minWidth: 36,
      minHeight: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
    qtyBtnText: {
      fontSize: 18 * __fs,
      color: palette.text,
    },
    qtyValue: {
      minWidth: 26,
      textAlign: 'center',
      fontWeight: '700',
      color: palette.text,
    },
    pricePill: {
      backgroundColor: palette.altSurface,
      borderRadius: 999,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: palette.border,
    },
    itemTotal: {
      marginLeft: 8,
      backgroundColor: palette.altSurface,
      borderColor: palette.success,
      borderWidth: 1,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 999,
    },
    itemTotalText: { color: palette.success, fontWeight: '700' },
    savingBadge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8, marginLeft: 4 },
    savingPos: {
      backgroundColor: palette.altSurface,
      borderWidth: 1,
      borderColor: palette.success,
    },
    savingNeg: { backgroundColor: palette.altSurface, borderWidth: 1, borderColor: palette.danger },
    savingBadgeText: { fontSize: 11 * __fs, fontWeight: '700', color: palette.text },
    priceText: {
      color: palette.primary,
      fontWeight: '700',
    },
    priceEditRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    pricePrefix: { color: palette.mutedText, marginRight: 4 },
    priceInput: {
      minWidth: 72,
      paddingVertical: 0,
      paddingHorizontal: 0,
      color: palette.text,
      fontSize: 15 * __fs,
    },
    priceSave: { color: palette.success, fontWeight: '700', marginLeft: 6 },
    membersRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    memberAvatarBox: {
      alignItems: 'center',
      width: 96,
    },
    memberAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 6,
    },
    memberAvatarText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    memberName: {
      fontSize: 12 * __fs,
      color: palette.text,
      marginBottom: 6,
    },
    memberButton: {
      borderRadius: 10,
      paddingVertical: 6,
      paddingHorizontal: 10,
    },
    memberButtonAdd: {
      backgroundColor: 'transparent',
    },
    memberButtonRemove: {
      backgroundColor: 'transparent',
    },
    memberButtonText: {
      fontSize: 12 * __fs,
      color: palette.text,
    },
    archiveButton: {
      backgroundColor: '#111827',
      borderRadius: 14,
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: 'center',
      alignSelf: 'flex-start',
      minHeight: 46,
      marginBottom: 24,
    },
    archiveButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 15 * __fs,
    },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.bg,
    },
    emptyText: {
      color: palette.mutedText,
      fontSize: 14 * __fs,
    },
    statsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    statBox: {
      backgroundColor: palette.altSurface,
      borderRadius: 12,
      paddingVertical: 10,
      paddingHorizontal: 12,
      minWidth: 90,
    },
    statLabel: { color: palette.mutedText },
    statValue: { color: palette.text, fontWeight: '700', marginTop: 2 },
    // chip styles now centralized via Chip component
    snackbar: {
      position: 'absolute',
      left: 16,
      right: 16,
      bottom: 24,
      backgroundColor: palette.snackbarBg,
      paddingVertical: 12,
      paddingHorizontal: 18,
      borderRadius: 14,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 6,
    },
    snackbarText: { color: '#fff', fontSize: 14 * __fs, fontWeight: '500' },
    snackbarUndo: { color: palette.primary, fontSize: 14 * __fs, fontWeight: '700' },
  });

// CategoryChip was replaced by the centralized Chip component
