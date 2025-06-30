export function CTASection() {
  return (
    <section className="bg-blue-600">
      <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Start tracking your crypto portfolio today
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-blue-100">
            Join thousands of crypto investors who trust CryptoTracker to manage their portfolios.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="/signup"
              className="bg-white px-6 py-3 text-sm font-medium text-blue-600 hover:bg-gray-100 transition-colors"
            >
              Get started for free
            </a>
            <a href="/contact" className="text-sm font-medium text-white hover:text-blue-100">
              Contact us <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}