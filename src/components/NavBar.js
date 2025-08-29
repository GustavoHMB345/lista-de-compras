import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../styles/globalStyles';
import { PlusIcon } from './Icons';

export default function NavBar({ navigate, activeScreen, onAddList }) {
    const navItems = [
        { name: 'Dashboard', screen: 'DASHBOARD', icon: '📊' },
        { name: 'Listas', screen: 'LISTS', icon: '🛒' },
        { name: 'Família', screen: 'FAMILY', icon: '👨‍👩‍👧‍👦' },
        { name: 'Perfil', screen: 'PROFILE', icon: '👤' },
    ];

    return (
        <View style={styles.navBar}>
            <TouchableOpacity style={styles.navItem} onPress={() => navigate(navItems[0].screen)} activeOpacity={0.7}>
                <Text style={[styles.navIcon, activeScreen === navItems[0].screen && styles.navIconActive]}>{navItems[0].icon}</Text>
                <Text style={[styles.navText, activeScreen === navItems[0].screen && styles.navTextActive]}>{navItems[0].name}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => navigate(navItems[1].screen)} activeOpacity={0.7}>
                <Text style={[styles.navIcon, activeScreen === navItems[1].screen && styles.navIconActive]}>{navItems[1].icon}</Text>
                <Text style={[styles.navText, activeScreen === navItems[1].screen && styles.navTextActive]}>{navItems[1].name}</Text>
            </TouchableOpacity>
            <View style={styles.navBarCenterBtnWrapper} pointerEvents="box-none">
                <TouchableOpacity style={styles.navBarCenterBtn} onPress={onAddList} activeOpacity={0.85}>
                    <PlusIcon color="#fff" size={32} />
                </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.navItem} onPress={() => navigate(navItems[2].screen)} activeOpacity={0.7}>
                <Text style={[styles.navIcon, activeScreen === navItems[2].screen && styles.navIconActive]}>{navItems[2].icon}</Text>
                <Text style={[styles.navText, activeScreen === navItems[2].screen && styles.navTextActive]}>{navItems[2].name}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => navigate(navItems[3].screen)} activeOpacity={0.7}>
                <Text style={[styles.navIcon, activeScreen === navItems[3].screen && styles.navIconActive]}>{navItems[3].icon}</Text>
                <Text style={[styles.navText, activeScreen === navItems[3].screen && styles.navTextActive]}>{navItems[3].name}</Text>
            </TouchableOpacity>
        </View>
    );
}
