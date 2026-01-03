import { persistentAtom } from 'nanostores/persistent';

const STORAGE_KEY = 'terminal-mode';

type TerminalModeValue = boolean;

export const terminalMode = persistentAtom<TerminalModeValue>(STORAGE_KEY, false, {
  encode: (value) => (value ? '1' : '0'),
  decode: (value) => value === '1',
});

const applyTerminalAttribute = (enabled: TerminalModeValue): void => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (enabled) {
    root.setAttribute('data-terminal', 'true');
  } else {
    root.removeAttribute('data-terminal');
  }
};

if (typeof window !== 'undefined') {
  terminalMode.subscribe((value) => {
    applyTerminalAttribute(value);
  });
}

export const setTerminalMode = (enabled: TerminalModeValue): void => {
  terminalMode.set(enabled);
};

export const toggleTerminalMode = (): void => {
  terminalMode.set(!terminalMode.get());
};

export const syncTerminalMode = (enabled: TerminalModeValue): void => {
  applyTerminalAttribute(enabled);
};
