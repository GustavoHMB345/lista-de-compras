// src/data.js
// Mock data and helpers used by ListsScreen and ListDetailScreen

export const priorityColors = {
  high: { bg: '#FEE2E2', text: '#B91C1C', border: '#FCA5A5' },
  medium: { bg: '#DBEAFE', text: '#1E40AF', border: '#93C5FD' },
  low: { bg: '#DCFCE7', text: '#166534', border: '#86EFAC' },
};

export const getPriorityLabel = (p) => {
  switch (p) {
    case 'high':
      return 'Alta';
    case 'medium':
      return 'Média';
    case 'low':
    default:
      return 'Baixa';
  }
};

// Categories used across the app
export const categories = {
  frutas: { name: 'Frutas', emoji: '🍎', gradient: ['#FECACA', '#F87171'] },
  vegetais: { name: 'Vegetais', emoji: '🥦', gradient: ['#BBF7D0', '#86EFAC'] },
  carnes: { name: 'Carnes', emoji: '🍖', gradient: ['#FBCFE8', '#F472B6'] },
  laticinios: { name: 'Laticínios', emoji: '🧀', gradient: ['#FDE68A', '#F59E0B'] },
  paes: { name: 'Pães', emoji: '🥐', gradient: ['#FCD34D', '#F59E0B'] },
  bebidas: { name: 'Bebidas', emoji: '🥤', gradient: ['#BFDBFE', '#93C5FD'] },
  limpeza: { name: 'Limpeza', emoji: '🧼', gradient: ['#E5E7EB', '#D1D5DB'] },
  higiene: { name: 'Higiene', emoji: '🧴', gradient: ['#E9D5FF', '#C4B5FD'] },
  outros: { name: 'Outros', emoji: '🧺', gradient: ['#F3F4F6', '#E5E7EB'] },
};

// Mock lists for initial state
export const mockShoppingLists = [
  { id: 1, name: 'Compras da Semana', items: 12, completed: 5, priority: 'medium', date: '2025-01-15' },
  { id: 2, name: 'Churrasco Sábado', items: 8, completed: 2, priority: 'high', date: '2025-01-18' },
  { id: 3, name: 'Limpeza da Casa', items: 6, completed: 6, priority: 'low', date: '2025-01-10' },
];

// Utility to create some items for a given list
export const generateListItems = (list) => {
  // Simple pool to simulate items
  const pool = [
    { name: 'Maçã', category: 'frutas', price: 3.5 },
    { name: 'Banana', category: 'frutas', price: 4.2 },
    { name: 'Alface', category: 'vegetais', price: 2.3 },
    { name: 'Frango', category: 'carnes', price: 18.9 },
    { name: 'Leite', category: 'laticinios', price: 6.5 },
    { name: 'Pão', category: 'paes', price: 7.0 },
    { name: 'Refrigerante', category: 'bebidas', price: 8.9 },
    { name: 'Detergente', category: 'limpeza', price: 4.5 },
    { name: 'Sabonete', category: 'higiene', price: 3.2 },
    { name: 'Esponja', category: 'outros', price: 2.8 },
  ];

  const total = Math.max(list.items || 0, 6);
  const completedTarget = Math.min(list.completed || 0, total);

  const items = Array.from({ length: total }).map((_, idx) => {
    const base = pool[idx % pool.length];
    return {
      id: `${list.id}-${idx + 1}`,
      name: base.name + (idx > pool.length ? ` ${idx}` : ''),
      category: base.category,
      price: base.price,
      completed: idx < completedTarget,
      dateAdded: new Date(Date.now() - idx * 86400000).toISOString(),
      listId: list.id,
    };
  });

  return items;
};
