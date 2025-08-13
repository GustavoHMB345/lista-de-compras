import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import NavBar from '../components/NavBar';
import { DataContext } from '../contexts/DataContext';

const familyStyles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6', padding: 16 },
    header: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
    card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 18 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
    membersRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    memberBox: { alignItems: 'center', margin: 8 },
    avatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
    memberName: { fontWeight: 'bold', marginTop: 4 },
    memberEmail: { color: '#6B7280', fontSize: 12 },
    memberStatus: { color: '#6B7280', fontSize: 12, marginTop: 2 },
    adminStatus: { color: '#3B82F6', fontWeight: 'bold' },
    input: { backgroundColor: '#F3F4F6', padding: 10, borderRadius: 8, marginBottom: 8 },
    errorBox: { backgroundColor: '#FEE2E2', borderColor: '#F87171', borderWidth: 1, borderRadius: 8, padding: 8, marginBottom: 8 },
    errorText: { color: '#B91C1C', textAlign: 'center', fontSize: 14 },
    inviteButton: { backgroundColor: '#3B82F6', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 },
    inviteButtonText: { color: '#fff', fontWeight: 'bold' },
});

function FamilyScreen() {
    const { families, users, currentUser, updateFamilies, updateUsers } = useContext(DataContext);
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
            <View style={[familyStyles.container, { flex: 1, paddingTop: 0, paddingBottom: 0 }]}> 
                <View style={familyStyles.card}>
                    <Text style={familyStyles.cardTitle}>Membros</Text>
                    <View style={familyStyles.membersRow}>
                        {members.map((member, idx) => (
                            <View key={member.id} style={familyStyles.memberBox}>
                                <View style={[familyStyles.avatar, { backgroundColor: idx === 0 ? '#3B82F6' : idx === 1 ? '#22C55E' : '#8B5CF6' }]}>
                                    <Text style={familyStyles.avatarText}>{member.displayName[0]}</Text>
                                </View>
                                <Text style={familyStyles.memberName}>{member.displayName}</Text>
                                <Text style={familyStyles.memberEmail}>{member.email}</Text>
                                <Text style={[familyStyles.memberStatus, idx === 0 ? familyStyles.adminStatus : familyStyles.memberStatus]}>{idx === 0 ? 'Administrador' : 'Membro'}</Text>
                            </View>
                        ))}
                    </View>
                </View>
                <View style={familyStyles.card}>
                    <Text style={familyStyles.cardTitle}>Convidar Novo Membro</Text>
                    <TextInput style={familyStyles.input} placeholder="Email do membro" value={inviteEmail} onChangeText={setInviteEmail} autoCapitalize="none" />
                    {error ? <View style={familyStyles.errorBox}><Text style={familyStyles.errorText}>{error}</Text></View> : null}
                    <TouchableOpacity style={familyStyles.inviteButton} onPress={handleInviteMember} activeOpacity={0.8}>
                        <Text style={familyStyles.inviteButtonText}>Convidar</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <NavBar navigate={handleNavigate} activeScreen={'FAMILY'} onAddList={handleAddList} />
        </>
    );
}

export default FamilyScreen;
