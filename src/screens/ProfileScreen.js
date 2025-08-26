import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { CheckIcon, EditIcon } from '../components/Icons';
import NavBar from '../components/NavBar';
import { DataContext } from '../contexts/DataContext';

const createProfileStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background, padding: 16 },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 8, color: theme.text },
  card: { backgroundColor: theme.card, borderRadius: 16, padding: 16, marginBottom: 18 },
  avatarBox: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: theme.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 22 },
  name: { fontWeight: 'bold', fontSize: 18, color: theme.text },
  email: { color: theme.textSecondary, fontSize: 12 },
  label: { fontSize: 14, color: theme.text, marginBottom: 4, fontWeight: '500' },
  inputRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 8 },
  input: { backgroundColor: theme.input, padding: 10, borderRadius: 8, flex: 1, color: theme.text },
  saveButton: { backgroundColor: theme.success, padding: 8, borderRadius: 8 },
  editButton: { backgroundColor: theme.secondary, padding: 8, borderRadius: 8 },
  displayName: { fontWeight: 'bold', fontSize: 16, color: theme.text },
  themeButton: { backgroundColor: theme.surface, padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 8, borderWidth: 1, borderColor: theme.border },
  themeButtonText: { color: theme.text, fontWeight: 'bold' },
  logoutButton: { backgroundColor: theme.error, padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 18 },
  logoutButtonText: { color: '#fff', fontWeight: 'bold' },
});

function ProfileScreen() {
  const { currentUser, users, updateUsers, logout, theme, isDarkMode, toggleTheme } = useContext(DataContext);
  const [displayName, setDisplayName] = useState(currentUser.displayName || '');
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const profileStyles = createProfileStyles(theme);

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

  // Função para criar lista instantânea
  const handleAddList = () => {
    // Aqui você pode implementar lógica de criação de lista se desejar
  };

  return (
    <>
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
        
        <TouchableOpacity style={profileStyles.themeButton} onPress={toggleTheme} activeOpacity={0.8}>
          <Text style={profileStyles.themeButtonText}>
            {isDarkMode ? '☀️ Tema Claro' : '🌙 Tema Escuro'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={profileStyles.logoutButton} onPress={logout} activeOpacity={0.85}><Text style={profileStyles.logoutButtonText}>Sair da Conta</Text></TouchableOpacity>
      </View>
  <NavBar navigate={handleNavigate} activeScreen={'PROFILE'} onAddList={handleAddList} />
    </>
  );
}

export default ProfileScreen;
