import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import {
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import TabBar from '../components/TabBar';
import { DataContext } from '../contexts/DataContext';

const { width } = Dimensions.get('window');
const __fs = Math.min(1.2, Math.max(0.9, width / 390));
const MAX_WIDTH = Math.min(820, width * 0.98);

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { alignItems: 'center', paddingBottom: 28, paddingTop: 18 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginVertical: 10,
    width: MAX_WIDTH,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14 * __fs,
    color: '#111827',
    marginTop: 8,
  },
  rowCenter: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 12 },
});

export default function JoinFamilyScreen() {
  const router = useRouter();
  const { families, currentUser, updateFamilies } = useContext(DataContext);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

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

  const submit = () => {
    const c = (code || '').trim();
    if (!c) {
      setError('Informe um ID válido.');
      return;
    }
    const idx = families.findIndex((f) => f.id === c);
    if (idx < 0) {
      setError('Família não encontrada.');
      return;
    }
    const fam = families[idx];
    if ((fam.members || []).includes(currentUser?.id)) {
      setError('Você já é membro desta família.');
      return;
    }
    const next = families.map((f, i) =>
      i === idx ? { ...f, members: [...(f.members || []), currentUser.id] } : f,
    );
    updateFamilies(next);
    if (Platform.OS === 'android') {
      try {
        ToastAndroid.show(`Você entrou em "${fam.name}"`, ToastAndroid.SHORT);
      } catch {}
    }
    Alert.alert('Pronto!', `Você entrou em "${fam.name}".`, [
      { text: 'Ok', onPress: () => router.replace('/family') },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f5ff' }} edges={['top']}>
      <TabBar active={'FAMILY'} onNavigate={handleNavigate} />
      <LinearGradient colors={['#EFF6FF', '#E0E7FF']} style={styles.root}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text style={{ fontSize: 24 * __fs, fontWeight: '800', color: '#111827' }}>
              Entrar por ID
            </Text>
            <Text style={{ fontSize: 13 * __fs, color: '#6B7280', marginTop: 6 }}>
              Peça o ID da família e insira abaixo para participar.
            </Text>
            <TextInput
              placeholder="ID da família"
              value={code}
              onChangeText={(v) => {
                setCode(v);
                if (error) setError('');
              }}
              autoCapitalize="none"
              style={[styles.input, error ? { borderColor: '#EF4444' } : null]}
              placeholderTextColor="#9CA3AF"
              selectionColor="#2563EB"
            />
            {!!error && (
              <Text style={{ color: '#B91C1C', marginTop: 6, textAlign: 'center' }}>{error}</Text>
            )}
            <View style={styles.rowCenter}>
              <Button variant="light" title="Cancelar" onPress={() => router.back()} />
              <Button title="Entrar" onPress={submit} />
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}
