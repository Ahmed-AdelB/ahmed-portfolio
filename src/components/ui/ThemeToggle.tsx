/**
 * Theme Toggle Component
 *
 * A React component that allows users to switch between light, dark, and system themes.
 * Uses global theme store for persistence and state management.
 *
 * Features:
 * - Three-state toggle: light, dark, system
 * - Smooth icon transitions
 * - Keyboard accessible
 * - ARIA labels for screen readers
 */

import { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import { Sun, Moon, Monitor, Terminal } from "lucide-react";
import { themeStore, setTheme, type Theme } from "../../stores/theme";

interface ThemeOption {
  value: Theme;
  label: string;
  icon: typeof Sun;
}

const themeOptions: ThemeOption[] = [
  { value: "light", label: "Light theme", icon: Sun },
  { value: "dark", label: "Dark theme", icon: Moon },
  { value: "system", label: "System theme", icon: Monitor },
  { value: "hacker", label: "Hacker Mode", icon: Terminal },
];

export default function ThemeToggle() {
  const theme = useStore(themeStore);
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Initialize mounted state to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle theme change
  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    setIsOpen(false);
  };

  // Close dropdown on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-theme-toggle]")) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [isOpen]);

  // Get current icon based on theme
  const getCurrentIcon = () => {
    const option = themeOptions.find((opt) => opt.value === theme);
    if (!option) return Sun;
    return option.icon;
  };

  const CurrentIcon = getCurrentIcon();

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="relative" data-theme-toggle>
        <button
          type="button"
          className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label="Toggle theme"
          disabled
        >
          <div className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative" data-theme-toggle>
      {/* Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        aria-label={`Current theme: ${theme}. Click to change theme.`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <CurrentIcon
          size={20}
          className="transition-transform duration-200"
          aria-hidden="true"
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute end-0 mt-2 w-40 py-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-top-2 duration-200"
          role="listbox"
          aria-label="Theme options"
        >
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = theme === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleThemeChange(option.value)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors
                  ${
                    isSelected
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }
                  focus:outline-none focus-visible:bg-gray-100 dark:focus-visible:bg-gray-700
                `}
                role="option"
                aria-selected={isSelected}
              >
                <Icon size={16} aria-hidden="true" />
                <span className="capitalize">{option.value}</span>
                {isSelected && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ms-auto"
                    aria-hidden="true"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
