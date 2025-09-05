import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useContext, useMemo, useState } from 'react';
import { Alert, Animated, Dimensions, FlatList, ScrollView, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { LineChart } from 'react-native-gifted-charts';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddListModal from '../components/AddListModal';
import { CategoryIcon, CheckIcon } from '../components/Icons';
import SwipeNavigator from '../components/SwipeNavigator';
import TabBar from '../components/TabBar';
import { DataContext } from '../contexts/DataContext';

function ListDetailScreen(props) {
  const { shoppingLists, updateLists, families, users, currentUser } = useContext(DataContext);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('1');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [showOnlyPending, setShowOnlyPending] = useState(false);
  const [showOnlyCompleted, setShowOnlyCompleted] = useState(false);
  const [newItemCategory, setNewItemCategory] = useState('outros');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedDesc, setEditedDesc] = useState('');
  const [selectedPriceItem, setSelectedPriceItem] = useState('');
  // Expo Router: lê o listId via search params
  const params = useLocalSearchParams();
  const listIdParam = typeof params.listId === 'string' ? params.listId : Array.isArray(params.listId) ? params.listId[0] : undefined;
  const listId = props?.listId || listIdParam;
  const list = shoppingLists.find(l => l.id === listId);
  const family = families.find(f => currentUser && f.id === currentUser.familyId);
  const familyMembers = users.filter(u => family?.members.includes(u.id));
  const router = useRouter();
  const progress = useState(new Animated.Value(0))[0];

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

  // Evita retorno condicional antes de hooks: tratamos a ausência da lista no JSX

  // Derivados para visualização
  const trimmedQuery = (query || '').trim().toLowerCase();
  const items = (list?.items || [])
    .filter((it) => (
      (trimmedQuery ? String(it.name || '').toLowerCase().includes(trimmedQuery) : true)
      && (showOnlyPending ? !it.isPurchased : true)
      && (showOnlyCompleted ? !!it.isPurchased : true)
      && (categoryFilter === 'all' ? true : String(it.category || 'outros') === categoryFilter)
    ))
    .sort((a, b) => {
      // Pendentes primeiro, depois concluídos; dentro do grupo, mais recentes primeiro
      const pa = a.isPurchased ? 1 : 0;
      const pb = b.isPurchased ? 1 : 0;
      if (pa !== pb) return pa - pb;
      const ta = new Date(a.createdAt || 0).getTime();
      const tb = new Date(b.createdAt || 0).getTime();
      return tb - ta;
    });
  const total = (list?.items || []).reduce((sum, it) => sum + (Number(it.price) || 0), 0);
  const purchasedCount = (list?.items || []).filter(it => it.isPurchased).length;
  const totalCount = (list?.items || []).length;
  const purchasedTotal = (list?.items || []).reduce((sum, it) => sum + ((it.isPurchased ? Number(it.price) : 0) || 0), 0);
  const pendingTotal = total - purchasedTotal;

  const canEdit = !!list && list.status !== 'archived' && currentUser && list.members?.includes(currentUser.id);

  // Prepara edição de cabeçalho
  const beginEditHeader = () => {
    setEditedName(list.name || '');
    setEditedDesc(list.desc || list.description || '');
    setIsEditingHeader(true);
  };
  const saveEditHeader = () => {
    const updatedLists = shoppingLists.map(l => l.id === listId ? { ...l, name: (editedName || '').trim() || l.name, desc: editedDesc } : l);
    updateLists(updatedLists);
    setIsEditingHeader(false);
  };

  const handleAddItem = () => {
    if (newItemName.trim() === '') return;
    const newItem = {
      id: `item_${Date.now()}`,
      name: newItemName,
      quantity: parseInt(newItemQty) || 1,
      price: parseFloat(newItemPrice.replace(',', '.')) || 0,
  addedBy: currentUser?.id,
      category: newItemCategory || 'outros',
      isPurchased: false,
      createdAt: new Date().toISOString()
    };
    const updatedLists = shoppingLists.map(l =>
      l.id === listId ? { ...l, items: [newItem, ...(l.items || [])] } : l
    );
    updateLists(updatedLists);
  setNewItemName(''); setNewItemQty('1'); setNewItemPrice(''); setNewItemCategory('outros');
  };

  const handleTogglePurchased = (itemId) => {
    const updatedLists = shoppingLists.map(l => {
      if (l.id === listId) {
        const updatedItems = (l.items || []).map(item =>
          item.id === itemId ? { ...item, isPurchased: !item.isPurchased } : item
        );
        return { ...l, items: updatedItems };
      }
      return l;
    });
    updateLists(updatedLists);
  };

  const handleDeleteItem = (itemId) => {
    const updatedLists = shoppingLists.map(l => {
      if (l.id === listId) {
        const updatedItems = (l.items || []).filter(item => item.id !== itemId);
        return { ...l, items: updatedItems };
      }
      return l;
    });
    updateLists(updatedLists);
  };

  const handleMemberToggle = (memberId) => {
    const isOnList = list.members.includes(memberId);
    const newMembers = isOnList ? list.members.filter(id => id !== memberId) : [...list.members, memberId];
    const updatedLists = shoppingLists.map(l =>
      l.id === listId ? { ...l, members: newMembers } : l
    );
    updateLists(updatedLists);
  };

  const handleArchiveList = () => {
    Alert.alert('Arquivar Lista', 'Deseja finalizar e arquivar esta lista?', [
      { text: 'Cancelar' },
      { text: 'Sim', onPress: () => {
        const updatedLists = shoppingLists.map(l =>
          l.id === listId ? { ...l, status: 'archived' } : l
        );
        updateLists(updatedLists);
        // Navegação para LISTS pode ser ajustada conforme seu sistema
      }}
    ]);
  };

  const handleShare = async () => {
    try {
      const message = `Lista: ${list.name}\nItens: ${totalCount} (concluídos: ${purchasedCount})\nTotal: R$ ${total.toFixed(2)}`;
      await Share.share({ message });
    } catch (_e) {}
  };

  const markAllPurchased = () => {
    const updatedLists = shoppingLists.map(l => {
      if (l.id === listId) {
        const updatedItems = (l.items || []).map(item => ({ ...item, isPurchased: true }));
        return { ...l, items: updatedItems };
      }
      return l;
    });
    updateLists(updatedLists);
  };

  const clearCompleted = () => {
    const updatedLists = shoppingLists.map(l => {
      if (l.id === listId) {
        const updatedItems = (l.items || []).filter(item => !item.isPurchased);
        return { ...l, items: updatedItems };
      }
      return l;
    });
    updateLists(updatedLists);
  };

  // Inline edição de preço e ajuste de quantidade
  const [editingPriceId, setEditingPriceId] = useState(null);
  const [editingPriceText, setEditingPriceText] = useState('');
  const startEditPrice = (id, currentPrice) => {
    if (!canEdit) return;
    setEditingPriceId(id);
    setEditingPriceText(String(currentPrice ?? ''));
  };
  const saveEditPrice = (id) => {
    if (!canEdit) return;
    const val = parseFloat(String(editingPriceText).replace(',', '.'));
    const updatedLists = shoppingLists.map(l => {
      if (l.id === listId) {
        const updatedItems = (l.items || []).map(item => item.id === id ? { ...item, price: Number.isFinite(val) ? val : 0 } : item);
        return { ...l, items: updatedItems };
      }
      return l;
    });
    updateLists(updatedLists);
    setEditingPriceId(null);
    setEditingPriceText('');
  };
  const incQty = (id) => {
    if (!canEdit) return;
    const updatedLists = shoppingLists.map(l => {
      if (l.id === listId) {
        const updatedItems = (l.items || []).map(item => item.id === id ? { ...item, quantity: (parseInt(item.quantity) || 1) + 1 } : item);
        return { ...l, items: updatedItems };
      }
      return l;
    });
    updateLists(updatedLists);
  };
  const decQty = (id) => {
    if (!canEdit) return;
    const updatedLists = shoppingLists.map(l => {
      if (l.id === listId) {
        const updatedItems = (l.items || []).map(item => item.id === id ? { ...item, quantity: Math.max(1, (parseInt(item.quantity) || 1) - 1) } : item);
        return { ...l, items: updatedItems };
      }
      return l;
    });
    updateLists(updatedLists);
  };

  const deleteList = () => {
    Alert.alert('Excluir Lista', 'Tem certeza que deseja excluir esta lista?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => {
        const newLists = shoppingLists.filter(l => l.id !== listId);
        updateLists(newLists);
        handleNavigate('LISTS');
      }}
    ]);
  };

  // Histórico de preços consolidado das listas arquivadas
  const archivedLists = useMemo(() => (shoppingLists || [])
  .filter(l => currentUser && l.familyId === currentUser.familyId && l.status === 'archived')
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)), [shoppingLists, currentUser]);

  const availablePriceItems = useMemo(() => {
    const set = new Set();
    // nomes do item da lista atual primeiro
    (list?.items || []).forEach(it => set.add(String(it.name || '').trim().toLowerCase()));
    // nomes dos itens históricos
    archivedLists.forEach(l => (l.items || []).forEach(it => set.add(String(it.name || '').trim().toLowerCase())));
    const arr = Array.from(set).filter(Boolean).sort();
    return arr;
  }, [list.items, archivedLists]);

  const effectiveSelectedItem = selectedPriceItem || availablePriceItems[0] || '';
  const priceData = useMemo(() => {
    if (!effectiveSelectedItem) return [];
    const data = [];
    archivedLists.forEach(l => {
      (l.items || []).forEach(item => {
        if (String(item.name || '').trim().toLowerCase() === effectiveSelectedItem && Number(item.price) > 0) {
          const date = new Date(l.createdAt);
          const label = `${date.getDate()}/${date.getMonth() + 1}`;
          data.push({ value: Number(item.price), label, date: l.createdAt, price: Number(item.price) });
        }
      });
    });
    return data;
  }, [archivedLists, effectiveSelectedItem]);

  return (
    <SafeAreaView style={detailStyles.root} edges={['top']}>
      <SwipeNavigator
        onSwipeLeft={() => handleNavigate('PROFILE')}
        onSwipeRight={() => handleNavigate('LISTS')}
  progress={progress}
  enabled
  allowSwipeLeft={false}
  allowSwipeRight
  edgeFrom="left"
  edgeActivationWidth={20}
  reduceScale={0.015}
  reduceOpacity={0.03}
  dragFactor={0.3}
      >
        {!list ? (
          <View style={detailStyles.centered}><Text style={detailStyles.emptyText}>Lista não encontrada.</Text></View>
        ) : (
          <FlatList
          style={detailStyles.container}
          contentContainerStyle={detailStyles.scrollContent}
          data={items}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={(
            <>
              <View style={[detailStyles.card]}> 
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <CategoryIcon type={list.category || 'outros'} size={44} neutral />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    {isEditingHeader ? (
                      <>
                        <TextInput
                          value={editedName}
                          onChangeText={setEditedName}
                          style={[detailStyles.headerInput, detailStyles.headerNameInput]}
                          placeholder="Nome da lista"
                        />
                        <TextInput
                          value={editedDesc}
                          onChangeText={setEditedDesc}
                          style={[detailStyles.headerInput, detailStyles.headerDescInput]}
                          placeholder="Descrição (opcional)"
                          multiline
                          numberOfLines={__compact ? 3 : 4}
                          textAlignVertical="top"
                        />
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
                  <View style={detailStyles.progressBarBg}>
                    <View style={[detailStyles.progressBarFill, { width: `${totalCount ? (purchasedCount / totalCount) * 100 : 0}%` }]} />
                  </View>
                  <Text style={detailStyles.progressText}>Progresso</Text>
                </View>

                <View style={detailStyles.actionsRow}>
                  <TouchableOpacity onPress={handleShare} style={detailStyles.actionChip} activeOpacity={0.85}><Text style={detailStyles.actionChipText}>Compartilhar</Text></TouchableOpacity>
                  {isEditingHeader ? (
                    <TouchableOpacity onPress={saveEditHeader} style={[detailStyles.actionChip, { backgroundColor: '#10b981' }]} activeOpacity={0.85}><Text style={[detailStyles.actionChipText, { color: '#fff' }]}>Salvar</Text></TouchableOpacity>
                  ) : (
                    <TouchableOpacity onPress={beginEditHeader} style={detailStyles.actionChip} activeOpacity={0.85}><Text style={detailStyles.actionChipText}>Editar</Text></TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={markAllPurchased} style={detailStyles.actionChip} activeOpacity={0.85}><Text style={detailStyles.actionChipText}>Marcar todos</Text></TouchableOpacity>
                  <TouchableOpacity onPress={clearCompleted} style={detailStyles.actionChip} activeOpacity={0.85}><Text style={detailStyles.actionChipText}>Limpar concluídos</Text></TouchableOpacity>
                </View>
              </View>

              {canEdit && (
                <View style={detailStyles.card}>
                  <Text style={detailStyles.cardTitle}>Adicionar Item</Text>
                  <TextInput style={detailStyles.input} placeholder="Nome do item" value={newItemName} onChangeText={setNewItemName} />
                  {/* Categoria chips */}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 2, paddingHorizontal: 2, gap: 8, marginBottom: 10 }}>
                    <CategoryChip label="Todas" emoji="📋" active={newItemCategory === 'all'} onPress={() => setNewItemCategory('all')} isFilter />
                    {Object.entries(itemCategories).map(([key, cfg]) => (
                      <CategoryChip key={key} label={cfg.name} emoji={cfg.emoji} active={newItemCategory === key} onPress={() => setNewItemCategory(key)} />
                    ))}
                  </ScrollView>
                  <View style={[detailStyles.inputRow, __compact && { flexDirection: 'column' }]}>
                    <TextInput style={[detailStyles.input, __compact ? {} : { flex: 1 }]} placeholder="Qtd." value={newItemQty} onChangeText={setNewItemQty} keyboardType="number-pad" />
                    <TextInput style={[detailStyles.input, __compact ? {} : { flex: 2 }]} placeholder="Preço (opcional)" value={newItemPrice} onChangeText={setNewItemPrice} keyboardType="numeric" />
                  </View>
                  <TouchableOpacity style={detailStyles.addButton} onPress={handleAddItem} activeOpacity={0.8}><Text style={detailStyles.addButtonText}>Adicionar</Text></TouchableOpacity>
                </View>
              )}

              <View style={[detailStyles.card, { paddingBottom: 8 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TextInput
                    style={[detailStyles.input, { flex: 1, marginRight: 8 }]}
                    placeholder="Buscar item..."
                    value={query}
                    onChangeText={setQuery}
                  />
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity
                      onPress={() => { setShowOnlyPending(false); setShowOnlyCompleted(false); }}
                      style={[detailStyles.filterChip, !showOnlyPending && !showOnlyCompleted && detailStyles.filterChipActive]}
                      activeOpacity={0.8}
                    >
                      <Text style={[detailStyles.filterChipText, !showOnlyPending && !showOnlyCompleted && { color: '#fff' }]}>Todos</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => { setShowOnlyPending(true); setShowOnlyCompleted(false); }}
                      style={[detailStyles.filterChip, showOnlyPending && detailStyles.filterChipActive]}
                      activeOpacity={0.8}
                    >
                      <Text style={[detailStyles.filterChipText, showOnlyPending && { color: '#fff' }]}>Pendentes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => { setShowOnlyPending(false); setShowOnlyCompleted(true); }}
                      style={[detailStyles.filterChip, showOnlyCompleted && detailStyles.filterChipActive]}
                      activeOpacity={0.8}
                    >
                      <Text style={[detailStyles.filterChipText, showOnlyCompleted && { color: '#fff' }]}>Concluídos</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                {/* Categoria - filtro */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 8 }}>
                  <TouchableOpacity onPress={() => setCategoryFilter('all')} style={[detailStyles.chip, categoryFilter === 'all' && detailStyles.chipActive]} activeOpacity={0.8}>
                    <Text style={[detailStyles.chipText, categoryFilter === 'all' && { color: '#fff' }]}>📋 Todas</Text>
                  </TouchableOpacity>
                  {Object.entries(itemCategories).map(([key, cfg]) => (
                    <TouchableOpacity key={key} onPress={() => setCategoryFilter(key)} style={[detailStyles.chip, categoryFilter === key && detailStyles.chipActive]} activeOpacity={0.8}>
                      <Text style={[detailStyles.chipText, categoryFilter === key && { color: '#fff' }]}>{cfg.emoji} {cfg.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <Text style={detailStyles.sectionTitle}>Itens da Lista</Text>
            </>
          )}
          renderItem={({ item }) => (
            <Swipeable
              renderLeftActions={() => (
                canEdit ? (
                  <TouchableOpacity
                    style={{ backgroundColor: '#3B82F6', justifyContent: 'center', paddingHorizontal: 16, borderTopLeftRadius: 16, borderBottomLeftRadius: 16 }}
                    onPress={() => startEditPrice(item.id, item.price)}
                    activeOpacity={0.85}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Editar</Text>
                  </TouchableOpacity>
                ) : <View />
              )}
              renderRightActions={() => (
                canEdit ? (
                  <TouchableOpacity
                    style={{ backgroundColor: '#F87171', justifyContent: 'center', paddingHorizontal: 16, borderTopRightRadius: 16, borderBottomRightRadius: 16 }}
                    onPress={() => handleDeleteItem(item.id)}
                    activeOpacity={0.85}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Apagar</Text>
                  </TouchableOpacity>
                ) : <View />
              )}
              leftThreshold={28}
              rightThreshold={28}
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
                    <TouchableOpacity
                      disabled={!canEdit}
                      onPress={() => startEditPrice(item.id, item.price)}
                      activeOpacity={0.8}
                      style={detailStyles.pricePill}
                    >
                      {editingPriceId === item.id ? (
                        <View style={detailStyles.priceEditRow}>
                          <Text style={detailStyles.pricePrefix}>R$</Text>
                          <TextInput
                            style={detailStyles.priceInput}
                            value={editingPriceText}
                            onChangeText={setEditingPriceText}
                            onBlur={() => saveEditPrice(item.id)}
                            keyboardType="numeric"
                            autoFocus
                          />
                          <TouchableOpacity onPress={() => saveEditPrice(item.id)}><Text style={detailStyles.priceSave}>OK</Text></TouchableOpacity>
                        </View>
                      ) : (
                        <Text style={detailStyles.priceText}>{item.price > 0 ? `R$ ${Number(item.price).toFixed(2)}` : 'Definir preço'}</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Swipeable>
          )}
          ListEmptyComponent={<Text style={detailStyles.emptyText}>Nenhum item na lista.</Text>}
      ListFooterComponent={(
            <>
        <View style={detailStyles.card}>
                <Text style={detailStyles.cardTitle}>Estatísticas</Text>
                <View style={detailStyles.statsRow}>
                  <View style={detailStyles.statBox}><Text style={detailStyles.statLabel}>Itens</Text><Text style={detailStyles.statValue}>{totalCount}</Text></View>
                  <View style={detailStyles.statBox}><Text style={detailStyles.statLabel}>Concluídos</Text><Text style={detailStyles.statValue}>{purchasedCount}</Text></View>
                  <View style={detailStyles.statBox}><Text style={detailStyles.statLabel}>Total</Text><Text style={detailStyles.statValue}>R$ {total.toFixed(2)}</Text></View>
                  <View style={detailStyles.statBox}><Text style={detailStyles.statLabel}>Pendente</Text><Text style={detailStyles.statValue}>R$ {pendingTotal.toFixed(2)}</Text></View>
                </View>
              </View>

              <View style={detailStyles.card}>
                <Text style={detailStyles.cardTitle}>Histórico de Preços</Text>
                {availablePriceItems.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 4 }}>
                    {availablePriceItems.map(name => (
                      <TouchableOpacity key={name} onPress={() => setSelectedPriceItem(name)} style={[detailStyles.chip, (effectiveSelectedItem === name) && detailStyles.chipActive]} activeOpacity={0.8}>
                        <Text style={[detailStyles.chipText, (effectiveSelectedItem === name) && { color: '#fff' }]}>{name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                ) : (
                  <Text style={detailStyles.emptyText}>Nenhum item com preço registrado.</Text>
                )}

                {priceData.length > 1 ? (
                  <LineChart
                    data={priceData}
                    isAnimated
                    color="#3B82F6"
                    thickness={3}
                    startFillColor="rgba(59, 130, 246, 0.2)"
                    endFillColor="rgba(59, 130, 246, 0.01)"
                    yAxisTextStyle={{ color: '#333' }}
                    xAxisLabelTextStyle={{ color: '#333' }}
                    noOfSections={4}
                    spacing={50}
                    initialSpacing={20}
                    style={{ marginVertical: 10 }}
                  />
                ) : (
                  <Text style={detailStyles.emptyText}>Dados insuficientes para gerar um gráfico (mínimo 2 registros).</Text>
                )}

                {priceData.length > 0 && (
                  <View style={{ marginTop: 10 }}>
                    {priceData.map((p, idx) => (
                      <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
                        <Text style={{ color: '#6B7280' }}>{new Date(p.date).toLocaleDateString()}</Text>
                        <Text style={{ color: '#3B82F6', fontWeight: 'bold' }}>R$ {p.price.toFixed(2)}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              <View style={detailStyles.card}>
                <Text style={detailStyles.cardTitle}>Membros na Lista</Text>
                <View style={detailStyles.membersRow}>
                  {familyMembers.map(member => (
                    <View key={member.id} style={detailStyles.memberAvatarBox}>
                      <View style={[detailStyles.memberAvatar, { backgroundColor: '#3B82F6' }]}>
                        <Text style={detailStyles.memberAvatarText}>{member.displayName[0]}</Text>
                      </View>
                      <Text style={detailStyles.memberName}>{member.displayName}</Text>
                      <TouchableOpacity style={[detailStyles.memberButton, list.members.includes(member.id) ? detailStyles.memberButtonRemove : detailStyles.memberButtonAdd]} onPress={() => handleMemberToggle(member.id)} activeOpacity={0.8}>
                        <Text style={detailStyles.memberButtonText}>{list.members.includes(member.id) ? 'Remover' : 'Adicionar'}</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>

              <TouchableOpacity style={detailStyles.archiveButton} onPress={handleArchiveList} activeOpacity={0.85}><Text style={detailStyles.archiveButtonText}>Finalizar e Arquivar Lista</Text></TouchableOpacity>
              <TouchableOpacity style={[detailStyles.archiveButton, { backgroundColor: '#ef4444' }]} onPress={deleteList} activeOpacity={0.85}><Text style={detailStyles.archiveButtonText}>Excluir Lista</Text></TouchableOpacity>
            </>
          )}
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
  <TabBar active={'LISTS'} onNavigate={handleNavigate} onAddList={() => setModalVisible(true)} />
    </SafeAreaView>
  );
}

export default ListDetailScreen;

const { width: __w } = Dimensions.get('window');
const __fs = Math.min(1.2, Math.max(0.9, __w / 390));
const MAX_CARD_WIDTH = Math.min(900, __w * 0.98);
const __compact = __w < 420;

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
  root: {
    flex: 1,
    backgroundColor: '#e6f0fa',
  },
  container: {
    flex: 1,
    backgroundColor: '#e6f0fa',
  },
  scrollContent: {
  alignItems: 'center',
  paddingVertical: 24,
  paddingHorizontal: 8,
  },
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
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  filterChip: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  filterChipActive: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  filterChipText: {
    color: '#111827',
    fontWeight: '600',
  fontSize: 14 * __fs,
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
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  actionChipText: {
    color: '#111827',
    fontWeight: '600',
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
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
  qtyBtn: { paddingHorizontal: 12, paddingVertical: 8 },
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
  pricePill: {
    backgroundColor: '#EEF2FF',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
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
    paddingVertical: 14,
    alignItems: 'center',
  width: '96%',
  maxWidth: MAX_CARD_WIDTH,
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
  chip: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  chipText: {
    color: '#111827',
    fontWeight: '600',
  },
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
