import React from 'react';
import { FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { CategoryIcon } from './Icons';

const CATEGORIES = [
  { key: 'alimentos', label: 'Alimentos' },
  { key: 'limpeza', label: 'Limpeza' },
  { key: 'tecnologia', label: 'Tecnologia' },
  { key: 'vestuario', label: 'Vestuário' },
  { key: 'moveis', label: 'Móveis' },
  { key: 'outros', label: 'Outros' },
];

export default function AddListModal({ visible, onClose, onCreate }) {
  const [name, setName] = React.useState('');
  const [desc, setDesc] = React.useState('');
  const [category, setCategory] = React.useState(CATEGORIES[0].key);
  const [products, setProducts] = React.useState([]);
  const [productName, setProductName] = React.useState('');
  const [productQty, setProductQty] = React.useState('1');
  const [productPrice, setProductPrice] = React.useState('');
  const [nameError, setNameError] = React.useState('');

  const normalizeNumber = (val) => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    const n = parseFloat(String(val).replace(/,/g, '.'));
    return isNaN(n) ? 0 : n;
  };

  const productsCount = products.length;
  const estimatedTotal = products.reduce((sum, p) => sum + normalizeNumber(p.price) * (parseInt(p.quantity) || 1), 0);

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
    setProducts((prev) => [
      ...prev,
      {
        id: `prod_${Date.now()}_${Math.random()}`,
        name: productName.trim(),
        quantity: parseInt(productQty) || 1,
        price: normalizeNumber(productPrice),
        category,
      },
    ]);
    setProductName('');
    setProductQty('1');
    setProductPrice('');
  };

  const handleRemoveProduct = (id) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const handleIncQty = (id) => {
    setProducts(p => p.map(item => item.id === id ? { ...item, quantity: (parseInt(item.quantity) || 1) + 1 } : item));
  };
  const handleDecQty = (id) => {
    setProducts(p => p.map(item => item.id === id ? { ...item, quantity: Math.max(1, (parseInt(item.quantity) || 1) - 1) } : item));
  };
  const handlePriceChange = (id, val) => {
    setProducts(p => p.map(item => item.id === id ? { ...item, price: normalizeNumber(val) } : item));
  };

  const canCreate = name.trim().length >= 3;

  const handleCreate = () => {
    if (!validateName(name)) return;
    onCreate({
      name: name.trim(),
      desc: desc.trim(),
      category,
      items: products,
    });
    setName('');
    setDesc('');
    setCategory(CATEGORIES[0].key);
    setProducts([]);
    setProductName('');
    setProductQty('1');
    setProductPrice('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Nova Lista de Compras</Text>
          <TextInput
            style={styles.input}
            placeholder="Nome da lista"
            value={name}
            onChangeText={(v) => { setName(v); if (nameError) validateName(v); }}
          />
          {!!nameError && <Text style={styles.errorText}>{nameError}</Text>}
          <TextInput
            style={styles.input}
            placeholder="Descrição (opcional)"
            value={desc}
            onChangeText={setDesc}
          />
          <Text style={styles.label}>Categoria</Text>
          <View style={styles.categoryRow}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.key}
                style={[styles.categoryButton, category === cat.key && styles.categoryButtonActive]}
                onPress={() => setCategory(cat.key)}
                activeOpacity={0.85}
              >
                <CategoryIcon type={cat.key} size={40} />
                <Text style={[styles.categoryLabel, category === cat.key && styles.categoryLabelActive]}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Adicionar Produtos</Text>
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
              style={[styles.input, { flex: 1 }]}
              placeholder="Preço"
              value={productPrice}
              onChangeText={setProductPrice}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.addProductButton} onPress={handleAddProduct} activeOpacity={0.85}>
              <Text style={styles.addProductText}>+</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.totalsRow}>
            <Text style={styles.totalsText}>{productsCount} {productsCount === 1 ? 'produto' : 'produtos'}</Text>
            <Text style={styles.totalsText}>Estimado: R$ {estimatedTotal.toFixed(2)}</Text>
          </View>

          <FlatList
            data={products}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.productItem}>
                <Text style={{ flex: 2, fontWeight: '600', color: '#111827' }}>{item.name}</Text>
                <View style={styles.qtyBox}>
                  <TouchableOpacity onPress={() => handleDecQty(item.id)} style={styles.qtyBtn} activeOpacity={0.7}><Text style={styles.qtyBtnText}>-</Text></TouchableOpacity>
                  <Text style={styles.qtyValue}>{item.quantity}</Text>
                  <TouchableOpacity onPress={() => handleIncQty(item.id)} style={styles.qtyBtn} activeOpacity={0.7}><Text style={styles.qtyBtnText}>+</Text></TouchableOpacity>
                </View>
                <View style={styles.priceBox}>
                  <Text style={styles.pricePrefix}>R$</Text>
                  <TextInput
                    style={styles.priceInput}
                    value={String(item.price ?? '')}
                    onChangeText={(v) => handlePriceChange(item.id, v)}
                    keyboardType="numeric"
                  />
                </View>
                <TouchableOpacity onPress={() => handleRemoveProduct(item.id)}>
                  <Text style={{ color: '#ef4444', fontWeight: 'bold', marginLeft: 8 }}>Remover</Text>
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={<Text style={{ color: '#6B7280', textAlign: 'center', marginVertical: 4 }}>Nenhum produto adicionado.</Text>}
            style={{ maxHeight: 160, marginBottom: 8 }}
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.createButton, !canCreate && styles.createButtonDisabled]} onPress={handleCreate} activeOpacity={0.8} disabled={!canCreate}>
              <Text style={styles.createText}>Criar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorText: {
    color: '#ef4444',
    marginTop: -6,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 4,
    marginTop: 8,
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
    paddingHorizontal: 10,
    alignItems: 'center',
    flexDirection: 'column',
    marginRight: 6,
    marginBottom: 6,
    minWidth: 84,
  },
  categoryButtonActive: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  categoryLabel: {
    fontSize: 12,
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
  },
  addProductText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 8,
    marginBottom: 4,
  },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 6,
  },
  qtyBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  qtyBtnText: {
    fontSize: 18,
    color: '#111827',
  },
  qtyValue: {
    minWidth: 24,
    textAlign: 'center',
    fontWeight: '600',
    color: '#111827',
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
  },
  priceInput: {
    minWidth: 56,
    paddingVertical: 2,
    color: '#111827',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cancelButton: {
    backgroundColor: '#ef4444',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  createButton: {
    backgroundColor: '#4f46e5',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  cancelText: {
    color: 'white',
    fontWeight: 'bold',
  },
  createText: {
    color: 'white',
    fontWeight: 'bold',
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  totalsText: {
    color: '#111827',
    fontWeight: '600',
  },
});
