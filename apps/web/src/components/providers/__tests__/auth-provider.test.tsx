import { render, screen, renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../auth-provider';

describe('AuthProvider', () => {
  const TestComponent = () => {
    const { user, loading, login, logout } = useAuth();
    
    return (
      <div>
        <div data-testid="user">{user ? 'logged-in' : 'logged-out'}</div>
        <div data-testid="loading">{loading ? 'loading' : 'ready'}</div>
        <button onClick={() => login({ email: 'test@example.com' })}>Login</button>
        <button onClick={logout}>Logout</button>
      </div>
    );
  };

  it('provides initial auth state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('user')).toHaveTextContent('logged-out');
    expect(screen.getByTestId('loading')).toHaveTextContent('ready');
  });

  it('provides login and logout functions', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });

  it('throws error when useAuth is used outside provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');
    
    consoleError.mockRestore();
  });

  it('updates loading state on initialization', async () => {
    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Initially should not be loading after mount
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(getByTestId('loading')).toHaveTextContent('ready');
  });
});