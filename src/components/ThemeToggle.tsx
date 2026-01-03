import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Monitor } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    if (storedTheme) {
      setTheme(storedTheme);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = (t: Theme) => {
      const isDark =
        t === 'dark' ||
        (t === 'system' && mediaQuery.matches);

      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme(theme);
    localStorage.setItem('theme', theme);

    const handleSystemChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [theme]);

  const cycleTheme = () => {
    const states: Theme[] = ['light', 'dark', 'system'];
    const nextIndex = (states.indexOf(theme) + 1) % states.length;
    setTheme(states[nextIndex]);
  };

  if (!mounted) {
    return (
      <div className="w-10 h-10" /> // Placeholder to prevent CLS
    );
  }

  return (
    <button
      onClick={cycleTheme}
      className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-gray-100 hover:ring-2 hover:ring-gray-300 dark:hover:ring-zinc-600 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      aria-label={`Theme: ${theme}. Click to cycle.`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ y: -20, opacity: 0, rotate: -90 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 20, opacity: 0, rotate: 90 }}
          transition={{ duration: 0.2 }}
        >
          {theme === 'light' && <Sun className="w-5 h-5" />}
          {theme === 'dark' && <Moon className="w-5 h-5" />}
          {theme === 'system' && <Monitor className="w-5 h-5" />}
        </motion.div>
      </AnimatePresence>
      
      {/* Tooltip or status indicator usually helps, but keeping it minimal for now */}
      <span className="sr-only">Current theme: {theme}</span>
    </button>
  );
}
