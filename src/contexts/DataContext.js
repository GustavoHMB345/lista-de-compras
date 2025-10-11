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
        email: 'teste@teste.com',
        password: '123456',
        displayName: 'Usuário Teste',
        familyId: 'family_teste',
      },
    ],
    families: [
      {
        id: 'family_teste',
        name: 'Família Teste',
        owner: 'user_teste',
        members: ['user_teste'],
      },
    ],
    shoppingLists: [],
    currentUser: null,
  });
  const [loading, setLoading] = useState(true);

  const loadData = React.useCallback(async () => {
    try {
      const storedData = await AsyncStorage.getItem('@SuperLista:data');
      let parsed = null;
      if (storedData) {
        parsed = JSON.parse(storedData);
      }
      // Garante que o usuário de teste sempre exista
      const testUser = {
        id: 'user_teste',
        email: 'teste@teste.com',
        password: '123456',
        displayName: 'Usuário Teste',
        familyId: 'family_teste',
      };
      const testFamily = {
        id: 'family_teste',
        name: 'Família Teste',
        owner: 'user_teste',
        members: ['user_teste'],
      };
      let users = parsed?.users || [];
      let families = parsed?.families || [];
      // Adiciona usuário/família de teste se não existir
      if (!users.some((u) => u.email === testUser.email)) {
        users = [testUser, ...users];
      }
      if (!families.some((f) => f.id === testFamily.id)) {
        families = [testFamily, ...families];
      }
      setData((prev) => ({
        ...prev,
        ...parsed,
        users,
        families,
      }));
    } catch (e) {
      console.error('Failed to load data.', e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const saveData = async (newData) => {
    try {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setData(newData);
      const jsonValue = JSON.stringify(newData);
      await AsyncStorage.setItem('@SuperLista:data', jsonValue);
    } catch (e) {
      console.error('Failed to save data.', e);
    }
  };

  const login = async (email, password) => {
    try {
      const storedData = await AsyncStorage.getItem('@SuperLista:data');
      let users = data.users;
      if (storedData) {
        const parsed = JSON.parse(storedData);
        users = parsed.users || users;
      }
      const user = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
      );
      if (user) {
        const newData = { ...data, currentUser: user };
        await saveData(newData);
        setData(newData);
        return { success: true };
      }
      return { success: false, message: 'Email ou senha inválidos.' };
    } catch (_e) {
      return { success: false, message: 'Erro ao acessar dados.' };
    }
  };

  const logout = () => {
    const newData = { ...data, currentUser: null };
    saveData(newData);
  };

  const register = async (email, password, displayNameFromParam) => {
    try {
      const storedData = await AsyncStorage.getItem('@SuperLista:data');
      let users = data.users;
      let families = data.families;
      if (storedData) {
        const parsed = JSON.parse(storedData);
        users = parsed.users || users;
        families = parsed.families || families;
      }
      if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
        return { success: false, message: 'Este email já está em uso.' };
      }
      const userId = `user_${Date.now()}`;
      const familyId = `family_${Date.now()}`;
      const displayName =
        (displayNameFromParam && displayNameFromParam.trim()) || email.split('@')[0];
      const newUser = { id: userId, email, password, displayName, familyId };
      const newFamily = {
        id: familyId,
        name: `Família de ${displayName}`,
        owner: userId,
        members: [userId],
      };
      const newData = {
        ...data,
        users: [...users, newUser],
        families: [...families, newFamily],
        currentUser: newUser,
      };
      await saveData(newData);
      setData(newData);
      return { success: true };
    } catch (_e) {
      return { success: false, message: 'Erro ao registrar usuário.' };
    }
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
    <DataContext.Provider
      value={{
        ...data,
        loading,
        login,
        logout,
        register,
        updateLists,
        updateFamilies,
        updateUsers,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
