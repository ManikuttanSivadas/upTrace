import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeType = 'light' | 'dark';

interface ThemeContextProps {
  theme: ThemeType;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<ThemeType>('light');

  useEffect(() => {
    (async () => {
      const storedTheme = await AsyncStorage.getItem('theme');
      if (storedTheme === 'dark' || storedTheme === 'light') {
        setTheme(storedTheme);
      }
    })();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    await AsyncStorage.setItem('theme', newTheme);
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
