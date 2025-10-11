import * as Haptics from 'expo-haptics';
import React from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import useFontScale from '../hooks/useFontScale';
import Button from './Button';
import { CategoryIcon } from './Icons';

// Categorias da LISTA (mantidas separadas das categorias de itens)
const LIST_CATEGORIES = [
  { key: 'alimentos', label: 'Alimentos' },
  { key: 'limpeza', label: 'Limpeza' },
  { key: 'tecnologia', label: 'Tecnologia' },
  { key: 'vestuario', label: 'Vestuário' },
  { key: 'moveis', label: 'Móveis' },
  { key: 'outros', label: 'Outros' },
];

// Categorias por ITEM (igual lógica usada na tela de detalhes)
const ITEM_CATEGORIES = {
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

export default function AddListModal({ visible, onClose, onCreate }) {
  const fs = useFontScale();
  const { height } = Dimensions.get('window');
  const cardMaxHeight = Math.min(height * 0.9, 720);
  const listMaxHeight = Math.max(140, Math.min(260, Math.round(160 * fs)));

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.3)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 12,
    },
    card: {
      backgroundColor: 'white',
      borderRadius: 16,
      padding: Math.round(24 * Math.max(0.9, fs)),
      width: '85%',
      maxHeight: cardMaxHeight,
      elevation: 5,
    },
    title: {
      fontSize: 20 * fs,
      fontWeight: 'bold',
      marginBottom: 16,
      textAlign: 'center',
      color: '#111827',
    },
    errorText: {
      color: '#ef4444',
      marginTop: -6,
      marginBottom: 10,
      fontSize: 13 * fs,
      textAlign: 'center',
    },
    input: {
      backgroundColor: '#F3F4F6',
      padding: 12,
      borderRadius: 8,
      marginBottom: 12,
      fontSize: 16 * fs,
      color: '#111827',
    },
    label: {
      fontWeight: 'bold',
      marginBottom: 4,
      marginTop: 8,
      fontSize: 14 * fs,
      color: '#111827',
    },
    categoryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
      flexWrap: 'wrap',
    },
    categoryButton: {
      backgroundColor: '#fff',
      borderRadius: 12,
      paddingVertical: 10,
      paddingHorizontal: 12,
      alignItems: 'center',
      flexDirection: 'column',
      marginRight: 6,
      marginBottom: 6,
      minHeight: 44,
      alignSelf: 'flex-start',
    },
    categoryButtonActive: {
      backgroundColor: '#EEF2FF',
      borderWidth: 1,
      borderColor: '#6366F1',
    },
    categoryLabel: {
      fontSize: 12 * fs,
      color: '#222',
      textAlign: 'center',
      marginTop: 6,
    },
    categoryLabelActive: {
      color: '#4f46e5',
      fontWeight: '600',
    },
    productRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    addProductButton: {
      backgroundColor: '#4f46e5',
      borderRadius: 8,
      padding: 10,
      marginLeft: 4,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 44,
      minHeight: 44,
      alignSelf: 'flex-start',
    },
    addProductText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 18 * fs,
      marginTop: -1,
    },
    productItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fff',
      borderRadius: 14,
      padding: 10,
      marginBottom: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 1,
    },
    qtyBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fff',
      borderRadius: 8,
      marginHorizontal: 6,
    },
    itemCatPill: {
      backgroundColor: '#EEF2FF',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
      marginRight: 6,
    },
    swipeDelete: {
      width: 86,
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 4,
      borderRadius: 14,
      backgroundColor: '#EF4444',
    },
    swipeDeleteText: { color: '#fff', fontWeight: '700', fontSize: 13 * fs },
    swipeEdit: {
      width: 86,
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 4,
      borderRadius: 14,
      backgroundColor: '#3B82F6',
    },
    itemName: { flex: 1, fontWeight: '600', color: '#111827', fontSize: 14 * fs },
    inlinePriceBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F1F5F9',
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 4,
      marginLeft: 6,
    },
    inlinePriceText: { color: '#1D4ED8', fontWeight: '700', fontSize: 13 * fs },
    inlinePriceInput: { minWidth: 64, paddingVertical: 0, color: '#111827', fontSize: 14 * fs },
    qtyBtn: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      minWidth: 34,
      minHeight: 34,
      alignItems: 'center',
      justifyContent: 'center',
    },
    qtyBtnText: {
      fontSize: 18 * fs,
      color: '#111827',
    },
    qtyValue: {
      minWidth: 24,
      textAlign: 'center',
      fontWeight: '600',
      color: '#111827',
      fontSize: 14 * fs,
    },
    priceBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fff',
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 6,
      marginLeft: 6,
    },
    pricePrefix: {
      color: '#6B7280',
      marginRight: 4,
      fontSize: 14 * fs,
    },
    priceInput: {
      minWidth: 56,
      paddingVertical: 2,
      color: '#111827',
      fontSize: 14 * fs,
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 12,
      marginTop: 12,
    },
    totalsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    totalsText: {
      color: '#111827',
      fontWeight: '600',
      fontSize: 14 * fs,
    },
  });

  const [name, setName] = React.useState('');
  const [desc, setDesc] = React.useState('');
  const [category, setCategory] = React.useState(LIST_CATEGORIES[0].key); // categoria da lista
  const [itemCategory, setItemCategory] = React.useState('outros'); // categoria do novo item
  const [products, setProducts] = React.useState([]);
  const [productName, setProductName] = React.useState('');
  const [productQty, setProductQty] = React.useState('1');
  const [productPrice, setProductPrice] = React.useState('');
  const [nameError, setNameError] = React.useState('');
  const [productError, setProductError] = React.useState('');
  const [editingItemId, setEditingItemId] = React.useState(null);
  const [editingItemName, setEditingItemName] = React.useState('');

  const normalizeNumber = (val) => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    const n = parseFloat(String(val).replace(/,/g, '.'));
    return isNaN(n) ? 0 : n;
  };

  const productsCount = products.length;
  const estimatedTotal = products.reduce(
    (sum, p) => sum + normalizeNumber(p.price) * (parseInt(p.quantity) || 1),
    0,
  );

  const validateName = (v) => {
    if (!v || v.trim().length < 3) {
      setNameError('Informe um nome com ao menos 3 caracteres.');
      return false;
    }
    setNameError('');
    return true;
  };

  const handleAddProduct = () => {
    if (!productName.trim()) return;
    if (productPrice && normalizeNumber(productPrice) <= 0) {
      setProductError('Preço deve ser maior que zero ou deixe vazio.');
      return;
    }
    setProductError('');
    setProducts((prev) => [
      ...prev,
      {
        id: `prod_${Date.now()}_${Math.random()}`,
        name: productName.trim(),
        quantity: parseInt(productQty) || 1,
        price: normalizeNumber(productPrice),
        category: itemCategory,
        isPurchased: false,
        createdAt: new Date().toISOString(),
      },
    ]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setProductName('');
    setProductQty('1');
    setProductPrice('');
  };

  const handleRemoveProduct = (id) => {
    setProducts(products.filter((p) => p.id !== id));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleIncQty = (id) => {
    setProducts((p) =>
      p.map((item) =>
        item.id === id ? { ...item, quantity: (parseInt(item.quantity) || 1) + 1 } : item,
      ),
    );
    Haptics.selectionAsync();
  };
  const handleDecQty = (id) => {
    setProducts((p) =>
      p.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, (parseInt(item.quantity) || 1) - 1) }
          : item,
      ),
    );
    Haptics.selectionAsync();
  };
  const handlePriceChange = (id, val) => {
    setProducts((p) =>
      p.map((item) => (item.id === id ? { ...item, price: normalizeNumber(val) } : item)),
    );
  };

  const canCreate = name.trim().length >= 3 && !productError;

  const handleCreate = () => {
    if (!validateName(name)) return;
    // Normaliza itens para mesmo formato usado na tela de detalhes
    const preparedItems = products.map((p) => ({
      ...p,
      quantity: String(p.quantity || 1),
      price: Number(p.price) || 0,
    }));
    onCreate({ name: name.trim(), desc: desc.trim(), category, items: preparedItems });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setName('');
    setDesc('');
    setCategory(LIST_CATEGORIES[0].key);
    setProducts([]);
    setProductName('');
    setProductQty('1');
    setProductPrice('');
    setItemCategory('outros');
    onClose();
  };

  const beginEditItemName = (item) => {
    setEditingItemId(item.id);
    setEditingItemName(item.name);
  };
  const commitEditItemName = () => {
    if (!editingItemId) return;
    setProducts((p) =>
      p.map((it) =>
        it.id === editingItemId ? { ...it, name: editingItemName.trim() || it.name } : it,
      ),
    );
    setEditingItemId(null);
    setEditingItemName('');
    Haptics.selectionAsync();
  };
  const clearAllItems = () => {
    if (products.length === 0) return;
    setProducts([]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.card}>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Nova Lista de Compras</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome da lista"
              value={name}
              onChangeText={(v) => {
                setName(v);
                if (nameError) validateName(v);
              }}
            />
            {!!nameError && <Text style={styles.errorText}>{nameError}</Text>}
            <TextInput
              style={styles.input}
              placeholder="Descrição (opcional)"
              value={desc}
              onChangeText={setDesc}
            />
            <Text style={styles.label}>Categoria da Lista</Text>
            <View style={styles.categoryRow}>
              {LIST_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  style={[
                    styles.categoryButton,
                    category === cat.key && styles.categoryButtonActive,
                  ]}
                  onPress={() => setCategory(cat.key)}
                  activeOpacity={0.85}
                >
                  <CategoryIcon type={cat.key} size={40} neutral />
                  <Text
                    style={[
                      styles.categoryLabel,
                      category === cat.key && styles.categoryLabelActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Categoria do Item</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 4, paddingRight: 6 }}
            >
              {Object.entries(ITEM_CATEGORIES).map(([key, cfg]) => (
                <TouchableOpacity
                  key={key}
                  onPress={() => setItemCategory(key)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: itemCategory === key ? '#4f46e5' : '#fff',
                    borderWidth: 1,
                    borderColor: itemCategory === key ? '#4f46e5' : '#e5e7eb',
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 12,
                    marginRight: 8,
                  }}
                  activeOpacity={0.85}
                >
                  <Text
                    style={{
                      color: itemCategory === key ? '#fff' : '#111827',
                      fontWeight: '600',
                      fontSize: 13 * fs,
                    }}
                  >
                    {cfg.emoji} {cfg.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={[styles.label, { marginTop: 4 }]}>Adicionar Produtos</Text>
            <View style={styles.productRow}>
              <TextInput
                style={[styles.input, { flex: 2, marginRight: 4 }]}
                placeholder="Nome do produto"
                value={productName}
                onChangeText={setProductName}
              />
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 4 }]}
                placeholder="Qtd."
                value={productQty}
                onChangeText={setProductQty}
                keyboardType="number-pad"
              />
              <TextInput
                style={[
                  styles.input,
                  { flex: 1, borderColor: productError ? '#ef4444' : '#E5E7EB', borderWidth: 1 },
                ]}
                placeholder="Preço"
                value={productPrice}
                onChangeText={setProductPrice}
                keyboardType="numeric"
              />
              <Button
                title="+"
                onPress={handleAddProduct}
                style={[
                  styles.addProductButton,
                  { minHeight: 44, minWidth: 44, paddingVertical: 10, paddingHorizontal: 10 },
                ]}
                textStyle={{ fontSize: 18 * fs }}
              />
            </View>
            {!!productError && (
              <Text
                style={{
                  color: '#ef4444',
                  marginTop: -4,
                  marginBottom: 8,
                  fontSize: 12 * fs,
                  textAlign: 'center',
                }}
              >
                {productError}
              </Text>
            )}
            {products.length > 0 && (
              <TouchableOpacity
                onPress={clearAllItems}
                activeOpacity={0.8}
                style={{ alignSelf: 'flex-end', marginBottom: 6 }}
              >
                <Text style={{ color: '#ef4444', fontSize: 12 * fs, fontWeight: '600' }}>
                  Limpar todos
                </Text>
              </TouchableOpacity>
            )}

            <View style={styles.totalsRow}>
              <Text style={styles.totalsText}>
                {productsCount} {productsCount === 1 ? 'produto' : 'produtos'}
              </Text>
              <Text style={styles.totalsText}>Estimado: R$ {estimatedTotal.toFixed(2)}</Text>
            </View>

            <FlatList
              data={products}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const cat = ITEM_CATEGORIES[item.category] || ITEM_CATEGORIES.outros;
                const renderRight = (progress, dragX) => {
                  const scale = dragX.interpolate({
                    inputRange: [-90, 0],
                    outputRange: [1, 0.7],
                    extrapolate: 'clamp',
                  });
                  const opacity = progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.4, 1],
                  });
                  return (
                    <Animated.View
                      style={[styles.swipeDelete, { transform: [{ scale }], opacity }]}
                    >
                      <Text style={styles.swipeDeleteText}>Remover</Text>
                    </Animated.View>
                  );
                };
                return (
                  <Swipeable
                    renderRightActions={renderRight}
                    rightThreshold={40}
                    overshootRight={false}
                    onSwipeableOpen={(dir) => {
                      if (dir === 'right') handleRemoveProduct(item.id);
                    }}
                  >
                    <View style={styles.productItem}>
                      <View style={styles.itemCatPill}>
                        <Text style={{ fontSize: 13 * fs }}>{cat.emoji}</Text>
                      </View>
                      {editingItemId === item.id ? (
                        <TextInput
                          style={[
                            styles.itemName,
                            { backgroundColor: '#F1F5F9', paddingHorizontal: 6, borderRadius: 8 },
                          ]}
                          value={editingItemName}
                          onChangeText={setEditingItemName}
                          onBlur={commitEditItemName}
                          returnKeyType="done"
                          onSubmitEditing={commitEditItemName}
                          autoFocus
                        />
                      ) : (
                        <TouchableOpacity
                          onPress={() => beginEditItemName(item)}
                          activeOpacity={0.7}
                          style={{ flex: 1 }}
                        >
                          <Text style={styles.itemName} numberOfLines={2}>
                            {item.name}
                          </Text>
                        </TouchableOpacity>
                      )}
                      <View style={styles.qtyBox}>
                        <TouchableOpacity
                          onPress={() => handleDecQty(item.id)}
                          style={styles.qtyBtn}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.qtyBtnText}>-</Text>
                        </TouchableOpacity>
                        <Text style={styles.qtyValue}>{item.quantity}</Text>
                        <TouchableOpacity
                          onPress={() => handleIncQty(item.id)}
                          style={styles.qtyBtn}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.qtyBtnText}>+</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.inlinePriceBox}>
                        <Text style={{ color: '#64748B', marginRight: 4, fontSize: 12 * fs }}>
                          R$
                        </Text>
                        <TextInput
                          style={styles.inlinePriceInput}
                          value={String(item.price || '')}
                          onChangeText={(v) => handlePriceChange(item.id, v)}
                          keyboardType="numeric"
                        />
                      </View>
                    </View>
                  </Swipeable>
                );
              }}
              ListEmptyComponent={
                <Text
                  style={{
                    color: '#6B7280',
                    textAlign: 'center',
                    marginVertical: 4,
                    fontSize: 13 * fs,
                  }}
                >
                  Nenhum produto adicionado.
                </Text>
              }
              style={{ maxHeight: listMaxHeight, marginBottom: 8 }}
            />

            <View style={styles.buttonRow}>
              <Button variant="danger" title="Cancelar" onPress={onClose} />
              <Button
                variant={canCreate ? 'primary' : 'gray'}
                title="Criar"
                onPress={handleCreate}
                disabled={!canCreate}
              />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
