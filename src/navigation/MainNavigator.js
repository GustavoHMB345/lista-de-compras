import React, { useState, useEffect, useContext } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { DataContext } from '../contexts/DataContext';
import { styles } from '../styles/globalStyles';

// Importando todas as telas
import AuthScreen from '../screens/AuthScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ListsScreen from '../screens/ListsScreen';
import FamilyScreen from '../screens/FamilyScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ListDetailScreen from '../screens/ListDetailScreen';
import PriceHistoryScreen from '../screens/PriceHistoryScreen';
import ItemPriceDetailScreen from '../screens/ItemPriceDetailScreen';
import NavBar from '../components/NavBar';

export default function MainNavigator() {
    const { currentUser, loading } = useContext(DataContext);
    const [screen, setScreen] = useState('DASHBOARD');
    const [navParams, setNavParams] = useState({});

    useEffect(() => {
        if (currentUser) {
            setScreen('DASHBOARD');
        }
    }, [currentUser]);

    const navigate = (screenName, params = {}) => {
        setNavParams(params);
        setScreen(screenName);
    };

    if (loading) {
        return <View style={styles.containerCenter}><ActivityIndicator size="large" color="#4f46e5" /></View>;
    }

    if (!currentUser) {
        return <AuthScreen />;
    }

    const renderScreen = () => {
        switch (screen) {
            case 'DASHBOARD':
                return <DashboardScreen navigate={navigate} />;
            case 'LISTS':
                return <ListsScreen navigate={navigate} />;
            case 'FAMILY':
                return <FamilyScreen navigate={navigate} />;
            case 'PROFILE':
                return <ProfileScreen navigate={navigate} />;
            case 'LIST_DETAIL':
                return <ListDetailScreen listId={navParams.listId} navigate={navigate} />;
            case 'PRICE_HISTORY':
                return <PriceHistoryScreen navigate={navigate} />;
            case 'ITEM_PRICE_DETAIL':
                return <ItemPriceDetailScreen itemName={navParams.itemName} navigate={navigate} />;
            default:
                return <DashboardScreen navigate={navigate} />;
        }
    };

    return (
        <View style={styles.mainContainer}>
            <View style={{ flex: 1 }}>
                {renderScreen()}
            </View>
            <NavBar navigate={navigate} activeScreen={screen} />
        </View>
    );
}
