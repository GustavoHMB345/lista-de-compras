import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';

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
          variant="success"
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 10,
    elevation: 7,
  },
  title: { fontSize: 22, fontWeight: '800', color: '#111827', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#4B5563', marginTop: 8, textAlign: 'center' },
  image: { width: '80%', height: 140, marginVertical: 16, opacity: 0.85 },
});
