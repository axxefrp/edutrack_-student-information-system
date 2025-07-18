import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  systemTheme: 'light' | 'dark';
}

interface UseThemeReturn extends ThemeState {
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = 'edutrack-theme';
const THEME_ATTRIBUTE = 'data-theme';

/**
 * Custom hook for managing theme state with system preference detection,
 * localStorage persistence, and smooth transitions
 */
export const useTheme = (): UseThemeReturn => {
  // Get system theme preference
  const getSystemTheme = useCallback((): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, []);

  // Get stored theme preference
  const getStoredTheme = useCallback((): Theme => {
    if (typeof window === 'undefined') return 'system';
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && ['light', 'dark', 'system'].includes(stored)) {
        return stored as Theme;
      }
    } catch (error) {
      console.warn('Failed to read theme from localStorage:', error);
    }
    return 'system';
  }, []);

  // Initialize state
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(getSystemTheme);
  const [theme, setThemeState] = useState<Theme>(getStoredTheme);
  
  // Calculate resolved theme
  const resolvedTheme = theme === 'system' ? systemTheme : theme;

  // Apply theme to document
  const applyTheme = useCallback((newResolvedTheme: 'light' | 'dark') => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    const body = document.body;

    // Add transition class for smooth theme switching
    body.classList.add('theme-transitioning');

    // Update theme attribute
    root.setAttribute(THEME_ATTRIBUTE, newResolvedTheme);

    // Update Tailwind dark mode class
    if (newResolvedTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Remove transition class after animation completes
    setTimeout(() => {
      body.classList.remove('theme-transitioning');
    }, 200);
  }, []);

  // Set theme with persistence
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    
    // Persist to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }

    // Apply theme immediately
    const newResolvedTheme = newTheme === 'system' ? systemTheme : newTheme;
    applyTheme(newResolvedTheme);
  }, [systemTheme, applyTheme]);

  // Toggle between light and dark (skipping system)
  const toggleTheme = useCallback(() => {
    const newTheme = resolvedTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }, [resolvedTheme, setTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      const newSystemTheme = e.matches ? 'dark' : 'light';
      setSystemTheme(newSystemTheme);
      
      // If user is using system theme, apply the change
      if (theme === 'system') {
        applyTheme(newSystemTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, applyTheme]);

  // Apply theme on mount and when resolved theme changes
  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme, applyTheme]);

  // Initialize theme on first load
  useEffect(() => {
    const initialTheme = getStoredTheme();
    const initialSystemTheme = getSystemTheme();
    
    setThemeState(initialTheme);
    setSystemTheme(initialSystemTheme);
    
    const initialResolvedTheme = initialTheme === 'system' ? initialSystemTheme : initialTheme;
    applyTheme(initialResolvedTheme);
  }, [getStoredTheme, getSystemTheme, applyTheme]);

  return {
    theme,
    resolvedTheme,
    systemTheme,
    setTheme,
    toggleTheme,
  };
};

/**
 * Theme context for providing theme state throughout the app
 */
interface ThemeContextType extends UseThemeReturn {}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const themeState = useTheme();

  return (
    <ThemeContext.Provider value={themeState}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

/**
 * Utility function to get theme-aware class names
 */
export const getThemeClasses = (lightClass: string, darkClass: string): string => {
  return `${lightClass} dark:${darkClass}`;
};

/**
 * Utility function to check if dark mode is active
 */
export const isDarkMode = (): boolean => {
  if (typeof document === 'undefined') return false;
  return document.documentElement.getAttribute(THEME_ATTRIBUTE) === 'dark';
};

/**
 * Utility function for theme-aware conditional rendering
 */
export const useIsDarkMode = (): boolean => {
  const { resolvedTheme } = useThemeContext();
  return resolvedTheme === 'dark';
};
