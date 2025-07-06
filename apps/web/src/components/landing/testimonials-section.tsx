import { StarIcon } from '@heroicons/react/24/solid';

export function TestimonialsSection() {
  const testimonials = [
    {
      content: "As a complete crypto beginner, CryptoTracker's learning modules helped me understand blockchain fundamentals and make my first confident investment. The AI insights have guided me to a 34% portfolio gain in just 6 months!",
      author: "Sarah Chen",
      role: "Crypto Beginner → Confident Investor",
      avatar: "SC",
      rating: 5,
      gain: "+34%",
      timeframe: "6 months"
    },
    {
      content: "The DeFi education section is phenomenal! I went from zero knowledge to successfully yield farming across multiple protocols. The risk assessment tools helped me avoid several potential rug pulls.",
      author: "Mike Rodriguez",
      role: "DeFi Enthusiast",
      avatar: "MR",
      rating: 5,
      gain: "+127%",
      timeframe: "1 year"
    },
    {
      content: "The real-time alerts and technical analysis tools have revolutionized my trading strategy. I've improved my success rate from 60% to 85% since using CryptoTracker's AI recommendations.",
      author: "Alex Kim",
      role: "Day Trader",
      avatar: "AK",
      rating: 5,
      gain: "+89%",
      timeframe: "3 months"
    },
    {
      content: "The tax optimization features saved me thousands during tax season. The portfolio rebalancing suggestions have consistently outperformed my manual approach.",
      author: "Jessica Park",
      role: "Long-term Investor",
      avatar: "JP",
      rating: 5,
      gain: "+156%",
      timeframe: "2 years"
    },
    {
      content: "Started with $500 following CryptoTracker's beginner guide. The educational content and community support helped me grow my portfolio while learning about blockchain technology.",
      author: "David Thompson",
      role: "College Student",
      avatar: "DT",
      rating: 5,
      gain: "+67%",
      timeframe: "8 months"
    },
    {
      content: "The institutional-grade analytics rival what I used at my previous hedge fund job. CryptoTracker democratizes professional-level crypto analysis for retail investors.",
      author: "Linda Wang",
      role: "Former Hedge Fund Manager",
      avatar: "LW",
      rating: 5,
      gain: "+203%",
      timeframe: "18 months"
    }
  ];

  return (
    <section className="bg-gray-900 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-400">Success Stories</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Real Results from Real Investors
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            Join thousands of successful crypto investors who've transformed their portfolios with our platform
          </p>
        </div>
        
        {/* Stats Bar */}
        <div className="mx-auto mt-12 max-w-4xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <div className="text-3xl font-bold text-green-400">92%</div>
              <div className="text-sm text-gray-300">Average Success Rate</div>
            </div>
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <div className="text-3xl font-bold text-blue-400">$12.8M</div>
              <div className="text-sm text-gray-300">Total Profits Generated</div>
            </div>
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <div className="text-3xl font-bold text-purple-400">50K+</div>
              <div className="text-sm text-gray-300">Happy Investors</div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mx-0 lg:max-w-none">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="group relative bg-gray-800 p-8 rounded-2xl border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10">
                {/* Rating */}
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-yellow-400" />
                  ))}
                </div>
                
                {/* Content */}
                <blockquote className="text-gray-300 mb-6">
                  <p className="text-sm leading-relaxed">"{testimonial.content}"</p>
                </blockquote>
                
                {/* Performance Badge */}
                <div className="mb-6">
                  <div className="inline-flex items-center gap-2 bg-green-900/30 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                    <span className="text-lg">{testimonial.gain}</span>
                    <span>in {testimonial.timeframe}</span>
                  </div>
                </div>
                
                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.avatar}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-white">{testimonial.author}</div>
                    <div className="text-sm text-gray-400">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Social Proof */}
        <div className="mx-auto mt-16 max-w-2xl text-center">
          <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">
              Join the Success Stories
            </h3>
            <p className="text-gray-300 mb-6">
              Start your crypto journey with confidence. Our proven system has helped investors at every level achieve their financial goals.
            </p>
            <div className="flex flex-row gap-3 sm:gap-4 justify-center">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 sm:px-8 py-2 sm:py-3 text-sm sm:text-base rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105">
                Start Your Success Story
              </button>
              <button className="border border-gray-600 text-gray-300 px-4 sm:px-8 py-2 sm:py-3 text-sm sm:text-base rounded-lg font-semibold hover:bg-gray-700 transition-colors">
                Read More Stories
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}