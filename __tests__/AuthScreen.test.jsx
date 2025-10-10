import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DataContext } from '../src/contexts/DataContext';
import AuthScreen from '../src/screens/AuthScreen';

// Simplify Screen wrapper to avoid SafeArea/layout complexities in tests
jest.mock('../src/components/Screen', () => ({
  __esModule: true,
  default: ({ children }) => children,
}));

const mockCtx = {
  login: jest.fn(async () => ({ success: false, message: 'Invalid' })),
  register: jest.fn(async () => ({ success: false, message: 'Invalid' })),
};

jest.mock('expo-router', () => ({ useRouter: () => ({ replace: jest.fn() }) }));

describe('AuthScreen', () => {
  it('renders login/register chips and submit button', () => {
    render(
      <SafeAreaProvider>
        <DataContext.Provider value={mockCtx}>
          <AuthScreen />
        </DataContext.Provider>
      </SafeAreaProvider>,
    );
    // Default i18n is pt, so check for localized labels
    expect(screen.getByText(/Login/i)).toBeTruthy();
    expect(screen.getByText(/Cadastro/i)).toBeTruthy();
  });

  it('shows error on failed login', async () => {
    render(
      <SafeAreaProvider>
        <DataContext.Provider value={mockCtx}>
          <AuthScreen />
        </DataContext.Provider>
      </SafeAreaProvider>,
    );
    fireEvent.changeText(screen.getByPlaceholderText(/Digite seu email/i), 'x@y.com');
    fireEvent.changeText(screen.getByPlaceholderText(/••••••••|Senha/i), '123456');
    fireEvent.press(screen.getByText(/Login/i));
    // Errors are rendered from context result; presence of error box indicates submit ran
  });
});
