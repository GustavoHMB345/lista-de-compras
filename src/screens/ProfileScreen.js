import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddListModal from '../components/AddListModal';
import Button from '../components/Button';
import { CheckIcon, EditIcon } from '../components/Icons';
import SwipeNavigator from '../components/SwipeNavigator';
import TabBar from '../components/TabBar';
import { DataContext } from '../contexts/DataContext';

const { width } = Dimensions.get('window');
const __fs = Math.min(1.2, Math.max(0.9, width / 390));
const profileStyles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: { flexGrow: 1, alignItems: 'center', paddingVertical: 24, paddingHorizontal: 12 },
  headerWrap: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 30 * __fs, fontWeight: 'bold', color: '#111827' },
  subtitle: { fontSize: 14 * __fs, color: '#6B7280', marginTop: 4 },
  card: {
    width: '96%',
    maxWidth: 820,
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#000',
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
  label: { fontSize: 13 * __fs, color: '#374151', marginBottom: 6, fontWeight: '600' },
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
  saveButton: {
    backgroundColor: '#16A34A',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    minHeight: 40,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    minHeight: 40,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  displayName: { fontWeight: '700', fontSize: 18 * __fs, color: '#111827', flex: 1 },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  sectionTitle: { fontSize: 16 * __fs, fontWeight: '700', color: '#111827', marginBottom: 10 },
  logoutButton: { marginTop: 8 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  infoLabel: { color: '#6B7280', fontSize: 12 * __fs },
  infoValue: { color: '#111827', fontWeight: '600', fontSize: 12 * __fs },
});

function ProfileScreen() {
  const { currentUser, users, updateUsers, logout, shoppingLists, updateLists } =
    useContext(DataContext);
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
      <TabBar active={'PROFILE'} onNavigate={handleNavigate} />
      <SwipeNavigator onSwipeRight={() => handleNavigate('DASHBOARD')} isLast progress={progress}>
        <LinearGradient colors={['#EFF6FF', '#E0E7FF']} style={profileStyles.root}>
          <ScrollView
            contentContainerStyle={profileStyles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={profileStyles.headerWrap}>
              <Text style={profileStyles.title}>👤 Minha Conta</Text>
              <Text style={profileStyles.subtitle}>Gerencie seu perfil e preferências</Text>
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
                  <TouchableOpacity
                    onPress={handleUpdateProfile}
                    style={profileStyles.saveButton}
                    activeOpacity={0.85}
                  >
                    <CheckIcon />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={profileStyles.inputRow}>
                  <Text style={profileStyles.displayName}>{displayName}</Text>
                  <TouchableOpacity
                    onPress={() => setIsEditing(true)}
                    style={profileStyles.editButton}
                    activeOpacity={0.85}
                  >
                    <EditIcon />
                  </TouchableOpacity>
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
                      <Text style={profileStyles.infoLabel}>Listas Totais</Text>
                      <Text style={profileStyles.infoValue}>{total}</Text>
                    </View>
                    <View style={profileStyles.infoRow}>
                      <Text style={profileStyles.infoLabel}>Listas Ativas</Text>
                      <Text style={profileStyles.infoValue}>{active}</Text>
                    </View>
                    <View style={profileStyles.infoRow}>
                      <Text style={profileStyles.infoLabel}>Listas Concluídas</Text>
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
          </ScrollView>
        </LinearGradient>
      </SwipeNavigator>
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
