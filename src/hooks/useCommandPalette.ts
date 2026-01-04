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
    const onOpenSearch = () => {
      openCommandPalette();
    };

    window.addEventListener("open-search", onOpenSearch);

    return () => {
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
