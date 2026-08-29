import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  // Read initial theme from localStorage. Default strictly to 'light' as requested.
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('sih_compliance_theme');
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
    return 'light'; // Always default to light mode on first run
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('sih_compliance_theme', theme);
  }, [theme]);

  const toggleTheme = (newTheme) => {
    if (newTheme === 'light' || newTheme === 'dark') {
      setTheme(newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
