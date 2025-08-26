
import React, { useContext } from 'react';
import { FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { DataContext } from '../contexts/DataContext';

const CATEGORIES = [
  { key: 'alimentos', label: 'Alimentos', icon: '🍎' },
  { key: 'limpeza', label: 'Produtos de Limpeza', icon: '🧼' },
  { key: 'tecnologia', label: 'Itens Tecnológicos', icon: '💻' },
  { key: 'vestuario', label: 'Vestuário', icon: '👕' },
  { key: 'moveis', label: 'Móveis', icon: '🛋️' },
];

const createStyles = (theme) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 24,
    width: '85%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: theme.text,
  },
  input: {
    backgroundColor: theme.input,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    color: theme.text,
    borderWidth: 1,
    borderColor: theme.border,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 4,
    marginTop: 8,
    color: theme.text,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  categoryButton: {
    backgroundColor: theme.input,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    flexDirection: 'column',
    marginRight: 6,
    marginBottom: 6,
    minWidth: 70,
    flex: 1,
    borderWidth: 1,
    borderColor: theme.border,
  },
  categoryButtonActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  categoryIcon: {
    fontSize: 22,
    marginBottom: 2,
  },
  categoryLabel: {
    fontSize: 12,
    color: theme.text,
    textAlign: 'center',
  },
  categoryLabelActive: {
    color: '#FFFFFF',
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addProductButton: {
    backgroundColor: theme.primary,
    borderRadius: 8,
    padding: 10,
    marginLeft: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addProductText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    borderRadius: 8,
    padding: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: theme.border,
  },
  productText: {
    color: theme.text,
  },
  removeText: {
    color: theme.error,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  emptyText: {
    color: theme.textSecondary,
    textAlign: 'center',
    marginVertical: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cancelButton: {
    backgroundColor: theme.error,
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  createButton: {
    backgroundColor: theme.primary,
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default function AddListModal({ visible, onClose, onCreate }) {
  const { theme } = useContext(DataContext);
  const styles = createStyles(theme);
  
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
            <TouchableOpacity style={styles.addProductButton} onPress={handleAddProduct} activeOpacity={0.8}>
              <Text style={styles.addProductText}>+</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={products}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.productItem}>
                <Text style={[styles.productText, { flex: 2 }]}>{item.name}</Text>
                <Text style={[styles.productText, { flex: 1, textAlign: 'center' }]}>{item.quantity}</Text>
                <Text style={[styles.productText, { flex: 1, textAlign: 'center' }]}>R$ {item.price.toFixed(2)}</Text>
                <TouchableOpacity onPress={() => handleRemoveProduct(item.id)}>
                  <Text style={styles.removeText}>Remover</Text>
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>Nenhum produto adicionado.</Text>}
            style={{ maxHeight: 120, marginBottom: 8 }}
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.createButton} onPress={handleCreate} activeOpacity={0.8}>
              <Text style={styles.buttonText}>Criar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}


