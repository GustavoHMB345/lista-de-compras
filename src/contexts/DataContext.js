import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useState } from 'react';
import { LayoutAnimation, Platform, UIManager } from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const DataContext = createContext();

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
        } catch (e) {
            console.error("Failed to load data.", e);
        } finally {
            setLoading(false);
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

    return (
        <DataContext.Provider value={{ ...data, loading, login, logout, register, updateLists, updateFamilies, updateUsers }}>
            {children}
        </DataContext.Provider>
    );
};
