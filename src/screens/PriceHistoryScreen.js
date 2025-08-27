import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';


const { width } = Dimensions.get('window');
const MAX_CARD_WIDTH = Math.min(420, width * 0.98);
const historyStyles = StyleSheet.create({
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
    fontSize: 15,
    color: '#b0b4be',
    marginBottom: 18,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
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
    fontSize: 15,
    color: '#38bdf8',
    fontWeight: 'bold',
    marginTop: 2,
  },
  itemSubPrice2: {
    fontSize: 15,
    color: '#94a3b8',
    marginTop: 2,
  },
  itemRight: {
    marginLeft: 'auto',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#6B7280',
    textAlign: 'center',
    marginVertical: 12,
    fontSize: 15,
    width: '100%',
  },
});


function PriceHistoryScreen() {
  // MOCK para visual igual ao anexo
  const items = [
    { name: 'Leite Integral', emoji: '🥛', price1: '13', price2: '3.30' },
    { name: 'Churrasco burritego', emoji: '🍅', price1: '13', price2: '3.30' },
    { name: 'Pão da Forma', emoji: '🗂️', price1: '13', price2: '3.30' },
    { name: 'Pão da Forma', emoji: '🗂️', price1: '25', price2: '3.30' },
  ];
  return (
    <View style={historyStyles.bg}>
      <View style={historyStyles.cardContainer}>
        <Text style={historyStyles.title}>Histórico de Preços</Text>
        <Text style={historyStyles.subtitle}>Demexhei do do dalemitma Onetugo And tams do Poemsa d eciotids</Text>
        <ScrollView style={{ width: '100%' }} contentContainerStyle={{ gap: 12 }} showsVerticalScrollIndicator={false}>
          {items.length === 0 && (
            <Text style={historyStyles.emptyText}>Nenhum histórico encontrado.</Text>
          )}
          {items.map((item, idx) => (
            <View key={idx} style={historyStyles.itemCard}>
              <View style={historyStyles.emojiCircle}>
                <Text style={{ fontSize: 28 }}>{item.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={historyStyles.itemName}>{item.name}</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Text style={historyStyles.itemSubPrice}>R$ {item.price1}</Text>
                  <Text style={historyStyles.itemSubPrice2}>R$ {item.price2}</Text>
                </View>
              </View>
              <View style={historyStyles.itemRight}>
                <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#b0b4be', fontWeight: 'bold', fontSize: 18 }}>•</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

export default PriceHistoryScreen;
