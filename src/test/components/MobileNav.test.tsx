import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import type { HTMLAttributes, ReactNode } from "react";
import MobileNav from "../../components/layout/MobileNav";

vi.mock("framer-motion", async () => {
  const React = await import("react");

  const createMotionComponent = (tag: string) =>
    React.forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
      ({ children, ...props }, ref) =>
        React.createElement(tag, { ref, ...props }, children),
    );

  const motion = new Proxy(
    {},
    {
      get: (_target, prop) => {
        if (typeof prop !== "string") {
          return createMotionComponent("div");
        }
        return createMotionComponent(prop);
      },
    },
  );

  const AnimatePresence = ({ children }: { children: ReactNode }) => (
    <>{children}</>
  );

  return { motion, AnimatePresence };
});

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
];

const openMobileMenu = () => {
  window.dispatchEvent(
    new CustomEvent("toggle-mobile-menu", { detail: { isOpen: true } }),
  );
};

describe("MobileNav", () => {
  afterEach(() => {
    document.body.style.overflow = "";
    vi.clearAllMocks();
  });

  it("opens via custom event and highlights the active link", async () => {
    render(<MobileNav navLinks={navLinks} currentPath="/blog" />);

    expect(
      screen.queryByRole("navigation", { name: /mobile navigation/i }),
    ).not.toBeInTheDocument();

    openMobileMenu();

    const nav = await screen.findByRole("navigation", {
      name: /mobile navigation/i,
    });

    const activeLink = screen.getByRole("link", { name: /blog/i });
    expect(activeLink).toHaveAttribute("aria-current", "page");
    expect(nav).toBeInTheDocument();
  });

  it("supports keyboard navigation between links", async () => {
    render(<MobileNav navLinks={navLinks} currentPath="/" />);

    openMobileMenu();

    const nav = await screen.findByRole("navigation", {
      name: /mobile navigation/i,
    });

    const navLinkElements = Array.from(
      nav.querySelectorAll('a[href^="/"]'),
    ) as HTMLAnchorElement[];

    expect(navLinkElements.length).toBeGreaterThan(1);

    navLinkElements[0].focus();
    expect(navLinkElements[0]).toHaveFocus();

    fireEvent.keyDown(navLinkElements[0], { key: "ArrowDown" });

    await waitFor(() => {
      expect(navLinkElements[1]).toHaveFocus();
    });
  });

  it("moves focus to first and last link with Home/End", async () => {
    render(<MobileNav navLinks={navLinks} currentPath="/" />);

    openMobileMenu();

    const nav = await screen.findByRole("navigation", {
      name: /mobile navigation/i,
    });

    const navLinkElements = Array.from(
      nav.querySelectorAll('a[href^="/"]'),
    ) as HTMLAnchorElement[];

    navLinkElements[1].focus();
    expect(navLinkElements[1]).toHaveFocus();

    fireEvent.keyDown(navLinkElements[1], { key: "End" });

    await waitFor(() => {
      expect(navLinkElements[navLinkElements.length - 1]).toHaveFocus();
    });

    fireEvent.keyDown(navLinkElements[navLinkElements.length - 1], {
      key: "Home",
    });

    await waitFor(() => {
      expect(navLinkElements[0]).toHaveFocus();
    });
  });

  it("closes when clicking the overlay and restores scroll", async () => {
    const { container } = render(
      <MobileNav navLinks={navLinks} currentPath="/" />,
    );

    openMobileMenu();

    await waitFor(() => {
      expect(document.body.style.overflow).toBe("hidden");
    });

    const overlay = container.querySelector('div[aria-hidden="true"]');
    expect(overlay).not.toBeNull();

    if (overlay) {
      fireEvent.click(overlay);
    }

    await waitFor(() => {
      expect(
        screen.queryByRole("navigation", { name: /mobile navigation/i }),
      ).not.toBeInTheDocument();
    });

    expect(document.body.style.overflow).toBe("");
  });
});
