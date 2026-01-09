import { useEffect } from "react";
import {
  closeCommandPalette,
  openCommandPalette,
} from "../stores/commandPalette";
import { toggleTerminalMode } from "../stores/terminal";
import { closeScan, closeWhois } from "../stores/portfolioActions";
import { closeChatbot, openChatbot } from "../stores/aiChatbot";
import { setTheme, themeStore, type Theme } from "../stores/theme";

const HACKER_THEME_PREVIOUS_KEY = "hacker-theme-previous";

type ShortcutHandler = () => void;

export interface KeyboardShortcutsOptions {
  onOpenHelp?: ShortcutHandler;
  onCloseHelp?: ShortcutHandler;
}

const isEditableElement = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;

  const tagName = target.tagName.toLowerCase();
  if (tagName === "input" || tagName === "textarea" || tagName === "select") {
    return true;
  }

  if (target.isContentEditable) return true;

  if (target.closest("[data-shortcuts-ignore]")) {
    return true;
  }

  return Boolean(target.closest("[contenteditable='true']"));
};

const coerceTheme = (value: string | null): Theme | null => {
  if (value === "light" || value === "dark" || value === "system") {
    return value;
  }
  return null;
};

const toggleHackerTheme = (): void => {
  const current = themeStore.get();

  if (current === "hacker") {
    let fallback: Theme = "system";

    try {
      fallback =
        coerceTheme(localStorage.getItem(HACKER_THEME_PREVIOUS_KEY)) ??
        fallback;
    } catch {
      fallback = "system";
    }

    setTheme(fallback);
    return;
  }

  if (current === "light" || current === "dark" || current === "system") {
    try {
      localStorage.setItem(HACKER_THEME_PREVIOUS_KEY, current);
    } catch {}
  }

  setTheme("hacker");
};

/**
 * useKeyboardShortcuts - Global keyboard shortcut handler.
 */
export const useKeyboardShortcuts = (
  options: KeyboardShortcutsOptions = {},
): void => {
  const { onOpenHelp, onCloseHelp } = options;

  useEffect(() => {
    const closeAllModals = () => {
      closeCommandPalette();
      closeChatbot();
      closeScan();
      closeWhois();
      onCloseHelp?.();

      window.dispatchEvent(
        new CustomEvent("toggle-mobile-menu", { detail: { isOpen: false } }),
      );
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;

      if (event.key === "Escape") {
        closeAllModals();
        return;
      }

      if (event.repeat) return;

      if (isEditableElement(event.target)) return;

      const isModifier = event.ctrlKey || event.metaKey;
      const hasNoExtraModifiers = !event.shiftKey && !event.altKey;
      const normalizedKey = event.key.toLowerCase();
      const isHelpKey =
        event.key === "?" || (event.key === "/" && event.shiftKey);

      if (!isModifier && isHelpKey) {
        onOpenHelp?.();
        return;
      }

      if (!isModifier || !hasNoExtraModifiers) return;

      switch (normalizedKey) {
        case "k":
          event.preventDefault();
          openCommandPalette();
          break;
        case "t":
          event.preventDefault();
          toggleTerminalMode();
          break;
        case "/":
          event.preventDefault();
          openChatbot();
          break;
        case "h":
          event.preventDefault();
          toggleHackerTheme();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onCloseHelp, onOpenHelp]);
};
