import { render, screen } from '@testing-library/react';
import { FeaturesSection } from '../features-section';

describe('FeaturesSection', () => {
  it('renders section title', () => {
    render(<FeaturesSection />);
    
    expect(screen.getByText('Powerful Features')).toBeInTheDocument();
    expect(screen.getByText('Everything you need to succeed in crypto')).toBeInTheDocument();
  });

  it('renders all main feature cards', () => {
    render(<FeaturesSection />);
    
    expect(screen.getByText('Smart Portfolio Tracking')).toBeInTheDocument();
    expect(screen.getByText('Learn & Earn Program')).toBeInTheDocument();
    expect(screen.getByText('AI-Powered Insights')).toBeInTheDocument();
  });

  it('renders feature descriptions', () => {
    render(<FeaturesSection />);
    
    expect(screen.getByText(/Monitor your crypto investments across multiple exchanges/)).toBeInTheDocument();
    expect(screen.getByText(/Master crypto fundamentals through our structured learning/)).toBeInTheDocument();
    expect(screen.getByText(/Get intelligent market analysis, risk assessments/)).toBeInTheDocument();
  });

  it('renders feature stats', () => {
    render(<FeaturesSection />);
    
    expect(screen.getByText('500+ Supported Coins')).toBeInTheDocument();
    expect(screen.getByText('50+ Courses Available')).toBeInTheDocument();
    expect(screen.getByText('95% Accuracy Rate')).toBeInTheDocument();
  });

  it('renders additional features', () => {
    render(<FeaturesSection />);
    
    expect(screen.getByText('Bank-Level Security')).toBeInTheDocument();
    expect(screen.getByText('Real-time Alerts')).toBeInTheDocument();
    expect(screen.getByText('Educational Hub')).toBeInTheDocument();
  });

  it('has proper styling', () => {
    render(<FeaturesSection />);
    
    const section = screen.getByText('Powerful Features').closest('section');
    expect(section).toHaveClass('bg-background');
  });
});