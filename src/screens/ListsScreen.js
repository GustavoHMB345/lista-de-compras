import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AddListModal from '../components/AddListModal';
import { PlusIcon } from '../components/Icons';
import NavBar from '../components/NavBar';
import { DataContext } from '../contexts/DataContext';

const listsStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', padding: 16 },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  inputRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  input: { backgroundColor: '#F3F4F6', padding: 10, borderRadius: 8, flex: 1 },
  addButton: { backgroundColor: '#3B82F6', padding: 12, borderRadius: 8, alignItems: 'center' },
  listCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  listTitle: { fontWeight: 'bold' },
  listDate: { color: '#6B7280', fontSize: 12 },
  verButtonBox: { backgroundColor: '#6366F1', borderRadius: 8, padding: 8, marginLeft: 12 },
  verButtonText: { color: '#fff', fontWeight: 'bold' },
  emptyText: { color: '#6B7280', textAlign: 'center', marginVertical: 12 },
});

function ListsScreen(props) {
  const { shoppingLists, currentUser, updateLists } = useContext(DataContext);
  const [newListName, setNewListName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();
  const activeLists = shoppingLists.filter(l => l.familyId === currentUser.familyId && l.status === 'active');

  const handleAddList = () => {
    setModalVisible(true);
  };

  const handleCreateList = ({ name, desc, category, icon, items }) => {
    const newList = {
      id: `list_${Date.now()}`,
      name,
      description: desc,
      category: category || '',
      icon: icon || '',
      familyId: currentUser.familyId,
      createdAt: new Date().toISOString(),
      status: 'active',
      members: [currentUser.id],
      items: items && items.length > 0 ? items : [],
    };
    updateLists([...shoppingLists, newList]);
    router.push({ pathname: '/list-detail', params: { listId: newList.id } });
  };

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

  return (
    <>
      <View style={[listsStyles.container, { flex: 1, paddingTop: 0, paddingBottom: 0 }]}> 
  {/* Header visual removido */}
        <View style={listsStyles.inputRow}>
          <TextInput
            style={listsStyles.input}
            placeholder="Nome da nova lista"
            value={newListName}
            onChangeText={setNewListName}
          />
          <TouchableOpacity style={listsStyles.addButton} onPress={() => {
            if (newListName.trim() === '') return;
            const newList = {
              id: `list_${Date.now()}`,
              name: newListName,
              familyId: currentUser.familyId,
              createdAt: new Date().toISOString(),
              status: 'active',
              members: [currentUser.id],
              items: []
            };
            updateLists([...shoppingLists, newList]);
            setNewListName('');
            router.push({ pathname: '/list-detail', params: { listId: newList.id } });
          }} activeOpacity={0.8}>
            <PlusIcon />
          </TouchableOpacity>
        </View>
        <FlatList
          data={activeLists}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={listsStyles.listCard}
              onPress={() => router.push({ pathname: '/list-detail', params: { listId: item.id } })}
              activeOpacity={0.8}
            >
              <View style={{ flex: 1 }}>
                <Text style={listsStyles.listTitle}>{item.name}</Text>
                <Text style={listsStyles.listDate}>Criada em {new Date(item.createdAt).toLocaleDateString()}</Text>
              </View>
              <View style={listsStyles.verButtonBox}>
                <Text style={listsStyles.verButtonText}>Ver</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={listsStyles.emptyText}>Crie sua primeira lista de compras!</Text>}
        />
      </View>
      <AddListModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCreate={handleCreateList}
      />
      <NavBar navigate={handleNavigate} activeScreen={'LISTS'} onAddList={handleAddList} />
    </>
  );
}

export default ListsScreen;
