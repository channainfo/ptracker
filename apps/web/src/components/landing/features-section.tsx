import { 
  ChartBarIcon, 
  AcademicCapIcon, 
  ShieldCheckIcon,
  CurrencyDollarIcon,
  BoltIcon,
  EyeIcon,
  BookOpenIcon,
  TrophyIcon,
  BellAlertIcon
} from '@heroicons/react/24/outline';

export function FeaturesSection() {
  const mainFeatures = [
    {
      name: 'Smart Portfolio Tracking',
      description: 'Monitor your crypto investments across multiple exchanges and wallets with real-time updates, profit/loss tracking, and detailed performance analytics.',
      icon: ChartBarIcon,
      gradient: 'from-blue-500 to-cyan-500',
      stats: '500+ Supported Coins'
    },
    {
      name: 'Learn & Earn Program',
      description: 'Master crypto fundamentals through our structured learning paths. From blockchain basics to advanced DeFi strategies - earn rewards as you learn.',
      icon: AcademicCapIcon,
      gradient: 'from-purple-500 to-pink-500',
      stats: '50+ Courses Available'
    },
    {
      name: 'AI-Powered Insights',
      description: 'Get intelligent market analysis, risk assessments, and personalized investment recommendations powered by advanced AI and machine learning.',
      icon: BoltIcon,
      gradient: 'from-green-500 to-emerald-500',
      stats: '95% Accuracy Rate'
    },
  ];

  const additionalFeatures = [
    {
      name: 'Bank-Level Security',
      description: 'Your data is protected with enterprise-grade encryption and multi-factor authentication.',
      icon: ShieldCheckIcon,
    },
    {
      name: 'Real-time Alerts',
      description: 'Get instant notifications for price movements, market news, and portfolio changes.',
      icon: BellAlertIcon,
    },
    {
      name: 'Tax Optimization',
      description: 'Automatically calculate crypto taxes and optimize your trading strategy for tax efficiency.',
      icon: CurrencyDollarIcon,
    },
    {
      name: 'Market Research',
      description: 'Access professional-grade market analysis, whale tracking, and on-chain data insights.',
      icon: EyeIcon,
    },
    {
      name: 'Educational Hub',
      description: 'Comprehensive library of articles, videos, and interactive tutorials for all skill levels.',
      icon: BookOpenIcon,
    },
    {
      name: 'Community Features',
      description: 'Connect with fellow investors, share strategies, and participate in trading competitions.',
      icon: TrophyIcon,
    },
  ];

  return (
    <section className="bg-gray-900 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-400">Powerful Features</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Everything you need to succeed in crypto
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            From beginners taking their first steps to experienced traders optimizing their strategies
          </p>
        </div>

        {/* Main Features */}
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
            {mainFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.name} className="group relative bg-gray-800 p-8 rounded-2xl border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity duration-300" 
                       style={{background: `linear-gradient(to right, var(--tw-gradient-from), var(--tw-gradient-to))`}} />
                  
                  <dt className="flex flex-col">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r ${feature.gradient} mb-4`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl font-semibold text-white">{feature.name}</span>
                      <span className="text-xs font-medium text-gray-400 bg-gray-700 px-2 py-1 rounded-full">
                        {feature.stats}
                      </span>
                    </div>
                  </dt>
                  <dd className="mt-4 text-base text-gray-300 leading-relaxed">
                    <p>{feature.description}</p>
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>

        {/* Additional Features Grid */}
        <div className="mx-auto mt-24 max-w-2xl sm:mt-32 lg:max-w-none">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-white mb-4">More Features You'll Love</h3>
            <p className="text-gray-400">Comprehensive tools designed for crypto investors at every level</p>
          </div>
          
          <dl className="grid max-w-xl grid-cols-1 gap-6 lg:max-w-none lg:grid-cols-2 xl:grid-cols-3">
            {additionalFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.name} className="group relative bg-gray-800/50 p-6 rounded-xl border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:bg-gray-800">
                  <dt className="flex items-center gap-x-3 text-base font-semibold text-white mb-3">
                    <div className="flex-shrink-0">
                      <Icon className="h-6 w-6 text-blue-400" />
                    </div>
                    {feature.name}
                  </dt>
                  <dd className="text-sm text-gray-300 leading-relaxed">
                    <p>{feature.description}</p>
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>

        {/* CTA Section */}
        <div className="mx-auto mt-16 max-w-2xl text-center">
          <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-8">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Start Your Crypto Journey?
            </h3>
            <p className="text-blue-100 mb-6">
              Join thousands of successful crypto investors who trust our platform
            </p>
            <div className="flex flex-row gap-3 sm:gap-4 justify-center">
              <button className="bg-white text-blue-600 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Start Free Trial
              </button>
              <button className="border border-white/30 text-white px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-lg font-semibold hover:bg-white/10 transition-colors">
                View Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}