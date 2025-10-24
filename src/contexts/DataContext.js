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
    uiPrefs: {
      theme: 'light', // 'light' | 'dark'
      tabBarPosition: 'bottom', // 'bottom' | 'top'
    },
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
      // Seed demo shopping lists with items and prices if none exist
      const seedIfEmpty = (parsedLists) => {
        if (parsedLists && parsedLists.length > 0) return parsedLists;
        const ownerId = testUser.id;
        const famId = testFamily.id;
        const daysAgo = (n) => {
          const d = new Date();
          d.setDate(d.getDate() - n);
          return d.toISOString();
        };
        const mkItem = (name, category, price, days, purchased = true) => ({
          id: `item_${name}_${days}_${Math.random().toString(36).slice(2,8)}`,
          name,
          category,
          price,
          isPurchased: !!purchased,
          completed: !!purchased,
          done: !!purchased,
          checked: !!purchased,
          purchasedAt: purchased ? daysAgo(days) : undefined,
          createdAt: daysAgo(days + 1),
          addedBy: ownerId,
        });
        const list = (id, name, priority, items) => ({
          id,
          name,
          priority,
          familyId: famId,
          createdAt: daysAgo(40),
          items,
        });
        // Two completed lists and one active to feed both scopes
        const L1 = list('list_demo_1', 'Compras da Semana', 'medium', [
          mkItem('Arroz', 'outros', 22.9, 2, true),
          mkItem('Feijão', 'outros', 9.5, 3, true),
          mkItem('Frango', 'carnes', 27.9, 4, true),
          mkItem('Leite', 'laticinios', 6.9, 5, true),
          mkItem('Maçã', 'frutas', 4.1, 6, true),
        ]);
        const L2 = list('list_demo_2', 'Churrasco', 'high', [
          mkItem('Carvão', 'outros', 18.9, 9, true),
          mkItem('Carne Bovina', 'carnes', 69.9, 10, true),
          mkItem('Linguiça', 'carnes', 24.5, 12, true),
          mkItem('Refrigerante', 'bebidas', 9.9, 14, true),
          mkItem('Pão de Alho', 'paes', 12.5, 15, true),
        ]);
        const L3 = list('list_demo_3', 'Farmácia', 'low', [
          mkItem('Analgésico', 'outros', 14.9, 1, true),
          mkItem('Curativo', 'outros', 7.9, 1, false),
          mkItem('Vitaminas', 'outros', 29.9, 0, false),
        ]);
        // Monthly spread + expensive items for visuals
        const L4 = list('list_demo_4', 'Supermercado do Mês', 'medium', [
          mkItem('Azeite Importado 500ml', 'outros', 49.9, 20, true),
          mkItem('Café Gourmet 1kg', 'outros', 79.9, 27, true),
          mkItem('Salmão 1kg', 'carnes', 89.9, 34, true),
          mkItem('Queijo Parmesão', 'laticinios', 38.5, 41, true),
          mkItem('Vinho Tinto', 'bebidas', 59.9, 48, true),
        ]);
        const L5 = list('list_demo_5', 'Hortifruti', 'low', [
          mkItem('Manga', 'frutas', 6.9, 55, true),
          mkItem('Morango', 'frutas', 12.9, 52, true),
          mkItem('Abacate', 'frutas', 8.9, 50, true),
          mkItem('Cenoura', 'vegetais', 4.5, 45, true),
        ]);
        const L6 = list('list_demo_6', 'Padaria & Café', 'medium', [
          mkItem('Café Moído 500g', 'outros', 24.9, 7, true),
          mkItem('Pão Italiano', 'paes', 11.9, 13, true),
          mkItem('Croissant', 'paes', 9.5, 19, false),
        ]);
        // Older months to fill monthly view
        const L7 = list('list_demo_7', 'Estoque Mensal Antigo', 'low', [
          mkItem('Açúcar 5kg', 'outros', 22.0, 65, true),
          mkItem('Café Gourmet 1kg', 'outros', 79.9, 95, true),
          mkItem('Filé Mignon 1kg', 'carnes', 99.9, 125, true),
        ]);
        return [L1, L2, L3, L4, L5, L6, L7];
      };

      const shoppingListsRaw = seedIfEmpty(parsed?.shoppingLists || []);
      // Normalize legacy lists: ensure priority is valid and items is an array
      const validPriorities = new Set(['high', 'medium', 'low']);
      const shoppingLists = (shoppingListsRaw || []).map((l) => ({
        ...l,
        priority: validPriorities.has(l?.priority) ? l.priority : 'low',
        items: Array.isArray(l?.items) ? l.items : [],
      }));

      setData((prev) => ({
        ...prev,
        ...parsed,
        users,
        families,
        shoppingLists,
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

  // Reset demo data: clear storage and reload with seed
  const resetDemoData = async () => {
    try {
      setLoading(true);
      await AsyncStorage.removeItem('@SuperLista:data');
      await loadData();
    } catch (e) {
      console.error('Failed to reset demo data.', e);
    }
  };

  // UI preferences helpers
  const setTheme = async (theme) => {
    const next = { ...data, uiPrefs: { ...(data.uiPrefs || {}), theme } };
    await saveData(next);
    setData(next);
  };

  const toggleTheme = async () => {
    const current = (data.uiPrefs && data.uiPrefs.theme) || 'light';
    const nextTheme = current === 'dark' ? 'light' : 'dark';
    await setTheme(nextTheme);
  };

  const setTabBarPosition = async (pos) => {
    const next = { ...data, uiPrefs: { ...(data.uiPrefs || {}), tabBarPosition: pos } };
    await saveData(next);
    setData(next);
  };

  const toggleTabBarPosition = async () => {
    const current = (data.uiPrefs && data.uiPrefs.tabBarPosition) || 'bottom';
    const nextPos = current === 'bottom' ? 'top' : 'bottom';
    await setTabBarPosition(nextPos);
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

  // Item-level helpers for lists
  const addItemToList = (listId, item) => {
    const lists = (data.shoppingLists || []).map((l) => {
      if (String(l.id) !== String(listId)) return l;
      const items = Array.isArray(l.items) ? l.items.slice() : [];
      const nowIso = new Date().toISOString();
      const newItem = {
        id: item?.id || `item_${Date.now()}`,
        name: item?.name || 'Item',
        category: item?.category || 'outros',
        price: typeof item?.price === 'number' ? item.price : null,
        isPurchased: false,
        done: false,
        completed: false,
        checked: false,
        createdAt: nowIso,
        addedBy: data.currentUser?.id,
      };
      return { ...l, items: [newItem, ...items] };
    });
    updateLists(lists);
  };

  const updateItemInList = (listId, itemId, patch) => {
    const lists = (data.shoppingLists || []).map((l) => {
      if (String(l.id) !== String(listId)) return l;
      const items = (l.items || []).map((it) =>
        String(it.id) === String(itemId) ? { ...it, ...patch } : it,
      );
      return { ...l, items };
    });
    updateLists(lists);
  };

  const removeItemFromList = (listId, itemId) => {
    const lists = (data.shoppingLists || []).map((l) => {
      if (String(l.id) !== String(listId)) return l;
      const items = (l.items || []).filter((it) => String(it.id) !== String(itemId));
      return { ...l, items };
    });
    updateLists(lists);
  };

  const toggleItemCompleted = (listId, itemId) => {
    const lists = (data.shoppingLists || []).map((l) => {
      if (String(l.id) !== String(listId)) return l;
      const items = (l.items || []).map((it) => {
        if (String(it.id) !== String(itemId)) return it;
        const nextDone = !(it.isPurchased || it.done || it.completed || it.checked);
        return {
          ...it,
          isPurchased: nextDone,
          done: nextDone,
          completed: nextDone,
          checked: nextDone,
          purchasedAt: nextDone ? new Date().toISOString() : undefined,
        };
      });
      return { ...l, items };
    });
    updateLists(lists);
  };

  const clearCompletedInList = (listId) => {
    const lists = (data.shoppingLists || []).map((l) => {
      if (String(l.id) !== String(listId)) return l;
      const items = (l.items || []).filter(
        (it) => !(it.isPurchased || it.done || it.completed || it.checked),
      );
      return { ...l, items };
    });
    updateLists(lists);
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
  resetDemoData,
  // list item helpers
  addItemToList,
  updateItemInList,
  removeItemFromList,
  toggleItemCompleted,
  clearCompletedInList,
        // UI prefs
        uiPrefs: data.uiPrefs,
        setTheme,
        toggleTheme,
        setTabBarPosition,
        toggleTabBarPosition,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
