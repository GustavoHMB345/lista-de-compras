import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { Animated, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddListModal from '../components/AddListModal';
import { CategoryIcon } from '../components/Icons';
import NavBar from '../components/NavBar';
import PageDots from '../components/PageDots';
import SwipeNavigator from '../components/SwipeNavigator';
import { DataContext } from '../contexts/DataContext';


const { width } = Dimensions.get('window');
const MAX_CARD_WIDTH = Math.min(420, width * 0.98);
const listsStyles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#e6f0fa',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 24,
    width: MAX_CARD_WIDTH,
    maxWidth: '98%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 6,
    alignItems: 'flex-start',
    marginTop: 24,
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#222',
    marginBottom: 18,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
    width: '100%',
  },
  emojiCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  itemSubPrice: {
    fontSize: 13,
    color: '#94a3b8',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginLeft: 10,
  },
  emptyText: {
    color: '#6B7280',
    textAlign: 'center',
    marginVertical: 12,
    fontSize: 15,
    width: '100%',
  },
});

function ListsScreen() {
  const { shoppingLists, currentUser, updateLists } = useContext(DataContext);
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();
  const progress = useState(new Animated.Value(0))[0];

  // Ícones por categoria são renderizados via <CategoryIcon />

  // Filtra listas do usuário logado
  const userLists = shoppingLists.filter(l => l.familyId === currentUser?.familyId);

  // Navegação entre listas
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

  const renderRightActions = (list) => (
    <View style={{ flexDirection: 'row', height: '100%' }}>
      <TouchableOpacity
        style={{ backgroundColor: '#F87171', justifyContent: 'center', paddingHorizontal: 16, borderTopRightRadius: 14, borderBottomRightRadius: 14 }}
        onPress={() => {
          const filtered = shoppingLists.filter(l => l.id !== list.id);
          updateLists(filtered);
        }}
        activeOpacity={0.85}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Apagar</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLeftActions = (list) => (
    <View style={{ flexDirection: 'row', height: '100%' }}>
      <TouchableOpacity
        style={{ backgroundColor: '#111827', justifyContent: 'center', paddingHorizontal: 16, borderTopLeftRadius: 14, borderBottomLeftRadius: 14 }}
        onPress={() => {
          const updated = shoppingLists.map(l => l.id === list.id ? { ...l, status: l.status === 'archived' ? 'active' : 'archived' } : l);
          updateLists(updated);
        }}
        activeOpacity={0.85}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>{/* toggle */}Arquivar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#e6f0fa' }} edges={['top']}>
  <SwipeNavigator onSwipeLeft={() => handleNavigate('DASHBOARD')} onSwipeRight={() => handleNavigate('FAMILY')} progress={progress}>
  <View style={listsStyles.bg}>
        <View style={listsStyles.cardContainer}>
          <Text style={listsStyles.title}>Suas Listas</Text>
          <Text style={listsStyles.subtitle}>Listas criadas por você</Text>
          <ScrollView
            style={{ width: '100%' }}
            contentContainerStyle={{ gap: 12 }}
            showsVerticalScrollIndicator={false}
            bounces
            alwaysBounceVertical
            overScrollMode="always"
          >
            {userLists.length === 0 && (
              <Text style={listsStyles.emptyText}>Nenhuma lista criada ainda.</Text>
            )}
            {userLists.map((item) => (
              <Swipeable
                key={item.id}
                renderRightActions={() => renderRightActions(item)}
                renderLeftActions={() => renderLeftActions(item)}
                friction={2}
                rightThreshold={32}
                leftThreshold={32}
              >
                <TouchableOpacity
                  style={listsStyles.itemCard}
                  onPress={() => router.push({ pathname: '/list-detail', params: { listId: item.id } })}
                  activeOpacity={0.8}
                >
                  <CategoryIcon type={item.category || 'outros'} size={44} />
                  <View style={{ flex: 1 }}>
                    <Text style={listsStyles.itemName}>{item.name}</Text>
                    {item.desc || item.description ? (
                      <Text style={listsStyles.itemSubPrice}>{item.desc || item.description}</Text>
                    ) : null}
                  </View>
                  <Text style={listsStyles.itemPrice}>{item.items && item.items.length > 0 ? `${item.items.length} itens` : ''}</Text>
                </TouchableOpacity>
              </Swipeable>
            ))}
      </ScrollView>
        </View>
  </View>
  <PageDots total={4} index={1} style={{ position: 'absolute', top: 8, alignSelf: 'center' }} />
    </SwipeNavigator>
      <AddListModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCreate={(newList) => {
          updateLists([...shoppingLists, {
            ...newList,
            id: `list_${Date.now()}`,
            familyId: currentUser.familyId,
            createdAt: new Date().toISOString(),
            status: 'active',
            members: [currentUser.id],
          }]);
        }}
      />
  <NavBar navigate={handleNavigate} activeScreen={'LISTS'} onAddList={() => setModalVisible(true)} progress={progress} />
    </SafeAreaView>
  );
}

export default ListsScreen;
