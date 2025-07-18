import React, { useState } from 'react';
import { useThemeContext, Theme } from '../../hooks/useTheme';

// Theme icons
const SunIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636a9 9 0 1 0 12.728 0L16.773 7.227A9 9 0 1 1 12 21a9 9 0 0 1-9-9Z" />
  </svg>
);

const MoonIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
  </svg>
);

const ComputerIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25Z" />
  </svg>
);

interface ThemeOption {
  value: Theme;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const themeOptions: ThemeOption[] = [
  {
    value: 'light',
    label: 'Light',
    icon: <SunIcon />,
    description: 'Light theme'
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: <MoonIcon />,
    description: 'Dark theme'
  },
  {
    value: 'system',
    label: 'System',
    icon: <ComputerIcon />,
    description: 'Follow system preference'
  }
];

interface ThemeToggleProps {
  variant?: 'button' | 'dropdown' | 'switch';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'button',
  size = 'md',
  showLabel = false,
  className = ''
}) => {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useThemeContext();
  const [isOpen, setIsOpen] = useState(false);

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3'
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const currentTheme = themeOptions.find(option => option.value === theme);
  const currentIcon = resolvedTheme === 'dark' ? <MoonIcon className={iconSizeClasses[size]} /> : <SunIcon className={iconSizeClasses[size]} />;

  if (variant === 'switch') {
    return (
      <button
        onClick={toggleTheme}
        className={`
          relative inline-flex items-center justify-center
          ${sizeClasses[size]}
          rounded-lg
          bg-gray-100 hover:bg-gray-200
          dark:bg-gray-800 dark:hover:bg-gray-700
          text-gray-700 dark:text-gray-300
          transition-all duration-200 ease-in-out
          focus:outline-none focus:shadow-focus
          ${className}
        `}
        title={`Switch to ${resolvedTheme === 'light' ? 'dark' : 'light'} mode`}
        aria-label={`Switch to ${resolvedTheme === 'light' ? 'dark' : 'light'} mode`}
      >
        <div className="relative">
          <div className={`transition-all duration-300 ${resolvedTheme === 'dark' ? 'rotate-180 opacity-0' : 'rotate-0 opacity-100'} absolute inset-0`}>
            <SunIcon className={iconSizeClasses[size]} />
          </div>
          <div className={`transition-all duration-300 ${resolvedTheme === 'dark' ? 'rotate-0 opacity-100' : '-rotate-180 opacity-0'}`}>
            <MoonIcon className={iconSizeClasses[size]} />
          </div>
        </div>
        {showLabel && (
          <span className="ml-2 text-sm font-medium">
            {resolvedTheme === 'light' ? 'Light' : 'Dark'}
          </span>
        )}
      </button>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            inline-flex items-center justify-center
            ${sizeClasses[size]}
            rounded-lg
            bg-gray-100 hover:bg-gray-200
            dark:bg-gray-800 dark:hover:bg-gray-700
            text-gray-700 dark:text-gray-300
            transition-all duration-200 ease-in-out
            focus:outline-none focus:shadow-focus
            ${className}
          `}
          title={`Current theme: ${currentTheme?.label}`}
          aria-label="Theme selector"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          {currentIcon}
          {showLabel && (
            <span className="ml-2 text-sm font-medium">
              {currentTheme?.label}
            </span>
          )}
          <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown menu */}
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
              <div className="py-1">
                {themeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setTheme(option.value);
                      setIsOpen(false);
                    }}
                    className={`
                      w-full flex items-center px-4 py-2 text-sm
                      ${theme === option.value 
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }
                      transition-colors duration-150
                    `}
                  >
                    <span className="mr-3">{option.icon}</span>
                    <div className="flex-1 text-left">
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {option.description}
                      </div>
                    </div>
                    {theme === option.value && (
                      <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Default button variant
  return (
    <button
      onClick={toggleTheme}
      className={`
        inline-flex items-center justify-center
        ${sizeClasses[size]}
        rounded-lg
        bg-gray-100 hover:bg-gray-200
        dark:bg-gray-800 dark:hover:bg-gray-700
        text-gray-700 dark:text-gray-300
        transition-all duration-200 ease-in-out
        focus:outline-none focus:shadow-focus
        ${className}
      `}
      title={`Switch to ${resolvedTheme === 'light' ? 'dark' : 'light'} mode`}
      aria-label={`Switch to ${resolvedTheme === 'light' ? 'dark' : 'light'} mode`}
    >
      {currentIcon}
      {showLabel && (
        <span className="ml-2 text-sm font-medium">
          {resolvedTheme === 'light' ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
};

// Compact theme toggle for headers/toolbars
export const CompactThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  return <ThemeToggle variant="switch" size="sm" className={className} />;
};

// Full theme selector for settings pages
export const ThemeSelector: React.FC<{ className?: string }> = ({ className = '' }) => {
  return <ThemeToggle variant="dropdown" size="md" showLabel className={className} />;
};

export default ThemeToggle;
