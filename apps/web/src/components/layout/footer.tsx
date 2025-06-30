export function Footer() {
  return (
    <footer className="bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center space-x-6 md:order-2">
          <a href="/about" className="text-gray-400 hover:text-gray-300">
            About
          </a>
          <a href="/contact" className="text-gray-400 hover:text-gray-300">
            Contact
          </a>
          <a href="/privacy" className="text-gray-400 hover:text-gray-300">
            Privacy
          </a>
          <a href="/terms" className="text-gray-400 hover:text-gray-300">
            Terms
          </a>
        </div>
        <div className="mt-8 md:order-1 md:mt-0">
          <p className="text-center text-xs leading-5 text-gray-400">
            &copy; 2025 CryptoTracker. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}