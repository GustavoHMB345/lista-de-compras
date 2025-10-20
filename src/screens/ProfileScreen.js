import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddListModal from '../components/AddListModal';
import Button from '../components/Button';
import ScreensDefault from '../components/ScreensDefault';
import { DataContext } from '../contexts/DataContext';

const { width } = Dimensions.get('window');
const __fs = Math.min(1.2, Math.max(0.9, width / 390));
const profileStyles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: { flexGrow: 1, alignItems: 'center', paddingVertical: 24, paddingHorizontal: 12 },
  headerWrap: { alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 32 * __fs, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 13 * __fs, color: '#6B7280', marginTop: 4 },
  card: {
    width: '96%',
    maxWidth: 820,
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 22,
    marginBottom: 24,
    shadowColor: '#0B0B0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  avatarBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 26 * __fs },
  userMeta: { marginLeft: 14, flex: 1 },
  name: { fontWeight: '700', fontSize: 20 * __fs, color: '#111827' },
  email: { color: '#6B7280', fontSize: 13 * __fs, marginTop: 2 },
  label: { fontSize: 12 * __fs, color: '#6B7280', marginBottom: 6, fontWeight: '600' },
  inputRow: { flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 8 },
  input: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    flex: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    color: '#111827',
  },
  editIconBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  displayName: { fontWeight: '700', fontSize: 18 * __fs, color: '#111827', flex: 1 },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  sectionTitle: { fontSize: 16 * __fs, fontWeight: '700', color: '#111827', marginBottom: 10 },
  logoutButton: { marginTop: 8 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  infoLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoLabel: { color: '#6B7280', fontSize: 12 * __fs },
  infoValue: { color: '#111827', fontWeight: '600', fontSize: 12 * __fs },
  prefRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
});

function ProfileScreen() {
  const {
    currentUser,
    users,
    updateUsers,
    logout,
    shoppingLists,
    updateLists,
    uiPrefs,
    toggleTheme,
    toggleTabBarPosition,
  } = useContext(DataContext);
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [isEditing, setIsEditing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();
  const progress = useState(new Animated.Value(0))[0];

  // Sync display name when user loads (unless editing)
  useEffect(() => {
    if (currentUser && !isEditing) {
      setDisplayName(currentUser.displayName || '');
    }
  }, [currentUser, isEditing]);

  const handleUpdateProfile = () => {
    if (displayName.trim() === '') return;
    const updatedUsers = users.map((u) => (u.id === currentUser.id ? { ...u, displayName } : u));
    updateUsers(updatedUsers);
    setIsEditing(false);
  };

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

  if (!currentUser) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f0f5ff',
        }}
      >
        <Text style={{ color: '#111827', fontSize: 16 }}>Carregando perfil...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f5ff' }} edges={['top']}>
      <ScreensDefault
        active="PROFILE"
        leftTab={undefined}
        rightTab="LISTS"
        contentStyle={profileStyles.scrollContent}
        hideTabBarOnScroll
      >
          <LinearGradient
            colors={['#EFF6FF', '#E0E7FF']}
            style={[StyleSheet.absoluteFillObject, { zIndex: -1 }]}
          />
            <View style={profileStyles.headerWrap}>
              <Text style={profileStyles.title}>👤 Minha Conta</Text>
              <Text style={profileStyles.subtitle}>Gerencie seu perfil e preferências</Text>
            </View>

            {/* Preferências rápidas: Tema e Posição da TabBar com toggles */}
            <View style={profileStyles.card}>
              <Text style={profileStyles.sectionTitle}>Preferências</Text>
              <View>
                <View style={profileStyles.prefRow}>
                  <Text style={{ color: '#374151', fontSize: 14 * __fs }}>
                    {uiPrefs?.theme === 'dark' ? '🌙' : '☀️'} Modo Escuro
                  </Text>
                  <Switch
                    value={uiPrefs?.theme === 'dark'}
                    onValueChange={toggleTheme}
                    trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                    thumbColor={uiPrefs?.theme === 'dark' ? '#2563EB' : '#FFFFFF'}
                    accessibilityLabel="Alternar modo escuro"
                  />
                </View>
                <View style={profileStyles.prefRow}>
                  <Text style={{ color: '#374151', fontSize: 14 * __fs }}>⬆️ TabBar no topo</Text>
                  <Switch
                    value={uiPrefs?.tabBarPosition === 'top'}
                    onValueChange={toggleTabBarPosition}
                    trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                    thumbColor={uiPrefs?.tabBarPosition === 'top' ? '#2563EB' : '#FFFFFF'}
                    accessibilityLabel="Alternar posição da TabBar para topo"
                  />
                </View>
              </View>
            </View>

            <View style={profileStyles.card}>
              <View style={profileStyles.avatarBox}>
                <View style={profileStyles.avatar}>
                  <Text style={profileStyles.avatarText}>
                    {(displayName || currentUser.email || '?')[0]}
                  </Text>
                </View>
                <View style={profileStyles.userMeta}>
                  <Text style={profileStyles.name}>{displayName}</Text>
                  <Text style={profileStyles.email}>{currentUser.email || ''}</Text>
                </View>
                {!isEditing && (
                  <TouchableOpacity
                    onPress={() => setIsEditing(true)}
                    style={profileStyles.editIconBtn}
                    activeOpacity={0.85}
                    accessibilityLabel="Editar nome de exibição"
                    accessibilityRole="button"
                  >
                    <Text style={{ fontSize: 16 }}>✏️</Text>
                  </TouchableOpacity>
                )}
              </View>
              <Text style={profileStyles.label}>Nome de Exibição</Text>
              {isEditing ? (
                <View style={profileStyles.inputRow}>
                  <TextInput
                    style={profileStyles.input}
                    value={displayName}
                    onChangeText={setDisplayName}
                    placeholder="Seu nome"
                    placeholderTextColor="#9CA3AF"
                    selectionColor="#2563EB"
                  />
                  <Button
                    onPress={handleUpdateProfile}
                    title="Salvar"
                    withGradient
                    gradientPreset="success"
                    accessibilityLabel="Salvar alterações"
                  />
                </View>
              ) : (
                <View style={profileStyles.inputRow}>
                  <Text style={profileStyles.displayName}>{displayName}</Text>
                </View>
              )}
            </View>

            <View style={profileStyles.card}>
              <Text style={profileStyles.sectionTitle}>Resumo</Text>
              {(() => {
                const familyLists = shoppingLists.filter(
                  (l) => l.familyId === currentUser.familyId,
                );
                const isCompleted = (list) => {
                  const items = list.items || [];
                  return (
                    items.length > 0 &&
                    items.every((it) => it.isPurchased || it.done || it.completed || it.checked)
                  );
                };
                const total = familyLists.length;
                const completed = familyLists.filter(isCompleted).length;
                const active = total - completed;
                return (
                  <>
                    <View style={profileStyles.infoRow}>
                      <View style={profileStyles.infoLeft}>
                        <Text style={{ fontSize: 14 }}>📋</Text>
                        <Text style={profileStyles.infoLabel}>Listas Totais</Text>
                      </View>
                      <Text style={profileStyles.infoValue}>{total}</Text>
                    </View>
                    <View style={profileStyles.infoRow}>
                      <View style={profileStyles.infoLeft}>
                        <Text style={{ fontSize: 14 }}>⏳</Text>
                        <Text style={profileStyles.infoLabel}>Listas Ativas</Text>
                      </View>
                      <Text style={profileStyles.infoValue}>{active}</Text>
                    </View>
                    <View style={profileStyles.infoRow}>
                      <View style={profileStyles.infoLeft}>
                        <Text style={{ fontSize: 14 }}>✔️</Text>
                        <Text style={profileStyles.infoLabel}>Listas Concluídas</Text>
                      </View>
                      <Text style={profileStyles.infoValue}>{completed}</Text>
                    </View>
                  </>
                );
              })()}
            </View>

            <Button
              variant="danger"
              title="Sair da Conta"
              onPress={logout}
              style={profileStyles.logoutButton}
            />
            <View style={{ height: 96 }} />
      </ScreensDefault>
      <AddListModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCreate={(newList) => {
          updateLists([
            ...shoppingLists,
            {
              ...newList,
              id: `list_${Date.now()}`,
              familyId: currentUser.familyId,
              createdAt: new Date().toISOString(),
              status: 'active',
              members: [currentUser.id],
            },
          ]);
        }}
      />
      {/* TabBar movida para o topo */}
    </SafeAreaView>
  );
}

export default ProfileScreen;
