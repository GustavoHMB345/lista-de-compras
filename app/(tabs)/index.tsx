import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// Estilos no topo do arquivo
const modernStyles = StyleSheet.create({
  titleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 38,
    marginRight: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 15,
    color: '#374151',
    marginBottom: 2,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

// Card reutilizável
function InfoCard({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <ThemedView style={modernStyles.card}>
      {title && <ThemedText type="subtitle" style={modernStyles.cardTitle}>{title}</ThemedText>}
      {children}
    </ThemedView>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={modernStyles.reactLogo}
        />
      }>
  {/* Título principal removido */}
      {/* Cards informativos */}
  {/* Cards informativos removidos */}
      {/* Botão para autenticação */}
      <TouchableOpacity
        style={modernStyles.button}
        accessibilityLabel="Ir para tela de autenticação"
  onPress={() => router.replace('/auth')}
      >
        <Text style={modernStyles.buttonText}>Ir para Autenticação</Text>
      </TouchableOpacity>
    </ParallaxScrollView>
  );
}
