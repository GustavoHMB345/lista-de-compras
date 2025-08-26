import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useState, useEffect } from 'react';
import { LayoutAnimation, Platform, UIManager } from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const DataContext = createContext();

// Definição dos temas
const lightTheme = {
    background: '#F3F4F6',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    primary: '#3B82F6',
    secondary: '#6366F1',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    input: '#F9FAFB',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
};

const darkTheme = {
    background: '#111827',
    surface: '#1F2937',
    card: '#374151',
    primary: '#60A5FA',
    secondary: '#818CF8',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    border: '#4B5563',
    input: '#8f97a5ff',
    error: '#F87171',
    success: '#34D399',
    warning: '#FBBF24',
    placeholderTextColor: '#898989ff',
};

export const DataProvider = ({ children }) => {
    const [data, setData] = useState({
        users: [
            {
                id: 'user_teste',
                email: 'seu@email.com',
                password: '1515',
                displayName: 'Teste',
                familyId: 'family_teste'
            }
        ],
        families: [
            {
                id: 'family_teste',
                name: 'Família de Teste',
                owner: 'user_teste',
                members: ['user_teste']
            }
        ],
        shoppingLists: [],
        currentUser: null,
    });
    const [loading, setLoading] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const theme = isDarkMode ? darkTheme : lightTheme;

    const loadData = async () => {
        try {
            const storedData = await AsyncStorage.getItem('@SuperLista:data');
            if (storedData) {
                const parsed = JSON.parse(storedData);
                // Se não houver usuários, mantém o usuário de teste
                if (parsed.users && parsed.users.length > 0) {
                    setData(parsed);
                }
            }
            
            // Carregar preferência de tema
            const themePreference = await AsyncStorage.getItem('@SuperLista:theme');
            if (themePreference) {
                setIsDarkMode(JSON.parse(themePreference));
            }
        } catch (e) {
            console.error("Failed to load data.", e);
        } finally {
            setLoading(false);
        }
    };

    const toggleTheme = async () => {
        try {
            const newThemeMode = !isDarkMode;
            setIsDarkMode(newThemeMode);
            await AsyncStorage.setItem('@SuperLista:theme', JSON.stringify(newThemeMode));
        } catch (e) {
            console.error("Failed to save theme preference.", e);
        }
    };

    const saveData = async (newData) => {
        try {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setData(newData);
            const jsonValue = JSON.stringify(newData);
            await AsyncStorage.setItem('@SuperLista:data', jsonValue);
        } catch (e) {
            console.error("Failed to save data.", e);
        }
    };

    const login = (email, password) => {
        console.log('Usuários disponíveis:', data.users);
        console.log('Tentativa de login:', email, password);
        const user = data.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        if (user) {
            const newData = { ...data, currentUser: user };
            saveData(newData);
            console.log('Login bem-sucedido:', user);
            return true;
        }
        console.log('Login falhou');
        return false;
    };

    const logout = () => {
        const newData = { ...data, currentUser: null };
        saveData(newData);
    };

    const register = (email, password) => {
        if (data.users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
            return { success: false, message: "Este email já está em uso." };
        }

        const userId = `user_${Date.now()}`;
        const familyId = `family_${Date.now()}`;
        const displayName = email.split('@')[0];

        const newUser = { id: userId, email, password, displayName, familyId };
        const newFamily = { id: familyId, name: `Família de ${displayName}`, owner: userId, members: [userId] };

        const newData = {
            ...data,
            users: [...data.users, newUser],
            families: [...data.families, newFamily],
            currentUser: newUser,
        };
        saveData(newData);
        return { success: true };
    };
    
    const updateLists = (newLists) => {
        const newData = { ...data, shoppingLists: newLists };
        saveData(newData);
    };

    const updateFamilies = (newFamilies) => {
        const newData = { ...data, families: newFamilies };
        saveData(newData);
    };
    
    const updateUsers = (newUsers) => {
        const newData = { ...data, users: newUsers };
        saveData(newData);
    };

    // Carregar dados na inicialização
    useEffect(() => {
        loadData();
    }, []);

    return (
        <DataContext.Provider value={{ 
            ...data, 
            loading, 
            theme, 
            isDarkMode, 
            toggleTheme,
            login, 
            logout, 
            register, 
            updateLists, 
            updateFamilies, 
            updateUsers 
        }}>
            {children}
        </DataContext.Provider>
    );
};
