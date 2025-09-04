import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { Alert, FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddListModal from '../components/AddListModal';
import { CategoryIcon, CheckIcon } from '../components/Icons';
import NavBar from '../components/NavBar';
import SwipeNavigator from '../components/SwipeNavigator';
import { DataContext } from '../contexts/DataContext';




function ListDetailScreen(props) {
  const { shoppingLists, updateLists, families, users, currentUser } = useContext(DataContext);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('1');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [showOnlyPending, setShowOnlyPending] = useState(false);
  const [query, setQuery] = useState('');
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

  // Derivados para visualização
  const trimmedQuery = (query || '').trim().toLowerCase();
  const items = (list.items || []).filter((it) => (
    (trimmedQuery ? String(it.name || '').toLowerCase().includes(trimmedQuery) : true)
    && (showOnlyPending ? !it.isPurchased : true)
  ));
  const total = (list.items || []).reduce((sum, it) => sum + (Number(it.price) || 0), 0);
  const purchasedCount = (list.items || []).filter(it => it.isPurchased).length;

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
    <SafeAreaView style={detailStyles.root} edges={['top']}>
      <SwipeNavigator
        onSwipeLeft={() => handleNavigate('PROFILE')}
        onSwipeRight={() => handleNavigate('FAMILY')}
      >
        <ScrollView
          style={detailStyles.container}
          contentContainerStyle={detailStyles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces
          alwaysBounceVertical
          overScrollMode="always"
        >
          <View style={[detailStyles.card, { flexDirection: 'row', alignItems: 'center' }]}> 
            <CategoryIcon type={list.category || 'outros'} size={44} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={detailStyles.cardTitle}>{list.name}</Text>
              {!!(list.desc || list.description) && <Text style={{ color: '#6B7280' }}>{list.desc || list.description}</Text>}
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: '#111827', fontWeight: 'bold' }}>R$ {total.toFixed(2)}</Text>
              <Text style={{ color: '#6B7280', fontSize: 12 }}>{purchasedCount}/{(list.items||[]).length} comprados</Text>
            </View>
          </View>

          <View style={detailStyles.card}>
            <Text style={detailStyles.cardTitle}>Adicionar Item</Text>
            <TextInput style={detailStyles.input} placeholder="Nome do item" value={newItemName} onChangeText={setNewItemName} />
            <View style={detailStyles.inputRow}>
              <TextInput style={[detailStyles.input, { flex: 1, marginRight: 10 }]} placeholder="Qtd." value={newItemQty} onChangeText={setNewItemQty} keyboardType="number-pad" />
              <TextInput style={[detailStyles.input, { flex: 2 }]} placeholder="Preço (opcional)" value={newItemPrice} onChangeText={setNewItemPrice} keyboardType="numeric" />
            </View>
            <TouchableOpacity style={detailStyles.addButton} onPress={handleAddItem} activeOpacity={0.8}><Text style={detailStyles.addButtonText}>Adicionar</Text></TouchableOpacity>
          </View>

          <View style={[detailStyles.card, { paddingBottom: 8 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput
                style={[detailStyles.input, { flex: 1, marginRight: 8 }]}
                placeholder="Buscar item..."
                value={query}
                onChangeText={setQuery}
              />
              <TouchableOpacity
                onPress={() => setShowOnlyPending((v) => !v)}
                style={[detailStyles.filterChip, showOnlyPending && detailStyles.filterChipActive]}
                activeOpacity={0.8}
              >
                <Text style={[detailStyles.filterChipText, showOnlyPending && { color: '#fff' }]}>Pendentes</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={detailStyles.sectionTitle}>Itens da Lista</Text>
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 18, alignItems: 'center' }}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity style={[detailStyles.itemCard, item.isPurchased && detailStyles.itemCardPurchased]} onPress={() => handleTogglePurchased(item.id)} activeOpacity={0.8}>
                <View style={{ flex: 1 }}>
                  <Text style={[detailStyles.itemName, item.isPurchased && detailStyles.itemNamePurchased]}>{item.name}</Text>
                  <Text style={detailStyles.itemSubText}>Qtd: {item.quantity} {item.price > 0 && `- R$ ${Number(item.price).toFixed(2)}`}</Text>
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
              familyId: currentUser.familyId,
              createdAt: new Date().toISOString(),
              status: 'active',
              members: [currentUser.id],
            },
          ]);
        }}
      />
      <NavBar navigate={handleNavigate} activeScreen={'LISTS'} onAddList={() => setModalVisible(true)} />
    </SafeAreaView>
  );
}

export default ListDetailScreen;

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
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 18,
    width: '96%',
    maxWidth: 420,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
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
  },
  sectionTitle: {
    width: '96%',
    maxWidth: 420,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 10,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    width: '96%',
    maxWidth: 420,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  itemCardPurchased: {
    opacity: 0.6,
  },
  itemName: {
    fontSize: 16,
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
  },
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
    fontSize: 12,
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
    fontSize: 12,
    color: '#111827',
  },
  archiveButton: {
    backgroundColor: '#111827',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    width: '96%',
    maxWidth: 420,
    marginBottom: 24,
  },
  archiveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e6f0fa',
  },
  emptyText: {
    color: '#6B7280',
  },
});
