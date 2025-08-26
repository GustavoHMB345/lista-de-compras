import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { Alert, FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { CheckIcon } from '../components/Icons';
import NavBar from '../components/NavBar';
import { DataContext } from '../contexts/DataContext';

function ListDetailScreen(props) {
  const { shoppingLists, updateLists, families, users, currentUser, theme } = useContext(DataContext);
  const styles = createStyles(theme);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('1');
  const [newItemPrice, setNewItemPrice] = useState('');
  const listId = props?.route?.params?.listId;
  const list = shoppingLists.find(l => l.id === listId);
  const family = families.find(f => f.id === currentUser.familyId);
  const familyMembers = users.filter(u => family?.members.includes(u.id));
  const router = useRouter();

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

  if (!list) return <View style={styles.centered}><Text style={styles.emptyText}>Lista não encontrada.</Text></View>;

  const handleAddItem = () => {
    if (newItemName.trim() === '') return;
    const newItem = {
      id: `item_${Date.now()}`,
      name: newItemName,
      quantity: parseInt(newItemQty) || 1,
      price: parseFloat(newItemPrice.replace(',', '.')) || 0,
      addedBy: currentUser.id,
      isPurchased: false,
      createdAt: new Date().toISOString()
    };
    const updatedLists = shoppingLists.map(l =>
      l.id === listId ? { ...l, items: [newItem, ...(l.items || [])] } : l
    );
    updateLists(updatedLists);
    setNewItemName(''); setNewItemQty('1'); setNewItemPrice('');
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

  return (
    <>
      <ScrollView style={[styles.container, { flex: 1, paddingTop: 0, paddingBottom: 0 }]}> 
        {/* Header visual removido */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Adicionar Item</Text>
          <TextInput style={styles.input} placeholder="Nome do item" value={newItemName} onChangeText={setNewItemName} />
          <View style={styles.inputRow}>
            <TextInput style={[styles.input, {flex: 1, marginRight: 10}]} placeholder="Qtd." value={newItemQty} onChangeText={setNewItemQty} keyboardType="number-pad" />
            <TextInput style={[styles.input, {flex: 2}]} placeholder="Preço (opcional)" value={newItemPrice} onChangeText={setNewItemPrice} keyboardType="numeric" />
          </View>
          <TouchableOpacity style={styles.addButton} onPress={handleAddItem} activeOpacity={0.8}><Text style={styles.addButtonText}>Adicionar</Text></TouchableOpacity>
        </View>
        <Text style={styles.sectionTitle}>Itens da Lista</Text>
        <FlatList
          data={list.items || []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 18 }}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.itemCard, item.isPurchased && styles.itemCardPurchased]} onPress={() => handleTogglePurchased(item.id)} activeOpacity={0.8}>
              <View style={{flex: 1}}>
                <Text style={[styles.itemName, item.isPurchased && styles.itemNamePurchased]}>{item.name}</Text>
                <Text style={styles.itemSubText}>Qtd: {item.quantity} {item.price > 0 && `- R$ ${item.price.toFixed(2)}`}</Text>
              </View>
              {item.isPurchased && <CheckIcon />}
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhum item na lista.</Text>}
        />
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Membros na Lista</Text>
          <View style={styles.membersRow}>
            {familyMembers.map(member => (
              <View key={member.id} style={styles.memberAvatarBox}>
                <View style={[styles.memberAvatar, { backgroundColor: theme.primary }]}>
                  <Text style={styles.memberAvatarText}>{member.displayName[0]}</Text>
                </View>
                <Text style={styles.memberName}>{member.displayName}</Text>
                <TouchableOpacity style={[styles.memberButton, list.members.includes(member.id) ? styles.memberButtonRemove : styles.memberButtonAdd]} onPress={() => handleMemberToggle(member.id)} activeOpacity={0.8}>
                  <Text style={styles.memberButtonText}>{list.members.includes(member.id) ? 'Remover' : 'Adicionar'}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
        <TouchableOpacity style={styles.archiveButton} onPress={handleArchiveList} activeOpacity={0.85}><Text style={styles.archiveButtonText}>Finalizar e Arquivar Lista</Text></TouchableOpacity>
      </ScrollView>
  <NavBar navigate={handleNavigate} activeScreen={'LISTS'} />
    </>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background, padding: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  backButton: { padding: 8 },
  header: { fontSize: 24, fontWeight: 'bold', color: theme.text },
  date: { color: theme.textSecondary, fontSize: 12 },
  card: { backgroundColor: theme.card, borderRadius: 16, padding: 16, marginBottom: 18 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: theme.text },
  input: { backgroundColor: theme.input, padding: 10, borderRadius: 8, marginBottom: 8, color: theme.text },
  inputRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  addButton: { backgroundColor: theme.primary, padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  addButtonText: { color: theme.card, fontWeight: 'bold' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginVertical: 12, color: theme.text },
  itemCard: { backgroundColor: theme.card, borderRadius: 12, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  itemCardPurchased: { backgroundColor: theme.successLight },
  itemName: { fontWeight: 'bold', color: theme.text },
  itemNamePurchased: { textDecorationLine: 'line-through', color: theme.textSecondary },
  itemSubText: { color: theme.textSecondary, fontSize: 12 },
  emptyText: { color: theme.textSecondary, textAlign: 'center', marginVertical: 12 },
  membersRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  memberAvatarBox: { alignItems: 'center', margin: 8 },
  memberAvatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  memberAvatarText: { color: theme.card, fontWeight: 'bold', fontSize: 18 },
  memberName: { fontWeight: 'bold', marginTop: 4, color: theme.text },
  memberButton: { padding: 6, borderRadius: 6, marginTop: 4 },
  memberButtonAdd: { backgroundColor: theme.success },
  memberButtonRemove: { backgroundColor: theme.error },
  memberButtonText: { color: theme.card, fontWeight: 'bold', fontSize: 12 },
  archiveButton: { backgroundColor: theme.secondary, padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 18 },
  archiveButtonText: { color: theme.card, fontWeight: 'bold' },
});

export default ListDetailScreen;
