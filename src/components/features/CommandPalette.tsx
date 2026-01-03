/**
 * Command Palette Component
 *
 * A keyboard-activated command palette for quick navigation and actions.
 *
 * Features:
 * - Opens on Cmd+K (Mac) or Ctrl+K (Windows)
 * - Fuzzy search through pages and actions
 * - Keyboard navigation (up/down arrows, Enter to select)
 * - Actions: Navigate to pages, toggle theme, copy email
 * - Beautiful animation on open/close
 * - ESC to close
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useStore } from '@nanostores/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Home,
  User,
  FolderKanban,
  GitPullRequest,
  BookOpen,
  FileText,
  Mail,
  Sun,
  Moon,
  Monitor,
  Copy,
  Check,
  ArrowRight,
  Command,
  Terminal,
  type LucideIcon,
} from 'lucide-react';
import { terminalMode, toggleTerminalMode } from '../../lib/terminalMode';

// Types
interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: LucideIcon;
  category: 'navigation' | 'action' | 'theme' | 'terminal';
  keywords: string[];
  action: () => void;
}

// Animation variants
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.15 }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.1 }
  },
};

const paletteVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: -20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 400,
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -10,
    transition: { duration: 0.1 }
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.02,
      duration: 0.15,
    }
  }),
};

// Simple fuzzy search function
function fuzzyMatch(text: string, query: string): boolean {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();

  // Direct substring match
  if (lowerText.includes(lowerQuery)) return true;

  // Fuzzy character match
  let queryIndex = 0;
  for (let i = 0; i < lowerText.length && queryIndex < lowerQuery.length; i++) {
    if (lowerText[i] === lowerQuery[queryIndex]) {
      queryIndex++;
    }
  }
  return queryIndex === lowerQuery.length;
}

const terminalRoutes: Record<string, string> = {
  home: '/',
  about: '/about',
  projects: '/projects',
  contributions: '/contributions',
  blog: '/blog',
  resume: '/resume',
  contact: '/contact',
};

const terminalFiles: Record<string, string[]> = {
  'about.txt': [
    'Ahmed Adel - Incident Response and Threat Intelligence leader.',
    'Open-source contributor focused on security tooling.',
  ],
  'contact.txt': [
    'Email: contact@ahmedalderai.com',
  ],
  'projects.txt': [
    'Projects live at /projects',
  ],
};

const terminalHelp: string[] = [
  'Available commands:',
  'ls - list sections',
  'cat <file> - read a file',
  'whoami - display current user',
  'cd <section> - open a section',
  'help - show this message',
];

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string[] | null>(null);
  const isTerminalMode = useStore(terminalMode);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Theme toggle handler
  const toggleTheme = useCallback(() => {
    const root = document.documentElement;
    const currentTheme = localStorage.getItem('theme') || 'system';

    let newTheme: 'light' | 'dark' | 'system';
    if (currentTheme === 'light') {
      newTheme = 'dark';
    } else if (currentTheme === 'dark') {
      newTheme = 'system';
    } else {
      newTheme = 'light';
    }

    localStorage.setItem('theme', newTheme);

    const effectiveTheme = newTheme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : newTheme;

    root.classList.toggle('dark', effectiveTheme === 'dark');
    setIsOpen(false);
  }, []);

  // Set to light theme
  const setLightTheme = useCallback(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
    setIsOpen(false);
  }, []);

  // Set to dark theme
  const setDarkTheme = useCallback(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
    setIsOpen(false);
  }, []);

  // Set to system theme
  const setSystemTheme = useCallback(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', prefersDark);
    localStorage.setItem('theme', 'system');
    setIsOpen(false);
  }, []);

  // Terminal mode toggle handler
  const handleToggleTerminalMode = useCallback(() => {
    toggleTerminalMode();
    setTerminalOutput(null);
    setIsOpen(false);
  }, [toggleTerminalMode]);

  // Copy email handler
  const copyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText('contact@ahmedalderai.com');
      setCopiedEmail(true);
      setTimeout(() => {
        setCopiedEmail(false);
        setIsOpen(false);
      }, 1000);
    } catch (err) {
      console.error('Failed to copy email:', err);
    }
  }, []);

  // Navigate handler
  const navigate = useCallback((href: string) => {
    setIsOpen(false);
    window.location.href = href;
  }, []);

  const runTerminalCommand = useCallback((input: string): boolean => {
    const trimmed = input.trim();
    if (!trimmed) return false;

    const [rawCommand, ...args] = trimmed.split(/\s+/);
    const command = rawCommand.toLowerCase();

    switch (command) {
      case 'help':
        setTerminalOutput(terminalHelp);
        setQuery('');
        setSelectedIndex(0);
        return true;
      case 'ls':
        setTerminalOutput([Object.keys(terminalRoutes).join('  ')]);
        setQuery('');
        setSelectedIndex(0);
        return true;
      case 'whoami':
        setTerminalOutput(['ahmedadel']);
        setQuery('');
        setSelectedIndex(0);
        return true;
      case 'cd': {
        const target = args[0]?.toLowerCase();
        if (!target) {
          setTerminalOutput([
            'usage: cd <section>',
            `available: ${Object.keys(terminalRoutes).join(', ')}`,
          ]);
          setQuery('');
          setSelectedIndex(0);
          return true;
        }

        const route = terminalRoutes[target];
        if (!route) {
          setTerminalOutput([`cd: no such directory: ${args[0]}`]);
          setQuery('');
          setSelectedIndex(0);
          return true;
        }

        navigate(route);
        return true;
      }
      case 'cat': {
        const target = args[0]?.toLowerCase();
        if (!target) {
          setTerminalOutput(['cat: missing file operand', 'try: cat about.txt']);
          setQuery('');
          setSelectedIndex(0);
          return true;
        }

        const content = terminalFiles[target];
        if (!content) {
          setTerminalOutput([`cat: ${args[0]}: No such file`]);
          setQuery('');
          setSelectedIndex(0);
          return true;
        }

        setTerminalOutput(content);
        setQuery('');
        setSelectedIndex(0);
        return true;
      }
      default:
        return false;
    }
  }, [navigate]);

  // Command items
  const commands: CommandItem[] = useMemo(() => [
    // Navigation
    {
      id: 'home',
      label: 'Home',
      description: 'Go to the home page',
      icon: Home,
      category: 'navigation',
      keywords: ['home', 'main', 'start', 'landing'],
      action: () => navigate('/'),
    },
    {
      id: 'about',
      label: 'About',
      description: 'Learn more about me',
      icon: User,
      category: 'navigation',
      keywords: ['about', 'bio', 'me', 'info', 'profile'],
      action: () => navigate('/about'),
    },
    {
      id: 'projects',
      label: 'Projects',
      description: 'View my projects',
      icon: FolderKanban,
      category: 'navigation',
      keywords: ['projects', 'work', 'portfolio', 'apps'],
      action: () => navigate('/projects'),
    },
    {
      id: 'contributions',
      label: 'Contributions',
      description: 'Open source contributions',
      icon: GitPullRequest,
      category: 'navigation',
      keywords: ['contributions', 'open source', 'github', 'oss', 'prs'],
      action: () => navigate('/contributions'),
    },
    {
      id: 'blog',
      label: 'Blog',
      description: 'Read my articles',
      icon: BookOpen,
      category: 'navigation',
      keywords: ['blog', 'articles', 'posts', 'writing', 'thoughts'],
      action: () => navigate('/blog'),
    },
    {
      id: 'resume',
      label: 'Resume',
      description: 'View my resume',
      icon: FileText,
      category: 'navigation',
      keywords: ['resume', 'cv', 'experience', 'career', 'work'],
      action: () => navigate('/resume'),
    },
    {
      id: 'contact',
      label: 'Contact',
      description: 'Get in touch',
      icon: Mail,
      category: 'navigation',
      keywords: ['contact', 'email', 'reach', 'message', 'connect'],
      action: () => navigate('/contact'),
    },
    // Actions
    {
      id: 'copy-email',
      label: 'Copy Email',
      description: 'Copy contact@ahmedalderai.com to clipboard',
      icon: copiedEmail ? Check : Copy,
      category: 'action',
      keywords: ['copy', 'email', 'clipboard', 'contact'],
      action: copyEmail,
    },
    {
      id: 'toggle-terminal-mode',
      label: 'Toggle Terminal Mode',
      description: isTerminalMode ? 'Disable terminal theme' : 'Enable terminal theme',
      icon: Terminal,
      category: 'action',
      keywords: ['terminal', 'matrix', 'cli', 'mode', 'theme'],
      action: handleToggleTerminalMode,
    },
    // Theme
    {
      id: 'theme-light',
      label: 'Light Mode',
      description: 'Switch to light theme',
      icon: Sun,
      category: 'theme',
      keywords: ['light', 'theme', 'mode', 'bright', 'day'],
      action: setLightTheme,
    },
    {
      id: 'theme-dark',
      label: 'Dark Mode',
      description: 'Switch to dark theme',
      icon: Moon,
      category: 'theme',
      keywords: ['dark', 'theme', 'mode', 'night'],
      action: setDarkTheme,
    },
    {
      id: 'theme-system',
      label: 'System Theme',
      description: 'Follow system preference',
      icon: Monitor,
      category: 'theme',
      keywords: ['system', 'theme', 'auto', 'preference'],
      action: setSystemTheme,
    },
    ...(isTerminalMode ? [
      {
        id: 'terminal-help',
        label: 'help',
        description: 'List available terminal commands',
        icon: Terminal,
        category: 'terminal',
        keywords: ['help', 'terminal', 'commands', 'man'],
        action: () => runTerminalCommand('help'),
      },
      {
        id: 'terminal-ls',
        label: 'ls',
        description: 'List sections',
        icon: Terminal,
        category: 'terminal',
        keywords: ['ls', 'list', 'dir', 'folders'],
        action: () => runTerminalCommand('ls'),
      },
      {
        id: 'terminal-cat',
        label: 'cat',
        description: 'Read a file (try: cat about.txt)',
        icon: FileText,
        category: 'terminal',
        keywords: ['cat', 'read', 'file'],
        action: () => runTerminalCommand('cat'),
      },
      {
        id: 'terminal-whoami',
        label: 'whoami',
        description: 'Show current user',
        icon: User,
        category: 'terminal',
        keywords: ['whoami', 'user', 'id'],
        action: () => runTerminalCommand('whoami'),
      },
      {
        id: 'terminal-cd',
        label: 'cd',
        description: 'Change section (try: cd projects)',
        icon: Terminal,
        category: 'terminal',
        keywords: ['cd', 'change', 'directory', 'section'],
        action: () => runTerminalCommand('cd'),
      },
    ] : []),
  ], [
    navigate,
    copyEmail,
    copiedEmail,
    setLightTheme,
    setDarkTheme,
    setSystemTheme,
    handleToggleTerminalMode,
    isTerminalMode,
    runTerminalCommand,
  ]);

  // Filter commands based on query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;

    return commands.filter(cmd => {
      const searchText = `${cmd.label} ${cmd.description || ''} ${cmd.keywords.join(' ')}`;
      return fuzzyMatch(searchText, query);
    });
  }, [commands, query]);

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {
      navigation: [],
      action: [],
      theme: [],
      terminal: [],
    };

    filteredCommands.forEach(cmd => {
      groups[cmd.category].push(cmd);
    });

    return groups;
  }, [filteredCommands]);

  // Flat list for keyboard navigation
  const flatCommands = useMemo(() => {
    return [
      ...groupedCommands.navigation,
      ...groupedCommands.action,
      ...groupedCommands.theme,
      ...groupedCommands.terminal,
    ];
  }, [groupedCommands]);

  // Open/close handlers
  const openPalette = useCallback(() => {
    setIsOpen(true);
    setQuery('');
    setSelectedIndex(0);
    setTerminalOutput(null);
  }, []);

  const closePalette = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(0);
    setTerminalOutput(null);
  }, []);

  // Listen for open-search event
  useEffect(() => {
    const handleOpenSearch = () => openPalette();
    window.addEventListener('open-search', handleOpenSearch);
    return () => window.removeEventListener('open-search', handleOpenSearch);
  }, [openPalette]);

  // Keyboard shortcut (backup, Header already handles Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          closePalette();
        } else {
          openPalette();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, openPalette, closePalette]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [isOpen]);

  // Reset selected index when filtered results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll selected item into view
  useEffect(() => {
    const selectedElement = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    selectedElement?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [selectedIndex]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < flatCommands.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : flatCommands.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (isTerminalMode && query.trim() && runTerminalCommand(query)) {
          break;
        }
        if (flatCommands[selectedIndex]) {
          flatCommands[selectedIndex].action();
        }
        break;
      case 'Escape':
        e.preventDefault();
        closePalette();
        break;
    }
  }, [flatCommands, selectedIndex, closePalette, isTerminalMode, query, runTerminalCommand]);

  // Category labels
  const categoryLabels: Record<string, string> = {
    navigation: 'Pages',
    action: 'Actions',
    theme: 'Theme',
    terminal: 'Terminal',
  };

  // Track global index for keyboard navigation
  let globalIndex = -1;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
            onClick={closePalette}
            aria-hidden="true"
          />

          {/* Palette */}
          <motion.div
            variants={paletteVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed left-1/2 top-[20%] z-[101] w-full max-w-xl -translate-x-1/2"
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
          >
            <div className="mx-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
              {/* Search Input */}
              <div className="flex items-center gap-3 border-b border-gray-200 px-4 dark:border-gray-700">
                <Search
                  className="h-5 w-5 flex-shrink-0 text-gray-400"
                  aria-hidden="true"
                />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search pages, actions..."
                  className="h-14 w-full bg-transparent text-base text-gray-900 placeholder-gray-400 outline-none dark:text-white dark:placeholder-gray-500"
                  aria-label="Search commands"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
                <kbd className="hidden items-center gap-1 rounded-md border border-gray-200 bg-gray-100 px-2 py-1 text-xs font-medium text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 sm:flex">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div
                ref={listRef}
                className="max-h-[60vh] overflow-y-auto overscroll-contain p-2"
                role="listbox"
                aria-label="Commands"
              >
                {isTerminalMode && terminalOutput && (
                  <div className="mb-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono dark:border-gray-700">
                    <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                      Output
                    </div>
                    <pre className="whitespace-pre-wrap">{terminalOutput.join('\n')}</pre>
                  </div>
                )}
                {flatCommands.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No results found for "{query}"
                    </p>
                  </div>
                ) : (
                  Object.entries(groupedCommands).map(([category, items]) => {
                    if (items.length === 0) return null;

                    return (
                      <div key={category} className="mb-2 last:mb-0">
                        <div className="mb-1 px-3 py-2">
                          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                            {categoryLabels[category]}
                          </span>
                        </div>

                        {items.map((item) => {
                          globalIndex++;
                          const index = globalIndex;
                          const isSelected = selectedIndex === index;
                          const Icon = item.icon;

                          return (
                            <motion.button
                              key={item.id}
                              custom={index}
                              variants={itemVariants}
                              initial="hidden"
                              animate="visible"
                              data-index={index}
                              onClick={() => item.action()}
                              onMouseEnter={() => setSelectedIndex(index)}
                              className={`
                                group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-start transition-colors
                                ${isSelected
                                  ? 'bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 dark:from-emerald-500/20 dark:to-cyan-500/20'
                                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                }
                              `}
                              role="option"
                              aria-selected={isSelected}
                            >
                              <div className={`
                                flex h-10 w-10 items-center justify-center rounded-lg transition-colors
                                ${isSelected
                                  ? 'bg-gradient-to-br from-emerald-500 to-cyan-500 text-white'
                                  : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                                }
                              `}>
                                <Icon className="h-5 w-5" aria-hidden="true" />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className={`
                                  font-medium truncate
                                  ${isSelected
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-gray-900 dark:text-white'
                                  }
                                `}>
                                  {item.label}
                                </div>
                                {item.description && (
                                  <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                    {item.description}
                                  </div>
                                )}
                              </div>

                              {isSelected && (
                                <ArrowRight
                                  className="h-4 w-4 flex-shrink-0 text-emerald-500 dark:text-emerald-400"
                                  aria-hidden="true"
                                />
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-gray-200 px-4 py-2 dark:border-gray-700">
                <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-gray-200 bg-gray-100 px-1.5 py-0.5 font-mono dark:border-gray-600 dark:bg-gray-800">
                      <span className="text-[10px]">&#8593;</span>
                    </kbd>
                    <kbd className="rounded border border-gray-200 bg-gray-100 px-1.5 py-0.5 font-mono dark:border-gray-600 dark:bg-gray-800">
                      <span className="text-[10px]">&#8595;</span>
                    </kbd>
                    <span className="ms-1">Navigate</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-gray-200 bg-gray-100 px-1.5 py-0.5 font-mono dark:border-gray-600 dark:bg-gray-800">
                      <span className="text-[10px]">&#9166;</span>
                    </kbd>
                    <span className="ms-1">Select</span>
                  </span>
                </div>

                <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                  <Command className="h-3 w-3" aria-hidden="true" />
                  <span>K to toggle</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
