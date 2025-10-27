import { Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
// MELHORIA: Importa 'memo' e 'useCallback'
import React, { memo, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Modal, Platform, ScrollView, StatusBar, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// Certifique-se de que o caminho para seus dados mockados está correto
import Chip from '../components/Chip';
import { useTheme } from '../components/theme';
import { DataContext } from '../contexts/DataContext';
import { categories, generateListItems, mockShoppingLists } from '../data';

// --- Componente: Item da Lista (Layout Melhorado) ---
// (Sem alterações)
const ListItem = ({ item, onToggle, onRemove, onEditPrice, compact }) => {
  const { tokens: t } = useTheme();
  const category = categories[item.category] || categories.outros;

  return (
    <View style={[
      styles.itemCard,
      compact && styles.itemCardCompact,
      { backgroundColor: t.card, borderColor: t.border }
    ]}>
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

      <View style={styles.itemInfo}>
        <Text
          style={[styles.itemName, { color: t.text }, item.completed && styles.itemNameCompleted]}
          numberOfLines={compact ? 1 : 2}
          ellipsizeMode="tail"
        >
          {item.name}
        </Text>
        <Text style={[styles.itemPrice, !item.price && styles.itemPriceEmpty]}>
          {item.price ? `R$ ${item.price.toFixed(2)}` : 'Sem preço'}
        </Text>
      </View>

      <View style={[styles.itemRightColumn, compact && styles.itemRightColumnCompact]}>
        <Text style={[styles.itemCategory, { color: t.muted }]} numberOfLines={1} ellipsizeMode="tail">
          {category.name}
        </Text>
        <View style={styles.itemActions}>
          <TouchableOpacity onPress={onEditPrice} style={[styles.actionButton, { backgroundColor: t.chipBg }]}>
            <Feather name="edit-2" size={16} color="#3B82F6" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onRemove} style={[styles.actionButton, { backgroundColor: t.chipBg }]}>
            <Feather name="trash-2" size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// --- Componente: Chip de Filtro de Categoria ---

// MELHORIA DE PERFORMANCE 1:
// Componente movido para fora do 'ItemsListCard' e envolvido com 'React.memo'
// para evitar re-renderizações desnecessárias.
const CategoryFilterChip = memo(({
  catKey,
  name,
  emoji,
  count,
  isActive,
  onPress,
  styleConfig,
}) => {
  const { tokens: t } = useTheme();
  if (count === 0 && catKey !== 'all') return null;

  const chipStyle = {
    minHeight: styleConfig.chipHeight,
    paddingVertical: styleConfig.chipPadV,
    paddingHorizontal: styleConfig.chipPadH,
  };

  return (
    <Chip
      emoji={catKey !== 'all' ? emoji : undefined}
      label={catKey !== 'all' ? name : 'Todas'}
      active={isActive}
      onPress={onPress}
      style={[chipStyle]}
      textStyle={{
        fontSize: styleConfig.chipLabelSize,
        lineHeight: styleConfig.chipLabelSize + 6,
        includeFontPadding: false,
        maxWidth: styleConfig.labelMaxWidth,
      }}
      count={count}
      accessibilityRole="button"
      accessibilityLabel={catKey !== 'all' ? `${name}. ${count} itens` : `Todas. ${count} itens`}
    />
  );
});

// --- Componente: Cabeçalho da Lista ---
// (Sem alterações)
const ListHeaderCard = ({ list, stats, onGoBack, onClearCompleted }) => {
  const { tokens: t, scheme } = useTheme();
  return (
    <View style={[styles.headerCard, { backgroundColor: t.card, borderColor: t.border, borderWidth: 1 }]}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={onGoBack} style={[styles.backBtn, { backgroundColor: t.chipBg }]}>
          <Feather name="arrow-left" size={20} color="#6B7280" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: t.text }]}>{list.name}</Text>
          <Text style={[styles.headerSubtitle, { color: t.muted }]}>Gerencie seus itens de compra</Text>
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
          <Text style={[styles.progressLabel, { color: t.muted }]}>Progresso da Lista</Text>
          <Text style={[styles.progressText, { color: t.muted }]}>
            {stats.completed} de {stats.total} itens
          </Text>
        </View>
        <View style={[styles.progressBg, { backgroundColor: scheme === 'dark' ? '#2A2F33' : '#E5E7EB' }]}>
          <View style={[styles.progressFill, { width: `${stats.percentage}%` }]} />
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statBox, { backgroundColor: scheme === 'dark' ? '#1F2430' : '#EEF2FF' }]}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={[styles.statLabel, { color: t.muted }]}>Total</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: scheme === 'dark' ? '#14221C' : '#ECFDF5' }]}>
          <Text style={[styles.statValue, { color: '#16A34A' }]}>{stats.completed}</Text>
          <Text style={[styles.statLabel, { color: t.muted }]}>Concluídos</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: scheme === 'dark' ? '#2A2416' : '#FEF3C7' }]}>
          <Text style={[styles.statValue, { color: '#92400E' }]}>{stats.pending}</Text>
          <Text style={[styles.statLabel, { color: t.muted }]}>Pendentes</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: scheme === 'dark' ? '#0E2436' : '#E0F2FE' }]}>
          <Text style={[styles.statValue, { color: '#2563EB' }]}>
            R$ {stats.totalPrice.toFixed(2)}
          </Text>
          <Text style={[styles.statLabel, { color: t.muted }]}>Estimado</Text>
        </View>
      </View>
    </View>
  );
};

// --- Componente: Card de Adicionar Item (Refatorado para alinhamento) ---
// (Sem alterações)
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
  const { tokens: t } = useTheme();
  const pickerH = Math.round((btnHeight || 50) + 8);
  const pickerFont = btnHeight <= 48 ? 13 : 14;
  return (
    <View style={[styles.addCard, { backgroundColor: t.card }]}>
      <View style={styles.addCardHeader}>
        <View style={styles.addGlyph}>
          <Text style={{ color: '#fff' }}>➕</Text>
        </View>
        <Text style={[styles.addTitle, { color: t.text }]}>Adicionar Item</Text>
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
              <TextInput
                style={[styles.input, { flex: 1, height: btnHeight, backgroundColor: t.inputBg, borderColor: t.border, color: t.text }]}
                placeholder="Nome do item..."
                placeholderTextColor="#9CA3AF"
                value={itemName}
                onChangeText={setItemName}
              />
              <View style={[styles.priceWrap, { width: 130, height: btnHeight, backgroundColor: t.inputBg, borderColor: t.border }]}>
                <Text style={styles.pricePrefix}>R$</Text>
                <TextInput
                  style={[styles.priceTextInput, { color: t.text }]}
                  placeholder="Preço"
                  placeholderTextColor="#9CA3AF"
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
              <View style={[styles.pickerWrap, { flex: 1, height: pickerH, backgroundColor: t.inputBg, borderColor: t.border }]}>
                <Picker
                  selectedValue={itemCategory}
                  onValueChange={(v) => setItemCategory(v)}
                  style={[styles.picker, { height: pickerH, color: t.text, fontSize: pickerFont }]}
                  itemStyle={Platform.OS === 'ios' ? { fontSize: pickerFont } : undefined}
                  dropdownIconColor={t.text}
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
                <Feather name="plus" size={btnTextSize + 2} color="#fff" style={{ marginTop: Platform.OS === 'android' ? -1 : 0 }} />
                <Text
                  style={[
                    styles.addButtonText,
                    { fontSize: btnTextSize, lineHeight: btnTextSize + 6 },
                  ]}
                >
                  Adicionar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.addFormGrid}>
            <TextInput
              style={[styles.input, { height: btnHeight, backgroundColor: t.inputBg, borderColor: t.border, color: t.text }]}
              placeholder="Nome do item..."
              placeholderTextColor="#9CA3AF"
              value={itemName}
              onChangeText={setItemName}
            />
            <View style={[styles.pickerWrap, { height: pickerH, backgroundColor: t.inputBg, borderColor: t.border }]}>
              <Picker
                selectedValue={itemCategory}
                onValueChange={(v) => setItemCategory(v)}
                style={[styles.picker, { height: pickerH, color: t.text, fontSize: pickerFont }]}
                itemStyle={Platform.OS === 'ios' ? { fontSize: pickerFont } : undefined}
                dropdownIconColor={t.text}
              >
                <Picker.Item label="Categoria" value="" />
                {Object.entries(categories).map(([key, cfg]) => (
                  <Picker.Item key={key} label={`${cfg.emoji} ${cfg.name}`} value={key} />
                ))}
              </Picker>
            </View>
            <View style={[styles.priceWrap, { height: btnHeight, backgroundColor: t.inputBg, borderColor: t.border }]}>
              <Text style={styles.pricePrefix}>R$</Text>
              <TextInput
                style={[styles.priceTextInput, { color: t.text }]}
                placeholder="Preço"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={itemPrice}
                onChangeText={setItemPrice}
              />
            </View>
            <TouchableOpacity
              style={[styles.addButton, { minHeight: btnHeight }]}
              onPress={onAddItem}
            >
              <Feather name="plus" size={btnTextSize + 2} color="#fff" style={{ marginTop: Platform.OS === 'android' ? -1 : 0 }} />
              <Text
                style={[
                  styles.addButtonText,
                  { fontSize: btnTextSize, lineHeight: btnTextSize + 6 },
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
  // MELHORIA DE LÓGICA 2: Props alteradas para seleção única
  activeCategory,
  onCategoryPress,
  categoryCounts,
  onToggleItem,
  onRemoveItem,
  onEditPrice,
  isNarrow,
  sortWidth,
  chipStyleConfig,
  btnHeight,
}) => {
  const { tokens: t } = useTheme();

  // A lógica de clique (handlePressAll, handleToggleCategory) foi removida daqui
  // e centralizada na tela principal (ListDetailScreen) com 'useCallback'.

  return (
    <View style={[styles.itemsCard, { backgroundColor: t.card }]}>
      {/* Search and Sort (com estilos de alinhamento corrigidos) */}
      <View style={styles.listTopBar}>
        <View style={[styles.searchWrap, { backgroundColor: t.inputBg, borderColor: t.border }, isNarrow && { marginRight: 6, paddingHorizontal: 8 }]}>
          <Feather name="search" size={14} color="#9CA3AF" style={{ marginRight: 6 }} />
          <TextInput
            style={[styles.searchInput, { color: t.text }]}
            placeholder="Buscar..."
            placeholderTextColor="#9CA3AF"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
        <View style={[styles.sortWrap, { width: sortWidth, backgroundColor: t.inputBg, borderColor: t.border, minHeight: btnHeight }]}>
          <Picker
            selectedValue={sortBy}
            onValueChange={(v) => setSortBy(v)}
            style={[styles.sortPicker, { color: t.text }]}
            dropdownIconColor="#111827"
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
          // MELHORIA DE LÓGICA 3: Verificação de 'ativo' simplificada
          isActive={activeCategory === 'all'}
          onPress={() => onCategoryPress('all')}
          styleConfig={chipStyleConfig}
        />
        {Object.entries(categories).map(([key, cfg]) => (
          <CategoryFilterChip
            key={key}
            catKey={key}
            name={cfg.name}
            emoji={cfg.emoji}
            count={categoryCounts[key] || 0}
            // MELHORIA DE LÓGICA 4: Verificação de 'ativo' simplificada
            isActive={activeCategory === key}
            onPress={() => onCategoryPress(key)}
            styleConfig={chipStyleConfig}
          />
        ))}
      </ScrollView>

      {/* Items */}
      {items.length === 0 ? (
        <View style={styles.emptyItems}>
          <View style={[styles.emptyGlyph, { backgroundColor: t.chipBg }]}>
            <Text style={{ fontSize: 22 }}>🛒</Text>
          </View>
          <Text style={[styles.emptyTitle, { color: t.text }]}>Lista vazia</Text>
          <Text style={[styles.emptySubtitle, { color: t.muted }]}>Comece adicionando alguns itens à sua lista</Text>
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
// (Sem alterações)
const PriceEditModal = ({
  visible,
  onClose,
  onSubmit,
  item,
  value,
  setValue,
  btnHeight,
  btnTextSize,
}) => {
  const { tokens: t } = useTheme();
  const h = typeof btnHeight === 'number' ? btnHeight : 48;
  const ts = typeof btnTextSize === 'number' ? btnTextSize : 16;
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
            backgroundColor: t.card,
            width: '100%',
            maxWidth: 360,
            borderRadius: 14,
            padding: 16,
          }}
        >
          <Text style={{ fontWeight: '700', fontSize: 16, color: t.text }}>
            Editar Preço
          </Text>
          <Text style={{ color: t.muted, marginTop: 4 }}>
            Item: {item?.name || ''}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 12,
              borderWidth: 1,
              borderColor: t.border,
              borderRadius: 10,
              paddingHorizontal: 10,
              backgroundColor: t.inputBg,
            }}
          >
            <Text style={{ color: '#9CA3AF' }}>R$</Text>
            <TextInput
              autoFocus
              keyboardType="numeric"
              placeholder="0,00"
              placeholderTextColor="#9CA3AF"
              style={{ flex: 1, height: 44, marginLeft: 8, color: t.text }}
              value={value}
              onChangeText={setValue}
            />
          </View>
          <View style={{ flexDirection: 'row', marginTop: 12, gap: 8 }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                flex: 1,
                backgroundColor: t.chipBg,
                minHeight: h,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: t.text, fontWeight: '700', fontSize: ts, lineHeight: ts + 6, includeFontPadding: false }}>
                Cancelar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onSubmit}
              style={{
                flex: 1,
                backgroundColor: '#2563EB',
                minHeight: h,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: ts, lineHeight: ts + 6, includeFontPadding: false }}>
                Salvar
              </Text>
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
  const { width, fontScale } = useWindowDimensions();
  const { tokens: t, scheme } = useTheme();
  // (Cálculos de responsividade - sem alterações)
  const isWide = width >= 420;
  const isNarrow = width < 380;
  const sortWidth = Math.max(100, Math.min(180, Math.floor(width * 0.35)));
  const baseLabelSize = width < 360 ? 13 : 14;
  const scaledLabelSize = Math.max(12, Math.round(baseLabelSize * Math.min(fontScale || 1, 1.2)));
  const lineH = scaledLabelSize + 6;
  const chipPadV = Math.max(6, Math.round(scaledLabelSize * 0.6));
  const chipPadH = Math.max(10, Math.round(scaledLabelSize * 0.9));
  const chipHeight = Math.max(34, Math.round(lineH + chipPadV * 2));
  const chipCountSize = Math.max(10, scaledLabelSize - 2);
  const chipStyleConfig = {
    chipHeight,
    chipPadV,
    chipPadH,
    chipLabelSize: scaledLabelSize,
    chipCountSize,
    labelMaxWidth: Math.floor(width * (width < 360 ? 0.5 : 0.6)),
  };
  const btnHeight = width < 340 ? 44 : width < 380 ? 48 : 50;
  const btnTextSize = width < 360 ? 16 : 17;

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
  
  // MELHORIA DE LÓGICA 5: Estado mudou de array (categoryFilters) para string (activeCategory)
  const [activeCategory, setActiveCategory] = useState('all');

  // Modal de preço
  const [priceModalVisible, setPriceModalVisible] = useState(false);
  const [priceEditItem, setPriceEditItem] = useState(null);
  const [priceEditValue, setPriceEditValue] = useState('');

  // Carregar dados da lista (sem alterações)
  useEffect(() => {
    let foundList = mockShoppingLists.find((l) => l.id === listId);
    if (!foundList && Array.isArray(shoppingLists)) {
      foundList = shoppingLists.find((l) => String(l.id) === String(listId));
    }
    if (foundList) {
      setList(foundList);
      if (Array.isArray(foundList.items)) {
        // Normaliza itens do contexto
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

    // MELHORIA DE LÓGICA 6: Lógica de filtro simplificada para seleção única
    if (activeCategory !== 'all') {
      filtered = filtered.filter((item) => item.category === activeCategory);
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
  }, [items, activeCategory, searchTerm, sortBy]); // Dependência atualizada

  // Estatísticas (sem alterações)
  const stats = useMemo(() => {
    const total = items.length;
    const completed = items.filter((item) => item.completed).length;
    const pending = total - completed;
    const totalPrice = items.reduce((sum, item) => sum + (item.price || 0), 0);
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pending, totalPrice, percentage };
  }, [items]);

  // Contagem de categorias (sem alterações)
  const categoryCounts = useMemo(() => {
    const counts = { all: items.length };
    items.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  }, [items]);

  // --- Funções de Handler ---

  // MELHORIA DE PERFORMANCE 2: 'useCallback' para o handler de clique do chip.
  // Isso garante que a função não seja recriada e evita que os
  // chips memoizados (CategoryFilterChip) sejam renderizados novamente.
  const handleCategoryPress = useCallback((key) => {
    setActiveCategory(key);
  }, []); // Sem dependências, a função é criada apenas uma vez.

  // (Handlers restantes - sem alterações)
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
      <SafeAreaView style={[styles.safeArea, { backgroundColor: t.background }]}>
        <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={t.background} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: t.muted }}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: t.background }]}>
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={t.background} />

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
        // MELHORIA DE LÓGICA 7: Passando as novas props para o card
        activeCategory={activeCategory}
        onCategoryPress={handleCategoryPress}
        categoryCounts={categoryCounts}
        onToggleItem={handleToggleItem}
        onRemoveItem={handleRemoveItem}
        onEditPrice={handleEditPrice}
        isNarrow={isNarrow}
        sortWidth={sortWidth}
        chipStyleConfig={chipStyleConfig}
        btnHeight={btnHeight}
      />

      <PriceEditModal
        visible={priceModalVisible}
        onClose={() => setPriceModalVisible(false)}
        onSubmit={handleSubmitPriceModal}
        item={priceEditItem}
        value={priceEditValue}
        setValue={setPriceEditValue}
        btnHeight={btnHeight}
        btnTextSize={btnTextSize}
      />
    </SafeAreaView>
  );
};

// --- Estilos (com correções de alinhamento) ---
// (Sem alterações)
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
    marginBottom: 12,
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
  
  input: {
    ...inputContainerBase,
    paddingHorizontal: 12,
    color: '#111827',
    textAlignVertical: 'center',
  },
  pickerWrap: {
    ...inputContainerBase,
    minWidth: 0,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  picker: { flex: 1, width: '100%', minWidth: 0, marginTop: Platform.OS === 'android' ? -2 : 0, color: '#111827' },
  
  priceWrap: {
    ...inputContainerBase,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  pricePrefix: { color: '#9CA3AF' },
  priceTextInput: {
    flex: 1,
    marginLeft: 6,
    color: '#111827',
    textAlignVertical: 'center',
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
    height: 44,
    flex: 1,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    textAlignVertical: 'center',
    color: '#111827',
  },
  sortWrap: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    backgroundColor: '#fff',
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  sortPicker: { flex: 1, width: '100%', minWidth: 0, height: '100%', marginTop: Platform.OS === 'android' ? -2 : 0, color: '#111827' },
  chipsRow: { paddingHorizontal: 14, paddingTop: 4, paddingBottom: 10, gap: 10 },
  
  // (Estilos antigos 'categoryChip', 'chipLabel', 'chipCount' não são mais usados
  // pois o componente 'Chip' genérico cuida disso)

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
  itemName: { fontWeight: '700', color: '#111827', lineHeight: 18, marginBottom: 2, flexShrink: 1, includeFontPadding: false },
  itemNameCompleted: { textDecorationLine: 'line-through', color: '#9CA3AF' },
  itemPrice: { color: '#059669', fontWeight: '700', fontSize: 12, includeFontPadding: false },
  itemPriceEmpty: { color: '#9CA3AF', fontWeight: '600', fontSize: 12, includeFontPadding: false },
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
  itemCategory: { color: '#6B7280', fontSize: 12, marginBottom: 6, includeFontPadding: false },
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