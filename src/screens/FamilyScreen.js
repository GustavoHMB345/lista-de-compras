import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import NavBar from '../components/NavBar';
import { DataContext } from '../contexts/DataContext';

function FamilyScreen() {
    const { families, users, currentUser, updateFamilies, updateUsers, theme } = useContext(DataContext);
    const styles = createStyles(theme);
    const [inviteEmail, setInviteEmail] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();
    const family = families.find(f => f.id === currentUser.familyId);
    const members = users.filter(u => family?.members.includes(u.id));

    const handleInviteMember = () => {
        if (inviteEmail.trim() === '') return;
        setError('');
        const userToInvite = users.find(u => u.email.toLowerCase() === inviteEmail.toLowerCase());
        if (!userToInvite) {
            setError('Usuário não encontrado.');
            return;
        }
        if (family.members.includes(userToInvite.id)) {
            setError('Usuário já está na família.');
            return;
        }
        const updatedFamilies = families.map(f => {
            let newF = { ...f };
            if (f.id === family.id) {
                newF.members = [...f.members, userToInvite.id];
            }
            if (f.id === userToInvite.familyId) {
                newF.members = f.members.filter(mId => mId !== userToInvite.id);
            }
            return newF;
        });
        updateFamilies(updatedFamilies);
        const updatedUsers = users.map(u =>
            u.id === userToInvite.id ? { ...u, familyId: family.id } : u
        );
        updateUsers(updatedUsers);
        setInviteEmail('');
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
        // Adiciona uma lista instantânea (sem navegação)
        if (typeof updateFamilies === 'function' && typeof updateUsers === 'function') {
            // Aqui você pode implementar lógica de criação de lista se desejar
        }
    };

    return (
        <>
            <View style={[styles.container, { flex: 1, paddingTop: 0, paddingBottom: 0 }]}> 
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Membros</Text>
                    <View style={styles.membersRow}>
                        {members.map((member, idx) => (
                            <View key={member.id} style={styles.memberBox}>
                                <View style={[styles.avatar, { backgroundColor: idx === 0 ? theme.primary : idx === 1 ? theme.success : theme.secondary }]}>
                                    <Text style={styles.avatarText}>{member.displayName[0]}</Text>
                                </View>
                                <Text style={styles.memberName}>{member.displayName}</Text>
                                <Text style={styles.memberEmail}>{member.email}</Text>
                                <Text style={[styles.memberStatus, idx === 0 ? styles.adminStatus : styles.memberStatus]}>{idx === 0 ? 'Administrador' : 'Membro'}</Text>
                            </View>
                        ))}
                    </View>
                </View>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Convidar Novo Membro</Text>
                    <TextInput style={styles.input} placeholder="Email do membro" value={inviteEmail} onChangeText={setInviteEmail} autoCapitalize="none" />
                    {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}
                    <TouchableOpacity style={styles.inviteButton} onPress={handleInviteMember} activeOpacity={0.8}>
                        <Text style={styles.inviteButtonText}>Convidar</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <NavBar navigate={handleNavigate} activeScreen={'FAMILY'} onAddList={handleAddList} />
        </>
    );
}

const createStyles = (theme) => StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background, padding: 16 },
    header: { fontSize: 28, fontWeight: 'bold', marginBottom: 8, color: theme.text },
    card: { backgroundColor: theme.card, borderRadius: 16, padding: 16, marginBottom: 18 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: theme.text },
    membersRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    memberBox: { alignItems: 'center', margin: 8 },
    avatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: theme.card, fontWeight: 'bold', fontSize: 18 },
    memberName: { fontWeight: 'bold', marginTop: 4, color: theme.text },
    memberEmail: { color: theme.textSecondary, fontSize: 12 },
    memberStatus: { color: theme.textSecondary, fontSize: 12, marginTop: 2 },
    adminStatus: { color: theme.primary, fontWeight: 'bold' },
    input: { backgroundColor: theme.input, padding: 10, borderRadius: 8, marginBottom: 8, color: theme.text },
    errorBox: { backgroundColor: theme.errorLight, borderColor: theme.error, borderWidth: 1, borderRadius: 8, padding: 8, marginBottom: 8 },
    errorText: { color: theme.error, textAlign: 'center', fontSize: 14 },
    inviteButton: { backgroundColor: theme.primary, padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 },
    inviteButtonText: { color: theme.card, fontWeight: 'bold' },
});

export default FamilyScreen;
