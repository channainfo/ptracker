export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gray-900 py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Smart Crypto Portfolio
            <span className="text-blue-400"> Management</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            Track, analyze, and optimize your crypto investments with real-time market data, 
            sentiment analysis, and educational resources.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="/dashboard"
              className="bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Get started
            </a>
            <a href="/about" className="text-sm font-medium text-gray-300 hover:text-white">
              Learn more <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}