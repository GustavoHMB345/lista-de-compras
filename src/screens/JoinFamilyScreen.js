import { useRouter } from 'expo-router';
import React, { useContext, useMemo, useState } from 'react';
import {
  Alert,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  View,
} from 'react-native';
import Button from '../components/Button';
import ScreensDefault from '../components/ScreensDefault';
import { DataContext } from '../contexts/DataContext';
import { useAppTheme } from '../hooks/useAppTheme';

const { width } = Dimensions.get('window');
const __fs = Math.min(1.2, Math.max(0.9, width / 390));
const MAX_WIDTH = Math.min(820, width * 0.98);

const makeStyles = (palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.bg },
    scrollContent: {
      alignItems: 'center',
      paddingBottom: 28,
      paddingTop: 16,
    },
    card: {
      backgroundColor: palette.card,
      borderRadius: 20,
      padding: 18,
  shadowColor: '#0B0B0B',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
      marginVertical: 10,
      width: MAX_WIDTH,
      borderWidth: 1,
      borderColor: palette.border,
    },
    title: { fontSize: 24 * __fs, fontWeight: '800', color: palette.text },
    subtitle: { fontSize: 13 * __fs, color: palette.mutedText, marginTop: 6 },
    input: {
      backgroundColor: palette.card,
      borderWidth: 1,
      borderColor: palette.border,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 14 * __fs,
      color: palette.text,
      marginTop: 8,
    },
    rowCenter: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 12 },
    error: { color: palette.danger, marginTop: 6, textAlign: 'center' },
  });

export default function JoinFamilyScreen() {
  const router = useRouter();
  const { families, currentUser, updateFamilies, uiPrefs } = useContext(DataContext);
  const { palette } = useAppTheme();
  const styles = useMemo(() => makeStyles(palette), [palette]);
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
    <ScreensDefault active="FAMILY" leftTab="FAMILY" rightTab="LISTS" contentStyle={{ paddingHorizontal: 0 }}>
        <View style={[styles.container]}>
          <View style={{ alignItems: 'center' }}>
            <View style={styles.card}>
              <Text style={styles.title}>Entrar por ID</Text>
              <Text style={styles.subtitle}>
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
                style={[styles.input, error ? { borderColor: palette.danger } : null]}
                placeholderTextColor={palette.mutedText}
                selectionColor={palette.primary}
              />
              {!!error && <Text style={styles.error}>{error}</Text>}
              <View style={styles.rowCenter}>
                <Button variant="light" title="Cancelar" onPress={() => router.back()} />
                <Button title="Entrar" onPress={submit} />
              </View>
            </View>
          </View>
        </View>
    </ScreensDefault>
  );
}
