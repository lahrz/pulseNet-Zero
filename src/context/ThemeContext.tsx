import React, { createContext, useContext, useState, useEffect } from 'react';

export type UITheme = 'neon' | 'amber' | 'emerald' | 'obsidian' | 'cleanroom';

interface ThemeContextType {
  theme: UITheme;
  setTheme: (theme: UITheme) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (val: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'neon',
  setTheme: () => {},
  isSidebarCollapsed: false,
  setIsSidebarCollapsed: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<UITheme>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem('pnz_ui_theme') as UITheme;
      if (saved && ['neon', 'amber', 'emerald', 'obsidian', 'cleanroom'].includes(saved)) {
        return saved === 'cleanroom' ? 'emerald' : saved === 'obsidian' ? 'neon' : saved;
      }
    }
    return 'neon';
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  const setTheme = (newTheme: UITheme) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('pnz_ui_theme', newTheme);
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isSidebarCollapsed, setIsSidebarCollapsed }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useUITheme = () => useContext(ThemeContext);
