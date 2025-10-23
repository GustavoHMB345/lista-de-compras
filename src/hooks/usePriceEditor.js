import { useCallback, useState } from 'react';

export function usePriceEditor(onSave) {
  const [editingPriceId, setEditingPriceId] = useState(null);
  const [editingPriceText, setEditingPriceText] = useState('');

  const startEditPrice = useCallback((id, price) => {
    setEditingPriceId(id);
    setEditingPriceText(price ? String(price) : '');
  }, []);

  const saveEditPrice = useCallback(() => {
    if (!editingPriceId) return;
    const id = editingPriceId;
    const text = editingPriceText;
    setEditingPriceId(null);
    setEditingPriceText('');
    onSave?.(id, text);
  }, [editingPriceId, editingPriceText, onSave]);

  return {
    editingPriceId,
    editingPriceText,
    setEditingPriceText,
    startEditPrice,
    saveEditPrice,
  };
}
