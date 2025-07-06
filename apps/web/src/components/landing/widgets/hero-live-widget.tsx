'use client';

import { useState, useEffect } from 'react';
import { NewsStreamWidget } from './news-stream-widget';
import { MarketSentimentWidget } from './market-sentiment-widget';
import { 
  NewspaperIcon, 
  ChartBarIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

interface Tab {
  id: 'news' | 'sentiment';
  label: string;
  icon: any;
  component: React.ComponentType;
}

const tabs: Tab[] = [
  {
    id: 'news',
    label: 'Live News',
    icon: NewspaperIcon,
    component: NewsStreamWidget
  },
  {
    id: 'sentiment',
    label: 'Market Sentiment',
    icon: ChartBarIcon,
    component: MarketSentimentWidget
  }
];

export function HeroLiveWidget() {
  const [activeTab, setActiveTab] = useState<'news' | 'sentiment'>('news');
  const [autoRotate, setAutoRotate] = useState(true);

  // Auto-rotate between tabs every 10 seconds
  useEffect(() => {
    if (!autoRotate) return;

    const interval = setInterval(() => {
      setActiveTab(current => current === 'news' ? 'sentiment' : 'news');
    }, 10000);

    return () => clearInterval(interval);
  }, [autoRotate]);

  const handleTabChange = (tabId: 'news' | 'sentiment') => {
    setActiveTab(tabId);
    setAutoRotate(false); // Stop auto-rotation when user manually switches
    
    // Resume auto-rotation after 30 seconds of inactivity
    setTimeout(() => setAutoRotate(true), 30000);
  };

  const goToPrevious = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    const previousIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
    handleTabChange(tabs[previousIndex].id);
  };

  const goToNext = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    const nextIndex = currentIndex === tabs.length - 1 ? 0 : currentIndex + 1;
    handleTabChange(tabs[nextIndex].id);
  };

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || NewsStreamWidget;

  return (
    <div className="relative bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-2xl overflow-hidden">
      {/* Header with Navigation */}
      <div className="relative border-b border-white/10 bg-white/5">
        <div className="flex items-center justify-between p-4">
          {/* Tab Indicators */}
          <div className="flex items-center space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`
                    relative flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-white/10 text-white shadow-sm' 
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center space-x-1">
            <button
              onClick={goToPrevious}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Previous"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <button
              onClick={goToNext}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Next"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
          <div 
            className="h-full bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 ease-linear"
            style={{
              width: autoRotate ? '100%' : '0%',
              animation: autoRotate ? 'progress 10s linear infinite' : 'none'
            }}
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="relative h-[400px] sm:h-[480px] overflow-hidden">
        <div 
          className="transition-all duration-500 ease-in-out h-full"
          key={activeTab}
        >
          <ActiveComponent />
        </div>
      </div>

      {/* Page Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`
              w-2 h-2 rounded-full transition-all duration-200
              ${activeTab === tab.id 
                ? 'bg-white shadow-lg scale-110' 
                : 'bg-white/30 hover:bg-white/50'
              }
            `}
            aria-label={`Go to ${tab.label}`}
          />
        ))}
      </div>

      {/* Auto-rotate indicator */}
      {autoRotate && (
        <div className="absolute top-4 right-4 flex items-center space-x-1 text-xs text-gray-400">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          <span className="hidden sm:inline">Auto</span>
        </div>
      )}
    </div>
  );
}

