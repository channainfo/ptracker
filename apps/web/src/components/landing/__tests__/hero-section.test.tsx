import { render, screen } from '@testing-library/react';
import { HeroSection } from '../hero-section';

describe('HeroSection', () => {
  it('renders hero content', () => {
    render(<HeroSection />);
    
    expect(screen.getByText('Your Complete')).toBeInTheDocument();
    expect(screen.getByText('Crypto Hub')).toBeInTheDocument();
    expect(screen.getByText(/Professional-grade portfolio management, market analysis/)).toBeInTheDocument();
  });

  it('renders call-to-action buttons', () => {
    render(<HeroSection />);
    
    const startTrialButton = screen.getByRole('link', { name: /start free trial/i });
    const watchDemoButton = screen.getByRole('link', { name: /watch demo/i });
    
    expect(startTrialButton).toBeInTheDocument();
    expect(startTrialButton).toHaveAttribute('href', '/auth/register');
    
    expect(watchDemoButton).toBeInTheDocument();
    expect(watchDemoButton).toHaveAttribute('href', '/demo');
  });

  it('has proper styling classes', () => {
    render(<HeroSection />);
    
    const section = screen.getByText('Your Complete').closest('section');
    expect(section).toHaveClass('bg-gradient-to-br');
  });
});