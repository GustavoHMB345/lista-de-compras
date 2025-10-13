import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useState } from 'react';
import { LayoutAnimation, Platform, UIManager } from 'react-native';

// Avoid calling the experimental enabler on New Architecture (Fabric), where it's a no-op
// and causes WARN logs. LayoutAnimation on Android Fabric does not require enabling.
const isFabric = typeof global !== 'undefined' && !!global.nativeFabricUIManager;
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental && !isFabric) {
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
    resetTokens: [], // { email, code, expiresAt }
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

  // Password reset: request a code (valid for 15 minutes)
  const requestPasswordReset = async (email) => {
    const normalized = String(email || '')
      .trim()
      .toLowerCase();
    if (!normalized) return { success: false, message: 'Informe um email.' };
    const code = String(Math.floor(100000 + Math.random() * 900000)); // 6 dígitos
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutos
    const existing = (data.resetTokens || []).filter((t) => t.email !== normalized);
    const next = { ...data, resetTokens: [...existing, { email: normalized, code, expiresAt }] };
    await saveData(next);
    setData(next);
    // Não revelar se email existe ou não
    // Em desenvolvimento, retornamos o código para facilitar testes manuais
    return { success: true, devCode: typeof __DEV__ !== 'undefined' && __DEV__ ? code : undefined };
  };

  // Password reset: validate code and set new password
  const resetPassword = async (email, code, newPassword) => {
    const normalized = String(email || '')
      .trim()
      .toLowerCase();
    const codeStr = String(code || '').trim();
    if (!normalized || !codeStr || !newPassword) {
      return { success: false, message: 'Dados incompletos.' };
    }
    const token = (data.resetTokens || []).find(
      (t) => t.email === normalized && t.code === codeStr,
    );
    if (!token) return { success: false, message: 'Código inválido.' };
    if (Date.now() > token.expiresAt) return { success: false, message: 'Código expirado.' };
    // Atualiza senha do usuário se existir
    const userIdx = (data.users || []).findIndex((u) => u.email.toLowerCase() === normalized);
    if (userIdx === -1) {
      // Para não revelar existência, consideramos sucesso mas limpamos o token
      const cleaned = { ...data, resetTokens: (data.resetTokens || []).filter((t) => t !== token) };
      await saveData(cleaned);
      setData(cleaned);
      return { success: true };
    }
    const users = [...data.users];
    users[userIdx] = { ...users[userIdx], password: String(newPassword) };
    const cleaned = {
      ...data,
      users,
      resetTokens: (data.resetTokens || []).filter((t) => t !== token),
    };
    await saveData(cleaned);
    setData(cleaned);
    return { success: true };
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
        requestPasswordReset,
        resetPassword,
        updateLists,
        updateFamilies,
        updateUsers,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
