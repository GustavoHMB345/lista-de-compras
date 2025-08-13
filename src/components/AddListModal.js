
import React from 'react';
import { FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const CATEGORIES = [
  { key: 'alimentos', label: 'Alimentos', icon: '🍎' },
  { key: 'limpeza', label: 'Produtos de Limpeza', icon: '🧼' },
  { key: 'tecnologia', label: 'Itens Tecnológicos', icon: '💻' },
  { key: 'vestuario', label: 'Vestuário', icon: '👕' },
  { key: 'moveis', label: 'Móveis', icon: '🛋️' },
];

export default function AddListModal({ visible, onClose, onCreate }) {
  const [name, setName] = React.useState('');
  const [desc, setDesc] = React.useState('');
  const [category, setCategory] = React.useState(CATEGORIES[0].key);
  const [products, setProducts] = React.useState([]);
  const [productName, setProductName] = React.useState('');
  const [productQty, setProductQty] = React.useState('1');
  const [productPrice, setProductPrice] = React.useState('');

  const handleAddProduct = () => {
    if (!productName.trim()) return;
    setProducts([
      ...products,
      {
        id: `prod_${Date.now()}_${Math.random()}`,
        name: productName,
        quantity: parseInt(productQty) || 1,
        price: productPrice ? parseFloat(productPrice.replace(',', '.')) : 0,
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

  const handleCreate = () => {
    if (name.trim() === '') return;
    const selectedCategory = CATEGORIES.find(c => c.key === category);
    onCreate({
      name,
      desc,
      category,
      icon: selectedCategory ? selectedCategory.icon : '',
      items: products,
    });
    setName('');
    setDesc('');
    setCategory(CATEGORIES[0].key);
    setProducts([]);
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
            onChangeText={setName}
          />
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
                activeOpacity={0.8}
              >
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text style={styles.categoryLabel}>{cat.label}</Text>
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
            <TouchableOpacity style={styles.addProductButton} onPress={handleAddProduct} activeOpacity={0.8}>
              <Text style={styles.addProductText}>+</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={products}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.productItem}>
                <Text style={{ flex: 2 }}>{item.name}</Text>
                <Text style={{ flex: 1, textAlign: 'center' }}>{item.quantity}</Text>
                <Text style={{ flex: 1, textAlign: 'center' }}>R$ {item.price.toFixed(2)}</Text>
                <TouchableOpacity onPress={() => handleRemoveProduct(item.id)}>
                  <Text style={{ color: '#ef4444', fontWeight: 'bold', marginLeft: 8 }}>Remover</Text>
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={<Text style={{ color: '#6B7280', textAlign: 'center', marginVertical: 4 }}>Nenhum produto adicionado.</Text>}
            style={{ maxHeight: 120, marginBottom: 8 }}
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.createButton} onPress={handleCreate} activeOpacity={0.8}>
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
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    flexDirection: 'column',
    marginRight: 6,
    marginBottom: 6,
    minWidth: 70,
    flex: 1,
  },
  categoryButtonActive: {
    backgroundColor: '#6366F1',
  },
  categoryIcon: {
    fontSize: 22,
    marginBottom: 2,
  },
  categoryLabel: {
    fontSize: 12,
    color: '#222',
    textAlign: 'center',
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
  cancelText: {
    color: 'white',
    fontWeight: 'bold',
  },
  createText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
