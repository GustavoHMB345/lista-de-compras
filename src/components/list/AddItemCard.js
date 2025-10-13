import React, { memo } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import Button from '../../components/Button';
import Chip from '../../components/Chip';
import { useAppTheme } from '../../hooks/useAppTheme';

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
  const { palette } = useAppTheme();
  return (
    <View style={[styles.card, { backgroundColor: palette.card }]}>
      <Text style={[styles.cardTitle, { color: palette.text }]}>{title}</Text>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: palette.card, borderColor: palette.border, color: palette.text },
        ]}
        placeholder="Nome do item"
        value={newItemName}
        onChangeText={setNewItemName}
        placeholderTextColor={palette.mutedText}
        selectionColor={palette.primary}
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
          style={[
            styles.input,
            {
              flex: 1,
              backgroundColor: palette.card,
              borderColor: palette.border,
              color: palette.text,
            },
          ]}
          placeholder="Qtd."
          value={newItemQty}
          onChangeText={setNewItemQty}
          keyboardType="number-pad"
          placeholderTextColor={palette.mutedText}
          selectionColor={palette.primary}
        />
        <TextInput
          style={[
            styles.input,
            {
              flex: 2,
              backgroundColor: palette.card,
              borderColor: palette.border,
              color: palette.text,
            },
          ]}
          placeholder="Preço (opcional)"
          value={newItemPrice}
          onChangeText={setNewItemPrice}
          keyboardType="numeric"
          placeholderTextColor={palette.mutedText}
          selectionColor={palette.primary}
        />
      </View>
      <Button title="Adicionar" onPress={onAdd} style={{ alignSelf: 'flex-start' }} />
    </View>
  );
}

export default memo(AddItemCard);
