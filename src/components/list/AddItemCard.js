import React, { memo } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import Button from '../../components/Button';
import Chip from '../../components/Chip';

function AddItemCard({
  styles,
  title = 'Adicionar Item',
  newItemName,
  setNewItemName,
  newItemQty,
  setNewItemQty,
  newItemPrice,
  setNewItemPrice,
  newItemCategory,
  setNewItemCategory,
  itemCategories,
  onAdd,
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome do item"
        value={newItemName}
        onChangeText={setNewItemName}
        placeholderTextColor="#9CA3AF"
        selectionColor="#2563EB"
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingVertical: 2,
          paddingHorizontal: 2,
          gap: 8,
          marginBottom: 10,
        }}
      >
        <Chip
          label="Todas"
          emoji="📋"
          active={newItemCategory === 'all'}
          onPress={() => setNewItemCategory('all')}
        />
        {Object.entries(itemCategories).map(([key, cfg]) => (
          <Chip
            key={key}
            label={cfg.name}
            emoji={cfg.emoji}
            active={newItemCategory === key}
            onPress={() => setNewItemCategory(key)}
          />
        ))}
      </ScrollView>
      <View style={[styles.inputRow]}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Qtd."
          value={newItemQty}
          onChangeText={setNewItemQty}
          keyboardType="number-pad"
          placeholderTextColor="#9CA3AF"
          selectionColor="#2563EB"
        />
        <TextInput
          style={[styles.input, { flex: 2 }]}
          placeholder="Preço (opcional)"
          value={newItemPrice}
          onChangeText={setNewItemPrice}
          keyboardType="numeric"
          placeholderTextColor="#9CA3AF"
          selectionColor="#2563EB"
        />
      </View>
      <Button title="Adicionar" onPress={onAdd} style={{ alignSelf: 'flex-start' }} />
    </View>
  );
}

export default memo(AddItemCard);
