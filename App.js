import React from 'react';
import MainNavigator from './src/navigation/MainNavigator';
import { DataProvider } from './src/contexts/DataContext';

export default function App() {
  return (
    <DataProvider>
      <MainNavigator />
    </DataProvider>
  );
}
