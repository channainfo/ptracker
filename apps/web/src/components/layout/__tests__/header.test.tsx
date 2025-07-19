import React from 'react';
import { render, screen } from '@testing-library/react';
import { Header } from '../header';
import { AuthProvider } from '../../providers/auth-provider';

describe('Header', () => {
  it('renders logo/brand name', () => {
    render(
      <AuthProvider>
        <Header />
      </AuthProvider>
    );
    
    const logo = screen.getByRole('link', { name: /ptracker/i });
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('href', '/');
  });

  it('renders navigation when wrapped with auth provider', () => {
    render(
      <AuthProvider>
        <Header />
      </AuthProvider>
    );
    
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
  });

  it('renders sign in button when not authenticated', () => {
    render(
      <AuthProvider>
        <Header />
      </AuthProvider>
    );
    
    const signInButton = screen.getByRole('link', { name: /sign in/i });
    expect(signInButton).toBeInTheDocument();
    expect(signInButton).toHaveAttribute('href', '/auth/login');
  });

  it('has proper styling', () => {
    render(
      <AuthProvider>
        <Header />
      </AuthProvider>
    );
    
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('bg-background/95');
  });

  it('has responsive navigation', () => {
    render(
      <AuthProvider>
        <Header />
      </AuthProvider>
    );
    
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
  });
});