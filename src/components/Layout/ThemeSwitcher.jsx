import React from 'react';

import { useTheme, THEMES } from '../../contexts/ThemeContext';
import { SunOutlined, ExperimentOutlined } from '@ant-design/icons';

const ThemeSwitcher = ({ compact = false }) => {
  const { theme, toggleTheme } = useTheme();

  if (compact) {
    return (
      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg transition-all duration-300 hover:bg-neutral-100 dark:hover:bg-cyber-surface group"
        title={`Switch to ${theme === THEMES.CLASSIC ? 'Futuristic' : 'Classic'} theme`}
      >
        {theme === THEMES.CLASSIC ? (
          <ExperimentOutlined className="text-lg text-white group-hover:text-aurora-primary transition-colors" />
        ) : (
          <SunOutlined className="text-lg text-aurora-primary group-hover:text-aurora-muted transition-colors" />
        )}
      </button>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-3 p-1 rounded-xl bg-neutral-100 dark:bg-cyber-surface">
        <button
          onClick={() => theme !== THEMES.CLASSIC && toggleTheme()}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
            theme === THEMES.CLASSIC
              ? 'bg-white dark:bg-cyber-card text-primary-900 dark:text-aurora-text shadow-sm'
              : 'text-neutral-600 dark:text-aurora-muted hover:text-neutral-900 dark:hover:text-aurora-text'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full ${theme === THEMES.CLASSIC ? '' : 'opacity-50'} bg-gradient-to-br from-primary-800 to-primary-600`}
          />
          <span className="hidden sm:inline">Classic</span>
        </button>
        <button
          onClick={() => theme !== THEMES.FUTURISTIC && toggleTheme()}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
            theme === THEMES.FUTURISTIC
              ? 'bg-cyber-card text-aurora-primary shadow-lg shadow-aurora-primary/20'
              : 'text-neutral-600 dark:text-aurora-muted hover:text-neutral-900 dark:hover:text-aurora-text'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full ${theme === THEMES.FUTURISTIC ? '' : 'opacity-50'} bg-gradient-to-br from-aurora-primary to-aurora-secondary`}
          />
          <span className="hidden sm:inline">Futuristic</span>
        </button>
      </div>
    </div>
  );
};

export default ThemeSwitcher;
