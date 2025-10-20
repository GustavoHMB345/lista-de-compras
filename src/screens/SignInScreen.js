import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Button from '../components/Button';
import Screen from '../components/Screen';
import { DataContext } from '../contexts/DataContext';

const { width } = Dimensions.get('window');
const __fs = Math.min(1.2, Math.max(0.9, width / 390));

export default function SignInScreen() {
  const { login } = useContext(DataContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        router.replace('/dashboard');
      } else {
        setError(result.message || 'Email ou senha inválidos.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#3B82F6', '#8B5CF6']} style={styles.container}>
      <Screen
        scroll={false}
        contentStyle={{
          paddingTop: 0,
          paddingHorizontal: 0,
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View style={styles.card}>
          <View style={styles.headerWrap}>
            <LinearGradient
              colors={['#6C7DFF', '#4F46E5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.badge}
            >
              <Text style={styles.badgeGlyph}>🔑</Text>
            </LinearGradient>
            <Text style={styles.title}>Entrar</Text>
            <Text style={styles.subtitle}>Acesse suas listas e histórico</Text>
          </View>
          <View style={styles.inputBox}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="voce@email.com"
              placeholderTextColor="#9CA3AF"
              selectionColor="#2563EB"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              value={email}
              onChangeText={setEmail}
              returnKeyType="next"
              maxFontSizeMultiplier={1.2}
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
              textContentType="password"
              value={password}
              onChangeText={setPassword}
              returnKeyType="go"
              onSubmitEditing={handleSignIn}
              maxFontSizeMultiplier={1.2}
            />
          </View>
          <View style={styles.forgotRow}>
            <TouchableOpacity onPress={() => router.push('/reset-password')} activeOpacity={0.8}>
              <Text style={styles.forgot}>Esqueci minha senha</Text>
            </TouchableOpacity>
          </View>
          {!!error && <Text style={styles.error}>{error}</Text>}
          <Button
            title="Entrar"
            variant="primary"
            onPress={handleSignIn}
            style={{ width: '100%', marginTop: 10 }}
            loading={loading}
            disabled={loading}
            testID="signInSubmit"
            accessibilityLabel="Entrar"
          />
          <Button
            title="Usuário de teste"
            variant="secondary"
            onPress={async () => {
              setEmail('teste@teste.com');
              setPassword('123456');
              setLoading(true);
              try {
                const r = await login('teste@teste.com', '123456');
                if (r.success) router.replace('/dashboard');
                else setError('Usuário de teste não encontrado.');
              } finally {
                setLoading(false);
              }
            }}
            style={{ width: '100%', marginTop: 10 }}
            disabled={loading}
            testID="signInTestUser"
            accessibilityLabel="Entrar com usuário de teste"
          />
          <TouchableOpacity onPress={() => router.push('/sign-up')} activeOpacity={0.8}>
            <Text style={styles.link}>Não tem conta? Cadastre-se</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: {
    width: width > 420 ? 380 : '92%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#0B0B0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 10,
    elevation: 7,
  },
  headerWrap: { alignItems: 'center', marginBottom: 12 },
  badge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6C7DFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 8,
  },
  badgeGlyph: { fontSize: Math.round(26 * __fs), color: '#fff' },
  title: {
    fontSize: Math.round(24 * __fs),
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Math.round(13 * __fs),
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 2,
  },
  inputBox: { marginBottom: 12 },
  label: { fontSize: Math.round(14 * __fs), color: '#374151', marginBottom: 4, fontWeight: '500' },
  input: {
    width: '100%',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    fontSize: Math.round(16 * __fs),
    color: '#111827',
  },
  error: { color: '#B91C1C', textAlign: 'center', marginBottom: 8 },
  link: { marginTop: 12, color: '#6366F1', fontWeight: '600', textAlign: 'center' },
  forgotRow: { alignItems: 'flex-end', marginTop: 4 },
  forgot: { color: '#6366F1', fontWeight: '600', fontSize: Math.round(12 * __fs) },
});
