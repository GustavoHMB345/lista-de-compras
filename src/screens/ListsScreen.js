// /screens/ListScreen.js
import { Feather } from '@expo/vector-icons';
import React, { useContext, useState } from 'react';
import { Alert, FlatList, Modal, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreensDefault from '../components/ScreensDefault';
import { useTheme } from '../components/theme';
import { DataContext } from '../contexts/DataContext';
import { getPriorityLabel, priorityColors } from '../data';
import { emit, EVENTS } from '../navigation/EventBus';
import ListDetailScreen from './ListDetailScreen';

// Componente Card de Lista
const ListCard = ({ list, onSelect, onDelete, onEdit, onLayout }) => {
  const { tokens: t, scheme } = useTheme();
  const total = Array.isArray(list.items) ? list.items.length : Number(list.items || 0);
  const doneCount = Array.isArray(list.items)
    ? list.items.filter((it) => it.isPurchased || it.done || it.completed || it.checked).length
    : Number(list.completed || 0);
  const completionPercentage = total > 0 ? Math.round((doneCount / total) * 100) : 0;
  const isCompleted = total > 0 && doneCount === total;
  const priorityKey = ['high','medium','low'].includes(list?.priority) ? list.priority : 'low';
  const priorityStyle = priorityColors[priorityKey] || priorityColors.low;

  return (
    <View style={[styles.listCard, { backgroundColor: t.card, borderColor: t.border }]} onLayout={onLayout}>
      <View style={styles.listCardHeader}>
        <Text style={[styles.listCardTitle, { color: t.text }]}>{list.name}</Text>
        <View style={styles.listCardActions}>
          <TouchableOpacity onPress={onEdit} style={{ padding: 4 }}>
            <Feather name="edit-2" size={16} color="#3B82F6" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={{ padding: 4, marginLeft: 8 }}>
            <Feather name="trash-2" size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <View
        style={{
          ...styles.priorityBadge,
          backgroundColor: (priorityStyle && priorityStyle.bg) || '#DCFCE7',
          borderColor: (priorityStyle && priorityStyle.border) || '#86EFAC',
        }}
      >
        <Text style={{ ...styles.priorityBadgeText, color: (priorityStyle && priorityStyle.text) || '#166534' }}>
          {getPriorityLabel(priorityKey)}
        </Text>
      </View>

      <Text style={[styles.listCardSubtitle, { color: t.muted }]}>
        {total} itens • {completionPercentage}% concluído
      </Text>
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${completionPercentage}%`,
              backgroundColor: isCompleted ? '#10B981' : completionPercentage > 50 ? '#3B82F6' : '#F59E0B',
            },
          ]}
        />
      </View>

      <View style={styles.listCardFooter}>
        <Text style={[styles.listCardStatus, { color: t.muted }]}>{isCompleted ? '✓ Concluída' : 'Em andamento'}</Text>
        <TouchableOpacity onPress={onSelect}>
          <Text style={styles.listCardDetailsBtn}>Ver detalhes →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Componente Tela Principal
const ListScreen = () => {
  const { tokens: t, scheme } = useTheme();
  const { shoppingLists, updateLists } = useContext(DataContext);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedListId, setSelectedListId] = useState(null);
  const [measuredCardH, setMeasuredCardH] = useState(null);

  const handleDeleteList = (listId) => {
    Alert.alert('Excluir Lista', 'Tem certeza que deseja excluir esta lista?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          const next = (shoppingLists || []).filter((l) => l.id !== listId);
          updateLists(next);
        },
      },
    ]);
  };

  const handleEditList = (list) => {
    // Alert.prompt só existe no iOS. No Android/Web, seria necessário outro modal.
    Alert.alert('Editar', `Funcionalidade de editar "${list.name}" a ser implementada.`);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: t.background }]}>
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={t.background} />

      <ScreensDefault
        active="LISTS"
        leftTab="PROFILE"
        rightTab="FAMILY"
        scroll={false}
  overlayBottomSpacer={0}
        scrollEndFromCardHeight={
          measuredCardH
            ? { cardHeight: measuredCardH, factor: 0.35, gap: 8, min: 14, max: 28 }
            : { cardHeight: 140, factor: 0.35, gap: 8, min: 14, max: 28 }
        }
        onPrimaryAction={() => emit(EVENTS.OPEN_ADD_LIST_MODAL)}
      >
        <FlatList
          data={shoppingLists || []}
          keyExtractor={(item) => item.id.toString()}
          numColumns={1}
          contentContainerStyle={styles.gridContainer}
          renderItem={({ item }) => (
            <ListCard
              list={item}
              onSelect={() => {
                setSelectedListId(item.id);
                setShowDetail(true);
              }}
              onDelete={() => handleDeleteList(item.id)}
              onEdit={() => handleEditList(item)}
              onLayout={!measuredCardH ? (e) => setMeasuredCardH(Math.round(e.nativeEvent.layout.height)) : undefined}
            />
          )}
          ListHeaderComponent={
            <View style={[styles.headerContainer, { backgroundColor: t.card }]}>
              <View style={styles.headerIcon}>
                <Text style={{ fontSize: 40 }}>📋</Text>
              </View>
              <Text style={[styles.headerTitle, { color: t.text }]}>Minhas Listas</Text>
              <Text style={[styles.headerSubtitle, { color: t.muted }]}>Todas as suas listas de compras</Text>
              <TouchableOpacity style={styles.primaryButton} onPress={() => emit(EVENTS.OPEN_ADD_LIST_MODAL)}>
                <Feather name="plus" size={20} color="white" />
                <Text style={styles.primaryButtonText}>Nova Lista</Text>
              </TouchableOpacity>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateEmoji}>📝</Text>
              <Text style={[styles.emptyStateTitle, { color: t.text }]}>Nenhuma lista encontrada</Text>
              <Text style={[styles.emptyStateSubtitle, { color: t.muted }]}>Crie sua primeira lista de compras!</Text>
              <TouchableOpacity style={styles.primaryButton} onPress={() => emit(EVENTS.OPEN_ADD_LIST_MODAL)}>
                <Text style={styles.primaryButtonText}>Criar Lista</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </ScreensDefault>

      {/* Detalhe da Lista */}
      <Modal visible={showDetail} animationType="slide" onRequestClose={() => setShowDetail(false)}>
        <ListDetailScreen
          route={{ params: { listId: selectedListId } }}
          navigation={{ goBack: () => setShowDetail(false) }}
        />
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  // Navbar
  navbar: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 3,
  },
  navbarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  // Header
  headerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    margin: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerIcon: { marginBottom: 12 },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 6,
    lineHeight: 28,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 16,
    lineHeight: 20,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 4,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Grid
  gridContainer: { paddingHorizontal: 12, paddingBottom: 20 },
  // Card
  listCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2.22,
    elevation: 2,
  },
  listCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  listCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },
  listCardActions: {
    flexDirection: 'row',
  },
  priorityBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: 10,
  },
  priorityBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  listCardSubtitle: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 10,
    lineHeight: 18,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  listCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  listCardStatus: {
    fontSize: 14,
    color: '#6B7280',
  },
  listCardDetailsBtn: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  // Empty State
  emptyStateContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 28, marginTop: 40 },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  // TabBar styles removed; using shared TabBar from ScreensDefault
});

export default ListScreen;