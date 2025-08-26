import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DataContext } from '../contexts/DataContext';

function PriceHistoryScreen(props) {
  const { shoppingLists, currentUser, theme } = useContext(DataContext);
  const styles = createStyles(theme);
  const [allItems, setAllItems] = useState([]);
  const router = useRouter();
  const emojis = {
    leite: '🥛',
    pão: '🍞',
    ovos: '🥚',
    queijo: '🧀',
    banana: '🍌',
  };

  useEffect(() => {
    const archivedLists = shoppingLists.filter(l => l.familyId === currentUser.familyId && l.status === 'archived');
    const itemPrices = {};
    archivedLists.forEach(list => {
      (list.items || []).forEach(item => {
        const itemName = item.name.trim().toLowerCase();
        if (item.price && item.price > 0) {
          if (!itemPrices[itemName]) {
            itemPrices[itemName] = { total: 0, count: 0 };
          }
          itemPrices[itemName].total += item.price * item.quantity;
          itemPrices[itemName].count += item.quantity;
        }
      });
    });
    const sortedItems = Object.keys(itemPrices)
      .map(name => ({
        name,
        avgPrice: itemPrices[name].count > 0 ? (itemPrices[name].total / itemPrices[name].count) : 0
      }))
      .filter(item => item.avgPrice > 0)
      .sort((a, b) => a.avgPrice - b.avgPrice);
    setAllItems(sortedItems);
  }, [shoppingLists, currentUser]);

  return (
    <View style={styles.container}>
  {/* Header visual removido */}
      <FlatList
        data={allItems}
        keyExtractor={(item) => item.name}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.itemCard}
            onPress={() => router.push({ pathname: '/item-price-detail', params: { itemName: item.name } })}
            activeOpacity={0.8}
          >
            <View style={styles.itemLeft}>
              <Text style={styles.emoji}>{emojis[item.name] || '🛒'}</Text>
              <View>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemSubText}>Média: R$ {item.avgPrice.toFixed(2)}</Text>
              </View>
            </View>
            <View style={styles.itemRight}>
              {/* Variação percentual pode ser calculada se desejado */}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum dado de preço encontrado.</Text>}
      />
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background, padding: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  backButton: { padding: 8 },
  header: { fontSize: 24, fontWeight: 'bold', color: theme.text },
  subtitle: { fontSize: 16, color: theme.textSecondary, marginBottom: 16 },
  itemCard: { backgroundColor: theme.card, borderRadius: 12, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  emoji: { fontSize: 24, marginRight: 8 },
  itemName: { fontWeight: 'bold', color: theme.text },
  itemSubText: { color: theme.textSecondary, fontSize: 12 },
  itemRight: { marginLeft: 'auto' },
  emptyText: { color: theme.textSecondary, textAlign: 'center', marginVertical: 12 },
});

export default PriceHistoryScreen;
