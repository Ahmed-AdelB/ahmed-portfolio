import { atom } from 'nanostores';

export type Theme = 'light' | 'dark' | 'system';

const getInitialTheme = (): Theme => {
  if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
    return localStorage.getItem('theme') as Theme;
  }
  return 'system';
};

export const themeStore = atom<Theme>(getInitialTheme());

export const toggleTheme = () => {
  const current = themeStore.get();
  const next = current === 'light' ? 'dark' : 'light';
  setTheme(next);
};

export const setTheme = (theme: Theme) => {
  themeStore.set(theme);
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('theme', theme);
    
    const effectiveTheme = theme === 'system' 
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;
      
    document.documentElement.classList.toggle('dark', effectiveTheme === 'dark');
    document.documentElement.style.colorScheme = effectiveTheme === 'dark' ? 'dark' : 'light';
  }
};

// Initialize listener
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (themeStore.get() === 'system') {
      const newTheme = e.matches ? 'dark' : 'light';
      document.documentElement.classList.toggle('dark', e.matches);
      document.documentElement.style.colorScheme = newTheme;
    }
  });
}
