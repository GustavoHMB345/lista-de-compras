import SwipeNavigator from './src/components/SwipeNavigator';
import { ThemeProvider } from './src/components/theme';
import { DataProvider } from './src/contexts/DataContext';

export default function App() {
  return (
    <ThemeProvider initialOverride="light">
      <DataProvider>
        <SwipeNavigator />
      </DataProvider>
    </ThemeProvider>
  );
}
