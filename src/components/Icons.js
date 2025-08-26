import React from 'react';
import { Text } from 'react-native';

export const PlusIcon = ({ theme }) => (
    <Text style={{ color: theme ? '#FFFFFF' : 'white', fontSize: 24 }}>+</Text>
);

export const EditIcon = ({ theme }) => (
    <Text style={{ fontSize: 18, color: theme?.text || '#000' }}>✏️</Text>
);

export const CheckIcon = ({ theme }) => (
    <Text style={{ color: theme?.success || '#22c55e', fontSize: 18 }}>✔️</Text>
);

export const BackIcon = ({ theme }) => (
    <Text style={{ fontSize: 20, color: theme?.text || '#000' }}>⬅️</Text>
);