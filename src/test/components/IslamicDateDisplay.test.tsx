import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { IslamicDateDisplay } from "../../components/ui/IslamicDateDisplay";

describe("IslamicDateDisplay", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Set a fixed date for consistent testing
    vi.useFakeTimers();
    const date = new Date(2023, 3, 22); // April 22, 2023 (Should be around Shawwal 2, 1444)
    vi.setSystemTime(date);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("is hidden by default (localStorage empty)", () => {
    render(<IslamicDateDisplay />);
    const span = screen.getByTitle("Hijri Date");
    expect(span).toHaveClass("hidden");
  });

  it("is hidden if localStorage 'show-hijri-date' is false", () => {
    localStorage.setItem("show-hijri-date", "false");
    render(<IslamicDateDisplay />);
    const span = screen.getByTitle("Hijri Date");
    expect(span).toHaveClass("hidden");
  });

  it("is visible if localStorage 'show-hijri-date' is true", () => {
    localStorage.setItem("show-hijri-date", "true");
    render(<IslamicDateDisplay />);
    const span = screen.getByTitle("Hijri Date");
    expect(span).not.toHaveClass("hidden");
    // We expect some content. The exact string depends on the Intl implementation environment
    // but we can check it's not empty.
    expect(span.textContent).not.toBe("");
  });

  it("renders with Arabic locale when lang='ar'", () => {
    localStorage.setItem("show-hijri-date", "true");
    render(<IslamicDateDisplay lang="ar" />);
    const span = screen.getByTitle("Hijri Date");
    expect(span).not.toHaveClass("hidden");
    // Basic check for Arabic characters (if environment supports it)
    // Or just check that it renders without error
  });
});
