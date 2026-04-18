import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

export const THEMES = {
  CLASSIC: 'classic',
  FUTURISTIC: 'futuristic',
};

export const THEME_CONFIG = {
  [THEMES.CLASSIC]: {
    name: 'Classic Legal',
    description: 'Traditional professional appearance',
    sidebar: {
      bg: '#001529',
      text: '#ffffff',
      hover: '#1890ff',
      active: '#1890ff',
      border: 'transparent',
    },
    navbar: {
      bg: '#ffffff',
      text: '#102a43',
      border: '#e0e0e0',
    },
    body: {
      bg: '#f0f4f8',
      text: '#1a1a1a',
    },
    card: {
      bg: '#ffffff',
      border: '#e0e0e0',
      shadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    },
    accent: '#1890ff',
    accentHover: '#096dd9',
    success: '#22a85a',
    warning: '#ffb300',
    danger: '#cf1322',
    gradient: {
      primary: 'linear-gradient(135deg, #102a43 0%, #243b53 100%)',
      surface: 'linear-gradient(106.5deg, #f8fafc 0%, #f1f5f9 100%)',
    },
    borderRadius: '0.75rem',
    input: {
      bg: '#ffffff',
      border: '#d9e2ec',
      focus: '#1890ff',
      text: '#1a1a1a',
    },
    table: {
      headerBg: '#f0f4f8',
      rowBg: '#ffffff',
      rowHover: '#f0f4f8',
    },
    scrollbar: {
      track: '#f1f1f1',
      thumb: '#829ab1',
      thumbHover: '#486581',
    },
  },
  [THEMES.FUTURISTIC]: {
    name: 'Futuristic Legal',
    description: 'Modern dark interface with premium aesthetics',
    sidebar: {
      bg: '#0a0a0f',
      text: '#f8fafc',
      hover: '#6366f1',
      active: '#6366f1',
      border: '#2a2a3a',
    },
    navbar: {
      bg: '#12121a',
      text: '#f8fafc',
      border: '#2a2a3a',
    },
    body: {
      bg: '#0a0a0f',
      text: '#f8fafc',
    },
    card: {
      bg: '#1a1a24',
      border: '#2a2a3a',
      shadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
    },
    accent: '#6366f1',
    accentHover: '#8b5cf6',
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
    gradient: {
      primary: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      surface: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    },
    borderRadius: '0.75rem',
    input: {
      bg: '#12121a',
      border: '#2a2a3a',
      focus: '#6366f1',
      text: '#f8fafc',
    },
    table: {
      headerBg: '#12121a',
      rowBg: '#1a1a24',
      rowHover: '#22222e',
    },
    scrollbar: {
      track: '#12121a',
      thumb: '#4b5563',
      thumbHover: '#6366f1',
    },
  },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('app-theme');
    return saved && Object.values(THEMES).includes(saved) ? saved : THEMES.CLASSIC;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('app-theme', theme);
      document.documentElement.setAttribute('data-theme', theme);

      const config = THEME_CONFIG[theme];
      document.documentElement.style.setProperty('--sidebar-bg', config.sidebar.bg);
      document.documentElement.style.setProperty('--sidebar-text', config.sidebar.text);
      document.documentElement.style.setProperty('--navbar-bg', config.navbar.bg);
      document.documentElement.style.setProperty('--body-bg', config.body.bg);
      document.documentElement.style.setProperty('--card-bg', config.card.bg);
      document.documentElement.style.setProperty('--accent-color', config.accent);
      document.documentElement.style.setProperty('--scrollbar-track', config.scrollbar.track);
      document.documentElement.style.setProperty('--scrollbar-thumb', config.scrollbar.thumb);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === THEMES.CLASSIC ? THEMES.FUTURISTIC : THEMES.CLASSIC));
  };

  const value = useMemo(
    () => ({
      theme,
      themeConfig: THEME_CONFIG[theme],
      toggleTheme,
      setTheme,
      isFuturistic: theme === THEMES.FUTURISTIC,
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
