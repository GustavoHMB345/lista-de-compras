import { useCallback, useState } from 'react';

export function useAddItemForm(onAdd) {
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('1');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('all');

  const handleSubmit = useCallback(() => {
    const name = String(newItemName || '').trim();
    if (!name) return;
    onAdd?.({ name, qty: newItemQty, price: newItemPrice, category: newItemCategory });
    setNewItemName('');
    setNewItemQty('1');
    setNewItemPrice('');
    setNewItemCategory('all');
  }, [newItemName, newItemQty, newItemPrice, newItemCategory, onAdd]);

  return {
    newItemName,
    setNewItemName,
    newItemQty,
    setNewItemQty,
    newItemPrice,
    setNewItemPrice,
    newItemCategory,
    setNewItemCategory,
    handleSubmit,
  };
}
