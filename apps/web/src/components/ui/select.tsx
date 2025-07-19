"use client";

import * as React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  className?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <div className="relative">
        <select
          className={`
            w-full px-3 py-2 
            bg-white dark:bg-gray-800 
            border border-gray-300 dark:border-gray-600 
            rounded-lg 
            text-sm 
            text-gray-900 dark:text-gray-100
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
            appearance-none
            cursor-pointer
            disabled:cursor-not-allowed disabled:opacity-50
            ${className}
          `}
          ref={ref}
          {...props}
        />
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-gray-500" />
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };

export interface SelectOptionProps extends React.OptionHTMLAttributes<HTMLOptionElement> {}

export const SelectOption = React.forwardRef<HTMLOptionElement, SelectOptionProps>(
  (props, ref) => {
    return <option ref={ref} {...props} />;
  }
);

SelectOption.displayName = 'SelectOption';