import { create } from 'zustand';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

function applyTheme(theme: Theme): 'light' | 'dark' {
  const root = window.document.documentElement;
  root.classList.remove('light', 'dark');

  let activeTheme: 'light' | 'dark' = 'light';
  if (theme === 'system') {
    activeTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } else {
    activeTheme = theme;
  }

  root.classList.add(activeTheme);
  return activeTheme;
}

export const useThemeStore = create<ThemeState>((set) => {
  const savedTheme = (typeof window !== 'undefined' ? (localStorage.getItem('teamhub_theme') as Theme) : 'light') || 'light';
  const initialResolved = typeof window !== 'undefined' ? applyTheme(savedTheme) : 'light';

  return {
    theme: savedTheme,
    resolvedTheme: initialResolved,
    setTheme: (theme: Theme) => {
      localStorage.setItem('teamhub_theme', theme);
      const resolved = applyTheme(theme);
      set({ theme, resolvedTheme: resolved });
    },
  };
});
