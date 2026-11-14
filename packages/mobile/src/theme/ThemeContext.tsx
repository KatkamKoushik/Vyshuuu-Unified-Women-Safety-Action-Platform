import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSecuritySetting, setSecuritySetting } from '../services/storageService';

export type ThemeType = 'white' | 'black' | 'navy' | 'grey';

export interface ThemeColors {
  name: ThemeType;
  label: string;
  isDark: boolean;
  bg: string;
  card: string;
  surface: string;
  surfaceHover: string;
  border: string;
  borderLight: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryLight: string;
  accent: string;
  danger: string;
  dangerLight: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
}

export const THEMES: Record<ThemeType, ThemeColors> = {
  white: {
    name: 'white',
    label: 'White (Light)',
    isDark: false,
    bg: '#FFFFFF',
    card: '#F8FAFC',
    surface: '#F1F5F9',
    surfaceHover: '#E2E8F0',
    border: '#E2E8F0',
    borderLight: '#CBD5E1',
    text: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#64748B',
    primary: '#0284C7',
    primaryLight: '#E0F2FE',
    accent: '#0369A1',
    danger: '#DC2626',
    dangerLight: '#FEE2E2',
    success: '#16A34A',
    successLight: '#DCFCE7',
    warning: '#D97706',
    warningLight: '#FEF3C7',
  },
  black: {
    name: 'black',
    label: 'OLED Black',
    isDark: true,
    bg: '#000000',
    card: '#0A0A0A',
    surface: '#141414',
    surfaceHover: '#1F1F1F',
    border: '#27272A',
    borderLight: '#3F3F46',
    text: '#FFFFFF',
    textSecondary: '#A1A1AA',
    textMuted: '#71717A',
    primary: '#38BDF8',
    primaryLight: '#082F49',
    accent: '#0EA5E9',
    danger: '#EF4444',
    dangerLight: '#450A0A',
    success: '#22C55E',
    successLight: '#052E16',
    warning: '#F59E0B',
    warningLight: '#451A03',
  },
  navy: {
    name: 'navy',
    label: 'Midnight Navy',
    isDark: true,
    bg: '#0B1120',
    card: '#0F172A',
    surface: '#1E293B',
    surfaceHover: '#334155',
    border: 'rgba(255, 255, 255, 0.1)',
    borderLight: 'rgba(255, 255, 255, 0.18)',
    text: '#FFFFFF',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    primary: '#00D4B2',
    primaryLight: 'rgba(0, 212, 178, 0.15)',
    accent: '#38BDF8',
    danger: '#EF4444',
    dangerLight: 'rgba(239, 68, 68, 0.15)',
    success: '#10B981',
    successLight: 'rgba(16, 185, 129, 0.15)',
    warning: '#F59E0B',
    warningLight: 'rgba(245, 158, 11, 0.15)',
  },
  grey: {
    name: 'grey',
    label: 'Slate Grey',
    isDark: true,
    bg: '#18181B',
    card: '#27272A',
    surface: '#3F3F46',
    surfaceHover: '#52525B',
    border: '#52525B',
    borderLight: '#71717A',
    text: '#FAFAFA',
    textSecondary: '#D4D4D8',
    textMuted: '#A1A1AA',
    primary: '#38BDF8',
    primaryLight: '#27272A',
    accent: '#60A5FA',
    danger: '#F87171',
    dangerLight: '#3F1818',
    success: '#4ADE80',
    successLight: '#143320',
    warning: '#FBBF24',
    warningLight: '#3A2E12',
  },
};

interface ThemeContextType {
  theme: ThemeColors;
  themeType: ThemeType;
  setTheme: (type: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: THEMES.white, // White theme default
  themeType: 'white',
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeType, setThemeType] = useState<ThemeType>('white');

  useEffect(() => {
    getSecuritySetting('app_theme', 'white').then((saved) => {
      if (saved && (saved === 'white' || saved === 'black' || saved === 'navy' || saved === 'grey')) {
        setThemeType(saved as ThemeType);
      }
    });
  }, []);

  const handleSetTheme = (type: ThemeType) => {
    setThemeType(type);
    setSecuritySetting('app_theme', type).catch(() => {});
  };

  const currentTheme = THEMES[themeType] || THEMES.white;

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, themeType, setTheme: handleSetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

