import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { CategoryIcon } from './Icons';

const ListCardStyles = StyleSheet.create({
  listCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#0B0B0B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    marginHorizontal: 8,
    marginVertical: 6,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  listHeaderLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  listHeaderLeftTextWrap: { marginLeft: 10, flex: 1 },
  listTitle: { fontSize: 16, fontWeight: '700', color: '#111827', flex: 1, paddingRight: 8 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  chipText: { fontSize: 12, fontWeight: '700' },
  dateRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  dateDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#9CA3AF', marginRight: 6 },
  dateText: { color: '#6B7280', fontSize: 12 },
  progressWrap: { marginBottom: 10 },
  progressMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressMetaLabel: { color: '#6B7280', fontSize: 12 },
  progressMetaValue: { color: '#2563EB', fontWeight: '600', fontSize: 12 },
  progressTrack: { backgroundColor: '#E5E7EB', height: 8, borderRadius: 4, overflow: 'hidden' },
  progressBar: { height: 8, borderRadius: 4 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerLeft: { flexDirection: 'row', alignItems: 'center' },
  footerLeftText: { color: '#6B7280', fontSize: 12 },
  statusText: { fontSize: 12, fontWeight: '600' },
});

// Priority color tokens (same semantics as original)
const PRIORITY_COLORS = {
  high: { bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5', label: 'Alta' },
  medium: { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D', label: 'Média' },
  low: { bg: '#DCFCE7', text: '#166534', border: '#86EFAC', label: 'Baixa' },
};

function ListCard({
  item,
  formatDate,
  getCounts,
  getPriority,
  router,
  renderRightActions,
  renderLeftActions,
}) {
  const { total, completed } = getCounts(item);
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isCompleted = total > 0 && completed === total;
  const priority = getPriority(item);
  const pc = PRIORITY_COLORS[priority] || PRIORITY_COLORS.medium;
  const barColor = isCompleted ? '#22C55E' : '#3B82F6';

  return (
    <Swipeable
      renderRightActions={() => renderRightActions(item)}
      renderLeftActions={() => renderLeftActions(item)}
      friction={2}
      rightThreshold={32}
      leftThreshold={32}
    >
      <TouchableOpacity
        style={ListCardStyles.listCard}
        onPress={() => router.push({ pathname: '/list-detail', params: { id: item.id } })}
        activeOpacity={0.92}
      >
        <View style={ListCardStyles.listHeaderRow}>
          <View style={ListCardStyles.listHeaderLeft}>
            <CategoryIcon type={item.category || 'outros'} size={42} neutral />
            <View style={ListCardStyles.listHeaderLeftTextWrap}>
              <Text style={ListCardStyles.listTitle} numberOfLines={2}>
                {item.name || 'Sem nome'}
              </Text>
            </View>
          </View>
          <View style={[ListCardStyles.chip, { backgroundColor: pc.bg, borderColor: pc.border }]}>
            <Text style={[ListCardStyles.chipText, { color: pc.text }]}>{pc.label}</Text>
          </View>
        </View>

        <View style={ListCardStyles.dateRow}>
          <View style={ListCardStyles.dateDot} />
          <Text style={ListCardStyles.dateText}>{formatDate(item.createdAt)}</Text>
        </View>

        <View style={ListCardStyles.progressWrap}>
          <View style={ListCardStyles.progressMeta}>
            <Text style={ListCardStyles.progressMetaLabel}>Progresso</Text>
            <Text style={[ListCardStyles.progressMetaValue, { color: barColor }]}>
              {completed}/{total} itens
            </Text>
          </View>
          <View style={ListCardStyles.progressTrack}>
            <View style={[ListCardStyles.progressBar, { width: `${pct}%`, backgroundColor: barColor }]} />
          </View>
        </View>

        <View style={ListCardStyles.footerRow}>
          <View style={ListCardStyles.footerLeft}>
            <Text style={ListCardStyles.footerLeftText}>{total} itens</Text>
          </View>
          <Text style={[ListCardStyles.statusText, { color: isCompleted ? '#16A34A' : '#2563EB' }]}>
            {isCompleted ? '✓ Concluída' : 'Em andamento'}
          </Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
}

export default memo(ListCard);
