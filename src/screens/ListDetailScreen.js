import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { Alert, FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { CheckIcon } from '../components/Icons';
import NavBar from '../components/NavBar';
import { DataContext } from '../contexts/DataContext';

const detailStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', padding: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  backButton: { padding: 8 },
  header: { fontSize: 24, fontWeight: 'bold' },
  date: { color: '#6B7280', fontSize: 12 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 18 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  input: { backgroundColor: '#F3F4F6', padding: 10, borderRadius: 8, marginBottom: 8 },
  inputRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  addButton: { backgroundColor: '#3B82F6', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginVertical: 12 },
  itemCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  itemCardPurchased: { backgroundColor: '#D1FAE5' },
  itemName: { fontWeight: 'bold' },
  itemNamePurchased: { textDecorationLine: 'line-through', color: '#6B7280' },
  itemSubText: { color: '#6B7280', fontSize: 12 },
  emptyText: { color: '#6B7280', textAlign: 'center', marginVertical: 12 },
  membersRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  memberAvatarBox: { alignItems: 'center', margin: 8 },
  memberAvatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  memberAvatarText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  memberName: { fontWeight: 'bold', marginTop: 4 },
  memberButton: { padding: 6, borderRadius: 6, marginTop: 4 },
  memberButtonAdd: { backgroundColor: '#22C55E' },
  memberButtonRemove: { backgroundColor: '#F87171' },
  memberButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  archiveButton: { backgroundColor: '#6366F1', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 18 },
  archiveButtonText: { color: '#fff', fontWeight: 'bold' },
});

function ListDetailScreen(props) {
  const { shoppingLists, updateLists, families, users, currentUser } = useContext(DataContext);
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

  if (!list) return <View style={detailStyles.centered}><Text style={detailStyles.emptyText}>Lista não encontrada.</Text></View>;

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
      <ScrollView style={[detailStyles.container, { flex: 1, paddingTop: 0, paddingBottom: 0 }]}> 
        {/* Header visual removido */}
        <View style={detailStyles.card}>
          <Text style={detailStyles.cardTitle}>Adicionar Item</Text>
          <TextInput style={detailStyles.input} placeholder="Nome do item" value={newItemName} onChangeText={setNewItemName} />
          <View style={detailStyles.inputRow}>
            <TextInput style={[detailStyles.input, {flex: 1, marginRight: 10}]} placeholder="Qtd." value={newItemQty} onChangeText={setNewItemQty} keyboardType="number-pad" />
            <TextInput style={[detailStyles.input, {flex: 2}]} placeholder="Preço (opcional)" value={newItemPrice} onChangeText={setNewItemPrice} keyboardType="numeric" />
          </View>
          <TouchableOpacity style={detailStyles.addButton} onPress={handleAddItem} activeOpacity={0.8}><Text style={detailStyles.addButtonText}>Adicionar</Text></TouchableOpacity>
        </View>
        <Text style={detailStyles.sectionTitle}>Itens da Lista</Text>
        <FlatList
          data={list.items || []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 18 }}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <TouchableOpacity style={[detailStyles.itemCard, item.isPurchased && detailStyles.itemCardPurchased]} onPress={() => handleTogglePurchased(item.id)} activeOpacity={0.8}>
              <View style={{flex: 1}}>
                <Text style={[detailStyles.itemName, item.isPurchased && detailStyles.itemNamePurchased]}>{item.name}</Text>
                <Text style={detailStyles.itemSubText}>Qtd: {item.quantity} {item.price > 0 && `- R$ ${item.price.toFixed(2)}`}</Text>
              </View>
              {item.isPurchased && <CheckIcon />}
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={detailStyles.emptyText}>Nenhum item na lista.</Text>}
        />
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
      </ScrollView>
  <NavBar navigate={handleNavigate} activeScreen={'LISTS'} onAddList={handleAddList} />
    </>
  );
}

export default ListDetailScreen;
