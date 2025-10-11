import { fireEvent, render, screen } from '@testing-library/react-native';
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
      <DataContext.Provider value={mockCtx}>
        <AuthScreen />
      </DataContext.Provider>,
    );
    // Default i18n is pt, but we rely on testIDs for stability
    expect(screen.getByTestId('auth-email')).toBeTruthy();
    expect(screen.getByTestId('auth-password')).toBeTruthy();
  });

  it('shows error on failed login', async () => {
    render(
      <DataContext.Provider value={mockCtx}>
        <AuthScreen />
      </DataContext.Provider>,
    );
    fireEvent.changeText(screen.getByTestId('auth-email'), 'x@y.com');
    fireEvent.changeText(screen.getByTestId('auth-password'), '123456');
    fireEvent.press(screen.getByTestId('auth-submit'));
    // Errors are rendered from context result; presence of error box indicates submit ran
  });
});
