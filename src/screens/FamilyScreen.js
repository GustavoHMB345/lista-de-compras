import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useContext, useMemo, useState } from 'react';
import {
    Alert,
    Dimensions,
    Modal,
    Pressable,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import {
    ChevronRightIcon,
    ListCheckIcon,
    MagnifyingGlassIcon,
    ShieldIcon,
    UserIcon,
    UsersGroupIcon,
} from '../components/Icons';
import ScreensDefault from '../components/ScreensDefault';
import { useTheme } from '../components/theme';
import { DataContext } from '../contexts/DataContext';

const { width } = Dimensions.get('window');
const __fs = Math.min(1.2, Math.max(0.9, width / 390));
const MAX_WIDTH = Math.min(820, width * 0.98);
const familyStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f0f5ff' },
  scroll: { alignItems: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 18,
    shadowColor: '#0B0B0B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginVertical: 10,
    width: MAX_WIDTH,
  },
  headerCenter: { alignItems: 'center' },
  emoji: { fontSize: 48, marginBottom: 8 },
  title: { fontSize: 26 * __fs, fontWeight: 'bold', color: '#1F2937' },
  subtitle: { fontSize: 14 * __fs, color: '#6B7280', marginTop: 2, textAlign: 'center' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 },
  statBox: { flex: 1, minWidth: 140, padding: 12, borderRadius: 14, alignItems: 'center' },
  statValue: { fontSize: 20 * __fs, fontWeight: 'bold' },
  statLabel: { fontSize: 12 * __fs, color: '#4B5563' },
  grid: { gap: 12 },
  familyCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0B0B0B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  famHeaderRow: { flexDirection: 'row', alignItems: 'center' },
  famHeaderText: { flex: 1 },
  famTitle: { fontSize: 18 * __fs, fontWeight: '700', color: '#111827' },
  famDesc: { fontSize: 12 * __fs, color: '#6B7280', marginTop: 2 },
  badge: {
    position: 'absolute',
    right: 12,
    top: 12,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: { color: '#fff', fontWeight: '700', fontSize: 10 * __fs },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  miniStat: { flex: 1, alignItems: 'center', padding: 10, borderRadius: 12 },
  miniVal: { fontSize: 16 * __fs, fontWeight: '700' },
  miniLab: { fontSize: 11 * __fs, color: '#6B7280' },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  // Modal
  modalWrap: {
    flex: 1,
    backgroundColor: 'rgba(11,11,11,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#fff',
    width: Math.min(420, width * 0.94),
    borderRadius: 18,
    padding: 16,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14 * __fs,
    marginTop: 8,
  },
  inputWrap: { position: 'relative' },
  inputIcon: { position: 'absolute', left: 12, top: 18, zIndex: 1 },
  inputWithIcon: { paddingLeft: 38 },
  rowEnd: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 12 },
});

function FamilyScreen() {
  const { families, users, currentUser, shoppingLists, updateFamilies } =
    useContext(DataContext);
  const { tokens: t, scheme } = useTheme();
  const router = useRouter();
  const [showNewFamily, setShowNewFamily] = useState(false);
  const [famName, setFamName] = useState('');
  const [famDesc, setFamDesc] = useState('');
  const [detailsFamily, setDetailsFamily] = useState(null);
  const [manageFamily, setManageFamily] = useState(null);
  const [famSearch, setFamSearch] = useState('');
  const [measuredFamilyCardH, setMeasuredFamilyCardH] = useState(null);

  const myFamilies = useMemo(
    () => (!currentUser ? [] : families.filter((f) => (f.members || []).includes(currentUser.id))),
    [families, currentUser],
  );

  const stats = useMemo(() => {
    const totalFamilies = myFamilies.length;
    const adminFamilies = myFamilies.filter((f) => f.owner === currentUser?.id).length;
    const totalMembers = myFamilies.reduce((sum, f) => sum + (f.members?.length || 0), 0);
    const activeLists = currentUser
      ? shoppingLists.filter((l) => {
          if (!myFamilies.some((f) => f.id === l.familyId)) return false;
          const items = l.items || [];
          const completed =
            items.length > 0 &&
            items.every((it) => it.isPurchased || it.done || it.completed || it.checked);
          return !completed;
        }).length
      : 0;
    return { totalFamilies, adminFamilies, totalMembers, activeLists };
  }, [myFamilies, currentUser, shoppingLists]);

  const familyMembers = (f) =>
    (f.members || []).map((id) => users.find((u) => u.id === id)).filter(Boolean);

  const filteredFamilies = useMemo(() => {
    const q = famSearch.trim().toLowerCase();
    const arr = myFamilies.filter((f) => {
      if (!q) return true;
      return (
        (f.name || '').toLowerCase().includes(q) || (f.description || '').toLowerCase().includes(q)
      );
    });
    // owner first, then name
    return arr.sort((a, b) => {
      const ao = a.owner === currentUser?.id ? 0 : 1;
      const bo = b.owner === currentUser?.id ? 0 : 1;
      if (ao !== bo) return ao - bo;
      return (a.name || '').localeCompare(b.name || '');
    });
  }, [myFamilies, famSearch, currentUser?.id]);

  const leaveFamily = (f) => {
    if (!f) return;
    const isOwner = f.owner === currentUser?.id;
    const otherMembers = (f.members || []).filter((id) => id !== currentUser?.id);
    const familiesCopy = families.map((fam) => ({ ...fam }));
    const idx = familiesCopy.findIndex((fam) => fam.id === f.id);
    if (idx < 0) return;

    const performLeave = () => {
      if (isOwner) {
        if (otherMembers.length === 0) {
          const updated = familiesCopy.filter((fam) => fam.id !== f.id);
          updateFamilies(updated);
          return;
        }
        familiesCopy[idx].owner = otherMembers[0];
      }
        familiesCopy[idx].members = otherMembers;
      updateFamilies(familiesCopy);
    };

    if (isOwner) {
      Alert.alert(
        'Sair da família',
        otherMembers.length === 0
          ? 'Você é o único membro. Ao sair, a família será removida. Deseja continuar?'
          : 'Você é o admin. Ao sair, a administração será transferida automaticamente para outro membro. Deseja continuar?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Sair', style: 'destructive', onPress: performLeave },
        ],
      );
      return;
    }
    performLeave();
  };

  const toggleMember = (f, memberId) => {
    if (!f) return;
    const idx = families.findIndex((fam) => fam.id === f.id);
    if (idx < 0) return;
    const isOwner = f.owner === memberId;
    const isMember = (f.members || []).includes(memberId);
    const next = families.map((fam) => ({ ...fam }));
    if (!isMember) {
      next[idx].members = [...(f.members || []), memberId];
    } else {
      if (isOwner) return;
      next[idx].members = (f.members || []).filter((id) => id !== memberId);
    }
    updateFamilies(next);
  };

  return (
    <SafeAreaView style={[familyStyles.root, { backgroundColor: t.background }]} edges={['top']}>
      <ScreensDefault
        active="FAMILY"
        leftTab="LISTS"
        rightTab="DASHBOARD"
        contentStyle={familyStyles.scroll}
  overlayBottomSpacer={0}
        scrollEndFromCardHeight={
          measuredFamilyCardH
            ? { cardHeight: measuredFamilyCardH, factor: 0.5, gap: 12, min: 24, max: 52 }
            : { cardHeight: 160, factor: 0.5, gap: 12, min: 24, max: 52 }
        }
      >
        {scheme === 'light' && (
          <LinearGradient
            colors={['#EFF6FF', '#E0E7FF']}
            style={[StyleSheet.absoluteFillObject, { zIndex: -1 }]}
          />
        )}

        {/* Header */}
        <View style={[familyStyles.card, { backgroundColor: t.card }]}>
          <View style={familyStyles.headerCenter}>
            <Text style={familyStyles.emoji}>👨‍👩‍👧‍👦</Text>
            <Text style={[familyStyles.title, { color: t.text }]}>Minhas Famílias</Text>
            <Text style={[familyStyles.subtitle, { color: t.muted }]}>
              Gerencie as listas de compras das suas famílias
            </Text>
          </View>
          <View style={familyStyles.statsGrid}>
            <View style={[familyStyles.statBox, { backgroundColor: scheme === 'dark' ? 'rgba(59,130,246,0.12)' : '#EFF6FF' }]}>
              <UsersGroupIcon color="#2563EB" />
              <Text style={[familyStyles.statValue, { color: '#2563EB', marginTop: 4 }]}>
                {stats.totalFamilies}
              </Text>
              <Text style={[familyStyles.statLabel, { color: t.muted }]}>Famílias</Text>
            </View>
            <View style={[familyStyles.statBox, { backgroundColor: scheme === 'dark' ? 'rgba(16,185,129,0.12)' : '#ECFDF5' }]}>
              <ShieldIcon color="#16A34A" />
              <Text style={[familyStyles.statValue, { color: '#16A34A', marginTop: 4 }]}>
                {stats.adminFamilies}
              </Text>
              <Text style={[familyStyles.statLabel, { color: t.muted }]}>Admin</Text>
            </View>
            <View style={[familyStyles.statBox, { backgroundColor: scheme === 'dark' ? 'rgba(202,138,4,0.12)' : '#FEFCE8' }]}>
              <UserIcon color="#CA8A04" />
              <Text style={[familyStyles.statValue, { color: '#CA8A04', marginTop: 4 }]}>
                {stats.totalMembers}
              </Text>
              <Text style={[familyStyles.statLabel, { color: t.muted }]}>Membros</Text>
            </View>
            <View style={[familyStyles.statBox, { backgroundColor: scheme === 'dark' ? 'rgba(124,58,237,0.12)' : '#F5F3FF' }]}>
              <ListCheckIcon color="#7C3AED" />
              <Text style={[familyStyles.statValue, { color: '#7C3AED', marginTop: 4 }]}>
                {stats.activeLists}
              </Text>
              <Text style={[familyStyles.statLabel, { color: t.muted }]}>Listas Ativas</Text>
            </View>
          </View>
          <View style={{ marginTop: 12 }}>
            <Text
              style={{
                color: t.text,
                fontSize: 12 * __fs,
                marginBottom: 6,
                fontWeight: '600',
              }}
            >
              Pesquisar famílias
            </Text>
            <View style={familyStyles.inputWrap}>
              <View style={familyStyles.inputIcon}>
                <MagnifyingGlassIcon />
              </View>
              <TextInput
                placeholder="Digite um nome ou descrição"
                style={[familyStyles.input, familyStyles.inputWithIcon, { backgroundColor: t.inputBg, borderColor: t.border, color: t.text }]}
                value={famSearch}
                onChangeText={setFamSearch}
                placeholderTextColor={t.muted}
                selectionColor={t.primary}
              />
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 8,
                marginTop: 10,
                flexWrap: 'wrap',
              }}
            >
              <Button
                title="Entrar por ID"
                variant="light"
                onPress={() => router.push('/join-family')}
              />
            </View>
          </View>
        </View>

        {/* Families Grid */}
        <View
          style={[
            familyStyles.card,
            { backgroundColor: 'transparent', shadowOpacity: 0, elevation: 0, padding: 0 },
          ]}
        >
          <View style={{ gap: 12 }}>
            {/* Quick access create pinned at top */}
            <View style={[familyStyles.familyCard, { alignItems: 'center', backgroundColor: t.card, borderColor: t.border }]}> 
              <Button
                title="Criar Nova Família"
                onPress={() => setShowNewFamily(true)}
                withGradient
                gradientPreset="primary"
              />
            </View>
            {filteredFamilies.map((f, idx) => {
              const isOwner = f.owner === currentUser?.id;
              const mems = familyMembers(f);
              const activeCount = shoppingLists.filter((l) => {
                if (l.familyId !== f.id) return false;
                const items = l.items || [];
                const completed =
                  items.length > 0 &&
                  items.every(
                    (it) => it.isPurchased || it.done || it.completed || it.checked,
                  );
                return !completed;
              }).length;
              return (
                <View
                  key={f.id}
                  style={[familyStyles.familyCard, { backgroundColor: t.card, borderColor: t.border }, idx === 0 ? { minHeight: 200 } : null]}
                  onLayout={!measuredFamilyCardH && idx === 0 ? (e) => setMeasuredFamilyCardH(Math.round(e.nativeEvent.layout.height)) : undefined}
                >
                  {isOwner && (
                    <View style={familyStyles.badge}>
                      <Text style={familyStyles.badgeText}>👑 Admin</Text>
                    </View>
                  )}
                  <Pressable
                    style={({ pressed }) => [
                      familyStyles.famHeaderRow,
                      { opacity: pressed ? 0.8 : 1 },
                    ]}
                    onPress={() => setDetailsFamily(f)}
                  >
                    <View style={familyStyles.famHeaderText}>
                      <Text style={[familyStyles.famTitle, { color: t.text }]}>{f.name}</Text>
                      <Text style={[familyStyles.famDesc, { color: t.muted }]}>
                        {f.description || 'Sem descrição'}
                      </Text>
                      {isOwner && (
                        <Text style={{ color: t.muted, marginTop: 4, fontSize: 11 * __fs }}>
                          Você é admin
                        </Text>
                      )}
                    </View>
                    <ChevronRightIcon color={t.muted} />
                  </Pressable>
                  <View style={[familyStyles.row, { marginTop: 12 }]}>
                    <View style={[familyStyles.miniStat, { backgroundColor: scheme === 'dark' ? 'rgba(59,130,246,0.12)' : '#EFF6FF' }]}>
                      <Text style={[familyStyles.miniVal, { color: '#2563EB' }]}>
                        {mems.length}
                      </Text>
                      <Text style={familyStyles.miniLab}>Membros</Text>
                    </View>
                    <View style={[familyStyles.miniStat, { backgroundColor: scheme === 'dark' ? 'rgba(16,185,129,0.12)' : '#ECFDF5' }]}>
                      <Text style={[familyStyles.miniVal, { color: '#16A34A' }]}>
                        {activeCount}
                      </Text>
                      <Text style={familyStyles.miniLab}>Listas Ativas</Text>
                    </View>
                  </View>
                  <View style={familyStyles.actionsRow}>
                    {isOwner ? (
                      <Button
                        variant="light"
                        title="Gerenciar"
                        onPress={() => setManageFamily(f)}
                      />
                    ) : (
                      <Button
                        variant="light"
                        title="Sair"
                        onPress={() => {
                          Alert.alert('Sair da família', `Deseja sair de ${f.name}?`, [
                            { text: 'Cancelar', style: 'cancel' },
                            {
                              text: 'Sair',
                              style: 'destructive',
                              onPress: () => leaveFamily(f),
                            },
                          ]);
                        }}
                      />
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
        {/* Removed duplicate 'Criar Nova Família' button at bottom (kept top quick-access) */}
      </ScreensDefault>

      {/* New Family Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={showNewFamily}
        onRequestClose={() => setShowNewFamily(false)}
      >
        <View style={familyStyles.modalWrap}>
          <View style={[familyStyles.modalCard, { backgroundColor: t.card }] }>
            <Text style={{ fontSize: 18 * __fs, fontWeight: '700', color: t.text }}>
              Nova Família
            </Text>
            <Text style={{ fontSize: 12 * __fs, color: t.muted, marginTop: 2 }}>
              Dê um nome para sua família
            </Text>
            <TextInput
              placeholder="Nome da família"
              style={[familyStyles.input, { backgroundColor: t.inputBg, borderColor: t.border, color: t.text }]}
              value={famName}
              onChangeText={setFamName}
              placeholderTextColor={t.muted}
              selectionColor={t.primary}
            />
            <TextInput
              placeholder="Descrição (opcional)"
              style={[familyStyles.input, { backgroundColor: t.inputBg, borderColor: t.border, color: t.text }]}
              value={famDesc}
              onChangeText={setFamDesc}
              placeholderTextColor={t.muted}
              selectionColor={t.primary}
            />
            <View style={[familyStyles.rowEnd, { justifyContent: 'center' }]}>
              <Button variant="light" title="Cancelar" onPress={() => setShowNewFamily(false)} />
              <Button
                title="Criar"
                onPress={() => {
                  if (!famName.trim()) return;
                  if (currentUser) {
                    const newFamily = {
                      id: `family_${Date.now()}`,
                      name: famName.trim(),
                      description: famDesc.trim(),
                      owner: currentUser.id,
                      members: [currentUser.id],
                    };
                    updateFamilies([...families, newFamily]);
                  }
                  setFamName('');
                  setFamDesc('');
                  setShowNewFamily(false);
                }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Details Modal */}
      <FamilyDetailsModal
        visible={!!detailsFamily}
        family={detailsFamily}
        onClose={() => setDetailsFamily(null)}
        shoppingLists={shoppingLists}
        users={users}
        currentUserId={currentUser?.id}
      />

      {/* Manage Members Modal */}
      <ManageMembersModal
        visible={!!manageFamily}
        family={manageFamily}
        onClose={() => setManageFamily(null)}
        users={users}
        currentUserId={currentUser?.id}
        onToggleMember={(f, uid) => toggleMember(f, uid)}
        onTransferOwner={(f, uid) => {
          const idx = families.findIndex((fam) => fam.id === f.id);
          if (idx < 0) return;
          const next = families.map((fam) => ({ ...fam }));
          if (!(next[idx].members || []).includes(uid)) {
            next[idx].members = [...(next[idx].members || []), uid];
          }
          next[idx].owner = uid;
          updateFamilies(next);
        }}
        onOwnerLeave={(f) => leaveFamily(f)}
      />
    </SafeAreaView>
  );
}

export default FamilyScreen;

// Details & Manage Modals
function FamilyDetailsModal({ visible, family, onClose, shoppingLists, users, currentUserId }) {
  const { tokens: t } = useTheme();
  if (!family) return null;
  const mems = (family.members || []).map((id) => users.find((u) => u.id === id)).filter(Boolean);
  const active = shoppingLists.filter((l) => {
    if (l.familyId !== family.id) return false;
    const items = l.items || [];
    const completed =
      items.length > 0 &&
      items.every((it) => it.isPurchased || it.done || it.completed || it.checked);
    return !completed;
  });
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={familyStyles.modalWrap}>
        <View style={[familyStyles.modalCard, { backgroundColor: t.card }] }>
          <Text style={{ fontSize: 18 * __fs, fontWeight: '700', color: t.text }}>
            {family.name}
          </Text>
          {currentUserId === family.owner && (
            <Text style={{ color: t.muted, marginTop: 2, fontSize: 11 * __fs }}>
              Você é admin
            </Text>
          )}
          {family.description ? (
            <Text style={{ color: t.muted, marginTop: 4 }}>{family.description}</Text>
          ) : null}
          <View style={{ marginTop: 12 }}>
            <Text style={{ fontWeight: '700', color: t.text }}>Membros</Text>
            {mems.length === 0 ? (
              <Text style={{ color: t.muted }}>Sem membros</Text>
            ) : (
              mems.map((m) => (
                <Text key={m.id} style={{ color: t.text, marginTop: 4 }}>
                  • {m.displayName} {m.id === family.owner ? '(Admin)' : ''}
                </Text>
              ))
            )}
          </View>
          <View style={{ marginTop: 12 }}>
            <Text style={{ fontWeight: '700', color: t.text }}>Listas</Text>
            <Text style={{ color: t.muted, marginTop: 4 }}>Ativas: {active.length}</Text>
          </View>
          <View style={[familyStyles.rowEnd, { justifyContent: 'center' }]}>
            <Button
              variant="light"
              title="Compartilhar código"
              onPress={() => {
                const msg = `Família: ${family.name}\nID: ${family.id}`;
                Share.share({ message: msg }).catch(() => {});
              }}
            />
            <Button variant="light" title="Fechar" onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function ManageMembersModal({
  visible,
  family,
  onClose,
  users,
  onToggleMember,
  onTransferOwner,
  currentUserId,
  onOwnerLeave,
}) {
  if (!family) return null;
  const { tokens: t } = useTheme();
  const sortedUsers = users.slice().sort((a, b) => a.displayName.localeCompare(b.displayName));
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={familyStyles.modalWrap}>
        <View style={[familyStyles.modalCard, { backgroundColor: t.card }] }>
          <Text style={{ fontSize: 18 * __fs, fontWeight: '700', color: t.text }}>
            Gerenciar Membros
          </Text>
          <Text style={{ color: t.muted, marginTop: 2 }}>{family.name}</Text>
          {currentUserId === family.owner && (
            <Text style={{ color: t.muted, marginTop: 4, fontSize: 11 * __fs }}>
              Você é admin
            </Text>
          )}
          <ScrollView style={{ maxHeight: 200, marginTop: 8 }}>
            {sortedUsers.map((u) => {
              const isMember = (family.members || []).includes(u.id);
              const isOwner = family.owner === u.id;
              return (
                <View
                  key={u.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 8,
                  }}
                >
                  <Text style={{ color: t.text }}>
                    {u.displayName} {isOwner ? '(Admin)' : ''}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {!isOwner && (
                      <Button
                        title={isMember ? 'Remover' : 'Adicionar'}
                        variant={isMember ? 'light' : 'primary'}
                        onPress={() => onToggleMember(family, u.id)}
                      />
                    )}
                    {currentUserId !== u.id && !isOwner && (
                      <Button title="Tornar Admin" onPress={() => onTransferOwner(family, u.id)} />
                    )}
                  </View>
                </View>
              );
            })}
          </ScrollView>
          {currentUserId === family.owner && (
            <View style={{ marginTop: 8, alignItems: 'center' }}>
              <Text
                style={{
                  color: t.muted,
                  fontSize: 11 * __fs,
                  textAlign: 'center',
                  marginBottom: 6,
                }}
              >
                Para sair, você pode transferir a administração para outra pessoa ou sair agora.
                Caso seja o único membro, a família será removida.
              </Text>
              <Button
                variant="danger"
                title="Sair da família"
                onPress={() => onOwnerLeave?.(family)}
              />
            </View>
          )}
          <View style={[familyStyles.rowEnd, { justifyContent: 'center' }]}>
            <Button variant="light" title="Fechar" onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
}
