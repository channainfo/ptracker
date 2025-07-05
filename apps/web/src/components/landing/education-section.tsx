import { 
  AcademicCapIcon, 
  BookOpenIcon, 
  PlayIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  ArrowRightIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

export function EducationSection() {
  const learningPaths = [
    {
      title: 'Crypto Fundamentals',
      description: 'Perfect for complete beginners. Learn blockchain basics, wallet setup, and your first crypto purchase.',
      duration: '2-3 weeks',
      lessons: 12,
      icon: BookOpenIcon,
      level: 'Beginner',
      color: 'from-green-500 to-emerald-500',
      topics: ['What is Blockchain?', 'Setting up Wallets', 'Making Your First Purchase', 'Security Basics']
    },
    {
      title: 'Trading & Analysis',
      description: 'Master technical analysis, chart reading, and develop profitable trading strategies.',
      duration: '4-6 weeks',
      lessons: 24,
      icon: ChartBarIcon,
      level: 'Intermediate',
      color: 'from-blue-500 to-cyan-500',
      topics: ['Technical Analysis', 'Chart Patterns', 'Risk Management', 'Trading Psychology']
    },
    {
      title: 'DeFi & Advanced Strategies',
      description: 'Explore decentralized finance, yield farming, liquidity mining, and advanced investment strategies.',
      duration: '6-8 weeks',
      lessons: 36,
      icon: CurrencyDollarIcon,
      level: 'Advanced',
      color: 'from-purple-500 to-pink-500',
      topics: ['DeFi Protocols', 'Yield Farming', 'Liquidity Mining', 'Smart Contracts']
    }
  ];

  const features = [
    {
      icon: PlayIcon,
      title: 'Interactive Video Lessons',
      description: 'Learn with engaging video content and hands-on exercises'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Risk Management Focus',
      description: 'Every lesson emphasizes security and responsible investing'
    },
    {
      icon: AcademicCapIcon,
      title: 'Certified Completion',
      description: 'Earn certificates to showcase your crypto knowledge'
    }
  ];

  return (
    <section className="bg-gray-800 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-400">Crypto Education</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Learn Crypto the Right Way
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            From complete beginner to crypto expert. Our structured learning paths ensure you build knowledge safely and confidently.
          </p>
        </div>

        {/* Learning Paths */}
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mx-0 lg:max-w-none">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {learningPaths.map((path, index) => {
              const Icon = path.icon;
              return (
                <div key={index} className="group relative bg-gray-900 p-8 rounded-2xl border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10">
                  {/* Level Badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${ 
                      path.level === 'Beginner' ? 'bg-green-900/30 text-green-400' :
                      path.level === 'Intermediate' ? 'bg-blue-900/30 text-blue-400' :
                      'bg-purple-900/30 text-purple-400'
                    }`}>
                      {path.level}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r ${path.color} mb-6`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-white mb-3">{path.title}</h3>
                  <p className="text-gray-300 mb-6 text-sm leading-relaxed">{path.description}</p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-6 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <span>{path.lessons} lessons</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>{path.duration}</span>
                    </div>
                  </div>

                  {/* Topics */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-white mb-3">What you'll learn:</h4>
                    <ul className="space-y-2">
                      {path.topics.map((topic, topicIndex) => (
                        <li key={topicIndex} className="flex items-center gap-2 text-sm text-gray-300">
                          <CheckIcon className="h-4 w-4 text-green-400 flex-shrink-0" />
                          {topic}
                        </li>
                      ))}\n                    </ul>
                  </div>

                  {/* CTA */}
                  <button className="group w-full bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 border border-gray-600 hover:border-gray-500 flex items-center justify-center gap-2">
                    <span>Start Learning</span>
                    <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Features */}
        <div className="mx-auto mt-24 max-w-2xl sm:mt-32 lg:max-w-none">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-white mb-4">Why Our Education Program Works</h3>
            <p className="text-gray-400">Designed by crypto experts, built for real-world success</p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-900/30 mb-6">
                    <Icon className="h-8 w-8 text-blue-400" />
                  </div>
                  <h4 className="text-xl font-semibold text-white mb-3">{feature.title}</h4>
                  <p className="text-gray-300">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mx-auto mt-16 max-w-2xl text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-2xl">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Become a Crypto Expert?
            </h3>
            <p className="text-blue-100 mb-6">
              Join 50,000+ students who've successfully completed our courses
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Start Free Course
              </button>
              <button className="border border-white/30 text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
                View Curriculum
              </button>
            </div>
            <div className="mt-4 text-sm text-blue-200">
              ✨ First course is completely free • No credit card required
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}