import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Button from '../components/Button';
import Screen from '../components/Screen';
import { useTheme } from '../components/theme';
import { DataContext } from '../contexts/DataContext';

const { width } = Dimensions.get('window');
const __fs = Math.min(1.2, Math.max(0.9, width / 390));

export default function SignUpScreen() {
  const { register } = useContext(DataContext);
  const { tokens: t, scheme } = useTheme();
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
      <View style={[styles.card, { backgroundColor: t.card }]}>
          <View style={styles.headerWrap}>
            <LinearGradient
              colors={['#6C7DFF', '#4F46E5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.badge}
            >
              <Text style={styles.badgeGlyph}>🔐</Text>
            </LinearGradient>
            <Text style={[styles.title, { color: t.text }]}>Criar conta</Text>
            <Text style={[styles.subtitle, { color: t.muted }]}>Comece a organizar suas compras</Text>
          </View>
          <View style={styles.inputBox}>
            <Text style={[styles.label, { color: t.text }]}>Nome</Text>
            <TextInput
              style={[styles.input, { backgroundColor: t.inputBg, borderColor: t.border, color: t.text }]}
              placeholder="Seu nome"
              placeholderTextColor={t.muted}
              selectionColor={t.primary}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              returnKeyType="next"
              maxFontSizeMultiplier={1.2}
            />
          </View>
          <View style={styles.inputBox}>
            <Text style={[styles.label, { color: t.text }]}>Email</Text>
            <TextInput
              style={[styles.input, { backgroundColor: t.inputBg, borderColor: t.border, color: t.text }]}
              placeholder="voce@email.com"
              placeholderTextColor={t.muted}
              selectionColor={t.primary}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              returnKeyType="next"
              maxFontSizeMultiplier={1.2}
            />
          </View>
          <View style={styles.inputBox}>
            <Text style={[styles.label, { color: t.text }]}>Senha</Text>
            <TextInput
              style={[styles.input, { backgroundColor: t.inputBg, borderColor: t.border, color: t.text }]}
              placeholder="••••••••"
              placeholderTextColor={t.muted}
              selectionColor={t.primary}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              returnKeyType="go"
              onSubmitEditing={handleSignUp}
              maxFontSizeMultiplier={1.2}
            />
          </View>
          {!!error && <Text style={[styles.error, { color: t.danger }]}>{error}</Text>}
          <Button
            title="Cadastrar"
            variant="primary"
            onPress={handleSignUp}
            style={{ width: '100%', marginTop: 10 }}
            loading={loading}
            disabled={loading}
            testID="signUpSubmit"
            accessibilityLabel="Cadastrar"
          />
          <TouchableOpacity onPress={() => router.push('/sign-in')} activeOpacity={0.8}>
            <Text style={[styles.link, { color: t.primary }]}>Já tem conta? Entrar</Text>
          </TouchableOpacity>
        </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
});
