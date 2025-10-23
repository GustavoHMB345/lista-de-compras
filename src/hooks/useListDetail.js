import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Share } from 'react-native';
import { DataContext } from '../contexts/DataContext';

export function useListDetail(listId) {
  const router = useRouter();
  const { shoppingLists = [], updateLists, currentUser, families = [], loading, users = [] } =
    useContext(DataContext) || {};

  const list = useMemo(() => shoppingLists.find((l) => l.id === listId), [shoppingLists, listId]);
  const family = useMemo(
    () => families.find((f) => f.id === currentUser?.familyId),
    [families, currentUser?.familyId],
  );
  const familyMembers = useMemo(() => {
    const memberIds = Array.isArray(family?.members) ? family.members : [];
    return memberIds.map((id) => (users || []).find((u) => u.id === id)).filter(Boolean);
  }, [family?.members, users]);

  // Snackbar undo support
  const [recentlyDeleted, setRecentlyDeleted] = useState(null); // {item,listId,timeoutId}
  const undoTimer = useRef(null);

  const stats = useMemo(() => {
    const arr = list?.items || [];
    let total = 0;
    let purchasedCount = 0;
    for (const it of arr) {
      const price = Number(it.price) || 0;
      const qty = parseInt(it.quantity) || 1;
      if (it.isPurchased) purchasedCount += 1;
      total += price * qty;
    }
    return { total, purchasedCount, totalCount: arr.length };
  }, [list?.items]);

  // Savings vs last snapshot
  const savingsMap = useMemo(() => {
    const map = {};
    (list?.items || []).forEach((it) => {
      const snapshots = [];
      if (Array.isArray(it.priceHistory))
        it.priceHistory.forEach((ph) => snapshots.push({ ts: ph.ts, price: Number(ph.price) }));
      snapshots.sort((a, b) => new Date(a.ts) - new Date(b.ts));
      const last = snapshots[snapshots.length - 1];
      const current = Number(it.price) || 0;
      if (last && current > 0) {
        const diff = last.price - current;
        if (Math.abs(diff) > 0.009) {
          const pct = last.price !== 0 ? (diff / last.price) * 100 : 0;
          map[it.id] = { diff, last: last.price, pct };
        }
      }
    });
    return map;
  }, [list?.items]);

  const handleShare = useCallback(() => {
    Share.share({ message: `Lista: ${list?.name} (Total R$ ${stats.total.toFixed(2)})` });
  }, [list?.name, stats.total]);

  const saveEditHeader = useCallback(
    (name, desc) => {
      if (!list) return;
      const updatedLists = shoppingLists.map((l) => (l.id === list.id ? { ...l, name: name || l.name, desc } : l));
      updateLists?.(updatedLists);
    },
    [list, shoppingLists, updateLists],
  );

  const markAllPurchased = useCallback(() => {
    if (!list) return;
    const now = new Date().toISOString();
    const updatedLists = shoppingLists.map((l) =>
      l.id === list.id
        ? {
            ...l,
            items: (l.items || []).map((it) => ({ ...it, isPurchased: true, purchasedAt: now })),
          }
        : l,
    );
    updateLists?.(updatedLists);
  }, [list, shoppingLists, updateLists]);

  const clearCompleted = useCallback(() => {
    if (!list) return;
    const updatedLists = shoppingLists.map((l) =>
      l.id === list.id ? { ...l, items: (l.items || []).filter((it) => !it.isPurchased) } : l,
    );
    updateLists?.(updatedLists);
  }, [list, shoppingLists, updateLists]);

  const addItem = useCallback(
    ({ name, qty, price, category }) => {
      if (!list || !name) return;
      const priceNum = Number(price) || 0;
      const now = new Date().toISOString();
      const newIt = {
        id: `item_${Date.now()}`,
        name: name.trim(),
        quantity: qty || '1',
        price: priceNum,
        category: category === 'all' ? 'outros' : category,
        isPurchased: false,
        createdAt: now,
        priceHistory:
          priceNum > 0
            ? [
                { id: `ph_${Date.now()}`, ts: now, price: priceNum, quantity: parseInt(qty) || 1 },
              ]
            : [],
      };
      const updatedLists = shoppingLists.map((l) => (l.id === list.id ? { ...l, items: [...(l.items || []), newIt] } : l));
      updateLists?.(updatedLists);
    },
    [list, shoppingLists, updateLists],
  );

  const saveItemPrice = useCallback(
    (id, newPriceText) => {
      if (!list) return;
      const newPrice = Number(newPriceText) || 0;
      const now = new Date().toISOString();
      const updatedLists = shoppingLists.map((l) =>
        l.id === list.id
          ? {
              ...l,
              items: (l.items || []).map((it) => {
                if (it.id !== id) return it;
                const current = Number(it.price) || 0;
                if (current !== newPrice && newPrice > 0) {
                  const historyArr = Array.isArray(it.priceHistory) ? it.priceHistory : [];
                  return {
                    ...it,
                    price: newPrice,
                    priceHistory: [
                      ...historyArr,
                      { id: `ph_${Date.now()}`, ts: now, price: newPrice, quantity: parseInt(it.quantity) || 1 },
                    ],
                  };
                }
                return { ...it, price: newPrice };
              }),
            }
          : l,
      );
      updateLists?.(updatedLists);
    },
    [list, shoppingLists, updateLists],
  );

  const incQty = useCallback(
    (id) => {
      if (!list) return;
      updateLists?.(
        shoppingLists.map((l) =>
          l.id === list.id
            ? {
                ...l,
                items: (l.items || []).map((it) =>
                  it.id === id ? { ...it, quantity: String((parseInt(it.quantity) || 1) + 1) } : it,
                ),
              }
            : l,
        ),
      );
    },
    [list, shoppingLists, updateLists],
  );

  const decQty = useCallback(
    (id) => {
      if (!list) return;
      updateLists?.(
        shoppingLists.map((l) =>
          l.id === list.id
            ? {
                ...l,
                items: (l.items || []).map((it) =>
                  it.id === id ? { ...it, quantity: String(Math.max(1, (parseInt(it.quantity) || 1) - 1)) } : it,
                ),
              }
            : l,
        ),
      );
    },
    [list, shoppingLists, updateLists],
  );

  const togglePurchased = useCallback(
    (id) => {
      if (!list) return;
      const now = new Date().toISOString();
      updateLists?.(
        shoppingLists.map((l) =>
          l.id === list.id
            ? {
                ...l,
                items: (l.items || []).map((it) =>
                  it.id === id
                    ? { ...it, isPurchased: !it.isPurchased, purchasedAt: !it.isPurchased ? now : it.purchasedAt }
                    : it,
                ),
              }
            : l,
        ),
      );
    },
    [list, shoppingLists, updateLists],
  );

  const deleteItem = useCallback(
    (id) => {
      if (!list) return;
      const target = (list.items || []).find((it) => it.id === id);
      if (!target) return;
      const updated = shoppingLists.map((l) => (l.id === list.id ? { ...l, items: (l.items || []).filter((it) => it.id !== id) } : l));
      updateLists?.(updated);
      if (undoTimer.current) clearTimeout(undoTimer.current);
      const timeoutId = setTimeout(() => {
        setRecentlyDeleted(null);
        undoTimer.current = null;
      }, 6000);
      undoTimer.current = timeoutId;
      setRecentlyDeleted({ item: target, listId: list.id, timeoutId });
    },
    [list, shoppingLists, updateLists],
  );

  const undoDelete = useCallback(() => {
    if (!recentlyDeleted) return;
    const { item, listId, timeoutId } = recentlyDeleted;
    if (timeoutId) clearTimeout(timeoutId);
    updateLists?.(
      shoppingLists.map((l) =>
        l.id === listId ? { ...l, items: [...(l.items || []), item].sort((a, b) => a.name.localeCompare(b.name)) } : l,
      ),
    );
    setRecentlyDeleted(null);
  }, [recentlyDeleted, shoppingLists, updateLists]);

  const handleMemberToggle = useCallback(
    (memberId) => {
      if (!list) return;
      const isOn = Array.isArray(list.members) && list.members.includes(memberId);
      const updated = shoppingLists.map((l) =>
        l.id === list.id ? { ...l, members: isOn ? l.members.filter((i) => i !== memberId) : [...(l.members || []), memberId] } : l,
      );
      updateLists?.(updated);
    },
    [list, shoppingLists, updateLists],
  );

  const handleArchiveList = useCallback(() => {
    if (!list) return;
    const now = new Date().toISOString();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateLists?.(
      shoppingLists.map((l) =>
        l.id === list.id
          ? { ...l, items: (l.items || []).map((it) => ({ ...it, isPurchased: true, purchasedAt: it.purchasedAt || now })) }
          : l,
      ),
    );
    router.replace('/lists');
  }, [list, shoppingLists, updateLists, router]);

  const deleteList = useCallback(() => {
    if (!list) return;
    updateLists?.(shoppingLists.filter((l) => l.id !== list.id));
    router.push('/lists');
  }, [list, shoppingLists, updateLists, router]);

  return {
    list,
    loading,
    familyMembers,
    stats,
    savingsMap,
    recentlyDeleted,
    undoDelete,
    currentUser,
    shoppingLists,
    updateLists,
    actions: {
      handleShare,
      saveEditHeader,
      markAllPurchased,
      clearCompleted,
      addItem,
      saveItemPrice,
      incQty,
      decQty,
      togglePurchased,
      deleteItem,
      handleMemberToggle,
      handleArchiveList,
      deleteList,
    },
  };
}
