import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CommandPalette from "../../components/features/CommandPalette";

describe("CommandPalette", () => {
  beforeEach(() => {
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn(),
      removeItem: vi.fn(),
      length: 0,
      key: vi.fn(),
    };
    global.localStorage = localStorageMock as any;

    // Mock matchMedia
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    // Mock clipboard API
    Object.defineProperty(navigator, "clipboard", {
      writable: true,
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should not render initially (closed by default)", () => {
      render(<CommandPalette />);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should render when opened with Cmd+K", async () => {
      render(<CommandPalette />);

      // Press Cmd+K
      fireEvent.keyDown(window, { key: "k", metaKey: true });

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });
    });

    it("should render when opened with Ctrl+K", async () => {
      render(<CommandPalette />);

      // Press Ctrl+K
      fireEvent.keyDown(window, { key: "k", ctrlKey: true });

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });
    });

    it("should display search input when open", async () => {
      render(<CommandPalette />);

      fireEvent.keyDown(window, { key: "k", metaKey: true });

      await waitFor(() => {
        expect(screen.getByLabelText(/search commands/i)).toBeInTheDocument();
      });
    });

    it("should display all command categories when open with no query", async () => {
      render(<CommandPalette />);

      fireEvent.keyDown(window, { key: "k", metaKey: true });

      await waitFor(() => {
        expect(screen.getByText("Pages")).toBeInTheDocument();
        expect(screen.getByText("Actions")).toBeInTheDocument();
        expect(screen.getByText("Theme")).toBeInTheDocument();
      });
    });
  });

  describe("Keyboard Shortcuts", () => {
    it("should toggle on Cmd+K press", async () => {
      render(<CommandPalette />);

      // Open
      fireEvent.keyDown(window, { key: "k", metaKey: true });
      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      // Close
      fireEvent.keyDown(window, { key: "k", metaKey: true });
      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
    });

    it("should close on ESC press", async () => {
      render(<CommandPalette />);

      // Open
      fireEvent.keyDown(window, { key: "k", metaKey: true });
      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      // Close with ESC
      const input = screen.getByLabelText(/search commands/i);
      fireEvent.keyDown(input, { key: "Escape" });

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
    });

    it("should prevent default behavior for Cmd+K", () => {
      render(<CommandPalette />);

      const event = new KeyboardEvent("keydown", {
        key: "k",
        metaKey: true,
        bubbles: true,
        cancelable: true,
      });
      const preventDefaultSpy = vi.spyOn(event, "preventDefault");

      window.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe("Search Functionality", () => {
    it("should filter commands based on search query", async () => {
      render(<CommandPalette />);

      // Open palette
      fireEvent.keyDown(window, { key: "k", metaKey: true });

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      // Type search query
      const input = screen.getByLabelText(/search commands/i);
      await userEvent.type(input, "home");

      // Should show Home command
      expect(screen.getByText("Home")).toBeInTheDocument();

      // Should not show unrelated commands (they should be filtered out)
      // Note: This depends on exact implementation of fuzzy matching
    });

    it('should show "no results" message for non-matching query', async () => {
      render(<CommandPalette />);

      fireEvent.keyDown(window, { key: "k", metaKey: true });

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      const input = screen.getByLabelText(/search commands/i);
      await userEvent.type(input, "xyznonexistent");

      await waitFor(() => {
        expect(screen.getByText(/no results found/i)).toBeInTheDocument();
      });
    });

    it("should perform fuzzy search on command labels", async () => {
      render(<CommandPalette />);

      fireEvent.keyDown(window, { key: "k", metaKey: true });

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      const input = screen.getByLabelText(/search commands/i);
      await userEvent.type(input, "proj");

      // Should match "Projects" with fuzzy search
      expect(screen.getByText("Projects")).toBeInTheDocument();
    });

    it("should clear search when closing and reopening", async () => {
      render(<CommandPalette />);

      // Open and search
      fireEvent.keyDown(window, { key: "k", metaKey: true });
      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      const input = screen.getByLabelText(/search commands/i);
      await userEvent.type(input, "test query");
      expect(input).toHaveValue("test query");

      // Close
      fireEvent.keyDown(input, { key: "Escape" });
      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });

      // Reopen and check that search is cleared
      fireEvent.keyDown(window, { key: "k", metaKey: true });
      await waitFor(() => {
        const newInput = screen.getByLabelText(/search commands/i);
        expect(newInput).toHaveValue("");
      });
    });
  });

  describe("Keyboard Navigation", () => {
    it("should navigate down with ArrowDown", async () => {
      render(<CommandPalette />);

      fireEvent.keyDown(window, { key: "k", metaKey: true });

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      const input = screen.getByLabelText(/search commands/i);

      // First item should be selected by default (index 0)
      const firstOption = screen.getAllByRole("option")[0];
      expect(firstOption).toHaveAttribute("aria-selected", "true");

      // Press ArrowDown
      fireEvent.keyDown(input, { key: "ArrowDown" });

      // Second item should now be selected
      await waitFor(() => {
        const secondOption = screen.getAllByRole("option")[1];
        expect(secondOption).toHaveAttribute("aria-selected", "true");
      });
    });

    it("should navigate up with ArrowUp", async () => {
      render(<CommandPalette />);

      fireEvent.keyDown(window, { key: "k", metaKey: true });

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      const input = screen.getByLabelText(/search commands/i);

      // Press ArrowDown to go to second item
      fireEvent.keyDown(input, { key: "ArrowDown" });

      await waitFor(() => {
        const secondOption = screen.getAllByRole("option")[1];
        expect(secondOption).toHaveAttribute("aria-selected", "true");
      });

      // Press ArrowUp to go back to first item
      fireEvent.keyDown(input, { key: "ArrowUp" });

      await waitFor(() => {
        const firstOption = screen.getAllByRole("option")[0];
        expect(firstOption).toHaveAttribute("aria-selected", "true");
      });
    });

    it("should wrap around when navigating past the last item", async () => {
      render(<CommandPalette />);

      fireEvent.keyDown(window, { key: "k", metaKey: true });

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      const input = screen.getByLabelText(/search commands/i);
      const options = screen.getAllByRole("option");

      // Navigate to last item
      for (let i = 0; i < options.length; i++) {
        fireEvent.keyDown(input, { key: "ArrowDown" });
      }

      // Should wrap back to first item
      await waitFor(() => {
        const firstOption = screen.getAllByRole("option")[0];
        expect(firstOption).toHaveAttribute("aria-selected", "true");
      });
    });
  });

  describe("Action Execution", () => {
    it("should execute action on Enter key", async () => {
      // Mock window.location.href
      delete (window as any).location;
      (window as any).location = { href: "" };

      render(<CommandPalette />);

      fireEvent.keyDown(window, { key: "k", metaKey: true });

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      const input = screen.getByLabelText(/search commands/i);

      // Press Enter (should execute first command - Home)
      fireEvent.keyDown(input, { key: "Enter" });

      await waitFor(() => {
        expect(window.location.href).toBe("/");
      });
    });

    it("should execute action on click", async () => {
      delete (window as any).location;
      (window as any).location = { href: "" };

      render(<CommandPalette />);

      fireEvent.keyDown(window, { key: "k", metaKey: true });

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      // Click on "About" command
      const aboutButton = screen.getByText("About").closest("button");
      if (aboutButton) {
        fireEvent.click(aboutButton);
      }

      await waitFor(() => {
        expect(window.location.href).toBe("/about");
      });
    });

    it("should close palette after executing action", async () => {
      delete (window as any).location;
      (window as any).location = { href: "" };

      render(<CommandPalette />);

      fireEvent.keyDown(window, { key: "k", metaKey: true });

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      const input = screen.getByLabelText(/search commands/i);
      fireEvent.keyDown(input, { key: "Enter" });

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes", async () => {
      render(<CommandPalette />);

      fireEvent.keyDown(window, { key: "k", metaKey: true });

      await waitFor(() => {
        const dialog = screen.getByRole("dialog");
        expect(dialog).toHaveAttribute("aria-modal", "true");
        expect(dialog).toHaveAttribute("aria-label", "Command palette");
      });
    });

    it("should focus input when opening", async () => {
      render(<CommandPalette />);

      fireEvent.keyDown(window, { key: "k", metaKey: true });

      await waitFor(() => {
        const input = screen.getByLabelText(/search commands/i);
        expect(input).toHaveFocus();
      });
    });

    it("should lock body scroll when open", async () => {
      render(<CommandPalette />);

      expect(document.body.style.overflow).toBe("");

      fireEvent.keyDown(window, { key: "k", metaKey: true });

      await waitFor(() => {
        expect(document.body.style.overflow).toBe("hidden");
      });
    });

    it("should restore body scroll when closed", async () => {
      render(<CommandPalette />);

      fireEvent.keyDown(window, { key: "k", metaKey: true });

      await waitFor(() => {
        expect(document.body.style.overflow).toBe("hidden");
      });

      const input = screen.getByLabelText(/search commands/i);
      fireEvent.keyDown(input, { key: "Escape" });

      await waitFor(() => {
        expect(document.body.style.overflow).toBe("");
      });
    });
  });

  describe("Theme Actions", () => {
    it("should toggle theme to dark mode", async () => {
      render(<CommandPalette />);

      fireEvent.keyDown(window, { key: "k", metaKey: true });

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      // Search for dark mode
      const input = screen.getByLabelText(/search commands/i);
      await userEvent.type(input, "dark");

      // Click Dark Mode option
      const darkModeButton = screen.getByText("Dark Mode").closest("button");
      if (darkModeButton) {
        fireEvent.click(darkModeButton);
      }

      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith("theme", "dark");
      });
    });
  });

  describe("Email Copy Action", () => {
    it("should copy email to clipboard", async () => {
      render(<CommandPalette />);

      fireEvent.keyDown(window, { key: "k", metaKey: true });

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      // Search for copy email
      const input = screen.getByLabelText(/search commands/i);
      await userEvent.type(input, "copy email");

      // Click Copy Email option
      const copyEmailButton = screen.getByText("Copy Email").closest("button");
      if (copyEmailButton) {
        fireEvent.click(copyEmailButton);
      }

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
          "contact@ahmedalderai.com",
        );
      });
    });
  });
});
