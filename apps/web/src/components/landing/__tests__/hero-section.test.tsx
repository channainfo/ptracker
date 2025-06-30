import { render, screen } from '@testing-library/react';
import { HeroSection } from '../hero-section';

describe('HeroSection', () => {
  it('renders hero content', () => {
    render(<HeroSection />);
    
    expect(screen.getByText('Smart Crypto Portfolio')).toBeInTheDocument();
    expect(screen.getByText('Management')).toBeInTheDocument();
    expect(screen.getByText(/Track, analyze, and optimize your crypto investments/)).toBeInTheDocument();
  });

  it('renders call-to-action buttons', () => {
    render(<HeroSection />);
    
    const getStartedButton = screen.getByRole('link', { name: /get started/i });
    const learnMoreButton = screen.getByRole('link', { name: /learn more/i });
    
    expect(getStartedButton).toBeInTheDocument();
    expect(getStartedButton).toHaveAttribute('href', '/dashboard');
    
    expect(learnMoreButton).toBeInTheDocument();
    expect(learnMoreButton).toHaveAttribute('href', '/about');
  });

  it('has proper styling classes', () => {
    render(<HeroSection />);
    
    const section = screen.getByText('Smart Crypto Portfolio').closest('section');
    expect(section).toHaveClass('bg-gray-900');
  });
});