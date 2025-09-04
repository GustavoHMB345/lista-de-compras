import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddListModal from '../components/AddListModal';
import NavBar from '../components/NavBar';
import SwipeNavigator from '../components/SwipeNavigator';
import { DataContext } from '../contexts/DataContext';


const { width } = Dimensions.get('window');
const MAX_CARD_WIDTH = Math.min(420, width * 0.98);
const detailStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#e6f0fa',
  },
  container: {
    flex: 1,
    backgroundColor: '#e6f0fa',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 24,
    minHeight: width > 400 ? 0 : 600,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 22,
    marginBottom: 18,
    width: MAX_CARD_WIDTH,
    maxWidth: '98%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 6,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#222',
  },
  emptyText: {
    color: '#6B7280',
    textAlign: 'center',
    marginVertical: 12,
    fontSize: 15,
  },
  priceItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 7,
    paddingVertical: 2,
  },
  priceItemDate: {
    color: '#6B7280',
    fontSize: 15,
  },
  priceItemValue: {
    color: '#3B82F6',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

function ItemPriceDetailScreen(props) {
  const { shoppingLists, currentUser, updateLists } = useContext(DataContext);
  const [priceData, setPriceData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();
  // itemName pode vir de props.route.params ou ser ajustado conforme navegação
  const itemName = props?.route?.params?.itemName || '';
  const emojis = {
    leite: '🥛',
    pão: '🍞',
    ovos: '🥚',
    queijo: '🧀',
    banana: '🍌',
  };

  useEffect(() => {
    const data = [];
    const archivedLists = shoppingLists
      .filter(l => l.familyId === currentUser.familyId && l.status === 'archived')
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    archivedLists.forEach(list => {
      (list.items || []).forEach(item => {
        if (item.name.trim().toLowerCase() === itemName && item.price > 0) {
          const date = new Date(list.createdAt);
          const formattedDate = `${date.getDate()}/${date.getMonth() + 1}`;
          data.push({
            value: item.price,
            label: formattedDate,
            date: list.createdAt,
            price: item.price
          });
        }
      });
    });
    setPriceData(data);
  }, [shoppingLists, currentUser, itemName]);

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
    <SafeAreaView style={detailStyles.root} edges={['top']}>
      <SwipeNavigator
        onSwipeLeft={() => handleNavigate('LISTS')}
        onSwipeRight={() => handleNavigate('DASHBOARD')}
      >
        <ScrollView
          style={detailStyles.container}
          contentContainerStyle={detailStyles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces
          alwaysBounceVertical
          overScrollMode="always"
        >
          <View style={detailStyles.card}>
            <Text style={detailStyles.cardTitle}>Flutuação de Preço</Text>
            {priceData.length > 1 ? (
              <LineChart
                data={priceData}
                isAnimated
                color="#3B82F6"
                thickness={3}
                startFillColor="rgba(59, 130, 246, 0.2)"
                endFillColor="rgba(59, 130, 246, 0.01)"
                yAxisTextStyle={{ color: '#333' }}
                xAxisLabelTextStyle={{ color: '#333' }}
                noOfSections={4}
                spacing={50}
                initialSpacing={20}
                style={{ marginVertical: 10 }}
              />
            ) : (
              <Text style={detailStyles.emptyText}>Dados insuficientes para gerar um gráfico (mínimo 2 registros).</Text>
            )}
          </View>
          <View style={detailStyles.card}>
            <Text style={detailStyles.cardTitle}>Registros de Preço</Text>
            {priceData.length > 0 ? priceData.map((item, index) => (
              <View key={index} style={detailStyles.priceItemRow}>
                <Text style={detailStyles.priceItemDate}>{new Date(item.date).toLocaleDateString()}</Text>
                <Text style={detailStyles.priceItemValue}>R$ {item.price.toFixed(2)}</Text>
              </View>
            )) : <Text style={detailStyles.emptyText}>Nenhum registro encontrado.</Text>}
          </View>
        </ScrollView>
      </SwipeNavigator>
      <AddListModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCreate={(newList) => {
          updateLists((shoppingLists || []).concat({
            ...newList,
            id: `list_${Date.now()}`,
            familyId: currentUser.familyId,
            createdAt: new Date().toISOString(),
            status: 'active',
            members: [currentUser.id],
          }));
        }}
      />
  <NavBar navigate={handleNavigate} activeScreen={'LISTS'} onAddList={() => setModalVisible(true)} />
    </SafeAreaView>
  );
}

export default ItemPriceDetailScreen;
