export function Header() {
  return (
    <header className="bg-gray-900 border-b border-gray-700">
      <nav className="mx-auto max-w-7xl px-6 lg:px-8" aria-label="Top">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <a href="/" className="text-xl font-bold text-blue-400">
              CryptoTracker
            </a>
          </div>
          <div className="hidden md:block">
            <div className="flex items-center space-x-6">
              <a href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                Dashboard
              </a>
              <a href="/portfolio" className="text-gray-300 hover:text-white transition-colors">
                Portfolio
              </a>
              <a href="/education" className="text-gray-300 hover:text-white transition-colors">
                Learn
              </a>
              <a
                href="/login"
                className="bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Sign in
              </a>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}