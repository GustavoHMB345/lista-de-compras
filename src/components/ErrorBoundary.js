import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    this.setState({ info });
    if (typeof this.props.onError === 'function') {
      this.props.onError(error, info);
    }
    console.error('[ErrorBoundary]', error, info?.componentStack);
  }
  render() {
    const { error, info } = this.state;
    if (error) {
      return (
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>⚠️ Erro de Renderização</Text>
          <Text style={styles.message}>{String(error.message || error)}</Text>
          {info?.componentStack ? (
            <Text style={styles.stack}>{info.componentStack}</Text>
          ) : null}
          <Text style={styles.hint}>O erro original é mostrado aqui para evitar a falha de symbolication que gera o caminho "&lt;anonymous&gt;". Corrija a causa e reinicie o bundle.</Text>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, backgroundColor: '#0f172a' },
  title: { fontSize: 20, fontWeight: '700', color: '#fbbf24', marginBottom: 16 },
  message: { color: '#f1f5f9', fontSize: 16, marginBottom: 16 },
  stack: { color: '#94a3b8', fontSize: 12, lineHeight: 16, marginBottom: 24 },
  hint: { color: '#38bdf8', fontSize: 13 },
});
