import { persistentAtom } from '@nanostores/persistent';

const STORAGE_KEY = 'terminal-mode';

export type TerminalModeValue = boolean;

/**
 * terminalMode - Global persistent toggle for terminal styling.
 */
export const terminalMode = persistentAtom<TerminalModeValue>(STORAGE_KEY, false, {
  encode: (value) => (value ? '1' : '0'),
  decode: (value) => value === '1' || value === 'true',
});

const getEffectiveTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';

  try {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme;
    }
  } catch (error) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyTerminalAttribute = (enabled: TerminalModeValue): void => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  if (enabled) {
    root.setAttribute('data-terminal', 'true');
    root.style.backgroundColor = '#000000';
    root.style.color = '#00ff00';
    root.style.colorScheme = 'dark';
    return;
  }

  root.removeAttribute('data-terminal');
  root.style.removeProperty('background-color');
  root.style.removeProperty('color');
  root.style.colorScheme = getEffectiveTheme();
};

if (typeof window !== 'undefined') {
  terminalMode.subscribe((value) => {
    applyTerminalAttribute(value);
  });
}

/**
 * setTerminalMode - Explicitly enable/disable terminal mode.
 */
export const setTerminalMode = (enabled: TerminalModeValue): void => {
  terminalMode.set(enabled);
};

/**
 * toggleTerminalMode - Flip terminal mode on/off.
 */
export const toggleTerminalMode = (): void => {
  terminalMode.set(!terminalMode.get());
};
