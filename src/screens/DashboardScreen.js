
import { useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import NavBar from '../components/NavBar';
import { DataContext } from '../contexts/DataContext';

const dashboardBg = '#e6f0fa';
const cardColors = ['#b6d6f6', '#b6d6f6'];
const itemEmojis = {
    'leite integral': '🥛',
    'siboda konola dumiamo': '🍞',
    'pão': '🍞',
};

const { width } = Dimensions.get('window');
const CARD_WIDTH = Math.min(180, width * 0.42);
const CONTAINER_WIDTH = Math.min(420, width * 0.98);


export default function DashboardScreen() {
    const { shoppingLists, currentUser } = useContext(DataContext);
    const [topItems, setTopItems] = useState([]);
    const router = useRouter();

    // MOCK para visual igual ao anexo
    useEffect(() => {
        setTopItems([
            {
                name: 'leite integral',
                avgPrice: '9.30',
                count: '442 3 4 332',
            },
            {
                name: 'siboda konola dumiamo',
                avgPrice: '30',
                count: '',
            },
        ]);
    }, []);

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
        <View style={styles.root}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <View style={[styles.card, { width: CONTAINER_WIDTH }]}>  
                    <Text style={styles.title}>Dashboard</Text>
                    <Text style={styles.subtitle}>Itens Mais Procurados</Text>
                    <View style={styles.itemsRow}>
                        {topItems.map((item, idx) => (
                            <View key={idx} style={[styles.itemCard, { backgroundColor: cardColors[idx % cardColors.length], maxWidth: CARD_WIDTH }]}> 
                                <View style={styles.emojiCircle}>
                                    <Text style={styles.emoji}>{itemEmojis[item.name] || '🛒'}</Text>
                                </View>
                                <Text style={styles.itemName}>{item.name.replace(/\b\w/g, l => l.toUpperCase())}</Text>
                                <Text style={styles.itemPrice}>R$ {item.avgPrice}</Text>
                                {!!item.count && <Text style={styles.itemCount}>{item.count}</Text>}
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
            <NavBar navigate={handleNavigate} activeScreen={'DASHBOARD'} />
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: dashboardBg,
    },
    scroll: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 60,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 28,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.10,
        shadowRadius: 12,
        elevation: 6,
        marginTop: 24,
        marginBottom: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#222',
        marginBottom: 2,
        textAlign: 'left',
    },
    subtitle: {
        fontSize: 18,
        color: '#222',
        marginBottom: 18,
        textAlign: 'left',
    },
    itemsRow: {
        flexDirection: 'row',
        gap: 18,
        marginBottom: 12,
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    itemCard: {
        borderRadius: 20,
        alignItems: 'center',
        padding: 18,
        minHeight: 180,
        marginBottom: 10,
        flex: 1,
    },
    emojiCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#e6f0fa',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    emoji: {
        fontSize: 40,
    },
    itemName: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 4,
        textShadowColor: '#0002',
        textShadowRadius: 2,
    },
    itemPrice: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 22,
        marginBottom: 2,
    },
    itemCount: {
        color: '#e0e7ef',
        fontSize: 15,
    },
});
