import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { Alert, FlatList, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { CheckIcon } from '../components/Icons';
import NavBar from '../components/NavBar';
import { DataContext } from '../contexts/DataContext';




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
      <ScrollView style={detailStyles.container} contentContainerStyle={detailStyles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={detailStyles.card}>
          <Text style={detailStyles.cardTitle}>Adicionar Item</Text>
          <TextInput style={detailStyles.input} placeholder="Nome do item" value={newItemName} onChangeText={setNewItemName} />
          <View style={detailStyles.inputRow}>
            <TextInput style={[detailStyles.input, { flex: 1, marginRight: 10 }]} placeholder="Qtd." value={newItemQty} onChangeText={setNewItemQty} keyboardType="number-pad" />
            <TextInput style={[detailStyles.input, { flex: 2 }]} placeholder="Preço (opcional)" value={newItemPrice} onChangeText={setNewItemPrice} keyboardType="numeric" />
          </View>
          <TouchableOpacity style={detailStyles.addButton} onPress={handleAddItem} activeOpacity={0.8}><Text style={detailStyles.addButtonText}>Adicionar</Text></TouchableOpacity>
        </View>
        <Text style={detailStyles.sectionTitle}>Itens da Lista</Text>
        <FlatList
          data={list.items || []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 18, alignItems: 'center' }}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <TouchableOpacity style={[detailStyles.itemCard, item.isPurchased && detailStyles.itemCardPurchased]} onPress={() => handleTogglePurchased(item.id)} activeOpacity={0.8}>
              <View style={{ flex: 1 }}>
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
