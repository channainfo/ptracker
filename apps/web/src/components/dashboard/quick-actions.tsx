'use client';

import { useState } from 'react';
import { 
  PlusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  BellIcon
} from '@heroicons/react/24/outline';
// import { Button } from '@/components/ui/button';

export function QuickActions() {
  const [showDropdown, setShowDropdown] = useState(false);

  const actions = [
    {
      id: 'add-portfolio',
      label: 'New Portfolio',
      description: 'Create a new portfolio',
      icon: PlusIcon,
      color: 'blue',
      action: () => console.log('Create portfolio')
    },
    {
      id: 'buy',
      label: 'Buy Asset',
      description: 'Add a buy transaction',
      icon: ArrowUpIcon,
      color: 'green',
      action: () => console.log('Buy asset')
    },
    {
      id: 'sell',
      label: 'Sell Asset',
      description: 'Add a sell transaction',
      icon: ArrowDownIcon,
      color: 'red',
      action: () => console.log('Sell asset')
    },
    {
      id: 'analyze',
      label: 'Portfolio Analysis',
      description: 'View detailed analytics',
      icon: ChartBarIcon,
      color: 'purple',
      action: () => console.log('View analytics')
    }
  ];

  const quickButtons = [
    {
      icon: Cog6ToothIcon,
      label: 'Settings',
      action: () => console.log('Settings')
    },
    {
      icon: BellIcon,
      label: 'Alerts',
      action: () => console.log('Alerts')
    }
  ];

  return (
    <div className="flex items-center space-x-3">
      {/* Quick Buttons */}
      <div className="hidden sm:flex items-center space-x-2">
        {quickButtons.map((button) => {
          const Icon = button.icon;
          return (
            <button
              key={button.label}
              onClick={button.action}
              className="btn-outline btn-sm p-2"
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
      </div>

      {/* Main Actions Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="btn-primary"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Quick Actions
        </button>

        {showDropdown && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowDropdown(false)}
            />
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-64 bg-background border border-border rounded-lg shadow-lg z-20">
              <div className="p-2">
                <div className="text-xs font-medium text-muted-foreground px-3 py-2 border-b border-border">
                  Quick Actions
                </div>
                <div className="mt-2 space-y-1">
                  {actions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.id}
                        onClick={() => {
                          action.action();
                          setShowDropdown(false);
                        }}
                        className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-accent rounded-md transition-colors"
                      >
                        <div className={`p-2 rounded-md ${
                          action.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
                          action.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                          action.color === 'red' ? 'bg-red-100 dark:bg-red-900/30' :
                          action.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30' :
                          'bg-gray-100 dark:bg-gray-800'
                        }`}>
                          <Icon className={`h-4 w-4 ${
                            action.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                            action.color === 'green' ? 'text-green-600 dark:text-green-400' :
                            action.color === 'red' ? 'text-red-600 dark:text-red-400' :
                            action.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                            'text-gray-600 dark:text-gray-400'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {action.label}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {action.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}