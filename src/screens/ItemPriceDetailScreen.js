import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { DataContext } from '../contexts/DataContext';

const detailStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', padding: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  backButton: { padding: 8 },
  headerInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  emoji: { fontSize: 28, marginRight: 8 },
  header: { fontSize: 24, fontWeight: 'bold' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 18 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  emptyText: { color: '#6B7280', textAlign: 'center', marginVertical: 12 },
  priceItemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  priceItemDate: { color: '#6B7280' },
  priceItemValue: { color: '#3B82F6', fontWeight: 'bold' },
});

function ItemPriceDetailScreen(props) {
  const { shoppingLists, currentUser } = useContext(DataContext);
  const [priceData, setPriceData] = useState([]);
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

  return (
    <ScrollView style={detailStyles.container}>
  {/* Header visual removido */}
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
            yAxisTextStyle={{color: '#333'}}
            xAxisLabelTextStyle={{color: '#333'}}
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
  );
}

export default ItemPriceDetailScreen;
