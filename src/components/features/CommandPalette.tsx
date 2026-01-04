/**
 * Command Palette Component
 *
 * A keyboard-activated command palette for quick navigation and actions.
 * Built with cmdk (https://cmdk.paco.me/)
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useStore } from "@nanostores/react";
import { Command } from "cmdk";
import { motion, AnimatePresence } from "framer-motion";
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
  Terminal as TerminalIcon,
  Github,
  type LucideIcon,
} from "lucide-react";
import { terminalMode, toggleTerminalMode } from "../../stores/terminal";
import { useCommandPalette } from "../../hooks/useCommandPalette";
import { setTheme } from "../../stores/theme";

// Types
interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: LucideIcon;
  category: "navigation" | "action" | "theme" | "terminal";
  keywords?: string[];
  action: () => void;
}

const terminalRoutes: Record<string, string> = {
  home: "/",
  about: "/about",
  projects: "/projects",
  contributions: "/contributions",
  blog: "/blog",
  resume: "/resume",
  contact: "/contact",
};

const terminalFiles: Record<string, string[]> = {
  "about.txt": [
    "Ahmed Adel - Incident Response and Threat Intelligence leader.",
    "Open-source contributor focused on security tooling.",
  ],
  "contact.txt": ["Email: contact@ahmedalderai.com"],
  "projects.txt": ["Projects live at /projects"],
};

const terminalHelp: string[] = [
  "Available commands:",
  "ls - list sections",
  "cat <file> - read a file",
  "whoami - display current user",
  "cd <section> - open a section",
  "help - show this message",
];

export default function CommandPalette() {
  const { isOpen, close } = useCommandPalette();
  const [query, setQuery] = useState("");
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string[] | null>(null);
  const isTerminalMode = useStore(terminalMode);

  // Reset state when closed
  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setTerminalOutput(null);
    }
  }, [isOpen]);

  // Navigate handler
  const navigate = useCallback(
    (href: string) => {
      close();
      window.location.href = href;
    },
    [close],
  );

  // Copy email handler
  const copyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText("contact@ahmedalderai.com");
      setCopiedEmail(true);
      setTimeout(() => {
        setCopiedEmail(false);
        close();
      }, 1000);
    } catch (err) {
      console.error("Failed to copy email:", err);
    }
  }, [close]);

  const runTerminalCommand = useCallback(
    (input: string): boolean => {
      const trimmed = input.trim();
      if (!trimmed) return false;

      const [rawCommand, ...args] = trimmed.split(/\s+/);
      const command = rawCommand.toLowerCase();

      switch (command) {
        case "help":
          setTerminalOutput(terminalHelp);
          setQuery("");
          return true;
        case "ls":
          setTerminalOutput([Object.keys(terminalRoutes).join("  ")]);
          setQuery("");
          return true;
        case "whoami":
          setTerminalOutput(["ahmedadel"]);
          setQuery("");
          return true;
        case "cd": {
          const target = args[0]?.toLowerCase();
          if (!target) {
            setTerminalOutput([
              "usage: cd <section>",
              `available: ${Object.keys(terminalRoutes).join(", ")}`,
            ]);
            setQuery("");
            return true;
          }

          const route = terminalRoutes[target];
          if (!route) {
            setTerminalOutput([`cd: no such directory: ${args[0]}`]);
            setQuery("");
            return true;
          }

          navigate(route);
          return true;
        }
        case "cat": {
          const target = args[0]?.toLowerCase();
          if (!target) {
            setTerminalOutput([
              "cat: missing file operand",
              "try: cat about.txt",
            ]);
            setQuery("");
            return true;
          }

          const content = terminalFiles[target];
          if (!content) {
            setTerminalOutput([`cat: ${args[0]}: No such file`]);
            setQuery("");
            return true;
          }

          setTerminalOutput(content);
          setQuery("");
          return true;
        }
        default:
          return false;
      }
    },
    [navigate],
  );

  // Command items
  const commands: CommandItem[] = useMemo(
    () => [
      // Navigation
      {
        id: "home",
        label: "Home",
        description: "Go to the home page",
        icon: Home,
        category: "navigation",
        keywords: ["home", "main", "start", "landing"],
        action: () => navigate("/"),
      },
      {
        id: "about",
        label: "About",
        description: "Learn more about me",
        icon: User,
        category: "navigation",
        keywords: ["about", "bio", "me", "info", "profile"],
        action: () => navigate("/about"),
      },
      {
        id: "projects",
        label: "Projects",
        description: "View my projects",
        icon: FolderKanban,
        category: "navigation",
        keywords: ["projects", "work", "portfolio", "apps"],
        action: () => navigate("/projects"),
      },
      {
        id: "contributions",
        label: "Contributions",
        description: "Open source contributions",
        icon: GitPullRequest,
        category: "navigation",
        keywords: ["contributions", "open source", "github", "oss", "prs"],
        action: () => navigate("/contributions"),
      },
      {
        id: "blog",
        label: "Blog",
        description: "Read my articles",
        icon: BookOpen,
        category: "navigation",
        keywords: ["blog", "articles", "posts", "writing", "thoughts"],
        action: () => navigate("/blog"),
      },
      {
        id: "resume",
        label: "Resume",
        description: "View my resume",
        icon: FileText,
        category: "navigation",
        keywords: ["resume", "cv", "experience", "career", "work"],
        action: () => navigate("/resume"),
      },
      {
        id: "contact",
        label: "Contact",
        description: "Get in touch",
        icon: Mail,
        category: "navigation",
        keywords: ["contact", "email", "reach", "message", "connect"],
        action: () => navigate("/contact"),
      },
      // Actions
      {
        id: "copy-email",
        label: "Copy Email",
        description: "Copy contact@ahmedalderai.com to clipboard",
        icon: copiedEmail ? Check : Copy,
        category: "action",
        keywords: ["copy", "email", "clipboard", "contact"],
        action: copyEmail,
      },
      {
        id: "toggle-terminal-mode",
        label: "Toggle Terminal Mode",
        description: isTerminalMode
          ? "Disable terminal theme"
          : "Enable terminal theme",
        icon: TerminalIcon,
        category: "action",
        keywords: ["terminal", "matrix", "cli", "mode", "theme"],
        action: () => {
          toggleTerminalMode();
          setTerminalOutput(null);
          close();
        },
      },
      {
        id: "open-github",
        label: "Open GitHub",
        description: "Visit my GitHub profile",
        icon: Github,
        category: "action",
        keywords: ["github", "git", "profile", "code"],
        action: () => {
          window.open("https://github.com/Ahmed-AdelB", "_blank");
          close();
        },
      },
      // Theme
      {
        id: "theme-light",
        label: "Light Mode",
        description: "Switch to light theme",
        icon: Sun,
        category: "theme",
        keywords: ["light", "theme", "mode", "bright", "day"],
        action: () => {
          setTheme("light");
          close();
        },
      },
      {
        id: "theme-dark",
        label: "Dark Mode",
        description: "Switch to dark theme",
        icon: Moon,
        category: "theme",
        keywords: ["dark", "theme", "mode", "night"],
        action: () => {
          setTheme("dark");
          close();
        },
      },
      {
        id: "theme-system",
        label: "System Theme",
        description: "Follow system preference",
        icon: Monitor,
        category: "theme",
        keywords: ["system", "theme", "auto", "preference"],
        action: () => {
          setTheme("system");
          close();
        },
      },
    ],
    [navigate, copyEmail, copiedEmail, isTerminalMode, close],
  );

  return (
    <Command.Dialog
      open={isOpen}
      onOpenChange={(open) => !open && close()}
      label="Command Menu"
      aria-label="Command palette"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[20%] sm:pt-[10%] px-4"
      onKeyDown={(e) => {
        if (isTerminalMode && e.key === "Enter" && query.trim()) {
          // Check if it matches a terminal command first
          const input = query.trim();
          if (
            input.startsWith("cd ") ||
            input.startsWith("cat ") ||
            ["help", "ls", "whoami"].includes(input.toLowerCase())
          ) {
            e.preventDefault();
            runTerminalCommand(input);
          }
        }
      }}
    >
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
        onClick={close}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ duration: 0.1 }}
        className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900"
      >
        <div className="flex items-center border-b border-gray-200 px-4 dark:border-gray-700">
          <Search className="h-5 w-5 flex-shrink-0 text-gray-400" />
          <Command.Input
            value={query}
            onValueChange={setQuery}
            placeholder="Search pages, actions..."
            aria-label="Search commands"
            className="flex-1 border-0 bg-transparent px-4 py-4 text-base text-gray-900 placeholder-gray-400 outline-none focus:ring-0 dark:text-white dark:placeholder-gray-500"
          />
          <div className="hidden sm:flex items-center gap-1">
            <kbd className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              ESC
            </kbd>
          </div>
        </div>

        <Command.List className="max-h-[60vh] overflow-y-auto p-2 scroll-py-2">
          {isTerminalMode && terminalOutput && (
            <div className="mb-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono dark:border-gray-700 dark:bg-gray-800/50">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Output
              </div>
              <pre className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                {terminalOutput.join("\n")}
              </pre>
            </div>
          )}

          <Command.Empty className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
            No results found.
          </Command.Empty>

          <Command.Group
            heading="Pages"
            className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-2 py-1"
          >
            {commands
              .filter((item) => item.category === "navigation")
              .map((item) => (
                <CommandItem key={item.id} item={item} />
              ))}
          </Command.Group>

          <Command.Group
            heading="Actions"
            className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-2 py-1"
          >
            {commands
              .filter((item) => item.category === "action")
              .map((item) => (
                <CommandItem key={item.id} item={item} />
              ))}
          </Command.Group>

          <Command.Group
            heading="Theme"
            className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-2 py-1"
          >
            {commands
              .filter((item) => item.category === "theme")
              .map((item) => (
                <CommandItem key={item.id} item={item} />
              ))}
          </Command.Group>

          {isTerminalMode && (
            <Command.Group
              heading="Terminal Commands"
              className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-2 py-1"
            >
              {commands
                .filter((item) => item.category === "terminal")
                .map((item) => (
                  <CommandItem key={item.id} item={item} />
                ))}
            </Command.Group>
          )}
        </Command.List>

        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-2 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-gray-200 bg-white px-1.5 py-0.5 font-mono dark:border-gray-600 dark:bg-gray-800">
                ↓
              </kbd>
              <kbd className="rounded border border-gray-200 bg-white px-1.5 py-0.5 font-mono dark:border-gray-600 dark:bg-gray-800">
                ↑
              </kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-gray-200 bg-white px-1.5 py-0.5 font-mono dark:border-gray-600 dark:bg-gray-800">
                ↵
              </kbd>
              <span>Select</span>
            </span>
          </div>
        </div>
      </motion.div>
    </Command.Dialog>
  );
}

function CommandItem({ item }: { item: CommandItem }) {
  const Icon = item.icon;
  return (
    <Command.Item
      value={`${item.label} ${item.description || ""} ${item.keywords?.join(" ") || ""}`}
      onSelect={item.action}
      className="group flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors aria-selected:bg-blue-50 aria-selected:text-blue-900 dark:aria-selected:bg-blue-900/20 dark:aria-selected:text-blue-100"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-100 text-gray-500 group-aria-selected:bg-blue-100 group-aria-selected:text-blue-600 dark:bg-gray-800 dark:text-gray-400 dark:group-aria-selected:bg-blue-900/40 dark:group-aria-selected:text-blue-400">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <div className="font-medium text-gray-900 dark:text-gray-100 group-aria-selected:text-blue-700 dark:group-aria-selected:text-blue-200">
          {item.label}
        </div>
        {item.description && (
          <div className="text-xs text-gray-500 dark:text-gray-400 group-aria-selected:text-blue-600/80 dark:group-aria-selected:text-blue-300/70">
            {item.description}
          </div>
        )}
      </div>
      <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-aria-selected:opacity-100 text-blue-500 dark:text-blue-400" />
    </Command.Item>
  );
}
