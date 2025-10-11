import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
        <Image
          source={require('../../assets/images/react-logo.png')}
          style={styles.image}
          resizeMode="contain"
        />
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#3B82F6' }]}
          onPress={() => router.push('/sign-in')}
        >
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#10B981' }]}
          onPress={() => router.push('/sign-up')}
        >
          <Text style={styles.buttonText}>Criar conta</Text>
        </TouchableOpacity>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 10,
    elevation: 7,
  },
  title: { fontSize: 22, fontWeight: '800', color: '#111827', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#4B5563', marginTop: 8, textAlign: 'center' },
  image: { width: '80%', height: 140, marginVertical: 16, opacity: 0.85 },
  button: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    minHeight: 44,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
