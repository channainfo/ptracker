'use client';

import { useState } from 'react';
import { NewsStreamWidget } from './widgets/news-stream-widget';
import { MarketSentimentWidget } from './widgets/market-sentiment-widget';
import { 
  EyeIcon, 
  PlayIcon,
  SparklesIcon,
  ArrowRightIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';

export function WidgetsShowcaseSection() {
  const [activeDemo, setActiveDemo] = useState<'news' | 'sentiment'>('news');
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  const features = [
    {
      icon: SparklesIcon,
      title: 'Real-time Updates',
      description: 'Live data streams updated every second'
    },
    {
      icon: EyeIcon,
      title: 'Smart Analysis',
      description: 'AI-powered insights and sentiment analysis'
    },
    {
      icon: DevicePhoneMobileIcon,
      title: 'Mobile Optimized',
      description: 'Perfect experience on all devices'
    }
  ];

  return (
    <section className="bg-gray-800 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-400">Live Demo</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            See Our Platform in Action
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            Experience the power of real-time crypto intelligence with our interactive widgets
          </p>
        </div>

        {/* Demo Controls */}
        <div className="mx-auto mt-12 max-w-md">
          <div className="flex items-center justify-center space-x-1 bg-gray-900 p-1 rounded-lg">
            <button
              onClick={() => setActiveDemo('news')}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeDemo === 'news' 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <span>📰</span>
              <span>News Stream</span>
            </button>
            <button
              onClick={() => setActiveDemo('sentiment')}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeDemo === 'sentiment' 
                  ? 'bg-purple-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <span>📊</span>
              <span>Market Sentiment</span>
            </button>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="mx-auto mt-6 max-w-xs">
          <div className="flex items-center justify-center space-x-1 bg-gray-900 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('desktop')}
              className={`flex items-center space-x-2 px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                viewMode === 'desktop' 
                  ? 'bg-gray-700 text-white' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <ComputerDesktopIcon className="h-3 w-3" />
              <span>Desktop</span>
            </button>
            <button
              onClick={() => setViewMode('mobile')}
              className={`flex items-center space-x-2 px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                viewMode === 'mobile' 
                  ? 'bg-gray-700 text-white' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <DevicePhoneMobileIcon className="h-3 w-3" />
              <span>Mobile</span>
            </button>
          </div>
        </div>

        {/* Widget Demo Container */}
        <div className="mx-auto mt-16 max-w-6xl">
          <div className="relative">
            {/* Browser/Phone Frame */}
            <div className={`relative mx-auto transition-all duration-500 ${
              viewMode === 'mobile' 
                ? 'max-w-sm' 
                : 'max-w-4xl'
            }`}>
              {/* Frame Header */}
              <div className="bg-gray-700 rounded-t-xl p-3">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="h-3 w-3 bg-red-500 rounded-full" />
                    <div className="h-3 w-3 bg-yellow-500 rounded-full" />
                    <div className="h-3 w-3 bg-green-500 rounded-full" />
                  </div>
                  <div className="flex-1 bg-gray-600 rounded px-3 py-1 text-xs text-gray-300 text-center">
                    cryptotracker.com/dashboard
                  </div>
                </div>
              </div>
              
              {/* Widget Container */}
              <div className={`bg-gray-900 p-6 rounded-b-xl transition-all duration-500 ${
                viewMode === 'mobile' ? 'min-h-[500px]' : 'min-h-[600px]'
              }`}>
                <div className={`transition-all duration-500 ${
                  viewMode === 'mobile' ? 'space-y-4' : 'grid grid-cols-1 gap-6'
                }`}>
                  {activeDemo === 'news' ? (
                    <div className="animate-fade-in">
                      <NewsStreamWidget />
                    </div>
                  ) : (
                    <div className="animate-fade-in">
                      <MarketSentimentWidget />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Floating Features */}
            <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 hidden xl:block">
              <div className="space-y-4">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div 
                      key={feature.title}
                      className="bg-gray-800 p-4 rounded-lg border border-gray-700 max-w-xs animate-slide-up"
                      style={{ animationDelay: `${index * 200}ms` }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg flex-shrink-0">
                          <Icon className="h-4 w-4 text-blue-400" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-white">{feature.title}</h4>
                          <p className="text-xs text-gray-400 mt-1">{feature.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Features Grid - Mobile Fallback */}
        <div className="xl:hidden mt-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-lg mb-4">
                    <Icon className="h-6 w-6 text-blue-400" />
                  </div>
                  <h4 className="text-sm font-medium text-white mb-2">{feature.title}</h4>
                  <p className="text-xs text-gray-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mx-auto mt-16 max-w-2xl text-center">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl p-8 border border-blue-500/30">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Access Professional-Grade Tools?
            </h3>
            <p className="text-gray-300 mb-6">
              Join thousands of investors using our real-time analytics and insights
            </p>
            <div className="flex flex-row gap-3 sm:gap-4 justify-center">
              <button className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                <PlayIcon className="h-4 w-4 mr-2" />
                Try Interactive Demo
              </button>
              <button className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base border border-gray-600 text-gray-300 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
                <span>Start Free Trial</span>
                <ArrowRightIcon className="h-4 w-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}