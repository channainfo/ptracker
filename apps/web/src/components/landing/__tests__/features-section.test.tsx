import { render, screen } from '@testing-library/react';
import { FeaturesSection } from '../features-section';

describe('FeaturesSection', () => {
  it('renders section title', () => {
    render(<FeaturesSection />);
    
    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getByText('Everything you need to track crypto')).toBeInTheDocument();
  });

  it('renders all feature cards', () => {
    render(<FeaturesSection />);
    
    expect(screen.getByText('Real-time Portfolio Tracking')).toBeInTheDocument();
    expect(screen.getByText('Market Sentiment Analysis')).toBeInTheDocument();
    expect(screen.getByText('Educational Resources')).toBeInTheDocument();
  });

  it('renders feature descriptions', () => {
    render(<FeaturesSection />);
    
    expect(screen.getByText(/Monitor your crypto investments with live price updates/)).toBeInTheDocument();
    expect(screen.getByText(/Get insights into market trends with AI-powered sentiment/)).toBeInTheDocument();
    expect(screen.getByText(/Learn about cryptocurrency and trading with our comprehensive/)).toBeInTheDocument();
  });

  it('renders feature icons', () => {
    render(<FeaturesSection />);
    
    expect(screen.getByText('📊')).toBeInTheDocument();
    expect(screen.getByText('🧠')).toBeInTheDocument();
    expect(screen.getByText('📚')).toBeInTheDocument();
  });

  it('has proper dark mode styling', () => {
    render(<FeaturesSection />);
    
    const section = screen.getByText('Features').closest('section');
    expect(section).toHaveClass('bg-gray-800');
  });
});