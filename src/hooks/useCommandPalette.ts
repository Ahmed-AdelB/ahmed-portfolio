import { useEffect } from "react";
import { useStore } from "@nanostores/react";
import {
  isCommandPaletteOpen,
  openCommandPalette,
  closeCommandPalette,
  toggleCommandPalette,
} from "../stores/commandPalette";

export function useCommandPalette() {
  const isOpen = useStore(isCommandPaletteOpen);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleCommandPalette();
      }
    };

    const onOpenSearch = () => {
      openCommandPalette();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("open-search", onOpenSearch);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("open-search", onOpenSearch);
    };
  }, []);

  return {
    isOpen,
    open: openCommandPalette,
    close: closeCommandPalette,
    toggle: toggleCommandPalette,
  };
}
