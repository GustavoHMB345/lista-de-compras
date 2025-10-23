import { useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import Chip from '../Chip';
import { CategoryIcon } from '../Icons';
import AddItemCard from './AddItemCard';
import HeaderActions from './HeaderActions';

export default function ListDetailHeader({
  list,
  styles,
  palette,
  actions,
  addItemForm,
  filters,
  itemCategories,
}) {
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [editedName, setEditedName] = useState(list?.name || '');
  const [editedDesc, setEditedDesc] = useState(list?.desc || list?.description || '');

  const contentExtraTop = useMemo(() => {
    const w = typeof globalThis !== 'undefined' && globalThis.__w ? globalThis.__w : 360;
    return w < 420 ? 12 : w < 760 ? 24 : 40;
  }, []);

  return (
    <>
      <View style={[styles.card, { backgroundColor: palette.card, marginTop: contentExtraTop }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <CategoryIcon type={list?.category || 'outros'} size={44} neutral />
          <View style={{ marginLeft: 12, flex: 1 }}>
            {isEditingHeader ? (
              <>
                <TextInput
                  value={editedName}
                  onChangeText={setEditedName}
                  style={[styles.headerInput, styles.headerNameInput, { backgroundColor: palette.card, borderColor: palette.border, color: palette.text }]}
                  placeholder="Nome da lista"
                  placeholderTextColor={palette.mutedText}
                  selectionColor={palette.primary}
                />
                <TextInput
                  value={editedDesc}
                  onChangeText={setEditedDesc}
                  style={[styles.headerInput, styles.headerDescInput, { backgroundColor: palette.card, borderColor: palette.border, color: palette.text }]}
                  placeholder="Descrição (opcional)"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  placeholderTextColor={palette.mutedText}
                  selectionColor={palette.primary}
                />
              </>
            ) : (
              <>
                <Text style={[styles.cardTitle, { color: palette.text }]}>{list?.name}</Text>
                {!!(list?.desc || list?.description) && (
                  <Text style={{ color: palette.mutedText }}>{list?.desc || list?.description}</Text>
                )}
              </>
            )}
          </View>
        </View>
        <HeaderActions
          styles={styles}
          isEditing={isEditingHeader}
          onShare={actions.handleShare}
          onSave={() => {
            actions.saveEditHeader(editedName, editedDesc);
            setIsEditingHeader(false);
          }}
          onEdit={() => setIsEditingHeader(true)}
          onMarkAll={actions.markAllPurchased}
          onClearCompleted={actions.clearCompleted}
        />
      </View>
      <AddItemCard
        styles={styles}
        newItemName={addItemForm.newItemName}
        setNewItemName={addItemForm.setNewItemName}
        newItemQty={addItemForm.newItemQty}
        setNewItemQty={addItemForm.setNewItemQty}
        newItemPrice={addItemForm.newItemPrice}
        setNewItemPrice={addItemForm.setNewItemPrice}
        newItemCategory={addItemForm.newItemCategory}
        setNewItemCategory={addItemForm.setNewItemCategory}
        itemCategories={itemCategories}
        onAdd={addItemForm.handleSubmit}
      />
      <View style={[styles.card, { backgroundColor: palette.card, paddingBottom: 8 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextInput
            style={[styles.input, { flex: 1, marginRight: 8, backgroundColor: palette.card, borderColor: palette.border, color: palette.text }]}
            placeholder="Buscar item..."
            value={filters.query}
            onChangeText={filters.setQuery}
            placeholderTextColor={palette.mutedText}
            selectionColor={palette.primary}
          />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Chip label="Todos" active={!filters.showOnlyPending && !filters.showOnlyCompleted} onPress={() => { filters.setShowOnlyPending(false); filters.setShowOnlyCompleted(false); }} />
            <Chip label="Pendentes" active={filters.showOnlyPending} onPress={() => { filters.setShowOnlyPending(true); filters.setShowOnlyCompleted(false); }} />
            <Chip label="Concluídos" active={filters.showOnlyCompleted} onPress={() => { filters.setShowOnlyPending(false); filters.setShowOnlyCompleted(true); }} />
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 8 }}>
          <Chip label="Todas" emoji="📋" active={filters.categoryFilter === 'all'} onPress={() => filters.setCategoryFilter('all')} />
          {Object.entries(itemCategories).map(([key, cfg]) => (
            <Chip key={key} label={cfg.name} emoji={cfg.emoji} active={filters.categoryFilter === key} onPress={() => filters.setCategoryFilter(key)} />
          ))}
        </ScrollView>
      </View>
      <Text style={[styles.sectionTitle, { color: palette.text }]}>Itens da Lista</Text>
    </>
  );
}
