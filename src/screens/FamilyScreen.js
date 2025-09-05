import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useContext, useMemo, useState } from 'react';
import { Alert, Animated, Dimensions, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SwipeNavigator from '../components/SwipeNavigator';
import TabBar from '../components/TabBar';
import { DataContext } from '../contexts/DataContext';

const { width } = Dimensions.get('window');
const __fs = Math.min(1.2, Math.max(0.9, width / 390));
const MAX_WIDTH = Math.min(820, width * 0.98);
const familyStyles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { alignItems: 'center', paddingBottom: 28, paddingTop: 18 },
  card: { backgroundColor: '#fff', borderRadius: 22, padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4, marginVertical: 10, width: MAX_WIDTH },
    headerCenter: { alignItems: 'center' },
    emoji: { fontSize: 48, marginBottom: 8 },
    title: { fontSize: 26 * __fs, fontWeight: 'bold', color: '#1F2937' },
    subtitle: { fontSize: 14 * __fs, color: '#6B7280', marginTop: 2, textAlign: 'center' },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 },
    statBox: { flex: 1, minWidth: 140, padding: 12, borderRadius: 14, alignItems: 'center' },
    statValue: { fontSize: 20 * __fs, fontWeight: 'bold' },
    statLabel: { fontSize: 12 * __fs, color: '#4B5563' },
    grid: { gap: 12 },
  familyCard: { backgroundColor: '#fff', borderRadius: 22, padding: 16, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
    famTitle: { fontSize: 18 * __fs, fontWeight: '700', color: '#111827' },
    famDesc: { fontSize: 12 * __fs, color: '#6B7280', marginTop: 2 },
    badge: { position: 'absolute', right: 12, top: 12, backgroundColor: '#F59E0B', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
    badgeText: { color: '#fff', fontWeight: '700', fontSize: 10 * __fs },
    row: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
    miniStat: { flex: 1, alignItems: 'center', padding: 10, borderRadius: 12 },
    miniVal: { fontSize: 16 * __fs, fontWeight: '700' },
    miniLab: { fontSize: 11 * __fs, color: '#6B7280' },
    actionsRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
    btn: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
    btnPrimary: { backgroundColor: '#2563EB' },
    btnGray: { backgroundColor: '#E5E7EB' },
    btnText: { color: '#fff', fontWeight: '600' },
    btnTextGray: { color: '#111827', fontWeight: '600' },
    // Modal
    modalWrap: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 16 },
    modalCard: { backgroundColor: '#fff', width: Math.min(420, width * 0.94), borderRadius: 18, padding: 16 },
    input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 * __fs, marginTop: 8 },
    rowEnd: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 12 },
});

function FamilyScreen() {
    const { families, users, currentUser, shoppingLists, updateFamilies } = useContext(DataContext);
    const router = useRouter();
    const progress = useState(new Animated.Value(0))[0];
    const [showNewFamily, setShowNewFamily] = useState(false);
    const [famName, setFamName] = useState('');
    const [famDesc, setFamDesc] = useState('');
    const [detailsFamily, setDetailsFamily] = useState(null);
    const [manageFamily, setManageFamily] = useState(null);

  const myFamilies = useMemo(
    () => !currentUser ? [] : families.filter(f => (f.members || []).includes(currentUser.id)),
    [families, currentUser]
  );

    const stats = useMemo(() => {
        const totalFamilies = myFamilies.length;
        const adminFamilies = myFamilies.filter(f => f.owner === currentUser?.id).length;
        const totalMembers = myFamilies.reduce((sum, f) => sum + (f.members?.length || 0), 0);
    const activeLists = currentUser ? shoppingLists.filter(
      (l) => l.status !== 'archived' && myFamilies.some((f) => f.id === l.familyId)
    ).length : 0;
        return { totalFamilies, adminFamilies, totalMembers, activeLists };
    }, [myFamilies, currentUser, shoppingLists]);

    const handleNavigate = (screen) => {
        switch (screen) {
            case 'DASHBOARD':
                router.push('/dashboard');
                break;
            case 'LISTS':
                router.push('/lists');
                break;
            case 'FAMILY':
                router.push('/family');
                break;
            case 'PROFILE':
                router.push('/profile');
                break;
            default:
                break;
        }
    };

    const familyMembers = (f) => (f.members || []).map((id) => users.find((u) => u.id === id)).filter(Boolean);

    const leaveFamily = (f) => {
        if (!f) return;
        const isOwner = f.owner === currentUser?.id;
        const otherMembers = (f.members || []).filter((id) => id !== currentUser?.id);
        const familiesCopy = families.map((fam) => ({ ...fam }));
        const idx = familiesCopy.findIndex((fam) => fam.id === f.id);
        if (idx < 0) return;

        if (isOwner) {
            if (otherMembers.length === 0) {
                // remove family entirely if no members left
                const updated = familiesCopy.filter((fam) => fam.id !== f.id);
                updateFamilies(updated);
                return;
            }
            // transfer ownership to first remaining member
            familiesCopy[idx].owner = otherMembers[0];
        }
        familiesCopy[idx].members = otherMembers;
        updateFamilies(familiesCopy);
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
            // cannot remove current owner via toggle here
            if (isOwner) return;
            next[idx].members = (f.members || []).filter((id) => id !== memberId);
        }
        updateFamilies(next);
    };

    return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f5ff' }} edges={['top']}>
      <SwipeNavigator onSwipeLeft={() => handleNavigate('LISTS')} isFirst progress={progress}>
        <LinearGradient colors={["#EFF6FF", "#E0E7FF"]} style={familyStyles.root}>
        <ScrollView contentContainerStyle={familyStyles.scroll} showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <View style={familyStyles.card}>
                        <View style={familyStyles.headerCenter}>
                            <Text style={familyStyles.emoji}>👨‍👩‍👧‍👦</Text>
                            <Text style={familyStyles.title}>Minhas Famílias</Text>
                            <Text style={familyStyles.subtitle}>Gerencie as listas de compras das suas famílias</Text>
                        </View>
                        <View style={familyStyles.statsGrid}>
                            <View style={[familyStyles.statBox, { backgroundColor: '#EFF6FF' }]}>
                                <Text style={[familyStyles.statValue, { color: '#2563EB' }]}>{stats.totalFamilies}</Text>
                                <Text style={familyStyles.statLabel}>Famílias</Text>
                            </View>
                            <View style={[familyStyles.statBox, { backgroundColor: '#ECFDF5' }]}>
                                <Text style={[familyStyles.statValue, { color: '#16A34A' }]}>{stats.adminFamilies}</Text>
                                <Text style={familyStyles.statLabel}>Admin</Text>
                            </View>
                            <View style={[familyStyles.statBox, { backgroundColor: '#FEFCE8' }]}>
                                <Text style={[familyStyles.statValue, { color: '#CA8A04' }]}>{stats.totalMembers}</Text>
                                <Text style={familyStyles.statLabel}>Membros</Text>
                            </View>
                            <View style={[familyStyles.statBox, { backgroundColor: '#F5F3FF' }]}>
                                <Text style={[familyStyles.statValue, { color: '#7C3AED' }]}>{stats.activeLists}</Text>
                                <Text style={familyStyles.statLabel}>Listas Ativas</Text>
                            </View>
                        </View>
                    </View>

                    {/* Families Grid */}
            <View style={[familyStyles.card, { backgroundColor: 'transparent', shadowOpacity: 0, elevation: 0, padding: 0 }]}> 
                        <View style={{ gap: 12 }}>
                {myFamilies.map((f) => {
                                const isOwner = f.owner === currentUser?.id;
                                const mems = familyMembers(f);
                                return (
                                    <View key={f.id} style={familyStyles.familyCard}>
                                        {isOwner && (
                                            <View style={familyStyles.badge}><Text style={familyStyles.badgeText}>👑 Admin</Text></View>
                                        )}
                                        <Text style={familyStyles.famTitle}>{f.name}</Text>
                                        <Text style={familyStyles.famDesc}>{f.description || 'Sem descrição'}</Text>
                                        <View style={[familyStyles.row, { marginTop: 12 }]}>
                                            <View style={[familyStyles.miniStat, { backgroundColor: '#EFF6FF' }]}>
                                                <Text style={[familyStyles.miniVal, { color: '#2563EB' }]}>{mems.length}</Text>
                                                <Text style={familyStyles.miniLab}>Membros</Text>
                                            </View>
                                            <View style={[familyStyles.miniStat, { backgroundColor: '#ECFDF5' }]}>
                                                <Text style={[familyStyles.miniVal, { color: '#16A34A' }]}>{shoppingLists.filter(l => l.familyId === f.id && l.status !== 'archived').length}</Text>
                                                <Text style={familyStyles.miniLab}>Listas Ativas</Text>
                                            </View>
                                        </View>
                                        <View style={familyStyles.actionsRow}>
                                            <TouchableOpacity style={[familyStyles.btn, familyStyles.btnPrimary]} activeOpacity={0.9} onPress={() => setDetailsFamily(f)}>
                                                <Text style={familyStyles.btnText}>Ver Detalhes</Text>
                                            </TouchableOpacity>
                                            {isOwner ? (
                                                <TouchableOpacity style={[familyStyles.btn, familyStyles.btnGray]} activeOpacity={0.9} onPress={() => setManageFamily(f) }>
                                                    <Text style={familyStyles.btnTextGray}>Gerenciar</Text>
                                                </TouchableOpacity>
                                            ) : (
                                                <TouchableOpacity style={[familyStyles.btn, familyStyles.btnGray]} activeOpacity={0.9} onPress={() => {
                                                    Alert.alert('Sair da família', `Deseja sair de ${f.name}?`, [
                                                        { text: 'Cancelar', style: 'cancel' },
                                                        { text: 'Sair', style: 'destructive', onPress: () => leaveFamily(f) },
                                                    ]);
                                                } }>
                                                    <Text style={familyStyles.btnTextGray}>Sair</Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    </View>

                    {/* Add Family Button */}
                    <View style={[familyStyles.card, { alignItems: 'center' }]}> 
                        <TouchableOpacity style={[familyStyles.btn, familyStyles.btnPrimary, { maxWidth: 320 }]} onPress={() => setShowNewFamily(true)} activeOpacity={0.95}>
                            <Text style={familyStyles.btnText}>Criar Nova Família</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
                </LinearGradient>
            </SwipeNavigator>

            {/* New Family Modal */}
            <Modal transparent visible={showNewFamily} animationType="fade" onRequestClose={() => setShowNewFamily(false)}>
                <View style={familyStyles.modalWrap}>
                    <View style={familyStyles.modalCard}>
                        <Text style={{ fontSize: 18 * __fs, fontWeight: '700', color: '#111827' }}>Nova Família</Text>
                        <Text style={{ fontSize: 12 * __fs, color: '#6B7280', marginTop: 2 }}>Dê um nome para sua família</Text>
                        <TextInput placeholder="Nome da família" style={familyStyles.input} value={famName} onChangeText={setFamName} />
                        <TextInput placeholder="Descrição (opcional)" style={familyStyles.input} value={famDesc} onChangeText={setFamDesc} />
                        <View style={familyStyles.rowEnd}>
                            <TouchableOpacity onPress={() => setShowNewFamily(false)} style={[familyStyles.btn, familyStyles.btnGray, { flex: 0 }]}>
                                <Text style={familyStyles.btnTextGray}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    if (!famName.trim()) return;
                                    if (currentUser) {
                                      const newFamily = { id: `family_${Date.now()}`, name: famName.trim(), description: famDesc.trim(), owner: currentUser.id, members: [currentUser.id] };
                                      updateFamilies([ ...families, newFamily ]);
                                    }
                                    setFamName(''); setFamDesc(''); setShowNewFamily(false);
                                }}
                                style={[familyStyles.btn, familyStyles.btnPrimary, { flex: 0 }]}
                            >
                                <Text style={familyStyles.btnText}>Criar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <TabBar active={'FAMILY'} onNavigate={handleNavigate} />

            {/* Details Modal */}
            <FamilyDetailsModal
              visible={!!detailsFamily}
              family={detailsFamily}
              onClose={() => setDetailsFamily(null)}
              shoppingLists={shoppingLists}
              users={users}
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
                // transfer ownership
                const idx = families.findIndex((fam) => fam.id === f.id);
                if (idx < 0) return;
                const next = families.map((fam) => ({ ...fam }));
                if (!(next[idx].members || []).includes(uid)) {
                  next[idx].members = [...(next[idx].members || []), uid];
                }
                next[idx].owner = uid;
                updateFamilies(next);
              }}
            />
        </SafeAreaView>
    );
}

export default FamilyScreen;

// Details & Manage Modals appended above to keep single-file implementation concise.

function FamilyDetailsModal({ visible, family, onClose, shoppingLists, users }) {
  if (!family) return null;
  const mems = (family.members || []).map((id) => users.find((u) => u.id === id)).filter(Boolean);
  const active = shoppingLists.filter((l) => l.familyId === family.id && l.status !== 'archived');
  const archived = shoppingLists.filter((l) => l.familyId === family.id && l.status === 'archived');
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={familyStyles.modalWrap}>
        <View style={familyStyles.modalCard}>
          <Text style={{ fontSize: 18 * __fs, fontWeight: '700', color: '#111827' }}>{family.name}</Text>
          {family.description ? (
            <Text style={{ color: '#6B7280', marginTop: 4 }}>{family.description}</Text>
          ) : null}
          <View style={{ marginTop: 12 }}>
            <Text style={{ fontWeight: '700', color: '#111827' }}>Membros</Text>
            {mems.length === 0 ? <Text style={{ color: '#6B7280' }}>Sem membros</Text> : (
              mems.map((m) => (
                <Text key={m.id} style={{ color: '#374151', marginTop: 4 }}>• {m.displayName} {m.id === family.owner ? '(Admin)' : ''}</Text>
              ))
            )}
          </View>
          <View style={{ marginTop: 12 }}>
            <Text style={{ fontWeight: '700', color: '#111827' }}>Listas</Text>
            <Text style={{ color: '#6B7280', marginTop: 4 }}>Ativas: {active.length} • Arquivadas: {archived.length}</Text>
          </View>
          <View style={familyStyles.rowEnd}>
            <TouchableOpacity onPress={onClose} style={[familyStyles.btn, familyStyles.btnGray, { flex: 0 }]}>
              <Text style={familyStyles.btnTextGray}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function ManageMembersModal({ visible, family, onClose, users, onToggleMember, onTransferOwner, currentUserId }) {
  if (!family) return null;
  const sortedUsers = users.slice().sort((a,b) => a.displayName.localeCompare(b.displayName));
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={familyStyles.modalWrap}>
        <View style={familyStyles.modalCard}>
          <Text style={{ fontSize: 18 * __fs, fontWeight: '700', color: '#111827' }}>Gerenciar Membros</Text>
          <Text style={{ color: '#6B7280', marginTop: 2 }}>{family.name}</Text>
          <ScrollView style={{ maxHeight: 300, marginTop: 8 }}>
            {sortedUsers.map((u) => {
              const isMember = (family.members || []).includes(u.id);
              const isOwner = family.owner === u.id;
              return (
                <View key={u.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 }}>
                  <Text style={{ color: '#111827' }}>{u.displayName} {isOwner ? '(Admin)' : ''}</Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {!isOwner && (
                      <TouchableOpacity onPress={() => onToggleMember(family, u.id)} style={[familyStyles.btn, isMember ? familyStyles.btnGray : familyStyles.btnPrimary, { flex: 0, paddingVertical: 6 }]}>
                        <Text style={isMember ? familyStyles.btnTextGray : familyStyles.btnText}>{isMember ? 'Remover' : 'Adicionar'}</Text>
                      </TouchableOpacity>
                    )}
                    {currentUserId !== u.id && !isOwner && (
                      <TouchableOpacity onPress={() => onTransferOwner(family, u.id)} style={[familyStyles.btn, familyStyles.btnPrimary, { flex: 0, paddingVertical: 6 }]}>
                        <Text style={familyStyles.btnText}>Tornar Admin</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </ScrollView>
          <View style={familyStyles.rowEnd}>
            <TouchableOpacity onPress={onClose} style={[familyStyles.btn, familyStyles.btnGray, { flex: 0 }]}>
              <Text style={familyStyles.btnTextGray}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

