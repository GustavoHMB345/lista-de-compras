import { Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Modal, Platform, ScrollView, StatusBar, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// Certifique-se de que o caminho para seus dados mockados está correto
import { DataContext } from '../contexts/DataContext';
import { categories, generateListItems, mockShoppingLists } from '../data';

// --- Componente: Item da Lista (Layout Melhorado) ---

const ListItem = ({ item, onToggle, onRemove, onEditPrice, compact }) => {
  const category = categories[item.category] || categories.outros;

  return (
    // O estilo 'compact' agora aplica flexWrap no card principal
    <View style={[styles.itemCard, compact && styles.itemCardCompact]}>
      <Switch
        value={item.completed}
        onValueChange={onToggle}
        thumbColor={item.completed ? '#10B981' : '#f4f3f4'}
        trackColor={{ false: '#E5E7EB', true: '#A7F3D0' }}
        style={styles.itemSwitch}
      />
      <View style={[styles.itemEmojiContainer, { backgroundColor: category.gradient[0] }]}>
        <Text style={styles.itemEmoji}>{category.emoji}</Text>
      </View>

      {/* Coluna Principal: Nome e Preço */}
      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, item.completed && styles.itemNameCompleted]}>
          {item.name}
        </Text>
        <Text style={[styles.itemPrice, !item.price && styles.itemPriceEmpty]}>
          {item.price ? `R$ ${item.price.toFixed(2)}` : 'Sem preço'}
        </Text>
      </View>

      {/* Coluna da Direita: Categoria e Ações */}
      <View style={[styles.itemRightColumn, compact && styles.itemRightColumnCompact]}>
        <Text style={styles.itemCategory}>{category.name}</Text>
        <View style={styles.itemActions}>
          <TouchableOpacity onPress={onEditPrice} style={styles.actionButton}>
            <Feather name="edit-2" size={16} color="#3B82F6" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onRemove} style={styles.actionButton}>
            <Feather name="trash-2" size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// --- Componente: Chip de Filtro de Categoria ---

const CategoryFilterChip = ({
  catKey,
  name,
  emoji,
  count,
  isActive,
  onPress,
  styleConfig,
}) => {
  if (count === 0 && catKey !== 'all') return null;
  const labelStyles = [styles.chipLabel, isActive && styles.chipLabelActive];
  const countWrapStyles = [styles.chipCount, isActive && styles.chipCountActive];
  const countTextStyles = [styles.chipCountText, isActive && styles.chipCountTextActive];

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.categoryChip,
        isActive && styles.categoryChipActive,
        {
          minHeight: styleConfig.chipHeight,
          paddingVertical: styleConfig.chipPadV,
          paddingHorizontal: styleConfig.chipPadH,
        },
      ]}
    >
      {catKey !== 'all' ? <Text style={styles.chipEmoji}>{emoji}</Text> : null}
      <Text
        style={[
          labelStyles,
          {
            maxWidth: styleConfig.labelMaxWidth,
            flexShrink: 1,
            fontSize: styleConfig.chipLabelSize,
            lineHeight: styleConfig.chipLabelSize + 4,
          },
        ]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {catKey !== 'all' ? name : 'Todas'}
      </Text>
      <View style={countWrapStyles}>
        <Text style={[countTextStyles, { fontSize: styleConfig.chipCountSize }]}>
          {count}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// --- Componente: Cabeçalho da Lista ---

const ListHeaderCard = ({ list, stats, onGoBack, onClearCompleted }) => {
  return (
    <View style={styles.headerCard}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={onGoBack} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color="#6B7280" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{list.name}</Text>
          <Text style={styles.headerSubtitle}>Gerencie seus itens de compra</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => {}} style={styles.headerIconBtn}>
            <Feather name="share-2" size={18} color="#2563EB" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onClearCompleted} style={styles.headerIconBtn}>
            <Feather name="check-circle" size={18} color="#10B981" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ marginTop: 8 }}>
        <View style={styles.progressTopRow}>
          <Text style={styles.progressLabel}>Progresso da Lista</Text>
          <Text style={styles.progressText}>
            {stats.completed} de {stats.total} itens
          </Text>
        </View>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${stats.percentage}%` }]} />
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statBox, { backgroundColor: '#EEF2FF' }]}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: '#ECFDF5' }]}>
          <Text style={[styles.statValue, { color: '#16A34A' }]}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Concluídos</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: '#FEF3C7' }]}>
          <Text style={[styles.statValue, { color: '#92400E' }]}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pendentes</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: '#E0F2FE' }]}>
          <Text style={[styles.statValue, { color: '#2563EB' }]}>
            R$ {stats.totalPrice.toFixed(2)}
          </Text>
          <Text style={styles.statLabel}>Estimado</Text>
        </View>
      </View>
    </View>
  );
};

// --- Componente: Card de Adicionar Item (Refatorado para alinhamento) ---

const AddItemCard = ({
  isFormVisible,
  setIsFormVisible,
  itemName,
  setItemName,
  itemCategory,
  setItemCategory,
  itemPrice,
  setItemPrice,
  onAddItem,
  isWide,
  btnHeight,
  btnTextSize,
}) => {
  return (
    <View style={styles.addCard}>
      <View style={styles.addCardHeader}>
        <View style={styles.addGlyph}>
          <Text style={{ color: '#fff' }}>➕</Text>
        </View>
        <Text style={styles.addTitle}>Adicionar Item</Text>
        <TouchableOpacity onPress={() => setIsFormVisible((v) => !v)}>
          <Feather
            name={isFormVisible ? 'chevron-up' : 'chevron-down'}
            size={18}
            color="#6B7280"
          />
        </TouchableOpacity>
      </View>
      {isFormVisible &&
        (isWide ? (
          <View style={{ marginTop: 10 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {/* MUDANÇA: Aplicado height: btnHeight */}
              <TextInput
                style={[styles.input, { flex: 1, height: btnHeight }]}
                placeholder="Nome do item..."
                value={itemName}
                onChangeText={setItemName}
              />
              {/* MUDANÇA: Aplicado height: btnHeight ao wrapper */}
              <View style={[styles.priceWrap, { width: 130, height: btnHeight }]}>
                <Text style={styles.pricePrefix}>R$</Text>
                {/* MUDANÇA: Usado priceTextInput, sem borda/padding extra */}
                <TextInput
                  style={styles.priceTextInput}
                  placeholder="Preço"
                  keyboardType="numeric"
                  value={itemPrice}
                  onChangeText={setItemPrice}
                />
              </View>
            </View>
            <View
              style={{
                flexDirection: 'row',
                gap: 8,
                marginTop: 8,
                alignItems: 'stretch',
              }}
            >
              <View style={[styles.pickerWrap, { flex: 1, height: btnHeight }]}>
                <Picker
                  selectedValue={itemCategory}
                  onValueChange={(v) => setItemCategory(v)}
                  style={[styles.picker, { height: btnHeight }]}
                >
                  <Picker.Item label="Categoria" value="" />
                  {Object.entries(categories).map(([key, cfg]) => (
                    <Picker.Item key={key} label={`${cfg.emoji} ${cfg.name}`} value={key} />
                  ))}
                </Picker>
              </View>
              <TouchableOpacity
                style={[styles.addButton, { width: 140, minHeight: btnHeight }]}
                onPress={onAddItem}
              >
                <Feather name="plus" size={20} color="#fff" />
                <Text
                  style={[
                    styles.addButtonText,
                    { fontSize: btnTextSize, lineHeight: btnTextSize + 4 },
                  ]}
                >
                  Adicionar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.addFormGrid}>
            {/* MUDANÇA: Aplicado height: btnHeight */}
            <TextInput
              style={[styles.input, { height: btnHeight }]}
              placeholder="Nome do item..."
              value={itemName}
              onChangeText={setItemName}
            />
            <View style={[styles.pickerWrap, { height: btnHeight }]}>
              <Picker
                selectedValue={itemCategory}
                onValueChange={(v) => setItemCategory(v)}
                style={[styles.picker, { height: btnHeight }]}
              >
                <Picker.Item label="Categoria" value="" />
                {Object.entries(categories).map(([key, cfg]) => (
                  <Picker.Item key={key} label={`${cfg.emoji} ${cfg.name}`} value={key} />
                ))}
              </Picker>
            </View>
            {/* MUDANÇA: Aplicado height: btnHeight ao wrapper */}
            <View style={[styles.priceWrap, { height: btnHeight }]}>
              <Text style={styles.pricePrefix}>R$</Text>
              {/* MUDANÇA: Usado priceTextInput */}
              <TextInput
                style={styles.priceTextInput}
                placeholder="Preço"
                keyboardType="numeric"
                value={itemPrice}
                onChangeText={setItemPrice}
              />
            </View>
            <TouchableOpacity
              style={[styles.addButton, { minHeight: btnHeight }]}
              onPress={onAddItem}
            >
              <Feather name="plus" size={16} color="#fff" />
              <Text
                style={[
                  styles.addButtonText,
                  { fontSize: btnTextSize, lineHeight: btnTextSize + 4 },
                ]}
              >
                Adicionar
              </Text>
            </TouchableOpacity>
          </View>
        ))}
    </View>
  );
};

// --- Componente: Card da Lista de Itens ---

const ItemsListCard = ({
  items,
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  categoryFilter,
  setCategoryFilter,
  categoryCounts,
  onToggleItem,
  onRemoveItem,
  onEditPrice,
  isNarrow,
  sortWidth,
  chipStyleConfig,
}) => {
  return (
    <View style={styles.itemsCard}>
      {/* Search and Sort (com estilos de alinhamento corrigidos) */}
      <View style={styles.listTopBar}>
        <View style={[styles.searchWrap, isNarrow && { marginRight: 6, paddingHorizontal: 8 }]}>
          <Feather name="search" size={14} color="#9CA3AF" style={{ marginRight: 6 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar..."
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
        <View style={[styles.sortWrap, { width: sortWidth }]}>
          <Picker
            selectedValue={sortBy}
            onValueChange={(v) => setSortBy(v)}
            style={[styles.sortPicker, { width: sortWidth }]}
          >
            <Picker.Item label="A-Z" value="name" />
            <Picker.Item label="Categoria" value="category" />
            <Picker.Item label="Preço" value="price" />
            <Picker.Item label="Status" value="status" />
          </Picker>
        </View>
      </View>

      {/* Category Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        <CategoryFilterChip
          catKey="all"
          name="Todas"
          emoji="📋"
          count={categoryCounts.all || 0}
          isActive={categoryFilter === 'all'}
          onPress={() => setCategoryFilter('all')}
          styleConfig={chipStyleConfig}
        />
        {Object.entries(categories).map(([key, cfg]) => (
          <CategoryFilterChip
            key={key}
            catKey={key}
            name={cfg.name}
            emoji={cfg.emoji}
            count={categoryCounts[key] || 0}
            isActive={categoryFilter === key}
            onPress={() => setCategoryFilter(key)}
            styleConfig={chipStyleConfig}
          />
        ))}
      </ScrollView>

      {/* Items */}
      {items.length === 0 ? (
        <View style={styles.emptyItems}>
          <View style={styles.emptyGlyph}>
            <Text style={{ fontSize: 22 }}>🛒</Text>
          </View>
          <Text style={styles.emptyTitle}>Lista vazia</Text>
          <Text style={styles.emptySubtitle}>Comece adicionando alguns itens à sua lista</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => it.id.toString()}
          renderItem={({ item }) => (
            <ListItem
              item={item}
              onToggle={() => onToggleItem(item.id)}
              onRemove={() => onRemoveItem(item.id)}
              onEditPrice={() => onEditPrice(item)}
              compact={isNarrow}
            />
          )}
          contentContainerStyle={{ padding: 12 }}
        />
      )}
    </View>
  );
};

// --- Componente: Modal de Edição de Preço ---

const PriceEditModal = ({
  visible,
  onClose,
  onSubmit,
  item,
  value,
  setValue,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.4)',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
        }}
      >
        <View
          style={{
            backgroundColor: '#fff',
            width: '100%',
            maxWidth: 360,
            borderRadius: 14,
            padding: 16,
          }}
        >
          <Text style={{ fontWeight: '700', fontSize: 16, color: '#111827' }}>
            Editar Preço
          </Text>
          <Text style={{ color: '#6B7280', marginTop: 4 }}>
            Item: {item?.name || ''}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 12,
              borderWidth: 1,
              borderColor: '#E5E7EB',
              borderRadius: 10,
              paddingHorizontal: 10,
            }}
          >
            <Text style={{ color: '#9CA3AF' }}>R$</Text>
            <TextInput
              autoFocus
              keyboardType="numeric"
              placeholder="0,00"
              style={{ flex: 1, height: 44, marginLeft: 8 }}
              value={value}
              onChangeText={setValue}
            />
          </View>
          <View style={{ flexDirection: 'row', marginTop: 12, gap: 8 }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                flex: 1,
                backgroundColor: '#E5E7EB',
                paddingVertical: 10,
                borderRadius: 10,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#374151', fontWeight: '600' }}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onSubmit}
              style={{
                flex: 1,
                backgroundColor: '#2563EB',
                paddingVertical: 10,
                borderRadius: 10,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '700' }}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// --- Componente: Tela Principal (Contêiner) ---

const ListDetailScreen = ({ route, navigation }) => {
  const { listId } = route.params;
  const { width } = useWindowDimensions();
  const isWide = width >= 420;
  const isNarrow = width < 380;
  const sortWidth = width < 360 ? 110 : 130;

  // Responsive sizing
  const chipStyleConfig = {
    chipHeight: width < 360 ? 34 : 36,
    chipPadV: width < 360 ? 8 : 10,
    chipPadH: width < 360 ? 12 : 14,
    chipLabelSize: width < 360 ? 13 : 14,
    chipCountSize: width < 360 ? 11 : 12,
    labelMaxWidth: Math.floor(width * (width < 360 ? 0.5 : 0.6)),
  };
  const btnHeight = width < 360 ? 44 : 48;
  const btnTextSize = width < 360 ? 15 : 16;

  const [list, setList] = useState(null);
  const [items, setItems] = useState([]);
  const {
    shoppingLists,
    addItemToList,
    updateItemInList,
    removeItemFromList,
    toggleItemCompleted,
    clearCompletedInList,
  } = useContext(DataContext) || {};

  // Estado do formulário
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('');
  const [itemPrice, setItemPrice] = useState('');

  // Estado dos filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal de preço (fallback Android)
  const [priceModalVisible, setPriceModalVisible] = useState(false);
  const [priceEditItem, setPriceEditItem] = useState(null);
  const [priceEditValue, setPriceEditValue] = useState('');

  // Carregar dados da lista (primeiro tenta mocks para compatibilidade; fallback para contexto)
  useEffect(() => {
    let foundList = mockShoppingLists.find((l) => l.id === listId);
    if (!foundList && Array.isArray(shoppingLists)) {
      foundList = shoppingLists.find((l) => String(l.id) === String(listId));
    }
    if (foundList) {
      setList(foundList);
      if (Array.isArray(foundList.items)) {
        // Normaliza itens do contexto para a forma esperada nesta tela
        const mapped = foundList.items.map((it, idx) => ({
          id: it.id || `${foundList.id}-${idx + 1}`,
          name: it.name || 'Item',
          category: it.category || 'outros',
          price: typeof it.price === 'number' ? it.price : null,
          completed: !!(it.isPurchased || it.done || it.completed || it.checked),
          dateAdded: it.createdAt || new Date().toISOString(),
          listId: foundList.id,
        }));
        setItems(mapped);
      } else {
        setItems(generateListItems(foundList));
      }
    }
  }, [listId, shoppingLists]);

  // Lógica de Filtro e Ordenação
  const filteredAndSortedItems = useMemo(() => {
    let filtered = [...items];

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((item) => item.category === categoryFilter);
    }

    if (searchTerm.trim() !== '') {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return (b.price || 0) - (a.price || 0);
        case 'category':
          return (categories[a.category]?.name || '').localeCompare(
            categories[b.category]?.name || '',
          );
        case 'status':
          return a.completed === b.completed ? 0 : a.completed ? 1 : -1;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [items, categoryFilter, searchTerm, sortBy]);

  // Estatísticas
  const stats = useMemo(() => {
    const total = items.length;
    const completed = items.filter((item) => item.completed).length;
    const pending = total - completed;
    const totalPrice = items.reduce((sum, item) => sum + (item.price || 0), 0);
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pending, totalPrice, percentage };
  }, [items]);

  const categoryCounts = useMemo(() => {
    const counts = { all: items.length };
    items.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  }, [items]);

  // --- Funções de Handler ---

  const handleAddItem = () => {
    if (itemName.trim() === '') {
      Alert.alert('Erro', 'Por favor, insira o nome do item.');
      return;
    }
    const priceNum = itemPrice.trim() ? parseFloat(itemPrice) : null;
    if (Array.isArray(shoppingLists)) {
      addItemToList?.(listId, { name: itemName, category: itemCategory || 'outros', price: isNaN(priceNum) ? null : priceNum });
    }
    // Optimistic local update
    const newItem = {
      id: `tmp_${Date.now()}`,
      name: itemName,
      category: itemCategory || 'outros',
      price: isNaN(priceNum) ? null : priceNum,
      completed: false,
      dateAdded: new Date().toISOString(),
      listId,
    };
    setItems([newItem, ...items]);
    setItemName('');
    setItemCategory('');
    setItemPrice('');
  };

  const handleToggleItem = (itemId) => {
    toggleItemCompleted?.(listId, itemId);
    setItems(items.map((item) => (item.id === itemId ? { ...item, completed: !item.completed } : item)));
  };

  const handleRemoveItem = (itemId) => {
    removeItemFromList?.(listId, itemId);
    setItems(items.filter((item) => item.id !== itemId));
  };

  const handleClearCompleted = () => {
    if (stats.completed === 0) return;
    Alert.alert(
      'Limpar Concluídos',
      `Remover ${stats.completed} itens concluídos da lista?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            clearCompletedInList?.(listId);
            setItems(items.filter((item) => !item.completed));
          },
        },
      ],
    );
  };

  const handleEditPrice = (item) => {
    if (Platform.OS === 'ios' && typeof Alert.prompt === 'function') {
      Alert.prompt(
        'Editar Preço',
        `Insira o novo preço para "${item.name}":`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Salvar',
            onPress: (newPrice) => {
              const price = parseFloat(newPrice);
              updateItemInList?.(listId, item.id, { price: isNaN(price) ? null : price });
              setItems(items.map((i) => (i.id === item.id ? { ...i, price: isNaN(price) ? null : price } : i)));
            },
          },
        ],
        'plain-text',
        item.price ? item.price.toString() : '',
        'numeric',
      );
    } else {
      setPriceEditItem(item);
      setPriceEditValue(item.price ? String(item.price) : '');
      setPriceModalVisible(true);
    }
  };

  const handleSubmitPriceModal = () => {
    const price = parseFloat(priceEditValue);
    if (priceEditItem) {
      updateItemInList?.(listId, priceEditItem.id, { price: isNaN(price) ? null : price });
      setItems(items.map((i) => (i.id === priceEditItem.id ? { ...i, price: isNaN(price) ? null : price } : i)));
    }
    setPriceModalVisible(false);
    setPriceEditItem(null);
  };

  // --- Renderização ---

  if (!list) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#6B7280' }}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      <ListHeaderCard
        list={list}
        stats={stats}
        onGoBack={() => navigation.goBack()}
        onClearCompleted={handleClearCompleted}
      />

      <AddItemCard
        isFormVisible={isFormVisible}
        setIsFormVisible={setIsFormVisible}
        itemName={itemName}
        setItemName={setItemName}
        itemCategory={itemCategory}
        setItemCategory={setItemCategory}
        itemPrice={itemPrice}
        setItemPrice={setItemPrice}
        onAddItem={handleAddItem}
        isWide={isWide}
        btnHeight={btnHeight}
        btnTextSize={btnTextSize}
      />

      <ItemsListCard
        items={filteredAndSortedItems}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortBy={sortBy}
        setSortBy={setSortBy}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        categoryCounts={categoryCounts}
        onToggleItem={handleToggleItem}
        onRemoveItem={handleRemoveItem}
        onEditPrice={handleEditPrice}
        isNarrow={isNarrow}
        sortWidth={sortWidth}
        chipStyleConfig={chipStyleConfig}
      />

      <PriceEditModal
        visible={priceModalVisible}
        onClose={() => setPriceModalVisible(false)}
        onSubmit={handleSubmitPriceModal}
        item={priceEditItem}
        value={priceEditValue}
        setValue={setPriceEditValue}
      />
    </SafeAreaView>
  );
};

// --- Estilos (com correções de alinhamento) ---

// MUDANÇA: Criado um estilo base para todos os campos de entrada
const inputContainerBase = {
  borderWidth: 1,
  borderColor: '#D1D5DB',
  borderRadius: 12,
  backgroundColor: '#F9FAFB',
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },

  // ... (Estilos do HeaderCard - Sem mudanças) ...
  headerCard: {
    backgroundColor: '#fff',
    margin: 12,
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    marginRight: 10,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1F2937', lineHeight: 24 },
  headerSubtitle: { color: '#6B7280', marginTop: 2, fontSize: 12, lineHeight: 16 },
  headerActions: { flexDirection: 'row', marginLeft: 8 },
  headerIconBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    marginLeft: 6,
  },
  progressTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressLabel: { color: '#374151', fontSize: 12, fontWeight: '600' },
  progressText: { color: '#6B7280', fontSize: 12 },
  progressBg: {
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 6,
  },
  progressFill: { height: 10, backgroundColor: '#3B82F6' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  statBox: { flexBasis: '48%', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12 },
  statValue: { fontWeight: '800', color: '#111827' },
  statLabel: { color: '#6B7280', fontSize: 12 },

  // Estilos do AddCard
  addCard: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  addCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  addGlyph: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  addTitle: { fontWeight: '700', color: '#111827' },
  addFormGrid: { marginTop: 10, gap: 8 },
  
  // MUDANÇA: 'input' usa o estilo base e define o padding e alinhamento
  input: {
    ...inputContainerBase,
    paddingHorizontal: 12,
    textAlignVertical: 'center', // Mantém para centralizar
    // Removido paddingVertical e lineHeight, a altura será definida por 'btnHeight' no JSX
  },
  // MUDANÇA: 'pickerWrap' usa o estilo base
  pickerWrap: {
    ...inputContainerBase,
    justifyContent: 'center',
    paddingHorizontal: 8,
    // Altura definida por 'btnHeight' no JSX
  },
  // Ajuste de baseline no Android para centralizar o texto do Picker
  picker: { marginTop: Platform.OS === 'android' ? -8 : 0 }, // Estilo do picker em si
  
  // MUDANÇA: 'priceWrap' usa o estilo base
  priceWrap: {
    ...inputContainerBase,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    // Altura definida por 'btnHeight' no JSX
  },
  pricePrefix: { color: '#9CA3AF' },
  // MUDANÇA: Novo estilo para o TextInput de preço (sem borda/bg)
  priceTextInput: {
    flex: 1,
    marginLeft: 6,
    textAlignVertical: 'center',
    // Removemos o paddingVertical para deixar o alinhamento do wrapper funcionar
  },
  
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },

  // Estilos do ItemsListCard
  itemsCard: {
    backgroundColor: '#fff',
    margin: 12,
    borderRadius: 16,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
    flex: 1,
  },
  listTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
    flex: 1,
    marginRight: 8,
  },
  // MUDANÇA: Removido 'paddingVertical: 0' para corrigir alinhamento no Android
  searchInput: {
    flex: 1,
    textAlignVertical: 'center', // Mantido
  },
  sortWrap: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    backgroundColor: '#fff',
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  sortPicker: { height: 40, width: 130, marginTop: Platform.OS === 'android' ? -8 : 0 },
  chipsRow: { paddingHorizontal: 14, paddingTop: 4, paddingBottom: 10, gap: 10 },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
    minHeight: 36,
  },
  categoryChipActive: { backgroundColor: '#2563EB' },
  chipEmoji: { marginRight: 8, textAlignVertical: 'center' },
  chipLabel: {
    color: '#111827',
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 18,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  chipLabelActive: { color: '#FFFFFF' },
  chipCount: {
    marginLeft: 10,
    backgroundColor: 'rgba(255,255,255,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  chipCountActive: { backgroundColor: 'rgba(255,255,255,0.3)' },
  chipCountText: {
    fontSize: 12,
    color: '#1F2937',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  chipCountTextActive: { color: '#FFFFFF' },

  // Estilos do Empty State
  emptyItems: { alignItems: 'center', padding: 16 },
  emptyGlyph: {
    width: 64,
    height: 64,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: { fontWeight: '600', color: '#1F2937' },
  emptySubtitle: { color: '#6B7280', fontSize: 12, marginTop: 2 },

  // Estilos do ListItem (Refatorado)
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginVertical: 6,
  },
  itemCardCompact: {
    flexWrap: 'wrap',
    paddingBottom: 12,
  },
  itemSwitch: { marginRight: 8 },
  itemEmojiContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  itemEmoji: { color: '#fff', fontSize: 18 },
  itemInfo: {
    flex: 1,
    marginRight: 8,
  },
  itemName: { fontWeight: '700', color: '#111827', lineHeight: 18, marginBottom: 2 },
  itemNameCompleted: { textDecorationLine: 'line-through', color: '#9CA3AF' },
  itemPrice: { color: '#059669', fontWeight: '700', fontSize: 12 },
  itemPriceEmpty: { color: '#9CA3AF', fontWeight: '600', fontSize: 12 },
  itemRightColumn: {
    alignItems: 'flex-end',
  },
  itemRightColumnCompact: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    alignItems: 'center',
  },
  itemCategory: { color: '#6B7280', fontSize: 12, marginBottom: 6 },
  itemActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 6,
    marginLeft: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
});

export default ListDetailScreen;