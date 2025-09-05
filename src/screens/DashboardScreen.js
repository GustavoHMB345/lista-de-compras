import { useRootNavigationState, useRouter } from 'expo-router';
import { useContext, useEffect, useMemo, useState } from 'react';
import { Animated, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SwipeNavigator from '../components/SwipeNavigator';
import TabBar from '../components/TabBar';
import { DataContext } from '../contexts/DataContext';

const { width } = Dimensions.get('window');
const __fs = Math.min(1.2, Math.max(0.9, width / 390));
const MAX_WIDTH = Math.min(820, width * 0.98);

export default function DashboardScreen() {
    const { shoppingLists, currentUser, loading } = useContext(DataContext);
    const router = useRouter();
    const progress = useState(new Animated.Value(0))[0];
    const rootNavigation = useRootNavigationState();
    const [period, setPeriod] = useState('weekly'); // weekly | monthly | yearly
    const [monthRange] = useState(6); // for monthly placeholder

    useEffect(() => {
        if (!loading && !currentUser && rootNavigation?.key) {
            router.replace('/welcome');
        }
    }, [loading, currentUser, rootNavigation?.key, router]);

    const allItems = useMemo(() => (shoppingLists || []).flatMap((l) => l.items || []), [shoppingLists]);
    const archived = useMemo(() => (shoppingLists || []).filter(l => l.status === 'archived'), [shoppingLists]);

    const stats = useMemo(() => {
        const priced = allItems.filter((it) => typeof it.price === 'number' && !isNaN(it.price));
        const totalSpent = priced.reduce((s, it) => s + (it.price || 0), 0);
        const avgPrice = priced.length ? totalSpent / priced.length : 0;
        const totalItems = allItems.length;
        const priceVariation = 0;
        return { totalSpent, avgPrice, totalItems, priceVariation };
    }, [allItems]);

    const expensiveItems = useMemo(() => {
        const grouped = new Map();
        allItems.forEach((it) => {
            const key = (it.name || 'Item').toLowerCase();
            const entry = grouped.get(key) || { name: it.name || 'Item', prices: [] };
            if (typeof it.price === 'number') entry.prices.push(it.price);
            grouped.set(key, entry);
        });
        return Array.from(grouped.values())
            .map((e) => ({
                name: e.name,
                avg: e.prices.length ? e.prices.reduce((a, b) => a + b, 0) / e.prices.length : 0,
                min: e.prices.length ? Math.min(...e.prices) : 0,
                max: e.prices.length ? Math.max(...e.prices) : 0,
                count: e.prices.length,
            }))
            .filter((e) => e.count > 0)
            .sort((a, b) => b.avg - a.avg)
            .slice(0, 5);
    }, [allItems]);

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

    if (loading) {
        return (
            <View style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: '#222', fontSize: 18 }}>Carregando...</Text>
            </View>
        );
    }
    if (!currentUser) {
        return (
            <SafeAreaView style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}> 
                <Text style={{ color: '#222', fontSize: 16 }}>Carregando...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.root} edges={['top']}>
            <TabBar active={'DASHBOARD'} onNavigate={handleNavigate} />
            <SwipeNavigator onSwipeLeft={() => handleNavigate('PROFILE')} onSwipeRight={() => handleNavigate('LISTS')} progress={progress}>
                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                    {/* Header + Stats */}
                    <View style={[styles.card, { width: MAX_WIDTH }]}> 
                        <View style={{ alignItems: 'center', marginBottom: 16 }}>
                            <Text style={styles.emoji}>📊</Text>
                            <Text style={styles.title}>Dashboard</Text>
                            <Text style={styles.subtitle}>Análise de preços e tendências de mercado</Text>
                        </View>
                        <View style={styles.statsGrid}>
                            <View style={[styles.statBox, { backgroundColor: '#EFF6FF' }]}> 
                                <Text style={[styles.statValue, { color: '#2563EB' }]}>R$ {stats.totalSpent.toFixed(2)}</Text>
                                <Text style={styles.statLabel}>Gasto Total</Text>
                            </View>
                            <View style={[styles.statBox, { backgroundColor: '#ECFDF5' }]}> 
                                <Text style={[styles.statValue, { color: '#16A34A' }]}>R$ {stats.avgPrice.toFixed(2)}</Text>
                                <Text style={styles.statLabel}>Preço Médio</Text>
                            </View>
                            <View style={[styles.statBox, { backgroundColor: '#FEFCE8' }]}> 
                                <Text style={[styles.statValue, { color: '#CA8A04' }]}>{stats.totalItems}</Text>
                                <Text style={styles.statLabel}>Itens Cadastrados</Text>
                            </View>
                            <View style={[styles.statBox, { backgroundColor: '#F5F3FF' }]}> 
                                <Text style={[styles.statValue, { color: '#7C3AED' }]}>{stats.priceVariation >= 0 ? '+' : ''}{stats.priceVariation.toFixed(0)}%</Text>
                                <Text style={styles.statLabel}>Variação de Preços</Text>
                            </View>
                        </View>
                    </View>

                    {/* Chart Card */}
                    <View style={[styles.card, { width: MAX_WIDTH }]}> 
                        <Text style={[styles.sectionTitle, { textAlign: 'center' }]}>📈 Evolução de Preços</Text>
                        <View style={styles.segmentRow}>
                            {[
                                { key: 'weekly', label: 'SEMANA' },
                                { key: 'monthly', label: 'MÊS' },
                                { key: 'yearly', label: 'ANO' },
                            ].map((p) => {
                                const active = period === p.key;
                                return (
                                    <TouchableOpacity key={p.key} onPress={() => setPeriod(p.key)} activeOpacity={0.9} style={[styles.segmentBtn, active && styles.segmentBtnActive]}>
                                        <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{p.label}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                        <View style={styles.chartBox}>
                            <View style={styles.chartGrid} />
                            <View style={styles.chartBarsRow}>
                                    {generateSeriesFromData(period, monthRange, archived).map((v, i) => (
                                    <View key={i} style={[styles.chartBar, { height: 12 + v * 88 }]} />
                                ))}
                            </View>
                            <View style={styles.chartXAxis}>
                                    {getLabels(period, monthRange).map((l, i) => (
                                    <Text key={i} style={styles.axisLabel}>{l}</Text>
                                ))}
                            </View>
                        </View>
                    </View>

                    {/* Expensive items */}
                    <View style={[styles.card, { width: MAX_WIDTH, backgroundColor: '#FFF1F2' }]}> 
                        <Text style={styles.sectionTitle}>🔥 Itens Mais Caros</Text>
                        {expensiveItems.length === 0 ? (
                            <View style={{ alignItems: 'center', paddingVertical: 16 }}>
                                <Text style={{ fontSize: 28 }}>💰</Text>
                                <Text style={{ color: '#6B7280', marginTop: 6 }}>Sem dados de preços</Text>
                            </View>
                        ) : (
                            <View style={{ gap: 8 }}>
                                {expensiveItems.map((it) => (
                                    <View key={it.name} style={styles.expRow}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.expName}>{it.name}</Text>
                                            <Text style={styles.expMeta}>Faixa: R$ {it.min.toFixed(2)} - R$ {it.max.toFixed(2)}</Text>
                                        </View>
                                        <View style={{ alignItems: 'flex-end' }}>
                                            <Text style={styles.expValue}>R$ {it.avg.toFixed(2)}</Text>
                                            <Text style={styles.expMeta}>Preço médio</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                </ScrollView>
            </SwipeNavigator>
        </SafeAreaView>
    );
}

function normalize(val, min, max) {
    if (!Number.isFinite(val)) return 0;
    if (max === min) return 0.5; // avoid zero range
    return Math.max(0, Math.min(1, (val - min) / (max - min)));
}

function generateSeriesFromData(period, monthRange, archived) {
    const now = new Date();
    if (period === 'weekly') {
        // 4 buckets: last 4 weeks (0 = oldest, 3 = current week)
        const buckets = [0,0,0,0];
        archived.forEach((l) => {
            const d = new Date(l.createdAt || l.updatedAt || l.archivedAt || l.date || 0);
            const diffDays = Math.floor((now - d) / (1000*60*60*24));
            const weekIdxFromNow = Math.floor(diffDays / 7);
            const idx = 3 - weekIdxFromNow; // map to 0..3
            if (idx >= 0 && idx < 4) {
                const sum = (l.items || []).reduce((s, it) => s + (Number(it.price) || 0), 0);
                buckets[idx] += sum;
            }
        });
        const min = Math.min(...buckets);
        const max = Math.max(...buckets);
        return buckets.map((v) => normalize(v, min, max));
    }
    if (period === 'monthly') {
        const months = Array.from({ length: monthRange }, () => 0);
        archived.forEach((l) => {
            const d = new Date(l.createdAt || 0);
            const diffMonths = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
            const idx = monthRange - 1 - diffMonths;
            if (idx >= 0 && idx < monthRange) {
                const sum = (l.items || []).reduce((s, it) => s + (Number(it.price) || 0), 0);
                months[idx] += sum;
            }
        });
        const min = Math.min(...months);
        const max = Math.max(...months);
        return months.map((v) => normalize(v, min, max));
    }
    // yearly: last 3 years
    const years = [0,0,0];
    const baseYear = now.getFullYear() - 2;
    archived.forEach((l) => {
        const d = new Date(l.createdAt || 0);
        const idx = d.getFullYear() - baseYear;
        if (idx >= 0 && idx < 3) {
            const sum = (l.items || []).reduce((s, it) => s + (Number(it.price) || 0), 0);
            years[idx] += sum;
        }
    });
    const min = Math.min(...years);
    const max = Math.max(...years);
    return years.map((v) => normalize(v, min, max));
}

function getLabels(period, monthRange) {
    if (period === 'weekly') return ['S1', 'S2', 'S3', 'S4'];
    if (period === 'monthly') {
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        return months.slice(12 - monthRange);
    }
    return ['2023', '2024', '2025'];
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#e6f0fa' },
    scroll: { alignItems: 'center', paddingBottom: 24, paddingTop: 8 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 22,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
        marginVertical: 10,
    },
    emoji: { fontSize: 48, marginBottom: 8 },
    title: { fontSize: 26 * __fs, fontWeight: 'bold', color: '#1F2937' },
    subtitle: { fontSize: 14 * __fs, color: '#6B7280', marginTop: 2, textAlign: 'center' },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 },
    statBox: { flex: 1, minWidth: 150, padding: 14, borderRadius: 14, alignItems: 'center' },
    statValue: { fontSize: 20 * __fs, fontWeight: 'bold' },
    statLabel: { fontSize: 12 * __fs, color: '#4B5563' },
    sectionTitle: { fontSize: 16 * __fs, fontWeight: '600', color: '#111827', marginBottom: 10 },
    segmentRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 10 },
    segmentBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
    segmentBtnActive: { backgroundColor: '#DBEAFE', borderColor: '#93C5FD' },
    segmentText: { fontSize: 12 * __fs, color: '#374151', fontWeight: '600' },
    segmentTextActive: { color: '#1D4ED8' },
    chartBox: { backgroundColor: '#F9FAFB', borderRadius: 14, padding: 12 },
    chartGrid: { position: 'absolute', left: 12, right: 12, top: 12, bottom: 36, borderWidth: StyleSheet.hairlineWidth, borderColor: '#E5E7EB', borderRadius: 10 },
    chartBarsRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 140, paddingHorizontal: 6 },
    chartBar: { width: Math.max(6, (MAX_WIDTH - 48) / 14), backgroundColor: '#3B82F6', borderRadius: 6, opacity: 0.85 },
    chartXAxis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingHorizontal: 6 },
    axisLabel: { fontSize: 10 * __fs, color: '#6B7280' },
    expRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#FEE2E2' },
    expName: { fontSize: 14 * __fs, fontWeight: '600', color: '#111827' },
    expMeta: { fontSize: 11 * __fs, color: '#6B7280' },
    expValue: { fontSize: 16 * __fs, fontWeight: '700', color: '#DC2626' },
});
