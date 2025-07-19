import { render, screen } from '@testing-library/react';
import { StatsSection } from '../stats-section';

describe('StatsSection', () => {
  it('renders all stats', () => {
    render(<StatsSection />);
    
    expect(screen.getByText('Active Crypto Investors')).toBeInTheDocument();
    expect(screen.getByText('50,000+')).toBeInTheDocument();
    
    expect(screen.getByText('Cryptocurrencies Tracked')).toBeInTheDocument();
    expect(screen.getByText('500+')).toBeInTheDocument();
    
    expect(screen.getByText('Total Portfolio Value')).toBeInTheDocument();
    expect(screen.getByText('$2.1B+')).toBeInTheDocument();
    
    expect(screen.getByText('Daily Market Updates')).toBeInTheDocument();
    expect(screen.getByText('1.2M+')).toBeInTheDocument();
  });

  it('applies correct color classes to stat values', () => {
    render(<StatsSection />);
    
    const activeUsersValue = screen.getByText('50,000+');
    const assetsValue = screen.getByText('500+');
    const portfolioValue = screen.getByText('$2.1B+');
    const updatesValue = screen.getByText('1.2M+');
    
    expect(activeUsersValue).toHaveClass('text-green-400');
    expect(assetsValue).toHaveClass('text-blue-400');
    expect(portfolioValue).toHaveClass('text-yellow-400');
    expect(updatesValue).toHaveClass('text-purple-400');
  });

  it('has proper styling', () => {
    render(<StatsSection />);
    
    const section = screen.getByText('Active Crypto Investors').closest('section');
    expect(section).toHaveClass('bg-muted/20');
  });
});