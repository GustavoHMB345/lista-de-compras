import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import NavBar from '../components/NavBar';
import { DataContext } from '../contexts/DataContext';
import { styles } from '../styles/globalStyles';

export default function DashboardScreen() {
    const { shoppingLists, currentUser } = useContext(DataContext);
    const [topItems, setTopItems] = useState([]);
    const router = useRouter();

    useEffect(() => {
        const archivedLists = shoppingLists.filter(l => l.familyId === currentUser.familyId && l.status === 'archived');
        const itemCounts = {};
        const itemPrices = {};

        archivedLists.forEach(list => {
            (list.items || []).forEach(item => {
                const itemName = item.name.trim().toLowerCase();
                if (!itemCounts[itemName]) {
                    itemCounts[itemName] = 0;
                    itemPrices[itemName] = { total: 0, count: 0 };
                }
                itemCounts[itemName] += item.quantity;
                if (item.price && item.price > 0) {
                    itemPrices[itemName].total += item.price * item.quantity;
                    itemPrices[itemName].count += item.quantity;
                }
            });
        });

        const sortedItems = Object.keys(itemCounts)
            .map(name => ({
                name,
                count: itemCounts[name],
                avgPrice: itemPrices[name].count > 0 ? (itemPrices[name].total / itemPrices[name].count).toFixed(2) : 'N/A'
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        
        setTopItems(sortedItems);
    }, [shoppingLists, currentUser]);

    // Função para navegação compatível com NavBar
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
        <>
            <ScrollView style={styles.container}>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Top 5 Itens Mais Comprados</Text>
                    {topItems.length > 0 ? (
                        <BarChart
                            data={topItems.map(item => ({ value: item.count, label: item.name, frontColor: '#4f46e5' }))}
                            barWidth={40} spacing={20} yAxisTextStyle={{color: '#333'}} xAxisLabelTextStyle={{color: '#333', textAlign: 'center'}} isAnimated
                        />
                    ) : <Text style={styles.emptyText}>Nenhum item comprado ainda.</Text>}
                </View>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Média de Preços (Top 5)</Text>
                    {topItems.length > 0 ? topItems.map((item, index) => (
                        <View key={index} style={styles.priceItem}>
                            <Text style={styles.priceItemName}>{item.name}</Text>
                            <Text style={styles.priceItemValue}>R$ {item.avgPrice}</Text>
                        </View>
                    )) : <Text style={styles.emptyText}>Sem dados de preço.</Text>}
                </View>
                <TouchableOpacity style={styles.buttonOutline} onPress={() => router.push('/price-history')} activeOpacity={0.7}>
                    <Text style={styles.buttonOutlineText}>Ver Histórico Completo de Preços</Text>
                </TouchableOpacity>
            </ScrollView>
            <NavBar navigate={handleNavigate} activeScreen={'DASHBOARD'} />
        </>
    );
}
