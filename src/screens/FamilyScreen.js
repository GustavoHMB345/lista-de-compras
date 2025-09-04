import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddListModal from '../components/AddListModal';
import NavBar from '../components/NavBar';
import SwipeNavigator from '../components/SwipeNavigator';
import { DataContext } from '../contexts/DataContext';

import { Dimensions } from 'react-native';
const { width } = Dimensions.get('window');
const MAX_CARD_WIDTH = Math.min(420, width * 0.98);
const familyStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 0,
        paddingVertical: 0,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 22,
        marginBottom: 18,
        width: MAX_CARD_WIDTH,
        maxWidth: '98%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.10,
        shadowRadius: 12,
        elevation: 6,
    },
    cardTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#222',
    },
    membersRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        justifyContent: 'flex-start',
    },
    memberBox: {
        alignItems: 'center',
        margin: 8,
        minWidth: 90,
        maxWidth: 120,
        flex: 1,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    avatarText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 22,
    },
    memberName: {
        fontWeight: 'bold',
        marginTop: 2,
        fontSize: 15,
        color: '#222',
        textAlign: 'center',
    },
    memberEmail: {
        color: '#6B7280',
        fontSize: 12,
        textAlign: 'center',
    },
    memberStatus: {
        color: '#6B7280',
        fontSize: 12,
        marginTop: 2,
        textAlign: 'center',
    },
    adminStatus: {
        color: '#3B82F6',
        fontWeight: 'bold',
    },
    input: {
        backgroundColor: '#F3F4F6',
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        fontSize: 16,
        width: '100%',
    },
    errorBox: {
        backgroundColor: '#FEE2E2',
        borderColor: '#F87171',
        borderWidth: 1,
        borderRadius: 8,
        padding: 8,
        marginBottom: 8,
    },
    errorText: {
        color: '#B91C1C',
        textAlign: 'center',
        fontSize: 14,
    },
    inviteButton: {
        backgroundColor: '#3B82F6',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 8,
    },
    inviteButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

function FamilyScreen() {
    const { families, users, currentUser, updateFamilies, updateUsers, shoppingLists, updateLists } = useContext(DataContext);
    const [inviteEmail, setInviteEmail] = useState('');
    const [error, setError] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
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

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#e6f0fa' }} edges={['top']}>
            <SwipeNavigator onSwipeLeft={() => handleNavigate('LISTS')} onSwipeRight={() => handleNavigate('DASHBOARD')}>
            <ScrollView
                contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
                showsVerticalScrollIndicator={false}
                bounces
                alwaysBounceVertical
                overScrollMode="always"
            >
            <View style={familyStyles.container}>
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
                                <Text style={[familyStyles.memberStatus, idx === 0 ? familyStyles.adminStatus : null]}>{idx === 0 ? 'Administrador' : 'Membro'}</Text>
                            </View>
                        ))}
                    </View>
                </View>
                <View style={familyStyles.card}>
                    <Text style={familyStyles.cardTitle}>Convidar Novo Membro</Text>
                    <TextInput style={familyStyles.input} placeholder="Email do membro" value={inviteEmail} onChangeText={setInviteEmail} autoCapitalize="none" />
                    {!!error && (
                        <View style={familyStyles.errorBox}><Text style={familyStyles.errorText}>{error}</Text></View>
                    )}
                    <TouchableOpacity style={familyStyles.inviteButton} onPress={handleInviteMember} activeOpacity={0.8}>
                        <Text style={familyStyles.inviteButtonText}>Convidar</Text>
                    </TouchableOpacity>
                </View>
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
            <NavBar navigate={handleNavigate} activeScreen={'FAMILY'} onAddList={() => setModalVisible(true)} />
        </SafeAreaView>
    );
}

export default FamilyScreen;
