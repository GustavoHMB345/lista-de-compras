import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useContext, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { DataContext } from '../contexts/DataContext';

export default function SplashScreen() {
  const { loading, currentUser } = useContext(DataContext);
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const to = currentUser ? '/dashboard' : '/welcome';
    const t = setTimeout(() => router.replace(to), 650);
    return () => clearTimeout(t);
  }, [loading, currentUser, router]);

  return (
    <LinearGradient colors={['#3B82F6', '#8B5CF6']} style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.title}>SuperLista</Text>
        <ActivityIndicator size="large" color="#fff" style={{ marginTop: 16 }} />
        <Text style={styles.subtitle}>Carregando...</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { color: '#fff', fontSize: 32, fontWeight: '800', letterSpacing: 0.5 },
  subtitle: { color: '#E5E7EB', marginTop: 8 },
});
