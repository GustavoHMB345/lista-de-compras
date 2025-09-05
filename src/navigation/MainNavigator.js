import { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { DataContext } from '../contexts/DataContext';
import { styles } from '../styles/globalStyles';

// Importando todas as telas
import AuthScreen from '../screens/AuthScreen';
import DashboardScreen from '../screens/DashboardScreen';
import FamilyScreen from '../screens/FamilyScreen';
import ListDetailScreen from '../screens/ListDetailScreen';
import ListsScreen from '../screens/ListsScreen';
import ProfileScreen from '../screens/ProfileScreen';

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
            default:
                return <DashboardScreen navigate={navigate} />;
        }
    };

    return (
        <View style={styles.mainContainer}>
            <View style={{ flex: 1 }}>
                {renderScreen()}
            </View>
            {/* NavBar removida */}
        </View>
    );
}
