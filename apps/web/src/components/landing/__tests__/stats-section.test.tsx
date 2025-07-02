import { render, screen } from '@testing-library/react';
import { StatsSection } from '../stats-section';

describe('StatsSection', () => {
  it('renders all stats', () => {
    render(<StatsSection />);
    
    expect(screen.getByText('Active Users')).toBeInTheDocument();
    expect(screen.getByText('10,000+')).toBeInTheDocument();
    
    expect(screen.getByText('Crypto Assets Tracked')).toBeInTheDocument();
    expect(screen.getByText('500+')).toBeInTheDocument();
    
    expect(screen.getByText('Total Portfolio Value')).toBeInTheDocument();
    expect(screen.getByText('$50M+')).toBeInTheDocument();
    
    expect(screen.getByText('Market Updates Daily')).toBeInTheDocument();
    expect(screen.getByText('1M+')).toBeInTheDocument();
  });

  it('applies correct color classes to stat values', () => {
    render(<StatsSection />);
    
    const activeUsersValue = screen.getByText('10,000+');
    const assetsValue = screen.getByText('500+');
    const portfolioValue = screen.getByText('$50M+');
    const updatesValue = screen.getByText('1M+');
    
    expect(activeUsersValue).toHaveClass('text-green-400');
    expect(assetsValue).toHaveClass('text-blue-400');
    expect(portfolioValue).toHaveClass('text-yellow-400');
    expect(updatesValue).toHaveClass('text-purple-400');
  });

  it('has proper dark mode styling', () => {
    render(<StatsSection />);
    
    const section = screen.getByText('Active Users').closest('section');
    expect(section).toHaveClass('bg-gray-900');
  });
});