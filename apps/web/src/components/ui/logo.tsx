'use client';

import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'icon-only' | 'text-only';
}

export function Logo({ className, size = 'md', variant = 'default' }: LogoProps) {
  const sizes = {
    sm: {
      icon: 'h-6 w-6',
      text: 'text-lg',
      container: 'gap-2'
    },
    md: {
      icon: 'h-8 w-8',
      text: 'text-xl',
      container: 'gap-2'
    },
    lg: {
      icon: 'h-10 w-10',
      text: 'text-2xl',
      container: 'gap-3'
    }
  };

  const IconComponent = () => (
    <div className={cn(
      'rounded-lg bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-lg',
      sizes[size].icon
    )}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="w-2/3 h-2/3 text-white"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Crypto symbol - stylized C with chart elements */}
        <path
          d="M12 2L13.09 8.26L22 9L13.09 15.74L12 22L10.91 15.74L2 9L10.91 8.26L12 2Z"
          fill="currentColor"
          opacity="0.8"
        />
        <path
          d="M8 12C8 9.79 9.79 8 12 8C14.21 8 16 9.79 16 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M8 16C8 13.79 9.79 12 12 12C14.21 12 16 13.79 16 16"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        />
      </svg>
    </div>
  );

  const TextComponent = () => (
    <div className="flex flex-col">
      <span className={cn(
        'font-bold text-foreground leading-none',
        sizes[size].text
      )}>
        PTracker
      </span>
      <span className="text-xs text-muted-foreground font-medium leading-none mt-0.5">
        Portfolio Tracker
      </span>
    </div>
  );

  if (variant === 'icon-only') {
    return (
      <div className={cn('flex items-center', className)}>
        <IconComponent />
      </div>
    );
  }

  if (variant === 'text-only') {
    return (
      <div className={cn('flex items-center', className)}>
        <TextComponent />
      </div>
    );
  }

  return (
    <div className={cn(
      'flex items-center',
      sizes[size].container,
      className
    )}>
      <IconComponent />
      <TextComponent />
    </div>
  );
}