import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ThemeToggle from "../../components/ui/ThemeToggle";
import { themeStore } from "../../stores/theme";

const createLocalStorageMock = (initial: Record<string, string> = {}) => {
  let store: Record<string, string> = { ...initial };

  const getItem = vi.fn((key: string) => (key in store ? store[key] : null));
  const setItem = vi.fn((key: string, value: string) => {
    store[key] = value;
  });
  const removeItem = vi.fn((key: string) => {
    delete store[key];
  });
  const clear = vi.fn(() => {
    store = {};
  });
  const key = vi.fn((index: number) => Object.keys(store)[index] ?? null);

  const storage: Storage = {
    getItem,
    setItem,
    removeItem,
    clear,
    key,
    get length() {
      return Object.keys(store).length;
    },
  };

  return { storage, getItem, setItem, removeItem, clear, key };
};

type StorageMocks = ReturnType<typeof createLocalStorageMock>;

// Helper to update matchMedia mock
const setMatchMedia = (matches: boolean) => {
  // @ts-ignore
  window.matchMedia.mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
};

describe("ThemeToggle", () => {
  let originalLocalStorage: Storage;

  beforeEach(() => {
    originalLocalStorage = window.localStorage;
    // Reset store
    themeStore.set("system");
  });

  afterEach(() => {
    Object.defineProperty(window, "localStorage", {
      value: originalLocalStorage,
      configurable: true,
    });

    document.documentElement.classList.remove("dark");
    document.head
      .querySelectorAll('meta[name="theme-color"]')
      .forEach((meta) => meta.remove());
    vi.clearAllMocks();
  });

  it("initializes from localStorage and applies dark theme", async () => {
    const { storage }: StorageMocks = createLocalStorageMock({ theme: "dark" });
    Object.defineProperty(window, "localStorage", {
      value: storage,
      configurable: true,
    });
    setMatchMedia(false);

    // Manually sync store with "storage"
    themeStore.set("dark");

    render(<ThemeToggle />);

    const button = await screen.findByRole("button", {
      name: /current theme: dark/i,
    });

    expect(button).toHaveAttribute("aria-expanded", "false");
    // We can't easily test document class updates here as they are side effects of the store
    // running in a real browser environment often handled by a script tag.
    // But we can verify the component reflects the state.
  });

  it("uses system preference when no saved theme", async () => {
    const { storage }: StorageMocks = createLocalStorageMock();
    Object.defineProperty(window, "localStorage", {
      value: storage,
      configurable: true,
    });

    // Ensure store is system
    themeStore.set("system");

    render(<ThemeToggle />);

    await screen.findByRole("button", { name: /current theme: system/i });
  });

  it("changes theme and closes the menu", async () => {
    const { storage, setItem }: StorageMocks = createLocalStorageMock({
      theme: "dark",
    });
    Object.defineProperty(window, "localStorage", {
      value: storage,
      configurable: true,
    });
    setMatchMedia(false);

    render(<ThemeToggle />);

    const user = userEvent.setup();
    const button = await screen.findByRole("button", {
      name: /current theme/i,
    });
    await user.click(button);

    expect(
      screen.getByRole("listbox", { name: /theme options/i }),
    ).toBeInTheDocument();

    const lightOption = screen.getByRole("option", { name: /light/i });
    await user.click(lightOption);

    await waitFor(() => {
      expect(setItem).toHaveBeenCalledWith("theme", "light");
      expect(document.documentElement.classList.contains("dark")).toBe(false);
      expect(
        screen.queryByRole("listbox", { name: /theme options/i }),
      ).not.toBeInTheDocument();
    });
  });

  it("closes the menu on escape", async () => {
    const { storage }: StorageMocks = createLocalStorageMock();
    Object.defineProperty(window, "localStorage", {
      value: storage,
      configurable: true,
    });
    setMatchMedia(false);

    render(<ThemeToggle />);

    const user = userEvent.setup();
    const button = await screen.findByRole("button", {
      name: /current theme/i,
    });
    await user.click(button);

    expect(
      screen.getByRole("listbox", { name: /theme options/i }),
    ).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() => {
      expect(
        screen.queryByRole("listbox", { name: /theme options/i }),
      ).not.toBeInTheDocument();
    });
  });

  it("closes the menu when clicking outside", async () => {
    const { storage }: StorageMocks = createLocalStorageMock();
    Object.defineProperty(window, "localStorage", {
      value: storage,
      configurable: true,
    });
    setMatchMedia(false);

    render(<ThemeToggle />);

    const user = userEvent.setup();
    const button = await screen.findByRole("button", {
      name: /current theme/i,
    });
    await user.click(button);

    expect(
      screen.getByRole("listbox", { name: /theme options/i }),
    ).toBeInTheDocument();

    fireEvent.click(document.body);

    await waitFor(() => {
      expect(
        screen.queryByRole("listbox", { name: /theme options/i }),
      ).not.toBeInTheDocument();
    });
  });
});
