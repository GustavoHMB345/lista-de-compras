import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddListModal from '../components/AddListModal';
import { CheckIcon, EditIcon } from '../components/Icons';
import NavBar from '../components/NavBar';
import SwipeNavigator from '../components/SwipeNavigator';
import { DataContext } from '../contexts/DataContext';

const profileStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', padding: 16 },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 18 },
  avatarBox: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 22 },
  name: { fontWeight: 'bold', fontSize: 18 },
  email: { color: '#6B7280', fontSize: 12 },
  label: { fontSize: 14, color: '#374151', marginBottom: 4, fontWeight: '500' },
  inputRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 8 },
  input: { backgroundColor: '#F3F4F6', padding: 10, borderRadius: 8, flex: 1 },
  saveButton: { backgroundColor: '#22C55E', padding: 8, borderRadius: 8 },
  editButton: { backgroundColor: '#6366F1', padding: 8, borderRadius: 8 },
  displayName: { fontWeight: 'bold', fontSize: 16 },
  logoutButton: { backgroundColor: '#F87171', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 18 },
  logoutButtonText: { color: '#fff', fontWeight: 'bold' },
});

function ProfileScreen() {
  const { currentUser, users, updateUsers, logout, shoppingLists, updateLists } = useContext(DataContext);
  const [displayName, setDisplayName] = useState(currentUser.displayName || '');
  const [isEditing, setIsEditing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  const handleUpdateProfile = () => {
    if (displayName.trim() === '') return;
    const updatedUsers = users.map(u =>
      u.id === currentUser.id ? { ...u, displayName } : u
    );
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#e6f0fa' }} edges={['top']}>
      <SwipeNavigator onSwipeLeft={() => handleNavigate('DASHBOARD')} onSwipeRight={() => handleNavigate('LISTS')}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 16 }}
        showsVerticalScrollIndicator={false}
        bounces
        alwaysBounceVertical
        overScrollMode="always"
      >
      <View style={[profileStyles.container, { flex: 1, paddingTop: 0, paddingBottom: 0 }]}> 
        {/* Header visual removido */}
        <View style={profileStyles.card}>
          <View style={profileStyles.avatarBox}>
            <View style={profileStyles.avatar}><Text style={profileStyles.avatarText}>{(displayName || currentUser.email)[0]}</Text></View>
            <View>
              <Text style={profileStyles.name}>{displayName}</Text>
              <Text style={profileStyles.email}>{currentUser.email}</Text>
            </View>
          </View>
          <Text style={profileStyles.label}>Nome de Exibição</Text>
          {isEditing ? (
            <View style={profileStyles.inputRow}>
              <TextInput style={profileStyles.input} value={displayName} onChangeText={setDisplayName} />
              <TouchableOpacity onPress={handleUpdateProfile} style={profileStyles.saveButton} activeOpacity={0.8}><CheckIcon /></TouchableOpacity>
            </View>
          ) : (
            <View style={profileStyles.inputRow}>
              <Text style={profileStyles.displayName}>{displayName}</Text>
              <TouchableOpacity onPress={() => setIsEditing(true)} style={profileStyles.editButton} activeOpacity={0.8}><EditIcon /></TouchableOpacity>
            </View>
          )}
        </View>
        <TouchableOpacity style={profileStyles.logoutButton} onPress={logout} activeOpacity={0.85}><Text style={profileStyles.logoutButtonText}>Sair da Conta</Text></TouchableOpacity>
  </View>
  </ScrollView>
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
      <NavBar navigate={handleNavigate} activeScreen={'PROFILE'} onAddList={() => setModalVisible(true)} />
    </SafeAreaView>
  );
}

export default ProfileScreen;
