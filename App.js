import SwipeNavigator from './src/components/SwipeNavigator';
import { DataProvider } from './src/contexts/DataContext';

export default function App() {
  return (
    <DataProvider>
      <SwipeNavigator />
    </DataProvider>
  );
}
