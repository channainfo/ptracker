'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  error?: string;
  labelClassName?: string;
  containerClassName?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      label,
      description,
      error,
      labelClassName,
      containerClassName,
      variant = 'default',
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const checkboxId = id || React.useId();

    const variantStyles = {
      default: 'checkbox',
      success: 'checkbox border-green-500 data-[state=checked]:bg-green-500',
      warning: 'checkbox border-yellow-500 data-[state=checked]:bg-yellow-500',
      error: 'checkbox border-red-500 data-[state=checked]:bg-red-500',
    };

    return (
      <div className={cn('flex items-start space-x-3', containerClassName)}>
        <div className="relative">
          <input
            type="checkbox"
            ref={ref}
            id={checkboxId}
            className={cn(
              variantStyles[variant],
              error && 'border-destructive',
              disabled && 'opacity-50 cursor-not-allowed',
              className
            )}
            disabled={disabled}
            {...props}
          />
          
          {/* Custom checkmark for better visibility */}
          {props.checked && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <svg
                className="w-3 h-3 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>

        {(label || description) && (
          <div className="flex-1">
            {label && (
              <label
                htmlFor={checkboxId}
                className={cn(
                  'text-sm font-medium text-foreground cursor-pointer select-none',
                  disabled && 'opacity-50 cursor-not-allowed',
                  labelClassName
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p className={cn(
                'text-xs text-muted-foreground mt-1',
                disabled && 'opacity-50'
              )}>
                {description}
              </p>
            )}
            {error && (
              <p className="text-xs text-destructive mt-1">{error}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };