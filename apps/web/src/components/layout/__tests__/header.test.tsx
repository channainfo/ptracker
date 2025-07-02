import { render, screen } from '@testing-library/react';
import { Header } from '../header';

describe('Header', () => {
  it('renders logo/brand name', () => {
    render(<Header />);
    
    const logo = screen.getByRole('link', { name: /cryptotracker/i });
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('href', '/');
  });

  it('renders navigation links', () => {
    render(<Header />);
    
    expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/dashboard');
    expect(screen.getByRole('link', { name: /portfolio/i })).toHaveAttribute('href', '/portfolio');
    expect(screen.getByRole('link', { name: /learn/i })).toHaveAttribute('href', '/education');
  });

  it('renders sign in button', () => {
    render(<Header />);
    
    const signInButton = screen.getByRole('link', { name: /sign in/i });
    expect(signInButton).toBeInTheDocument();
    expect(signInButton).toHaveAttribute('href', '/login');
  });

  it('has proper dark mode styling', () => {
    render(<Header />);
    
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('bg-gray-900', 'border-b', 'border-gray-700');
  });

  it('has responsive navigation', () => {
    render(<Header />);
    
    const nav = screen.getByRole('navigation');
    const navLinks = nav.querySelector('.hidden.md\\:block');
    
    expect(navLinks).toBeInTheDocument();
  });
});