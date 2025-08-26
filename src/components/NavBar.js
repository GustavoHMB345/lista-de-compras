import React, { useContext } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DataContext } from '../contexts/DataContext';

import { PlusIcon } from './Icons';

const createStyles = (theme) => StyleSheet.create({
    navBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: theme.surface,
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderTopWidth: 1,
        borderTopColor: theme.border,
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        paddingVertical: 8,
    },
    navIcon: {
        fontSize: 20,
        color: theme.textSecondary,
        marginBottom: 2,
    },
    navIconActive: {
        color: theme.primary,
    },
    navText: {
        fontSize: 12,
        color: theme.textSecondary,
    },
    navTextActive: {
        color: theme.primary,
        fontWeight: 'bold',
    },
    addButton: {
        backgroundColor: theme.primary,
        borderRadius: 24,
        padding: 8,
        marginHorizontal: 4,
    },
});

export default function NavBar({ navigate, activeScreen, onAddList }) {
    const { theme } = useContext(DataContext);
    const styles = createStyles(theme);
    const navItems = [
        { name: 'Dashboard', screen: 'DASHBOARD', icon: '📊' },
        { name: 'Listas', screen: 'LISTS', icon: '🛒' },
        { name: 'Família', screen: 'FAMILY', icon: '👨‍👩‍👧‍👦' },
        { name: 'Perfil', screen: 'PROFILE', icon: '👤' },
    ];

    return (
        <View style={styles.navBar}>
            {/* Dashboard */}
            <TouchableOpacity style={styles.navItem} onPress={() => navigate(navItems[0].screen)} activeOpacity={0.7}>
                <Text style={[styles.navIcon, activeScreen === navItems[0].screen && styles.navIconActive]}>{navItems[0].icon}</Text>
                <Text style={[styles.navText, activeScreen === navItems[0].screen && styles.navTextActive]}>{navItems[0].name}</Text>
            </TouchableOpacity>
            {/* Listas */}
            <TouchableOpacity style={styles.navItem} onPress={() => navigate(navItems[1].screen)} activeOpacity={0.7}>
                <Text style={[styles.navIcon, activeScreen === navItems[1].screen && styles.navIconActive]}>{navItems[1].icon}</Text>
                <Text style={[styles.navText, activeScreen === navItems[1].screen && styles.navTextActive]}>{navItems[1].name}</Text>
            </TouchableOpacity>
            {/* Botão + */}
            <TouchableOpacity style={[styles.navItem, styles.addButton]} onPress={onAddList} activeOpacity={0.8}>
                <PlusIcon theme={theme} />
            </TouchableOpacity>
            {/* Família */}
            <TouchableOpacity style={styles.navItem} onPress={() => navigate(navItems[2].screen)} activeOpacity={0.7}>
                <Text style={[styles.navIcon, activeScreen === navItems[2].screen && styles.navIconActive]}>{navItems[2].icon}</Text>
                <Text style={[styles.navText, activeScreen === navItems[2].screen && styles.navTextActive]}>{navItems[2].name}</Text>
            </TouchableOpacity>
            {/* Perfil */}
            <TouchableOpacity style={styles.navItem} onPress={() => navigate(navItems[3].screen)} activeOpacity={0.7}>
                <Text style={[styles.navIcon, activeScreen === navItems[3].screen && styles.navIconActive]}>{navItems[3].icon}</Text>
                <Text style={[styles.navText, activeScreen === navItems[3].screen && styles.navTextActive]}>{navItems[3].name}</Text>
            </TouchableOpacity>
        </View>
    );
}
