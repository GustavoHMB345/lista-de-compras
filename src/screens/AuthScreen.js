import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { DataContext } from '../contexts/DataContext';


export default function AuthScreen() {
    const { login, register } = useContext(DataContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState('');
    const [name, setName] = useState('');
    const router = useRouter();

    const handleAuth = () => {
        setError('');
        if (isLogin) {
            const success = login(email, password);
            if (success) {
                router.replace('/dashboard');
                return;
            }
            setError('Email ou senha inválidos.');
        } else {
            if (!name.trim()) {
                setError('Nome é obrigatório.');
                return;
            }
            const result = register(email, password);
            if (result.success) {
                router.replace('/dashboard');
                return;
            }
            if (!result.success) {
                setError(result.message);
            }
        }
    };

    return (
        <LinearGradient colors={["#3B82F6", "#8B5CF6"]} style={stylesAuth.gradient}>
            <View style={stylesAuth.centered}>
                <View style={stylesAuth.card}>
                    <View style={stylesAuth.tabContainer}>
                        <TouchableOpacity
                            style={[stylesAuth.tab, isLogin && stylesAuth.tabActive]}
                            onPress={() => { setIsLogin(true); setError(''); }}>
                            <Text style={[stylesAuth.tabText, isLogin && stylesAuth.tabTextActive]}>Login</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[stylesAuth.tab, !isLogin && stylesAuth.tabActive]}
                            onPress={() => { setIsLogin(false); setError(''); }}>
                            <Text style={[stylesAuth.tabText, !isLogin && stylesAuth.tabTextActive]}>Cadastro</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={stylesAuth.formArea}>
                        {!isLogin && (
                            <View style={stylesAuth.inputBox}>
                                <Text style={stylesAuth.label}>Nome</Text>
                                <TextInput
                                    style={stylesAuth.input}
                                    placeholder="Seu nome completo"
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>
                        )}
                        <View style={stylesAuth.inputBox}>
                            <Text style={stylesAuth.label}>Email</Text>
                            <TextInput
                                style={stylesAuth.input}
                                placeholder="seu@email.com"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>
                        <View style={stylesAuth.inputBox}>
                            <Text style={stylesAuth.label}>Senha</Text>
                            <TextInput
                                style={stylesAuth.input}
                                placeholder="••••••••"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>
                        {!!error && (
                            <View style={stylesAuth.errorBox}>
                                <Text style={stylesAuth.errorText}>{error}</Text>
                            </View>
                        )}
                        <TouchableOpacity style={stylesAuth.button} onPress={handleAuth} activeOpacity={0.8}>
                            <Text style={stylesAuth.buttonText}>{isLogin ? 'Entrar' : 'Cadastrar'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { setIsLogin(!isLogin); setError(''); }} activeOpacity={0.7}>
                            <Text style={stylesAuth.toggleText}>
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
const stylesAuth = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
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
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        marginBottom: 16,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: 'center',
    },
    tabActive: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    tabText: {
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '500',
    },
    tabTextActive: {
        color: '#3B82F6',
        fontWeight: 'bold',
    },
    formArea: {
        marginTop: 18,
    },
    inputBox: {
        marginBottom: 12,
    },
    label: {
        fontSize: 14,
        color: '#374151',
        marginBottom: 4,
        fontWeight: '500',
    },
    input: {
        width: '100%',
        backgroundColor: '#F3F4F6',
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        fontSize: 16,
    },
    errorBox: {
        backgroundColor: '#FEE2E2',
        borderColor: '#F87171',
        borderWidth: 1,
        borderRadius: 8,
        padding: 8,
        marginBottom: 8,
    },
    errorText: {
        color: '#B91C1C',
        textAlign: 'center',
        fontSize: 14,
    },
    button: {
        width: '100%',
        backgroundColor: '#3B82F6',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 4,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    toggleText: {
        marginTop: 12,
        color: '#6366F1',
        fontWeight: '500',
        textAlign: 'center',
    },
});
