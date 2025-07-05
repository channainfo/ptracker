import { TrendingUpIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';

export function StatsSection() {
  const stats = [
    { name: 'Active Crypto Investors', value: '50,000+', color: 'text-green-400', change: '+12%', changeType: 'positive' },
    { name: 'Cryptocurrencies Tracked', value: '500+', color: 'text-blue-400', change: '+25', changeType: 'positive' },
    { name: 'Total Portfolio Value', value: '$2.1B+', color: 'text-yellow-400', change: '+18%', changeType: 'positive' },
    { name: 'Daily Market Updates', value: '1.2M+', color: 'text-purple-400', change: '+8%', changeType: 'positive' },
  ];

  const marketData = [
    { symbol: 'BTC', name: 'Bitcoin', price: '$43,250', change: '+2.45%', changeType: 'positive' },
    { symbol: 'ETH', name: 'Ethereum', price: '$2,580', change: '+1.82%', changeType: 'positive' },
    { symbol: 'ADA', name: 'Cardano', price: '$0.48', change: '-0.95%', changeType: 'negative' },
    { symbol: 'SOL', name: 'Solana', price: '$98.50', change: '+3.21%', changeType: 'positive' },
  ];

  return (
    <section className="bg-gray-800 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Platform Stats */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Trusted by the Crypto Community</h2>
            <p className="text-gray-400">Join thousands of successful investors already using our platform</p>
          </div>
          
          <dl className="grid grid-cols-1 gap-6 text-center lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.name} className="bg-gray-900 p-8 rounded-2xl border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
                <dt className="text-sm font-medium text-gray-400 mb-2">{stat.name}</dt>
                <dd className={`text-4xl font-bold ${stat.color} mb-2`}>
                  {stat.value}
                </dd>
                <div className="flex items-center justify-center gap-1 text-sm">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-400" />
                  <span className="text-green-400">{stat.change} this month</span>
                </div>
              </div>
            ))}
          </dl>
        </div>

        {/* Live Market Data Preview */}
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-700">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">Live Market Data</h3>
            <p className="text-gray-400">Real-time prices updated every second</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {marketData.map((crypto) => (
              <div key={crypto.symbol} className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-gray-600 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {crypto.symbol.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{crypto.symbol}</div>
                      <div className="text-xs text-gray-400">{crypto.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-white">{crypto.price}</div>
                    <div className={`text-sm flex items-center gap-1 ${
                      crypto.changeType === 'positive' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {crypto.changeType === 'positive' ? (
                        <ArrowTrendingUpIcon className="h-3 w-3" />
                      ) : (
                        <ArrowTrendingDownIcon className="h-3 w-3" />
                      )}
                      {crypto.change}
                    </div>
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      crypto.changeType === 'positive' ? 'bg-green-400' : 'bg-red-400'
                    }`}
                    style={{ width: `${Math.abs(parseFloat(crypto.change)) * 20}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              View All 500+ Cryptocurrencies
            </button>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-60">
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-2">Security</div>
              <div className="text-white font-semibold">Bank-Level Encryption</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-2">Uptime</div>
              <div className="text-white font-semibold">99.9% Availability</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-2">Response Time</div>
              <div className="text-white font-semibold">&lt;100ms Average</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-2">Support</div>
              <div className="text-white font-semibold">24/7 Live Chat</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}