import Link from 'next/link';
import { ChartBarIcon, AcademicCapIcon, ShieldCheckIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';

export function CTASection() {
  const benefits = [
    'Real-time portfolio tracking across 500+ cryptocurrencies',
    'AI-powered market insights and investment recommendations', 
    'Comprehensive crypto education from beginner to expert',
    'Advanced security with bank-level encryption',
    'Tax optimization and automated reporting',
    '24/7 customer support and community access'
  ];

  const plans = [
    {
      name: 'Free Starter',
      price: '$0',
      period: 'forever',
      description: 'Perfect for crypto beginners',
      features: [
        'Track up to 5 cryptocurrencies',
        'Basic portfolio analytics',
        'Access to educational content',
        'Community forum access'
      ],
      cta: 'Start Free',
      href: '/auth/register',
      popular: false
    },
    {
      name: 'Pro Investor',
      price: '$19',
      period: 'per month',
      description: 'For serious crypto investors',
      features: [
        'Unlimited cryptocurrency tracking',
        'Advanced AI insights & alerts',
        'Premium educational courses',
        'Tax optimization tools',
        'Priority customer support'
      ],
      cta: 'Start 7-Day Free Trial',
      href: '/auth/register?plan=pro',
      popular: true
    },
    {
      name: 'Expert Trader',
      price: '$49',
      period: 'per month',
      description: 'For professional traders',
      features: [
        'Everything in Pro Investor',
        'Advanced trading analytics',
        'Custom alerts & automation',
        'White-label reporting',
        'Dedicated account manager'
      ],
      cta: 'Start 7-Day Free Trial',
      href: '/auth/register?plan=expert',
      popular: false
    }
  ];

  return (
    <section className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Main CTA */}
        <div className="mx-auto max-w-4xl text-center mb-20">
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-6xl mb-6">
            Your Crypto Success 
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Starts Here
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-gray-300 mb-8">
            Join 50,000+ investors who've transformed their crypto journey with our platform. 
            Start learning, tracking, and profiting today.
          </p>
          
          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto mb-12">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3 text-left">
                <CheckIcon className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span className="text-gray-300">{benefit}</span>
              </div>
            ))}
          </div>
          
          {/* Quick Action Buttons */}
          <div className="flex flex-row gap-3 sm:gap-4 justify-center mb-8">
            <Link
              href="/auth/register"
              className="group relative inline-flex items-center justify-center px-4 sm:px-8 py-3 sm:py-4 text-sm sm:text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 hover:shadow-xl"
            >
              <RocketLaunchIcon className="h-5 w-5 mr-2" />
              Start Free Trial
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center justify-center px-4 sm:px-8 py-3 sm:py-4 text-sm sm:text-lg font-semibold text-white bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-200"
            >
              <ChartBarIcon className="h-5 w-5 mr-2" />
              View Live Demo
            </Link>
          </div>
          
          <p className="text-sm text-gray-400">
            ✓ No credit card required • ✓ Cancel anytime • ✓ 7-day money back guarantee
          </p>
        </div>

        {/* Pricing Plans */}
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">Choose Your Plan</h3>
            <p className="text-gray-400">Start free, upgrade when you're ready to unlock your full potential</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div key={index} className={`relative bg-gray-800 rounded-2xl border-2 p-8 ${
                plan.popular 
                  ? 'border-blue-500 bg-gradient-to-b from-blue-900/20 to-gray-800' 
                  : 'border-gray-700'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h4 className="text-xl font-semibold text-white mb-2">{plan.name}</h4>
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-gray-400">/{plan.period}</span>
                  </div>
                  <p className="text-gray-400 text-sm">{plan.description}</p>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <CheckIcon className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link
                  href={plan.href}
                  className={`block w-full text-center py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transform hover:scale-105'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="mx-auto mt-20 max-w-2xl text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Transform Your Crypto Journey?
            </h3>
            <p className="text-gray-300 mb-6">
              Don't let another opportunity pass by. Start building your crypto wealth today with the tools used by professional investors.
            </p>
            <div className="flex flex-row gap-3 sm:gap-4 justify-center">
              <Link
                href="/auth/register"
                className="bg-white text-gray-900 px-4 sm:px-8 py-2 sm:py-3 text-sm sm:text-base rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Start Your Free Trial
              </Link>
              <Link
                href="/auth/login"
                className="text-white hover:text-gray-300 transition-colors flex items-center justify-center"
              >
                Already have an account? Sign in →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}