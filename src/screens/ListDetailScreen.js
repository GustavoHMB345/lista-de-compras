import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useContext, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Dimensions, FlatList, ScrollView, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { LineChart } from 'react-native-gifted-charts';
import { SafeAreaView } from 'react-native-safe-area-context';

// Context & components
import AddListModal from '../components/AddListModal';
import Button from '../components/Button';
import Chip from '../components/Chip';
import { CategoryIcon, CheckIcon } from '../components/Icons';
import SwipeNavigator from '../components/SwipeNavigator';
import TabBar, { TAB_BAR_OFFSET } from '../components/TabBar';
import { DataContext } from '../contexts/DataContext';

// --- Fallback globals (in case __w / __fs not injected) ---
const { width: __DEVICE_WIDTH } = Dimensions.get('window');
// eslint-disable-next-line no-undef
// @ts-ignore
const __w = (typeof globalThis !== 'undefined' && globalThis.__w) ? globalThis.__w : __DEVICE_WIDTH;
// eslint-disable-next-line no-undef
// @ts-ignore
const __fs = (typeof globalThis !== 'undefined' && globalThis.__fs) ? globalThis.__fs : 1;

// Main screen component
function ListDetailScreen(props) {
  const router = useRouter();
  const params = useLocalSearchParams?.() || {};
  // Aceita 'id' (padrão) ou legado 'listId'
  const fallbackId = props?.route?.params?.id || props?.route?.params?.listId;
  const listId = params.id || params.listId || fallbackId;
  const { shoppingLists, updateLists, currentUser, families, loading, users } = useContext(DataContext);

  const list = shoppingLists.find(l => l.id === listId);
  const family = families.find(f => f.id === currentUser?.familyId);
  // family.members pode ser array de IDs; resolvemos para objetos de usuário
  const familyMembers = useMemo(() => {
    const memberIds = Array.isArray(family?.members) ? family.members : [];
    return memberIds
      .map(id => (users || []).find(u => u.id === id))
      .filter(Boolean);
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
  const [historyRange, setHistoryRange] = useState('all'); // all | 7d | 30d | 6m
  const [compareRange, setCompareRange] = useState(null); // null | '7d' | '30d' | '6m' | 'all'
  const [showComparePicker, setShowComparePicker] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [recentlyDeleted, setRecentlyDeleted] = useState(null); // {item,listId,timeoutId}
  const undoTimer = useRef(null);

  const progress = useRef(0); // placeholder if SwipeNavigator expects ref
  const [tabHeight, setTabHeight] = useState(0);

  const canEdit = true; // adjust auth logic if needed

  const items = useMemo(() => {
    if (!list) return [];
    return (list.items || [])
      .filter(it => {
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
    let _total = 0; let _purchased = 0;
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
    const collect = (arr=[]) => {
      arr.forEach(it => {
        const n = String(it.name||'').trim().toLowerCase();
        if (n) set.add(n);
        if (Array.isArray(it.priceHistory)) it.priceHistory.forEach(()=> { if (n) set.add(n); });
      });
    };
    collect(list?.items || []);
    return Array.from(set).filter(Boolean).sort();
  }, [list?.items]);

  const effectiveSelectedItem = selectedPriceItem || availablePriceItems[0] || '';

  // Aggregate price history with snapshots (unit & total daily averages) + range filter
  const basePriceRows = useMemo(() => {
    if (!effectiveSelectedItem) return [];
    const selected = effectiveSelectedItem;
    const bucket = new Map();
    const addSnapshot = (isoDate, unitPrice, qty) => {
      if (!Number.isFinite(unitPrice) || unitPrice <= 0) return;
      const d = new Date(isoDate);
      if (isNaN(d)) return;
      const key = isoDate.slice(0,10);
      const entry = bucket.get(key) || { unitSum:0, unitCount:0, totalSum:0, totalCount:0, date:d };
      entry.unitSum += unitPrice; entry.unitCount += 1;
      const q = qty || 1; entry.totalSum += unitPrice * q; entry.totalCount += 1;
      bucket.set(key, entry);
    };
    const processItems = (items=[]) => {
      items.forEach(it => {
        const n = String(it.name||'').trim().toLowerCase();
        if (n !== selected) return;
        if (Number(it.price)>0) addSnapshot(it.purchasedAt || it.updatedAt || it.createdAt || new Date().toISOString(), Number(it.price), parseInt(it.quantity)||1);
        if (Array.isArray(it.priceHistory)) it.priceHistory.forEach(ph => addSnapshot(ph.ts, Number(ph.price), ph.quantity));
      });
    };
    processItems(list?.items||[]);
    return Array.from(bucket.entries())
      .sort((a,b)=> new Date(a[0]) - new Date(b[0]))
      .map(([,v]) => {
        const unitAvg = v.unitCount ? v.unitSum / v.unitCount : 0;
        const totalAvg = v.totalCount ? v.totalSum / v.totalCount : 0;
        const d = v.date;
        const label = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
        return { value: Number(unitAvg.toFixed(2)), unitAvg: Number(unitAvg.toFixed(2)), totalAvg: Number(totalAvg.toFixed(2)), label, date: d.toISOString() };
      });
  }, [list?.items, effectiveSelectedItem]);

  const applyRangeFilter = useCallback((rows, range) => {
    if (!rows || range === 'all' || !range) return rows;
    const now = Date.now();
    const ranges = { '7d': 7, '30d': 30, '6m': 30*6 };
    const days = ranges[range];
    if (!days) return rows;
    const cutoff = now - days*24*60*60*1000;
    return rows.filter(r => new Date(r.date).getTime() >= cutoff);
  }, []);

  const priceData = useMemo(() => applyRangeFilter(basePriceRows, historyRange), [basePriceRows, historyRange, applyRangeFilter]);
  const compareData = useMemo(() => compareRange ? applyRangeFilter(basePriceRows, compareRange) : [], [basePriceRows, compareRange, applyRangeFilter]);

  const compareSummary = useMemo(() => {
    if (!compareRange || priceData.length === 0 || compareData.length === 0) return null;
    const currentLast = priceData[priceData.length - 1].unitAvg;
    const compareLast = compareData[compareData.length - 1].unitAvg;
    if (!Number.isFinite(currentLast) || !Number.isFinite(compareLast) || compareLast === 0) return null;
    const diff = currentLast - compareLast;
    const pct = (diff / compareLast) * 100;
    return { diff, pct, up: diff > 0, base: compareLast };
  }, [priceData, compareData, compareRange]);

  const priceTrend = useMemo(() => {
    if (priceData.length < 2) return null;
    const last = priceData[priceData.length - 1].value;
    const prev = priceData[priceData.length - 2].value;
    if (prev === 0) return null;
    const diff = last - prev; const pct = (diff / prev) * 100;
    return { diff, pct, up: diff > 0 };
  }, [priceData]);

  // Actions
  const handleShare = () => {
    Share.share({ message: `Lista: ${list?.name} (Total R$ ${total.toFixed(2)})` });
  };
  const beginEditHeader = () => setIsEditingHeader(true);
  const saveEditHeader = () => {
    setIsEditingHeader(false);
    if (!list) return;
    const updatedLists = shoppingLists.map(l => l.id === list.id ? { ...l, name: editedName || l.name, desc: editedDesc } : l);
    updateLists(updatedLists);
  };
  const markAllPurchased = () => {
    if (!list) return;
    const now = new Date().toISOString();
    const updatedLists = shoppingLists.map(l => l.id === list.id ? { ...l, items: (l.items||[]).map(it => ({ ...it, isPurchased: true, purchasedAt: now })) } : l);
    updateLists(updatedLists);
  };
  const clearCompleted = () => {
    if (!list) return;
    const updatedLists = shoppingLists.map(l => l.id === list.id ? { ...l, items: (l.items||[]).filter(it => !it.isPurchased) } : l);
    updateLists(updatedLists);
  };
  // UPDATED: snapshot initial price if provided
  const handleAddItem = () => {
    if (!list || !newItemName.trim()) return;
    const priceNum = Number(newItemPrice) || 0;
    const now = new Date().toISOString();
    const newIt = { id: `item_${Date.now()}`, name: newItemName.trim(), quantity: newItemQty || '1', price: priceNum, category: newItemCategory === 'all' ? 'outros' : newItemCategory, isPurchased: false, createdAt: now, priceHistory: priceNum > 0 ? [{ id: `ph_${Date.now()}`, ts: now, price: priceNum, quantity: parseInt(newItemQty)||1 }] : [] };
    const updatedLists = shoppingLists.map(l => l.id === list.id ? { ...l, items: [...(l.items||[]), newIt] } : l);
    updateLists(updatedLists);
    setNewItemName(''); setNewItemQty('1'); setNewItemPrice('');
  };
  const startEditPrice = (id, price) => { setEditingPriceId(id); setEditingPriceText(price ? String(price) : ''); };
  // UPDATED: add snapshot when price changes
  const saveEditPrice = (id) => {
    if (!list) return;
    const newPrice = Number(editingPriceText) || 0;
    const now = new Date().toISOString();
    const updatedLists = shoppingLists.map(l => l.id === list.id ? { ...l, items: (l.items||[]).map(it => {
      if (it.id !== id) return it;
      const current = Number(it.price)||0;
      if (current !== newPrice && newPrice > 0) {
        const historyArr = Array.isArray(it.priceHistory) ? it.priceHistory : [];
        return { ...it, price: newPrice, priceHistory: [...historyArr, { id: `ph_${Date.now()}`, ts: now, price: newPrice, quantity: parseInt(it.quantity)||1 }] };
      }
      return { ...it, price: newPrice };
    }) } : l);
    updateLists(updatedLists); setEditingPriceId(null); setEditingPriceText('');
  };
  const incQty = useCallback((id) => {
    if (!list) return;
    updateLists(shoppingLists.map(l => l.id === list.id ? {
      ...l,
      items: (l.items || []).map(it => it.id === id ? { ...it, quantity: String((parseInt(it.quantity) || 1) + 1) } : it)
    } : l));
  }, [list, shoppingLists, updateLists]);

  const decQty = useCallback((id) => {
    if (!list) return;
    updateLists(shoppingLists.map(l => l.id === list.id ? {
      ...l,
      items: (l.items || []).map(it => it.id === id ? { ...it, quantity: String(Math.max(1, (parseInt(it.quantity) || 1) - 1)) } : it)
    } : l));
  }, [list, shoppingLists, updateLists]);

  const handleTogglePurchased = useCallback((id) => {
    if (!list) return;
    const now = new Date().toISOString();
    updateLists(shoppingLists.map(l => l.id === list.id ? {
      ...l,
      items: (l.items || []).map(it => it.id === id ? { ...it, isPurchased: !it.isPurchased, purchasedAt: !it.isPurchased ? now : it.purchasedAt } : it)
    } : l));
  }, [list, shoppingLists, updateLists]);

  const handleDeleteItem = useCallback((id) => {
    if (!list) return;
    const target = (list.items || []).find(it => it.id === id);
    if (!target) return;
    const updated = shoppingLists.map(l => l.id === list.id ? { ...l, items: (l.items || []).filter(it => it.id !== id) } : l);
    updateLists(updated);
    if (undoTimer.current) clearTimeout(undoTimer.current);
    const timeoutId = setTimeout(() => { setRecentlyDeleted(null); undoTimer.current = null; }, 6000);
    undoTimer.current = timeoutId;
    setRecentlyDeleted({ item: target, listId: list.id, timeoutId });
  }, [list, shoppingLists, updateLists]);

  const undoDelete = () => {
    if (!recentlyDeleted) return;
    const { item, listId, timeoutId } = recentlyDeleted;
    if (timeoutId) clearTimeout(timeoutId);
    updateLists(shoppingLists.map(l => l.id === listId ? { ...l, items: [...(l.items||[]), item].sort((a,b)=> a.name.localeCompare(b.name)) } : l));
    setRecentlyDeleted(null);
  };
  const handleMemberToggle = (memberId) => { if(!list) return; const isOn=list.members.includes(memberId); const updated=shoppingLists.map(l=>l.id===list.id?{...l,members:isOn?l.members.filter(i=>i!==memberId):[...l.members,memberId]}:l); updateLists(updated); };
  const handleArchiveList = () => {
    if(!list) return;
    const now = new Date().toISOString();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateLists(shoppingLists.map(l=> l.id===list.id ? {
      ...l,
      items:(l.items||[]).map(it=> ({...it, isPurchased:true, purchasedAt: it.purchasedAt || now}))
    }: l));
    // Navega imediatamente para a tela de listas
    router.replace('/lists');
  };
  const deleteList = () => { if(!list) return; Alert.alert('Excluir','Tem certeza?',[{text:'Cancelar',style:'cancel'},{text:'Excluir',style:'destructive',onPress:()=>{ updateLists(shoppingLists.filter(l=>l.id!==list.id)); router.push('/lists'); }}]); };
  const handleNavigate = (tab) => { if (tab==='LISTS') router.push('/lists'); if (tab==='PROFILE') router.push('/profile'); if (tab==='DASHBOARD') router.push('/dashboard'); };

  // Conteúdo quando lista não encontrada ou ainda carregando
  const renderEmptyOrLoading = () => (
    <View style={[detailStyles.centered, { paddingTop: TAB_BAR_OFFSET + 12 }]}>
      {loading ? (
        <>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={[detailStyles.emptyText, { marginTop: 12 }]}>Carregando dados...</Text>
        </>
      ) : (
        <>
          <Text style={detailStyles.emptyText}>Lista não encontrada.</Text>
          <Text style={[detailStyles.emptyText, { marginTop: 8, fontSize: 12 }]}>Debug id: {String(listId || '—')}</Text>
          <Text style={[detailStyles.emptyText, { marginTop: 4, fontSize: 12 }]}>Listas: {shoppingLists.length}</Text>
        </>
      )}
    </View>
  );

  // Espaçamento extra superior (colunas removidas: sempre vertical)
  const contentExtraTop = __w < 420 ? 12 : __w < 760 ? 24 : 40;

  // Savings indicator including explicit snapshots; diff = ultimo snapshot - preço atual (positivo => economia)
  const itemSavingsMap = useMemo(()=>{
    const map = {};
    (list?.items||[]).forEach(it => {
      const nameKey = String(it.name||'').trim().toLowerCase();
      const snapshots = [];
      // snapshots only from this list's item history
      if (Array.isArray(it.priceHistory)) it.priceHistory.forEach(ph=> snapshots.push({ ts: ph.ts, price:Number(ph.price) }));
      snapshots.sort((a,b)=> new Date(a.ts) - new Date(b.ts));
      const last = snapshots[snapshots.length-1];
      const current = Number(it.price)||0;
      if (last && current>0) {
        const diff = last.price - current;
        if (Math.abs(diff) > 0.009) {
          const pct = last.price !==0 ? (diff/ last.price)*100 : 0;
          map[it.id] = { diff, last: last.price, pct };
        }
      }
    });
    return map;
  },[list?.items]);

  return (
    <SafeAreaView style={detailStyles.root} edges={['top']}>
      <View style={detailStyles.tabHolder} onLayout={(e)=> setTabHeight(e.nativeEvent.layout.height)}>
        <TabBar active={'LISTS'} onNavigate={handleNavigate} onAddList={() => setModalVisible(true)} />
      </View>
      <SwipeNavigator onSwipeLeft={() => handleNavigate('PROFILE')} onSwipeRight={() => handleNavigate('LISTS')} progress={progress} allowSwipeLeft={false} allowSwipeRight>
        {!list ? renderEmptyOrLoading() : (
        <FlatList
          style={detailStyles.container}
            contentContainerStyle={[detailStyles.scrollContent, { paddingTop: (tabHeight || TAB_BAR_OFFSET) + contentExtraTop }]}
            data={items}
            keyExtractor={(item) => item.id}
            numColumns={1}
            ListHeaderComponent={(
              <>
                <View style={[detailStyles.card]}> 
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <CategoryIcon type={list.category || 'outros'} size={44} neutral />
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      {isEditingHeader ? (
                        <>
                          <TextInput value={editedName} onChangeText={setEditedName} style={[detailStyles.headerInput, detailStyles.headerNameInput]} placeholder="Nome da lista" />
                          <TextInput value={editedDesc} onChangeText={setEditedDesc} style={[detailStyles.headerInput, detailStyles.headerDescInput]} placeholder="Descrição (opcional)" multiline numberOfLines={3} textAlignVertical="top" />
                        </>
                      ) : (
                        <>
                          <Text style={detailStyles.cardTitle}>{list.name}</Text>
                          {!!(list.desc || list.description) && <Text style={{ color: '#6B7280' }}>{list.desc || list.description}</Text>}
                        </>
                      )}
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ color: '#111827', fontWeight: 'bold' }}>R$ {total.toFixed(2)}</Text>
                      <Text style={{ color: '#6B7280', fontSize: 12 }}>{purchasedCount}/{totalCount} comprados</Text>
                    </View>
                  </View>
                  <View style={detailStyles.progressBarWrap}>
                    <View style={detailStyles.progressBarBg}><View style={[detailStyles.progressBarFill, { width: `${totalCount ? (purchasedCount / totalCount) * 100 : 0}%` }]} /></View>
                    <Text style={detailStyles.progressText}>Progresso</Text>
                  </View>
                  <View style={detailStyles.actionsRow}>
                    <Button variant="light" title="Compartilhar" onPress={handleShare} />
                    {isEditingHeader ? (
                      <Button variant="success" title="Salvar" onPress={saveEditHeader} />
                    ) : (
                      <Button variant="gray" title="Editar" onPress={beginEditHeader} />
                    )}
                    <Button variant="gray" title="Marcar todos" onPress={markAllPurchased} />
                    <Button variant="gray" title="Limpar concluídos" onPress={clearCompleted} />
                  </View>
                </View>
                {canEdit && (
                  <View style={detailStyles.card}>
                    <Text style={detailStyles.cardTitle}>Adicionar Item</Text>
                    <TextInput style={detailStyles.input} placeholder="Nome do item" value={newItemName} onChangeText={setNewItemName} />
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 2, paddingHorizontal: 2, gap: 8, marginBottom: 10 }}>
                      <Chip label="Todas" emoji="📋" active={newItemCategory === 'all'} onPress={() => setNewItemCategory('all')} />
                      {Object.entries(itemCategories).map(([key, cfg]) => (
                        <Chip key={key} label={cfg.name} emoji={cfg.emoji} active={newItemCategory === key} onPress={() => setNewItemCategory(key)} />
                      ))}
                    </ScrollView>
                    <View style={[detailStyles.inputRow]}>
                      <TextInput style={[detailStyles.input, { flex: 1 }]} placeholder="Qtd." value={newItemQty} onChangeText={setNewItemQty} keyboardType="number-pad" />
                      <TextInput style={[detailStyles.input, { flex: 2 }]} placeholder="Preço (opcional)" value={newItemPrice} onChangeText={setNewItemPrice} keyboardType="numeric" />
                    </View>
                    <Button title="Adicionar" onPress={handleAddItem} style={{ alignSelf: 'flex-start' }} />
                  </View>
                )}
                <View style={[detailStyles.card, { paddingBottom: 8 }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TextInput style={[detailStyles.input, { flex: 1, marginRight: 8 }]} placeholder="Buscar item..." value={query} onChangeText={setQuery} />
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <Chip label="Todos" active={!showOnlyPending && !showOnlyCompleted} onPress={() => { setShowOnlyPending(false); setShowOnlyCompleted(false); }} />
                      <Chip label="Pendentes" active={showOnlyPending} onPress={() => { setShowOnlyPending(true); setShowOnlyCompleted(false); }} />
                      <Chip label="Concluídos" active={showOnlyCompleted} onPress={() => { setShowOnlyPending(false); setShowOnlyCompleted(true); }} />
                    </View>
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 8 }}>
                    <Chip label="Todas" emoji="📋" active={categoryFilter === 'all'} onPress={() => setCategoryFilter('all')} />
                    {Object.entries(itemCategories).map(([key, cfg]) => (
                      <Chip key={key} label={cfg.name} emoji={cfg.emoji} active={categoryFilter === key} onPress={() => setCategoryFilter(key)} />
                    ))}
                  </ScrollView>
                </View>
                <Text style={detailStyles.sectionTitle}>Itens da Lista</Text>
              </>
            )}
      renderItem={({ item }) => {
              const renderLeftActions = (progress, dragX) => {
                if (!canEdit) return <View />;
                const scale = dragX.interpolate({ inputRange: [0, 80], outputRange: [0.6, 1], extrapolate: 'clamp' });
                const opacity = progress.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] });
                return (
                  <Animated.View style={[detailStyles.swipeActionLeft, { transform: [{ scale }], opacity }]}>
                    <Text style={detailStyles.swipeActionText}>Editar</Text>
                  </Animated.View>
                );
              };
              const renderRightActions = (progress, dragX) => {
                if (!canEdit) return <View />;
                const scale = dragX.interpolate({ inputRange: [-80, 0], outputRange: [1, 0.6], extrapolate: 'clamp' });
                const opacity = progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0.3] });
                return (
                  <Animated.View style={[detailStyles.swipeActionRight, { transform: [{ scale }], opacity }]}>
                    <Text style={detailStyles.swipeActionText}>Apagar</Text>
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
                    if (dir === 'left') startEditPrice(item.id, item.price);
                    if (dir === 'right') handleDeleteItem(item.id);
                  }}
                >
                  <View style={[detailStyles.itemCard, item.isPurchased && detailStyles.itemCardPurchased]}>
                    <TouchableOpacity style={detailStyles.checkWrap} onPress={() => handleTogglePurchased(item.id)} activeOpacity={0.8}>
                      <View style={[detailStyles.checkCircle, item.isPurchased && detailStyles.checkCircleOn]}>{item.isPurchased ? <CheckIcon /> : null}</View>
                    </TouchableOpacity>
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <Text style={[detailStyles.itemName, item.isPurchased && detailStyles.itemNamePurchased]} numberOfLines={2}>{item.name}</Text>
                      <Text style={detailStyles.itemSubText}>{(itemCategories[item.category]?.name) || 'Outros'}</Text>
                      <View style={detailStyles.metaRow}>
                        <View style={detailStyles.qtyBox}>
                          <TouchableOpacity disabled={!canEdit} onPress={() => decQty(item.id)} style={detailStyles.qtyBtn} activeOpacity={0.7}><Text style={detailStyles.qtyBtnText}>-</Text></TouchableOpacity>
                          <Text style={detailStyles.qtyValue}>{parseInt(item.quantity) || 1}</Text>
                          <TouchableOpacity disabled={!canEdit} onPress={() => incQty(item.id)} style={detailStyles.qtyBtn} activeOpacity={0.7}><Text style={detailStyles.qtyBtnText}>+</Text></TouchableOpacity>
                        </View>
                        <TouchableOpacity disabled={!canEdit} onPress={() => startEditPrice(item.id, item.price)} activeOpacity={0.8} style={detailStyles.pricePill}>
                          {editingPriceId === item.id ? (
                            <View style={detailStyles.priceEditRow}>
                              <Text style={detailStyles.pricePrefix}>R$</Text>
                              <TextInput style={detailStyles.priceInput} value={editingPriceText} onChangeText={setEditingPriceText} onBlur={() => saveEditPrice(item.id)} keyboardType="numeric" autoFocus />
                              <TouchableOpacity onPress={() => saveEditPrice(item.id)} activeOpacity={0.7}><Text style={detailStyles.priceSave}>OK</Text></TouchableOpacity>
                            </View>
                          ) : (
                            <Text style={detailStyles.priceText}>{item.price > 0 ? `R$ ${Number(item.price).toFixed(2)}` : 'Definir preço'}</Text>
                          )}
                        </TouchableOpacity>
                        {item.price > 0 && (
                          <View style={detailStyles.itemTotal}>
                            <Text style={detailStyles.itemTotalText}>R$ {(Number(item.price) * (parseInt(item.quantity) || 1)).toFixed(2)}</Text>
                          </View>
                        )}
                        {itemSavingsMap[item.id] && (
                          <View style={[detailStyles.savingBadge, itemSavingsMap[item.id].diff > 0 ? detailStyles.savingPos : detailStyles.savingNeg]}>
                            <Text style={detailStyles.savingBadgeText}>
                              {itemSavingsMap[item.id].diff > 0 ? `↓ ${Math.abs(itemSavingsMap[item.id].diff).toFixed(2)} (${Math.abs(itemSavingsMap[item.id].pct).toFixed(1)}%)` : `↑ ${Math.abs(itemSavingsMap[item.id].diff).toFixed(2)} (${Math.abs(itemSavingsMap[item.id].pct).toFixed(1)}%)`}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                </Swipeable>
              );
            }}
            ListFooterComponent={(
              <>
                <View style={detailStyles.card}>
                  <Text style={detailStyles.cardTitle}>Histórico de Preços</Text>
                  <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:8, alignItems:'center' }}>
                    {{
                      all: 'Tudo',
                      '7d': 'Últimos 7 dias',
                      '30d': 'Últimos 30 dias',
                      '6m': 'Últimos 6 meses',
                    }[historyRange]}
                  </View>
                  {!!priceTrend && (
                    <Text style={{ color: priceTrend.up ? '#DC2626' : '#16A34A', fontWeight: '600', marginBottom: 6 }}>
                      {priceTrend.up ? '▲' : '▼'} {Math.abs(priceTrend.diff).toFixed(2)} ({priceTrend.pct.toFixed(1)}%) vs ponto anterior
                    </Text>
                  )}
                  {availablePriceItems.length > 0 ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 4 }}>
                      {availablePriceItems.map(name => (
                        <Chip key={name} label={name} active={effectiveSelectedItem === name} onPress={() => setSelectedPriceItem(name)} />
                      ))}
                    </ScrollView>
                  ) : (
                    <Text style={detailStyles.emptyText}>Nenhum item com preço registrado.</Text>
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
                        dataPointsColor="#1D4ED8"
                        yAxisTextStyle={{ color: '#374151', fontSize: 10 * __fs }}
                        xAxisLabelTextStyle={{ color: '#374151', fontSize: 10 * __fs, transform: [{ translateY: 4 }] }}
                        noOfSections={4}
                        spacing={Math.max(42, (MAX_CARD_WIDTH - 80) / Math.max(6, priceData.length + 1))}
                        initialSpacing={24}
                        focusEnabled
                        showStripOnFocus={priceData.length > 1}
                        pointerConfig={{
                          pointerStripUptoDataPoint: true,
                          pointerStripColor: 'rgba(59,130,246,0.35)',
                          pointerStripWidth: 2,
                          pointerColor: '#1D4ED8',
                          radius: 5,
                          pointerLabelWidth: 150,
                          pointerLabelHeight: 88,
                          activatePointersOnLongPress: true,
                          pointerLabelComponent: (items) => {
                            const it = items?.[0];
                            if (!it) return null;
                            return (
                              <View style={{ backgroundColor: '#1F2937', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10 }}>
                                <Text style={{ color: '#93C5FD', fontSize: 11, fontWeight: '600' }}>{it.label}</Text>
                                <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700', marginTop: 2 }}>Unit: R$ {Number(it.unitAvg ?? it.value).toFixed(2)}</Text>
                                <Text style={{ color: '#FCD34D', fontSize: 12, fontWeight: '600', marginTop: 2 }}>Total: R$ {Number(it.totalAvg ?? 0).toFixed(2)}</Text>
                              </View>
                            );
                          },
                        }}
                      />
                      {priceData.length === 1 && (
                        <Text style={[detailStyles.emptyText, { marginTop: 8 }]}>Adicione outra alteração de preço para ver tendência.</Text>
                      )}
                    </>
                  ) : (
                    <Text style={detailStyles.emptyText}>Nenhum registro de preço ainda.</Text>
                  )}
                  {priceData.length > 0 && (
                    <View style={{ marginTop: 10 }}>
                      {priceData.map((p, idx) => (
                        <View key={idx} style={{ paddingVertical: 6 }}>
                          <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
                            <Text style={{ color: '#6B7280' }}>{new Date(p.date).toLocaleDateString()}</Text>
                            <Text style={{ color: '#2563EB', fontWeight: '700' }}>Unit R$ {p.unitAvg.toFixed(2)}</Text>
                          </View>
                          <Text style={{ color:'#CA8A04', fontSize: 12, fontWeight:'600', textAlign:'right' }}>Total médio R$ {p.totalAvg.toFixed(2)}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
                <View style={detailStyles.card}>
                  <Text style={detailStyles.cardTitle}>Membros na Lista</Text>
                  <View style={detailStyles.membersRow}>
                    {familyMembers.length === 0 && (
                      <Text style={detailStyles.emptyText}>Nenhum membro encontrado.</Text>
                    )}
                    {familyMembers.map(member => {
                      const initial = (member?.displayName || member?.email || '?').slice(0,1).toUpperCase();
                      const inList = Array.isArray(list.members) && list.members.includes(member.id);
                      return (
                        <View key={member.id} style={detailStyles.memberAvatarBox}>
                          <View style={[detailStyles.memberAvatar, { backgroundColor: '#3B82F6' }]}>
                            <Text style={detailStyles.memberAvatarText}>{initial}</Text>
                          </View>
                          <Text style={detailStyles.memberName}>{member.displayName || member.email}</Text>
                          <TouchableOpacity style={[detailStyles.memberButton, inList ? detailStyles.memberButtonRemove : detailStyles.memberButtonAdd]} onPress={() => handleMemberToggle(member.id)} activeOpacity={0.8}>
                            <Text style={detailStyles.memberButtonText}>{inList ? 'Remover' : 'Adicionar'}</Text>
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </View>
                </View>
                <Button variant="dark" title="Concluir Lista" onPress={handleArchiveList} />
                <View style={{ height: 8 }} />
                <Button variant="danger" title="Excluir Lista" onPress={deleteList} />
              </>
            )}
            showsVerticalScrollIndicator={false}
            bounces
            overScrollMode="always"
          />
        )}
      </SwipeNavigator>
      <AddListModal visible={modalVisible} onClose={() => setModalVisible(false)} onCreate={(newList) => {
        updateLists([ ...shoppingLists, { ...newList, id: `list_${Date.now()}`, familyId: currentUser?.familyId, createdAt: new Date().toISOString(), status: 'active', members: currentUser ? [currentUser.id] : [], } ]);
      }} />
      {recentlyDeleted && (
        <View style={detailStyles.snackbar} pointerEvents="box-none">
          <TouchableOpacity onPress={undoDelete} activeOpacity={0.85} style={{ flexDirection:'row', alignItems:'center', flex:1 }}>
            <Text style={detailStyles.snackbarText}>Item removido</Text>
            <Text style={detailStyles.snackbarUndo}> DESFAZER</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={()=> setRecentlyDeleted(null)} style={{ paddingLeft:12 }}>
            <Text style={[detailStyles.snackbarUndo,{color:'#fff'}]}>×</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
export default ListDetailScreen;

const MAX_CARD_WIDTH = Math.min(900, __w * 0.98);
const __compact = __w < 420;
// Ajustável: espaço adicional entre TabBar e conteúdo
const CONTENT_EXTRA_TOP = 40; // altere aqui para ajustar rapidamente

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

const detailStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#e6f0fa' },
  tabHolder: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 60 },
  container: { flex: 1, backgroundColor: '#e6f0fa' },
  // Usa constante de espaçamento configurável
  scrollContent: { alignItems: 'center', paddingBottom: 32, paddingHorizontal: 8 },
  card: {
    backgroundColor: '#fff',
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
    color: '#222',
    marginBottom: 10,
  },
  headerInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
  backgroundColor: '#fff',
  borderRadius: 12,
  paddingHorizontal: 14,
  paddingVertical: 12,
  marginBottom: 10,
  borderWidth: 1,
  borderColor: '#E5E7EB',
  fontSize: 15 * __fs,
  },
  addButton: {
    backgroundColor: '#3B82F6',
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
    color: '#222',
    marginBottom: 10,
  },
  progressBarWrap: {
    marginTop: 12,
  },
  progressBarBg: {
    width: '100%',
    height: 10,
    backgroundColor: '#e5e7eb',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4f46e5',
  },
  progressText: {
    color: '#6B7280',
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
    borderColor: '#e5e7eb',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#fff',
    minHeight: 44,
    alignSelf: 'flex-start',
  },
  actionChipText: {
    color: '#111827',
    fontWeight: '600',
  },
  itemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 14, width: '96%', maxWidth: MAX_CARD_WIDTH, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  swipeActionLeft: { width: 88, marginVertical: 5, marginLeft: 8, borderRadius: 16, backgroundColor: '#3B82F6', alignItems: 'center', justifyContent: 'center' },
  swipeActionRight: { width: 88, marginVertical: 5, marginRight: 8, borderRadius: 16, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center' },
  swipeActionText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  checkWrap: {
    marginRight: 10,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkCircleOn: {
    backgroundColor: '#22C55E',
    borderColor: '#16A34A',
  },
  itemCardPurchased: {
    opacity: 0.6,
  },
  itemName: {
  fontSize: 16 * __fs,
    fontWeight: 'bold',
    color: '#111827',
  },
  itemNamePurchased: {
    textDecorationLine: 'line-through',
    color: '#6B7280',
  },
  itemSubText: {
    color: '#6B7280',
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
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    overflow: 'hidden',
  },
  qtyBtn: { paddingHorizontal: 12, paddingVertical: 8, minWidth: 36, minHeight: 36, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: {
    fontSize: 18 * __fs,
    color: '#111827',
  },
  qtyValue: {
    minWidth: 26,
    textAlign: 'center',
    fontWeight: '700',
    color: '#111827',
  },
  pricePill: { backgroundColor: '#EEF2FF', borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12, borderWidth: 1, borderColor: '#C7D2FE' },
  itemTotal: { marginLeft: 8, backgroundColor: '#DCFCE7', borderColor: '#86EFAC', borderWidth: 1, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999 },
  itemTotalText: { color: '#15803D', fontWeight: '700' },
  savingBadge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8, marginLeft: 4 },
  savingPos: { backgroundColor: '#DCFCE7', borderWidth:1, borderColor:'#86EFAC' },
  savingNeg: { backgroundColor: '#FEE2E2', borderWidth:1, borderColor:'#FCA5A5' },
  savingBadgeText: { fontSize: 11 * __fs, fontWeight: '700', color:'#111827' },
  priceText: {
    color: '#4F46E5',
    fontWeight: '700',
  },
  priceEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pricePrefix: { color: '#6B7280', marginRight: 4 },
  priceInput: { minWidth: 72, paddingVertical: 0, paddingHorizontal: 0, color: '#111827', fontSize: 15 * __fs },
  priceSave: { color: '#16A34A', fontWeight: '700', marginLeft: 6 },
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
    color: '#111827',
    marginBottom: 6,
  },
  memberButton: {
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  memberButtonAdd: {
    backgroundColor: '#D1FAE5',
  },
  memberButtonRemove: {
    backgroundColor: '#FEE2E2',
  },
  memberButtonText: {
  fontSize: 12 * __fs,
    color: '#111827',
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
    backgroundColor: '#e6f0fa',
  },
  emptyText: {
    color: '#6B7280',
  fontSize: 14 * __fs,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    minWidth: 90,
  },
  statLabel: { color: '#6B7280' },
  statValue: { color: '#111827', fontWeight: '700', marginTop: 2 },
  // chip styles now centralized via Chip component
  snackbar: { position:'absolute', left:16, right:16, bottom:24, backgroundColor:'#111827', paddingVertical:12, paddingHorizontal:18, borderRadius:14, flexDirection:'row', alignItems:'center', shadowColor:'#000', shadowOpacity:0.2, shadowRadius:8, elevation:6 },
  snackbarText: { color:'#fff', fontSize:14 * __fs, fontWeight:'500' },
  snackbarUndo: { color:'#60A5FA', fontSize:14 * __fs, fontWeight:'700' },
});

// Small category chip component used above
function CategoryChip({ label, emoji, active, onPress, isFilter }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[detailStyles.chip, active && detailStyles.chipActive, { flexDirection: 'row', alignItems: 'center' }]}
    >
      <Text style={[detailStyles.chipText, active && { color: '#fff' }]}>
        {emoji ? `${emoji} ` : ''}{label}
      </Text>
    </TouchableOpacity>
  );
}
