export function FeaturesSection() {
  const features = [
    {
      name: 'Real-time Portfolio Tracking',
      description: 'Monitor your crypto investments with live price updates and performance metrics.',
      icon: '📊',
    },
    {
      name: 'Market Sentiment Analysis',
      description: 'Get insights into market trends with AI-powered sentiment analysis.',
      icon: '🧠',
    },
    {
      name: 'Educational Resources',
      description: 'Learn about cryptocurrency and trading with our comprehensive guides.',
      icon: '📚',
    },
  ];

  return (
    <section className="bg-gray-800 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-medium leading-7 text-blue-400">Features</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Everything you need to track crypto
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="bg-gray-700 p-8">
                <dt className="flex items-center gap-x-3 text-base font-medium text-white">
                  <span className="text-2xl">{feature.icon}</span>
                  {feature.name}
                </dt>
                <dd className="mt-4 text-base text-gray-300">
                  <p>{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}