import React, { createContext, useContext, useState, useMemo } from 'react';

export const THEMES = {
  CLASSIC: 'classic',
  FUTURISTIC: 'futuristic',
};

const themeConfigClassic = {
  navbar: { bg: '#ffffff', border: '#e0e0e0' },
  sidebar: { text: '#333', active: '#f0f0f0', bg: '#fff', border: '#e0e0e0' },
  background: '#F2E0D6FF',
  card: '#ebe9d8',
  inputBg: '#e0cfc8',
  border: '#d1d5db',
  primary: '#1890ff',
  accent: '#faad14',
};

const themeConfigFuturistic = {
  navbar: { bg: 'transparent', border: 'rgba(99, 102, 241, 0.3)' },
  sidebar: { text: '#c7d7fe', active: '#6366f1', bg: '#0f0f18', border: 'rgba(99, 102, 241, 0.3)' },
  background: '#0f0f18',
  card: '#1a1a2e',
  inputBg: '#262636',
  border: 'rgba(99, 102, 241, 0.3)',
  primary: '#6366f1',
  accent: '#22d3ee',
};

const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(THEMES.CLASSIC);
  const isFuturistic = theme === THEMES.FUTURISTIC;
  const themeConfig = isFuturistic ? themeConfigFuturistic : themeConfigClassic;
  const toggleTheme = () => {
    setTheme((prev) => (prev === THEMES.CLASSIC ? THEMES.FUTURISTIC : THEMES.CLASSIC));
  };
  const value = useMemo(
    () => ({ theme, setTheme, isFuturistic, themeConfig, toggleTheme }),
    [theme, isFuturistic, themeConfig]
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeProvider;
export { useTheme };
