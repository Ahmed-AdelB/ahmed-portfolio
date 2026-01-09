import {
  type FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Keyboard, Search, X } from "lucide-react";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";

type ShortcutsHelpProps = {};

type ShortcutCategory = "Navigation" | "Modes" | "Tools" | "Help";

interface ShortcutDefinition {
  id: string;
  title: string;
  description: string;
  keys: string[];
  category: ShortcutCategory;
}

const CATEGORY_ORDER: ShortcutCategory[] = [
  "Navigation",
  "Modes",
  "Tools",
  "Help",
];

const SHORTCUTS: ShortcutDefinition[] = [
  {
    id: "command-palette",
    title: "Command Palette",
    description: "Jump to pages and actions",
    keys: ["Ctrl/Cmd", "K"],
    category: "Navigation",
  },
  {
    id: "terminal-mode",
    title: "Terminal Mode",
    description: "Toggle the terminal experience",
    keys: ["Ctrl/Cmd", "T"],
    category: "Modes",
  },
  {
    id: "hacker-theme",
    title: "Hacker Theme",
    description: "Toggle hacker visual theme",
    keys: ["Ctrl/Cmd", "H"],
    category: "Modes",
  },
  {
    id: "ai-chatbot",
    title: "AI Chatbot",
    description: "Open the AI assistant",
    keys: ["Ctrl/Cmd", "/"],
    category: "Tools",
  },
  {
    id: "close-modal",
    title: "Close Modals",
    description: "Dismiss any open overlay",
    keys: ["Esc"],
    category: "Help",
  },
  {
    id: "shortcuts-help",
    title: "Shortcuts Help",
    description: "View all keyboard shortcuts",
    keys: ["?"],
    category: "Help",
  },
];

const renderKeys = (keys: string[]) => (
  <div className="flex items-center gap-1">
    {keys.map((key, index) => (
      <span key={`${key}-${index}`} className="flex items-center gap-1">
        <kbd className="rounded border border-zinc-200 bg-zinc-50 px-2 py-1 text-[11px] font-mono text-zinc-600 shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          {key}
        </kbd>
        {index < keys.length - 1 && (
          <span className="text-xs text-zinc-400">+</span>
        )}
      </span>
    ))}
  </div>
);

/**
 * ShortcutsHelp - Modal listing all available keyboard shortcuts.
 */
export const ShortcutsHelp: FC<ShortcutsHelpProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const openHelp = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeHelp = useCallback(() => {
    setIsOpen(false);
  }, []);

  useKeyboardShortcuts({ onOpenHelp: openHelp, onCloseHelp: closeHelp });

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    searchInputRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const filteredShortcuts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return SHORTCUTS;

    return SHORTCUTS.filter((shortcut) => {
      const haystack = [
        shortcut.title,
        shortcut.description,
        shortcut.category,
        shortcut.keys.join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [query]);

  const groupedShortcuts = useMemo(
    () =>
      CATEGORY_ORDER.map((category) => ({
        category,
        items: filteredShortcuts.filter(
          (shortcut) => shortcut.category === category,
        ),
      })).filter((group) => group.items.length > 0),
    [filteredShortcuts],
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeHelp}
            aria-hidden="true"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.16 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="shortcuts-title"
            aria-describedby="shortcuts-description"
            data-shortcuts-ignore
            className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Keyboard className="h-5 w-5" />
                </span>
                <div>
                  <h2
                    id="shortcuts-title"
                    className="text-lg font-semibold text-zinc-900 dark:text-zinc-100"
                  >
                    Keyboard Shortcuts
                  </h2>
                  <p
                    id="shortcuts-description"
                    className="text-sm text-zinc-500 dark:text-zinc-400"
                  >
                    Power shortcuts to navigate faster.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeHelp}
                className="rounded-full p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                aria-label="Close shortcuts help"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
              <label htmlFor="shortcuts-search" className="sr-only">
                Search shortcuts
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 shadow-sm focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:focus-within:border-emerald-500 dark:focus-within:ring-emerald-500/20">
                <Search className="h-4 w-4 text-zinc-400" />
                <input
                  id="shortcuts-search"
                  ref={searchInputRef}
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search shortcuts..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
                />
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto px-6 pb-6 pt-4">
              {groupedShortcuts.length === 0 ? (
                <div className="py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  No shortcuts match your search.
                </div>
              ) : (
                groupedShortcuts.map((group) => (
                  <section key={group.category} className="mb-6 last:mb-0">
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                      {group.category}
                    </h3>
                    <div className="space-y-2">
                      {group.items.map((shortcut) => (
                        <div
                          key={shortcut.id}
                          className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm transition-colors hover:border-emerald-200 hover:bg-emerald-50/30 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-500/40 dark:hover:bg-emerald-500/5 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                              {shortcut.title}
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              {shortcut.description}
                            </p>
                          </div>
                          {renderKeys(shortcut.keys)}
                        </div>
                      ))}
                    </div>
                  </section>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
