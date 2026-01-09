import { atom } from "nanostores";

export type Theme = "light" | "dark" | "system" | "hacker";

const getInitialTheme = (): Theme => {
  if (typeof localStorage !== "undefined" && localStorage.getItem("theme")) {
    return localStorage.getItem("theme") as Theme;
  }
  return "system";
};

export const themeStore = atom<Theme>(getInitialTheme());

export const toggleTheme = () => {
  const current = themeStore.get();
  // Cycle: light -> dark -> system -> light (or just light/dark for simple toggle)
  // If hacker, switch to system or default
  if (current === "hacker") {
    setTheme("system");
    return;
  }
  const next = current === "light" ? "dark" : "light";
  setTheme(next);
};

export const setTheme = (theme: Theme) => {
  themeStore.set(theme);
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("theme", theme);

    let effectiveTheme = theme;

    if (theme === "system") {
      effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }

    const isDark = effectiveTheme === "dark" || theme === "hacker";

    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.classList.toggle("hacker", theme === "hacker");

    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
  }
};

// Initialize listener
if (typeof window !== "undefined") {
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      if (themeStore.get() === "system") {
        const newTheme = e.matches ? "dark" : "light";
        document.documentElement.classList.toggle("dark", e.matches);
        document.documentElement.style.colorScheme = newTheme;
      }
    });
}
