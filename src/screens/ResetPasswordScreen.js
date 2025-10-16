import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { Alert, Dimensions, StyleSheet, Text, TextInput, View } from 'react-native';
import Button from '../components/Button';
import Screen from '../components/Screen';
import { DataContext } from '../contexts/DataContext';

const { width } = Dimensions.get('window');
const __fs = Math.min(1.2, Math.max(0.9, width / 390));

export default function ResetPasswordScreen() {
  const { resetPassword, requestPasswordReset } = useContext(DataContext);
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [devHint, setDevHint] = useState('');

  const handleRequest = async () => {
    const trimmed = email.trim();
    if (!/.+@.+\..+/.test(trimmed)) {
      Alert.alert('Recuperar senha', 'Informe um email válido.');
      return;
    }
    setLoading(true);
    try {
      const res = await requestPasswordReset(trimmed);
      if (res?.devCode) {
        setDevHint(`Código (dev): ${res.devCode}`);
      }
      Alert.alert('Recuperar senha', 'Se existir uma conta, um código foi enviado.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      const res = await resetPassword(email.trim(), code.trim(), password);
      if (res.success) {
        Alert.alert('Sucesso', 'Senha alterada. Faça login novamente.');
        // Após redefinir, voltar para a tela de login dedicada
        router.replace('/sign-in');
      } else {
        Alert.alert('Erro', res.message || 'Não foi possível redefinir.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#3B82F6', '#8B5CF6']} style={{ flex: 1 }}>
      <Screen>
        <View style={styles.card}>
          <View style={styles.headerWrap}>
            <LinearGradient colors={['#6C7DFF', '#4F46E5']} style={styles.badge}>
              <Text style={styles.badgeGlyph}>🛡️</Text>
            </LinearGradient>
            <Text style={styles.title}>Redefinir Senha</Text>
            <Text style={styles.subtitle}>Use o código enviado ao seu email</Text>
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
              returnKeyType="next"
              maxFontSizeMultiplier={1.2}
            />
          </View>
          {!!devHint && (
            <View style={{ marginBottom: 8 }}>
              <Text
                style={{
                  color: '#065F46',
                  backgroundColor: '#D1FAE5',
                  borderColor: '#A7F3D0',
                  borderWidth: 1,
                  padding: 8,
                  borderRadius: 8,
                }}
              >
                {devHint}
              </Text>
            </View>
          )}
          <Button
            title="Enviar código"
            variant="secondary"
            onPress={handleRequest}
            disabled={loading}
          />
          <View style={[styles.inputBox, { marginTop: 12 }]}>
            <Text style={styles.label}>Código</Text>
            <TextInput
              style={styles.input}
              placeholder="6 dígitos"
              placeholderTextColor="#9CA3AF"
              selectionColor="#2563EB"
              keyboardType="number-pad"
              value={code}
              onChangeText={(t) => setCode(t.replace(/[^0-9]/g, ''))}
              maxLength={6}
              returnKeyType="next"
              maxFontSizeMultiplier={1.2}
            />
          </View>
          <View style={styles.inputBox}>
            <Text style={styles.label}>Nova senha</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#9CA3AF"
              selectionColor="#2563EB"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              returnKeyType="go"
              onSubmitEditing={handleReset}
              maxFontSizeMultiplier={1.2}
            />
          </View>
          <Button
            title="Redefinir Senha"
            onPress={handleReset}
            loading={loading}
            disabled={loading}
          />
        </View>
      </Screen>
    </LinearGradient>
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
});
