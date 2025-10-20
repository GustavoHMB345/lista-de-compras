import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';
import { ListCheckIcon } from '../components/Icons';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  return (
    <LinearGradient colors={['#3B82F6', '#8B5CF6']} style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Bem-vindo à SuperLista</Text>
        <Text style={styles.subtitle}>
          Organize suas compras, compartilhe com a família e controle seus gastos.
        </Text>
        <View style={styles.logoBadge}>
          <LinearGradient
            colors={['#4F46E5', '#2563EB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoCircle}
          >
            <ListCheckIcon color="#fff" size={42} />
          </LinearGradient>
        </View>
        <Button
          title="Entrar"
          variant="primary"
          onPress={() => router.push('/sign-in')}
          style={{ width: '100%', marginTop: 10 }}
          testID="welcomeSignIn"
          accessibilityLabel="Entrar"
        />
        <Button
          title="Criar conta"
          variant="primary"
          onPress={() => router.push('/sign-up')}
          style={{ width: '100%', marginTop: 10 }}
          testID="welcomeSignUp"
          accessibilityLabel="Criar conta"
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: {
    width: width > 420 ? 380 : '90%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  shadowColor: '#0B0B0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 10,
    elevation: 7,
  },
  title: { fontSize: 22, fontWeight: '800', color: '#111827', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#4B5563', marginTop: 8, textAlign: 'center' },
  logoBadge: { alignItems: 'center', marginVertical: 16 },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0B0B0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 10,
    elevation: 6,
  },
});
