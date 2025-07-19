import React, { useEffect, useState } from 'react';

interface DarkModeToggleProps {
  className?: string;
}

const DarkModeToggle: React.FC<DarkModeToggleProps> = ({ className = '' }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check if dark mode is already enabled
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDark;
    setIsDark(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  };

  // Initialize dark mode from localStorage on component mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else if (savedDarkMode === 'false') {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else {
      // Default to system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
        setIsDark(true);
      }
    }
  }, []);

  return (
    <button
      onClick={toggleDarkMode}
      className={`
        flex items-center justify-center w-12 h-6 rounded-full transition-all duration-300 
        ${isDark 
          ? 'bg-blue-600 dark:bg-blue-500' 
          : 'bg-gray-300 dark:bg-gray-600'
        } 
        ${className}
      `}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div
        className={`
          w-5 h-5 rounded-full transition-all duration-300 flex items-center justify-center text-xs
          ${isDark 
            ? 'transform translate-x-3 bg-white text-blue-600' 
            : 'transform -translate-x-3 bg-white text-gray-600'
          }
        `}
      >
        {isDark ? '🌙' : '☀️'}
      </div>
    </button>
  );
};

export default DarkModeToggle;
