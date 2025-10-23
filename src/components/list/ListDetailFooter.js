import { ScrollView, Text, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import Button from '../Button';
import Chip from '../Chip';

export default function ListDetailFooter({
  styles,
  palette,
  priceHistory,
  familyMembers,
  listMembers,
  onMemberToggle,
  onArchive,
  onDelete,
  insets,
  keyboardHeight,
}) {
  const { priceData, priceTrend, availablePriceItems, selectedPriceItem, setSelectedPriceItem } = priceHistory;

  return (
    <>
      <View style={[styles.card, { backgroundColor: palette.card }]}>
        <Text style={[styles.cardTitle, { color: palette.text }]}>Histórico de Preços</Text>
        {!!priceTrend && (
          <Text style={{ color: priceTrend.up ? palette.danger : palette.success, fontWeight: '600', marginBottom: 6 }}>
            {priceTrend.up ? '▲' : '▼'} {Math.abs(priceTrend.diff).toFixed(2)} ({priceTrend.pct.toFixed(1)}%) vs ponto anterior
          </Text>
        )}
        {availablePriceItems.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 4 }}>
            {availablePriceItems.map((name) => (
              <Chip key={name} label={name} active={selectedPriceItem === name} onPress={() => setSelectedPriceItem(name)} />
            ))}
          </ScrollView>
        ) : (
          <Text style={[styles.emptyText, { color: palette.mutedText }]}>Nenhum item com preço registrado.</Text>
        )}
        {priceData.length > 0 ? (
          <>
            <LineChart
              data={priceData}
              isAnimated
              curved={priceData.length > 1}
              areaChart
              startFillColor="rgba(59,130,246,0.25)"
              endFillColor="rgba(59,130,246,0.05)"
              startOpacity={0.9}
              endOpacity={0.05}
              hideDataPoints={false}
              dataPointsColor={palette.primary}
              yAxisTextStyle={{ color: palette.text, fontSize: 10 }}
              xAxisLabelTextStyle={{ color: palette.mutedText, fontSize: 10, transform: [{ translateY: 4 }] }}
              noOfSections={4}
              spacing={42}
              initialSpacing={24}
              focusEnabled
              showStripOnFocus={priceData.length > 1}
            />
            {priceData.length === 1 && (
              <Text style={[styles.emptyText, { color: palette.mutedText, marginTop: 8 }]}>Adicione outra alteração de preço para ver tendência.</Text>
            )}
          </>
        ) : (
          <Text style={[styles.emptyText, { color: palette.mutedText }]}>Nenhum registro de preço ainda.</Text>
        )}
      </View>

      <View style={[styles.card, { backgroundColor: palette.card }]}>
        <Text style={[styles.cardTitle, { color: palette.text }]}>Membros na Lista</Text>
        <View style={styles.membersRow}>
          {familyMembers.length === 0 && (
            <Text style={[styles.emptyText, { color: palette.mutedText }]}>Nenhum membro encontrado.</Text>
          )}
          {familyMembers.map((member) => {
            const initial = (member?.displayName || member?.email || '?').slice(0, 1).toUpperCase();
            const inList = Array.isArray(listMembers) && listMembers.includes(member.id);
            return (
              <View key={member.id} style={styles.memberAvatarBox}>
                <View style={[styles.memberAvatar, { backgroundColor: palette.primary }]}>
                  <Text style={styles.memberAvatarText}>{initial}</Text>
                </View>
                <Text style={[styles.memberName, { color: palette.text }]}>{member.displayName || member.email}</Text>
                <Button
                  title={inList ? 'Remover' : 'Adicionar'}
                  variant="light"
                  onPress={() => onMemberToggle(member.id)}
                  style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10, minHeight: 32, alignSelf: 'center', backgroundColor: 'transparent', borderWidth: 1, borderColor: inList ? palette.danger : palette.success }}
                  textStyle={{ fontSize: 12, color: inList ? palette.danger : palette.success, fontWeight: '600' }}
                />
              </View>
            );
          })}
        </View>
      </View>

      <Button variant="dark" title="Concluir Lista" onPress={onArchive} />
      <View style={{ height: 8 }} />
      <Button variant="danger" title="Excluir Lista" onPress={onDelete} />

      {/* Spacer to avoid bottom buttons being covered by the keyboard/safe-area when TabBar hidden */}
      <View style={{ height: Math.max(24, (insets?.bottom || 0) + (keyboardHeight ? keyboardHeight : 0)) }} />
    </>
  );
}
