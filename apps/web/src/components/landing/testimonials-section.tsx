export function TestimonialsSection() {
  const testimonials = [
    {
      content: "CryptoTracker has completely transformed how I manage my crypto portfolio. The real-time insights are invaluable.",
      author: "Sarah Chen",
      role: "Crypto Investor"
    },
    {
      content: "The educational resources helped me understand DeFi protocols and make better investment decisions.",
      author: "Mike Rodriguez",
      role: "DeFi Enthusiast"
    },
    {
      content: "Clean interface, powerful features. Everything I need to track my crypto investments in one place.",
      author: "Alex Kim",
      role: "Day Trader"
    }
  ];

  return (
    <section className="bg-gray-800 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-lg font-medium leading-8 tracking-tight text-blue-400">Testimonials</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Trusted by crypto enthusiasts
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mx-0 lg:max-w-none">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-700 p-8">
                <blockquote className="text-gray-300">
                  <p>"{testimonial.content}"</p>
                </blockquote>
                <div className="mt-6">
                  <div className="font-medium text-white">{testimonial.author}</div>
                  <div className="text-gray-400">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}