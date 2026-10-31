import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { APP_CONFIG } from '../config';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  /** Persisted user preference: light, dark or system. */
  mode: ThemeMode;
  /** Theme actually applied to the document right now. */
  theme: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
  /** Flips between the two resolved themes (legacy API, still supported). */
  toggleTheme: () => void;
  /** Alias kept for older call-sites. */
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const SYSTEM_QUERY = '(prefers-color-scheme: dark)';

const readStoredMode = (): ThemeMode => {
  try {
    const saved = localStorage.getItem(APP_CONFIG.THEME_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
  } catch {
    // storage unavailable — fall through to the default
  }
  return 'system';
};

const readSystemTheme = (): ResolvedTheme => {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  return window.matchMedia(SYSTEM_QUERY).matches ? 'dark' : 'light';
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>(readStoredMode);
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(readSystemTheme);

  const theme: ResolvedTheme = mode === 'system' ? systemTheme : mode;

  // Follow the OS preference while mode === 'system'.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const media = window.matchMedia(SYSTEM_QUERY);
    const onChange = (event: MediaQueryListEvent) => setSystemTheme(event.matches ? 'dark' : 'light');
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  // Apply the resolved theme to <html> and persist the preference.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;
    try {
      localStorage.setItem(APP_CONFIG.THEME_KEY, mode);
    } catch {
      // ignore quota / privacy-mode failures
    }
  }, [theme, mode]);

  const setMode = useCallback((next: ThemeMode) => setModeState(next), []);

  const toggleTheme = useCallback(() => {
    setModeState((prevMode) => {
      const resolved = prevMode === 'system' ? readSystemTheme() : prevMode;
      return resolved === 'dark' ? 'light' : 'dark';
    });
  }, []);

  const value = useMemo(
    () => ({ mode, theme, setMode, toggleTheme, setTheme: setMode }),
    [mode, theme, setMode, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
