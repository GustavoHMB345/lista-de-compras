import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { DataContext } from '../contexts/DataContext';

export default function AuthScreen() {
    const { login, register, theme } = useContext(DataContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState('');
    const [name, setName] = useState('');
    const router = useRouter();
    const styles = createStyles(theme);

    const handleAuth = () => {
        setError('');
        if (isLogin) {
            const success = login(email, password);
            if (success) {
                router.replace('/dashboard'); // Redireciona para tela principal (dashboard)
                return;
            }
            setError("Email ou senha inválidos.");
        } else {
            if (!name.trim()) {
                setError("Nome é obrigatório.");
                return;
            }
            const result = register(email, password);
            if (result.success) {
                router.replace('/dashboard'); // Redireciona após cadastro
                return;
            }
            if (!result.success) {
                setError(result.message);
            }
        }
    };

    return (
        <LinearGradient colors={[theme.primary, theme.secondary]} style={styles.gradient}>
            <View style={styles.centered}>
                <View style={styles.card}>
                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[styles.tab, isLogin && styles.tabActive]}
                            onPress={() => { setIsLogin(true); setError(''); }}>
                            <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>Login</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, !isLogin && styles.tabActive]}
                            onPress={() => { setIsLogin(false); setError(''); }}>
                            <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>Cadastro</Text>
                        </TouchableOpacity>
                    </View>
                    {/* Títulos removidos para experiência sem header visual */}
                    <View style={{ marginTop: 24 }}>
                        {!isLogin && (
                            <View style={{ marginBottom: 12 }}>
                                <Text style={styles.label}>Nome</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Seu nome completo"
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>
                        )}
                        <View style={{ marginBottom: 12 }}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="seu@email.com"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>
                        <View style={{ marginBottom: 12 }}>
                            <Text style={styles.label}>Senha</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="••••••••"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>
                        {error ? (
                            <View style={styles.errorBox}>
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        ) : null}
                        <TouchableOpacity style={styles.button} onPress={handleAuth} activeOpacity={0.8}>
                            <Text style={styles.buttonText}>{isLogin ? 'Entrar' : 'Cadastrar'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { setIsLogin(!isLogin); setError(''); }} activeOpacity={0.7}>
                            <Text style={styles.toggleText}>
                                {isLogin ? 'Não tem uma conta? Cadastre-se.' : 'Já tem uma conta? Faça login.'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </LinearGradient>
    );
}

const { width } = Dimensions.get('window');
const createStyles = (theme) => StyleSheet.create({
    gradient: {
        flex: 1,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        width: width > 400 ? 380 : '90%',
        backgroundColor: theme.card,
        borderRadius: 24,
        padding: 28,
        shadowColor: theme.text,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: theme.surface,
        borderRadius: 12,
        marginBottom: 18,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: 'center',
    },
    tabActive: {
        backgroundColor: theme.card,
        shadowColor: theme.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    tabText: {
        fontSize: 16,
        color: theme.textSecondary,
        fontWeight: '500',
    },
    tabTextActive: {
        color: theme.primary,
        fontWeight: 'bold',
    },
    title: {
        textAlign: 'center',
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.text,
        marginBottom: 4,
    },
    subtitle: {
        textAlign: 'center',
        color: theme.textSecondary,
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        color: theme.text,
        marginBottom: 4,
        fontWeight: '500',
    },
    input: {
        width: '100%',
        backgroundColor: theme.input,
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: theme.border,
        fontSize: 16,
        color: theme.text,
    },
    errorBox: {
        backgroundColor: theme.errorLight,
        borderColor: theme.error,
        borderWidth: 1,
        borderRadius: 8,
        padding: 8,
        marginBottom: 8,
    },
    errorText: {
        color: theme.error,
        textAlign: 'center',
        fontSize: 14,
    },
    button: {
        width: '100%',
        backgroundColor: theme.primary,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 4,
    },
    buttonText: {
        color: theme.card,
        fontWeight: 'bold',
        fontSize: 16,
    },
    toggleText: {
        marginTop: 12,
        color: theme.primary,
        fontWeight: '500',
        textAlign: 'center',
    },
});
