export function StatsSection() {
  const stats = [
    { name: 'Active Users', value: '10,000+', color: 'text-green-400' },
    { name: 'Crypto Assets Tracked', value: '500+', color: 'text-blue-400' },
    { name: 'Total Portfolio Value', value: '$50M+', color: 'text-yellow-400' },
    { name: 'Market Updates Daily', value: '1M+', color: 'text-purple-400' },
  ];

  return (
    <section className="bg-gray-900 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <dl className="grid grid-cols-1 gap-8 text-center lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-gray-800 p-8">
              <dt className="text-base text-gray-400">{stat.name}</dt>
              <dd className={`mt-2 text-3xl font-bold ${stat.color} sm:text-4xl`}>
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}