import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Button from '../components/Button';
import { DataContext } from '../contexts/DataContext';

const { width } = Dimensions.get('window');

export default function SignUpScreen() {
  const { register } = useContext(DataContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async () => {
    setError('');
    if (!name.trim()) {
      setError('Nome é obrigatório.');
      return;
    }
    setLoading(true);
    try {
      const result = await register(email, password, name);
      if (result.success) {
        router.replace('/dashboard');
      } else {
        setError(result.message || 'Erro ao registrar.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#3B82F6', '#8B5CF6']} style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Criar conta</Text>
        <View style={styles.inputBox}>
          <Text style={styles.label}>Nome</Text>
          <TextInput
            style={styles.input}
            placeholder="Seu nome"
            placeholderTextColor="#9CA3AF"
            selectionColor="#2563EB"
            value={name}
            onChangeText={setName}
          />
        </View>
        <View style={styles.inputBox}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="voce@email.com"
            placeholderTextColor="#9CA3AF"
            selectionColor="#2563EB"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>
        <View style={styles.inputBox}>
          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#9CA3AF"
            selectionColor="#2563EB"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>
        {!!error && <Text style={styles.error}>{error}</Text>}
        <Button
          title="Cadastrar"
          variant="success"
          onPress={handleSignUp}
          style={{ width: '100%', marginTop: 10 }}
          loading={loading}
          disabled={loading}
          testID="signUpSubmit"
          accessibilityLabel="Cadastrar"
        />
        <TouchableOpacity onPress={() => router.push('/sign-in')}>
          <Text style={styles.link}>Já tem conta? Entrar</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: {
    width: width > 420 ? 380 : '92%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 10,
    elevation: 7,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  inputBox: { marginBottom: 12 },
  label: { fontSize: 14, color: '#374151', marginBottom: 4, fontWeight: '500' },
  input: {
    width: '100%',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    fontSize: 16,
    color: '#111827',
  },
  error: { color: '#B91C1C', textAlign: 'center', marginBottom: 8 },
  link: { marginTop: 12, color: '#6366F1', fontWeight: '500', textAlign: 'center' },
});
